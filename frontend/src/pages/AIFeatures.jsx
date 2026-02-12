import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdvancedVisualization from '../components/AdvancedVisualization';

function AIFeatures() {
  const [trains, setTrains] = useState([]);
  const [stations, setStations] = useState({});
  const [conflicts, setConflicts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [trainsRes, stationsRes, conflictsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/ai/trains'),
        axios.get('http://localhost:5000/api/ai/stations'),
        axios.get('http://localhost:5000/api/ai/conflicts')
      ]);
      setTrains(trainsRes.data.data);
      setStations(stationsRes.data.data);
      setConflicts(conflictsRes.data.data?.conflicts || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{padding: '50px', textAlign: 'center', background: '#0a0e27', minHeight: '100vh', color: 'white'}}>
        <h1>Loading AI Features...</h1>
      </div>
    );
  }

  return (
    <div style={{background: '#0a0e27', minHeight: '100vh', padding: '30px'}}>
      <div style={{maxWidth: '1400px', margin: '0 auto'}}>
        <h1 style={{color: '#00ff88', textAlign: 'center', marginBottom: '40px', fontSize: '36px'}}>
          🤖 IRIS - AI-Powered Railway Optimization
        </h1>
        
        <div style={{background: '#1a1a2e', padding: '30px', borderRadius: '20px', border: '2px solid #00ff88'}}>
          <AdvancedVisualization trains={trains} stations={stations} conflicts={conflicts} />
        </div>

        <div style={{marginTop: '30px', textAlign: 'center'}}>
          <a href="/" style={{color: '#00ff88', fontSize: '18px', textDecoration: 'none'}}>
            ← Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}

export default AIFeatures;
