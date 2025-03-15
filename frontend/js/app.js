// On load, fetch activity numbers and populate the activity dropdown
window.addEventListener("load", async () => {
  try {
    const res = await fetch("/activities");
    const activities = await res.json();
    const select = document.getElementById("activity_code");
    activities.forEach(act => {
      const opt = document.createElement("option");
      opt.value = act.code;
      opt.textContent = `${act.code} - ${act.title}`;
      select.appendChild(opt);
    });
  } catch (error) {
    console.error("Error fetching activities:", error);
  }
});

// Function to add a dynamic Labor Resource row
function addLaborResource() {
  const container = document.getElementById("laborResourcesContainer");
  const row = document.createElement("div");
  row.className = "input-group mb-2";
  row.innerHTML = `
    <select name="labor_skill" class="form-select">
      <option value="Builder (Carpenter)">Builder (Carpenter)</option>
      <option value="Construction Electrician">Construction Electrician</option>
      <option value="Equipment Operator">Equipment Operator</option>
      <option value="Unskilled Laborer/Other">Unskilled Laborer/Other</option>
    </select>
    <input type="number" name="labor_quantity" class="form-control" placeholder="Quantity" step="0.1" min="0" required>
    <button type="button" class="btn btn-outline-danger" onclick="this.parentElement.remove()">Remove</button>
  `;
  container.appendChild(row);
}
window.addLaborResource = addLaborResource;

// Function to add a dynamic Work Element row
function addWorkElement() {
  const container = document.getElementById("workElementsContainer");
  const row = document.createElement("div");
  row.className = "input-group mb-2";
  row.innerHTML = `
    <input type="text" name="work_element_search" class="form-control" placeholder="Work element code" required>
    <input type="number" name="work_element_quantity" class="form-control" placeholder="Quantity" step="0.1" min="0" required>
    <button type="button" class="btn btn-outline-danger" onclick="this.parentElement.remove()">Remove</button>
  `;
  container.appendChild(row);
}
window.addWorkElement = addWorkElement;

// Function to add a dynamic Equipment row
function addEquipment() {
  const container = document.getElementById("equipmentContainer");
  const row = document.createElement("div");
  row.className = "input-group mb-2";
  row.innerHTML = `
    <input type="text" name="equipment_search" class="form-control" placeholder="Equipment name" required>
    <input type="number" name="equipment_quantity" class="form-control" placeholder="Quantity" step="0.1" min="0" required>
    <button type="button" class="btn btn-outline-danger" onclick="this.parentElement.remove()">Remove</button>
  `;
  container.appendChild(row);
}
window.addEquipment = addEquipment;

// Example search function for work elements; currently logs results
async function searchWorkElement(inputElem) {
  const query = inputElem.value;
  if (query.length < 2) return;
  try {
    const res = await fetch(`/work-elements?query=${encodeURIComponent(query)}`);
    const results = await res.json();
    console.log("Work element search results:", results);
    // Optionally, implement auto-suggestions here.
  } catch (error) {
    console.error("Error searching work elements:", error);
  }
}
window.searchWorkElement = searchWorkElement;

// Example search function for equipment; currently logs results
async function searchEquipment(inputElem) {
  const query = inputElem.value;
  if (query.length < 2) return;
  try {
    const res = await fetch(`/equipment?query=${encodeURIComponent(query)}`);
    const results = await res.json();
    console.log("Equipment search results:", results);
    // Optionally, implement auto-suggestions here.
  } catch (error) {
    console.error("Error searching equipment:", error);
  }
}
window.searchEquipment = searchEquipment;

// Handle form submission
document.getElementById("estimatorForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const form = e.target;
  const data = {
    project_name: form.project_name.value,
    project_date: form.project_date.value,
    activity_code: form.activity_code.value,
    description_of_work: form.description_of_work.value,
    method_of_construction: form.method_of_construction.value,
    labor_resources: [],
    work_elements: [],
    equipment: []
  };

  // Gather Labor Resources from dynamic rows
  const laborRows = document.querySelectorAll("#laborResourcesContainer .input-group");
  laborRows.forEach(row => {
    const skill = row.querySelector("select[name='labor_skill']").value;
    const quantity = parseFloat(row.querySelector("input[name='labor_quantity']").value);
    data.labor_resources.push({ skill, quantity });
  });

  // Gather Work Elements from dynamic rows
  const workRows = document.querySelectorAll("#workElementsContainer .input-group");
  workRows.forEach(row => {
    const code = row.querySelector("input[name='work_element_search']").value;
    const quantity = parseFloat(row.querySelector("input[name='work_element_quantity']").value);
    data.work_elements.push({ code, description: code, quantity });
  });

  // Gather Equipment from dynamic rows
  const equipRows = document.querySelectorAll("#equipmentContainer .input-group");
  equipRows.forEach(row => {
    const name = row.querySelector("input[name='equipment_search']").value;
    const quantity = parseFloat(row.querySelector("input[name='equipment_quantity']").value);
    data.equipment.push({ name, quantity });
  });

  console.log("Payload:", data);

  try {
    const res = await fetch("/final-estimate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    console.log("Final Estimate:", result);
    document.getElementById("result").innerText = JSON.stringify(result, null, 2);
  } catch (error) {
    console.error("Error getting final estimate:", error);
    document.getElementById("result").innerText = "Error getting final estimate.";
  }
});
