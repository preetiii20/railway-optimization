import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DataTest = () => {
  const [testResult, setTestResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      console.log('Testing backend connection...');
      
      // Test basic connection
      const homeRes = await axios.get('http://localhost:5000/');
      console.log('Home response:', homeRes.data);

      // Test AI data
      const testRes = await axios.get('http://localhost:5000/api/test-ai');
      console.log('AI Test response:', testRes.data);

      setTestResult(testRes.data);
    } catch (err) {
      console.error('Connection error:', err);
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: '20px', background: '#1a1f3a', color: '#fff', margin: '20px', borderRadius: '8px' }}>
      <h2>🔍 Backend Connection Test</h2>
      
      {error && (
        <div style={{ background: '#ff4444', padding: '10px', borderRadius: '4px', marginTop: '10px' }}>
          <strong>❌ Error:</strong> {error}
          <p>Make sure backend is running on http://localhost:5000</p>
        </div>
      )}

      {testResult && (
        <div style={{ background: '#00ff88', color: '#000', padding: '10px', borderRadius: '4px', marginTop: '10px' }}>
          <strong>✅ Connection Successful!</strong>
          <pre style={{ marginTop: '10px', background: '#000', color: '#0f0', padding: '10px', borderRadius: '4px' }}>
            {JSON.stringify(testResult, null, 2)}
          </pre>
        </div>
      )}

      <button 
        onClick={testConnection}
        style={{
          marginTop: '10px',
          padding: '10px 20px',
          background: '#00d9ff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        🔄 Test Again
      </button>
    </div>
  );
};

export default DataTest;
