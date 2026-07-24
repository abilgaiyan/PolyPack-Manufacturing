# 🏭 PolyPack Manufacturing Execution System (MES) & ERP Helper

[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-v4.19-blue.svg)](https://expressjs.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A mobile-first Manufacturing Execution System (MES) and ERP helper app built for polythene sheet and bag manufacturing plants. **PolyPack** runs on the factory floor to log production, manage inventory, generate printable delivery challans, and coordinate machine schedules — seamlessly working alongside **Tally Prime** for accounting and billing.

---

## 🚀 Quick Start

### 1. Installation & Local Run

```bash
# Clone the repository
git clone https://github.com/abilgaiyan/PolyPack-Manufacturing.git
cd PolyPack-Manufacturing

# Install dependencies
npm install

# Start the Express MES Server
npm start
```

The application will be live at: **`http://localhost:3000`**

### 2. Demo Credentials & Role Access

| Role | Employee Name | PIN Code | Primary Responsibilities |
|---|---|---|---|
| **Manager** | Ramesh Kumar | `1111` | Full Dashboard, Production Plan, Reports, Master Data, FY Archive |
| **Extrusion Operator** | Suresh Patel | `2222` | Log Extrusion shifts, output weight, gauge, raw material consumption |
| **Cutting Operator** | Anil Sharma | `3333` | Log Bags cut, sizes, client order assignments, wastage |
| **Gatekeeper** | Raju Singh | `4444` | Gate entry/exit, vehicle dispatch logging & printable delivery challans |
| **Accountant** | Priya Verma | `6666` | Tally order sync, GRN stock receipts, party outstanding overview |

---

## ✨ Key Features & Core Modules

### 1. Role-Based Access Control (RBAC) & PIN Login
- Ultra-fast 4-digit PIN authentication with **SHA-256 password hashing**.
- Role-specific UI visibility and action permissions (Manager, Operators, Gatekeeper, Accountant).

### 2. Production Logging
- **Extrusion Logging**: Machine selection, operator, shift, raw material consumed (kg), film output weight (kg), width (mm), thickness (microns), and wastage. Automatically deducts consumed raw material from live stock.
- **Cutting & Sealing Logging**: Source extruder roll, bag size (inches/cm), total bags produced, client order association, and wastage tracking.
- **Attendance & Shift Logs**: Employee clock-in/out, shift assignment, and machine allocation.

### 3. Inventory & Goods Receipt Note (GRN)
- **Real-Time Stock Tracking**: Live balances for HDPE, LDPE, PP, HD Natural, and Masterbatch colors with threshold minimum alerts.
- **Tally Item Mapping**: Automatically converts vendor Tally purchase names (e.g. *"HM Granules 0.02 grade"*) to factory raw material categories (e.g. *"HDPE Granules"*).
- **Stock Deductions & Audit Logs**: Immutable transaction logs for every GRN addition and extrusion deduction.

### 4. Dispatch & Printable Delivery Challan
- Vehicle dispatch tracking with driver details, gatekeeper verification, and challan numbers.
- **Printable Gate Pass / Delivery Challan**: One-click printable HTML/PDF delivery challan formatted for factory gate verification and client signatures.

### 5. Tally Prime / ERP 9 Integration
- Sync sales orders, purchase orders, and stock ledgers via Tally XML Gateway.
- Auto-sync job support and party outstanding balance tracker.

### 6. AI Factory Assistant & Production Planner
- **Context-Aware Factory Chat**: Powered by server-side Gemini 2.5 Flash / OpenRouter with intelligent rule-based fallbacks. Responds in **Hinglish**, **Hindi**, or **English**.
- **AI Production Planner**: Calculates exact raw material requirements across all open sales orders, flags inventory shortages, and generates day-wise machine assignment schedules.

### 7. Financial Year (FY) Archiving
- Financial Year cycle: **01 April to 31 March**.
- Automatic FY archive trigger (April 1 at 1 AM) moves completed year data to read-only archive tables while preserving master records.

---

## 🛠️ Technology Stack

```
   PolyPack Architecture
   ─────────────────────────────────────────────────────────────
   📱 Mobile-First PWA Frontend (HTML5, Tailwind CSS, JS)
                  │
                  ▼ REST API
   ⚡ Express.js Server (Node.js REST Engine & Server-Side Proxies)
                  │
     ┌────────────┼────────────┬────────────────┐
     ▼            ▼            ▼                ▼
  📁 JSON DB   🤖 Gemini AI  📊 Tally Gateway  📅 FY Archiver
 (data/db.json) Proxy Server (XML Gateway 9000) (April 1 Job)
```

- **Runtime & Server**: Node.js + Express.js (`server.js`)
- **Frontend**: PWA-ready HTML5, Tailwind CSS, Javascript Client API (`api.js`)
- **Persistence Layer**: JSON file store (`data/db.json`) initialized with full factory seed data, structured for easy PostgreSQL binding.
- **AI Engine**: Integrated server-side Gemini API / OpenRouter proxy with live factory context injection.
- **Microservices Shell**: .NET Aspire solution shell (`PolyPack.slnx`, `PolyPack.AppHost`) for future .NET 10 microservices evolution.

---

## 📡 REST API Summary

| Endpoint | Method | Description |
|---|---|---|
| `/api/auth/login` | `POST` | Authenticates employee via PIN and returns session token |
| `/api/dashboard` | `GET` | Fetches live KPI metrics, low stock alerts, and open orders |
| `/api/master/all` | `GET` | Returns employees, machines, materials, clients, and Tally mappings |
| `/api/production/extrusion` | `POST` | Logs extrusion shift, output weight, and auto-deducts stock |
| `/api/production/cutting` | `POST` | Logs bag cutting output and updates order progress |
| `/api/production/attendance` | `POST` | Records daily employee attendance and shift info |
| `/api/dispatch` | `POST` | Logs vehicle dispatch and gate pass details |
| `/api/dispatch/:id/challan` | `GET` | Renders a printable Delivery Challan / Gate Pass HTML |
| `/api/stock/grn` | `POST` | Records Goods Receipt Note and maps Tally item to raw material |
| `/api/tally/sync` | `POST` | Synchronizes sales orders and stock ledger with Tally XML Gateway |
| `/api/ai/chat` | `POST` | Interrogates factory context with natural language queries |
| `/api/ai/plan` | `POST` | Computes material shortages and assigns machine schedules |
| `/api/archive` | `POST` | Archives financial year data to historical records |

---

## 🗺️ Microservices Migration Roadmap

For full details on the phased migration from Node.js Express to a **.NET 10 Microservices + PostgreSQL + RabbitMQ + Model Context Protocol (MCP)** cloud architecture, please refer to:

👉 **[ROADMAP.md](./ROADMAP.md)**

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
