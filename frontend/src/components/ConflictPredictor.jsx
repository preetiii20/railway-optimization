import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ConflictPredictor.css';

function ConflictPredictor({ trains, conflicts }) {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    predictConflicts();
    const interval = setInterval(predictConflicts, 30000);
    return () => clearInterval(interval);
  }, [trains]);

  const predictConflicts = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/ai/predict-conflicts', {
        current_trains: trains,
        time_horizon: 30 // minutes
      });
      setPredictions(response.data.predictions);
    } catch (err) {
      console.error('Prediction error:', err);
    }
    setLoading(false);
  };

  const takeAction = async (prediction, action) => {
    try {
      await axios.post('http://localhost:5000/api/ai/resolve-conflict', {
        prediction_id: prediction.id,
        action: action
      });
      alert(`Action "${action}" executed successfully!`);
      predictConflicts(); // Refresh predictions
    } catch (err) {
      console.error('Action error:', err);
    }
  };

  return (
    <div className="conflict-predictor">
      <div className="predictor-header">
        <h3>🔮 AI Conflict Prediction</h3>
        <button onClick={predictConflicts} disabled={loading}>
          {loading ? 'Predicting...' : '🔄 Refresh Predictions'}
        </button>
      </div>

      <div className="prediction-stats">
        <div className="stat-card">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <div className="stat-value">{predictions.length}</div>
            <div className="stat-label">Predicted Conflicts (Next 30 min)</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔴</div>
          <div className="stat-content">
            <div className="stat-value">
              {predictions.filter(p => p.probability > 0.7).length}
            </div>
            <div className="stat-label">High Probability (&gt;70%)</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏱️</div>
          <div className="stat-content">
            <div className="stat-value">{conflicts.length}</div>
            <div className="stat-label">Current Active Conflicts</div>
          </div>
        </div>
      </div>

      <div className="predictions-list">
        <h4>📋 Predicted Conflicts</h4>
        {predictions.length === 0 ? (
          <div className="no-predictions">
            <p>✅ No conflicts predicted in the next 30 minutes</p>
          </div>
        ) : (
          predictions.map((pred, idx) => (
            <div key={idx} className={`prediction-card severity-${pred.severity}`}>
              <div className="prediction-header">
                <div className="prediction-title">
                  <span className="prediction-icon">⚠️</span>
                  <span>{pred.type}</span>
                </div>
                <div className="prediction-probability">
                  <span className="prob-value">{(pred.probability * 100).toFixed(0)}%</span>
                  <span className="prob-label">Probability</span>
                </div>
              </div>

              <div className="prediction-details">
                <p><strong>Trains:</strong> {pred.train1_id} & {pred.train2_id}</p>
                <p><strong>Location:</strong> {pred.station}</p>
                <p><strong>Expected Time:</strong> {pred.expected_time}</p>
                <p><strong>Impact:</strong> {pred.impact_description}</p>
              </div>

              <div className="ai-recommendation">
                <h5>🤖 AI Recommendation:</h5>
                <p>{pred.recommendation}</p>
              </div>

              <div className="action-buttons">
                <button 
                  className="action-btn delay"
                  onClick={() => takeAction(pred, 'delay')}
                >
                  ⏱️ Delay Train {pred.suggested_delay_train}
                </button>
                <button 
                  className="action-btn reroute"
                  onClick={() => takeAction(pred, 'reroute')}
                >
                  🔄 Reroute via Loop
                </button>
                <button 
                  className="action-btn alert"
                  onClick={() => takeAction(pred, 'alert')}
                >
                  📢 Send Alert
                </button>
                <button 
                  className="action-btn ignore"
                  onClick={() => takeAction(pred, 'ignore')}
                >
                  ❌ Ignore
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ConflictPredictor;
