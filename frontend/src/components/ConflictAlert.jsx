import React, { useState, useEffect } from 'react';

const ConflictAlert = ({ conflict, recommendation, onDecision }) => {
  const [alertLevel, setAlertLevel] = useState('medium');
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    if (conflict) {
      // Determine alert level based on conflict severity and time
      const severity = conflict.severity || 'medium';
      const detectedTime = new Date(conflict.detectedAt);
      const now = new Date();
      const elapsed = Math.floor((now - detectedTime) / 1000); // seconds
      
      setTimeElapsed(elapsed);
      
      if (elapsed > 300 || severity === 'critical') { // 5 minutes
        setAlertLevel('critical');
      } else if (elapsed > 120 || severity === 'high') { // 2 minutes
        setAlertLevel('high');
      } else {
        setAlertLevel('medium');
      }
    }
  }, [conflict]);

  useEffect(() => {
    // Update time elapsed every second
    const interval = setInterval(() => {
      if (conflict) {
        const detectedTime = new Date(conflict.detectedAt);
        const now = new Date();
        const elapsed = Math.floor((now - detectedTime) / 1000);
        setTimeElapsed(elapsed);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [conflict]);

  if (!conflict) return null;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getAlertIcon = () => {
    switch (alertLevel) {
      case 'critical': return '🚨';
      case 'high': return '⚠️';
      default: return '⚡';
    }
  };

  const getAlertColor = () => {
    switch (alertLevel) {
      case 'critical': return 'var(--accent-danger)';
      case 'high': return 'var(--accent-warning)';
      default: return 'var(--accent-info)';
    }
  };

  const handleQuickResolve = () => {
    onDecision({
      type: 'quick_resolve',
      conflictId: conflict.id,
      method: 'ai_recommendation',
      timestamp: new Date().toISOString()
    });
  };

  const handleManualResolve = () => {
    onDecision({
      type: 'manual_resolve',
      conflictId: conflict.id,
      method: 'manual_intervention',
      timestamp: new Date().toISOString()
    });
  };

  return (
    <div className={`conflict-alert alert-${alertLevel}`}>
      {/* Alert Header */}
      <div className="alert-header">
        <div className="alert-icon" style={{ color: getAlertColor() }}>
          {getAlertIcon()}
        </div>
        <div className="alert-title">
          <h3>CONFLICT DETECTED</h3>
          <div className="alert-meta">
            <span className="conflict-id">#{conflict.id?.slice(-6) || 'UNKNOWN'}</span>
            <span className="time-elapsed">{formatTime(timeElapsed)}</span>
          </div>
        </div>
        <div className={`severity-badge ${alertLevel}`}>
          {alertLevel.toUpperCase()}
        </div>
      </div>

      {/* Conflict Details */}
      <div className="conflict-details">
        <div className="detail-row">
          <span className="label">Trains Involved:</span>
          <span className="value trains">
            {conflict.trainIds?.join(' vs ') || 'Unknown trains'}
          </span>
        </div>
        
        <div className="detail-row">
          <span className="label">Resource:</span>
          <span className="value resource">
            {conflict.resourceType} - {conflict.resourceId}
          </span>
        </div>
        
        <div className="detail-row">
          <span className="label">Location:</span>
          <span className="value location">
            {conflict.location || 'Section boundary'}
          </span>
        </div>

        {conflict.description && (
          <div className="conflict-description">
            {conflict.description}
          </div>
        )}
      </div>

      {/* Impact Assessment */}
      <div className="impact-assessment">
        <h4>Potential Impact</h4>
        <div className="impact-grid">
          <div className="impact-item">
            <span className="impact-label">Delay Risk</span>
            <span className={`impact-value ${conflict.delayRisk || 'medium'}`}>
              {conflict.estimatedDelay || '5-10'} min
            </span>
          </div>
          <div className="impact-item">
            <span className="impact-label">Affected Trains</span>
            <span className="impact-value">
              {conflict.affectedTrains || conflict.trainIds?.length || 2}
            </span>
          </div>
          <div className="impact-item">
            <span className="impact-label">Cascade Risk</span>
            <span className={`impact-value ${conflict.cascadeRisk || 'low'}`}>
              {conflict.cascadeRisk?.toUpperCase() || 'LOW'}
            </span>
          </div>
        </div>
      </div>

      {/* AI Recommendation Preview */}
      {recommendation && (
        <div className="recommendation-preview">
          <h4>🤖 AI Recommendation</h4>
          <div className="recommendation-summary">
            {recommendation.summary || recommendation.description}
          </div>
          <div className="recommendation-confidence">
            Confidence: <span className="confidence-value">
              {recommendation.confidence || 85}%
            </span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="alert-actions">
        <button 
          className="action-btn quick-resolve"
          onClick={handleQuickResolve}
          disabled={!recommendation}
        >
          <span className="btn-icon">⚡</span>
          <span className="btn-text">
            {recommendation ? 'Apply AI Solution' : 'Generate Solution'}
          </span>
        </button>
        
        <button 
          className="action-btn manual-resolve"
          onClick={handleManualResolve}
        >
          <span className="btn-icon">🎮</span>
          <span className="btn-text">Manual Control</span>
        </button>
      </div>

      {/* Progress Indicator */}
      <div className="alert-progress">
        <div 
          className="progress-bar"
          style={{
            width: `${Math.min((timeElapsed / 300) * 100, 100)}%`,
            backgroundColor: getAlertColor()
          }}
        ></div>
      </div>
    </div>
  );
};

export default ConflictAlert;