from fastapi import FastAPI
from backend.schemas import EstimationInput, EstimationOutput
from backend.estimation_logic import calculate_estimate

app = FastAPI()

@app.get("/")
async def read_root():
    return {"message": "Welcome to the Construction Estimator API!"}

@app.post("/estimate", response_model=EstimationOutput)
async def estimate_project(input: EstimationInput):
    result = calculate_estimate(input.area_sqft, input.material_type)
    output = {"project": input.project_name, **result}
    return output
