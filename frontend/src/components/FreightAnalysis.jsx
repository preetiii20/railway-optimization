import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FreightAnalysis.css';

function FreightAnalysis({ trains, stations }) {
  const [freightPaths, setFreightPaths] = useState([]);
  const [optimization, setOptimization] = useState(null);
  const [loading, setLoading] = useState(false);

  const runOptimization = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/ai/optimize-freight', {
        passenger_trains: trains.filter(t => t.train_type !== 'freight'),
        time_window: 24 // hours
      });
      setFreightPaths(response.data.freight_paths);
      setOptimization(response.data.optimization);
    } catch (err) {
      console.error('Optimization error:', err);
    }
    setLoading(false);
  };

  const passengerTrains = trains.filter(t => t.train_type === 'express' || t.train_type === 'local').length;
  const freightTrains = trains.filter(t => t.train_type === 'freight').length;

  return (
    <div className="freight-analysis">
      <div className="freight-header">
        <h3>🚛 Freight Path Optimization</h3>
        <button onClick={runOptimization} disabled={loading}>
          {loading ? 'Optimizing...' : '🔄 Run AI Optimization'}
        </button>
      </div>

      <div className="freight-stats">
        <div className="stat-box">
          <div className="stat-value">{passengerTrains}</div>
          <div className="stat-label">Passenger Trains (Fixed)</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{freightTrains}</div>
          <div className="stat-label">Current Freight Trains</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{optimization?.additional_paths || 0}</div>
          <div className="stat-label">Additional Freight Paths</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{optimization?.throughput_increase || 0}%</div>
          <div className="stat-label">Throughput Increase</div>
        </div>
      </div>

      {optimization && (
        <div className="optimization-results">
          <h4>🎯 Optimization Results</h4>
          <div className="result-grid">
            <div className="result-item">
              <span className="result-label">Algorithm Used:</span>
              <span className="result-value">{optimization.algorithm}</span>
            </div>
            <div className="result-item">
              <span className="result-label">Computation Time:</span>
              <span className="result-value">{optimization.computation_time}ms</span>
            </div>
            <div className="result-item">
              <span className="result-label">Feasible Paths Found:</span>
              <span className="result-value">{optimization.feasible_paths}</span>
            </div>
            <div className="result-item">
              <span className="result-label">Constraint Violations:</span>
              <span className="result-value">{optimization.violations || 0}</span>
            </div>
          </div>
        </div>
      )}

      <div className="freight-paths">
        <h4>📋 Optimized Freight Paths</h4>
        {freightPaths.length === 0 ? (
          <p className="no-data">Click "Run AI Optimization" to generate freight paths</p>
        ) : (
          <div className="paths-list">
            {freightPaths.map((path, idx) => (
              <div key={idx} className="path-card">
                <div className="path-header">
                  <span className="path-id">Freight Path #{idx + 1}</span>
                  <span className="path-score">Score: {path.score?.toFixed(2)}</span>
                </div>
                <div className="path-details">
                  <p><strong>Route:</strong> {path.origin} → {path.destination}</p>
                  <p><strong>Departure:</strong> {path.departure_time}</p>
                  <p><strong>Arrival:</strong> {path.arrival_time}</p>
                  <p><strong>Duration:</strong> {path.duration} hours</p>
                  <p><strong>Conflicts:</strong> {path.conflicts || 0}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default FreightAnalysis;
