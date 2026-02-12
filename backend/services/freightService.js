/**
 * FREIGHT TRAIN SERVICE
 * Manages persistent freight train generation and storage
 */

const FreightTrain = require('../models/FreightTrain');
const axios = require('axios');

const PYTHON_API = 'http://localhost:5001';

class FreightService {
  constructor() {
    this.isGenerating = false;
    this.lastGenerationTime = null;
  }

  /**
   * Initialize freight service - generate trains if needed
   */
  async initialize() {
    console.log('🚛 Initializing Freight Service...');
    
    // Wait for Python API to be ready
    await this.waitForPythonAPI();
    
    try {
      // Check if we have valid freight trains
      const validTrains = await this.getValidFreightTrains();
      
      if (validTrains.length === 0) {
        console.log('📦 No valid freight trains found. Generating new batch...');
        await this.generateAndStoreFreightTrains();
      } else {
        console.log(`✅ Found ${validTrains.length} valid freight trains in database`);
        this.lastGenerationTime = new Date();
      }
    } catch (error) {
      console.error('❌ Error initializing freight service:', error.message);
      console.log('⚠️ Freight trains will be generated on first API request');
    }
  }

  /**
   * Wait for Python API to be ready
   */
  async waitForPythonAPI(maxAttempts = 10, delayMs = 2000) {
    console.log('⏳ Waiting for Python AI API to be ready...');
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const response = await axios.get(`${PYTHON_API}/api/freight/gaps`, {
          timeout: 3000
        });
        
        if (response.status === 200) {
          console.log('✅ Python AI API is ready!');
          return true;
        }
      } catch (error) {
        console.log(`⏳ Attempt ${attempt}/${maxAttempts}: Python API not ready yet...`);
        
        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }
    }
    
    console.warn('⚠️ Python API not responding after multiple attempts');
    return false;
  }

  /**
   * Get valid freight trains (not expired)
   */
  async getValidFreightTrains() {
    try {
      const now = new Date();
      const trains = await FreightTrain.find({
        valid_until: { $gt: now }
      }).sort({ freight_id: 1 });
      
      return trains;
    } catch (error) {
      console.error('Error fetching valid freight trains:', error);
      return [];
    }
  }

  /**
   * Generate and store freight trains
   */
  async generateAndStoreFreightTrains() {
    if (this.isGenerating) {
      console.log('⏳ Freight generation already in progress...');
      return null;
    }

    this.isGenerating = true;

    try {
      console.log('🚀 Calling Python AI to generate 30 freight trains...');
      
      // Call Python AI API with timeout
      const response = await axios.post(`${PYTHON_API}/api/freight/optimize`, {
        num_trains: 30,
        algorithm: 'genetic',
        time_window_hours: 2
      }, {
        timeout: 30000 // 30 second timeout
      });

      console.log('📦 Python AI response received');

      if (!response.data) {
        throw new Error('Python AI returned empty response');
      }

      if (!response.data.success) {
        throw new Error(`Python AI returned error: ${response.data.error || 'Unknown error'}`);
      }

      if (!response.data.freight_trains || response.data.freight_trains.length === 0) {
        throw new Error('Python AI returned no freight trains');
      }

      const freightTrains = response.data.freight_trains;
      console.log(`✅ Generated ${freightTrains.length} freight trains from Python AI`);

      // Clear old freight trains
      const deleteResult = await FreightTrain.deleteMany({});
      console.log(`🗑️ Cleared ${deleteResult.deletedCount} old freight trains from database`);

      // Prepare trains for storage
      const validUntil = new Date();
      validUntil.setHours(validUntil.getHours() + 24); // Valid for 24 hours

      const trainsToStore = freightTrains.map(freight => {
        // Build route array
        const route = [
          {
            seq: 1,
            station_code: freight.origin,
            station_name: freight.origin_name,
            arrival_time: '00:00:00',
            departure_time: this.formatMinutesToTime(freight.departure_time),
            distance: 0
          },
          {
            seq: 2,
            station_code: freight.destination,
            station_name: freight.destination_name,
            arrival_time: this.formatMinutesToTime(freight.arrival_time),
            departure_time: this.formatMinutesToTime(freight.arrival_time),
            distance: freight.distance
          }
        ];

        // Calculate speed
        const travelTimeHours = freight.travel_time / 60;
        const avgSpeed = travelTimeHours > 0 ? freight.distance / travelTimeHours : 60;

        return {
          freight_id: freight.freight_id,
          origin: freight.origin,
          origin_name: freight.origin_name,
          destination: freight.destination,
          destination_name: freight.destination_name,
          departure_time: freight.departure_time,
          arrival_time: freight.arrival_time,
          travel_time: freight.travel_time,
          distance: freight.distance,
          speed: Math.round(avgSpeed),
          gap_utilization: freight.gap_utilization,
          route: route,
          train_type: 'freight',
          valid_until: validUntil
        };
      });

      // Store in MongoDB
      const insertResult = await FreightTrain.insertMany(trainsToStore);
      console.log(`💾 Stored ${insertResult.length} freight trains in MongoDB`);
      console.log(`⏰ Valid until: ${validUntil.toLocaleString()}`);

      this.lastGenerationTime = new Date();
      this.isGenerating = false;

      return trainsToStore;
    } catch (error) {
      console.error('❌ Error generating freight trains:', error.message);
      
      if (error.code === 'ECONNREFUSED') {
        console.error('💡 Python AI API is not running on port 5001');
        console.error('💡 Start it with: cd python-ai && python api/freight_api.py');
      } else if (error.code === 'ETIMEDOUT') {
        console.error('💡 Python AI API timeout - it might be processing');
      }
      
      this.isGenerating = false;
      throw error; // Re-throw to let caller handle it
    }
  }

  /**
   * Get freight trains with live positions
   */
  async getFreightTrainsWithPositions(trainSimulator) {
    try {
      const trains = await this.getValidFreightTrains();
      const currentTimeMinutes = trainSimulator.getCurrentTimeMinutes();

      // Calculate live positions
      const trainsWithPositions = trains.map(freight => {
        const freightObj = freight.toObject();
        const position = trainSimulator.calculatePositionByTime(freightObj, currentTimeMinutes);
        
        return {
          ...freightObj,
          livePosition: position,
          currentTime: new Date().toLocaleTimeString()
        };
      });

      return trainsWithPositions;
    } catch (error) {
      console.error('Error getting freight trains with positions:', error);
      return [];
    }
  }

  /**
   * Check if freight trains need regeneration (expired)
   */
  async checkAndRegenerateIfNeeded() {
    const validTrains = await this.getValidFreightTrains();
    
    if (validTrains.length === 0) {
      console.log('⚠️ Freight trains expired. Regenerating...');
      await this.generateAndStoreFreightTrains();
    }
  }

  /**
   * Format minutes to HH:MM:SS
   */
  formatMinutesToTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:00`;
  }
}

// Singleton instance
const freightService = new FreightService();

module.exports = freightService;
