import { useState, useEffect, useCallback } from 'react';
import io from 'socket.io-client';
import { getTrains, getSections, getConflicts, optimizeSchedule } from '../services/api';
import SimulationModule from './SimulationModule';
import '../styles/control-room.css';

const socket = io('http://localhost:5000');

const ControlRoomDashboard = ({ user, onLogout }) => {
  const [systemState, setSystemState] = useState({
    trains: [],
    sections: [],
    conflicts: [],
    activeConflict: null,
    aiRecommendation: null,
    systemStatus: 'operational',
    lastUpdate: new Date()
  });

  const [uiState, setUiState] = useState({
    selectedTrain: null,
    trainFilter: 'all', // all, express, freight, delayed
    viewMode: 'blocks', // blocks, map
    showExplanation: false,
    isProcessing: false,
    showSimulation: false
  });

  const [kpis, setKpis] = useState({
    totalTrains: 0,
    delayedTrains: 0,
    avgDelay: 0,
    throughput: 0,
    onTimePercentage: 95,
    activeConflicts: 0
  });

  useEffect(() => {
    initializeSystem();
    setupSocketListeners();
    
    // Update time every second
    const timeInterval = setInterval(() => {
      setSystemState(prev => ({ ...prev, lastUpdate: new Date() }));
    }, 1000);

    return () => {
      socket.off('trainUpdate');
      socket.off('conflictDetected');
      socket.off('aiRecommendation');
      clearInterval(timeInterval);
    };
  }, []);

  useEffect(() => {
    calculateKPIs();
  }, [systemState.trains, systemState.conflicts]);

  const initializeSystem = async () => {
    try {
      const [trainsRes, sectionsRes, conflictsRes] = await Promise.all([
        getTrains(),
        getSections(),
        getConflicts()
      ]);

      setSystemState(prev => ({
        ...prev,
        trains: trainsRes.data.data || [],
        sections: sectionsRes.data.data || [],
        conflicts: conflictsRes.data.data || []
      }));
    } catch (error) {
      console.error('Failed to initialize system:', error);
      setSystemState(prev => ({ ...prev, systemStatus: 'error' }));
    }
  };

  const setupSocketListeners = () => {
    socket.on('trainUpdate', (trains) => {
      setSystemState(prev => ({ ...prev, trains, lastUpdate: new Date() }));
    });

    socket.on('conflictDetected', (conflict) => {
      setSystemState(prev => ({
        ...prev,
        conflicts: [...prev.conflicts, conflict],
        activeConflict: conflict
      }));
    });

    socket.on('aiRecommendation', (recommendation) => {
      setSystemState(prev => ({ ...prev, aiRecommendation: recommendation }));
    });
  };

  const calculateKPIs = () => {
    const trains = systemState.trains;
    const conflicts = systemState.conflicts;

    if (trains.length === 0) return;

    const delayedTrains = trains.filter(t => (t.delay || 0) > 0);
    const totalDelay = trains.reduce((sum, t) => sum + (t.delay || 0), 0);
    const avgDelay = totalDelay / trains.length;
    const onTimeTrains = trains.filter(t => (t.delay || 0) === 0);
    const onTimePercentage = (onTimeTrains.length / trains.length) * 100;
    const throughput = Math.floor(trains.length * 2.5); // Simulated
    const activeConflicts = conflicts.filter(c => !c.resolved).length;

    setKpis({
      totalTrains: trains.length,
      delayedTrains: delayedTrains.length,
      avgDelay: avgDelay.toFixed(1),
      throughput,
      onTimePercentage: Math.floor(onTimePercentage),
      activeConflicts
    });
  };

  const handleTrainSelect = (train) => {
    setUiState(prev => ({ 
      ...prev, 
      selectedTrain: prev.selectedTrain?.id === train.id ? null : train 
    }));
  };

  const handleApplyRecommendation = async () => {
    if (!systemState.aiRecommendation) return;

    setUiState(prev => ({ ...prev, isProcessing: true }));
    
    try {
      await optimizeSchedule({
        recommendationId: systemState.aiRecommendation.id,
        action: 'apply'
      });
      
      setSystemState(prev => ({
        ...prev,
        activeConflict: null,
        aiRecommendation: null
      }));
    } catch (error) {
      console.error('Failed to apply recommendation:', error);
    } finally {
      setUiState(prev => ({ ...prev, isProcessing: false }));
    }
  };

  const getFilteredTrains = () => {
    let filtered = systemState.trains;
    
    switch (uiState.trainFilter) {
      case 'express':
        filtered = filtered.filter(t => t.type === 'express');
        break;
      case 'freight':
        filtered = filtered.filter(t => t.type === 'freight');
        break;
      case 'delayed':
        filtered = filtered.filter(t => (t.delay || 0) > 0);
        break;
      default:
        break;
    }
    
    return filtered;
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  const getSystemStatusColor = () => {
    if (systemState.systemStatus === 'error') return 'error';
    if (systemState.conflicts.filter(c => !c.resolved).length > 0) return 'warning';
    return 'online';
  };

  return (
    <div className="control-room-dashboard">
      {/* Header */}
      <header className="control-room-header">
        <div className="header-content">
          <div className="system-title">
            <span className="system-logo">🚦</span>
            <div>
              <span className="system-name">RailOpt Control Center</span>
              <span className="system-subtitle">AI-Powered Railway Operations</span>
            </div>
          </div>
          
          <div className="header-status">
            <div className="status-item">
              <div className={`status-dot ${getSystemStatusColor()}`}></div>
              <span>System {systemState.systemStatus.toUpperCase()}</span>
            </div>
            <div className="status-item">
              <div className="status-dot online"></div>
              <span>{kpis.totalTrains} Trains Active</span>
            </div>
            <div className="status-item">
              <div className={`status-dot ${kpis.activeConflicts > 0 ? 'warning' : 'online'}`}></div>
              <span>{kpis.activeConflicts} Conflicts</span>
            </div>
            <button 
              className="simulation-access-btn"
              onClick={() => setUiState(prev => ({ ...prev, showSimulation: true }))}
              title="Open What-If Analysis"
            >
              🔄 Simulation
            </button>
            <div className="user-info">
              <span className="user-name">{user?.name || 'Controller'}</span>
              <span className="user-role">{user?.role || 'controller'}</span>
            </div>
            <button className="logout-btn" onClick={onLogout}>
              🚪 Logout
            </button>
            <div className="current-time">
              {formatTime(systemState.lastUpdate)}
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced KPI Dashboard */}
      <div style={{ padding: '1rem 1rem 0' }}>
        <div className="enhanced-kpi-grid">
          <div className="kpi-card primary">
            <div className="kpi-header">
              <span className="kpi-icon">🚆</span>
              <span className="kpi-title">Trains Active</span>
            </div>
            <span className="kpi-value">{kpis.totalTrains}</span>
            <div className="kpi-trend trend-up">↗ +2 from last hour</div>
          </div>
          
          <div className="kpi-card warning">
            <div className="kpi-header">
              <span className="kpi-icon">⏱️</span>
              <span className="kpi-title">Avg Delay</span>
            </div>
            <span className="kpi-value">{kpis.avgDelay}m</span>
            <div className="kpi-trend trend-down">↘ -2m improvement</div>
          </div>
          
          <div className="kpi-card success">
            <div className="kpi-header">
              <span className="kpi-icon">📊</span>
              <span className="kpi-title">On Time %</span>
            </div>
            <span className="kpi-value">{kpis.onTimePercentage}%</span>
            <div className="kpi-trend trend-up">↗ +3% today</div>
          </div>
          
          <div className="kpi-card info">
            <div className="kpi-header">
              <span className="kpi-icon">🚀</span>
              <span className="kpi-title">Throughput</span>
            </div>
            <span className="kpi-value">{kpis.throughput}</span>
            <div className="kpi-trend trend-stable">→ Trains/Hour</div>
          </div>
          
          <div className="kpi-card danger">
            <div className="kpi-header">
              <span className="kpi-icon">⚠️</span>
              <span className="kpi-title">Conflicts</span>
            </div>
            <span className="kpi-value">{kpis.activeConflicts}</span>
            <div className="kpi-trend trend-stable">→ Active now</div>
          </div>
          
          <div className="kpi-card secondary">
            <div className="kpi-header">
              <span className="kpi-icon">🏗️</span>
              <span className="kpi-title">Platforms</span>
            </div>
            <span className="kpi-value">2/3</span>
            <div className="kpi-trend trend-stable">→ Available</div>
          </div>
        </div>
      </div>

      {/* Main 3-Panel Layout */}
      <div className="control-room-grid">
        {/* Left Panel - Train List */}
        <div className="control-panel">
          <div className="panel-header">
            <h3 className="panel-title">
              🚂 Active Trains
              <span className="panel-badge">{getFilteredTrains().length}</span>
            </h3>
          </div>
          
          <div className="panel-content">
            <div className="train-filters">
              {['all', 'express', 'freight', 'delayed'].map(filter => (
                <button
                  key={filter}
                  className={`filter-btn ${uiState.trainFilter === filter ? 'active' : ''}`}
                  onClick={() => setUiState(prev => ({ ...prev, trainFilter: filter }))}
                >
                  {filter.toUpperCase()}
                </button>
              ))}
            </div>
            
            <div className="train-list">
              {getFilteredTrains().map(train => (
                <div
                  key={train._id || train.id}
                  className={`train-item ${train.type} ${(train.delay || 0) > 0 ? 'delayed' : ''} ${
                    uiState.selectedTrain?.id === train.id ? 'selected' : ''
                  }`}
                  onClick={() => handleTrainSelect(train)}
                >
                  <div className="train-header">
                    <span className="train-number">{train.trainId || train.name}</span>
                    <span className="train-type">{train.type || 'local'}</span>
                  </div>
                  
                  <div className="train-details">
                    <div className="train-detail">
                      <span className="train-detail-label">Priority:</span>
                      <span className={`train-detail-value ${(train.priority || 5) > 7 ? 'priority-high' : ''}`}>
                        {train.priority || 5}/10
                      </span>
                    </div>
                    <div className="train-detail">
                      <span className="train-detail-label">Block:</span>
                      <span className="train-detail-value">{train.currentLocation || 'A-1'}</span>
                    </div>
                    <div className="train-detail">
                      <span className="train-detail-label">Delay:</span>
                      <span className={`train-detail-value ${(train.delay || 0) > 0 ? 'delayed' : ''}`}>
                        {(train.delay || 0) > 0 ? `+${train.delay}m` : 'On Time'}
                      </span>
                    </div>
                    <div className="train-detail">
                      <span className="train-detail-label">Speed:</span>
                      <span className="train-detail-value">{train.speed || 65} km/h</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center Panel - Track View */}
        <div className="control-panel">
          <div className="panel-header">
            <h3 className="panel-title">🛤️ Section Overview</h3>
            <div className="track-controls">
              <div className="view-selector">
                <button 
                  className={`view-btn ${uiState.viewMode === 'blocks' ? 'active' : ''}`}
                  onClick={() => setUiState(prev => ({ ...prev, viewMode: 'blocks' }))}
                >
                  Blocks
                </button>
                <button 
                  className={`view-btn ${uiState.viewMode === 'map' ? 'active' : ''}`}
                  onClick={() => setUiState(prev => ({ ...prev, viewMode: 'map' }))}
                >
                  Map
                </button>
              </div>
            </div>
          </div>
          
          <div className="panel-content">
            <div className="track-legend">
              <div className="legend-item">
                <div className="legend-color free"></div>
                <span>Free</span>
              </div>
              <div className="legend-item">
                <div className="legend-color occupied"></div>
                <span>Occupied</span>
              </div>
              <div className="legend-item">
                <div className="legend-color maintenance"></div>
                <span>Maintenance</span>
              </div>
            </div>
            
            <div className="track-diagram">
              {/* Enhanced Railway Network Layout */}
              <div className="railway-network">
                {/* Main Line with Junction */}
                <div className="main-junction">
                  {/* Incoming Tracks */}
                  <div className="track-section incoming-north">
                    <div className="track-line"></div>
                    <div className="train-on-track express" style={{ animationDelay: '0s' }}>
                      <span className="train-id">T101</span>
                    </div>
                  </div>
                  
                  <div className="track-section incoming-east">
                    <div className="track-line"></div>
                    <div className="train-on-track freight" style={{ animationDelay: '2s' }}>
                      <span className="train-id">F205</span>
                    </div>
                  </div>
                  
                  {/* Central Junction Block */}
                  <div className={`junction-block ${systemState.activeConflict ? 'conflict' : 'occupied'}`}>
                    <div className="block-label">JUNCTION C</div>
                    {systemState.activeConflict && (
                      <div className="conflict-indicator">
                        <span className="conflict-icon">⚠️</span>
                        <span className="conflict-text">CONFLICT</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Outgoing Tracks */}
                  <div className="track-section outgoing-south">
                    <div className="track-line"></div>
                  </div>
                  
                  <div className="track-section outgoing-west">
                    <div className="track-line"></div>
                    <div className="train-on-track passenger" style={{ animationDelay: '4s' }}>
                      <span className="train-id">P307</span>
                    </div>
                  </div>
                  
                  {/* Side Loops */}
                  <div className="loop-track loop-north">
                    <div className="track-line curved"></div>
                    <div className="loop-label">Loop A</div>
                  </div>
                  
                  <div className="loop-track loop-south">
                    <div className="track-line curved"></div>
                    <div className="loop-label">Loop B</div>
                  </div>
                </div>
                
                {/* Platform Status Indicators */}
                <div className="platform-status">
                  <div className="platform-indicator">
                    <div className="platform-dot occupied"></div>
                    <span>Platform 1: OCCUPIED</span>
                  </div>
                  <div className="platform-indicator">
                    <div className="platform-dot free"></div>
                    <span>Platform 2: FREE</span>
                  </div>
                  <div className="platform-indicator">
                    <div className="platform-dot maintenance"></div>
                    <span>Platform 3: MAINTENANCE</span>
                  </div>
                </div>
                
                {/* Signal Status */}
                <div className="signal-status">
                  <div className="signal-light green"></div>
                  <div className="signal-light red"></div>
                  <div className="signal-light yellow"></div>
                </div>
              </div>
              
              {/* Track Legend */}
              <div className="track-controls">
                <div className="legend-section">
                  <h4>Track Status</h4>
                  <div className="legend-items">
                    <div className="legend-item">
                      <div className="legend-color free"></div>
                      <span>Free</span>
                    </div>
                    <div className="legend-item">
                      <div className="legend-color occupied"></div>
                      <span>Occupied</span>
                    </div>
                    <div className="legend-item">
                      <div className="legend-color conflict"></div>
                      <span>Conflict</span>
                    </div>
                    <div className="legend-item">
                      <div className="legend-color maintenance"></div>
                      <span>Maintenance</span>
                    </div>
                  </div>
                </div>
                
                <div className="train-types">
                  <h4>Train Types</h4>
                  <div className="legend-items">
                    <div className="legend-item">
                      <div className="train-type-indicator express"></div>
                      <span>Express</span>
                    </div>
                    <div className="legend-item">
                      <div className="train-type-indicator freight"></div>
                      <span>Freight</span>
                    </div>
                    <div className="legend-item">
                      <div className="train-type-indicator passenger"></div>
                      <span>Passenger</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - AI Recommendations */}
        <div className="control-panel">
          <div className="panel-header">
            <h3 className="panel-title">🤖 AI Assistant</h3>
          </div>
          
          <div className="panel-content">
            {/* Active Conflict Alert */}
            {systemState.activeConflict && (
              <div className="conflict-alert">
                <div className="alert-header">
                  <span className="alert-icon">⚠️</span>
                  <span className="alert-title">Conflict Detected</span>
                  <span className="alert-time">
                    {new Date(systemState.activeConflict.detectedAt).toLocaleTimeString()}
                  </span>
                </div>
                <div className="conflict-details">
                  Trains {systemState.activeConflict.trainIds?.join(' vs ') || 'T101 vs T205'} 
                  require same resource at Block C
                </div>
              </div>
            )}

            {/* AI Recommendation */}
            {systemState.aiRecommendation && (
              <div className="ai-recommendation">
                <div className="recommendation-header">
                  <span className="ai-icon">🧠</span>
                  <span className="recommendation-title">Recommended Plan</span>
                  <span className="confidence-score">
                    {systemState.aiRecommendation.confidence || 94}%
                  </span>
                </div>
                
                <div className="recommendation-plan">
                  <div className="plan-step">
                    <span className="step-icon">✓</span>
                    <span>Give priority to Express T101</span>
                  </div>
                  <div className="plan-step">
                    <span className="step-icon">✓</span>
                    <span>Hold Freight T205 at Station B for 8 min</span>
                  </div>
                  <div className="plan-step">
                    <span className="step-icon">✓</span>
                    <span>Cross at Loop C when clear</span>
                  </div>
                </div>
                
                <div className="impact-metrics">
                  <div className="metric-card">
                    <span className="metric-value">-12m</span>
                    <span className="metric-label">Delay Reduction</span>
                  </div>
                  <div className="metric-card">
                    <span className="metric-value">2</span>
                    <span className="metric-label">Trains Affected</span>
                  </div>
                </div>
                
                <div className="action-buttons">
                  <button 
                    className="control-btn btn-accept"
                    onClick={handleApplyRecommendation}
                    disabled={uiState.isProcessing}
                  >
                    {uiState.isProcessing ? (
                      <>
                        <div className="loading-spinner"></div>
                        APPLYING...
                      </>
                    ) : (
                      <>
                        ✅ ACCEPT ADVICE
                      </>
                    )}
                  </button>
                  <button className="control-btn btn-ignore">
                    ❌ IGNORE ADVICE
                  </button>
                  <button 
                    className="control-btn btn-emergency"
                    onClick={() => setUiState(prev => ({ ...prev, showSimulation: true }))}
                  >
                    🚨 EMERGENCY DISPATCH
                  </button>
                  <button className="control-btn btn-pause">
                    ⏸️ PAUSE/RESUME
                  </button>
                </div>
                
                <div 
                  className="explanation-toggle"
                  onClick={() => setUiState(prev => ({ ...prev, showExplanation: !prev.showExplanation }))}
                >
                  👉 Why this plan? {uiState.showExplanation ? '▼' : '▶'}
                </div>
                
                {uiState.showExplanation && (
                  <div className="explanation-content">
                    • Express trains have higher priority in the system<br/>
                    • Loop C can accommodate freight train crossing<br/>
                    • 8-minute hold minimizes cascade delays<br/>
                    • Historical data shows 94% success rate for similar scenarios
                  </div>
                )}
              </div>
            )}

            {/* No Active Issues */}
            {!systemState.activeConflict && !systemState.aiRecommendation && (
              <div style={{ 
                textAlign: 'center', 
                padding: '2rem', 
                color: 'var(--text-muted)' 
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>✅</div>
                <div>All systems operational</div>
                <div style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  AI monitoring network for optimization opportunities
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Simulation Module Overlay */}
      {uiState.showSimulation && (
        <SimulationModule 
          onClose={() => setUiState(prev => ({ ...prev, showSimulation: false }))}
        />
      )}
    </div>
  );
};

export default ControlRoomDashboard;