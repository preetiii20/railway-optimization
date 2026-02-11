import React, { useState } from 'react';
import axios from 'axios';
import './InfrastructurePlanner.css';

function InfrastructurePlanner({ stations }) {
  const [nlInput, setNlInput] = useState('');
  const [simulation, setSimulation] = useState(null);
  const [loading, setLoading] = useState(false);

  const runSimulation = async () => {
    if (!nlInput.trim()) return;
    
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/ai/simulate-infrastructure', {
        natural_language_input: nlInput,
        current_network: Object.values(stations)
      });
      setSimulation(response.data);
    } catch (err) {
      console.error('Simulation error:', err);
    }
    setLoading(false);
  };

  const examples = [
    "Add loop line between Dadar and Kurla",
    "Install new signal at Bandra station",
    "Add extra track from CSMT to Thane",
    "Increase headway to 3 minutes on Western line"
  ];

  return (
    <div className="infrastructure-planner">
      <div className="planner-header">
        <h3>🏗️ Infrastructure Impact Simulator</h3>
        <p>Describe infrastructure changes in natural language</p>
      </div>

      <div className="nl-input-section">
        <textarea
          value={nlInput}
          onChange={(e) => setNlInput(e.target.value)}
          placeholder="Example: Add loop line between Dadar and Kurla"
          rows={3}
        />
        <button onClick={runSimulation} disabled={loading}>
          {loading ? 'Simulating...' : '🚀 Simulate Impact'}
        </button>
      </div>

      <div className="examples-section">
        <p><strong>Try these examples:</strong></p>
        {examples.map((ex, idx) => (
          <button 
            key={idx} 
            className="example-btn"
            onClick={() => setNlInput(ex)}
          >
            {ex}
          </button>
        ))}
      </div>

      {simulation && (
        <div className="simulation-results">
          <h4>📊 Simulation Results</h4>
          
          <div className="parsed-input">
            <h5>🔍 Parsed Input:</h5>
            <div className="parsed-details">
              <p><strong>Action:</strong> {simulation.parsed?.action}</p>
              <p><strong>Type:</strong> {simulation.parsed?.infrastructure_type}</p>
              <p><strong>Location:</strong> {simulation.parsed?.stations?.join(' → ')}</p>
            </div>
          </div>

          <div className="comparison-grid">
            <div className="comparison-card before">
              <h5>📉 Before Upgrade</h5>
              <div className="metric">
                <span>Freight Capacity:</span>
                <span className="value">{simulation.before?.freight_capacity} trains/day</span>
              </div>
              <div className="metric">
                <span>Avg Headway:</span>
                <span className="value">{simulation.before?.avg_headway} min</span>
              </div>
              <div className="metric">
                <span>Loop Utilization:</span>
                <span className="value">{simulation.before?.loop_utilization}%</span>
              </div>
              <div className="metric">
                <span>Conflicts/Day:</span>
                <span className="value">{simulation.before?.conflicts_per_day}</span>
              </div>
            </div>

            <div className="comparison-arrow">→</div>

            <div className="comparison-card after">
              <h5>📈 After Upgrade</h5>
              <div className="metric">
                <span>Freight Capacity:</span>
                <span className="value improved">{simulation.after?.freight_capacity} trains/day</span>
              </div>
              <div className="metric">
                <span>Avg Headway:</span>
                <span className="value improved">{simulation.after?.avg_headway} min</span>
              </div>
              <div className="metric">
                <span>Loop Utilization:</span>
                <span className="value improved">{simulation.after?.loop_utilization}%</span>
              </div>
              <div className="metric">
                <span>Conflicts/Day:</span>
                <span className="value improved">{simulation.after?.conflicts_per_day}</span>
              </div>
            </div>
          </div>

          <div className="impact-summary">
            <h5>💰 Cost-Benefit Analysis</h5>
            <div className="impact-grid">
              <div className="impact-item">
                <span className="impact-label">Estimated Cost:</span>
                <span className="impact-value">₹{simulation.cost?.toLocaleString()} Cr</span>
              </div>
              <div className="impact-item">
                <span className="impact-label">Additional Revenue:</span>
                <span className="impact-value">₹{simulation.revenue?.toLocaleString()} Cr/year</span>
              </div>
              <div className="impact-item">
                <span className="impact-label">ROI Period:</span>
                <span className="impact-value">{simulation.roi_years} years</span>
              </div>
              <div className="impact-item">
                <span className="impact-label">Feasibility:</span>
                <span className={`impact-value ${simulation.feasibility}`}>
                  {simulation.feasibility}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InfrastructurePlanner;
