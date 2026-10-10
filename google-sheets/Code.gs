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

    autoReply(data, type);

    return ContentService
      .createTextOutput(JSON.stringify({ result: "ok" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: "error", error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Instant confirmation email sent to the person who submitted a form.
// Edit the wording below any time. Replies go to REPLY_TO.
var REPLY_TO = "info@jadebenefits.com";
var PHONE = "352-949-4463";

function autoReply(data, type) {
  try {
    var email = String(data.email || "").trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return;
    var first = String(data.name || "").trim().split(/\s+/)[0] || "there";
    first = first.replace(/[<>&]/g, "");

    var intro = "Thanks for reaching out to Jade Benefits. We received your request and a licensed advisor will be in touch shortly.";
    if (data.formType && String(data.formType).toLowerCase() === "subsidy_calculator") {
      intro = "Thanks for using the Jade Benefits subsidy calculator. A licensed advisor will look up the real plans and prices for your ZIP code and follow up with your exact numbers.";
    }
    // Tailor the "while you wait" tip to who is asking: a business (group) or a person/family (individual).
    var segment = leadSegment(data);
    var tip = "";
    if (segment === "group") {
      tip = "While you wait: it helps to have your employee count, your current carrier, and your renewal date (if you have a plan today) handy so we can start your comparison right away. ";
    } else if (segment === "individual") {
      tip = "While you wait: if you have a list of your doctors and prescriptions handy, it helps us confirm they are covered. ";
    }
    var next = tip + "Need us sooner? Call or text " + PHONE + ", or just reply to this email.";

    var text = "Hi " + first + ",\n\n" + intro + "\n\n" + next +
      "\n\nTalk soon,\nThe Jade Benefits Team\nFort Lauderdale, FL | Licensed in 30+ states\nwww.jadebenefits.com";
    var htmlBody = "<p>Hi " + first + ",</p><p>" + intro + "</p><p>" + next +
      "</p><p>Talk soon,<br><strong>The Jade Benefits Team</strong><br>Fort Lauderdale, FL | Licensed in 30+ states<br>" +
      "<a href=\"https://www.jadebenefits.com\">www.jadebenefits.com</a></p>";

    MailApp.sendEmail({
      to: email,
      subject: "We got your request, " + first,
      body: text,
      htmlBody: htmlBody,
      name: "Jade Benefits",
      replyTo: REPLY_TO
    });
  } catch (mailErr) {
    // Never let an email problem block saving the row.
  }
}

// Works out whether a lead is a business ("group"), a person/family ("individual"), or unknown ("general").
function leadSegment(data) {
  var form = String(data.formType || "").toLowerCase();
  if (form === "subsidy_calculator") return "individual";
  var what = String(data.audience || data.type || "").toLowerCase();   // quote form: audience, contact form: type
  var size = String(data.size || "").toLowerCase();                    // quote form team size
  if (what.indexOf("group") !== -1 || size === "2 to 9" || size === "10 to 99") return "group";
  if (what.indexOf("trucker") !== -1 || what.indexOf("1099") !== -1 || what.indexOf("self-employed") !== -1 ||
      what.indexOf("family") !== -1 || what.indexOf("individual") !== -1) return "individual";
  return "general";
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
