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

function setupSheet() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Timestamp', 'Name', 'Phone', 'Comment']);
    sheet.setFrozenRows(1);
    sheet.getRange('A1:D1').setFontWeight('bold');
  }
}

function buildResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
