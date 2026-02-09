import { useState } from 'react';

const CommandCenter = ({ gameState, onDecision }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const getSystemHealth = () => {
    const totalTrains = gameState.trains.length;
    const delayedTrains = gameState.trains.filter(t => t.delay > 0).length;
    const activeConflicts = gameState.conflicts.filter(c => !c.resolved).length;
    
    if (activeConflicts > 3) return { status: 'critical', color: 'red', percentage: 25 };
    if (delayedTrains > totalTrains * 0.3) return { status: 'warning', color: 'orange', percentage: 60 };
    return { status: 'optimal', color: 'green', percentage: 95 };
  };

  const systemHealth = getSystemHealth();

  return (
    <div className="command-center">
      <div className="command-header">
        <h2 className="command-title">
          <span className="icon">🎮</span>
          COMMAND CENTER
        </h2>
        <div className="system-health">
          <div className="health-bar">
            <div 
              className="health-fill" 
              style={{ 
                width: `${systemHealth.percentage}%`,
                backgroundColor: systemHealth.color 
              }}
            ></div>
          </div>
          <span className="health-text">{systemHealth.status.toUpperCase()}</span>
        </div>
      </div>

      <div className="command-tabs">
        {['overview', 'conflicts', 'analytics'].map(tab => (
          <button
            key={tab}
            className={`tab-button ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="command-content">
        {activeTab === 'overview' && (
          <OverviewPanel gameState={gameState} />
        )}
        {activeTab === 'conflicts' && (
          <ConflictsPanel 
            conflicts={gameState.conflicts} 
            onDecision={onDecision}
          />
        )}
        {activeTab === 'analytics' && (
          <AnalyticsPanel gameState={gameState} />
        )}
      </div>
    </div>
  );
};

const OverviewPanel = ({ gameState }) => {
  const stats = {
    totalTrains: gameState.trains.length,
    activeSections: gameState.sections.filter(s => s.status !== 'blocked').length,
    avgDelay: gameState.trains.reduce((sum, t) => sum + t.delay, 0) / gameState.trains.length || 0,
    throughput: Math.floor(gameState.trains.length * 60 / 24) // trains per hour
  };

  return (
    <div className="overview-panel">
      <div className="stats-grid">
        <div className="stat-card trains">
          <div className="stat-icon">🚂</div>
          <div className="stat-info">
            <div className="stat-number">{stats.totalTrains}</div>
            <div className="stat-label">Active Trains</div>
          </div>
        </div>
        
        <div className="stat-card sections">
          <div className="stat-icon">🛤️</div>
          <div className="stat-info">
            <div className="stat-number">{stats.activeSections}</div>
            <div className="stat-label">Open Sections</div>
          </div>
        </div>
        
        <div className="stat-card delay">
          <div className="stat-icon">⏱️</div>
          <div className="stat-info">
            <div className="stat-number">{stats.avgDelay.toFixed(1)}m</div>
            <div className="stat-label">Avg Delay</div>
          </div>
        </div>
        
        <div className="stat-card throughput">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <div className="stat-number">{stats.throughput}</div>
            <div className="stat-label">Trains/Hour</div>
          </div>
        </div>
      </div>

      <div className="recent-activity">
        <h3>Recent Activity</h3>
        <div className="activity-list">
          {gameState.trains.slice(0, 5).map(train => (
            <div key={train._id} className="activity-item">
              <div className="activity-icon">
                {train.delay > 0 ? '🔴' : '🟢'}
              </div>
              <div className="activity-text">
                Train {train.trainId} - {train.status}
                {train.delay > 0 && ` (+${train.delay}m)`}
              </div>
              <div className="activity-time">
                {new Date().toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ConflictsPanel = ({ conflicts, onDecision }) => {
  const activeConflicts = conflicts.filter(c => !c.resolved);

  return (
    <div className="conflicts-panel">
      <div className="conflicts-header">
        <h3>Active Conflicts ({activeConflicts.length})</h3>
        <div className="priority-legend">
          <span className="priority high">🔴 High</span>
          <span className="priority medium">🟡 Medium</span>
          <span className="priority low">🟢 Low</span>
        </div>
      </div>

      <div className="conflicts-list">
        {activeConflicts.map(conflict => (
          <div key={conflict._id} className={`conflict-card ${conflict.severity}`}>
            <div className="conflict-header">
              <div className="conflict-id">#{conflict._id.slice(-6)}</div>
              <div className={`severity-badge ${conflict.severity}`}>
                {conflict.severity.toUpperCase()}
              </div>
            </div>
            
            <div className="conflict-details">
              <div className="trains-involved">
                Trains: {conflict.trainIds.join(', ')}
              </div>
              <div className="conflict-description">
                {conflict.description}
              </div>
              <div className="conflict-time">
                Detected: {new Date(conflict.detectedAt).toLocaleTimeString()}
              </div>
            </div>

            <div className="conflict-actions">
              <button 
                className="action-btn resolve"
                onClick={() => onDecision({ 
                  type: 'resolve', 
                  conflictId: conflict._id,
                  optimal: true 
                })}
              >
                🎯 AUTO RESOLVE
              </button>
              <button 
                className="action-btn manual"
                onClick={() => onDecision({ 
                  type: 'manual', 
                  conflictId: conflict._id,
                  optimal: false 
                })}
              >
                🎮 MANUAL
              </button>
            </div>
          </div>
        ))}
      </div>

      {activeConflicts.length === 0 && (
        <div className="no-conflicts">
          <div className="success-icon">✅</div>
          <div className="success-text">All Clear! No Active Conflicts</div>
        </div>
      )}
    </div>
  );
};

const AnalyticsPanel = ({ gameState }) => {
  const analytics = {
    efficiency: Math.floor((gameState.trains.filter(t => t.delay === 0).length / gameState.trains.length) * 100) || 0,
    conflictResolutionRate: Math.floor((gameState.conflicts.filter(c => c.resolved).length / gameState.conflicts.length) * 100) || 0,
    systemUptime: '99.8%',
    aiAccuracy: '94.2%'
  };

  return (
    <div className="analytics-panel">
      <div className="performance-metrics">
        <h3>Performance Metrics</h3>
        
        <div className="metric-item">
          <div className="metric-label">System Efficiency</div>
          <div className="metric-bar">
            <div 
              className="metric-fill efficiency" 
              style={{ width: `${analytics.efficiency}%` }}
            ></div>
          </div>
          <div className="metric-value">{analytics.efficiency}%</div>
        </div>

        <div className="metric-item">
          <div className="metric-label">Conflict Resolution</div>
          <div className="metric-bar">
            <div 
              className="metric-fill resolution" 
              style={{ width: `${analytics.conflictResolutionRate}%` }}
            ></div>
          </div>
          <div className="metric-value">{analytics.conflictResolutionRate}%</div>
        </div>

        <div className="metric-item">
          <div className="metric-label">AI Accuracy</div>
          <div className="metric-bar">
            <div 
              className="metric-fill ai" 
              style={{ width: '94%' }}
            ></div>
          </div>
          <div className="metric-value">{analytics.aiAccuracy}</div>
        </div>
      </div>

      <div className="achievement-section">
        <h3>Achievements</h3>
        <div className="achievements-grid">
          <div className="achievement unlocked">
            <div className="achievement-icon">🏆</div>
            <div className="achievement-name">Conflict Master</div>
          </div>
          <div className="achievement unlocked">
            <div className="achievement-icon">⚡</div>
            <div className="achievement-name">Speed Demon</div>
          </div>
          <div className="achievement locked">
            <div className="achievement-icon">🎯</div>
            <div className="achievement-name">Perfect Day</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandCenter;