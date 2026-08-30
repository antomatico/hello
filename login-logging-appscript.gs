/**
 * Ants Portfolio — login logging endpoint (Google Apps Script)
 * ------------------------------------------------------------
 * Paste this into the Apps Script editor attached to your
 * "Ants Portfolio — Login Log" Google Sheet, then deploy it as a
 * Web App (see login-logging-setup.md for the click-by-click steps).
 *
 * doPost  → appends one row per login (called by the site).
 * doGet   → returns all rows as JSONP (read by loginhistory.html).
 */

var SHEET_NAME = 'logins';

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sh = getSheet_();
    sh.appendRow([
      new Date(),
      String(data.email || ''),
      String(data.page || ''),
      String(data.userAgent || ''),
      String(data.tz || '')
    ]);
    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  var sh = getSheet_();
  var values = sh.getDataRange().getValues();
  var rows = values.slice(1).map(function (r) {
    return {
      time: r[0],           // Date -> ISO string in JSON
      email: r[1],
      page: r[2],
      userAgent: r[3],
      tz: r[4]
    };
  });
  var out = { ok: true, rows: rows };
  var cb = e && e.parameter && e.parameter.callback;
  if (cb) {
    // JSONP — lets the static loginhistory.html read across origins.
    return ContentService
      .createTextOutput(cb + '(' + JSON.stringify(out) + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService
    .createTextOutput(JSON.stringify(out))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(['time', 'email', 'page', 'userAgent', 'timezone']);
  }
  return sh;
}
