document.addEventListener("DOMContentLoaded", async function() {
  // Global active row variables for modals.
  let activeWorkElementRow = null;
  let activeEquipmentRow = null;

  // Parse query parameters.
  const urlParams = new URLSearchParams(window.location.search);
  const recordId = urlParams.get("id");
  console.log("Record ID from URL:", recordId);

  // If a record ID is provided, fetch the record.
  if (recordId) {
    try {
      const response = await fetch("/cass/" + recordId);
      console.log("Fetch response:", response);
      if (!response.ok) {
        console.error("Error: Response not OK. Status:", response.status);
        return;
      }
      const record = await response.json();
      console.log("Fetched record:", record);
      // Prepopulate your form fields.
      document.getElementById("project_number").value = record.project_number || "";
      document.getElementById("project_title").value = record.project_title || "";
      document.getElementById("activity_number").value = record.activity_number || "";
      document.getElementById("activity_title").value = record.activity_title || "";
      document.getElementById("description_of_work").value = record.description_of_work || "";
      document.getElementById("method_of_construction").value = record.method_of_construction || "";
      document.getElementById("labor_resources").value = record.labor_resources || "";   
      document.getElementById("work_elements").value = record.work_elements || ""; 
      document.getElementById("equipment").value = record.equipments || ""; 
    } catch (error) {
      console.error("Error fetching record:", error);
    }
  }

  // Add event listeners only if the elements exist.
  const addLaborBtn = document.getElementById("addLaborBtn");
  if (addLaborBtn) {
    addLaborBtn.addEventListener("click", addLaborResource);
  }

  const addWorkElementBtn = document.getElementById("addWorkElementBtn");
  if (addWorkElementBtn) {
    addWorkElementBtn.addEventListener("click", openLibraryModal);
  }

  const addEquipmentBtn = document.getElementById("addEquipmentBtn");
  if (addEquipmentBtn) {
    addEquipmentBtn.addEventListener("click", openEquipmentModal);
  }


        
      // -----------------------------
      // Update CAS Summary Functions
      // -----------------------------
      function updateLaborResources() {
        const laborTable = document.getElementById("casLaborTable");
        laborTable.innerHTML = "";
        let totalLabor = 0;
        const laborRows = document.querySelectorAll("#laborResourcesContainer .input-group");
        laborRows.forEach(row => {
          const skill = row.querySelector("select[name='labor_skill']").value;
          const quantity = parseFloat(row.querySelector("input[name='labor_quantity']").value) || 0;
          totalLabor += quantity;
          const tr = document.createElement("tr");
          const tdSkill = document.createElement("td");
          tdSkill.textContent = skill;
          const tdQuantity = document.createElement("td");
          tdQuantity.textContent = quantity;
          const tdRemarks = document.createElement("td");
          tdRemarks.textContent = "";
          tr.appendChild(tdSkill);
          tr.appendChild(tdQuantity);
          tr.appendChild(tdRemarks);
          laborTable.appendChild(tr);
        });
        document.getElementById("casTotalLabor").textContent = totalLabor;
        return totalLabor;
      }
      
      function updateEquipmentSummary() {
        const equipmentTable = document.getElementById("casEquipmentTable");
        equipmentTable.innerHTML = "";
        const equipRows = document.querySelectorAll("#equipmentContainer .input-group");
        equipRows.forEach(row => {
          const equipmentValue = row.querySelector("input[name='equipment_search']").value.trim();
          const quantity = row.querySelector("input[name='equipment_quantity']").value.trim();
          const tr = document.createElement("tr");
          const parts = equipmentValue.split(" - ");
          const equipmentID = parts[0] ? parts[0] : equipmentValue;
          const equipmentDesc = parts[1] ? parts[1] : equipmentValue;
          const tdID = document.createElement("td");
          tdID.textContent = equipmentID;
          const tdDesc = document.createElement("td");
          tdDesc.textContent = equipmentDesc;
          const tdQty = document.createElement("td");
          tdQty.textContent = quantity;
          tr.appendChild(tdID);
          tr.appendChild(tdDesc);
          tr.appendChild(tdQty);
          equipmentTable.appendChild(tr);
        });
      }
      
      // Update Work Elements and return total mandays.
      function updateWorkElementsSummary() {
        const workTable = document.getElementById("casWorkElements");
        workTable.innerHTML = "";
        let totalMandays = 0;
        const crewSize = parseFloat(document.getElementById("casTotalLabor").textContent) || 0;
        const workRows = document.querySelectorAll("#workElementsContainer .input-group");
        workRows.forEach(row => {
          const codeAndDesc = row.querySelector("input[name='work_element_search']").value.trim();
          const quantity = parseFloat(row.querySelector("input[name='work_element_quantity']").value) || 0;
          const parts = codeAndDesc.split(" - ");
          const code = parts[0] ? parts[0] : codeAndDesc;
          const description = parts[1] ? parts[1] : codeAndDesc;
          const um = row.querySelector("span.um-field").textContent || "N/A";
          const manHoursPerUnit = parseFloat(row.querySelector("span.man-hours-field").textContent) || 0;
          const multiplier = parseFloat(row.querySelector("span.multiplier-field").textContent) || 1;
          let estMDs = "N/A";
          if (crewSize > 0 && manHoursPerUnit > 0) {
            const md = (quantity / crewSize) * (manHoursPerUnit / 8) * multiplier;
            estMDs = md.toFixed(2);
            totalMandays += md;
          }
          const tr = document.createElement("tr");
          const tdCode = document.createElement("td");
          tdCode.textContent = code;
          const tdDesc = document.createElement("td");
          tdDesc.textContent = description;
          const tdUM = document.createElement("td");
          tdUM.textContent = um;
          const tdQty = document.createElement("td");
          tdQty.textContent = quantity;
          const tdManHrs = document.createElement("td");
          tdManHrs.textContent = manHoursPerUnit > 0 ? manHoursPerUnit : "N/A";
          const tdWorkMulti = document.createElement("td");
          tdWorkMulti.textContent = multiplier;
          const tdEstMDs = document.createElement("td");
          tdEstMDs.textContent = estMDs;
          
          tr.appendChild(tdCode);
          tr.appendChild(tdDesc);
          tr.appendChild(tdUM);
          tr.appendChild(tdQty);
          tr.appendChild(tdManHrs);
          tr.appendChild(tdWorkMulti);
          tr.appendChild(tdEstMDs);
          workTable.appendChild(tr);
        });
        document.getElementById("casMandaysEstimated").textContent = totalMandays.toFixed(2);
        return totalMandays;
      }
      
      function updateCASSummary() {
        // Update basic fields.
        document.getElementById("casProjectNumber").textContent = document.getElementById("project_number").value;
        document.getElementById("casProjectTitle").textContent = document.getElementById("project_title").value;
        document.getElementById("casActivityNumber").textContent = document.getElementById("activity_number").value;
        document.getElementById("casActivityTitle").textContent = document.getElementById("activity_title").value;
        document.getElementById("casDescription").textContent = document.getElementById("description_of_work").value;
        document.getElementById("casMethod").textContent = document.getElementById("method_of_construction").value;
        
        // Update Production Efficiency Factors.
        document.getElementById("casProductEfficiency").textContent = document.getElementById("product-efficiency").textContent;
        document.getElementById("casDelayFactor").textContent = document.getElementById("delay-factor").textContent;
        document.getElementById("casAvailabilityFactor").textContent = document.getElementById("availability-factor").value + "%";
        document.getElementById("casMandayEquivalent").textContent = document.getElementById("manday-equivalent").value;
        
        // Update Labor Resources first.
        const totalLabor = updateLaborResources();
        // Then update Work Elements.
        const totalMandays = updateWorkElementsSummary();
        // Then update Equipment.
        updateEquipmentSummary();
        
        // Calculate Duration = (Total Mandays ÷ Crew Size) ÷ Manday Equivalent ÷ (Availability Factor/100)
        const crewSize = parseFloat(document.getElementById("casTotalLabor").textContent) || 0;
        const mandayEquivalent = parseFloat(document.getElementById("manday-equivalent").value) || 1;
        const availabilityFactor = parseFloat(document.getElementById("availability-factor").value) || 100;
        const availDecimal = availabilityFactor / 100;
        let duration = "N/A";
        if (crewSize > 0 && mandayEquivalent > 0 && availDecimal > 0) {
          duration = (totalMandays / crewSize / mandayEquivalent / availDecimal).toFixed(2);
        }
        document.getElementById("casDurationEstimated").textContent = duration + " Days";
      }
      
      // -----------------------------
      // Production Efficiency Functions
      // -----------------------------
      function populateFactorDropdowns() {
        const factorIds = [
          "factor-workload", "factor-site", "factor-labor", "factor-supervision",
          "factor-job", "factor-weather", "factor-equipment", "factor-tactical"
        ];
        factorIds.forEach(id => {
          const select = document.getElementById(id);
          select.innerHTML = "";
          for (let i = 0; i <= 100; i++) {
            const opt = document.createElement("option");
            opt.value = i;
            opt.textContent = i;
            if (i === 67) opt.selected = true;
            select.appendChild(opt);
          }
          select.addEventListener("change", recalcEfficiency);
        });
      }
      
      function populateAvailabilityDropdown() {
        const availSelect = document.getElementById("availability-factor");
        availSelect.innerHTML = "";
        for (let i = 0; i <= 100; i += 5) {
          const opt = document.createElement("option");
          opt.value = i;
          opt.textContent = i + "%";
          if (i === 75) opt.selected = true;
          availSelect.appendChild(opt);
        }
      }
      
      function recalcEfficiency() {
        const factorIds = [
          "factor-workload", "factor-site", "factor-labor", "factor-supervision",
          "factor-job", "factor-weather", "factor-equipment", "factor-tactical"
        ];
        let sum = 0;
        factorIds.forEach(id => {
          sum += parseInt(document.getElementById(id).value, 10);
        });
        const avg = sum / factorIds.length;
        document.getElementById("product-efficiency").textContent = avg.toFixed(1);
        const delay = (avg !== 0) ? (67 / avg) : 0;
        document.getElementById("delay-factor").textContent = delay.toFixed(2);
      }
      
      window.addEventListener("load", () => {
        populateFactorDropdowns();
        populateAvailabilityDropdown();
        recalcEfficiency();
      });
      
      // -----------------------------
      // Labor Resources Functions
      // -----------------------------
      function addLaborResource() {
        const container = document.getElementById("laborResourcesContainer");
        const row = document.createElement("div");
        row.className = "input-group mb-2";
        row.innerHTML = `
          <select name="labor_skill" class="form-select">
            <option value="Builder">Builder</option>
            <option value="Steel Worker">Steel Worker</option>
            <option value="Utilitiesman">Utilitiesman</option>
            <option value="Engineering Aid">Engineering Aid</option>
            <option value="Construction Electrician">Construction Electrician</option>
            <option value="Equipment Operator">Equipment Operator</option>
            <option value="Construction Mechanic">Construction Mechanic</option>
          </select>
          <input type="number" name="labor_quantity" class="form-control" placeholder="Quantity" step="1" min="0" required>
          <button type="button" class="btn btn-outline-danger" onclick="this.parentElement.remove()">Remove</button>
        `;
        container.appendChild(row);
      }
      document.getElementById("addLaborBtn").addEventListener("click", addLaborResource);
      
      // -----------------------------
      // Work Elements Modal Functions
      // -----------------------------
      function addWorkElementPlaceholder() {
        const container = document.getElementById("workElementsContainer");
        const row = document.createElement("div");
        row.className = "input-group mb-2";
        row.innerHTML = `
          <input type="text" name="work_element_search" class="form-control" placeholder="Work element code" readonly>
          <span class="input-group-text">U/M: <span class="um-field"></span></span>
          <span class="input-group-text">Man Hrs/Unit: <span class="man-hours-field"></span></span>
          <span class="input-group-text">Multiplier: <span class="multiplier-field"></span></span>
          <input type="number" name="work_element_quantity" class="form-control" placeholder="Quantity" step="0.1" min="0" required>
          <button type="button" class="btn btn-outline-danger" onclick="this.parentElement.remove()">Remove</button>
        `;
        container.appendChild(row);
        activeWorkElementRow = row;
      }
      
      function openLibraryModal() {
        addWorkElementPlaceholder();
        document.getElementById("modalSearchInput").value = "";
        filterModalTable();
        fetchWorkElementsForModal();
        const modal = new bootstrap.Modal(document.getElementById("libraryModal"));
        modal.show();
      }
      document.getElementById("addWorkElementBtn").addEventListener("click", openLibraryModal);
      
      async function fetchWorkElementsForModal() {
        try {
          const res = await fetch("/work-elements");
          const results = await res.json();
          populateModalTable(results);
        } catch (error) {
          console.error("Error fetching work elements:", error);
        }
      }
      
      function populateModalTable(data) {
        const modalBody = document.getElementById("libraryModalBody");
        modalBody.innerHTML = "";
        const table = document.createElement("table");
        table.className = "table table-striped";
        table.id = "modalTable";
        
        const thead = document.createElement("thead");
        const headerRow = document.createElement("tr");
        ["Code", "Description", "Man Hours/Unit", "U/M", "Multiplier"].forEach(text => {
          const th = document.createElement("th");
          th.textContent = text;
          headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        const tbody = document.createElement("tbody");
        data.forEach(item => {
          const row = document.createElement("tr");
          row.className = "library-row";
          row.style.cursor = "pointer";
          
          const cellCode = document.createElement("td");
          cellCode.textContent = item.code;
          row.appendChild(cellCode);
          
          const cellDesc = document.createElement("td");
          cellDesc.textContent = item.description;
          row.appendChild(cellDesc);
          
          const cellMHPU = document.createElement("td");
          cellMHPU.textContent = (item.man_hours_per_unit !== undefined ? item.man_hours_per_unit : "0");
          row.appendChild(cellMHPU);
          
          const cellUM = document.createElement("td");
          cellUM.textContent = (item.uom ? item.uom : "N/A");
          row.appendChild(cellUM);
          
          const cellMultiplier = document.createElement("td");
          cellMultiplier.textContent = (item.multiplier ? item.multiplier : "1.00");
          row.appendChild(cellMultiplier);
          
          // Attach event listener passing man_hours_per_unit.
          row.addEventListener("click", () => {
            selectWorkElement(item.code, item.description, item.uom || "N/A", item.multiplier || "1.00", item.man_hours_per_unit || "0");
          });
          tbody.appendChild(row);
        });
        table.appendChild(tbody);
        modalBody.appendChild(table);
      }
      
      function filterModalTable() {
        const searchValue = document.getElementById("modalSearchInput").value.toLowerCase();
        const table = document.getElementById("modalTable");
        if (!table) return;
        const rows = table.getElementsByTagName("tr");
        for (let i = 1; i < rows.length; i++) {
          const cells = rows[i].getElementsByTagName("td");
          let rowText = "";
          for (let j = 0; j < cells.length; j++) {
            rowText += cells[j].textContent.toLowerCase() + " ";
          }
          rows[i].style.display = rowText.indexOf(searchValue) > -1 ? "" : "none";
        }
      }
      
      function selectWorkElement(code, description, uom, multiplier, manHoursPerUnit) {
        if (activeWorkElementRow) {
          activeWorkElementRow.innerHTML = `
            <input type="text" name="work_element_search" class="form-control" value="${code} - ${description}" readonly>
            <span class="input-group-text">U/M: <span class="um-field">${uom}</span></span>
            <span class="input-group-text">Man Hrs/Unit: <span class="man-hours-field">${manHoursPerUnit}</span></span>
            <span class="input-group-text">Multiplier: <span class="multiplier-field">${multiplier}</span></span>
            <input type="number" name="work_element_quantity" class="form-control" placeholder="Quantity" step="0.1" min="0" required>
            <button type="button" class="btn btn-outline-danger" onclick="this.parentElement.remove()">Remove</button>
          `;
          activeWorkElementRow = null;
        } else {
          const container = document.getElementById("workElementsContainer");
          const row = document.createElement("div");
          row.className = "input-group mb-2";
          row.innerHTML = `
            <input type="text" name="work_element_search" class="form-control" value="${code} - ${description}" readonly>
            <span class="input-group-text">U/M: <span class="um-field">${uom}</span></span>
            <span class="input-group-text">Man Hrs/Unit: <span class="man-hours-field">${manHoursPerUnit}</span></span>
            <span class="input-group-text">Multiplier: <span class="multiplier-field">${multiplier}</span></span>
            <input type="number" name="work_element_quantity" class="form-control" placeholder="Quantity" step="0.1" min="0" required>
            <button type="button" class="btn btn-outline-danger" onclick="this.parentElement.remove()">Remove</button>
          `;
          container.appendChild(row);
        }
        const modalEl = document.getElementById("libraryModal");
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
      }
      window.selectWorkElement = selectWorkElement;
      
      // -----------------------------
      // Equipment Modal Functions
      // -----------------------------
      function addEquipmentPlaceholder() {
        const container = document.getElementById("equipmentContainer");
        const row = document.createElement("div");
        row.className = "input-group mb-2";
        row.innerHTML = `
          <input type="text" name="equipment_search" class="form-control" placeholder="Equipment name" readonly>
          <input type="number" name="equipment_quantity" class="form-control" placeholder="Quantity" step="1" min="0" required>
          <button type="button" class="btn btn-outline-danger" onclick="this.parentElement.remove()">Remove</button>
        `;
        container.appendChild(row);
        activeEquipmentRow = row;
      }
      
      function openEquipmentModal() {
        addEquipmentPlaceholder();
        document.getElementById("equipmentModalSearchInput").value = "";
        filterEquipmentModalTable();
        fetchEquipmentForModal();
        const modal = new bootstrap.Modal(document.getElementById("equipmentModal"));
        modal.show();
      }
      document.getElementById("addEquipmentBtn").addEventListener("click", openEquipmentModal);
      
      async function fetchEquipmentForModal() {
        try {
          const res = await fetch("/equipment");
          const results = await res.json();
          populateEquipmentModalTable(results);
        } catch (error) {
          console.error("Error fetching equipment:", error);
        }
      }
      
      function populateEquipmentModalTable(data) {
        const modalBody = document.getElementById("equipmentModalBody");
        modalBody.innerHTML = "";
        const table = document.createElement("table");
        table.className = "table table-striped";
        table.id = "equipmentModalTable";
        
        const thead = document.createElement("thead");
        const headerRow = document.createElement("tr");
        ["ID #", "Description", "Qty Available"].forEach(text => {
          const th = document.createElement("th");
          th.textContent = text;
          headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        const tbody = document.createElement("tbody");
        data.forEach(item => {
          const row = document.createElement("tr");
          row.className = "equipment-row";
          row.style.cursor = "pointer";
          
          const cellID = document.createElement("td");
          cellID.textContent = item.id;
          row.appendChild(cellID);
          
          const cellDesc = document.createElement("td");
          cellDesc.textContent = item.description;
          row.appendChild(cellDesc);
          
          const cellQty = document.createElement("td");
          cellQty.textContent = (item.quantity ? item.quantity : "N/A");
          row.appendChild(cellQty);
          
          row.addEventListener("click", () => {
            selectEquipment(item.id, item.description);
          });
          tbody.appendChild(row);
        });
        table.appendChild(tbody);
        modalBody.appendChild(table);
      }
      
      function filterEquipmentModalTable() {
        const searchValue = document.getElementById("equipmentModalSearchInput").value.toLowerCase();
        const table = document.getElementById("equipmentModalTable");
        if (!table) return;
        const rows = table.getElementsByTagName("tr");
        for (let i = 1; i < rows.length; i++) {
          const cells = rows[i].getElementsByTagName("td");
          let rowText = "";
          for (let j = 0; j < cells.length; j++) {
            rowText += cells[j].textContent.toLowerCase() + " ";
          }
          rows[i].style.display = rowText.indexOf(searchValue) > -1 ? "" : "none";
        }
      }
      
      function selectEquipment(id, description) {
        if (activeEquipmentRow) {
          activeEquipmentRow.innerHTML = `
            <input type="text" name="equipment_search" class="form-control" value="${id} - ${description}" readonly>
            <input type="number" name="equipment_quantity" class="form-control" placeholder="Quantity" step="1" min="0" required>
            <button type="button" class="btn btn-outline-danger" onclick="this.parentElement.remove()">Remove</button>
          `;
          activeEquipmentRow = null;
        } else {
          const container = document.getElementById("equipmentContainer");
          const row = document.createElement("div");
          row.className = "input-group mb-2";
          row.innerHTML = `
            <input type="text" name="equipment_search" class="form-control" value="${id} - ${description}" readonly>
            <input type="number" name="equipment_quantity" class="form-control" placeholder="Quantity" step="1" min="0" required>
            <button type="button" class="btn btn-outline-danger" onclick="this.parentElement.remove()">Remove</button>
          `;
          container.appendChild(row);
        }
        const modalEl = document.getElementById("equipmentModal");
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
      }
      window.selectEquipment = selectEquipment;


async function fetchCASRecords() {
  try {
    const response = await fetch("/cass");
    const records = await response.json();
    populateTable(records);
  } catch (error) {
    console.error("Error fetching CAS records:", error);
  }
}

        
      // -----------------------------
      // Form Submission Handler
      // -----------------------------
document.getElementById("estimatorForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  // Update the CAS Summary on the form
  updateCASSummary();

  const form = e.target;

  // Build the payload for final estimate
  const finalEstimateData = {
    project_name: form.project_number.value,
    project_date: form.project_date ? form.project_date.value : "",
    activity_code: form.activity_number.value,
    description_of_work: form.description_of_work.value,
    method_of_construction: form.method_of_construction.value,
    labor_resources: [], // gather your labor rows
    work_elements: [],   // gather your work elements rows
    equipment: []        // gather your equipment rows
  };

  // Gather Labor Resources.
  const laborRows = document.querySelectorAll("#laborResourcesContainer .input-group");
  laborRows.forEach(row => {
    const skill = row.querySelector("select[name='labor_skill']").value;
    const quantity = parseInt(row.querySelector("input[name='labor_quantity']").value, 10);
    finalEstimateData.labor_resources.push({ skill, quantity });
  });

  // Gather Work Elements.
  const workRows = document.querySelectorAll("#workElementsContainer .input-group");
  workRows.forEach(row => {
    const codeAndDescription = row.querySelector("input[name='work_element_search']").value;
    const quantity = parseFloat(row.querySelector("input[name='work_element_quantity']").value);
    finalEstimateData.work_elements.push({ code: codeAndDescription, description: codeAndDescription, quantity });
  });

  // Gather Equipment.
  const equipRows = document.querySelectorAll("#equipmentContainer .input-group");
  equipRows.forEach(row => {
    const name = row.querySelector("input[name='equipment_search']").value;
    const quantity = parseFloat(row.querySelector("input[name='equipment_quantity']").value);
    finalEstimateData.equipment.push({ name, quantity });
  });

  console.log("Final Estimate Payload:", finalEstimateData);

  // Build the payload to send, using finalEstimateData arrays for resources.
  const cassData = {
    project_number: form.project_number.value,
    project_title: form.project_title.value,
    activity_number: form.activity_number.value,
    activity_title: form.activity_title.value,
    description_of_work: form.description_of_work.value,
    method_of_construction: form.method_of_construction.value,
    labor_resources: finalEstimateData.labor_resources,
    work_elements: finalEstimateData.work_elements,
    equipment: finalEstimateData.equipment,
  };

  fetch("/cass", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cassData)
  })
    .then(response => response.json())
    .then(data => {
      console.log("CAS record saved:", data);
      // Redirect to the dashboard if desired:
    //  window.location.href = "/static/cass_dashboard.html";
    })
    .catch(error => console.error("Error saving CAS record:", error));
});
