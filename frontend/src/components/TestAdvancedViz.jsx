import React from 'react';
import AdvancedVisualization from './AdvancedVisualization';

function TestAdvancedViz() {
  // Mock data for testing
  const mockTrains = [
    {
      train_id: '51027',
      train_name: 'FAST PASSENG',
      train_type: 'local',
      route: [
        { station_code: 'CSMT', station_name: 'CST-MUMBAI', arrival_minutes: 1375 },
        { station_code: 'DR', station_name: 'DADAR', arrival_minutes: 1387 }
      ]
    }
  ];

  const mockStations = {
    'CSMT': { code: 'CSMT', name: 'CST-MUMBAI', latitude: 18.9398, longitude: 72.8355 },
    'DR': { code: 'DR', name: 'DADAR', latitude: 19.0176, longitude: 72.8561 }
  };

  const mockConflicts = [];

  return (
    <div style={{ padding: '20px', background: '#0a0e27', minHeight: '100vh' }}>
      <h1 style={{ color: 'white', textAlign: 'center', marginBottom: '30px' }}>
        🧪 Testing Advanced Visualization Component
      </h1>
      <div style={{ 
        background: 'rgba(255,255,255,0.1)', 
        padding: '20px', 
        borderRadius: '10px',
        border: '2px solid #00ff88'
      }}>
        <AdvancedVisualization 
          trains={mockTrains} 
          stations={mockStations} 
          conflicts={mockConflicts} 
        />
      </div>
    </div>
  );
}

export default TestAdvancedViz;
