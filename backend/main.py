from fastapi import FastAPI
from backend.schemas import EstimationInput, EstimationOutput
from backend.estimation_logic import calculate_estimate

app = FastAPI()

@app.get("/")
async def read_root():
    return {"message": "Welcome to the Construction Estimator API!"}

@app.post("/estimate", response_model=EstimationOutput)
async def estimate_project(input: EstimationInput):
    # Use the estimation logic to calculate the estimate
    result = calculate_estimate(input.area_sqft, input.material_type)
    
    # Prepare the output data, including the project name from input
    output = {
        "project": input.project_name,
        **result  # Unpack the calculated fields
    }
    return output
