# 🚀 Simple Start Guide - IRIS Railway System

## For Your Friends (No Python Commands Needed!)

### Prerequisites (One-Time Setup)
1. **Node.js** installed (v14 or higher)
2. **Python** installed (v3.8 or higher)
3. **Git** installed

### First Time Setup

#### Step 1: Clone the Repository
```bash
git clone <your-repo-url>
cd railway-optimization-system
```

#### Step 2: Install Dependencies

**Backend:**
```bash
cd backend
npm install
cd ..
```

**Frontend:**
```bash
cd frontend
npm install
cd ..
```

**Python AI (One-Time):**
```bash
cd python-ai
pip install -r requirements.txt
cd ..
```

### 🎯 Daily Usage (Super Simple!)

Your friends only need to run **2 commands** in **2 terminals**:

#### Terminal 1: Start Backend (Auto-starts Python AI)
```bash
cd backend
npm start
```
✅ This automatically starts:
- Backend server on port 5000
- Python AI API on port 5001 (auto-started by backend)
- WebSocket for live updates
- Train simulator

#### Terminal 2: Start Frontend
```bash
cd frontend
npm start
```
✅ This starts:
- React frontend on port 3000
- Opens browser automatically

### That's It! 🎉

The system will be running at: **http://localhost:3000**

## 🔧 What Happens Automatically

When you run `npm start` in backend:
1. ✅ Backend server starts
2. ✅ Python AI API starts automatically (no manual command needed!)
3. ✅ Train simulator initializes with 106 trains
4. ✅ WebSocket connections established
5. ✅ All services ready

## 📱 Access the System

1. **Login Screen**: http://localhost:3000
2. **Admin Dashboard**: Login with admin credentials
3. **AI Features**: Scroll down in Admin Dashboard
4. **Freight Analysis**: Click on "Freight Analysis" tab

## 🛑 Stopping the System

Just press `Ctrl+C` in both terminals. Everything stops automatically.

## ⚠️ Troubleshooting

### Issue: "Python not found"
**Solution**: Make sure Python is installed and in PATH
```bash
python --version
```

### Issue: "Port 5000 already in use"
**Solution**: Kill the process using port 5000
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

### Issue: "MongoDB connection error"
**Solution**: Check `.env` file in backend folder has correct MongoDB URI

### Issue: Python packages not installed
**Solution**: Install Python dependencies (one-time)
```bash
cd python-ai
pip install -r requirements.txt
```

## 📋 Default Login Credentials

- **Admin**: admin@railway.com / admin123
- **Controller**: controller@railway.com / controller123
- **Supervisor**: supervisor@railway.com / supervisor123

## 🎯 Quick Test

After starting both servers:
1. Go to http://localhost:3000
2. Login as admin
3. Scroll down to "Advanced AI Features"
4. Click "Freight Analysis" tab
5. Click "Run AI Optimization" button
6. Watch 30 freight trains appear on the map!

## 📊 System Status Check

Visit: http://localhost:5000/health

Should show:
```json
{
  "status": "healthy",
  "database": "connected",
  "simulator": "running"
}
```

## 🚀 For Demonstration

1. Start both servers (2 commands)
2. Login as admin
3. Show live train tracking on map
4. Show AI features (Conflict Predictor, Infrastructure Planner)
5. Show Freight Optimization (30 trains moving in real-time)
6. Show metrics updating every 5 minutes

## 💡 Pro Tips

- Keep both terminals visible during demo
- Backend terminal shows Python AI logs
- Frontend auto-refreshes on code changes
- System works with real dataset (11,113 trains, 406 stations)

---

**Remember**: Your friends only need to run 2 commands!
1. `cd backend && npm start`
2. `cd frontend && npm start`

Everything else happens automatically! 🎉
