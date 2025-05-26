const sheetURL = 'https://script.google.com/macros/s/AKfycbw1_DouVkEwTJw1OzbVc4uLZjQe5qTPzJ7BdgkPUw8L-jMmzTfDzsQhgB3TPcEHBaa1/exec';
let dataByZip = {};

window.onload = async function() {
  try {
    const res = await fetch('https://docs.google.com/spreadsheets/d/1YWaAKQLV3lmYKX21VSDVO-cL7_ICNSn-0tB-1Ru3zWg/edit?gid=0#gid=0');
    dataByZip = await res.json();

    const zipDropdown = document.getElementById("zipcode");
    const zipcodes = Object.keys(dataByZip).sort();

    zipcodes.forEach(zip => {
      const option = document.createElement("option");
      option.value = zip;
      option.textContent = zip;
      zipDropdown.appendChild(option);
    });
  } catch (error) {
    console.error("Failed to load data:", error);
  }
};

function fetchDataByZip() {
  const selectedZip = document.getElementById("zipcode").value;
  const container = document.getElementById("results");
  container.innerHTML = "";

  if (!selectedZip || !dataByZip[selectedZip]) return;

  dataByZip[selectedZip].forEach(site => {
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
