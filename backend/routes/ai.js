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


// POST /api/ai/optimize-freight - Run freight optimization
router.post('/optimize-freight', async (req, res) => {
  try {
    const { passenger_trains, time_window } = req.body;
    
    const pythonProcess = spawn('python', [
      path.join(__dirname, '../../python-ai/run_freight_optimizer.py'),
      JSON.stringify({ passenger_trains, time_window })
    ]);

    let result = '';
    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        res.json(JSON.parse(result));
      } else {
        res.status(500).json({ success: false, error: 'Optimization failed' });
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/ai/predict-conflicts - Predict future conflicts
router.post('/predict-conflicts', (req, res) => {
  try {
    const { current_trains, time_horizon } = req.body;
    
    // Mock predictions for now
    const predictions = [
      {
        id: 1,
        type: 'Track Occupancy Conflict',
        severity: 'high',
        probability: 0.85,
        train1_id: '1011',
        train2_id: '1023',
        station: 'DADAR',
        expected_time: '14:25',
        impact_description: 'Both trains scheduled to arrive within 3 minutes',
        recommendation: 'Delay Train 1023 by 5 minutes to avoid conflict',
        suggested_delay_train: '1023'
      }
    ];
    
    res.json({ success: true, predictions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/ai/simulate-infrastructure - Simulate infrastructure changes
router.post('/simulate-infrastructure', (req, res) => {
  try {
    const { natural_language_input, current_network } = req.body;
    
    // Mock simulation results
    const simulation = {
      parsed: {
        action: 'add',
        infrastructure_type: 'loop line',
        stations: ['Dadar', 'Kurla']
      },
      before: {
        freight_capacity: 45,
        avg_headway: 8,
        loop_utilization: 75,
        conflicts_per_day: 12
      },
      after: {
        freight_capacity: 60,
        avg_headway: 6,
        loop_utilization: 65,
        conflicts_per_day: 7
      },
      cost: 50,
      revenue: 15,
      roi_years: 3.3,
      feasibility: 'high'
    };
    
    res.json({ success: true, ...simulation });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/ai/resolve-conflict - Execute conflict resolution action
router.post('/resolve-conflict', (req, res) => {
  try {
    const { prediction_id, action } = req.body;
    
    console.log(`🎯 Executing action: ${action} for prediction ${prediction_id}`);
    
    res.json({ 
      success: true, 
      message: `Action "${action}" executed successfully`,
      action_taken: action,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
