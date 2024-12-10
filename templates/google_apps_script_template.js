// Vercel API Configuration
const VERCEL_API_URL = "https://checklist-banner.your-domain.vercel.app/api";

// Trigger function for Preview Button
function generatePreview() {
  try {
    // Get active sheet and data
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Collect checklist data (customize based on your sheet structure)
    const header = sheet.getRange("A1").getValue();
    const items = [];
    
    // Assuming checklist items are in columns A and B, starting from row 2
    const dataRange = sheet.getRange("A2:B" + sheet.getLastRow());
    const values = dataRange.getValues();
    
    values.forEach(row => {
      if (row[0]) {  // If text is not empty
        items.push({
          text: row[0],
          isChecked: row[1] === true  // Assuming column B has checkboxes
        });
      }
    });

    // Prepare payload
    const payload = {
      action: "preview",
      checklistData: {
        header: header,
        items: items,
      },
      user_id: Session.getActiveUser().getEmail(),
    };

    // Trigger Vercel API
    const response = triggerVercelAPI(payload);
    
    // Handle response
    if (response.success) {
      sheet.getRange("C1").setValue("Preview processing...");
    } else {
      sheet.getRange("C1").setValue("Preview generation failed");
    }
  } catch (error) {
    Logger.log("Preview generation error: " + error.toString());
  }
}

// Trigger function for Publish Buttons
function publishToX() {
  triggerVercelAPI({ action: "publish", platform: "x", ...getChecklistPayload() });
}

function publishToBluesky() {
  triggerVercelAPI({ action: "publish", platform: "bluesky", ...getChecklistPayload() });
}

// Helper function to get checklist payload
function getChecklistPayload() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const header = sheet.getRange("A1").getValue();
  const items = [];
  
  const dataRange = sheet.getRange("A2:B" + sheet.getLastRow());
  const values = dataRange.getValues();
  
  values.forEach(row => {
    if (row[0]) {
      items.push({
        text: row[0],
        isChecked: row[1] === true,
      });
    }
  });

  return {
    checklistData: {
      header: header,
      items: items,
    },
    user_id: Session.getActiveUser().getEmail(),
  };
}

// Generic function to trigger Vercel API
function triggerVercelAPI(payload) {
  try {
    const options = {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(payload),
    };

    const response = UrlFetchApp.fetch(VERCEL_API_URL, options);
    return { success: response.getResponseCode() === 200 };
  } catch (error) {
    Logger.log("Vercel API trigger error: " + error.toString());
    return { success: false, error: error.toString() };
  }
}

// Listener for preview generation response
function onPreviewGenerated(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  if (e.parameter.preview_url) {
    // Download and display preview image
    const imageBlob = UrlFetchApp.fetch(e.parameter.preview_url).getBlob();
    sheet.insertImage(imageBlob, "D2");  // Adjust cell as needed
    sheet.getRange("C1").setValue("Preview Generated");
  } else {
    sheet.getRange("C1").setValue("Preview generation failed");
  }
}
