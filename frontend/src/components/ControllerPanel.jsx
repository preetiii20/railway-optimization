import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import './ControllerPanel.css';

const socket = io('http://localhost:5000');

const ControllerPanel = () => {
  const [trains, setTrains] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [selectedTrain, setSelectedTrain] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();

    // WebSocket listeners
    socket.on('trainUpdate', (data) => {
      console.log('Train update received:', data);
      // Update trains in real-time
    });

    socket.on('conflictDetected', (data) => {
      console.log('Conflict detected:', data);
      fetchData(); // Refresh data
    });

    return () => {
      socket.off('trainUpdate');
      socket.off('conflictDetected');
    };
  }, []);

  const fetchData = async () => {
    try {
      const [trainsRes, conflictsRes, recsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/ai/trains'),
        axios.get('http://localhost:5000/api/ai/conflicts'),
        axios.get('http://localhost:5000/api/ai/recommendations')
      ]);

      setTrains(trainsRes.data.data || []);
      setConflicts(conflictsRes.data.data.conflicts || []);
      setRecommendations(recsRes.data.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleTrainClick = (train) => {
    setSelectedTrain(train);
  };

  const handleInjectDelay = async () => {
    if (!selectedTrain) {
      alert('Please select a train first');
      return;
    }

    const delay = prompt('Enter delay in minutes:', '15');
    if (!delay) return;

    const station = selectedTrain.route[2]?.station_code || selectedTrain.route[0]?.station_code;

    try {
      const response = await axios.post('http://localhost:5000/api/ai/analyze-delay', {
        train_id: selectedTrain.train_id,
        station: station,
        delay_minutes: parseInt(delay),
        cause: 'manual_injection'
      });

      alert('Delay injected successfully!');
      console.log('Delay result:', response.data);
      fetchData();
    } catch (error) {
      console.error('Error injecting delay:', error);
      alert('Failed to inject delay');
    }
  };

  if (loading) {
    return <div className="loading">Loading Controller Panel...</div>;
  }

  return (
    <div className="controller-panel">
      <header className="panel-header">
        <h1>🎮 Railway Control Room - CSMT Operations</h1>
      </header>

      <div className="panel-grid">
        {/* Train List */}
        <div className="train-list-section">
          <h2>🚂 Train List</h2>
          <div className="train-list">
            {trains.slice(0, 10).map((train) => (
              <div
                key={train.train_id}
                className={`train-item ${selectedTrain?.train_id === train.train_id ? 'selected' : ''}`}
                onClick={() => handleTrainClick(train)}
              >
                <span className="train-status">
                  {train.train_type === 'express' ? '✅' : '🟡'}
                </span>
                <div className="train-info">
                  <p className="train-id">{train.train_id}</p>
                  <p className="train-name">{train.train_name}</p>
                </div>
                <span className="train-priority">P{train.priority}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Conflicts */}
        <div className="conflicts-section">
          <h2>🚨 Active Conflicts</h2>
          <div className="conflicts-list">
            {conflicts.slice(0, 5).map((conflict, index) => (
              <div key={index} className={`conflict-item ${conflict.severity}`}>
                <div className="conflict-header">
                  <span className="conflict-severity">
                    {conflict.severity === 'high' ? '🔴' : '🟡'}
                  </span>
                  <span className="conflict-type">{conflict.type}</span>
                </div>
                <p className="conflict-desc">{conflict.description}</p>
                <p className="conflict-station">Station: {conflict.station}</p>
              </div>
            ))}
            {conflicts.length === 0 && (
              <p className="no-conflicts">No active conflicts</p>
            )}
          </div>
        </div>

        {/* Selected Train Info */}
        <div className="train-info-section">
          <h2>📊 Selected Train Info</h2>
          {selectedTrain ? (
            <div className="train-details">
              <h3>{selectedTrain.train_name}</h3>
              <p><strong>Train ID:</strong> {selectedTrain.train_id}</p>
              <p><strong>Type:</strong> {selectedTrain.train_type}</p>
              <p><strong>Priority:</strong> {selectedTrain.priority}</p>
              <p><strong>Total Stations:</strong> {selectedTrain.total_stations}</p>
              <p><strong>Total Distance:</strong> {selectedTrain.total_distance} km</p>
              <p><strong>Source:</strong> {selectedTrain.source_name}</p>
              <p><strong>Destination:</strong> {selectedTrain.destination_name}</p>
            </div>
          ) : (
            <p className="no-selection">Click on a train to see details</p>
          )}
        </div>

        {/* AI Recommendations */}
        <div className="recommendations-section">
          <h2>🤖 AI Recommendations</h2>
          <div className="recommendations-list">
            {recommendations.slice(0, 3).map((rec, index) => (
              <div key={index} className="recommendation-item">
                <p className="rec-title">💡 {rec.strategy}</p>
                <p className="rec-action">{rec.action}</p>
                <div className="rec-buttons">
                  <button className="rec-btn apply">Apply</button>
                  <button className="rec-btn simulate">Simulate</button>
                </div>
              </div>
            ))}
            {recommendations.length === 0 && (
              <p className="no-recommendations">No recommendations available</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <button className="action-btn" onClick={handleInjectDelay}>
          Inject Delay
        </button>
        <button className="action-btn">Run Simulation</button>
        <button className="action-btn">Optimize Schedule</button>
        <button className="action-btn emergency">Emergency Stop</button>
      </div>
    </div>
  );
};

export default ControllerPanel;
