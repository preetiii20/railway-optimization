const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
require('dotenv').config();

// 1. Import Models
const Train = require('./models/Train');
const Section = require('./models/Section');

// Import Routes
const simulationRoutes = require('./routes/simulation');

const app = express();
const PORT = process.env.PORT || 5000;

// 2. Middleware
app.use(cors());
app.use(express.json());

// 3. Connect to MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => console.error('❌ Database connection error:', err));

// 4. API ROUTES

// Home route
app.get('/', (req, res) => {
  res.json({ 
    message: '🚂 Railway Optimization System API',
    database: 'MongoDB Atlas Connected'
  });
});

// Get all trains from MongoDB
app.get('/api/trains', async (req, res) => {
  try {
    const trains = await Train.find().populate('currentSection');
    res.json({ success: true, count: trains.length, data: trains });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all sections from MongoDB
app.get('/api/sections', async (req, res) => {
  try {
    const sections = await Section.find();
    res.json({ success: true, data: sections });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Use simulation routes
app.use('/api', simulationRoutes);

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

// 5. Create HTTP Server & WebSocket
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// 🔄 REAL-TIME SIMULATION LOOP
// We now update MongoDB documents instead of a local array
setInterval(async () => {
  try {
    const trains = await Train.find();
    
    for (let train of trains) {
      // Simulate slight movement
      train.latitude += (Math.random() - 0.5) * 0.001;
      train.longitude += (Math.random() - 0.5) * 0.001;
      
      // 10% chance of random delay
      if (Math.random() < 0.1) {
        train.delay += 1;
        train.status = "delayed";
      }
      await train.save();
    }
    
    // Broadcast the updated list to all frontend clients
    io.emit('trainUpdate', trains);
    console.log('📡 Broadcasted live train positions from MongoDB');
  } catch (err) {
    console.error("Simulation Error:", err);
  }
}, 5000);

io.on('connection', (socket) => {
  console.log('🔌 New client connected:', socket.id);
  socket.on('disconnect', () => console.log('❌ Client disconnected'));
});

// 6. Start the Server
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});