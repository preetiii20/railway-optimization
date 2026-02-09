import React, { useState, useEffect } from 'react';

const TrainControlPanel = ({ selectedTrain, trains }) => {
  const [controlMode, setControlMode] = useState('monitor'); // monitor, control, simulate
  const [trainCommands, setTrainCommands] = useState([]);
  const [simulationData, setSimulationData] = useState(null);

  useEffect(() => {
    if (selectedTrain) {
      // Load train-specific commands and data
      loadTrainData(selectedTrain);
    }
  }, [selectedTrain]);

  const loadTrainData = (train) => {
    // Simulate loading train control data
    const commands = [
      { id: 'speed_up', label: 'Increase Speed', icon: '⚡', available: train.status !== 'stopped' },
      { id: 'slow_down', label: 'Decrease Speed', icon: '🐌', available: train.speed > 0 },
      { id: 'stop', label: 'Emergency Stop', icon: '🛑', available: train.status !== 'stopped' },
      { id: 'reroute', label: 'Reroute', icon: '🔄', available: true },
      { id: 'priority', label: 'Boost Priority', icon: '⭐', available: train.priority < 10 },
      { id: 'maintenance', label: 'Schedule Maintenance', icon: '🔧', available: true }
    ];
    setTrainCommands(commands);
  };

  const executeCommand = (commandId) => {
    if (!selectedTrain) return;

    console.log(`Executing command ${commandId} for train ${selectedTrain.id}`);
    
    // Simulate command execution
    switch (commandId) {
      case 'speed_up':
        // Increase speed logic
        break;
      case 'slow_down':
        // Decrease speed logic
        break;
      case 'stop':
        // Emergency stop logic
        break;
      case 'reroute':
        // Reroute logic
        break;
      case 'priority':
        // Priority boost logic
        break;
      case 'maintenance':
        // Maintenance scheduling logic
        break;
      default:
        console.log('Unknown command');
    }
  };

  const runSimulation = () => {
    if (!selectedTrain) return;

    // Simulate running a what-if scenario
    const simulation = {
      scenario: 'delay_impact',
      originalArrival: selectedTrain.scheduledArrival,
      simulatedArrival: new Date(Date.now() + 30 * 60000), // 30 min delay
      impactedTrains: trains.filter(t => t.id !== selectedTrain.id).slice(0, 3),
      delayPropagation: [
        { trainId: 'T001', additionalDelay: 5 },
        { trainId: 'T002', additionalDelay: 3 },
        { trainId: 'T003', additionalDelay: 2 }
      ]
    };
    
    setSimulationData(simulation);
  };

  if (!selectedTrain) {
    return (
      <div className="train-control-panel">
        <div className="panel-header">
          <h3 className="panel-title">🎮 Train Control</h3>
        </div>
        <div className="no-selection">
          <div className="no-selection-icon">🚂</div>
          <p>Select a train from the map to control</p>
          <div className="quick-stats">
            <div className="stat-item">
              <span className="stat-value">{trains.length}</span>
              <span className="stat-label">Total Trains</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{trains.filter(t => t.status === 'running').length}</span>
              <span className="stat-label">Active</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{trains.filter(t => t.delay > 0).length}</span>
              <span className="stat-label">Delayed</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="train-control-panel">
      <div className="panel-header">
        <h3 className="panel-title">🎮 Train Control</h3>
        <div className="control-mode-selector">
          {['monitor', 'control', 'simulate'].map(mode => (
            <button
              key={mode}
              className={`mode-btn ${controlMode === mode ? 'active' : ''}`}
              onClick={() => setControlMode(mode)}
            >
              {mode.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Train Information */}
      <div className="train-info-section">
        <div className="train-header">
          <div className="train-avatar">
            <span className="train-emoji">
              {selectedTrain.type === 'express' ? '🚄' : 
               selectedTrain.type === 'freight' ? '🚛' : '🚂'}
            </span>
          </div>
          <div className="train-details">
            <h4>{selectedTrain.name || selectedTrain.id}</h4>
            <p className="train-type">{selectedTrain.type?.toUpperCase()}</p>
          </div>
          <div className={`status-badge ${selectedTrain.status}`}>
            {selectedTrain.status?.toUpperCase()}
          </div>
        </div>

        <div className="train-metrics">
          <div className="metric">
            <span className="metric-label">Speed</span>
            <span className="metric-value">{selectedTrain.speed || 0} km/h</span>
          </div>
          <div className="metric">
            <span className="metric-label">Priority</span>
            <span className="metric-value priority">{selectedTrain.priority}/10</span>
          </div>
          <div className="metric">
            <span className="metric-label">Delay</span>
            <span className={`metric-value ${selectedTrain.delay > 0 ? 'delayed' : 'ontime'}`}>
              {selectedTrain.delay > 0 ? `+${selectedTrain.delay}m` : 'On Time'}
            </span>
          </div>
        </div>
      </div>

      {/* Control Mode Content */}
      {controlMode === 'monitor' && (
        <div className="monitor-mode">
          <h4>📊 Monitoring</h4>
          <div className="monitoring-data">
            <div className="data-row">
              <span className="data-label">Current Location</span>
              <span className="data-value">{selectedTrain.currentLocation || 'Unknown'}</span>
            </div>
            <div className="data-row">
              <span className="data-label">Next Station</span>
              <span className="data-value">{selectedTrain.nextStation || 'N/A'}</span>
            </div>
            <div className="data-row">
              <span className="data-label">ETA</span>
              <span className="data-value">
                {selectedTrain.eta || new Date(Date.now() + 30 * 60000).toLocaleTimeString()}
              </span>
            </div>
            <div className="data-row">
              <span className="data-label">Distance Remaining</span>
              <span className="data-value">{selectedTrain.distanceRemaining || '15.2'} km</span>
            </div>
          </div>

          <div className="route-progress">
            <h5>Route Progress</h5>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${selectedTrain.routeProgress || 65}%` }}
              ></div>
            </div>
            <div className="progress-stations">
              {(selectedTrain.route || ['A', 'B', 'C', 'D']).map((station, index) => (
                <div 
                  key={index} 
                  className={`station ${index <= 2 ? 'completed' : 'pending'}`}
                >
                  {station}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {controlMode === 'control' && (
        <div className="control-mode">
          <h4>🎮 Direct Control</h4>
          <div className="control-commands">
            {trainCommands.map(command => (
              <button
                key={command.id}
                className={`command-btn ${!command.available ? 'disabled' : ''}`}
                onClick={() => executeCommand(command.id)}
                disabled={!command.available}
              >
                <span className="command-icon">{command.icon}</span>
                <span className="command-label">{command.label}</span>
              </button>
            ))}
          </div>

          <div className="manual-controls">
            <h5>Manual Override</h5>
            <div className="control-sliders">
              <div className="slider-group">
                <label>Speed Control</label>
                <input 
                  type="range" 
                  min="0" 
                  max="120" 
                  defaultValue={selectedTrain.speed || 60}
                  className="speed-slider"
                />
                <span className="slider-value">{selectedTrain.speed || 60} km/h</span>
              </div>
              
              <div className="slider-group">
                <label>Priority Level</label>
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  defaultValue={selectedTrain.priority || 5}
                  className="priority-slider"
                />
                <span className="slider-value">{selectedTrain.priority || 5}/10</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {controlMode === 'simulate' && (
        <div className="simulate-mode">
          <h4>🔮 What-If Simulation</h4>
          
          <div className="simulation-controls">
            <button className="simulation-btn" onClick={runSimulation}>
              <span className="btn-icon">▶️</span>
              Run Delay Impact Simulation
            </button>
            
            <button className="simulation-btn">
              <span className="btn-icon">🔄</span>
              Test Reroute Options
            </button>
            
            <button className="simulation-btn">
              <span className="btn-icon">⚡</span>
              Priority Boost Impact
            </button>
          </div>

          {simulationData && (
            <div className="simulation-results">
              <h5>Simulation Results</h5>
              <div className="result-summary">
                <div className="result-item">
                  <span className="result-label">Scenario</span>
                  <span className="result-value">{simulationData.scenario}</span>
                </div>
                <div className="result-item">
                  <span className="result-label">Impact</span>
                  <span className="result-value impact">
                    {simulationData.delayPropagation.length} trains affected
                  </span>
                </div>
              </div>
              
              <div className="affected-trains">
                <h6>Affected Trains</h6>
                {simulationData.delayPropagation.map((impact, index) => (
                  <div key={index} className="impact-item">
                    <span className="train-id">{impact.trainId}</span>
                    <span className="additional-delay">+{impact.additionalDelay}m</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="quick-actions">
        <button className="quick-action-btn emergency">
          <span className="action-icon">🚨</span>
          Emergency Stop
        </button>
        <button className="quick-action-btn communicate">
          <span className="action-icon">📡</span>
          Contact Driver
        </button>
      </div>
    </div>
  );
};

export default TrainControlPanel;