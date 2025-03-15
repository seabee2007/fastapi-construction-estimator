import os
import shutil
import uuid

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.staticfiles import StaticFiles

# Import your modules and schemas
from backend.schemas import FinalEstimationInput, FinalEstimationOutput
from backend.estimation_logic import calculate_final_estimate
from backend.blueprint_processor import process_blueprint, cleanup_file

# Create a single FastAPI instance
app = FastAPI()

# Use an absolute path for static files (adjust if needed)
static_dir = os.path.join(os.getcwd(), "frontend")
app.mount("/static", StaticFiles(directory=static_dir, html=True), name="static")

# If you want to serve the static index at the root, you can add a route like:
@app.get("/", response_class=FileResponse)
async def serve_index():
    index_path = os.path.join(static_dir, "index.html")
    return index_path

# Endpoint for final estimate
@app.post("/final-estimate", response_model=FinalEstimationOutput)
async def final_estimate(input: FinalEstimationInput):
    try:
        result = calculate_final_estimate(
            project_type=input.project_type,
            blueprint_data=input.blueprint_data.dict(),
            condition_multiplier=input.condition_multiplier
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    output = {"project": input.project_name, **result}
    return output

# Endpoint for blueprint upload
@app.post("/upload-blueprint")
async def upload_blueprint(file: UploadFile = File(...)):
    print("Received file upload request.")
    
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are allowed.")
    
    temp_filename = f"temp_{uuid.uuid4()}.pdf"
    temp_filepath = os.path.join("backend", temp_filename)
    print(f"Saving file to: {temp_filepath}")
    
    try:
        with open(temp_filepath, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        print("File saved successfully.")
        
        extracted_data = process_blueprint(temp_filepath)
        print("Blueprint processed:", extracted_data)
    except Exception as e:
        print("Exception during processing:", e)
        cleanup_file(temp_filepath)
        raise HTTPException(status_code=500, detail=f"Error processing file: {e}")
    
    cleanup_file(temp_filepath)
    print("Temporary file cleaned up.")
    
    return {"extracted_data": extracted_data, "message": "Blueprint processed successfully."}
