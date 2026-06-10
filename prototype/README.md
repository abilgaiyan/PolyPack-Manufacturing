# 🏭 PolyPack Manufacturing ERP System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Pages](https://img.shields.io/badge/GitHub-Pages-blue)](https://yourusername.github.io/PolyPack-Manufacturing/)

A complete manufacturing ERP system for polythene/packaging factories with production tracking, inventory management, Tally integration, and AI-powered insights.

## 🚀 Quick Demo

[Live Demo](https://abilgaiyan.github.io/PolyPack-Manufacturing/prototype/)

**Demo Credentials:**
- Manager PIN: `1111`
- Operator PIN: `2222`
- Accountant PIN: `6666`

## ✨ Features

### Production Management
- 🔧 Extrusion logging (output, consumption, wastage)
- ✂️ Cutting & sealing tracking
- 📦 Dispatch management with gatekeeper approval
- 👥 Employee attendance

### Inventory & Stock
- 📊 Real-time stock levels
- ⚠️ Low stock alerts
- 📝 GRN (Goods Receipt Note) entry
- 📈 Material-wise consumption tracking

### Tally Integration
- 🔗 Auto-sync sales orders from Tally
- 📦 Stock synchronization
- 🧾 Party outstanding monitoring
- ⏱️ Configurable sync intervals (15min/30min/1hr)

### AI Assistant (OpenRouter)
- 🤖 Free LLM integration (Gemma 2, Phi-3, Llama 3.2)
- 🌐 Multi-language support (English, Hindi, Hinglish)
- 📊 Context-aware responses (stock, orders, production)

### Security
- 🔐 SHA-256 PIN hashing
- 💾 Session-based authentication
- 👥 Role-based access control (Manager, Operator, Accountant, Gatekeeper)

## 📁 Project Structure
PolyPack-Manufacturing/
├── prototype/ # Working demo (deployed to GitHub Pages)
├── docs/ # Documentation & diagrams
├── src/ # Production source code (coming soon)
└── scripts/ # Utility scripts


## 🛠️ Technology Stack

### Current (Prototype)
- HTML5/CSS3/JavaScript
- LocalStorage with SHA-256 hashing
- Google Apps Script backend
- OpenRouter AI API

### Planned (Production)
- **Frontend:** React/Next.js with Zustand
- **Mobile:** React Native Expo
- **Backend:** .NET Core / Node.js
- **Database:** PostgreSQL / SQLite / Google Sheets
- **State Management:** Zustand + React Query

## 🚦 Getting Started

### Prerequisites
- Modern web browser (Chrome/Firefox/Safari)
- (Optional) Google account for Sheets integration
- (Optional) OpenRouter API key for AI features

### Run Locally
```bash
# Clone the repository
git clone https://github.com/abilgaiyan/PolyPack-Manufacturing.git
cd PolyPack-Manufacturing

# Open the prototype
open prototype/index.html
# or use a local server
npx serve prototype/
