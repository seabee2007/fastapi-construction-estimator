// Handler for blueprint upload (as in Step 1)
document.getElementById("blueprintForm").addEventListener("submit", async function(e) {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);
  
  try {
    const response = await fetch("/upload-blueprint", {
      method: "POST",
      body: formData,
    });
    const result = await response.json();
    // Display the extracted blueprint data (for now, dummy data)
    document.getElementById("blueprintResult").innerText = JSON.stringify(result.extracted_data, null, 2);
    
    // Optionally, auto-fill the additional form with data from the blueprint
    if (result.extracted_data.floor_plans) {
      document.getElementById("number_of_floors").value = result.extracted_data.floor_plans.number_of_floors;
      document.getElementById("total_floor_area_sqft").value = result.extracted_data.floor_plans.total_floor_area_sqft;
    }
    if (result.extracted_data.roof_plans) {
      document.getElementById("roof_area_sqft").value = result.extracted_data.roof_plans.roof_area_sqft;
    }
  } catch (error) {
    console.error("Error uploading blueprint:", error);
    document.getElementById("blueprintResult").innerText = "Error processing blueprint.";
  }
});

// Handler for final estimate submission
document.getElementById("estimateForm").addEventListener("submit", async function(e) {
  e.preventDefault();
  
  // Gather data from the form fields
  const finalData = {
    project_name: document.getElementById("project_name").value,
    project_type: document.getElementById("project_type").value,
    condition_multiplier: parseFloat(document.getElementById("condition_multiplier").value),
    blueprint_data: {
      number_of_floors: parseInt(document.getElementById("number_of_floors").value, 10),
      total_floor_area_sqft: parseFloat(document.getElementById("total_floor_area_sqft").value),
      roof_area_sqft: parseFloat(document.getElementById("roof_area_sqft").value)
    }
  };
  
  try {
    const response = await fetch("/final-estimate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(finalData)
    });
    
    const result = await response.json();
    document.getElementById("estimateResult").innerText = JSON.stringify(result, null, 2);
  } catch (error) {
    console.error("Error getting final estimate:", error);
    document.getElementById("estimateResult").innerText = "Error processing final estimate.";
  }
});
