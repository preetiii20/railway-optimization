// ========================================
// RAILWAY OPTIMIZATION SYSTEM - BACKEND
// Fresh Server Implementation
// ========================================

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const { spawn } = require('child_process');
const path = require('path');
require('dotenv').config();

console.log('\n🚀 Starting Railway Optimization System Backend...\n');

// Auto-start Python AI API
let pythonProcess = null;
function startPythonAPI() {
  const pythonPath = path.join(__dirname, '../python-ai/api/freight_api.py');
  
  console.log('🐍 Starting Python AI API...');
  pythonProcess = spawn('python', [pythonPath], {
    cwd: path.join(__dirname, '../python-ai')
  });

  pythonProcess.stdout.on('data', (data) => {
    console.log(`[Python AI] ${data.toString().trim()}`);
  });

  pythonProcess.stderr.on('data', (data) => {
    const message = data.toString().trim();
    if (!message.includes('WARNING') && !message.includes('Restarting')) {
      console.error(`[Python AI Error] ${message}`);
    }
  });

  pythonProcess.on('close', (code) => {
    console.log(`[Python AI] Process exited with code ${code}`);
  });

  console.log('✅ Python AI API started on port 5001\n');
}

// Start Python API
startPythonAPI();

// Cleanup on exit
process.on('exit', () => {
  if (pythonProcess) {
    pythonProcess.kill();
  }
});

process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  if (pythonProcess) {
    pythonProcess.kill();
  }
  process.exit();
});

// Initialize Express
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Import Services
const aiDataService = require('./services/aiDataService');
const { getLiveTrainStatus } = require('./services/railRadarService');
const trainSimulator = require('./services/trainSimulator');
const liveConflictDetector = require('./services/liveConflictDetector');
const freightService = require('./services/freightService');

// Import Models
const Train = require('./models/Train');
const Section = require('./models/Section');

// Import Routes
const simulationRoutes = require('./routes/simulation');
const trainRoutes = require('./routes/trains');
const aiRoutes = require('./routes/ai');

console.log('✅ All modules loaded successfully\n');

// ========================================
// DATABASE CONNECTION
// ========================================
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB Atlas');
    
    // Initialize freight service after DB connection
    console.log('\n🚛 Initializing Freight Train System...');
    await freightService.initialize();
    console.log('✅ Freight Train System Ready\n');
  })
  .catch(err => console.error('❌ Database connection error:', err));

// ========================================
// API ROUTES
// ========================================

// Home route
app.get('/', (req, res) => {
  res.json({ 
    message: '🚂 Railway Optimization System API',
    version: '2.0',
    status: 'running',
    endpoints: {
      ai: '/api/ai/*',
      trains: '/api/trains/*',
      simulation: '/api/simulate'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    simulator: 'running'
  });
});

// Get live train positions
app.get('/api/live/trains', (req, res) => {
  try {
    const positions = trainSimulator.getTrainPositions();
    res.json({ success: true, count: positions.length, data: positions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get live conflicts
app.get('/api/live/conflicts', (req, res) => {
  try {
    const conflicts = liveConflictDetector.getActiveConflicts();
    res.json({ success: true, data: conflicts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Inject delay (for testing)
app.post('/api/live/inject-delay', (req, res) => {
  try {
    const { trainId, delayMinutes, cause } = req.body;
    const success = trainSimulator.injectDelay(trainId, delayMinutes, cause);
    
    if (success) {
      res.json({ success: true, message: `Injected ${delayMinutes} min delay to train ${trainId}` });
    } else {
      res.status(404).json({ success: false, message: 'Train not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// MongoDB Routes
app.get('/api/trains', async (req, res) => {
  try {
    const trains = await Train.find().populate('currentSection');
    res.json({ success: true, count: trains.length, data: trains });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/sections', async (req, res) => {
  try {
    const sections = await Section.find();
    res.json({ success: true, data: sections });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Register Route Modules
app.use('/api/ai', aiRoutes);
app.use('/api/trains', trainRoutes);
app.use('/api', simulationRoutes);

console.log('✅ Routes registered:');
console.log('   - /api/ai/* (AI Data & Analysis)');
console.log('   - /api/trains/* (Train Operations)');
console.log('   - /api/simulate (Simulation)\n');

// ========================================
// ERROR HANDLING
// ========================================

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    availableRoutes: ['/api/ai/*', '/api/trains/*', '/api/simulate']
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

// ========================================
// WEBSOCKET SETUP
// ========================================

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);
  
  // Send initial train positions
  const positions = trainSimulator.getTrainPositions();
  socket.emit('trainUpdate', positions);
  
  // Send initial conflicts
  const conflicts = liveConflictDetector.getActiveConflicts();
  socket.emit('conflictUpdate', conflicts);
  
  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

// Initialize and start train simulator
trainSimulator.initialize();
trainSimulator.start(io);

// Real-time train updates (every 5 seconds)
// Handled by trainSimulator.start(io)

// ========================================
// START SERVER
// ========================================

server.listen(PORT, () => {
  console.log('========================================');
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log('========================================');
  console.log('\n📊 Test the AI endpoints:');
  console.log(`   http://localhost:${PORT}/api/ai/statistics`);
  console.log(`   http://localhost:${PORT}/api/ai/trains`);
  console.log(`   http://localhost:${PORT}/api/ai/conflicts`);
  console.log('\n');
});
