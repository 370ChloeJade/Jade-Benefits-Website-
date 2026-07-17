/**
 * Jade Benefits  -  Google Sheet receiver for website forms.
 * Paste this whole file into the Apps Script editor (see SETUP.txt).
 * It writes quote submissions to a "Quotes" tab and contact
 * submissions to a "Contacts" tab, creating each tab automatically,
 * and emails you an alert for every new lead.
 */

// Where new-lead alert emails are sent. Change if needed.
var NOTIFY_EMAIL = "Chloe@jadebenefits.com";

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var data = JSON.parse(e.postData.contents);
    var type = (data.formType || "other").toLowerCase();

    if (type === "quote") {
      var q = getOrCreate(ss, "Quotes", [
        "Timestamp", "Name", "Email", "Phone", "ZIP",
        "Coverage for", "Team size", "Priority", "Timing", "Page"
      ]);
      q.appendRow([
        new Date(), data.name || "", data.email || "", data.phone || "",
        data.zip || "", data.audience || "", data.size || "",
        data.priority || "", data.timing || "", data.page || ""
      ]);
      notify("New quote request", [
        ["Name", data.name], ["Email", data.email], ["Phone", data.phone],
        ["ZIP", data.zip], ["Coverage for", data.audience],
        ["Team size", data.size], ["Priority", data.priority],
        ["Timing", data.timing]
      ]);
    } else {
      var c = getOrCreate(ss, "Contacts", [
        "Timestamp", "Name", "Email", "Phone", "Interested in", "Message", "Page"
      ]);
      c.appendRow([
        new Date(), data.name || "", data.email || "", data.phone || "",
        data.type || "", data.message || "", data.page || ""
      ]);
      notify("New contact message", [
        ["Name", data.name], ["Email", data.email], ["Phone", data.phone],
        ["Interested in", data.type], ["Message", data.message]
      ]);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ result: "ok" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: "error", error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function notify(subject, rows) {
  try {
    if (!NOTIFY_EMAIL) return;
    var lines = rows
      .filter(function (r) { return r[1]; })
      .map(function (r) { return r[0] + ": " + r[1]; });
    var body = "You have a new lead from JadeBenefits.com\n\n" +
      lines.join("\n") +
      "\n\nFull details are saved in your Google Sheet.";
    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      subject: "Jade Benefits: " + subject,
      body: body
    });
  } catch (mailErr) {
    // Never let an email problem block saving the row.
  }
}

function getOrCreate(ss, name, headers) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
  return sheet;
}
