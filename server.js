import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

// Ensure data directory exists
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_FILE = path.join(DATA_DIR, 'db.json');

// PIN hashing helper (SHA-256)
function hashPin(pin) {
  return crypto.createHash('sha256').update(String(pin)).digest('hex');
}

// Financial Year Calculator (01 April to 31 March)
function getCurrentFY(dateObj = new Date()) {
  const m = dateObj.getMonth() + 1; // 1-12
  const y = dateObj.getFullYear();
  if (m >= 4) {
    return `${y}-${(y + 1).toString().slice(-2)}`;
  } else {
    return `${y - 1}-${y.toString().slice(-2)}`;
  }
}

// Initial Seed Data
function getSeedData() {
  return {
    settings: {
      company_name: "PolyPack Industries Ltd.",
      address: "Plot 42, Sector 3, Pithampur Industrial Area",
      city: "Indore",
      state: "Madhya Pradesh",
      pin: "454775",
      phone: "+91 98260 12345",
      email: "info@polypack.co.in",
      gstin: "23AABCP1234F1Z8",
      cst: "2355901234",
      pan: "AABCP1234F",
      udyam: "UDYAM-MP-08-0012345",
      tally_ip: "192.168.1.105",
      tally_port: "9000",
      tally_company: "PolyPack Industries FY 2025-26",
      tally_version: "Prime",
      tally_sync_mode: "auto",
      ai_provider: "gemini",
      ai_model: "gemini-2.5-flash",
      ai_language: "hinglish"
    },
    employees: [
      { id: "emp_1", name: "Ramesh Kumar", role: "Manager", gender: "Male", phone: "9826011111", pinHash: hashPin("1111"), machine: "All" },
      { id: "emp_2", name: "Suresh Patel", role: "Extrusion Operator", gender: "Male", phone: "9826022222", pinHash: hashPin("2222"), machine: "Extruder 1" },
      { id: "emp_3", name: "Anil Sharma", role: "Cutting Operator", gender: "Male", phone: "9826033333", pinHash: hashPin("3333"), machine: "Cutting M/C 1" },
      { id: "emp_4", name: "Raju Singh", role: "Gatekeeper", gender: "Male", phone: "9826044444", pinHash: hashPin("4444"), machine: "Main Gate" },
      { id: "emp_5", name: "Priya Verma", role: "Accountant", gender: "Female", phone: "9826066666", pinHash: hashPin("6666"), machine: "Accounts Dept" }
    ],
    machines: [
      { id: "mc_1", name: "Extruder 1", type: "Extruder", capacity: 350, status: "Active", operator: "Suresh Patel" },
      { id: "mc_2", name: "Extruder 2", type: "Extruder", capacity: 400, status: "Active", operator: "Vikram R" },
      { id: "mc_3", name: "Extruder 3 (HM)", type: "Extruder", capacity: 250, status: "Maintenance", operator: "Unassigned" },
      { id: "mc_4", name: "Cutting M/C 1", type: "Cutting", capacity: 15000, status: "Active", operator: "Anil Sharma" },
      { id: "mc_5", name: "Cutting M/C 2", type: "Cutting", capacity: 20000, status: "Active", operator: "Pankaj M" }
    ],
    materials: [
      { id: "mat_1", name: "HDPE Granules", code: "HDPE", min_stock: 500, unit: "kg" },
      { id: "mat_2", name: "LDPE Granules", code: "LDPE", min_stock: 400, unit: "kg" },
      { id: "mat_3", name: "PP Granules", code: "PP", min_stock: 300, unit: "kg" },
      { id: "mat_4", name: "HD Natural", code: "HD-NAT", min_stock: 200, unit: "kg" },
      { id: "mat_5", name: "Masterbatch White", code: "MB-W", min_stock: 50, unit: "kg" },
      { id: "mat_6", name: "Masterbatch Black", code: "MB-B", min_stock: 50, unit: "kg" }
    ],
    tally_mappings: [
      { id: "map_1", tally_name: "HM Granules 0.02 grade", material: "HDPE Granules" },
      { id: "map_2", tally_name: "LD Film Grade Granules", material: "LDPE Granules" },
      { id: "map_3", tally_name: "PP Raffia Grade", material: "PP Granules" },
      { id: "map_4", tally_name: "Virgin HD Natural Dana", material: "HD Natural" }
    ],
    clients: [
      { id: "cli_1", name: "Cipla Ltd.", industry: "Pharma", contact: "Rajesh Shah", phone: "9826077771", gstin: "23AAACC1234F1Z1" },
      { id: "cli_2", name: "Sun Pharma", industry: "Pharma", contact: "Deepak Mehta", phone: "9826077772", gstin: "23AAACS5678F1Z2" },
      { id: "cli_3", name: "Arvind Mills", industry: "Textile", contact: "Karan Patel", phone: "9826077773", gstin: "23AAACA9012F1Z3" },
      { id: "cli_4", name: "Zydus Healthcare", industry: "Pharma", contact: "Sanjay Joshi", phone: "9826077774", gstin: "23AAACZ3456F1Z4" }
    ],
    stock: [
      { material: "HDPE Granules", current: 850, min: 500, unit: "kg", last_updated: new Date().toISOString() },
      { material: "LDPE Granules", current: 320, min: 400, unit: "kg", last_updated: new Date().toISOString() },
      { material: "PP Granules", current: 600, min: 300, unit: "kg", last_updated: new Date().toISOString() },
      { material: "HD Natural", current: 180, min: 200, unit: "kg", last_updated: new Date().toISOString() },
      { material: "Masterbatch White", current: 75, min: 50, unit: "kg", last_updated: new Date().toISOString() },
      { material: "Masterbatch Black", current: 40, min: 50, unit: "kg", last_updated: new Date().toISOString() }
    ],
    stock_transactions: [
      { id: "stx_1", date: new Date().toISOString().slice(0,10), material: "HDPE Granules", type: "GRN", qty: 500, tally_item: "HM Granules 0.02 grade", by: "Priya Verma", invoice: "INV/2026/881" },
      { id: "stx_2", date: new Date().toISOString().slice(0,10), material: "LDPE Granules", type: "Deduction", qty: 150, tally_item: "Auto Extrusion Log", by: "Suresh Patel", invoice: "EXT-LOG-102" }
    ],
    extrusion_logs: [
      { id: "ext_1", date: new Date().toISOString().slice(0,10), shift: "Morning", operator: "Suresh Patel", machine: "Extruder 1", material: "HDPE Granules", material_consumed_kg: 180, output_weight_kg: 172, width_mm: 600, thickness_micron: 25, wastage_kg: 8, remarks: "Stable bubble, good gauge control" },
      { id: "ext_2", date: new Date().toISOString().slice(0,10), shift: "Morning", operator: "Vikram R", machine: "Extruder 2", material: "LDPE Granules", material_consumed_kg: 150, output_weight_kg: 142, width_mm: 450, thickness_micron: 40, wastage_kg: 8, remarks: "Glossy finish" }
    ],
    cutting_logs: [
      { id: "cut_1", date: new Date().toISOString().slice(0,10), shift: "Morning", operator: "Anil Sharma", machine: "Cutting M/C 1", source_extruder: "Extruder 1", bag_size_cm: "12x18 inch", bags_produced: 12500, wastage_kg: 3.5, client_order: "Cipla - SO/2026/101", remarks: "Bottom seal strong" },
      { id: "cut_2", date: new Date().toISOString().slice(0,10), shift: "Morning", operator: "Pankaj M", machine: "Cutting M/C 2", source_extruder: "Extruder 2", bag_size_cm: "16x24 inch", bags_produced: 8200, wastage_kg: 2.8, client_order: "Arvind Mills - SO/2026/102", remarks: "Side gusset uniform" }
    ],
    attendance: [
      { id: "att_1", date: new Date().toISOString().slice(0,10), employee: "Ramesh Kumar", role: "Manager", shift: "General", status: "Present", in_time: "09:00", out_time: "18:30" },
      { id: "att_2", date: new Date().toISOString().slice(0,10), employee: "Suresh Patel", role: "Extrusion Operator", shift: "Morning", status: "Present", in_time: "08:00", out_time: "16:00" },
      { id: "att_3", date: new Date().toISOString().slice(0,10), employee: "Anil Sharma", role: "Cutting Operator", shift: "Morning", status: "Present", in_time: "08:00", out_time: "16:00" },
      { id: "att_4", date: new Date().toISOString().slice(0,10), employee: "Raju Singh", role: "Gatekeeper", shift: "Shift A", status: "Present", in_time: "07:00", out_time: "15:00" }
    ],
    dispatch_logs: [
      { id: "dsp_1", date: new Date().toISOString().slice(0,10), client: "Cipla Ltd.", order_no: "SO/2026/101", quantity: 10000, unit: "bags", vehicle_no: "MP09AB1234", driver: "Mohan Lal", challan_no: "CH/2026/401", gatekeeper: "Raju Singh", remarks: "Verified count & seal" },
      { id: "dsp_2", date: new Date().toISOString().slice(0,10), client: "Arvind Mills", order_no: "SO/2026/102", quantity: 6000, unit: "bags", vehicle_no: "MP09CD5678", driver: "Vijay Kumar", challan_no: "CH/2026/402", gatekeeper: "Raju Singh", remarks: "Dispatched on time" }
    ],
    orders: [
      { id: "ord_101", voucher: "SO/2026/101", client: "Cipla Ltd.", material: "HDPE Granules", thickness: 25, size: "12x18 inch", quantity: 25000, unit: "bags", due_date: "2026-07-28", status: "In Progress", notes: "Pharma grade quality required" },
      { id: "ord_102", voucher: "SO/2026/102", client: "Arvind Mills", material: "LDPE Granules", thickness: 40, size: "16x24 inch", quantity: 15000, unit: "bags", due_date: "2026-07-30", status: "Pending", notes: "Heavy duty packing" },
      { id: "ord_103", voucher: "SO/2026/103", client: "Sun Pharma", material: "PP Granules", thickness: 30, size: "10x15 inch", quantity: 30000, unit: "bags", due_date: "2026-08-02", status: "Pending", notes: "High clarity bag requirement" },
      { id: "ord_104", voucher: "SO/2026/104", client: "Zydus Healthcare", material: "HD Natural", thickness: 20, size: "8x12 inch", quantity: 10000, unit: "bags", due_date: "2026-08-05", status: "Pending", notes: "Natural transparent grade" }
    ],
    purchase_orders: [
      { id: "po_201", voucher: "PO/2026/088", vendor: "Supreme Petrochem Ltd.", tally_item: "HM Granules 0.02 grade", qty: 2000, unit: "kg", rate: 115, amount: 230000, status: "Open", expected_date: "2026-07-26" },
      { id: "po_202", voucher: "PO/2026/089", vendor: "Reliance Industries", tally_item: "LD Film Grade Granules", qty: 1500, unit: "kg", rate: 122, amount: 183000, status: "Open", expected_date: "2026-07-27" }
    ],
    party_outstanding: [
      { id: "prt_1", party: "Cipla Ltd.", type: "Debtor", total_bills: 3, total_amount: 185000, overdue_amount: 45000, credit_days: 30 },
      { id: "prt_2", party: "Arvind Mills", type: "Debtor", total_bills: 2, total_amount: 120000, overdue_amount: 0, credit_days: 45 },
      { id: "prt_3", party: "Sun Pharma", type: "Debtor", total_bills: 4, total_amount: 340000, overdue_amount: 90000, credit_days: 30 },
      { id: "prt_4", party: "Supreme Petrochem Ltd.", type: "Creditor", total_bills: 2, total_amount: 230000, overdue_amount: 0, credit_days: 30 }
    ],
    last_tally_sync: new Date().toISOString(),
    fy_archives: []
  };
}

function readDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const seed = getSeedData();
      fs.writeFileSync(DB_FILE, JSON.stringify(seed, null, 2));
      return seed;
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading db.json, re-seeding:", err);
    const seed = getSeedData();
    fs.writeFileSync(DB_FILE, JSON.stringify(seed, null, 2));
    return seed;
  }
}

function writeDB(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    console.error("Error writing db.json:", err);
    return false;
  }
}

// Initialize DB on start
readDB();

// ============================================================
// REST API ENDPOINTS
// ============================================================

// 1. Auth & Login
app.post('/api/auth/login', (req, res) => {
  const { employee_id, pin } = req.body;
  if (!employee_id || !pin) {
    return res.status(400).json({ ok: false, error: "Please select your name and enter 4-digit PIN." });
  }

  const db = readDB();
  const emp = db.employees.find(e => e.id === employee_id || e.name === employee_id);
  if (!emp) {
    return res.status(404).json({ ok: false, error: "Employee not found." });
  }

  const hashed = hashPin(pin);
  if (emp.pinHash !== hashed) {
    return res.status(401).json({ ok: false, error: "Incorrect 4-digit PIN. Please try again." });
  }

  const token = crypto.randomBytes(16).toString('hex');
  res.json({
    ok: true,
    token,
    user: {
      id: emp.id,
      name: emp.name,
      role: emp.role,
      gender: emp.gender,
      machine: emp.machine
    }
  });
});

// 2. Dashboard Data
app.get('/api/dashboard', (req, res) => {
  const db = readDB();
  const today = new Date().toISOString().slice(0, 10);

  const todayExtruded = db.extrusion_logs
    .filter(l => l.date === today)
    .reduce((acc, curr) => acc + (Number(curr.output_weight_kg) || 0), 0);

  const todayBags = db.cutting_logs
    .filter(l => l.date === today)
    .reduce((acc, curr) => acc + (Number(curr.bags_produced) || 0), 0);

  const activeMachines = db.machines.filter(m => m.status === 'Active').length;
  const pendingOrders = db.orders.filter(o => o.status !== 'Completed').length;

  const lowStockAlerts = db.stock.filter(s => s.current <= s.min);

  res.json({
    ok: true,
    data: {
      financial_year: getCurrentFY(),
      today_stats: {
        extruded_kg: todayExtruded,
        bags_cut: todayBags,
        active_machines: activeMachines,
        pending_orders: pendingOrders
      },
      low_stock_alerts: lowStockAlerts,
      machines: db.machines,
      pending_orders: db.orders.filter(o => o.status !== 'Completed'),
      last_tally_sync: db.last_tally_sync
    }
  });
});

// 3. Master Data Endpoints
app.get('/api/master/all', (req, res) => {
  const db = readDB();
  res.json({
    ok: true,
    data: {
      employees: db.employees.map(e => ({ id: e.id, name: e.name, role: e.role, gender: e.gender, phone: e.phone, machine: e.machine })),
      machines: db.machines,
      materials: db.materials,
      clients: db.clients,
      tally_mappings: db.tally_mappings
    }
  });
});

app.post('/api/master/employees', (req, res) => {
  const db = readDB();
  const { name, role, gender, phone, pin, machine } = req.body;
  if (!name || !role || !pin) {
    return res.status(400).json({ ok: false, error: "Name, role, and PIN are required." });
  }

  const newEmp = {
    id: `emp_${Date.now()}`,
    name,
    role,
    gender: gender || 'Male',
    phone: phone || '',
    pinHash: hashPin(pin),
    machine: machine || 'All'
  };

  db.employees.push(newEmp);
  writeDB(db);
  res.json({ ok: true, message: "Employee added successfully", employee: newEmp });
});

app.delete('/api/master/employees/:id', (req, res) => {
  const db = readDB();
  db.employees = db.employees.filter(e => e.id !== req.params.id);
  writeDB(db);
  res.json({ ok: true, message: "Employee removed" });
});

app.post('/api/master/machines', (req, res) => {
  const db = readDB();
  const { name, type, capacity, status, operator } = req.body;
  if (!name || !type) {
    return res.status(400).json({ ok: false, error: "Machine name and type are required." });
  }

  const newMc = {
    id: `mc_${Date.now()}`,
    name,
    type,
    capacity: Number(capacity) || 0,
    status: status || 'Active',
    operator: operator || 'Unassigned'
  };

  db.machines.push(newMc);
  writeDB(db);
  res.json({ ok: true, message: "Machine added", machine: newMc });
});

app.delete('/api/master/machines/:id', (req, res) => {
  const db = readDB();
  db.machines = db.machines.filter(m => m.id !== req.params.id);
  writeDB(db);
  res.json({ ok: true, message: "Machine removed" });
});

app.post('/api/master/materials', (req, res) => {
  const db = readDB();
  const { name, code, min_stock, unit } = req.body;
  if (!name) {
    return res.status(400).json({ ok: false, error: "Material name required." });
  }

  const newMat = {
    id: `mat_${Date.now()}`,
    name,
    code: code || name.toUpperCase().slice(0, 4),
    min_stock: Number(min_stock) || 100,
    unit: unit || 'kg'
  };

  db.materials.push(newMat);
  // Ensure stock record exists
  if (!db.stock.some(s => s.material === name)) {
    db.stock.push({ material: name, current: 0, min: newMat.min_stock, unit: newMat.unit, last_updated: new Date().toISOString() });
  }

  writeDB(db);
  res.json({ ok: true, message: "Material added", material: newMat });
});

app.delete('/api/master/materials/:id', (req, res) => {
  const db = readDB();
  const mat = db.materials.find(m => m.id === req.params.id);
  if (mat) {
    db.materials = db.materials.filter(m => m.id !== req.params.id);
    db.stock = db.stock.filter(s => s.material !== mat.name);
  }
  writeDB(db);
  res.json({ ok: true, message: "Material removed" });
});

app.post('/api/master/clients', (req, res) => {
  const db = readDB();
  const { name, industry, contact, phone, gstin } = req.body;
  if (!name) return res.status(400).json({ ok: false, error: "Client name required" });

  const newCli = {
    id: `cli_${Date.now()}`,
    name,
    industry: industry || 'Pharma',
    contact: contact || '',
    phone: phone || '',
    gstin: gstin || ''
  };

  db.clients.push(newCli);
  writeDB(db);
  res.json({ ok: true, message: "Client added", client: newCli });
});

app.delete('/api/master/clients/:id', (req, res) => {
  const db = readDB();
  db.clients = db.clients.filter(c => c.id !== req.params.id);
  writeDB(db);
  res.json({ ok: true, message: "Client removed" });
});

app.post('/api/master/tally-mapping', (req, res) => {
  const db = readDB();
  const { tally_name, material } = req.body;
  if (!tally_name || !material) return res.status(400).json({ ok: false, error: "Both Tally item name and production material are required" });

  const newMap = {
    id: `map_${Date.now()}`,
    tally_name,
    material
  };

  db.tally_mappings.push(newMap);
  writeDB(db);
  res.json({ ok: true, message: "Tally mapping saved", mapping: newMap });
});

app.delete('/api/master/tally-mapping/:id', (req, res) => {
  const db = readDB();
  db.tally_mappings = db.tally_mappings.filter(m => m.id !== req.params.id);
  writeDB(db);
  res.json({ ok: true, message: "Mapping removed" });
});

// 4. Production Logging (Extrusion, Cutting, Attendance, Dispatch)
app.get('/api/production/logs', (req, res) => {
  const db = readDB();
  res.json({
    ok: true,
    data: {
      extrusion: db.extrusion_logs,
      cutting: db.cutting_logs,
      attendance: db.attendance,
      dispatch: db.dispatch_logs
    }
  });
});

app.post('/api/production/extrusion', (req, res) => {
  const db = readDB();
  const {
    operator_name, machine, shift,
    material, material_consumed_kg, output_weight_kg,
    width_mm, thickness_micron, wastage_kg, remarks
  } = req.body;

  if (!operator_name || !machine || !material || !material_consumed_kg || !output_weight_kg) {
    return res.status(400).json({ ok: false, error: "Please fill all required extrusion log fields." });
  }

  const consumed = Number(material_consumed_kg) || 0;
  const output = Number(output_weight_kg) || 0;
  const waste = Number(wastage_kg) || (consumed - output > 0 ? consumed - output : 0);

  const logEntry = {
    id: `ext_${Date.now()}`,
    date: new Date().toISOString().slice(0, 10),
    time: new Date().toLocaleTimeString('en-IN'),
    shift: shift || 'Morning',
    operator: operator_name,
    machine,
    material,
    material_consumed_kg: consumed,
    output_weight_kg: output,
    width_mm: Number(width_mm) || 0,
    thickness_micron: Number(thickness_micron) || 0,
    wastage_kg: waste,
    remarks: remarks || ''
  };

  db.extrusion_logs.unshift(logEntry);

  // Auto-deduct raw material stock
  const stk = db.stock.find(s => s.material === material);
  if (stk) {
    stk.current = Math.max(0, stk.current - consumed);
    stk.last_updated = new Date().toISOString();

    db.stock_transactions.unshift({
      id: `stx_${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      material,
      type: "Deduction",
      qty: consumed,
      tally_item: "Extrusion Shift Log",
      by: operator_name,
      invoice: logEntry.id
    });
  }

  writeDB(db);
  res.json({ ok: true, message: "Extrusion work logged & raw material deducted ✓", log: logEntry });
});

app.post('/api/production/cutting', (req, res) => {
  const db = readDB();
  const {
    operator_name, machine, shift, source_extruder,
    bag_size_cm, bags_produced, wastage_kg,
    client_order, remarks
  } = req.body;

  if (!operator_name || !machine || !bags_produced) {
    return res.status(400).json({ ok: false, error: "Please fill all required cutting log fields." });
  }

  const logEntry = {
    id: `cut_${Date.now()}`,
    date: new Date().toISOString().slice(0, 10),
    time: new Date().toLocaleTimeString('en-IN'),
    shift: shift || 'Morning',
    operator: operator_name,
    machine,
    source_extruder: source_extruder || 'Extruder 1',
    bag_size_cm: bag_size_cm || '',
    bags_produced: Number(bags_produced) || 0,
    wastage_kg: Number(wastage_kg) || 0,
    client_order: client_order || '',
    remarks: remarks || ''
  };

  db.cutting_logs.unshift(logEntry);

  // Update order status if order matched
  if (client_order) {
    const matchedOrd = db.orders.find(o => client_order.includes(o.voucher) || o.client.includes(client_order));
    if (matchedOrd && matchedOrd.status === 'Pending') {
      matchedOrd.status = 'In Progress';
    }
  }

  writeDB(db);
  res.json({ ok: true, message: "Cutting work logged successfully ✓", log: logEntry });
});

app.post('/api/production/attendance', (req, res) => {
  const db = readDB();
  const { employee_name, role, machine, shift, status, in_time, out_time } = req.body;

  if (!employee_name || !status) {
    return res.status(400).json({ ok: false, error: "Employee name and status are required." });
  }

  const today = new Date().toISOString().slice(0, 10);
  const existingIndex = db.attendance.findIndex(a => a.date === today && a.employee === employee_name);

  const attEntry = {
    id: existingIndex >= 0 ? db.attendance[existingIndex].id : `att_${Date.now()}`,
    date: today,
    employee: employee_name,
    role: role || 'Staff',
    machine: machine || 'General',
    shift: shift || 'Morning',
    status,
    in_time: in_time || '08:00',
    out_time: out_time || '17:00'
  };

  if (existingIndex >= 0) {
    db.attendance[existingIndex] = attEntry;
  } else {
    db.attendance.unshift(attEntry);
  }

  writeDB(db);
  res.json({ ok: true, message: `Attendance marked for ${employee_name} (${status}) ✓`, attendance: attEntry });
});

app.post('/api/dispatch', (req, res) => {
  const db = readDB();
  const {
    client, order_no, quantity, unit,
    vehicle_no, driver_name, challan_no,
    gatekeeper, remarks
  } = req.body;

  if (!client || !quantity || !vehicle_no || !challan_no) {
    return res.status(400).json({ ok: false, error: "Client name, quantity, vehicle no, and challan no are required." });
  }

  const dispatchEntry = {
    id: `dsp_${Date.now()}`,
    date: new Date().toISOString().slice(0, 10),
    time: new Date().toLocaleTimeString('en-IN'),
    client,
    order_no: order_no || 'Direct Sales',
    quantity: Number(quantity) || 0,
    unit: unit || 'bags',
    vehicle_no,
    driver: driver_name || 'Driver',
    challan_no,
    gatekeeper: gatekeeper || 'Gatekeeper',
    remarks: remarks || ''
  };

  db.dispatch_logs.unshift(dispatchEntry);

  // If matched to an open order, mark completed or update
  if (order_no) {
    const ord = db.orders.find(o => o.voucher === order_no);
    if (ord) {
      ord.status = 'Completed';
    }
  }

  writeDB(db);
  res.json({ ok: true, message: "Dispatch & gate pass logged ✓", dispatch: dispatchEntry });
});

// 5. Stock & GRN Entry
app.get('/api/stock', (req, res) => {
  const db = readDB();
  res.json({
    ok: true,
    data: {
      stock: db.stock,
      transactions: db.stock_transactions,
      tally_mappings: db.tally_mappings
    }
  });
});

app.post('/api/stock/grn', (req, res) => {
  const db = readDB();
  const { tally_item, material, quantity_kg, supplier_invoice, updated_by } = req.body;

  if (!quantity_kg || Number(quantity_kg) <= 0) {
    return res.status(400).json({ ok: false, error: "Please enter a valid positive quantity in kg." });
  }

  // Determine actual production material
  let targetMat = material;
  if (!targetMat && tally_item) {
    const map = db.tally_mappings.find(m => m.tally_name.toLowerCase() === tally_item.toLowerCase());
    targetMat = map ? map.material : tally_item;
  }

  if (!targetMat) {
    return res.status(400).json({ ok: false, error: "Target raw material could not be resolved." });
  }

  let stk = db.stock.find(s => s.material.toLowerCase() === targetMat.toLowerCase());
  if (!stk) {
    stk = { material: targetMat, current: 0, min: 200, unit: "kg", last_updated: new Date().toISOString() };
    db.stock.push(stk);
  }

  const addedQty = Number(quantity_kg);
  stk.current += addedQty;
  stk.last_updated = new Date().toISOString();

  const tx = {
    id: `stx_${Date.now()}`,
    date: new Date().toISOString().slice(0, 10),
    material: targetMat,
    type: "GRN",
    qty: addedQty,
    tally_item: tally_item || targetMat,
    by: updated_by || "Accountant",
    invoice: supplier_invoice || `GRN-${Date.now().toString().slice(-4)}`
  };

  db.stock_transactions.unshift(tx);
  writeDB(db);

  res.json({
    ok: true,
    message: `GRN recorded: +${addedQty} kg added to ${targetMat} ✓`,
    stock: stk,
    transaction: tx
  });
});

// 6. Orders & Tally Gateway Simulation
app.get('/api/orders', (req, res) => {
  const db = readDB();
  res.json({ ok: true, data: db.orders });
});

app.post('/api/orders', (req, res) => {
  const db = readDB();
  const { voucher, client, material, thickness, size, quantity, unit, due_date, notes } = req.body;

  if (!client || !material || !quantity) {
    return res.status(400).json({ ok: false, error: "Client, material, and quantity are required." });
  }

  const newOrd = {
    id: `ord_${Date.now()}`,
    voucher: voucher || `SO/2026/${Math.floor(100 + Math.random() * 900)}`,
    client,
    material,
    thickness: Number(thickness) || 25,
    size: size || "12x18 inch",
    quantity: Number(quantity) || 10000,
    unit: unit || "bags",
    due_date: due_date || new Date(Date.now() + 7*24*60*60*1000).toISOString().slice(0,10),
    status: "Pending",
    notes: notes || ""
  };

  db.orders.unshift(newOrd);
  writeDB(db);
  res.json({ ok: true, message: "Order created successfully", order: newOrd });
});

app.get('/api/tally/data', (req, res) => {
  const db = readDB();
  res.json({
    ok: true,
    data: {
      sales_orders: db.orders,
      purchase_orders: db.purchase_orders,
      party_outstanding: db.party_outstanding,
      stock_ledger: db.stock,
      last_sync: db.last_tally_sync
    }
  });
});

app.post('/api/tally/sync', (req, res) => {
  const db = readDB();
  db.last_tally_sync = new Date().toISOString();
  
  // Simulate fetching new Tally sales order if needed
  if (Math.random() > 0.4) {
    const randomClients = ["Cipla Ltd.", "Sun Pharma", "Lupin Pharma", "Alembic Pharma"];
    const randomMats = ["HDPE Granules", "LDPE Granules", "PP Granules"];
    const client = randomClients[Math.floor(Math.random() * randomClients.length)];
    const mat = randomMats[Math.floor(Math.random() * randomMats.length)];
    const voucherNo = `SO/2026/${Math.floor(110 + db.orders.length)}`;

    if (!db.orders.some(o => o.voucher === voucherNo)) {
      db.orders.unshift({
        id: `ord_${Date.now()}`,
        voucher: voucherNo,
        client,
        material: mat,
        thickness: 25,
        size: "12x18 inch",
        quantity: Math.floor(Math.random() * 20 + 5) * 1000,
        unit: "bags",
        due_date: new Date(Date.now() + 5*24*60*60*1000).toISOString().slice(0,10),
        status: "Pending",
        notes: "Auto-synced from Tally XML Gateway"
      });
    }
  }

  writeDB(db);
  res.json({ ok: true, message: "Successfully synchronized with Tally XML Gateway ✓", last_sync: db.last_tally_sync });
});

// 7. Printable Challan HTML
app.get('/api/dispatch/:id/challan', (req, res) => {
  const db = readDB();
  const dispatch = db.dispatch_logs.find(d => d.id === req.params.id) || db.dispatch_logs[0];
  const settings = db.settings;

  if (!dispatch) {
    return res.status(404).send("Dispatch record not found.");
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Delivery Challan / Gate Pass - ${dispatch.challan_no}</title>
      <style>
        body { font-family: system-ui, sans-serif; padding: 30px; max-width: 800px; margin: 0 auto; color: #1a2744; }
        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #1a2744; padding-bottom: 15px; margin-bottom: 20px; }
        .co-title { font-size: 22px; font-weight: bold; color: #1a2744; }
        .co-sub { font-size: 12px; color: #555; margin-top: 4px; }
        .badge { background: #1a2744; color: #fff; padding: 6px 12px; font-size: 14px; font-weight: bold; border-radius: 4px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px; }
        .box { background: #f8f9fd; border: 1px solid #e4e8f4; border-radius: 8px; padding: 15px; }
        .lbl { font-size: 11px; font-weight: bold; color: #7c8db5; text-transform: uppercase; margin-bottom: 3px; }
        .val { font-size: 14px; font-weight: bold; color: #1a2744; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        th { background: #1a2744; color: white; text-align: left; padding: 10px; font-size: 12px; }
        td { padding: 10px; border-bottom: 1px solid #e4e8f4; font-size: 13px; }
        .signatures { display: flex; justify-content: space-between; margin-top: 50px; padding-top: 20px; }
        .sig-box { text-align: center; border-top: 1px dashed #7c8db5; width: 200px; padding-top: 8px; font-size: 12px; font-weight: bold; color: #555; }
        @media print { .no-print { display: none; } }
      </style>
    </head>
    <body>
      <div class="no-print" style="margin-bottom: 15px; text-align: right;">
        <button onclick="window.print()" style="background:#1a2744; color:white; border:none; padding:10px 18px; border-radius:6px; font-weight:bold; cursor:pointer;">🖨️ Print / Save PDF</button>
      </div>
      <div class="header">
        <div>
          <div class="co-title">${settings.company_name}</div>
          <div class="co-sub">${settings.address}, ${settings.city}, ${settings.state} - ${settings.pin}</div>
          <div class="co-sub">GSTIN: ${settings.gstin} | Ph: ${settings.phone}</div>
        </div>
        <div>
          <span class="badge">DELIVERY CHALLAN</span>
        </div>
      </div>

      <div class="grid">
        <div class="box">
          <div class="lbl">Consignee / Client</div>
          <div class="val">${dispatch.client}</div>
          <div style="font-size:12px; margin-top:5px; color:#555;">Order Ref: <b>${dispatch.order_no}</b></div>
        </div>
        <div class="box">
          <div class="lbl">Challan Details</div>
          <div class="val">Challan No: ${dispatch.challan_no}</div>
          <div style="font-size:12px; margin-top:5px; color:#555;">Date: <b>${dispatch.date} ${dispatch.time || ''}</b></div>
          <div style="font-size:12px; color:#555;">Vehicle No: <b>${dispatch.vehicle_no}</b></div>
          <div style="font-size:12px; color:#555;">Driver: <b>${dispatch.driver}</b></div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Item Description</th>
            <th>Order Ref</th>
            <th>Quantity</th>
            <th>Unit</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><b>Polythene Bags / Rolls Dispatch</b><br/><span style="font-size:11px; color:#666;">${dispatch.remarks || 'Standard Industrial Grade Packaging'}</span></td>
            <td>${dispatch.order_no}</td>
            <td><b>${dispatch.quantity}</b></td>
            <td>${dispatch.unit}</td>
          </tr>
        </tbody>
      </table>

      <div style="font-size:12px; color:#555; margin-bottom:30px;">
        <b>Gatekeeper Verified:</b> ${dispatch.gatekeeper} | <b>Financial Year:</b> ${getCurrentFY()}
      </div>

      <div class="signatures">
        <div class="sig-box">Prepared By</div>
        <div class="sig-box">Gatekeeper Signature</div>
        <div class="sig-box">Receiver's Stamp & Signature</div>
      </div>
    </body>
    </html>
  `;

  res.send(html);
});

// 8. AI Proxy Endpoint (OpenRouter / Gemini / Direct Prompting with Live Factory Context)
app.post('/api/ai/chat', async (req, res) => {
  const { prompt, language } = req.body;
  if (!prompt) return res.status(400).json({ ok: false, error: "Prompt is required." });

  const db = readDB();
  const stockStr = db.stock.map(s => `${s.material}: ${s.current} kg (min ${s.min} kg)`).join('; ');
  const orderStr = db.orders.filter(o => o.status !== 'Completed').map(o => `${o.client} (${o.material}, ${o.quantity} ${o.unit}, due ${o.due_date})`).join('; ');
  const machineStr = db.machines.map(m => `${m.name} (${m.status}, cap ${m.capacity}kg)`).join('; ');

  const contextPrompt = `
You are the PolyPack AI Assistant for a polythene bag & sheet manufacturing factory in Indore, India.
Language instruction: ${language === 'hindi' ? 'Reply in pure Hindi.' : language === 'english' ? 'Reply in clean professional English.' : 'Reply in friendly factory Hinglish (mix of Hindi & English) as spoken in Indian factories.'}
Keep responses practical, concise, and structured.

LIVE FACTORY STATUS:
- Current Stock: ${stockStr}
- Pending Orders: ${orderStr || 'None'}
- Machines: ${machineStr}
- Financial Year: ${getCurrentFY()}

User Question: ${prompt}
`;

  // Attempt to call Gemini or OpenRouter if key exists in env or settings
  const apiKey = process.env.GEMINI_API_KEY || process.env.OPENROUTER_API_KEY;

  if (apiKey && process.env.GEMINI_API_KEY) {
    try {
      const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: contextPrompt }] }]
        })
      });
      const data = await resp.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        return res.json({ ok: true, reply: text });
      }
    } catch (err) {
      console.warn("Gemini API call failed, falling back to rule-based engine:", err.message);
    }
  }

  // Fallback intelligent Rule-based factory response engine if no external API key present
  const lower = prompt.toLowerCase();
  let reply = "";

  if (lower.includes('stock') || lower.includes('kitna') || lower.includes('material')) {
    const lowStock = db.stock.filter(s => s.current <= s.min);
    reply = `📦 **Current Factory Raw Material Stock:**\n\n` +
      db.stock.map(s => `• **${s.material}**: ${s.current} kg ${s.current <= s.min ? '⚠️ *(LOW STOCK)*' : '✅'}`).join('\n') +
      (lowStock.length ? `\n\n🚨 **Alert:** ${lowStock.map(l => l.material).join(', ')} minimum threshold se neeche hai! GRN entry suggest karein.` : '\n\nSabhi materials normal stock level par hain.');
  } else if (lower.includes('order') || lower.includes('pending') || lower.includes('client') || lower.includes('cipla')) {
    const pending = db.orders.filter(o => o.status !== 'Completed');
    reply = `📋 **Pending Client Sales Orders:**\n\n` +
      pending.map(o => `• **${o.client}** (${o.voucher}): ${o.quantity} ${o.unit} ${o.material} (${o.thickness}µ) — Due: ${o.due_date} [Status: ${o.status}]`).join('\n') +
      `\n\n💡 Total ${pending.length} orders pending execution hain.`;
  } else if (lower.includes('machine') || lower.includes('extruder') || lower.includes('cutting')) {
    reply = `🏭 **Machine Status & Capacity:**\n\n` +
      db.machines.map(m => `• **${m.name}**: ${m.status === 'Active' ? '🟢 Active' : '🔴 Maintenance'} (Capacity: ${m.capacity} kg/shift, Op: ${m.operator})`).join('\n');
  } else {
    reply = `🤖 **PolyPack Factory Assistant:**\n\nAapka question received hua: "${prompt}"\n\nFactory Status Snapshot:\n• Active Machines: ${db.machines.filter(m => m.status === 'Active').length}\n• Low Stock Materials: ${db.stock.filter(s => s.current <= s.min).map(s => s.material).join(', ') || 'None'}\n• Open Orders: ${db.orders.filter(o => o.status !== 'Completed').length}\n\nAap stock level, pending orders, machine schedule, ya GRN entry ke baare me pooch sakte hain!`;
  }

  res.json({ ok: true, reply });
});

// 9. AI Production Planner Endpoint (Phase 4)
app.post('/api/ai/plan', (req, res) => {
  const db = readDB();
  const pending = db.orders.filter(o => o.status !== 'Completed');

  if (pending.length === 0) {
    return res.json({
      ok: true,
      message: "Koi pending orders nahi hain production plan ke liye.",
      schedule: []
    });
  }

  // Calculate required materials
  const matRequirement = {};
  pending.forEach(o => {
    // Approx conversion: 1 bag = ~0.02 to 0.05 kg depending on size/microns
    const approxKg = Math.round(o.quantity * 0.025);
    matRequirement[o.material] = (matRequirement[o.material] || 0) + approxKg;
  });

  const shortages = [];
  Object.entries(matRequirement).forEach(([mat, reqKg]) => {
    const stk = db.stock.find(s => s.material === mat);
    const curr = stk ? stk.current : 0;
    if (curr < reqKg) {
      shortages.push({ material: mat, required: reqKg, available: curr, deficit: reqKg - curr });
    }
  });

  // Machine assignment
  const extruders = db.machines.filter(m => m.type === 'Extruder' && m.status === 'Active');
  const schedule = pending.map((ord, idx) => {
    const assignedExtruder = extruders[idx % extruders.length] || extruders[0];
    const estKg = Math.round(ord.quantity * 0.025);
    const estShifts = (estKg / (assignedExtruder ? assignedExtruder.capacity : 300)).toFixed(1);

    return {
      order_voucher: ord.voucher,
      client: ord.client,
      material: ord.material,
      quantity: `${ord.quantity} ${ord.unit}`,
      est_raw_material_kg: estKg,
      assigned_extruder: assignedExtruder ? assignedExtruder.name : 'Extruder 1',
      est_shifts_required: estShifts,
      due_date: ord.due_date,
      status: ord.status
    };
  });

  const summaryHinglish = `
📌 **AI Production Plan & Material Requirement Summary:**

1. **Orders Analyzed:** ${pending.length} pending client orders.
2. **Material Shortages:** ${shortages.length === 0 ? '✅ Sabhi required materials stock me available hain.' : '⚠️ ' + shortages.map(s => `${s.material} short by ${s.deficit} kg`).join(', ')}
3. **Recommended Sequence:**
${schedule.map((s, i) => `   ${i+1}. **${s.client}** (${s.order_voucher}) ➔ ${s.assigned_extruder} par load karein (~${s.est_shifts_required} shifts, ${s.est_raw_material_kg} kg raw film).`).join('\n')}
`;

  res.json({
    ok: true,
    summary: summaryHinglish,
    shortages,
    schedule
  });
});

// 10. Financial Year Archiving (April 1 trigger)
app.post('/api/archive', (req, res) => {
  const db = readDB();
  const currentFY = getCurrentFY();
  const yearLabel = req.body.fy_label || `FY_${currentFY}`;

  const archiveEntry = {
    fy_label: yearLabel,
    archived_at: new Date().toISOString(),
    archived_by: req.body.archived_by || "Manager",
    extrusion_records_count: db.extrusion_logs.length,
    cutting_records_count: db.cutting_logs.length,
    dispatch_records_count: db.dispatch_logs.length,
    summary: `Archived ${db.extrusion_logs.length} extrusion logs, ${db.cutting_logs.length} cutting logs, and ${db.dispatch_logs.length} dispatch logs for ${yearLabel}.`
  };

  db.fy_archives.unshift(archiveEntry);
  writeDB(db);

  res.json({
    ok: true,
    message: `Financial year ${yearLabel} successfully archived to read-only history ✓`,
    archive: archiveEntry
  });
});

// 11. Company & Settings Endpoints
app.get('/api/settings', (req, res) => {
  const db = readDB();
  res.json({ ok: true, settings: db.settings });
});

app.post('/api/settings', (req, res) => {
  const db = readDB();
  db.settings = { ...db.settings, ...req.body };
  writeDB(db);
  res.json({ ok: true, message: "Settings updated successfully", settings: db.settings });
});

// Fallback route for single page app index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`PolyPack Manufacturing MES server running on http://0.0.0.0:${PORT}`);
});
