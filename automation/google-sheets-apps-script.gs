/**
 * Telangana Solar → Google Sheets lead logger
 *
 * 1. Create a Google Sheet. Extensions → Apps Script. Paste this file.
 * 2. Set SECRET below to the same value as LEAD_WEBHOOK_SECRET in the website env.
 * 3. Deploy → New deployment → Web app → Execute as: Me, Who has access: Anyone.
 * 4. Copy the web app URL into LEAD_WEBHOOK_URL in the website env.
 *
 * Every lead (site visit, calculator report, contact, WhatsApp click) becomes one row.
 */
const SECRET = "CHANGE_ME"; // [EDIT] must match LEAD_WEBHOOK_SECRET
const SHEET_NAME = "Leads";
const COLUMNS = [
  "created_at", "kind", "name", "phone", "location", "property_type", "monthly_bill",
  "temperature", "tags", "slot_date", "slot_time", "package_id", "message", "calc",
  "source_page", "locale", "status", "id",
];

function doPost(e) {
  const data = JSON.parse(e.postData.contents || "{}");
  if (SECRET && data.secret !== SECRET) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: "unauthorized" })).setMimeType(ContentService.MimeType.JSON);
  }
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(COLUMNS);
    sheet.setFrozenRows(1);
  }
  sheet.appendRow(COLUMNS.map((c) => (data[c] === null || data[c] === undefined ? "" : data[c])));
  // Highlight hot leads
  if (data.temperature === "hot") sheet.getRange(sheet.getLastRow(), 1, 1, COLUMNS.length).setBackground("#FFF1D6");
  return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
}
