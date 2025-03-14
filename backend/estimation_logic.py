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
    quantity = area_sqft * 0.1

    # Lookup the productivity rate for the selected material and task.
    rate = PRODUCTIVITY_RATES.get(material_type, {}).get("placement", 0)
    
    # Calculate man-hours and man-days
    man_hours = rate * quantity
    man_days = man_hours / 8  # assuming 8 hours per day

    # Calculate costs
    labor_cost = man_hours * LABOR_HOUR_COST
    material_cost = quantity * MATERIAL_UNIT_COST.get(material_type, 0)
    total_cost = labor_cost + material_cost

    return {
        "material_quantity": quantity,
        "man_hours": man_hours,
        "man_days": man_days,
        "labor_cost": labor_cost,
        "material_cost": material_cost,
        "total_estimated_cost": total_cost,
    }

