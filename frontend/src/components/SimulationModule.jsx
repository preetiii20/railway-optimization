import { useState, useEffect } from 'react';
import { simulateScenario, getTrains, getSections } from '../services/api';
import '../styles/control-room.css';

const SimulationModule = ({ onClose }) => {
  const [simulationState, setSimulationState] = useState({
    trains: [],
    sections: [],
    scenarios: [],
    currentScenario: null,
    isRunning: false,
    results: null
  });

  const [scenarioConfig, setScenarioConfig] = useState({
    name: '',
    type: 'precedence', // precedence, crossing, holding, disruption
    parameters: {
      trainIds: [],
      precedenceOrder: [],
      crossingLocation: '',
      holdingStation: '',
      holdingDuration: 0,
      disruptionType: '',
      disruptionDuration: 0,
      delayAmount: 0
    }
  });

  const [comparisonResults, setComparisonResults] = useState({
    baseline: null,
    simulated: null,
    improvement: null
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [trainsRes, sectionsRes] = await Promise.all([
        getTrains(),
        getSections()
      ]);

      setSimulationState(prev => ({
        ...prev,
        trains: trainsRes.data.data || [],
        sections: sectionsRes.data.data || []
      }));
    } catch (error) {
      console.error('Failed to load simulation data:', error);
    }
  };

  const simulationTypes = [
    {
      id: 'precedence',
      name: 'Train Precedence',
      description: 'Test different train priority orders',
      icon: '🚂'
    },
    {
      id: 'crossing',
      name: 'Crossing Location',
      description: 'Compare different crossing points',
      icon: '🔄'
    },
    {
      id: 'holding',
      name: 'Holding Strategy',
      description: 'Test train holding at different stations',
      icon: '⏸️'
    },
    {
      id: 'disruption',
      name: 'Disruption Impact',
      description: 'Simulate delays and breakdowns',
      icon: '⚠️'
    }
  ];

  const runSimulation = async () => {
    setSimulationState(prev => ({ ...prev, isRunning: true }));

    try {
      // Simulate baseline scenario (current state)
      const baselineResult = await simulateScenario({
        type: 'baseline',
        trains: simulationState.trains,
        sections: simulationState.sections,
        parameters: {}
      });

      // Simulate modified scenario
      const simulatedResult = await simulateScenario({
        type: scenarioConfig.type,
        trains: simulationState.trains,
        sections: simulationState.sections,
        parameters: scenarioConfig.parameters
      });

      // Calculate improvements
      const improvement = calculateImprovement(baselineResult.data, simulatedResult.data);

      setComparisonResults({
        baseline: baselineResult.data,
        simulated: simulatedResult.data,
        improvement
      });

      setSimulationState(prev => ({
        ...prev,
        results: simulatedResult.data,
        currentScenario: scenarioConfig
      }));

    } catch (error) {
      console.error('Simulation failed:', error);
    } finally {
      setSimulationState(prev => ({ ...prev, isRunning: false }));
    }
  };

  const calculateImprovement = (baseline, simulated) => {
    const delayImprovement = baseline.totalDelay - simulated.totalDelay;
    const throughputImprovement = simulated.throughput - baseline.throughput;
    const utilizationImprovement = simulated.utilization - baseline.utilization;

    return {
      delayReduction: delayImprovement,
      throughputIncrease: throughputImprovement,
      utilizationIncrease: utilizationImprovement,
      overallScore: (delayImprovement * 0.4) + (throughputImprovement * 0.3) + (utilizationImprovement * 0.3)
    };
  };

  const resetSimulation = () => {
    setScenarioConfig({
      name: '',
      type: 'precedence',
      parameters: {
        trainIds: [],
        precedenceOrder: [],
        crossingLocation: '',
        holdingStation: '',
        holdingDuration: 0,
        disruptionType: '',
        disruptionDuration: 0,
        delayAmount: 0
      }
    });
    setComparisonResults({ baseline: null, simulated: null, improvement: null });
    setSimulationState(prev => ({ ...prev, results: null, currentScenario: null }));
  };

  const saveScenario = () => {
    const newScenario = {
      id: Date.now(),
      ...scenarioConfig,
      results: simulationState.results,
      createdAt: new Date()
    };

    setSimulationState(prev => ({
      ...prev,
      scenarios: [...prev.scenarios, newScenario]
    }));

    alert('Scenario saved successfully!');
  };

  return (
    <div className="simulation-module">
      <div className="simulation-header">
        <div className="module-title">
          <h2>🔄 What-If Analysis & Simulation</h2>
          <p>Test different operational scenarios before applying in real-time</p>
        </div>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>

      <div className="simulation-grid">
        {/* Left Panel - Scenario Configuration */}
        <div className="simulation-panel">
          <div className="panel-header">
            <h3>📋 Scenario Configuration</h3>
          </div>
          
          <div className="panel-content">
            {/* Scenario Type Selection */}
            <div className="form-group">
              <label>Simulation Type</label>
              <div className="simulation-types">
                {simulationTypes.map(type => (
                  <div
                    key={type.id}
                    className={`simulation-type-card ${scenarioConfig.type === type.id ? 'selected' : ''}`}
                    onClick={() => setScenarioConfig(prev => ({ ...prev, type: type.id }))}
                  >
                    <div className="type-icon">{type.icon}</div>
                    <div className="type-name">{type.name}</div>
                    <div className="type-description">{type.description}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Scenario Name */}
            <div className="form-group">
              <label>Scenario Name</label>
              <input
                type="text"
                value={scenarioConfig.name}
                onChange={(e) => setScenarioConfig(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter scenario name"
              />
            </div>

            {/* Dynamic Parameters based on Type */}
            {scenarioConfig.type === 'precedence' && (
              <div className="parameter-section">
                <h4>Train Precedence Configuration</h4>
                <div className="form-group">
                  <label>Select Trains</label>
                  <div className="train-selector">
                    {simulationState.trains.slice(0, 4).map(train => (
                      <div key={train._id} className="train-option">
                        <input
                          type="checkbox"
                          id={train._id}
                          checked={scenarioConfig.parameters.trainIds.includes(train._id)}
                          onChange={(e) => {
                            const trainIds = e.target.checked
                              ? [...scenarioConfig.parameters.trainIds, train._id]
                              : scenarioConfig.parameters.trainIds.filter(id => id !== train._id);
                            setScenarioConfig(prev => ({
                              ...prev,
                              parameters: { ...prev.parameters, trainIds }
                            }));
                          }}
                        />
                        <label htmlFor={train._id}>
                          {train.trainId} ({train.type})
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {scenarioConfig.type === 'crossing' && (
              <div className="parameter-section">
                <h4>Crossing Location Configuration</h4>
                <div className="form-group">
                  <label>Crossing Point</label>
                  <select
                    value={scenarioConfig.parameters.crossingLocation}
                    onChange={(e) => setScenarioConfig(prev => ({
                      ...prev,
                      parameters: { ...prev.parameters, crossingLocation: e.target.value }
                    }))}
                  >
                    <option value="">Select crossing location</option>
                    <option value="loop_a">Loop A (Station Alpha)</option>
                    <option value="loop_b">Loop B (Junction Beta)</option>
                    <option value="loop_c">Loop C (Station Gamma)</option>
                  </select>
                </div>
              </div>
            )}

            {scenarioConfig.type === 'holding' && (
              <div className="parameter-section">
                <h4>Holding Strategy Configuration</h4>
                <div className="form-group">
                  <label>Holding Station</label>
                  <select
                    value={scenarioConfig.parameters.holdingStation}
                    onChange={(e) => setScenarioConfig(prev => ({
                      ...prev,
                      parameters: { ...prev.parameters, holdingStation: e.target.value }
                    }))}
                  >
                    <option value="">Select station</option>
                    <option value="station_a">Station Alpha</option>
                    <option value="station_b">Station Beta</option>
                    <option value="station_c">Station Gamma</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Holding Duration (minutes)</label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={scenarioConfig.parameters.holdingDuration}
                    onChange={(e) => setScenarioConfig(prev => ({
                      ...prev,
                      parameters: { ...prev.parameters, holdingDuration: parseInt(e.target.value) }
                    }))}
                  />
                </div>
              </div>
            )}

            {scenarioConfig.type === 'disruption' && (
              <div className="parameter-section">
                <h4>Disruption Simulation</h4>
                <div className="form-group">
                  <label>Disruption Type</label>
                  <select
                    value={scenarioConfig.parameters.disruptionType}
                    onChange={(e) => setScenarioConfig(prev => ({
                      ...prev,
                      parameters: { ...prev.parameters, disruptionType: e.target.value }
                    }))}
                  >
                    <option value="">Select disruption</option>
                    <option value="train_delay">Train Delay</option>
                    <option value="track_block">Track Blockage</option>
                    <option value="signal_failure">Signal Failure</option>
                    <option value="platform_unavailable">Platform Unavailable</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Delay Amount (minutes)</label>
                  <input
                    type="number"
                    min="0"
                    max="120"
                    value={scenarioConfig.parameters.delayAmount}
                    onChange={(e) => setScenarioConfig(prev => ({
                      ...prev,
                      parameters: { ...prev.parameters, delayAmount: parseInt(e.target.value) }
                    }))}
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="simulation-actions">
              <button
                className="action-btn btn-primary"
                onClick={runSimulation}
                disabled={simulationState.isRunning || !scenarioConfig.name}
              >
                {simulationState.isRunning ? (
                  <>
                    <div className="loading-spinner"></div>
                    Running...
                  </>
                ) : (
                  <>
                    ▶️ Run Simulation
                  </>
                )}
              </button>
              <button className="action-btn btn-secondary" onClick={resetSimulation}>
                🔄 Reset
              </button>
              <button
                className="action-btn btn-success"
                onClick={saveScenario}
                disabled={!simulationState.results}
              >
                💾 Save Scenario
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel - Results & Comparison */}
        <div className="simulation-panel">
          <div className="panel-header">
            <h3>📊 Simulation Results</h3>
          </div>
          
          <div className="panel-content">
            {comparisonResults.baseline && comparisonResults.simulated ? (
              <div className="results-container">
                {/* Performance Comparison */}
                <div className="comparison-table">
                  <h4>Performance Comparison</h4>
                  <table className="results-table">
                    <thead>
                      <tr>
                        <th>Metric</th>
                        <th>Current Plan</th>
                        <th>Simulated Plan</th>
                        <th>Improvement</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Total Delay</td>
                        <td>{comparisonResults.baseline.totalDelay} min</td>
                        <td>{comparisonResults.simulated.totalDelay} min</td>
                        <td className={comparisonResults.improvement.delayReduction > 0 ? 'improvement' : 'degradation'}>
                          {comparisonResults.improvement.delayReduction > 0 ? '-' : '+'}
                          {Math.abs(comparisonResults.improvement.delayReduction)} min
                        </td>
                      </tr>
                      <tr>
                        <td>Throughput</td>
                        <td>{comparisonResults.baseline.throughput} trains/hr</td>
                        <td>{comparisonResults.simulated.throughput} trains/hr</td>
                        <td className={comparisonResults.improvement.throughputIncrease > 0 ? 'improvement' : 'degradation'}>
                          {comparisonResults.improvement.throughputIncrease > 0 ? '+' : ''}
                          {comparisonResults.improvement.throughputIncrease} trains/hr
                        </td>
                      </tr>
                      <tr>
                        <td>Track Utilization</td>
                        <td>{comparisonResults.baseline.utilization}%</td>
                        <td>{comparisonResults.simulated.utilization}%</td>
                        <td className={comparisonResults.improvement.utilizationIncrease > 0 ? 'improvement' : 'degradation'}>
                          {comparisonResults.improvement.utilizationIncrease > 0 ? '+' : ''}
                          {comparisonResults.improvement.utilizationIncrease.toFixed(1)}%
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Overall Score */}
                <div className="overall-score">
                  <h4>Overall Performance Score</h4>
                  <div className={`score-display ${comparisonResults.improvement.overallScore > 0 ? 'positive' : 'negative'}`}>
                    <div className="score-value">
                      {comparisonResults.improvement.overallScore > 0 ? '+' : ''}
                      {comparisonResults.improvement.overallScore.toFixed(1)}
                    </div>
                    <div className="score-label">
                      {comparisonResults.improvement.overallScore > 0 ? 'IMPROVEMENT' : 'DEGRADATION'}
                    </div>
                  </div>
                </div>

                {/* Recommendation */}
                <div className="simulation-recommendation">
                  <h4>💡 Recommendation</h4>
                  <div className="recommendation-content">
                    {comparisonResults.improvement.overallScore > 0 ? (
                      <div className="recommendation positive">
                        <div className="recommendation-icon">✅</div>
                        <div className="recommendation-text">
                          <strong>Recommended:</strong> Apply this scenario in real operations.
                          Expected improvement of {comparisonResults.improvement.delayReduction} minutes delay reduction
                          and {comparisonResults.improvement.throughputIncrease} trains/hr throughput increase.
                        </div>
                      </div>
                    ) : (
                      <div className="recommendation negative">
                        <div className="recommendation-icon">❌</div>
                        <div className="recommendation-text">
                          <strong>Not Recommended:</strong> This scenario may worsen performance.
                          Consider alternative strategies or maintain current plan.
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Apply to Real Operations */}
                {comparisonResults.improvement.overallScore > 0 && (
                  <div className="apply-scenario">
                    <button className="action-btn btn-apply">
                      🚀 Apply to Real Operations
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="no-results">
                <div className="no-results-icon">📊</div>
                <div className="no-results-text">
                  Configure a scenario and run simulation to see results
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Saved Scenarios */}
      {simulationState.scenarios.length > 0 && (
        <div className="saved-scenarios">
          <h3>💾 Saved Scenarios</h3>
          <div className="scenarios-list">
            {simulationState.scenarios.map(scenario => (
              <div key={scenario.id} className="scenario-card">
                <div className="scenario-header">
                  <span className="scenario-name">{scenario.name}</span>
                  <span className="scenario-type">{scenario.type}</span>
                </div>
                <div className="scenario-date">
                  {scenario.createdAt.toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SimulationModule;