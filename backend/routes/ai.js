const express = require('express');
const router = express.Router();
const aiDataService = require('../services/aiDataService');
const { spawn } = require('child_process');
const path = require('path');

// GET /api/ai/trains - Get all trains
router.get('/trains', (req, res) => {
  try {
    const trains = aiDataService.getTrainsArray();
    res.json({ 
      success: true, 
      count: trains.length,
      data: trains 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// GET /api/ai/trains/:id - Get specific train
router.get('/trains/:id', (req, res) => {
  try {
    const train = aiDataService.getTrainById(req.params.id);
    if (train) {
      res.json({ success: true, data: train });
    } else {
      res.status(404).json({ success: false, error: 'Train not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/ai/stations - Get all stations
router.get('/stations', (req, res) => {
  try {
    const stations = aiDataService.loadStations();
    res.json({ 
      success: true, 
      count: Object.keys(stations).length,
      data: stations 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/ai/conflicts - Get all conflicts
router.get('/conflicts', (req, res) => {
  try {
    const conflicts = aiDataService.loadConflicts();
    res.json({ 
      success: true, 
      data: conflicts 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/ai/recommendations - Get AI recommendations
router.get('/recommendations', (req, res) => {
  try {
    const results = aiDataService.loadOptimizationResults();
    const recommendations = results.results?.greedy?.recommendations || [];
    res.json({ 
      success: true, 
      data: recommendations 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/ai/statistics - Get system statistics
router.get('/statistics', (req, res) => {
  try {
    const stats = aiDataService.getStatistics();
    res.json({ 
      success: true, 
      data: stats 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/ai/analyze-delay - Analyze delay propagation
router.post('/analyze-delay', (req, res) => {
  try {
    const { train_id, station, delay_minutes, cause } = req.body;

    if (!train_id || !station || !delay_minutes) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: train_id, station, delay_minutes' 
      });
    }

    // For now, return mock data
    // In production, this would call Python script
    const result = {
      primary_delay: {
        train_id,
        station,
        delay_minutes,
        cause: cause || 'unknown'
      },
      secondary_delays: [],
      summary: {
        total_network_delay: delay_minutes,
        affected_trains: 1
      }
    };

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/ai/run-python - Run Python AI script
router.post('/run-python', (req, res) => {
  const { script, args } = req.body;
  
  const pythonPath = path.join(__dirname, '../../python-ai');
  const scriptPath = path.join(pythonPath, script);

  const pythonProcess = spawn('python', [scriptPath, ...(args || [])]);

  let output = '';
  let error = '';

  pythonProcess.stdout.on('data', (data) => {
    output += data.toString();
  });

  pythonProcess.stderr.on('data', (data) => {
    error += data.toString();
  });

  pythonProcess.on('close', (code) => {
    if (code === 0) {
      res.json({ 
        success: true, 
        output,
        message: 'Python script executed successfully' 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: error || 'Python script failed',
        code 
      });
    }
  });
});

module.exports = router;
