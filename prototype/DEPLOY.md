# PolyPack — Deployment Guide
## From zero to live system in ~20 minutes

---

## What you get after this setup

- Google Sheet with 8 tabs (auto-created)
- Web API that your mobile app talks to
- Tally auto-sync every 30 minutes
- All operator logs saved to the sheet instantly

---

## Step 1 — Create the Google Sheet (2 min)

1. Go to https://sheets.google.com
2. Click **Blank** to create a new sheet
3. Rename it: click "Untitled spreadsheet" → type **PolyPack Manufacturing**
4. Copy the Sheet ID from the URL:
   `https://docs.google.com/spreadsheets/d/`**THIS_PART_HERE**`/edit`
5. Save this ID — you'll need it later

---

## Step 2 — Open Apps Script (1 min)

1. In your Google Sheet, click **Extensions → Apps Script**
2. A new tab opens — this is your script editor
3. Delete the default `function myFunction()` code

---

## Step 3 — Add the script files (5 min)

### File 1: Code.gs
1. In the editor, you'll see "Code.gs" on the left panel
2. Paste the entire contents of **Code.gs** into it

### File 2: TallySync.gs
1. Click the **+** button next to "Files" on the left
2. Choose **Script**
3. Name it **TallySync**
4. Paste the entire contents of **TallySync.gs** into it

---

## Step 4 — Run one-time setup (2 min)

1. In the editor, select function **setupAllSheets** from the dropdown at the top
2. Click ▶ **Run**
3. It will ask for permissions — click **Review permissions → Allow**
4. Wait ~10 seconds
5. You will see: ✅ All sheets created and seeded successfully!

Go back to your Google Sheet — you'll see 8 new tabs created with headers and sample data.

---

## Step 5 — Deploy as Web App (3 min)

1. Click **Deploy → New deployment**
2. Click the gear icon ⚙ next to "Type" → choose **Web app**
3. Fill in:
   - Description: `PolyPack API v1`
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Click **Deploy**
5. Copy the **Web app URL** — it looks like:
   `https://script.google.com/macros/s/AKfyc.../exec`
6. **Save this URL** — this is your API endpoint

---

## Step 6 — Connect the mobile app (2 min)

1. Open **api.js**
2. Find line: `const SCRIPT_URL = "https://script.google.com/macros/s/YOUR_SCRIPT_ID_HERE/exec";`
3. Replace `YOUR_SCRIPT_ID_HERE` with your actual deployed URL from Step 5
4. Save the file

Your mobile app is now connected to Google Sheets.

---

## Step 7 — Configure Tally connection (5 min)

### On the Tally computer:
1. Open Tally Prime
2. Go to **Help → Settings → Connectivity**
3. Enable **TallyGateway Server**
4. Note the port number (default: 9000)
5. Make sure Tally and your app server are on the **same WiFi network**

### In the mobile app Settings → Tally connection:
1. Enter the IP address of the Tally computer
   - On that computer: open Command Prompt → type `ipconfig` → use **IPv4 Address**
2. Enter port: **9000**
3. Enter company name exactly as it appears in Tally
4. Tap **Test connection** to verify
5. Tap **Save**

---

## Step 8 — Set up auto-sync trigger (1 min)

1. Go back to Apps Script editor
2. Select function **createAutoSyncTrigger** from the dropdown
3. Click ▶ **Run**
4. Done — Tally will now sync every 30 minutes automatically

---

## Daily workflow after setup

| Who | What they do |
|-----|-------------|
| **Operator (morning)** | Opens app on phone → Log Work → Extrusion tab → fills shift data → Save |
| **Cutting operator** | Same → Cutting tab |
| **Gatekeeper** | Same → Dispatch tab when goods leave |
| **Manager** | Opens Dashboard → sees live production, alerts, pending orders |
| **Accountant** | Settings → View Tally data → sees synced orders and stock |

---

## Troubleshooting

**"Cannot reach Tally"**
- Make sure Tally is open and running on that computer
- Make sure both devices are on the same WiFi/LAN
- Check the IP address again using `ipconfig`
- Check Tally Gateway is enabled

**"Permission denied" when running scripts**
- Make sure you're logged in with the Google account that owns the sheet
- Re-run the permission grant flow

**Data not showing in sheet**
- Check the Web App URL is correct in api.js
- Re-deploy: Deploy → Manage deployments → Edit → Update

---

## File summary

| File | Purpose |
|------|---------|
| `Code.gs` | Main backend — all read/write operations |
| `TallySync.gs` | Tally XML pull and parsing |
| `api.js` | Frontend client — include in your mobile app |
| `DEPLOY.md` | This guide |
