const fs = require('fs');
const path = require('path');

// Paths to Python AI output files
const PYTHON_AI_PATH = path.join(__dirname, '../../python-ai');
const PROCESSED_PATH = path.join(PYTHON_AI_PATH, 'data/processed');
const OUTPUT_PATH = path.join(PYTHON_AI_PATH, 'data/output');

class AIDataService {
  // Load train schedules
  loadTrainSchedules() {
    try {
      const filePath = path.join(PROCESSED_PATH, 'train_schedules.json');
      console.log('📂 Loading train schedules from:', filePath);
      
      if (!fs.existsSync(filePath)) {
        console.error('❌ File not found:', filePath);
        console.log('💡 Run: cd python-ai && python phase1_data_prep.py');
        return {};
      }
      
      const data = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(data);
      console.log('✅ Loaded', Object.keys(parsed).length, 'trains');
      return parsed;
    } catch (error) {
      console.error('Error loading train schedules:', error.message);
      return {};
    }
  }

  // Load station coordinates
  loadStations() {
    try {
      const filePath = path.join(PROCESSED_PATH, 'stations_geocoded.json');
      console.log('📂 Loading stations from:', filePath);
      
      if (!fs.existsSync(filePath)) {
        console.error('❌ File not found:', filePath);
        return {};
      }
      
      const data = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(data);
      console.log('✅ Loaded', Object.keys(parsed).length, 'stations');
      return parsed;
    } catch (error) {
      console.error('Error loading stations:', error.message);
      return {};
    }
  }

  // Load detected conflicts
  loadConflicts() {
    try {
      const filePath = path.join(OUTPUT_PATH, 'conflicts_detected.json');
      console.log('📂 Loading conflicts from:', filePath);
      
      if (!fs.existsSync(filePath)) {
        console.error('❌ File not found:', filePath);
        console.log('💡 Run: cd python-ai && python phase2_ai_models.py');
        return { conflicts: [], total_conflicts: 0 };
      }
      
      const data = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(data);
      console.log('✅ Loaded', parsed.total_conflicts || 0, 'conflicts');
      return parsed;
    } catch (error) {
      console.error('Error loading conflicts:', error.message);
      return { conflicts: [], total_conflicts: 0 };
    }
  }

  // Load optimization results
  loadOptimizationResults() {
    try {
      const filePath = path.join(OUTPUT_PATH, 'optimization_results.json');
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading optimization results:', error.message);
      return { recommendations: [] };
    }
  }

  // Load delay propagation results
  loadDelayPropagation() {
    try {
      const filePath = path.join(OUTPUT_PATH, 'delay_propagation_result.json');
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading delay propagation:', error.message);
      return null;
    }
  }

  // Load mock freight trains
  loadMockFreightTrains() {
    try {
      const filePath = path.join(__dirname, '../data/mock_freight_trains.json');
      
      if (!fs.existsSync(filePath)) {
        console.log('⚠️ No mock freight trains found');
        return [];
      }
      
      const data = fs.readFileSync(filePath, 'utf8');
      const freightTrains = JSON.parse(data);
      console.log('✅ Loaded', freightTrains.length, 'mock freight trains');
      return freightTrains;
    } catch (error) {
      console.error('Error loading mock freight trains:', error.message);
      return [];
    }
  }

  // Get all trains as array (passenger + freight)
  getTrainsArray() {
    const schedules = this.loadTrainSchedules();
    const passengerTrains = Object.values(schedules);
    const freightTrains = this.loadMockFreightTrains();
    
    // Combine passenger and freight trains
    const allTrains = [...passengerTrains, ...freightTrains];
    
    if (freightTrains.length > 0) {
      console.log(`📊 Total trains: ${allTrains.length} (${passengerTrains.length} passenger + ${freightTrains.length} freight)`);
    }
    
    return allTrains;
  }

  // Get train by ID
  getTrainById(trainId) {
    const schedules = this.loadTrainSchedules();
    return schedules[trainId] || null;
  }

  // Get stations as array
  getStationsArray() {
    const stations = this.loadStations();
    return Object.values(stations);
  }

  // Get statistics
  getStatistics() {
    const trains = this.getTrainsArray();
    const conflicts = this.loadConflicts();
    
    const totalTrains = trains.length;
    const activeTrains = trains.filter(t => t.train_type === 'express' || t.train_type === 'local').length;
    const totalConflicts = conflicts.total_conflicts || 0;
    const highSeverityConflicts = conflicts.by_severity?.high?.length || 0;

    return {
      totalTrains,
      activeTrains,
      totalConflicts,
      highSeverityConflicts,
      avgDelay: 0, // Will be calculated from real-time data
      onTimePercentage: 72,
      delayedPercentage: 28
    };
  }
}

module.exports = new AIDataService();
