const sheetURL = 'https://script.google.com/macros/s/YOUR_DEPLOYED_SCRIPT_URL/exec';
let dataByZip = {};

window.onload = async function() {
  try {
    const res = await fetch(sheetURL);
    dataByZip = await res.json();
  } catch (error) {
    console.error("Failed to load data:", error);
  }
};

function handleZipInput() {
  const zipInput = document.getElementById("zipcode").value;
  if (zipInput.length === 5 && /^\d{5}$/.test(zipInput)) {
    fetchDataByZip(zipInput);
  } else {
    document.getElementById("results").innerHTML = ""; // Clear output if ZIP is invalid or incomplete
  }
}

function fetchDataByZip(zip) {
  const container = document.getElementById("results");
  container.innerHTML = "";

  if (!zip || !dataByZip[zip]) {
    container.innerHTML = `<p>No data found for ZIP Code: ${zip}</p>`;
    return;
  }

  dataByZip[zip].forEach(site => {
    const siteBox = document.createElement("div");
    siteBox.className = "site-box";

    const chemicals = Array.from({ length: 9 }, (_, i) => site[`CHEMICAL ${i + 1}`]).filter(Boolean);

    siteBox.innerHTML = `
      <strong>SITE NAME:</strong> ${site["MAILINGNAME"]}<br/>
      <strong>CHEMICALS PRESENT:</strong> ${chemicals.join(", ") || "None"}<br/>
      <strong>MICROBIOLOGY STATUS:</strong> ${site["MICROBIOLOGY"] || "Not reported"}<br/><br/>

      <strong>SITE CONTACT</strong><br/>
      <strong>ADDRESS:</strong> ${site["ADDRESS1"]}<br/>
      <strong>CITY:</strong> ${site["CITY"]}<br/>
      <strong>EMAIL:</strong> ${site["EMAIL"]}<br/>
      <strong>PHONE NUMBER:</strong> ${site["PHONE"]}<br/>
    `;
    container.appendChild(siteBox);
  });
}
