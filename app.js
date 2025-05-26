const sheetURL = 'https://script.google.com/macros/s/AKfycbxpvaF85LIKRfEGekJnSeIpDPu44QaYvNVr9tWl8WjQcNe1wFqro5yALP6bJRaU1yHa/exec';
let dataByZip = {};

window.onload = async function () {
  try {
    console.log("🔄 Fetching data from Google Apps Script...");
    const res = await fetch(sheetURL);
    dataByZip = await res.json();
    console.log("✅ Data loaded successfully:", dataByZip);
  } catch (error) {
    console.error("❌ Failed to load data:", error);
  }
};

function handleZipInput() {
  const zipInput = document.getElementById("zipcode").value.trim();
  console.log("📥 ZIP code entered:", zipInput);

  if (zipInput.length === 5 && /^\d{5}$/.test(zipInput)) {
    fetchDataByZip(zipInput);
  } else {
    console.warn("⚠️ Invalid ZIP Code format");
    document.getElementById("results").innerHTML = "";
  }
}

function fetchDataByZip(zip) {
  const container = document.getElementById("results");
  container.innerHTML = "";

  if (!zip || !dataByZip[zip]) {
    console.warn(`❗ No data found for ZIP Code: ${zip}`);
    container.innerHTML = `<p>No data found for ZIP Code: ${zip}</p>`;
    return;
  }

  // Introductory statement
  const intro = document.createElement("p");
  intro.innerHTML = `<strong>The following are information for water system(s) in the specified ZIP code:</strong>`;
  container.appendChild(intro);

  dataByZip[zip].forEach(site => {
    const siteBox = document.createElement("div");
    siteBox.className = "site-box";

    const chemicals = Array.from({ length: 9 }, (_, i) => site[`CHEMICAL ${i + 1}`]).filter(Boolean);
    const chemicalList = chemicals.length ? chemicals.join(", ") : "None";

    siteBox.innerHTML = `
      <strong>SITE NAME:</strong> ${site["MAILINGNAME"]}<br/><br/>

      <strong>SITE CONTACT</strong><br/>
      <strong>ADDRESS:</strong> ${site["ADDRESS1"]}<br/>
      <strong>CITY:</strong> ${site["CITY"]}<br/>
      <strong>EMAIL:</strong> ${site["EMAIL"]}<br/>
      <strong>PHONE NUMBER:</strong> ${site["PHONE"]}<br/><br/>

      <em>THE FOLLOWING WATER CONTAMINANTS WERE PRESENT DURING TESTING OF THE SITE IN THE YEAR 2023</em><br/>
      <strong>CHEMICALS PRESENT:</strong> ${chemicalList}<br/>
      <strong>MICROBIOLOGY STATUS:</strong> ${site["MICROBIOLOGY"] || "Not reported"}<br/><br/>

      <em>Note:</em> The presence of chemicals should not scare you. In some instances, the detected level is below the lethal level. 
      However, it is important to take necessary precaution and contact the specific water system and the 
      <a href="https://floridadep.gov/" target="_blank" rel="noopener noreferrer">Florida Department of Environmental Protection</a> 
      for current data and mitigation measures that have been put in place to minimize risk.
    `;

    container.appendChild(siteBox);

    // Blinking question
    const blinking = document.createElement("p");
    blinking.className = "blinking";
    blinking.textContent = "Now that you know what is in your water after utilizing the above information, what are you recommended to do??";
    container.appendChild(blinking);

    // Add mitigation boxes if available
    for (let i = 1; i <= 9; i++) {
      const chem = site[`CHEMICAL ${i}`];
      const mitigation = site[`MITIGATION ${i}`];

      if (chem && mitigation) {
        const mitigationBox = document.createElement("div");
        mitigationBox.className = "site-box"; // same style as site box

        mitigationBox.innerHTML = `
          <strong>For "${chem}"</strong><br/>
          The following is recommended:<br/>
          <em>${mitigation}</em>
        `;

        container.appendChild(mitigationBox);
      }
    }
  });
}
