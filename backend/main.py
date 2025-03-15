import os
import json
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

app = FastAPI()

# Set repository root (assumed to be os.getcwd())
root_dir = os.getcwd()

# Mount static directories for CSS and JS from the repository root.
app.mount("/css", StaticFiles(directory=os.path.join(root_dir, "css")), name="css")
app.mount("/js", StaticFiles(directory=os.path.join(root_dir, "js")), name="js")

# Serve the index.html file from the repository root.
@app.get("/", response_class=HTMLResponse)
async def read_index():
    index_path = os.path.join(root_dir, "index.html")
    print("Working Directory:", root_dir)
    print("Index Path:", index_path)
    try:
        with open(index_path, "r", encoding="utf-8") as f:
            content = f.read()
        return HTMLResponse(content=content, status_code=200)
    except Exception as e:
        print("Error reading index.html:", e)
        raise HTTPException(status_code=404, detail="Index file not found")

# Load NTRP data from the JSON file in the repository root.
DATA_FILE = os.path.join(root_dir, "ntrp_data.json")
try:
    with open(DATA_FILE, "r") as f:
        ntrp_data = json.load(f)
except Exception as e:
    ntrp_data = {}
    print("Error loading NTRP data:", e)

# ---------------------------
# Pydantic Models (Schemas)
# ---------------------------
class LaborRow(BaseModel):
    skill: str = Field(..., example="Builder (Carpenter)")
    quantity: float = Field(..., gt=0, example=2)

class WorkElementRow(BaseModel):
    code: str = Field(..., example="1302")
    description: str = Field(..., example="EXCAVATE USING, TRACTOR MTD. BACKHOE")
    quantity: float = Field(..., gt=0, example=4)

class EquipmentRow(BaseModel):
    name: str = Field(..., example="EXCAVATOR")
    quantity: float = Field(..., gt=0, example=1)

class FinalEstimationInput(BaseModel):
    project_name: str = Field(..., example="Project PH5-800")
    project_date: str = Field(..., example="2025-03-15")
    activity_code: str = Field(..., example="02200")
    description_of_work: str = Field(..., example="Excavate for footers")
    method_of_construction: str = Field(..., example="Standard excavation using machinery.")
    labor_resources: List[LaborRow]
    work_elements: List[WorkElementRow]
    equipment: List[EquipmentRow]

class FinalEstimationOutput(BaseModel):
    project: str
    total_labor_cost: float
    total_material_cost: float
    total_equipment_cost: float
    total_estimated_cost: float

# ---------------------------
# API Endpoints to Supply NTRP Data
# ---------------------------
@app.get("/activities")
async def get_activities():
    activities = ntrp_data.get("activities", [])
    if not activities:
        raise HTTPException(status_code=404, detail="No activities found.")
    return activities

@app.get("/work-elements")
async def get_work_elements(query: Optional[str] = None):
    work_elements = ntrp_data.get("work_elements", [])
    if query:
        filtered = [we for we in work_elements if query.lower() in we["description"].lower()]
        return filtered
    return work_elements

@app.get("/labor-resources")
async def get_labor_resources():
    labor_resources = ntrp_data.get("laborResources", [])
    if not labor_resources:
        raise HTTPException(status_code=404, detail="No labor resources found.")
    return labor_resources

@app.get("/equipment")
async def get_equipment():
    equipment = ntrp_data.get("equipment", [])
    if not equipment:
        raise HTTPException(status_code=404, detail="No equipment found.")
    return equipment

# ---------------------------
# Estimation Calculation Logic
# ---------------------------
def calculate_estimate(input_data: FinalEstimationInput) -> dict:
    # Calculate labor cost.
    labor_cost = 0
    for lr in input_data.labor_resources:
        rate = next((item["hourlyRate"] for item in ntrp_data.get("laborResources", [])
                     if item["role"] == lr.skill), None)
        if rate is None:
            rate = 20
        labor_cost += rate * lr.quantity

    # Calculate material cost from work elements.
    material_cost = 0
    cost_factor = 100  # Example factor converting man-hours to dollars.
    for we in input_data.work_elements:
        element = next((item for item in ntrp_data.get("work_elements", [])
                        if item["code"] == we.code), None)
        if element:
            material_cost += (element.get("man_hours_per_unit", 0) * cost_factor) * we.quantity

    # Calculate equipment cost.
    equipment_cost = 0
    for eq in input_data.equipment:
        rate = next((item["hourlyRate"] for item in ntrp_data.get("equipment", [])
                     if item["name"] == eq.name), None)
        if rate is None:
            rate = 50
        equipment_cost += rate * eq.quantity

    total_cost = labor_cost + material_cost + equipment_cost
    return {
        "total_labor_cost": labor_cost,
        "total_material_cost": material_cost,
        "total_equipment_cost": equipment_cost,
        "total_estimated_cost": total_cost
    }

# ---------------------------
# Final Estimate Endpoint
# ---------------------------
@app.post("/final-estimate", response_model=FinalEstimationOutput)
async def final_estimate(input_data: FinalEstimationInput):
    try:
        result = calculate_estimate(input_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return {"project": input_data.project_name, **result}

# ---------------------------
# Run the Application
# ---------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
