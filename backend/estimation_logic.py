# Hard-coded reference data based on NTRP standards
# (Replace these numbers with the actual rates you reference from NTRP)
PRODUCTIVITY_RATES = {
    "Concrete": {
        "placement": 0.480  # man-hours per cubic yard for concrete placement
    }
}
LABOR_HOUR_COST = 50.0  # example: $50 per man-hour labor cost
MATERIAL_UNIT_COST = {
    "Concrete": 100.0  # example: $100 per cubic yard of concrete
}

def calculate_estimate(area_sqft: float, material_type: str):
    """
    Calculate an estimate based on area and material type.
    This is a simplified example:
      - Converts area (sqft) to a material quantity (cubic yards).
      - Uses a productivity rate to compute man-hours.
      - Converts man-hours to man-days (assumes 8 hours per day).
      - Calculates labor cost and material cost.
    """
    # For demonstration, assume a conversion factor: 
    # 0.1 cubic yards of material per sqft of area.
   # (Keep your existing reference data; update the values as needed based on NTRP)
PRODUCTIVITY_RATES = {
    "Concrete": {
        "placement": 0.480  # man-hours per cubic yard for concrete placement
    }
}
LABOR_HOUR_COST = 50.0  # example cost per man-hour
MATERIAL_UNIT_COST = {
    "Concrete": 100.0  # example cost per cubic yard
}

def calculate_final_estimate(project_type: str, blueprint_data: dict, condition_multiplier: float = 1.0) -> dict:
    """
    Calculate a detailed construction estimate based on:
      - blueprint extracted data,
      - project type (affecting cost assumptions),
      - and a condition multiplier to adjust labor productivity.
    
    For demonstration:
      - We assume that the total floor area (in sqft) converts to material quantity (in cubic yards)
        using a simple conversion (e.g., 0.1 cubic yards per sqft).
      - Then, we apply a productivity rate (from NTRP) and adjust using the condition multiplier.
    """
    # Extract values from blueprint_data
    floor_area = blueprint_data.get("total_floor_area_sqft", 0)
    
    # Calculate material quantity (dummy conversion factor: 0.1 cubic yards per sqft)
    quantity = floor_area * 0.1

    # Get the productivity rate for Concrete placement
    rate = PRODUCTIVITY_RATES.get("Concrete", {}).get("placement", 0)
    
    # Calculate labor estimates using the condition multiplier
    man_hours = rate * quantity * condition_multiplier
    man_days = man_hours / 8  # Convert hours to days (8 hours per day)

    # Calculate costs
    labor_cost = man_hours * LABOR_HOUR_COST
    material_cost = quantity * MATERIAL_UNIT_COST.get("Concrete", 0)
    total_cost = labor_cost + material_cost

    return {
        "material_quantity": quantity,
        "man_hours": man_hours,
        "man_days": man_days,
        "labor_cost": labor_cost,
        "material_cost": material_cost,
        "total_estimated_cost": total_cost,
    }
