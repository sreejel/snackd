/**
 * SnackD Feedback → Google Sheets
 *
 * SETUP (hello.snackd@gmail.com):
 * 1. Open https://sheets.google.com and sign in as hello.snackd@gmail.com
 * 2. Create a new spreadsheet named "SnackD Feedback"
 * 3. In row 1, add headers: Timestamp | Name | Phone | Comment
 * 4. Extensions → Apps Script → delete default code → paste this file
 * 5. Save the project as "SnackD Feedback Handler"
 * 6. Deploy → New deployment → type: Web app
 *    - Execute as: Me (hello.snackd@gmail.com)
 *    - Who has access: Anyone
 * 7. Copy the Web app URL and paste it into index.html:
 *    const SNACKD_FEEDBACK_ENDPOINT = 'YOUR_URL_HERE';
 *
 * IMPORTANT: After any code change you must redeploy:
 * Deploy → Manage deployments → Edit (pencil) → Version: New version → Deploy
 *
 * Test: open YOUR_URL in a browser — you should see:
 * {"success":true,"message":"SnackD feedback endpoint is live."}
 * If you see "Script function not found: doPost", the deployment is stale.
 */

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var params = e.parameter || {};

    if (e.postData && e.postData.contents) {
      try {
        var json = JSON.parse(e.postData.contents);
        params = Object.assign(params, json);
      } catch (parseErr) {
        // Form fields arrive via e.parameter; JSON body is optional.
      }
    }

    var name = String(params.name || '').trim();
    var phone = String(params.phone || '').trim();
    var comment = String(params.comment || '').trim();

    if (!name || !phone || !comment) {
      return buildResponse({ success: false, error: 'Missing required fields.' });
    }

    sheet.appendRow([
      new Date(),
      name,
      phone,
      comment
    ]);

    return buildResponse({ success: true });
  } catch (err) {
    return buildResponse({ success: false, error: String(err) });
  }
}

function doGet() {
  return buildResponse({ success: true, message: 'SnackD feedback endpoint is live.' });
}

function buildResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
