from pydantic import BaseModel, Field

class EstimationInput(BaseModel):
    project_name: str = Field(..., example="Project A")
    area_sqft: float = Field(..., gt=0, example=1500.0)
    material_type: str = Field(..., example="Concrete")

class EstimationOutput(BaseModel):
    project: str
    material_quantity: float
    man_hours: float
    man_days: float
    labor_cost: float
    material_cost: float
    total_estimated_cost: float

