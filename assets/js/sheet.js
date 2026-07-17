/* ===================================================================
   Jade Benefits  |  Send form submissions to Google Sheets
   -------------------------------------------------------------------
   SETUP: paste your Google Apps Script Web App URL between the quotes
   on the next line. Full step by step instructions are in the
   google-sheets/SETUP.txt file in your project folder.
   =================================================================== */
window.JADE_SHEET_ENDPOINT = "https://script.google.com/macros/s/AKfycby-m0b6OFzv7Vcc-MgB_JyZBuNBZ3KTTmCtAlxTX3q_b4NYhIx0ReoABCcpgGEOn2c8gA/exec";

window.jadeSubmit = function (formType, data) {
  var url = window.JADE_SHEET_ENDPOINT;
  if (!url) {
    console.warn("Jade Benefits: JADE_SHEET_ENDPOINT is not set yet, skipping Google Sheet send.");
    return Promise.resolve();
  }
  var payload = Object.assign(
    {
      formType: formType,
      page: location.pathname,
      submittedAt: new Date().toISOString()
    },
    data
  );
  return fetch(url, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload)
  }).catch(function (e) {
    console.error("Jade Benefits: form send failed", e);
  });
};
