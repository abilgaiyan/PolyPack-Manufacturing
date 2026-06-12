// ============================================================
//  PolyPack — Frontend API Client
//  File: api.js
//  Include this in your mobile app (HTML/PWA)
//  Replace SCRIPT_URL with your deployed Apps Script URL
// ============================================================

const API = (() => {

  // ── REPLACE THIS with your deployed Apps Script URL ─────
  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwJlG5RXreim_giRgJa_Hnyz2sPh3QjjI3k1kblaYROVyIqRdD5nIvmQvHZ-gNzKbYvtg/exec";

  // ── Generic GET request ──────────────────────────────────
  async function get(action, params = {}) {
    const qs = new URLSearchParams({ action, ...params }).toString();
    try {
      const res  = await fetch(`${SCRIPT_URL}?${qs}`);
      const data = await res.json();
      return data;
    } catch (err) {
      return { ok: false, error: "Network error: " + err.message };
    }
  }

  // ── Generic POST request ─────────────────────────────────
  async function post(action, payload = {}) {
    try {
      const res = await fetch(SCRIPT_URL, {
        method:  "POST",
        body:    JSON.stringify({ action, data: payload }),
      });
      const data = await res.json();
      return data;
    } catch (err) {
      return { ok: false, error: "Network error: " + err.message };
    }
  }

  // ============================================================
  //  PUBLIC API METHODS
  // ============================================================

  return {

    // ── Dashboard summary ─────────────────────────────────
    getDashboard() {
      return get("get_dashboard");
    },

    // ── Stock ──────────────────────────────────────────────
    getStock() {
      return get("get_stock");
    },

    updateStock(material, quantity_kg, type = "add", updatedBy = "User") {
      return post("update_stock", { material, quantity_kg, type, updated_by: updatedBy });
    },

    // ── Orders ─────────────────────────────────────────────
    getOrders() {
      return get("get_orders");
    },

    // ── Extrusion log ──────────────────────────────────────
    logExtrusion({
      operator_name, machine, shift,
      material, material_consumed_kg, output_weight_kg,
      width_mm, thickness_micron, wastage_kg, remarks = ""
    }) {
      return post("log_extrusion", {
        operator_name, machine, shift,
        material, material_consumed_kg, output_weight_kg,
        width_mm, thickness_micron, wastage_kg, remarks,
      });
    },

    // ── Cutting log ────────────────────────────────────────
    logCutting({
      operator_name, machine, shift, source_extruder,
      bag_size_cm, bags_produced, wastage_kg,
      client_order = "", remarks = ""
    }) {
      return post("log_cutting", {
        operator_name, machine, shift, source_extruder,
        bag_size_cm, bags_produced, wastage_kg,
        client_order, remarks,
      });
    },

    // ── Dispatch log ───────────────────────────────────────
    logDispatch({
      client, quantity, unit = "pcs",
      vehicle_no, driver_name, challan_no,
      gatekeeper, remarks = ""
    }) {
      return post("log_dispatch", {
        client, quantity, unit,
        vehicle_no, driver_name, challan_no,
        gatekeeper, remarks,
      });
    },

    // ── Attendance ─────────────────────────────────────────
    markAttendance({ employee_name, role, machine, shift, status, in_time, out_time }) {
      return post("mark_attendance", { employee_name, role, machine, shift, status, in_time, out_time });
    },

    getAttendance(date = null) {
      return get("get_attendance", date ? { date } : {});
    },

    // ── Production log ─────────────────────────────────────
    getProduction(date = null) {
      return get("get_production", date ? { date } : {});
    },

    // ── Settings ───────────────────────────────────────────
    getSettings() {
      return get("get_settings");
    },

    saveSettings(settingsObject) {
      return post("save_settings", settingsObject);
    },

  };

  // ============================================================
  //  SECURE AI SETTINGS - Store in Google Sheets only
  //  Never store API keys in localStorage
  // ============================================================

  // In api.js - Add these methods
  async function saveAISettings(provider, apiKey, model, language) {
    return post("save_ai_settings", {
      provider: provider,
      api_key: apiKey,  // This goes to Google Sheets, NOT localStorage
      model: model,
      language: language,
      updated_by: currentUser?.name || "System",
      updated_at: new Date().toISOString()
    });
  }

  async function getAISettings() {
    return get("get_ai_settings");
  }

  // Add to your Apps Script (Code.gs):
  function saveAISettings(data) {
    const sheet = getSheet("AI_Settings");
    // Find or create row for each setting
    const keys = ["provider", "api_key", "model", "language", "updated_by", "updated_at"];
    for (const [key, value] of Object.entries(data)) {
      if (keys.includes(key)) {
        // Update or insert
        updateSetting(sheet, key, value);
      }
    }
    return { ok: true, message: "AI settings saved securely" };
  }

  function getAISettings() {
    const sheet = getSheet("AI_Settings");
    const data = sheet.getDataRange().getValues();
    const settings = {};
    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) settings[data[i][0]] = data[i][1];
    }
    return { ok: true, data: settings };
  }

  function updateSetting(sheet, key, value) {
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === key) {
        sheet.getRange(i + 1, 2).setValue(value);
        sheet.getRange(i + 1, 3).setValue(new Date());
        return;
      }
    }
    sheet.appendRow([key, value, new Date()]);
  }

})();

// ============================================================
//  USAGE EXAMPLES (copy-paste into your app code)
// ============================================================

/*
// Log extrusion work (operator presses Save):
const result = await API.logExtrusion({
  operator_name:       "Ramesh Kumar",
  machine:             "Extruder 1",
  shift:               "Morning",
  material:            "HDPE",
  material_consumed_kg: 150,
  output_weight_kg:    142,
  width_mm:            600,
  thickness_micron:    200,
  wastage_kg:          8,
  remarks:             "Bubble stable",
});
if (result.ok) showToast("Saved ✓");
else showToast("Error: " + result.error);

// Load dashboard on app open:
const dash = await API.getDashboard();
if (dash.ok) {
  document.getElementById("extruded").textContent = dash.data.total_extruded_kg + " kg";
  document.getElementById("bags").textContent     = dash.data.total_bags_cut;
}

// Log a dispatch:
const dispatch = await API.logDispatch({
  client:     "Cipla Ltd.",
  quantity:   2400,
  unit:       "pcs",
  vehicle_no: "MP09AB1234",
  driver_name:"Mohan Lal",
  challan_no: "CH/2026/442",
  gatekeeper: "Raju Singh",
});

// Save company settings:
await API.saveSettings({
  company_name: "PolyPack Industries",
  gstin:        "23ABCDE1234F1Z8",
  tally_ip:     "192.168.1.105",
  tally_port:   "9000",
});
*/
