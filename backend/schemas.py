#!/usr/bin/env python3
from pydantic import BaseModel, Field
from typing import List

class LaborRow(BaseModel):
    """
    Represents a row for a labor resource.
    - skill: The labor role (e.g. "Builder (Carpenter)").
    - quantity: The number of man-hours or mandays (as determined by your input).
    """
    skill: str = Field(..., example="Builder (Carpenter)")
    quantity: float = Field(..., gt=0, example=2)

class WorkElementRow(BaseModel):
    """
    Represents a work element row.
    - code: The NTRP work element code (e.g., "1302").
    - description: A brief description of the work element.
    - quantity: The quantity of work (based on unit of measure).
    """
    code: str = Field(..., example="1302")
    description: str = Field(..., example="EXCAVATE USING, TRACTOR MTD. BACKHOE")
    quantity: float = Field(..., gt=0, example=4)

class EquipmentRow(BaseModel):
    """
    Represents an equipment row.
    - name: The name of the equipment (e.g., "EXCAVATOR").
    - quantity: The number of equipment hours used.
    """
    name: str = Field(..., example="EXCAVATOR")
    quantity: float = Field(..., gt=0, example=1)

class FinalEstimationInput(BaseModel):
    """
    Input data for generating a final construction estimate.
    
    Fields:
      - project_name: Project identification.
      - project_date: The date of the project.
      - activity_code: The selected activity number (from NTRP).
      - description_of_work: A free-text description of the work.
      - method_of_construction: Description of how the work will be performed.
      - labor_resources: A list of labor resource rows.
      - work_elements: A list of work element rows.
      - equipment: A list of equipment rows.
    """
    project_name: str = Field(..., example="Project PH5-800")
    project_date: str = Field(..., example="2025-03-15")
    activity_code: str = Field(..., example="02200")
    description_of_work: str = Field(..., example="Excavate for footers")
    method_of_construction: str = Field(..., example="Standard excavation using machinery.")
    labor_resources: List[LaborRow]
    work_elements: List[WorkElementRow]
    equipment: List[EquipmentRow]

class FinalEstimationOutput(BaseModel):
    """
    Output data from the final estimation calculation.
    
    Contains totals for labor, material, equipment, and the overall estimated cost.
    """
    project: str
    total_labor_cost: float
    total_material_cost: float
    total_equipment_cost: float
    total_estimated_cost: float

# ---------------------------
# Test/Demonstration
# ---------------------------
if __name__ == '__main__':
    # Create an example input instance.
    example_input = FinalEstimationInput(
        project_name="Project PH5-800",
        project_date="2025-03-15",
        activity_code="02200",
        description_of_work="Excavate for footers",
        method_of_construction="Standard excavation using machinery.",
        labor_resources=[
            LaborRow(skill="Builder (Carpenter)", quantity=2)
        ],
        work_elements=[
            WorkElementRow(code="1302", description="EXCAVATE USING, TRACTOR MTD. BACKHOE", quantity=4)
        ],
        equipment=[
            EquipmentRow(name="EXCAVATOR", quantity=1)
        ]
    )
    print("Example Input JSON:")
    print(example_input.json(indent=2))
    
    # Create an example output instance.
    example_output = FinalEstimationOutput(
        project="Project PH5-800",
        total_labor_cost=1000.0,
        total_material_cost=2000.0,
        total_equipment_cost=500.0,
        total_estimated_cost=3500.0
    )
    print("\nExample Output JSON:")
    print(example_output.json(indent=2))
