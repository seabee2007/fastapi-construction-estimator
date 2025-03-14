from pydantic import BaseModel, Field

class BlueprintData(BaseModel):
    number_of_floors: int = Field(..., example=2)
    total_floor_area_sqft: float = Field(..., gt=0, example=2500.0)
    roof_area_sqft: float = Field(..., gt=0, example=1500.0)
    # You can add additional fields for elevations, electrical, plumbing, etc.

class FinalEstimationInput(BaseModel):
    project_name: str = Field(..., example="Test Project")
    project_type: str = Field(..., example="residential")  # e.g., residential, commercial, industrial
    condition_multiplier: float = Field(1.0, description="Multiplier to adjust labor/productivity due to site conditions", example=1.0)
    blueprint_data: BlueprintData

class FinalEstimationOutput(BaseModel):
    project: str
    material_quantity: float
    man_hours: float
    man_days: float
    labor_cost: float
    material_cost: float
    total_estimated_cost: float
