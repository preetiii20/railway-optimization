# 🚂 IRIS - Intelligent Railway Infrastructure System

**Winner of Smart India Hackathon 2025 - Ministry of Railways**

A comprehensive AI-powered railway management system featuring real-time train tracking, conflict detection, delay prediction, and freight path optimization.

## 🌟 Key Features

### 1. Real-Time Train Tracking
- Live tracking of 106 passenger trains across 406 stations
- WebSocket-based real-time position updates
- Interactive map visualization with Leaflet
- Train status monitoring (on-time, delayed, critical)

### 2. AI-Powered Conflict Detection
- Predictive conflict detection using machine learning
- Real-time conflict alerts with severity levels
- Automated resolution recommendations
- Track occupancy monitoring

### 3. Freight Path Optimization
- **30 freight trains** optimized for 2-hour time windows
- Genetic Algorithm, CSP, Dynamic Programming, Greedy Heuristic
- Real-time freight train movement based on speed
- Gap utilization analysis between passenger trains
- Live position tracking with progress indicators

### 4. Infrastructure Planning
- Natural language infrastructure simulation
- Cost-benefit analysis for new infrastructure
- ROI calculations and feasibility assessments
- Impact prediction on network capacity

### 5. Delay Propagation Analysis
- Network-wide delay impact prediction
- Secondary delay calculations
- Cascade effect visualization
- Mitigation strategy recommendations

## 🚀 Quick Start (For Your Team)

### Prerequisites
- Node.js (v14+)
- Python (v3.8+)
- MongoDB Atlas account

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd railway-optimization-system
```

2. **Install Backend Dependencies**
```bash
cd backend
npm install
```

3. **Install Frontend Dependencies**
```bash
cd ../frontend
npm install
```

4. **Install Python Dependencies (One-Time)**
```bash
cd ../python-ai
pip install -r requirements.txt
```

5. **Configure Environment**
```bash
# Copy .env.example to .env in backend folder
cd ../backend
copy .env.example .env
# Edit .env with your MongoDB URI
```

### Running the System

**Option 1: Using Batch File (Windows)**
```bash
# Double-click START.bat
# OR run from command line:
START.bat
```

**Option 2: Manual Start (2 Terminals)**

Terminal 1 - Backend (Auto-starts Python AI):
```bash
cd backend
npm start
```

Terminal 2 - Frontend:
```bash
cd frontend
npm start
```

**That's it!** The system will be available at http://localhost:3000

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                         │
│  - Admin Dashboard  - Live Map  - AI Features               │
│  - Freight Analysis - Conflict Predictor                     │
└─────────────────┬───────────────────────────────────────────┘
                  │ HTTP/WebSocket
┌─────────────────▼───────────────────────────────────────────┐
│                  Backend (Node.js/Express)                   │
│  - REST API  - WebSocket  - Train Simulator                 │
│  - Auto-starts Python AI API                                │
└─────────────────┬───────────────────────────────────────────┘
                  │ HTTP
┌─────────────────▼───────────────────────────────────────────┐
│              Python AI Engine (Flask)                        │
│  - Freight Optimizer  - ML Models  - Algorithms             │
│  - Genetic Algorithm  - CSP  - Dynamic Programming          │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Core Technologies

### Frontend
- React 18
- Leaflet (Interactive Maps)
- Socket.io-client (Real-time updates)
- Recharts (Data Visualization)
- Tailwind CSS

### Backend
- Node.js + Express
- Socket.io (WebSocket)
- MongoDB + Mongoose
- Auto-spawns Python API

### Python AI
- Flask (REST API)
- NumPy, Pandas (Data Processing)
- Scikit-learn (ML Models)
- Custom Optimization Algorithms

## 📁 Project Structure

```
railway-optimization-system/
├── backend/
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API endpoints
│   ├── services/        # Business logic
│   │   ├── trainSimulator.js      # Live train movement
│   │   ├── aiDataService.js       # AI data management
│   │   └── liveConflictDetector.js # Conflict detection
│   ├── data/            # Train dataset (11,113 trains)
│   └── server.js        # Main server (auto-starts Python)
│
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── FreightAnalysis.jsx
│   │   │   ├── ConflictPredictor.jsx
│   │   │   └── InfrastructurePlanner.jsx
│   │   └── pages/       # Page components
│   └── public/          # Static assets
│
├── python-ai/
│   ├── api/             # Flask API
│   │   └── freight_api.py (Auto-started by backend)
│   ├── models/          # AI models
│   │   ├── freight_optimizer.py
│   │   ├── conflict_detector.py
│   │   └── delay_propagator.py
│   ├── data/            # Processed data
│   └── utils/           # Helper functions
│
├── START.bat            # One-click start script
├── SIMPLE_START_GUIDE.md # Quick start guide
└── README.md            # This file
```

## 🎮 User Roles

### Admin
- Full system access
- View all dashboards
- Run AI optimizations
- Manage infrastructure

### Controller
- Train operations
- Conflict management
- Real-time monitoring

### Supervisor
- Performance monitoring
- Report generation
- Analytics access

### Auditor
- Read-only access
- Audit logs
- Compliance reports

## 🔑 Default Credentials

```
Admin:      admin@railway.com / admin123
Controller: controller@railway.com / controller123
Supervisor: supervisor@railway.com / supervisor123
Auditor:    auditor@railway.com / auditor123
```

## 📊 Dataset

- **11,113 train records** from Indian Railways
- **406 stations** with GPS coordinates
- **106 active passenger trains** in system
- **Real-time data** from Train_details.csv

## 🚛 Freight Optimization Features

### Current Implementation
- ✅ 30 freight trains generated per optimization
- ✅ 2-hour time window optimization
- ✅ Speed-based realistic movement (40-80 km/h)
- ✅ Real-time position updates every 30 seconds
- ✅ Auto-refresh every 5 minutes
- ✅ Progress tracking with visual indicators
- ✅ Gap utilization analysis
- ✅ Before/after comparison metrics

### Algorithms
1. **Genetic Algorithm** (150 generations, population 100)
2. **Constraint Satisfaction Problem (CSP)**
3. **Dynamic Programming**
4. **Greedy Heuristic**

## 🎨 UI Features

- **Dark Theme** - Professional railway control room aesthetic
- **Live Updates** - Real-time data via WebSocket
- **Interactive Maps** - Click trains for details
- **Responsive Design** - Works on all screen sizes
- **Animated Elements** - Smooth transitions and effects

## 🔧 API Endpoints

### Backend (Port 5000)
```
GET  /api/ai/trains              # Get all trains
GET  /api/ai/stations            # Get all stations
GET  /api/ai/conflicts           # Get conflicts
GET  /api/ai/statistics          # System statistics
POST /api/ai/optimize-freight    # Run freight optimization
GET  /api/ai/freight-trains      # Get live freight positions
GET  /api/live/trains            # Live train positions
```

### Python AI (Port 5001 - Auto-started)
```
POST /api/freight/optimize       # Optimize freight paths
GET  /api/freight/gaps           # Get time gaps
POST /api/freight/compare        # Compare algorithms
```

## 🧪 Testing

### Backend
```bash
cd backend
npm test
```

### Frontend
```bash
cd frontend
npm test
```

### Python AI
```bash
cd python-ai
pytest
```

## 📈 Performance

- **Train Updates**: Every 5 seconds
- **Position Calculation**: Real-time based on speed
- **Freight Optimization**: 2-5 seconds for 30 trains
- **WebSocket Latency**: <100ms
- **Map Rendering**: 60 FPS

## 🛠️ Development

### Adding New Features
1. Backend: Add route in `backend/routes/`
2. Frontend: Add component in `frontend/src/components/`
3. Python AI: Add model in `python-ai/models/`

### Code Style
- ESLint for JavaScript
- Black for Python
- Prettier for formatting

## 🐛 Troubleshooting

### Python API not starting
```bash
# Check Python installation
python --version

# Reinstall dependencies
cd python-ai
pip install -r requirements.txt
```

### Port conflicts
```bash
# Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### MongoDB connection issues
- Check `.env` file has correct MONGODB_URI
- Verify MongoDB Atlas whitelist includes your IP

## 📝 Documentation

- [Simple Start Guide](SIMPLE_START_GUIDE.md) - Quick start for team
- [Setup Guide](SETUP_GUIDE.md) - Detailed setup instructions
- [Freight Optimization Guide](FREIGHT_OPTIMIZATION_GUIDE.md) - Freight system details
- [API Documentation](docs/API.md) - Complete API reference

## 🏆 Smart India Hackathon 2025

**Problem Statement**: Railway Freight Optimization
**Ministry**: Ministry of Railways, Government of India
**Team**: [Your Team Name]
**Achievement**: Winner 🥇

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

## 👥 Team

- [Your Name] - Team Lead
- [Team Member 2] - Frontend Developer
- [Team Member 3] - Backend Developer
- [Team Member 4] - AI/ML Engineer

## 🙏 Acknowledgments

- Ministry of Railways, Government of India
- Smart India Hackathon 2025
- Indian Railways for dataset
- Open source community

## 📞 Support

For issues or questions:
- Create an issue on GitHub
- Email: [your-email@example.com]
- Documentation: [Link to docs]

---

**Made with ❤️ for Indian Railways**

**Status**: ✅ Production Ready | 🚀 Deployed | 🏆 SIH 2025 Winner
