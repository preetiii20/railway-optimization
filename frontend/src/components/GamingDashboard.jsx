import { useState, useEffect, useCallback } from 'react';
import io from 'socket.io-client';
import { getTrains, getSections, getConflicts, optimizeSchedule } from '../services/api';
import CommandCenter from './CommandCenter';
import LiveMap from './LiveMap';
import AIRecommendationPanel from './AIRecommendationPanel';
import ConflictAlert from './ConflictAlert';
import KPIGamingPanel from './KPIGamingPanel';
import TrainControlPanel from './TrainControlPanel';
import '../styles/gaming.css';

const socket = io('http://localhost:5000');

const GamingDashboard = ({ userRole = 'controller' }) => {
  const [gameState, setGameState] = useState({
    trains: [],
    sections: [],
    conflicts: [],
    activeConflict: null,
    aiRecommendation: null,
    score: 0,
    level: 1,
    streak: 0,
    totalDelay: 0,
    throughput: 0,
    onTimePercentage: 95,
    systemHealth: 'optimal'
  });

  const [uiState, setUiState] = useState({
    selectedTrain: null,
    mapMode: 'overview', // overview, detailed, conflict
    alertsVisible: true,
    soundEnabled: true,
    theme: 'dark', // dark, neon, classic
    sidebarCollapsed: false,
    notifications: [],
    isProcessing: false
  });

  const [userStats, setUserStats] = useState({
    decisionsToday: 0,
    accuracyRate: 0,
    avgResponseTime: 0,
    conflictsResolved: 0
  });

  useEffect(() => {
    initializeGame();
    setupSocketListeners();
    return () => {
      socket.off('trainUpdate');
      socket.off('conflictDetected');
      socket.off('aiRecommendation');
    };
  }, []);

  const initializeGame = async () => {
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
      console.error('Failed to initialize game:', error);
    }
  };

  const setupSocketListeners = () => {
    socket.on('trainUpdate', (updatedTrains) => {
      setGameState(prev => ({ ...prev, trains: updatedTrains }));
    });

    socket.on('conflictDetected', (conflict) => {
      setGameState(prev => ({
        ...prev,
        conflicts: [...prev.conflicts, conflict],
        activeConflict: conflict
      }));
      
      if (uiState.soundEnabled) {
        playAlertSound();
      }
    });

    socket.on('aiRecommendation', (recommendation) => {
      setGameState(prev => ({ ...prev, aiRecommendation: recommendation }));
    });
  };

  const playAlertSound = useCallback(() => {
    if (!uiState.soundEnabled) return;
    
    try {
      // Gaming-style alert sound
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.warn('Audio not supported:', error);
    }
  }, [uiState.soundEnabled]);

  const addNotification = useCallback((message, type = 'info', duration = 5000) => {
    const notification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date()
    };
    
    setUiState(prev => ({
      ...prev,
      notifications: [...prev.notifications, notification]
    }));

    setTimeout(() => {
      setUiState(prev => ({
        ...prev,
        notifications: prev.notifications.filter(n => n.id !== notification.id)
      }));
    }, duration);
  }, []);

  const handleOptimization = async (conflictId, decision) => {
    setUiState(prev => ({ ...prev, isProcessing: true }));
    
    try {
      const response = await optimizeSchedule({
        conflictId,
        decision,
        trains: gameState.trains,
        sections: gameState.sections
      });

      if (response.data.success) {
        addNotification('✅ Optimization completed successfully', 'success');
        setGameState(prev => ({
          ...prev,
          aiRecommendation: response.data.recommendation,
          conflicts: prev.conflicts.filter(c => c.id !== conflictId)
        }));
      }
    } catch (error) {
      addNotification('❌ Optimization failed', 'error');
      console.error('Optimization error:', error);
    } finally {
      setUiState(prev => ({ ...prev, isProcessing: false }));
    }
  };

  const handleDecision = async (decision) => {
    try {
      // Update score based on decision quality
      const scoreIncrease = calculateScore(decision);
      setGameState(prev => ({
        ...prev,
        score: prev.score + scoreIncrease,
        streak: decision.optimal ? prev.streak + 1 : 0,
        activeConflict: null
      }));

      // Level up logic
      if (gameState.score > gameState.level * 1000) {
        setGameState(prev => ({ ...prev, level: prev.level + 1 }));
      }

    } catch (error) {
      console.error('Decision processing failed:', error);
    }
  };

  const calculateScore = (decision) => {
    let score = 100; // Base score
    if (decision.optimal) score += 50;
    if (decision.delayReduction > 0) score += decision.delayReduction * 10;
    if (gameState.streak > 0) score += gameState.streak * 25; // Streak bonus
    return score;
  };

  return (
    <div className={`gaming-dashboard ${uiState.theme}-theme`}>
      {/* Gaming HUD Header */}
      <header className="gaming-header">
        <div className="header-content">
          <div className="logo">
            🚂 RAILOPT
          </div>
          
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
            <div className={`status-indicator ${gameState.systemHealth}`}>
              <div className="status-dot online"></div>
              SYSTEM {gameState.systemHealth.toUpperCase()}
            </div>
            <div className="status-indicator">
              <div className="status-dot online"></div>
              {gameState.trains.length} TRAINS ACTIVE
            </div>
            <div className="status-indicator">
              <div className={`status-dot ${gameState.conflicts.length > 0 ? 'warning' : 'online'}`}></div>
              {gameState.conflicts.length} CONFLICTS
            </div>
          </div>
        </div>
      </header>

      {/* Main Gaming Interface */}
      <div className="dashboard-grid">
        {/* Left Panel - Command & Stats */}
        <div className="gaming-panel">
          <div className="panel-header">
            <h3 className="panel-title">Command Center</h3>
            <div className="panel-controls">
              <button 
                className="gaming-btn btn-small btn-secondary"
                onClick={() => setUiState(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }))}
              >
                {uiState.soundEnabled ? '🔊' : '🔇'}
              </button>
            </div>
          </div>
          
          <CommandCenter 
            gameState={gameState}
            onDecision={handleDecision}
            onOptimize={handleOptimization}
            userRole={userRole}
            isProcessing={uiState.isProcessing}
          />
          
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-value">{gameState.throughput}</span>
              <span className="stat-label">Trains/Hour</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{gameState.totalDelay}</span>
              <span className="stat-label">Total Delay</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{gameState.onTimePercentage}%</span>
              <span className="stat-label">On Time</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{userStats.accuracyRate}%</span>
              <span className="stat-label">Accuracy</span>
            </div>
          </div>
        </div>

        {/* Right Panel - Map & AI */}
        <div className="gaming-panel">
          <div className="panel-header">
            <h3 className="panel-title">Live Network</h3>
            <div className="panel-controls">
              <button 
                className="gaming-btn btn-small btn-secondary"
                onClick={() => setUiState(prev => ({ 
                  ...prev, 
                  mapMode: prev.mapMode === 'overview' ? 'detailed' : 'overview' 
                }))}
              >
                {uiState.mapMode === 'overview' ? '🔍' : '🗺️'}
              </button>
            </div>
          </div>
          
          <div className="map-container">
            <LiveMap 
              trains={gameState.trains}
              sections={gameState.sections}
              conflicts={gameState.conflicts}
              mode={uiState.mapMode}
              selectedTrain={uiState.selectedTrain}
              onTrainSelect={(train) => setUiState(prev => ({ ...prev, selectedTrain: train }))}
            />
            
            {gameState.activeConflict && (
              <div className="map-overlay">
                <ConflictAlert 
                  conflict={gameState.activeConflict}
                  recommendation={gameState.aiRecommendation}
                  onDecision={handleDecision}
                />
              </div>
            )}
          </div>

          {/* AI Recommendation Panel */}
          {gameState.aiRecommendation && (
            <AIRecommendationPanel 
              recommendation={gameState.aiRecommendation}
              onAccept={() => handleDecision({ type: 'accept', optimal: true })}
              onOverride={() => handleDecision({ type: 'override', optimal: false })}
              onSimulate={() => handleDecision({ type: 'simulate', optimal: null })}
              isProcessing={uiState.isProcessing}
            />
          )}

          {/* Train List */}
          <div className="train-list">
            {gameState.trains.slice(0, 8).map(train => (
              <div 
                key={train.id} 
                className={`train-item ${uiState.selectedTrain?.id === train.id ? 'selected' : ''}`}
                onClick={() => setUiState(prev => ({ ...prev, selectedTrain: train }))}
              >
                <div className="train-info">
                  <h4>{train.name || train.id}</h4>
                  <p>{train.type} • Priority: {train.priority}</p>
                </div>
                <div className={`train-status status-${train.status}`}>
                  {train.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gaming Notifications */}
      <div className="notification-area">
        {uiState.notifications.map(notification => (
          <div key={notification.id} className={`game-notification ${notification.type}`}>
            {notification.message}
          </div>
        ))}
      </div>

      {/* Processing Overlay */}
      {uiState.isProcessing && (
        <div className="processing-overlay">
          <div className="processing-spinner">
            <div className="spinner"></div>
            <p>AI PROCESSING...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GamingDashboard;