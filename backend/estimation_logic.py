import os
import json
from schemas import FinalEstimationInput

def load_ntrp_data():
    """
    Load the NTRP data from ntrp_data.json located in the project root.
    This JSON file should contain keys:
      - "activities": List of activity objects.
      - "work_elements": List of work element objects with at least keys: code, description, uom, man_hours_per_unit, multiplier.
      - "laborResources": List of labor resource objects with keys: role, hourlyRate.
      - "equipment": List of equipment objects with keys: name, hourlyRate.
    """
    DATA_FILE = os.path.join(os.getcwd(), "ntrp_data.json")
    try:
        with open(DATA_FILE, "r") as f:
            return json.load(f)
    except Exception as e:
        print("Error loading NTRP data:", e)
        return {}

# Load the data once and cache it
ntrp_data = load_ntrp_data()

def calculate_estimate(input_data: FinalEstimationInput) -> dict:
    """
    Calculate the final estimate using NTRP guidelines.
    
    Formulas:
      - Labor Cost: For each labor row, cost = quantity * hourlyRate.
      - Material Cost: For each work element, cost = (man_hours_per_unit * cost_factor) * quantity.
          * The cost_factor here converts man-hours into dollars.
      - Equipment Cost: For each equipment row, cost = quantity * hourlyRate.
    
    Note: The cost_factor and default hourly rates are examples.
    Adjust these values as needed to match the NTRP manual.
    """
    # Calculate Labor Cost
    labor_cost = 0.0
    for lr in input_data.labor_resources:
        # Look up hourly rate from NTRP data (laborResources list)
        rate = next((item["hourlyRate"] for item in ntrp_data.get("laborResources", [])
                     if item["role"] == lr.skill), None)
        if rate is None:
            rate = 20  # Default hourly rate if not found
        labor_cost += rate * lr.quantity

    # Calculate Material Cost using work elements
    material_cost = 0.0
    # The cost_factor converts man-hours into dollars; adjust as necessary.
    cost_factor = 100  
    for we in input_data.work_elements:
        element = next((item for item in ntrp_data.get("work_elements", [])
                        if item["code"] == we.code), None)
        if element:
            man_hours = element.get("man_hours_per_unit", 0)
            material_cost += (man_hours * cost_factor) * we.quantity

    # Calculate Equipment Cost
    equipment_cost = 0.0
    for eq in input_data.equipment:
        rate = next((item["hourlyRate"] for item in ntrp_data.get("equipment", [])
                     if item["name"] == eq.name), None)
        if rate is None:
            rate = 50  # Default hourly rate for equipment if not found
        equipment_cost += rate * eq.quantity

    total_estimated_cost = labor_cost + material_cost + equipment_cost

    return {
        "total_labor_cost": labor_cost,
        "total_material_cost": material_cost,
        "total_equipment_cost": equipment_cost,
        "total_estimated_cost": total_estimated_cost
    }
