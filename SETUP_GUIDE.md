# 🚂 IRIS Railway System - Complete Setup Guide

## Prerequisites
- Node.js 18+ installed
- Python 3.8+ installed
- Git installed

## Step-by-Step Setup

### 1️⃣ Clone the Project
```bash
git clone <repository-url>
cd railway-optimization-system
```

### 2️⃣ Setup Python AI Backend (IMPORTANT - Do this first!)
```bash
cd python-ai

# Install Python dependencies
pip install pandas numpy geopy requests

# Process the CSV data to generate train schedules
python phase1_data_prep.py
```

**What this does:**
- Reads `data/raw/Train_details.csv`
- Geocodes all stations (gets latitude/longitude)
- Creates `data/processed/train_schedules.json`
- Creates `data/processed/stations_geocoded.json`

**Expected Output:**
```
✅ Loaded 106 trains from CSV
✅ Geocoded 406 stations
✅ Created train_schedules.json
✅ Created stations_geocoded.json
```

### 3️⃣ Setup Backend Server
```bash
cd ../backend

# Install Node.js dependencies
npm install

# Start the backend server
node server.js
```

**Expected Output:**
```
🚀 Server running on port 5000
✅ Loaded 106 trains
✅ Loaded 406 stations
🔄 Train simulator started
```

### 4️⃣ Setup Frontend (New Terminal)
```bash
cd frontend

# Install dependencies
npm install

# Start the React app
npm start
```

**Expected Output:**
```
Compiled successfully!
Local: http://localhost:3000
```

### 5️⃣ Access the Application
Open browser: `http://localhost:3000`

---

## 🔍 Troubleshooting

### Problem: No trains visible on map

**Solution 1: Check if data is processed**
```bash
cd python-ai
ls data/processed/
```
You should see:
- `train_schedules.json`
- `stations_geocoded.json`

If missing, run:
```bash
python phase1_data_prep.py
```

**Solution 2: Check backend logs**
Backend should show:
```
✅ Loaded 106 trains
✅ Loaded 406 stations
```

If you see errors, restart backend:
```bash
cd backend
node server.js
```

**Solution 3: Check browser console**
Press F12 in browser, check Console tab for errors.

---

## 📁 File Structure After Setup

```
railway-optimization-system/
├── python-ai/
│   ├── data/
│   │   ├── raw/
│   │   │   └── Train_details.csv          # Original data
│   │   └── processed/
│   │       ├── train_schedules.json       # ✅ Generated
│   │       └── stations_geocoded.json     # ✅ Generated
│   └── phase1_data_prep.py
├── backend/
│   ├── server.js                          # Running on :5000
│   └── services/
│       └── trainSimulator.js              # Simulates train movement
└── frontend/
    └── src/
        └── components/
            └── AdminDashboard.jsx         # Main dashboard
```

---

## 🎯 Quick Start (All in One)

### Windows:
```bash
# Terminal 1: Process data
cd python-ai
python phase1_data_prep.py

# Terminal 2: Start backend
cd backend
npm install
node server.js

# Terminal 3: Start frontend
cd frontend
npm install
npm start
```

### Linux/Mac:
```bash
# Terminal 1: Process data
cd python-ai
python3 phase1_data_prep.py

# Terminal 2: Start backend
cd backend
npm install
node server.js

# Terminal 3: Start frontend
cd frontend
npm install
npm start
```

---

## ✅ Verification Checklist

After setup, verify:

1. ✅ Python processed data:
   - File exists: `python-ai/data/processed/train_schedules.json`
   - File exists: `python-ai/data/processed/stations_geocoded.json`

2. ✅ Backend running:
   - URL works: `http://localhost:5000/api/ai/trains`
   - Should return JSON with 106 trains

3. ✅ Frontend running:
   - URL works: `http://localhost:3000`
   - Map shows stations (blue dots)
   - Trains appear on map (moving markers)

---

## 🚨 Common Issues

### Issue: "Module not found: pandas"
**Solution:**
```bash
pip install pandas numpy geopy requests
```

### Issue: "Port 5000 already in use"
**Solution:**
Kill the process or change port in `backend/server.js`:
```javascript
const PORT = process.env.PORT || 5001; // Change to 5001
```

### Issue: "Cannot GET /api/ai/trains"
**Solution:**
Backend not running. Start it:
```bash
cd backend
node server.js
```

### Issue: "Empty map, no trains"
**Solution:**
Data not processed. Run:
```bash
cd python-ai
python phase1_data_prep.py
```
Then restart backend.

---

## 📞 Need Help?

1. Check backend terminal for errors
2. Check browser console (F12) for errors
3. Verify all 3 terminals are running:
   - Python data processing (done once)
   - Backend server (port 5000)
   - Frontend server (port 3000)

---

## 🎉 Success!

When everything works, you should see:
- 🗺️ Map with 406 stations (blue dots)
- 🚂 Moving train markers
- 📊 KPI cards with live data
- ⚠️ Conflict alerts (if any)
- 📈 4 AI visualization tabs below map

**Enjoy the IRIS Railway Optimization System!** 🚀
