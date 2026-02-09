const express = require('express');
const router = express.Router();

// Simulate scenario endpoint
router.post('/simulate', async (req, res) => {
  try {
    const { type, trains, sections, parameters } = req.body;
    
    // Simulate different scenarios
    let simulationResult;
    
    switch (type) {
      case 'baseline':
        simulationResult = simulateBaseline(trains, sections);
        break;
      case 'precedence':
        simulationResult = simulatePrecedence(trains, sections, parameters);
        break;
      case 'crossing':
        simulationResult = simulateCrossing(trains, sections, parameters);
        break;
      case 'holding':
        simulationResult = simulateHolding(trains, sections, parameters);
        break;
      case 'disruption':
        simulationResult = simulateDisruption(trains, sections, parameters);
        break;
      default:
        return res.status(400).json({ error: 'Invalid simulation type' });
    }
    
    res.json({
      success: true,
      data: simulationResult
    });
    
  } catch (error) {
    console.error('Simulation error:', error);
    res.status(500).json({ error: 'Simulation failed' });
  }
});

// Simulation functions
function simulateBaseline(trains, sections) {
  // Calculate current performance metrics
  const totalDelay = trains.reduce((sum, train) => sum + (train.delay || 0), 0);
  const throughput = Math.floor(trains.length * 2.5); // trains per hour
  const utilization = Math.min(85 + Math.random() * 10, 95); // 85-95%
  
  return {
    totalDelay,
    throughput,
    utilization,
    trainsProcessed: trains.length,
    averageDelay: trains.length > 0 ? totalDelay / trains.length : 0
  };
}

function simulatePrecedence(trains, sections, parameters) {
  // Simulate different train precedence order
  const baselineDelay = trains.reduce((sum, train) => sum + (train.delay || 0), 0);
  
  // Assume precedence optimization reduces delay by 10-30%
  const delayReduction = Math.floor(baselineDelay * (0.1 + Math.random() * 0.2));
  const newTotalDelay = Math.max(0, baselineDelay - delayReduction);
  
  const throughput = Math.floor(trains.length * 2.7); // Improved throughput
  const utilization = Math.min(88 + Math.random() * 8, 96);
  
  return {
    totalDelay: newTotalDelay,
    throughput,
    utilization,
    trainsProcessed: trains.length,
    averageDelay: trains.length > 0 ? newTotalDelay / trains.length : 0,
    improvement: {
      delayReduction,
      throughputIncrease: throughput - Math.floor(trains.length * 2.5)
    }
  };
}

function simulateCrossing(trains, sections, parameters) {
  // Simulate different crossing locations
  const baselineDelay = trains.reduce((sum, train) => sum + (train.delay || 0), 0);
  
  // Crossing optimization typically reduces delay by 5-20%
  const delayReduction = Math.floor(baselineDelay * (0.05 + Math.random() * 0.15));
  const newTotalDelay = Math.max(0, baselineDelay - delayReduction);
  
  const throughput = Math.floor(trains.length * 2.6);
  const utilization = Math.min(86 + Math.random() * 9, 95);
  
  return {
    totalDelay: newTotalDelay,
    throughput,
    utilization,
    trainsProcessed: trains.length,
    averageDelay: trains.length > 0 ? newTotalDelay / trains.length : 0,
    crossingPoint: parameters.crossingLocation || 'loop_a'
  };
}

function simulateHolding(trains, sections, parameters) {
  // Simulate train holding strategy
  const baselineDelay = trains.reduce((sum, train) => sum + (train.delay || 0), 0);
  const holdingDuration = parameters.holdingDuration || 5;
  
  // Holding might increase delay for held train but reduce overall delay
  const additionalDelay = holdingDuration;
  const delayReduction = Math.floor(baselineDelay * 0.15); // 15% reduction for others
  const newTotalDelay = baselineDelay + additionalDelay - delayReduction;
  
  const throughput = Math.floor(trains.length * 2.4); // Slightly reduced
  const utilization = Math.min(84 + Math.random() * 8, 92);
  
  return {
    totalDelay: Math.max(0, newTotalDelay),
    throughput,
    utilization,
    trainsProcessed: trains.length,
    averageDelay: trains.length > 0 ? newTotalDelay / trains.length : 0,
    holdingStation: parameters.holdingStation,
    holdingDuration
  };
}

function simulateDisruption(trains, sections, parameters) {
  // Simulate disruption impact
  const baselineDelay = trains.reduce((sum, train) => sum + (train.delay || 0), 0);
  const disruptionDelay = parameters.delayAmount || 10;
  
  // Disruption increases overall delay
  const cascadeEffect = Math.floor(disruptionDelay * 0.3); // 30% cascade to other trains
  const newTotalDelay = baselineDelay + disruptionDelay + cascadeEffect;
  
  const throughput = Math.floor(trains.length * 2.2); // Reduced throughput
  const utilization = Math.min(75 + Math.random() * 10, 85);
  
  return {
    totalDelay: newTotalDelay,
    throughput,
    utilization,
    trainsProcessed: trains.length,
    averageDelay: trains.length > 0 ? newTotalDelay / trains.length : 0,
    disruptionType: parameters.disruptionType,
    disruptionImpact: disruptionDelay + cascadeEffect
  };
}

// Get simulation history
router.get('/simulate/history', async (req, res) => {
  try {
    // Return mock simulation history
    const history = [
      {
        id: 1,
        name: 'Express Priority Test',
        type: 'precedence',
        createdAt: new Date(Date.now() - 86400000), // 1 day ago
        result: { delayReduction: 15, throughputIncrease: 3 }
      },
      {
        id: 2,
        name: 'Loop B Crossing',
        type: 'crossing',
        createdAt: new Date(Date.now() - 172800000), // 2 days ago
        result: { delayReduction: 8, throughputIncrease: 2 }
      }
    ];
    
    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch simulation history' });
  }
});

// Save simulation
router.post('/simulate/save', async (req, res) => {
  try {
    const { name, type, parameters, results } = req.body;
    
    // In a real implementation, save to database
    const savedSimulation = {
      id: Date.now(),
      name,
      type,
      parameters,
      results,
      createdAt: new Date()
    };
    
    res.json({ success: true, data: savedSimulation });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save simulation' });
  }
});

module.exports = router;