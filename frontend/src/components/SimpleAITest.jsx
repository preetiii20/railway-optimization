import React from 'react';
import AdvancedVisualization from './AdvancedVisualization';

// Simple test component with hardcoded data
function SimpleAITest() {
  const testTrains = [
    {
      train_id: '12345',
      train_name: 'Test Express',
      source_name: 'Mumbai',
      destination_name: 'Pune',
      train_type: 'Express'
    }
  ];

  const testStations = {
    'CSMT': { name: 'Mumbai CSMT', code: 'CSMT', latitude: 18.9398, longitude: 72.8355 }
  };

  const testConflicts = [];

  return (
    <div style={{ padding: '20px', background: '#0a0a0f', minHeight: '100vh' }}>
      <h1 style={{ color: 'white', textAlign: 'center', marginBottom: '30px' }}>
        🤖 AI Features Test Page
      </h1>
      <AdvancedVisualization 
        trains={testTrains} 
        stations={testStations} 
        conflicts={testConflicts} 
      />
    </div>
  );
}

export default SimpleAITest;
