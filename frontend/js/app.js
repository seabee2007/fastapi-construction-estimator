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
    document.getElementById("blueprintResult").innerText = JSON.stringify(result, null, 2);
  } catch (error) {
    console.error("Error uploading blueprint:", error);
    document.getElementById("blueprintResult").innerText = "Error processing blueprint.";
  }
});
