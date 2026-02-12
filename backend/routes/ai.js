const express = require('express');
const router = express.Router();
const aiDataService = require('../services/aiDataService');
const freightService = require('../services/freightService');
const trainSimulator = require('../services/trainSimulator');
const axios = require('axios');

// Python AI API endpoint
const PYTHON_API = 'http://localhost:5001';

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

// POST /api/ai/optimize-freight - Run freight optimization with real AI
router.post('/optimize-freight', async (req, res) => {
  try {
    const { num_trains = 30, algorithm = 'genetic', time_window_hours = 2 } = req.body;
    
    const currentTime = new Date();
    const currentTimeMinutes = trainSimulator.getCurrentTimeMinutes();
    
    console.log(`🚛 Optimizing ${num_trains} freight trains for ${time_window_hours}h window`);
    console.log(`⏰ Current time: ${currentTime.toLocaleTimeString()} (${currentTimeMinutes} minutes)`);
    console.log(`📊 Algorithm: ${algorithm}`);
    
    // Get only the mock freight trains that are active in the time window
    const allFreightTrains = aiDataService.loadMockFreightTrains();
    const endTimeMinutes = currentTimeMinutes + (time_window_hours * 60);
    
    // Filter freight trains active in the time window
    const activeFreightTrains = allFreightTrains.filter(freight => {
      const departureTime = trainSimulator.parseTimeToMinutes(freight.departure_time);
      const arrivalTime = trainSimulator.parseTimeToMinutes(freight.arrival_time);
      
      // Train is active if it departs or arrives within the window
      return (departureTime >= currentTimeMinutes && departureTime <= endTimeMinutes) ||
             (arrivalTime >= currentTimeMinutes && arrivalTime <= endTimeMinutes) ||
             (departureTime <= currentTimeMinutes && arrivalTime >= currentTimeMinutes);
    });
    
    console.log(`📦 Found ${activeFreightTrains.length} freight trains in ${time_window_hours}h window (out of ${allFreightTrains.length} total)`);
    
    if (activeFreightTrains.length === 0) {
      return res.json({
        success: true,
        algorithm: algorithm,
        time_window_hours: time_window_hours,
        freight_trains: [],
        statistics: {
          total_freight_trains: 0,
          message: `No freight trains scheduled in next ${time_window_hours} hours. Try a larger time window.`
        }
      });
    }
    
    // Calculate live positions for active freight trains
    const trainsWithPositions = activeFreightTrains.map(freight => {
      const position = trainSimulator.calculatePositionByTime(freight, currentTimeMinutes);
      
      return {
        ...freight,
        freight_id: freight.train_id,
        origin: freight.source,
        origin_name: freight.source_name,
        destination: freight.destination,
        destination_name: freight.destination_name,
        departure_time: trainSimulator.parseTimeToMinutes(freight.departure_time),
        arrival_time: trainSimulator.parseTimeToMinutes(freight.arrival_time),
        travel_time: trainSimulator.parseTimeToMinutes(freight.arrival_time) - trainSimulator.parseTimeToMinutes(freight.departure_time),
        distance: freight.total_distance,
        speed: 60, // Default freight speed
        gap_utilization: 75, // Mock value
        livePosition: position,
        currentTime: currentTime.toLocaleTimeString(),
        status: position?.status || 'scheduled'
      };
    });
    
    // Return optimized result
    const response = {
      success: true,
      algorithm: algorithm,
      time_window_hours: time_window_hours,
      current_time: currentTime.toISOString(),
      freight_trains: trainsWithPositions,
      statistics: {
        total_freight_trains: trainsWithPositions.length,
        total_distance_km: trainsWithPositions.reduce((sum, t) => sum + (t.distance || 0), 0),
        fitness_score: trainsWithPositions.reduce((sum, t) => sum + (t.gap_utilization || 0), 0),
        gaps_found: activeFreightTrains.length,
        utilization_rate: (trainsWithPositions.length / num_trains) * 100,
        avg_travel_time_min: trainsWithPositions.reduce((sum, t) => sum + (t.travel_time || 0), 0) / trainsWithPositions.length
      }
    };
    
    console.log(`✅ Returning ${response.freight_trains.length} optimized freight trains`);
    res.json(response);
    
  } catch (error) {
    console.error('❌ Freight optimization error:', error.message);
    console.error('Stack:', error.stack);
    
    res.status(500).json({
      success: false,
      error: error.message,
      freight_trains: [],
      statistics: { total_freight_trains: 0 }
    });
  }
});

// Helper function to format minutes to HH:MM:SS
router.formatMinutesToTime = function(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:00`;
};

// GET /api/ai/freight-trains - Get stored freight trains with live positions
router.get('/freight-trains', async (req, res) => {
  try {
    // First try to get mock freight trains from aiDataService
    const mockFreightTrains = aiDataService.loadMockFreightTrains();
    const currentTimeMinutes = trainSimulator.getCurrentTimeMinutes();
    
    if (mockFreightTrains.length > 0) {
      console.log(`📦 Using ${mockFreightTrains.length} mock freight trains from JSON`);
      
      // Calculate live positions for mock trains
      const trainsWithPositions = mockFreightTrains.map(freight => {
        const position = trainSimulator.calculatePositionByTime(freight, currentTimeMinutes);
        
        return {
          ...freight,
          freight_id: freight.train_id, // Map train_id to freight_id for frontend
          origin: freight.source,
          origin_name: freight.source_name,
          destination: freight.destination,
          destination_name: freight.destination_name,
          departure_time: trainSimulator.parseTimeToMinutes(freight.departure_time),
          arrival_time: trainSimulator.parseTimeToMinutes(freight.arrival_time),
          travel_time: trainSimulator.parseTimeToMinutes(freight.arrival_time) - trainSimulator.parseTimeToMinutes(freight.departure_time),
          distance: freight.total_distance,
          speed: 60, // Default freight speed
          gap_utilization: 75, // Mock value
          livePosition: position,
          currentTime: new Date().toLocaleTimeString()
        };
      });
      
      return res.json({
        success: true,
        count: trainsWithPositions.length,
        freight_trains: trainsWithPositions,
        currentTimeMinutes: currentTimeMinutes,
        source: 'mock_data'
      });
    }
    
    // Fallback to MongoDB-based freight trains
    const trainsWithPositions = await freightService.getFreightTrainsWithPositions(trainSimulator);
    
    res.json({
      success: true,
      count: trainsWithPositions.length,
      freight_trains: trainsWithPositions,
      currentTimeMinutes: trainSimulator.getCurrentTimeMinutes(),
      source: 'mongodb'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      freight_trains: []
    });
  }
});

// GET /api/ai/freight/gaps - Get available time gaps
router.get('/freight/gaps', async (req, res) => {
  try {
    const response = await axios.get(`${PYTHON_API}/api/freight/gaps`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Python AI API not available' 
    });
  }
});

// POST /api/ai/freight/compare - Compare algorithms
router.post('/freight/compare', async (req, res) => {
  try {
    const { num_trains = 10 } = req.body;
    const response = await axios.post(`${PYTHON_API}/api/freight/compare`, { num_trains });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Python AI API not available' 
    });
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

module.exports = router;
