import React, { useState } from 'react';
import TimeDistanceGraph from './TimeDistanceGraph';
import FreightAnalysis from './FreightAnalysis';
import InfrastructurePlanner from './InfrastructurePlanner';
import ConflictPredictor from './ConflictPredictor';
import './AdvancedVisualization.css';

function AdvancedVisualization({ trains, stations, conflicts }) {
  const [activeTab, setActiveTab] = useState('time-distance');

  return (
    <div className="advanced-visualization">
      <div className="viz-tabs">
        <button 
          className={activeTab === 'time-distance' ? 'active' : ''}
          onClick={() => setActiveTab('time-distance')}
        >
          📊 Time-Distance Graph
        </button>
        <button 
          className={activeTab === 'freight' ? 'active' : ''}
          onClick={() => setActiveTab('freight')}
        >
          🚛 Freight Optimization
        </button>
        <button 
          className={activeTab === 'infrastructure' ? 'active' : ''}
          onClick={() => setActiveTab('infrastructure')}
        >
          🏗️ Infrastructure Planner
        </button>
        <button 
          className={activeTab === 'prediction' ? 'active' : ''}
          onClick={() => setActiveTab('prediction')}
        >
          🔮 Conflict Prediction
        </button>
      </div>

      <div className="viz-content">
        {activeTab === 'time-distance' && (
          <TimeDistanceGraph trains={trains} stations={stations} conflicts={conflicts} />
        )}
        {activeTab === 'freight' && (
          <FreightAnalysis trains={trains} stations={stations} />
        )}
        {activeTab === 'infrastructure' && (
          <InfrastructurePlanner stations={stations} />
        )}
        {activeTab === 'prediction' && (
          <ConflictPredictor trains={trains} conflicts={conflicts} />
        )}
      </div>
    </div>
  );
}

export default AdvancedVisualization;
