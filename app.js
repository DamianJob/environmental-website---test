// IMPORTANT: Replace this URL with your NEW deployment URL from Step 1
const sheetURL = "https://script.google.com/macros/s/AKfycbxR1850IBDw2U_Dm_f2cU3HfDxNxfL60ixpRSsIPvAzHxIYaioYjphJJcs_mtNQLEyG/exec"
let dataByZip = {}
let dataLoaded = false

window.onload = async () => {
  showLoading(true)

  // First, let's test if the URL is accessible
  console.log("🔄 Testing Google Apps Script URL...")
  console.log("📍 URL:", sheetURL)

  // Check if URL looks correct
  if (!sheetURL.includes("script.google.com/macros/s/") || sheetURL === "https://script.google.com/macros/s/AKfycbxR1850IBDw2U_Dm_f2cU3HfDxNxfL60ixpRSsIPvAzHxIYaioYjphJJcs_mtNQLEyG/exec") {
    showError("❌ Please update the sheetURL in app.js with your actual Google Apps Script deployment URL")
    showLoading(false)
    return
  }

  try {
    console.log("🔄 Fetching data from Google Apps Script...")

    const res = await fetch(sheetURL, {
      method: "GET",
      mode: "cors", // Explicitly set CORS mode
      headers: {
        Accept: "application/json",
      },
    })

    console.log("📊 Response status:", res.status)
    console.log("📊 Response ok:", res.ok)

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status} - ${res.statusText}`)
    }

    const responseText = await res.text()
    console.log("📄 Raw response (first 500 chars):", responseText.substring(0, 500))

    try {
      const parsedData = JSON.parse(responseText)

      // Check if the response is an error
      if (parsedData.error) {
        console.error("❌ Server returned error:", parsedData)
        showError(`Server error: ${parsedData.message}`)
        return
      }

      dataByZip = parsedData
      console.log("✅ Data loaded successfully")
      console.log("📈 Number of ZIP codes:", Object.keys(dataByZip).length)
      console.log("🔍 Sample ZIP codes:", Object.keys(dataByZip).slice(0, 5))

      if (Object.keys(dataByZip).length === 0) {
        showError(
          "No data found in the spreadsheet. Please check if the spreadsheet contains data and the ZIP code column is named correctly.",
        )
        return
      }

      dataLoaded = true
      showError("")
    } catch (parseError) {
      console.error("❌ JSON parsing error:", parseError)
      console.log("📄 Response that failed to parse:", responseText)
      showError("Failed to parse data from server. The response might not be valid JSON.")
    }
  } catch (error) {
    console.error("❌ Failed to load data:", error)

    // Provide more specific error messages
    if (error.message.includes("Failed to fetch")) {
      showError(`❌ Cannot connect to Google Apps Script. Please check:
      1. Is your script deployed as a web app?
      2. Is access set to "Anyone"?
      3. Is the URL correct?
      
      Current URL: ${sheetURL}`)
    } else {
      showError(`Failed to load data: ${error.message}`)
    }
  } finally {
    showLoading(false)
  }
}

function showLoading(show) {
  const loadingEl = document.getElementById("loading")
  if (show) {
    loadingEl.classList.remove("hidden")
  } else {
    loadingEl.classList.add("hidden")
  }
}

function showError(message) {
  const errorEl = document.getElementById("error")
  if (message) {
    errorEl.innerHTML = message.replace(/\n/g, "<br>") // Allow line breaks in error messages
    errorEl.classList.remove("hidden")
  } else {
    errorEl.classList.add("hidden")
  }
}

function handleZipInput() {
  const zipInput = document.getElementById("zipcode").value.trim()
  console.log("📥 ZIP code entered:", zipInput)

  if (zipInput.length === 5 && /^\d{5}$/.test(zipInput)) {
    if (!dataLoaded) {
      showError("Data is still loading. Please wait...")
      return
    }
    fetchDataByZip(zipInput)
  } else if (zipInput.length > 0) {
    console.warn("⚠️ Invalid ZIP Code format")
    document.getElementById("results").innerHTML = ""
    showError("Please enter a valid 5-digit ZIP code.")
  } else {
    document.getElementById("results").innerHTML = ""
    showError("")
  }
}

function fetchDataByZip(zip) {
  const container = document.getElementById("results")
  container.innerHTML = ""
  showError("")

  console.log("🔍 Looking for ZIP:", zip)
  console.log("📊 Available ZIPs:", Object.keys(dataByZip).slice(0, 10))

  if (!zip || !dataByZip[zip]) {
    console.warn(`❗ No data found for ZIP Code: ${zip}`)

    // Add debug information
    const debugInfo = document.createElement("div")
    debugInfo.className = "debug-info"
    debugInfo.innerHTML = `
      <strong>Debug Information:</strong><br/>
      Searched ZIP: ${zip}<br/>
      Data loaded: ${dataLoaded}<br/>
      Total ZIP codes in data: ${Object.keys(dataByZip).length}<br/>
      Available ZIP codes: ${Object.keys(dataByZip).join(", ") || "None"}
    `
    container.appendChild(debugInfo)

    container.innerHTML += `<p><strong>No data found for ZIP Code: ${zip}</strong></p>
                           <p>Available ZIP codes: ${Object.keys(dataByZip).join(", ") || "None"}</p>`
    return
  }

  // Introductory statement
  const intro = document.createElement("p")
  intro.innerHTML = `<strong>The following are information for water system(s) in ZIP code ${zip}:</strong>`
  container.appendChild(intro)

  dataByZip[zip].forEach((site, index) => {
    const siteBox = document.createElement("div")
    siteBox.className = "site-box"

    // Get all chemical columns dynamically
    const chemicals = []
    for (let i = 1; i <= 8; i++) {
      const chemical = site[`CHEMICAL ${i}`] || site[`CHEMICAL${i}`]
      if (chemical && chemical.trim()) {
        chemicals.push(chemical.trim())
      }
    }
    const chemicalList = chemicals.length ? chemicals.join(", ") : "None detected"

    siteBox.innerHTML = `
      <strong>SITE NAME:</strong> ${site["MAILINGNAME"] || "Not provided"}<br/><br/>

      <strong>SITE CONTACT</strong><br/>
      <strong>ADDRESS:</strong> ${site["ADDRESS1"] || "Not provided"}<br/>
      <strong>CITY:</strong> ${site["CITY"] || "Not provided"}<br/>
      <strong>EMAIL:</strong> ${site["EMAIL"] || "Not provided"}<br/>
      <strong>PHONE NUMBER:</strong> ${site["PHONE"] || "Not provided"}<br/><br/>

      <em>THE FOLLOWING WATER CONTAMINANTS WERE PRESENT DURING TESTING OF THE SITE IN THE YEAR 2023</em><br/>
      <strong>CHEMICALS PRESENT:</strong> ${chemicalList}<br/><br/>

      <em>Note:</em> The presence of chemicals should not scare you. In some instances, the detected level is below the lethal level. 
      However, it is important to take necessary precaution and contact the specific water system and the 
      <a href="https://floridadep.gov/" target="_blank" rel="noopener noreferrer">Florida Department of Environmental Protection</a> 
      for current data and mitigation measures that have been put in place to minimize risk.
    `

    container.appendChild(siteBox)
  })

  // Add the blinking question after all sites
  const blinking = document.createElement("p")
  blinking.className = "blinking"
  blinking.textContent =
    "Now that you know what is in your water after utilizing the above information, what are you recommended to do??"
  container.appendChild(blinking)

  // Collect all unique chemicals and their mitigations from all sites in this ZIP code
  const chemicalMitigations = new Map()

  dataByZip[zip].forEach((site) => {
    // Check chemicals 1 through 9
    for (let i = 1; i <= 9; i++) {
      const chemical = site[`CHEMICAL ${i}`] || site[`CHEMICAL${i}`]
      const mitigation = site[`MITIGATION ${i}`] || site[`MITIGATION${i}`]

      if (chemical && chemical.trim() && mitigation && mitigation.trim()) {
        const chemName = chemical.trim()
        const mitigationText = mitigation.trim()

        // Store the mitigation (use the first one found if there are duplicates)
        if (!chemicalMitigations.has(chemName)) {
          chemicalMitigations.set(chemName, mitigationText)
        }
      }
    }
  })

  // Display mitigation boxes for each chemical found
  if (chemicalMitigations.size > 0) {
    chemicalMitigations.forEach((mitigation, chemical) => {
      const mitigationBox = document.createElement("div")
      mitigationBox.className = "site-box"

      mitigationBox.innerHTML = `
        <strong>For "${chemical}"</strong><br/>
        The following is recommended:<br/>
        <em>${mitigation}</em>
      `

      container.appendChild(mitigationBox)
    })
  }
}
