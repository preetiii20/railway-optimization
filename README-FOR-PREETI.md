# IRIS Railway Management System - Quick Start Guide

## 🚀 For Preeti (or Anyone Pulling This Project)

This guide will get you running in **2 simple steps**. No Python needed!

---

## ✅ Prerequisites

You only need **Node.js** installed:
- Download from: https://nodejs.org/
- Install the LTS version (recommended)
- Verify: Open CMD and type `node --version`

---

## 📦 Step 1: First Time Setup (Only Once)

After pulling the project from Git:

1. Open the project folder
2. **Double-click:** `SETUP-FIRST-TIME.bat`
3. Wait for installation to complete (2-3 minutes)

This installs all dependencies for backend and frontend.

---

## ▶️ Step 2: Start the System

Every time you want to run the project:

1. **Double-click:** `START-PROJECT.bat`
2. Wait for both servers to start (10-15 seconds)
3. Browser will open automatically at `http://localhost:3000`

**That's it!** 🎉

---

## 🗺️ What You'll See

### Dashboard
- 100+ passenger trains moving on map
- Real-time train positions
- Live conflict detection

### Freight Analysis Page
- 24 freight trains (orange 🚛 markers)
- Passenger trains (green 🚆 markers)
- Click "Optimize Now" for AI optimization
- See trains moving in real-time

### All Features Working
✅ Live train movement
✅ Freight trains visible
✅ AI optimization
✅ Conflict detection
✅ Time-distance graphs
✅ Infrastructure planning

---

## 🐛 Troubleshooting

### Problem: Trains not showing on map

**Solution:**
1. Close both terminal windows
2. Run `START-PROJECT.bat` again
3. Wait 15 seconds for backend to load data
4. Refresh browser

### Problem: Port already in use

**Solution:**
1. Close all Node.js processes
2. Open Task Manager → End all "Node.js" tasks
3. Run `START-PROJECT.bat` again

### Problem: Backend won't start

**Solution:**
1. Check if MongoDB is required (it's not for basic features)
2. Make sure port 5000 is free
3. Check backend console for errors

---

## 📁 Project Structure

```
iris-railway/
├── backend/              # Node.js backend
│   ├── data/            # Train data (CSV + JSON)
│   ├── routes/          # API endpoints
│   ├── services/        # Business logic
│   └── server.js        # Main server
├── frontend/            # React frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   └── pages/       # Pages
│   └── public/
├── python-ai/           # Python AI (optional)
├── START-PROJECT.bat    # ⭐ Use this to start
└── SETUP-FIRST-TIME.bat # ⭐ Run once after pulling
```

---

## 🎯 Key Features to Demo

### 1. Live Train Movement
- Go to Dashboard
- See 100+ trains moving on map
- Trains move based on actual speed

### 2. Freight Optimization
- Go to "Freight Analysis" page
- See 24 freight trains (orange markers)
- Click "Optimize Now"
- System automatically chooses best AI algorithm
- See results with algorithm badge

### 3. Conflict Detection
- Go to "Conflict Predictor"
- See predicted conflicts
- AI suggests resolutions

### 4. Infrastructure Planning
- Go to "Infrastructure Planner"
- Type: "Add loop line between Dadar and Kurla"
- See AI simulation results

---

## 🔧 No Python Required!

The system works **without Python** because:
- Freight trains loaded from JSON file (`backend/data/mock_freight_trains.json`)
- 24 trains distributed over 24 hours
- All trains move automatically
- No Python API dependency

**Python AI is optional** for advanced optimization (if you want to use it later).

---

## 📊 Data Files

All data is already included:

✅ `backend/data/Train_details.csv` - 100+ passenger trains
✅ `backend/data/mock_freight_trains.json` - 24 freight trains
✅ `python-ai/data/processed/stations_geocoded.json` - Station coordinates
✅ `python-ai/data/processed/train_schedules.json` - Train schedules

**No need to run any Python scripts!**

---

## 🚂 Freight Trains Explained

The system has **24 freight trains** permanently stored:
- FRT-001 to FRT-024
- Distributed across 24 hours
- Run same schedule every day
- Move on map like passenger trains
- Visible as orange 🚛 markers

**They work automatically** - no generation needed!

---

## 💡 Tips for Demo

1. **Start with Dashboard** - Show live trains
2. **Go to Freight Analysis** - Show freight trains
3. **Click "Optimize Now"** - Show AI in action
4. **Explain algorithms** - System auto-selects best one
5. **Show metrics** - Fitness score, utilization, etc.

---

## 🆘 Need Help?

If something doesn't work:

1. Check both terminal windows for errors
2. Make sure Node.js is installed
3. Try closing and restarting
4. Check if ports 3000 and 5000 are free

---

## 🎓 For SIH Presentation

**What to say:**
- "This is an AI-powered railway management system"
- "It uses 4 AI algorithms: CSP, Genetic Algorithm, Dynamic Programming, and Greedy Heuristic"
- "The system automatically optimizes freight train placement"
- "All trains move in real-time based on actual railway speeds"
- "It detects conflicts and suggests resolutions"

**What to show:**
1. Live map with 100+ trains
2. Freight optimization with AI
3. Algorithm selection (automatic)
4. Conflict detection
5. Infrastructure planning

---

## ✅ Checklist Before Demo

- [ ] Run `SETUP-FIRST-TIME.bat` (if first time)
- [ ] Run `START-PROJECT.bat`
- [ ] Wait for both servers to start
- [ ] Open `http://localhost:3000`
- [ ] Check trains are visible on map
- [ ] Test "Optimize Now" button
- [ ] Verify freight trains (orange markers)

---

## 🎉 You're Ready!

The system is **fully functional** with just backend and frontend.

**No Python, no database, no complex setup!**

Just run `START-PROJECT.bat` and everything works! 🚀
