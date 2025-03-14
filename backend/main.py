from fastapi import FastAPI, UploadFile, File, HTTPException
import shutil
import uuid
import os
from fastapi import FastAPI, HTTPException
from backend.schemas import FinalEstimationInput, FinalEstimationOutput
from backend.estimation_logic import calculate_final_estimate

# Import the blueprint processing function
from backend.blueprint_processor import process_blueprint, cleanup_file

app = FastAPI()

@app.get("/")
async def read_root():
    return {"message": "Welcome to the Construction Estimator API!"}
    
@app.post("/final-estimate", response_model=FinalEstimationOutput)
async def final_estimate(input: FinalEstimationInput):
    try:
        # Calculate the final estimate using the provided blueprint data and inputs
        result = calculate_final_estimate(
            project_type=input.project_type,
            blueprint_data=input.blueprint_data.dict(),
            condition_multiplier=input.condition_multiplier
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    # Prepare and return the output, including the project name
    output = {"project": input.project_name, **result}
    return output

@app.post("/upload-blueprint")
async def upload_blueprint(file: UploadFile = File(...)):
    # Ensure the uploaded file is a PDF
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are allowed.")

    # Create a unique filename and save the file to a temporary location
    temp_filename = f"temp_{uuid.uuid4()}.pdf"
    temp_filepath = os.path.join("backend", temp_filename)
    
    with open(temp_filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    try:
        # Process the blueprint file to extract key details
        extracted_data = process_blueprint(temp_filepath)
    except Exception as e:
        # Clean up the file on error as well
        cleanup_file(temp_filepath)
        raise HTTPException(status_code=500, detail=f"Error processing file: {e}")
    
    # Clean up the temporary file after processing
    cleanup_file(temp_filepath)
    
    # Return the extracted blueprint data
    return {"extracted_data": extracted_data, "message": "Blueprint processed successfully."}
