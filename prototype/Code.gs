// ============================================================
//  PolyPack Manufacturing — Google Apps Script Backend
//  File: Code.gs
//  Deploy as: Web App → Execute as Me → Anyone can access
// ============================================================

// ── Sheet tab names (must match your actual sheet tabs) ──────
const SHEETS = {
  EXTRUSION:   "Extrusion_Log",
  CUTTING:     "Cutting_Log",
  DISPATCH:    "Dispatch_Log",
  STOCK:       "Stock_Master",
  ORDERS:      "Orders_Tally",
  SETTINGS:    "Settings",
  ATTENDANCE:  "Attendance",
};

// ── Entry point for all POST requests ───────────────────────
function doPost(e) {
  try {
    const body   = JSON.parse(e.postData.contents);
    const action = body.action;

    if (action === "log_extrusion")  return respond(logExtrusion(body.data));
    if (action === "log_cutting")    return respond(logCutting(body.data));
    if (action === "log_dispatch")   return respond(logDispatch(body.data));
    if (action === "update_stock")   return respond(updateStock(body.data));
    if (action === "mark_attendance")return respond(markAttendance(body.data));
    if (action === "save_settings")  return respond(saveSettings(body.data));
    if (action === "sync_orders")    return respond(syncOrders(body.data));

    return respond({ ok: false, error: "Unknown action: " + action });
  } catch (err) {
    return respond({ ok: false, error: err.message });
  }
}

// ── Entry point for all GET requests ────────────────────────
function doGet(e) {
  try {
    const action = e.parameter.action;

    if (action === "get_dashboard")  return respond(getDashboard());
    if (action === "get_stock")      return respond(getStock());
    if (action === "get_orders")     return respond(getOrders());
    if (action === "get_settings")   return respond(getSettings());
    if (action === "get_attendance") return respond(getAttendance(e.parameter.date));
    if (action === "get_production") return respond(getProduction(e.parameter.date));

    return respond({ ok: false, error: "Unknown action: " + action });
  } catch (err) {
    return respond({ ok: false, error: err.message });
  }
}

// ── Helper: wrap response as JSON ───────────────────────────
function respond(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── Helper: get sheet by name, create if missing ─────────────
function getSheet(name) {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  let   sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    setupHeaders(sheet, name);
  }
  return sheet;
}

// ── Setup column headers for each sheet ─────────────────────
function setupHeaders(sheet, name) {
  const headers = {
    [SHEETS.EXTRUSION]: [
      "Timestamp","Date","Shift","Operator","Machine",
      "Material","Material_Consumed_kg","Output_Weight_kg",
      "Width_mm","Thickness_micron","Wastage_kg","Remarks"
    ],
    [SHEETS.CUTTING]: [
      "Timestamp","Date","Shift","Operator","Machine",
      "Source_Extruder","Bag_Size_cm","Bags_Produced",
      "Wastage_kg","Client_Order","Remarks"
    ],
    [SHEETS.DISPATCH]: [
      "Timestamp","Date","Client","Quantity","Unit",
      "Vehicle_No","Driver_Name","Challan_No",
      "Gatekeeper","Remarks"
    ],
    [SHEETS.STOCK]: [
      "Material","Current_Stock_kg","Min_Level_kg",
      "Last_Updated","Last_Updated_By"
    ],
    [SHEETS.ORDERS]: [
      "Order_ID","Client","Material","Thickness_micron",
      "Size","Quantity","Unit","Due_Date","Status",
      "Tally_Voucher","Pulled_At"
    ],
    [SHEETS.SETTINGS]: [
      "Key","Value","Updated_At"
    ],
    [SHEETS.ATTENDANCE]: [
      "Date","Employee_Name","Role","Machine",
      "Shift","Status","In_Time","Out_Time","Remarks"
    ],
  };

  if (headers[name]) {
    sheet.appendRow(headers[name]);
    sheet.getRange(1, 1, 1, headers[name].length)
      .setFontWeight("bold")
      .setBackground("#1a2744")
      .setFontColor("#ffffff");
    sheet.setFrozenRows(1);
  }
}

// ============================================================
//  WRITE FUNCTIONS
// ============================================================

function logExtrusion(d) {
  const sheet = getSheet(SHEETS.EXTRUSION);
  const now   = new Date();
  sheet.appendRow([
    now,
    Utilities.formatDate(now, "Asia/Kolkata", "dd/MM/yyyy"),
    d.shift         || "",
    d.operator_name || "",
    d.machine       || "",
    d.material      || "",
    d.material_consumed_kg  || 0,
    d.output_weight_kg      || 0,
    d.width_mm              || 0,
    d.thickness_micron      || 0,
    d.wastage_kg            || 0,
    d.remarks               || "",
  ]);

  // Deduct material from stock
  if (d.material && d.material_consumed_kg) {
    deductStock(d.material, parseFloat(d.material_consumed_kg));
  }

  return { ok: true, message: "Extrusion log saved" };
}

function logCutting(d) {
  const sheet = getSheet(SHEETS.CUTTING);
  const now   = new Date();
  sheet.appendRow([
    now,
    Utilities.formatDate(now, "Asia/Kolkata", "dd/MM/yyyy"),
    d.shift            || "",
    d.operator_name    || "",
    d.machine          || "",
    d.source_extruder  || "",
    d.bag_size_cm      || "",
    d.bags_produced    || 0,
    d.wastage_kg       || 0,
    d.client_order     || "",
    d.remarks          || "",
  ]);
  return { ok: true, message: "Cutting log saved" };
}

function logDispatch(d) {
  const sheet = getSheet(SHEETS.DISPATCH);
  const now   = new Date();
  sheet.appendRow([
    now,
    Utilities.formatDate(now, "Asia/Kolkata", "dd/MM/yyyy"),
    d.client       || "",
    d.quantity     || 0,
    d.unit         || "pcs",
    d.vehicle_no   || "",
    d.driver_name  || "",
    d.challan_no   || "",
    d.gatekeeper   || "",
    d.remarks      || "",
  ]);
  return { ok: true, message: "Dispatch logged" };
}

function markAttendance(d) {
  const sheet = getSheet(SHEETS.ATTENDANCE);
  const now   = new Date();
  sheet.appendRow([
    Utilities.formatDate(now, "Asia/Kolkata", "dd/MM/yyyy"),
    d.employee_name || "",
    d.role          || "",
    d.machine       || "",
    d.shift         || "",
    d.status        || "Present",
    d.in_time       || "",
    d.out_time      || "",
    d.remarks       || "",
  ]);
  return { ok: true, message: "Attendance marked" };
}

// ── Stock: deduct material when extrusion logs consumption ───
function deductStock(material, consumed_kg) {
  const sheet = getSheet(SHEETS.STOCK);
  const data  = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0].toString().toUpperCase() === material.toUpperCase()) {
      const current = parseFloat(data[i][1]) || 0;
      const updated = Math.max(0, current - consumed_kg);
      sheet.getRange(i + 1, 2).setValue(updated);
      sheet.getRange(i + 1, 4).setValue(new Date());
      return;
    }
  }
}

// ── Update stock (manual GRN entry or adjustment) ────────────
function updateStock(d) {
  const sheet = getSheet(SHEETS.STOCK);
  const data  = sheet.getDataRange().getValues();
  const now   = new Date();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0].toString().toUpperCase() === d.material.toUpperCase()) {
      const current = parseFloat(data[i][1]) || 0;
      const newQty  = d.type === "add"
        ? current + parseFloat(d.quantity_kg)
        : parseFloat(d.quantity_kg); // "set" replaces value
      sheet.getRange(i + 1, 2).setValue(newQty);
      sheet.getRange(i + 1, 4).setValue(now);
      sheet.getRange(i + 1, 5).setValue(d.updated_by || "System");
      return { ok: true, message: "Stock updated: " + d.material + " → " + newQty + " kg" };
    }
  }

  // Material not found — add new row
  sheet.appendRow([d.material, d.quantity_kg, d.min_level_kg || 100, now, d.updated_by || "System"]);
  return { ok: true, message: "New material added to stock" };
}

// ── Save settings key-value ───────────────────────────────────
function saveSettings(d) {
  const sheet = getSheet(SHEETS.SETTINGS);
  const data  = sheet.getDataRange().getValues();
  const now   = new Date();

  // d is an object of { key: value } pairs
  for (const [key, value] of Object.entries(d)) {
    let found = false;
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === key) {
        sheet.getRange(i + 1, 2).setValue(value);
        sheet.getRange(i + 1, 3).setValue(now);
        found = true;
        break;
      }
    }
    if (!found) {
      sheet.appendRow([key, value, now]);
    }
  }
  return { ok: true, message: "Settings saved" };
}

// ── Sync orders pushed from Tally (array of order objects) ───
function syncOrders(orders) {
  const sheet = getSheet(SHEETS.ORDERS);
  // Clear existing data (keep header)
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) sheet.deleteRows(2, lastRow - 1);

  const now = new Date();
  orders.forEach(o => {
    sheet.appendRow([
      o.order_id      || "",
      o.client        || "",
      o.material      || "",
      o.thickness     || "",
      o.size          || "",
      o.quantity      || 0,
      o.unit          || "pcs",
      o.due_date      || "",
      o.status        || "Pending",
      o.tally_voucher || "",
      now,
    ]);
  });
  return { ok: true, message: orders.length + " orders synced" };
}

// ============================================================
//  READ FUNCTIONS
// ============================================================

function getDashboard() {
  const today    = Utilities.formatDate(new Date(), "Asia/Kolkata", "dd/MM/yyyy");
  const extrData = getSheet(SHEETS.EXTRUSION).getDataRange().getValues();
  const cutData  = getSheet(SHEETS.CUTTING).getDataRange().getValues();

  let totalExtruded = 0, totalBags = 0, machinesActive = new Set();

  for (let i = 1; i < extrData.length; i++) {
    if (extrData[i][1] === today) {
      totalExtruded += parseFloat(extrData[i][7]) || 0;
      machinesActive.add(extrData[i][4]);
    }
  }
  for (let i = 1; i < cutData.length; i++) {
    if (cutData[i][1] === today) {
      totalBags += parseInt(cutData[i][7]) || 0;
      machinesActive.add(cutData[i][4]);
    }
  }

  return {
    ok: true,
    data: {
      date:             today,
      total_extruded_kg: totalExtruded,
      total_bags_cut:    totalBags,
      machines_active:   machinesActive.size,
      stock_summary:     getStock().data,
      pending_orders:    getOrders().data,
    }
  };
}

function getStock() {
  const sheet = getSheet(SHEETS.STOCK);
  const data  = sheet.getDataRange().getValues();
  const result = [];

  for (let i = 1; i < data.length; i++) {
    if (!data[i][0]) continue;
    const current = parseFloat(data[i][1]) || 0;
    const minLevel = parseFloat(data[i][2]) || 100;
    result.push({
      material:    data[i][0],
      current_kg:  current,
      min_level_kg: minLevel,
      status:      current <= minLevel * 0.5  ? "critical"
                 : current <= minLevel        ? "low"
                 : "ok",
      last_updated: data[i][3] ? data[i][3].toString() : "",
    });
  }
  return { ok: true, data: result };
}

function getOrders() {
  const sheet = getSheet(SHEETS.ORDERS);
  const data  = sheet.getDataRange().getValues();
  const result = [];

  for (let i = 1; i < data.length; i++) {
    if (!data[i][0]) continue;
    result.push({
      order_id:   data[i][0],
      client:     data[i][1],
      material:   data[i][2],
      thickness:  data[i][3],
      size:       data[i][4],
      quantity:   data[i][5],
      unit:       data[i][6],
      due_date:   data[i][7],
      status:     data[i][8],
      voucher:    data[i][9],
    });
  }
  return { ok: true, data: result };
}

function getSettings() {
  const sheet = getSheet(SHEETS.SETTINGS);
  const data  = sheet.getDataRange().getValues();
  const result = {};
  for (let i = 1; i < data.length; i++) {
    if (data[i][0]) result[data[i][0]] = data[i][1];
  }
  return { ok: true, data: result };
}

function getAttendance(dateStr) {
  const sheet = getSheet(SHEETS.ATTENDANCE);
  const data  = sheet.getDataRange().getValues();
  const target = dateStr || Utilities.formatDate(new Date(), "Asia/Kolkata", "dd/MM/yyyy");
  const result = [];

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === target) {
      result.push({
        date:          data[i][0],
        employee_name: data[i][1],
        role:          data[i][2],
        machine:       data[i][3],
        shift:         data[i][4],
        status:        data[i][5],
        in_time:       data[i][6],
        out_time:      data[i][7],
      });
    }
  }
  return { ok: true, data: result };
}

function getProduction(dateStr) {
  const target = dateStr || Utilities.formatDate(new Date(), "Asia/Kolkata", "dd/MM/yyyy");
  const extrSheet = getSheet(SHEETS.EXTRUSION);
  const cutSheet  = getSheet(SHEETS.CUTTING);
  const extrData  = extrSheet.getDataRange().getValues();
  const cutData   = cutSheet.getDataRange().getValues();

  const extrusion = [], cutting = [];

  for (let i = 1; i < extrData.length; i++) {
    if (extrData[i][1] === target) {
      extrusion.push({
        shift:     extrData[i][2],
        operator:  extrData[i][3],
        machine:   extrData[i][4],
        material:  extrData[i][5],
        consumed:  extrData[i][6],
        output:    extrData[i][7],
        wastage:   extrData[i][10],
      });
    }
  }
  for (let i = 1; i < cutData.length; i++) {
    if (cutData[i][1] === target) {
      cutting.push({
        shift:    cutData[i][2],
        operator: cutData[i][3],
        machine:  cutData[i][4],
        size:     cutData[i][6],
        bags:     cutData[i][7],
        order:    cutData[i][9],
      });
    }
  }
  return { ok: true, data: { date: target, extrusion, cutting } };
}

// ============================================================
//  ONE-TIME SETUP (run manually once from Apps Script editor)
// ============================================================
function setupAllSheets() {
  Object.values(SHEETS).forEach(name => {
    const ss    = SpreadsheetApp.getActiveSpreadsheet();
    let   sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
    }
    // Clear and re-add headers
    sheet.clearContents();
    setupHeaders(sheet, name);
  });

  // Seed initial stock data
  const stock = getSheet(SHEETS.STOCK);
  const now   = new Date();
  [
    ["HDPE",       180, 200, now, "Setup"],
    ["LDPE",       230, 150, now, "Setup"],
    ["PP",         640, 200, now, "Setup"],
    ["HD Natural", 510, 150, now, "Setup"],
  ].forEach(row => stock.appendRow(row));

  // Seed company settings
  const settings = getSheet(SHEETS.SETTINGS);
  [
    ["company_name",    "PolyPack Industries"],
    ["address",         "Plot 14, Industrial Area, Sector 3, Sanwer Road, Indore"],
    ["city",            "Indore"],
    ["state",           "Madhya Pradesh"],
    ["pin",             "452015"],
    ["phone",           "+91 98765 43210"],
    ["email",           "accounts@polypack.in"],
    ["gstin",           "23ABCDE1234F1Z8"],
    ["cst_number",      "MP/CST/2019/4421"],
    ["pan",             "ABCDE1234F"],
    ["tally_ip",        "192.168.1.105"],
    ["tally_port",      "9000"],
    ["tally_company",   "PolyPack Industries"],
    ["tally_version",   "Tally Prime"],
    ["ai_language",     "hinglish"],
  ].forEach(([k, v]) => settings.appendRow([k, v, now]));

  SpreadsheetApp.getUi().alert("✅ All sheets created and seeded successfully!");
}
