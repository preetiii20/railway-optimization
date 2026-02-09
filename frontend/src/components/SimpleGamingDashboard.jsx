import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { getTrains, getSections, getConflicts } from '../services/api';
import '../styles/gaming.css';

const socket = io('http://localhost:5000');

const SimpleGamingDashboard = () => {
  const [gameState, setGameState] = useState({
    trains: [],
    sections: [],
    conflicts: [],
    score: 1250,
    level: 3,
    streak: 7,
    systemHealth: 'optimal'
  });

  useEffect(() => {
    // Initialize data
    const initializeData = async () => {
      try {
        const [trainsRes, sectionsRes, conflictsRes] = await Promise.all([
          getTrains(),
          getSections(), 
          getConflicts()
        ]);

        setGameState(prev => ({
          ...prev,
          trains: trainsRes.data.data || [],
          sections: sectionsRes.data.data || [],
          conflicts: conflictsRes.data.data || []
        }));
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };

    initializeData();

    // Socket listeners
    socket.on('trainUpdate', (trains) => {
      setGameState(prev => ({ ...prev, trains }));
    });

    return () => {
      socket.off('trainUpdate');
    };
  }, []);

  return (
    <div className="gaming-dashboard dark-theme">
      {/* Gaming Header */}
      <header className="gaming-header">
        <div className="header-content">
          <div className="logo">🚂 RAILOPT</div>
          
          <div className="player-stats">
            <div className="stat-item">
              <span className="stat-label">SCORE</span>
              <span className="stat-value">{gameState.score.toLocaleString()}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">LEVEL</span>
              <span className="stat-value">{gameState.level}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">STREAK</span>
              <span className="stat-value">{gameState.streak}</span>
            </div>
          </div>
          
          <div className="status-indicators">
            <div className="status-indicator">
              <div className="status-dot online"></div>
              SYSTEM {gameState.systemHealth.toUpperCase()}
            </div>
            <div className="status-indicator">
              <div className="status-dot online"></div>
              {gameState.trains.length} TRAINS ACTIVE
            </div>
            <div className="status-indicator">
              <div className="status-dot warning"></div>
              {gameState.conflicts.length} CONFLICTS
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard */}
      <div className="dashboard-grid">
        {/* Command Center Panel */}
        <div className="gaming-panel">
          <div className="panel-header">
            <h3 className="panel-title">🎮 Command Center</h3>
          </div>
          
          <div className="command-grid">
            <button className="command-btn">
              <div className="command-icon">🤖</div>
              <div className="command-label">Auto Optimize</div>
            </button>
            <button className="command-btn">
              <div className="command-icon">🎮</div>
              <div className="command-label">Simulate</div>
            </button>
            <button className="command-btn">
              <div className="command-icon">🚨</div>
              <div className="command-label">Emergency</div>
            </button>
            <button className="command-btn">
              <div className="command-icon">⚡</div>
              <div className="command-label">Override</div>
            </button>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-value">{Math.floor(gameState.trains.length * 2.5)}</span>
              <span className="stat-label">Trains/Hour</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{gameState.trains.reduce((sum, t) => sum + (t.delay || 0), 0)}</span>
              <span className="stat-label">Total Delay</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">
                {gameState.trains.length > 0 
                  ? Math.floor((gameState.trains.filter(t => (t.delay || 0) === 0).length / gameState.trains.length) * 100)
                  : 100}%
              </span>
              <span className="stat-label">On Time</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">94%</span>
              <span className="stat-label">Accuracy</span>
            </div>
          </div>
        </div>

        {/* Live Network Panel */}
        <div className="gaming-panel">
          <div className="panel-header">
            <h3 className="panel-title">🗺️ Live Network</h3>
          </div>
          
          <div className="map-container">
            <div style={{ 
              height: '300px', 
              background: 'linear-gradient(135deg, #0a0a0f, #1a1a2e)',
              border: '2px solid var(--accent-secondary)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-primary)',
              fontSize: '1.2rem',
              fontFamily: 'Orbitron, monospace'
            }}>
              🗺️ INTERACTIVE MAP LOADING...
            </div>
          </div>

          {/* Train List */}
          <div className="train-list">
            <h4 style={{ color: 'var(--accent-primary)', marginBottom: '1rem' }}>🚂 Active Trains</h4>
            {gameState.trains.slice(0, 6).map(train => (
              <div key={train._id || train.id} className="train-item">
                <div className="train-info">
                  <h4>{train.name || train.trainId}</h4>
                  <p>{train.type} • Priority: {train.priority || 5}</p>
                </div>
                <div className={`train-status status-${train.status || 'running'}`}>
                  {train.status || 'RUNNING'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Recommendation Panel */}
      <div className="gaming-panel" style={{ marginTop: '2rem' }}>
        <div className="panel-header">
          <h3 className="panel-title">🤖 AI Assistant</h3>
        </div>
        
        <div className="ai-idle">
          <div className="ai-avatar">
            <div className="ai-pulse"></div>
            🧠
          </div>
          <p>AI is monitoring the network for optimization opportunities...</p>
          <div className="ai-stats">
            <div className="stat-item">
              <span>Accuracy</span>
              <span className="stat-value">94.2%</span>
            </div>
            <div className="stat-item">
              <span>Response Time</span>
              <span className="stat-value">1.2s</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleGamingDashboard;