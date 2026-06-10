// ============================================================
//  PolyPack — Archive & Financial Year Management
//  File: Archive.gs
//  Add to the same Apps Script project
//  Financial Year: 01 April → 31 March
// ============================================================

// ── Sheet names for archive ──────────────────────────────────
// Live sheets:    Extrusion_Log, Cutting_Log, etc.
// Archive sheets: Extrusion_Log_FY2425, Cutting_Log_FY2425, etc.

const ARCHIVE_SHEETS = [
  SHEETS.EXTRUSION,
  SHEETS.CUTTING,
  SHEETS.DISPATCH,
  SHEETS.ATTENDANCE,
  SHEETS.ORDERS,
];

// ── Get current financial year label e.g. "FY2526" ──────────
function getCurrentFYLabel() {
  const now   = new Date();
  const month = now.getMonth() + 1; // 1-12
  const year  = now.getFullYear();
  const fyStart = month >= 4 ? year : year - 1;
  const fyEnd   = fyStart + 1;
  return "FY" + String(fyStart).slice(2) + String(fyEnd).slice(2);
}

// ── Get FY label for a given date ───────────────────────────
function getFYLabelForDate(date) {
  const month   = date.getMonth() + 1;
  const year    = date.getFullYear();
  const fyStart = month >= 4 ? year : year - 1;
  const fyEnd   = fyStart + 1;
  return "FY" + String(fyStart).slice(2) + String(fyEnd).slice(2);
}

// ── Get FY start/end dates for a label e.g. "FY2526" ────────
function getFYDateRange(fyLabel) {
  // fyLabel format: "FY2526"
  const startYY = parseInt("20" + fyLabel.slice(2, 4));
  const endYY   = parseInt("20" + fyLabel.slice(4, 6));
  return {
    start: new Date(startYY, 3, 1),   // April 1
    end:   new Date(endYY,   2, 31),  // March 31
    label: fyLabel,
    display: "01 Apr " + startYY + " – 31 Mar " + endYY,
  };
}

// ── List all available financial years in this spreadsheet ───
function listAvailableFYs() {
  const ss      = SpreadsheetApp.getActiveSpreadsheet();
  const sheets  = ss.getSheets();
  const fySet   = new Set();

  fySet.add(getCurrentFYLabel()); // always include current

  sheets.forEach(s => {
    const name = s.getName();
    // match pattern like Extrusion_Log_FY2425
    const match = name.match(/_FY(\d{4})$/);
    if (match) fySet.add("FY" + match[1]);
  });

  return Array.from(fySet).sort().reverse(); // newest first
}

// ============================================================
//  ARCHIVE: Move old FY data to archive sheets
// ============================================================

// ── Archive a single sheet for a specific FY ─────────────────
function archiveSheet(sheetName, fyLabel) {
  const ss        = SpreadsheetApp.getActiveSpreadsheet();
  const source    = ss.getSheetByName(sheetName);
  if (!source) return { ok: false, error: "Sheet not found: " + sheetName };

  const archiveName = sheetName + "_" + fyLabel;

  // If archive sheet already exists, skip
  if (ss.getSheetByName(archiveName)) {
    return { ok: false, error: archiveName + " already exists — skipped" };
  }

  const { start, end } = getFYDateRange(fyLabel);
  const allData         = source.getDataRange().getValues();
  const header          = allData[0];
  const rowsToArchive   = [];
  const rowsToKeep      = [header];

  // Column index 1 = Date (dd/MM/yyyy)
  for (let i = 1; i < allData.length; i++) {
    const row     = allData[i];
    const dateStr = row[1] ? row[1].toString() : "";
    const rowDate = parseDate(dateStr);

    if (rowDate && rowDate >= start && rowDate <= end) {
      rowsToArchive.push(row);
    } else {
      rowsToKeep.push(row);
    }
  }

  if (rowsToArchive.length === 0) {
    return { ok: true, archived: 0, message: "No rows found for " + fyLabel + " in " + sheetName };
  }

  // Create archive sheet
  const archiveSheet = ss.insertSheet(archiveName);

  // Write header + archived rows
  const archiveData = [header, ...rowsToArchive];
  archiveSheet.getRange(1, 1, archiveData.length, header.length)
    .setValues(archiveData);

  // Style header
  archiveSheet.getRange(1, 1, 1, header.length)
    .setFontWeight("bold")
    .setBackground("#2d4080")
    .setFontColor("#ffffff");
  archiveSheet.setFrozenRows(1);

  // Add archive info note in cell A1 note
  archiveSheet.getRange("A1").setNote(
    "Archived: " + fyLabel + "\n" +
    "Rows: " + rowsToArchive.length + "\n" +
    "Archived on: " + Utilities.formatDate(new Date(), "Asia/Kolkata", "dd/MM/yyyy HH:mm")
  );

  // ── Protect archive sheet (read-only) ──────────────────
  const protection = archiveSheet.protect().setDescription("Archive — " + fyLabel);
  protection.setWarningOnly(true); // warns before editing, doesn't block

  // ── Clear live sheet, keep only non-archived rows ───────
  source.clearContents();
  source.getRange(1, 1, rowsToKeep.length, header.length)
    .setValues(rowsToKeep);

  // Re-style live sheet header
  source.getRange(1, 1, 1, header.length)
    .setFontWeight("bold")
    .setBackground("#1a2744")
    .setFontColor("#ffffff");

  return {
    ok:       true,
    archived: rowsToArchive.length,
    kept:     rowsToKeep.length - 1,
    message:  sheetName + ": " + rowsToArchive.length + " rows archived to " + archiveName,
  };
}

// ── Archive ALL sheets for a specific FY ─────────────────────
function archiveAllForFY(fyLabel) {
  const results = [];
  let   totalArchived = 0;

  ARCHIVE_SHEETS.forEach(sheetName => {
    const result = archiveSheet(sheetName, fyLabel);
    results.push(result);
    if (result.ok) totalArchived += (result.archived || 0);
  });

  // Log the archive action in Settings
  saveSettings({
    ["last_archive_" + fyLabel]: new Date().toString(),
    ["archive_rows_"  + fyLabel]: totalArchived,
  });

  return {
    ok:      true,
    fy:      fyLabel,
    total:   totalArchived,
    details: results,
  };
}

// ── Auto-archive: runs April 1 each year (via trigger) ───────
function autoArchivePreviousFY() {
  const now   = new Date();
  const month = now.getMonth() + 1; // April = 4
  const day   = now.getDate();

  if (month !== 4 || day !== 1) {
    Logger.log("autoArchive: skipped — not April 1");
    return;
  }

  // Archive the FY that just ended
  const prevFY = getPreviousFYLabel();
  const result = archiveAllForFY(prevFY);
  Logger.log("Auto-archive result: " + JSON.stringify(result));
  return result;
}

function getPreviousFYLabel() {
  const now   = new Date();
  const year  = now.getFullYear();
  const month = now.getMonth() + 1;
  // If we are in April, previous FY ended March this year
  const prevStart = month >= 4 ? year - 1 : year - 2;
  const prevEnd   = prevStart + 1;
  return "FY" + String(prevStart).slice(2) + String(prevEnd).slice(2);
}

// ============================================================
//  READ: Query archived or live data with FY filter
// ============================================================

// ── Get production data for a specific FY ───────────────────
function getProductionForFY(fyLabel) {
  const isCurrentFY = fyLabel === getCurrentFYLabel();
  const suffix      = isCurrentFY ? "" : "_" + fyLabel;

  const extrName = SHEETS.EXTRUSION + suffix;
  const cutName  = SHEETS.CUTTING   + suffix;
  const ss       = SpreadsheetApp.getActiveSpreadsheet();

  const extrSheet = ss.getSheetByName(extrName);
  const cutSheet  = ss.getSheetByName(cutName);

  const summary = {
    fy:               fyLabel,
    date_range:       getFYDateRange(fyLabel).display,
    total_extruded_kg: 0,
    total_bags:       0,
    material_wise:    {},
    month_wise:       {},
  };

  if (extrSheet) {
    const data = extrSheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      const row      = data[i];
      const dateStr  = row[1] ? row[1].toString() : "";
      const material = row[5] ? row[5].toString() : "Unknown";
      const output   = parseFloat(row[7]) || 0;
      const month    = dateStr.length >= 7 ? dateStr.slice(3, 10) : "Unknown"; // MM/YYYY

      summary.total_extruded_kg += output;
      summary.material_wise[material] = (summary.material_wise[material] || 0) + output;
      summary.month_wise[month]       = (summary.month_wise[month]       || 0) + output;
    }
  }

  if (cutSheet) {
    const data = cutSheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      summary.total_bags += parseInt(data[i][7]) || 0;
    }
  }

  return { ok: true, data: summary };
}

// ── Get dispatch records for a FY (for annual report) ────────
function getDispatchForFY(fyLabel) {
  const isCurrentFY = fyLabel === getCurrentFYLabel();
  const sheetName   = SHEETS.DISPATCH + (isCurrentFY ? "" : "_" + fyLabel);
  const ss          = SpreadsheetApp.getActiveSpreadsheet();
  const sheet       = ss.getSheetByName(sheetName);

  if (!sheet) return { ok: false, error: "No dispatch data for " + fyLabel };

  const data    = sheet.getDataRange().getValues();
  const records = [];
  let   total   = 0;
  const clientWise = {};

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[2]) continue;
    const qty    = parseFloat(row[3]) || 0;
    const client = row[2].toString();
    records.push({
      date:       row[1],
      client:     client,
      quantity:   qty,
      unit:       row[4],
      vehicle_no: row[5],
      challan_no: row[7],
    });
    total += qty;
    clientWise[client] = (clientWise[client] || 0) + qty;
  }

  return {
    ok:          true,
    fy:          fyLabel,
    total_qty:   total,
    client_wise: clientWise,
    records:     records,
  };
}

// ── List all rows in an archive sheet ────────────────────────
function getArchiveData(sheetName, fyLabel) {
  const archiveName = sheetName + "_" + fyLabel;
  const ss          = SpreadsheetApp.getActiveSpreadsheet();
  const sheet       = ss.getSheetByName(archiveName);

  if (!sheet) return { ok: false, error: "Archive not found: " + archiveName };

  const data    = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows    = [];

  for (let i = 1; i < data.length; i++) {
    const obj = {};
    headers.forEach((h, idx) => { obj[h] = data[i][idx]; });
    rows.push(obj);
  }

  return {
    ok:      true,
    fy:      fyLabel,
    sheet:   sheetName,
    count:   rows.length,
    headers: headers,
    rows:    rows,
  };
}

// ── doGet handler additions (add to existing doGet in Code.gs) ─
// Call these from the app:
//   ?action=get_archive_fy_list
//   ?action=get_fy_production&fy=FY2425
//   ?action=get_fy_dispatch&fy=FY2425
//   ?action=get_archive_data&sheet=Extrusion_Log&fy=FY2425

function handleArchiveGet(action, params) {
  if (action === "get_archive_fy_list")
    return respond({ ok: true, data: listAvailableFYs() });

  if (action === "get_fy_production")
    return respond(getProductionForFY(params.fy || getCurrentFYLabel()));

  if (action === "get_fy_dispatch")
    return respond(getDispatchForFY(params.fy || getCurrentFYLabel()));

  if (action === "get_archive_data")
    return respond(getArchiveData(params.sheet, params.fy));

  return null; // not handled here
}

// ── doPost handler additions ─────────────────────────────────
// POST body: { action: "archive_fy", data: { fy: "FY2425" } }

function handleArchivePost(action, data) {
  if (action === "archive_fy")
    return respond(archiveAllForFY(data.fy));

  if (action === "archive_sheet")
    return respond(archiveSheet(data.sheet, data.fy));

  return null;
}

// ============================================================
//  TRIGGERS
// ============================================================

// ── Create April 1 annual archive trigger ───────────────────
function createArchiveTrigger() {
  // Remove existing
  ScriptApp.getProjectTriggers().forEach(t => {
    if (t.getHandlerFunction() === "autoArchivePreviousFY") ScriptApp.deleteTrigger(t);
  });

  // Trigger on April 1 at 1:00 AM IST
  ScriptApp.newTrigger("autoArchivePreviousFY")
    .timeBased()
    .onMonthDay(1)
    .atHour(1)
    .inTimezone("Asia/Kolkata")
    .create();

  SpreadsheetApp.getUi().alert(
    "✅ Archive trigger set.\n" +
    "Every year on April 1 at 1:00 AM, last FY data will auto-archive."
  );
}

// ── Manual archive with confirmation dialog ──────────────────
function manualArchiveDialog() {
  const ui     = SpreadsheetApp.getUi();
  const prevFY = getPreviousFYLabel();
  const range  = getFYDateRange(prevFY);

  const response = ui.alert(
    "Archive Financial Year: " + prevFY,
    "This will move all data from " + range.display + " to archive sheets.\n\n" +
    "Live sheets will retain only current FY data.\n\n" +
    "Archive sheets will be protected (read-only).\n\n" +
    "Proceed?",
    ui.ButtonSet.YES_NO
  );

  if (response === ui.Button.YES) {
    const result = archiveAllForFY(prevFY);
    ui.alert(
      "Archive complete!",
      "FY archived: " + prevFY + "\n" +
      "Total rows archived: " + result.total + "\n\n" +
      result.details.map(d => d.message || d.error).join("\n"),
      ui.ButtonSet.OK
    );
  }
}

// ── Custom menu in Google Sheets ─────────────────────────────
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("PolyPack")
    .addItem("Setup all sheets",       "setupAllSheets")
    .addSeparator()
    .addItem("Sync from Tally now",    "autoSync")
    .addSeparator()
    .addItem("Archive previous FY",    "manualArchiveDialog")
    .addItem("Set auto-archive trigger","createArchiveTrigger")
    .addItem("Set auto-sync trigger",  "createAutoSyncTrigger")
    .addToUi();
}

// ============================================================
//  HELPERS
// ============================================================

// ── Parse dd/MM/yyyy string to Date ─────────────────────────
function parseDate(str) {
  if (!str) return null;
  const parts = str.toString().split("/");
  if (parts.length !== 3) return null;
  const d = parseInt(parts[0]);
  const m = parseInt(parts[1]) - 1; // 0-indexed month
  const y = parseInt(parts[2]);
  if (isNaN(d) || isNaN(m) || isNaN(y)) return null;
  return new Date(y, m, d);
}
