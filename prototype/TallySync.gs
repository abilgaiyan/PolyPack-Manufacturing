// ============================================================
//  PolyPack — Tally XML Integration
//  File: TallySync.gs
//  Add this file to the same Apps Script project as Code.gs
// ============================================================

// ── Pull sales orders from Tally via XML Gateway ─────────────
function pullOrdersFromTally() {
  const settings = getSettings().data;
  const ip       = settings["tally_ip"]      || "192.168.1.105";
  const port     = settings["tally_port"]    || "9000";
  const company  = settings["tally_company"] || "";

  const xml = buildTallyRequest("Sales Order", company);
  const url = "http://" + ip + ":" + port;

  try {
    const response = UrlFetchApp.fetch(url, {
      method:      "post",
      contentType: "text/xml",
      payload:     xml,
      muteHttpExceptions: true,
    });

    const raw = response.getContentText();
    return parseTallySalesOrders(raw);
  } catch (err) {
    return { ok: false, error: "Cannot reach Tally at " + url + " — " + err.message };
  }
}

// ── Pull raw material stock from Tally ───────────────────────
function pullStockFromTally() {
  const settings = getSettings().data;
  const ip       = settings["tally_ip"]      || "192.168.1.105";
  const port     = settings["tally_port"]    || "9000";
  const company  = settings["tally_company"] || "";

  const xml = buildStockRequest(company);
  const url = "http://" + ip + ":" + port;

  try {
    const response = UrlFetchApp.fetch(url, {
      method:      "post",
      contentType: "text/xml",
      payload:     xml,
      muteHttpExceptions: true,
    });

    const raw = response.getContentText();
    return parseTallyStock(raw);
  } catch (err) {
    return { ok: false, error: "Cannot reach Tally: " + err.message };
  }
}

// ── Build Tally XML request for sales orders ─────────────────
function buildTallyRequest(voucherType, company) {
  return `<ENVELOPE>
  <HEADER>
    <VERSION>1</VERSION>
    <TALLYREQUEST>Export</TALLYREQUEST>
    <TYPE>Data</TYPE>
    <ID>Voucher Register</ID>
  </HEADER>
  <BODY>
    <DESC>
      <STATICVARIABLES>
        <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
        <SVFROMDATE>$$MonthStart:$$SystemDate</SVFROMDATE>
        <SVTODATE>$$SystemDate</SVTODATE>
        <SVCURRENTCOMPANY>${company}</SVCURRENTCOMPANY>
      </STATICVARIABLES>
      <TDL>
        <TDLMESSAGE>
          <REPORT NAME="Voucher Register">
            <FORMS>Voucher Register</FORMS>
          </REPORT>
        </TDLMESSAGE>
      </TDL>
    </DESC>
  </BODY>
</ENVELOPE>`;
}

// ── Build Tally XML request for stock summary ────────────────
function buildStockRequest(company) {
  return `<ENVELOPE>
  <HEADER>
    <VERSION>1</VERSION>
    <TALLYREQUEST>Export</TALLYREQUEST>
    <TYPE>Data</TYPE>
    <ID>Stock Summary</ID>
  </HEADER>
  <BODY>
    <DESC>
      <STATICVARIABLES>
        <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
        <SVCURRENTCOMPANY>${company}</SVCURRENTCOMPANY>
      </STATICVARIABLES>
    </DESC>
  </BODY>
</ENVELOPE>`;
}

// ── Parse Tally XML response for sales orders ────────────────
function parseTallySalesOrders(xmlText) {
  try {
    const doc     = XmlService.parse(xmlText);
    const root    = doc.getRootElement();
    const body    = root.getChild("BODY");
    const data    = body ? body.getChild("DATA") : null;
    const tallymsg= data ? data.getChild("TALLYMESSAGE") : null;

    if (!tallymsg) return { ok: false, error: "Unexpected Tally XML structure" };

    const vouchers = tallymsg.getChildren("VOUCHER");
    const orders   = [];

    vouchers.forEach((v, idx) => {
      const vtype = getXmlVal(v, "VOUCHERTYPENAME");
      if (vtype !== "Sales Order") return;

      const party    = getXmlVal(v, "PARTYLEDGERNAME");
      const date     = formatTallyDate(getXmlVal(v, "DATE"));
      const vno      = getXmlVal(v, "VOUCHERNUMBER");

      // Pull inventory items from voucher
      const allItems = v.getChildren("ALLINVENTORYENTRIES.LIST");
      allItems.forEach(item => {
        orders.push({
          order_id:      "ORD-" + String(idx + 1).padStart(3, "0"),
          client:        party,
          material:      getXmlVal(item, "STOCKITEMNAME"),
          thickness:     "",               // Not standard in Tally — fill manually
          size:          "",               // Not standard in Tally
          quantity:      parseFloat(getXmlVal(item, "ACTUALQTY")) || 0,
          unit:          getXmlVal(item, "UNITS") || "pcs",
          due_date:      date,
          status:        "Pending",
          tally_voucher: vno,
        });
      });
    });

    // Save to Orders sheet
    syncOrders(orders);

    return { ok: true, count: orders.length, orders: orders };

  } catch (err) {
    return { ok: false, error: "XML parse error: " + err.message };
  }
}

// ── Parse Tally XML for stock items ──────────────────────────
function parseTallyStock(xmlText) {
  try {
    const doc    = XmlService.parse(xmlText);
    const root   = doc.getRootElement();
    const items  = root.getDescendants()
      .filter(d => d.getType && d.getType() === XmlService.ContentTypes.Element)
      .filter(el => el.getName && el.getName() === "STOCKITEM");

    const results = [];
    items.forEach(item => {
      const name    = item.getAttribute("NAME") ? item.getAttribute("NAME").getValue() : getXmlVal(item, "NAME");
      const closing = getXmlVal(item, "CLOSINGBALANCE");
      const qty     = parseFloat(closing) || 0;
      if (name) {
        results.push({ material: name, quantity_kg: qty, type: "set", updated_by: "Tally sync" });
      }
    });

    // Update each material in Stock_Master
    results.forEach(r => updateStock(r));

    return { ok: true, count: results.length, items: results };
  } catch (err) {
    return { ok: false, error: "Stock parse error: " + err.message };
  }
}

// ── Helper: safely get XML child text ────────────────────────
function getXmlVal(element, tagName) {
  try {
    const child = element.getChild(tagName);
    return child ? child.getText() : "";
  } catch (e) {
    return "";
  }
}

// ── Helper: convert Tally date (YYYYMMDD) to DD/MM/YYYY ──────
function formatTallyDate(tallyDate) {
  if (!tallyDate || tallyDate.length !== 8) return tallyDate;
  return tallyDate.substr(6, 2) + "/" + tallyDate.substr(4, 2) + "/" + tallyDate.substr(0, 4);
}

// ── Scheduled trigger: run this to auto-sync every 30 min ────
function autoSync() {
  const ordResult   = pullOrdersFromTally();
  const stockResult = pullStockFromTally();

  Logger.log("Order sync: " + JSON.stringify(ordResult));
  Logger.log("Stock sync: " + JSON.stringify(stockResult));

  // Update last-sync timestamp in settings
  saveSettings({ "last_tally_sync": new Date().toString() });
}

// ── Setup time-based trigger (run once manually) ─────────────
function createAutoSyncTrigger() {
  // Delete existing triggers first
  ScriptApp.getProjectTriggers().forEach(t => {
    if (t.getHandlerFunction() === "autoSync") ScriptApp.deleteTrigger(t);
  });

  // Create new trigger: every 30 minutes
  ScriptApp.newTrigger("autoSync")
    .timeBased()
    .everyMinutes(30)
    .create();

  SpreadsheetApp.getUi().alert("✅ Auto-sync trigger created — will pull from Tally every 30 minutes.");
}
