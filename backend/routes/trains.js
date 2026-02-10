const express = require('express');
const router = express.Router();
const railRadarService = require('../services/railRadarService');

// GET /api/trains/search/:trainNumber - Search for train details
router.get('/search/:trainNumber', async (req, res) => {
  try {
    const { trainNumber } = req.params;
    const data = await railRadarService.searchTrain(trainNumber);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch train details',
      error: error.message 
    });
  }
});

// GET /api/trains/status/:trainNumber - Get live train status
router.get('/status/:trainNumber', async (req, res) => {
  try {
    const { trainNumber } = req.params;
    const { departureDate } = req.query; // Optional: YYYYMMDD format
    const data = await railRadarService.getLiveTrainStatus(trainNumber, departureDate);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch train status',
      error: error.message 
    });
  }
});

// POST /api/trains/status/multiple - Get status for multiple trains
router.post('/status/multiple', async (req, res) => {
  try {
    const { trainNumbers, departureDate } = req.body;
    
    if (!trainNumbers || !Array.isArray(trainNumbers)) {
      return res.status(400).json({ 
        success: false, 
        message: 'trainNumbers array is required' 
      });
    }
    
    const data = await railRadarService.getMultipleTrains(trainNumbers, departureDate);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch multiple train statuses',
      error: error.message 
    });
  }
});

module.exports = router;
