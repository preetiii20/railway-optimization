import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import io from 'socket.io-client';
import './AdminDashboard.css';

// Fix Leaflet default marker
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const API_BASE = 'http://localhost:5000/api';
const SOCKET_URL = 'http://localhost:5000';

// Custom train icon with actual train emoji
const createTrainIcon = (color, trainId, trainName) => {
  return L.divIcon({
    className: 'custom-train-marker',
    html: `
      <div class="train-marker-container">
        <div class="train-icon-wrapper">
          <div class="train-emoji">🚆</div>
          <div class="train-glow" style="background: ${color}; box-shadow: 0 0 20px ${color}, 0 0 40px ${color};"></div>
        </div>
        <div class="train-label" style="
          background: rgba(0, 0, 0, 0.85);
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 700;
          white-space: nowrap;
          margin-top: 2px;
          border: 2px solid ${color};
          box-shadow: 0 2px 8px rgba(0,0,0,0.4);
          text-shadow: 0 1px 2px rgba(0,0,0,0.5);
        ">
          ${trainId}
        </div>
      </div>
    `,
    iconSize: [60, 70],
    iconAnchor: [30, 35]
  });
};

// Component to display trains with live WebSocket positions
const LiveTrain = ({ trainData, getTrainColor, onSelect }) => {
  if (!trainData.latitude || !trainData.longitude) return null;

  const position = [trainData.latitude, trainData.longitude];
  const color = getTrainColor({ delay: trainData.delay });

  return (
    <Marker
      position={position}
      icon={createTrainIcon(color, trainData.trainId, trainData.trainName)}
      eventHandlers={{
        click: () => onSelect(trainData)
      }}
    >
      <Popup>
        <div className="train-popup">
          <strong>{trainData.trainName}</strong>
          <p>🆔 {trainData.trainId}</p>
          <p>🚉 Current: {trainData.currentStation}</p>
          <p>➡️ Next: {trainData.nextStation}</p>
          <p>🚄 Speed: {trainData.speed} km/h</p>
          <p>📊 Progress: {trainData.progress}%</p>
          <p>⏱️ Status: <span style={{color: color, fontWeight: 'bold'}}>
            {trainData.status === 'delayed' ? `Delayed ${trainData.delay}min` : 'On-Time'}
          </span></p>
        </div>
      </Popup>
    </Marker>
  );
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [trains, setTrains] = useState([]);
  const [liveTrains, setLiveTrains] = useState([]); // Live train positions from WebSocket
  const [stations, setStations] = useState({});
  const [conflicts, setConflicts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTrain, setSelectedTrain] = useState(null);
  const [mapCenter] = useState([19.0760, 72.8777]); // Mumbai CSMT
  const socketRef = useRef(null);

  useEffect(() => {
    fetchData();
    
    // Setup WebSocket for real-time updates
    socketRef.current = io(SOCKET_URL);
    
    socketRef.current.on('connect', () => {
      console.log('✅ Connected to WebSocket');
    });

    socketRef.current.on('trainUpdate', (updatedTrains) => {
      console.log('🚂 Live train update:', updatedTrains.length, 'trains');
      setLiveTrains(updatedTrains);
    });

    socketRef.current.on('conflictUpdate', (conflictData) => {
      console.log('⚠️ Live conflict update:', conflictData.total_conflicts, 'conflicts');
      setConflicts(conflictData.conflicts || []);
      
      // Update stats with live conflict count
      setStats(prev => prev ? {
        ...prev,
        totalConflicts: conflictData.total_conflicts,
        highSeverityConflicts: conflictData.conflicts?.filter(c => c.severity === 'high').length || 0
      } : null);
    });

    const interval = setInterval(fetchData, 10000); // Refresh every 10 seconds

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      clearInterval(interval);
    };
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, trainsRes, stationsRes, conflictsRes] = await Promise.all([
        axios.get(`${API_BASE}/ai/statistics`),
        axios.get(`${API_BASE}/ai/trains`),
        axios.get(`${API_BASE}/ai/stations`),
        axios.get(`${API_BASE}/ai/conflicts`)
      ]);

      setStats(statsRes.data.data);
      setTrains(trainsRes.data.data);
      setStations(stationsRes.data.data);
      setConflicts(conflictsRes.data.data.conflicts || []);
      setLoading(false);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard loading-screen">
        <div className="loading-spinner"></div>
        <p>Initializing Railway Control System...</p>
        <p className="loading-subtext">Loading 106 trains, 406 stations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard error-screen">
        <div className="error-icon">⚠️</div>
        <h2>Connection Error</h2>
        <p>{error}</p>
        <button onClick={fetchData}>Retry Connection</button>
      </div>
    );
  }

  const getTrainColor = (train) => {
    const delay = train.delay || 0;
    if (delay > 10) return '#ff4444'; // Red - Critical delay
    if (delay > 5) return '#ffaa00'; // Yellow - Minor delay
    return '#00ff88'; // Green - On time
  };

  const criticalConflicts = conflicts.filter(c => c.severity === 'high').slice(0, 5);
  const recentConflicts = conflicts.slice(0, 10);

  // Get train routes for visualization
  const getTrainRoute = (train) => {
    if (!train.route || train.route.length < 2) return [];
    
    const routePoints = [];
    train.route.forEach(stop => {
      const station = stations[stop.station_code];
      if (station?.latitude && station?.longitude) {
        routePoints.push([station.latitude, station.longitude]);
      }
    });
    return routePoints;
  };

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1>🚂 Railway Control Center</h1>
          <p className="subtitle">Real-Time Monitoring & AI Analysis - CSMT Operations</p>
        </div>
        <div className="header-right">
          <div className="live-indicator">
            <span className="pulse"></span>
            <span>LIVE</span>
          </div>
          <div className="timestamp">
            {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon">🚆</div>
          <div className="kpi-content">
            <div className="kpi-value">{stats?.totalTrains || 0}</div>
            <div className="kpi-label">Active Trains</div>
          </div>
          <div className="kpi-trend positive">
            <span className="trend-icon">↑</span> {stats?.activeTrains || 0} online
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">⚠️</div>
          <div className="kpi-content">
            <div className="kpi-value animate-number">{stats?.totalConflicts || 0}</div>
            <div className="kpi-label">Total Conflicts</div>
          </div>
          <div className="kpi-trend negative">
            <span className="trend-icon">⚠</span> {stats?.highSeverityConflicts || 0} critical
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">⏱️</div>
          <div className="kpi-content">
            <div className="kpi-value">{stats?.avgDelay || 0} <span className="unit">min</span></div>
            <div className="kpi-label">Avg Delay</div>
          </div>
          <div className="kpi-trend neutral">Network wide</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">✅</div>
          <div className="kpi-content">
            <div className="kpi-value">{stats?.onTimePercentage || 0}<span className="unit">%</span></div>
            <div className="kpi-label">On-Time Performance</div>
          </div>
          <div className="kpi-trend positive">
            <span className="trend-icon">✓</span> Target: 85%
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="main-content-grid">
        {/* Live Map */}
        <div className="map-container">
          <div className="panel-header">
            <h2>🗺️ Live Train Tracking</h2>
            <div className="map-controls">
              <div className="map-legend">
                <span><span className="legend-dot green"></span> On-Time</span>
                <span><span className="legend-dot yellow"></span> Minor Delay</span>
                <span><span className="legend-dot red"></span> Critical</span>
              </div>
              <div className="train-count">
                {trains.length} trains tracked
              </div>
            </div>
          </div>
          <MapContainer 
            center={mapCenter} 
            zoom={9} 
            style={{ height: '100%', width: '100%' }}
            className="railway-map"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />
            
            {/* Render Railway Tracks (Routes) with Labels */}
            {trains.slice(0, 15).map((train, idx) => {
              const routePoints = getTrainRoute(train);
              if (routePoints.length < 2) return null;
              
              const midPoint = routePoints[Math.floor(routePoints.length / 2)];
              
              return (
                <React.Fragment key={`route-${idx}`}>
                  <Polyline
                    positions={routePoints}
                    color={getTrainColor(train)}
                    weight={3}
                    opacity={0.6}
                    dashArray="10, 5"
                  >
                    <Tooltip 
                      permanent 
                      direction="center"
                      className="track-label"
                    >
                      <div className="track-name">
                        {train.train_name}
                        <br />
                        <span className="track-route">
                          {train.source_name} → {train.destination_name}
                        </span>
                      </div>
                    </Tooltip>
                  </Polyline>
                </React.Fragment>
              );
            })}

            {/* Render Stations */}
            {Object.values(stations).map((station, idx) => (
              station.latitude && station.longitude && (
                <CircleMarker
                  key={`station-${idx}`}
                  center={[station.latitude, station.longitude]}
                  radius={4}
                  fillColor="#4a90e2"
                  color="#fff"
                  weight={2}
                  opacity={1}
                  fillOpacity={0.8}
                >
                  <Popup>
                    <div className="station-popup">
                      <strong>{station.name}</strong>
                      <p>Code: {station.code}</p>
                    </div>
                  </Popup>
                </CircleMarker>
              )
            ))}

            {/* Render Live Animated Trains from WebSocket */}
            {liveTrains.map((trainData) => (
              <LiveTrain
                key={`train-${trainData.trainId}`}
                trainData={trainData}
                getTrainColor={getTrainColor}
                onSelect={(data) => {
                  // Find full train details
                  const fullTrain = trains.find(t => t.train_id === data.trainId);
                  if (fullTrain) {
                    setSelectedTrain({...fullTrain, ...data});
                  }
                }}
              />
            ))}

            {/* Render Conflict Zones */}
            {criticalConflicts.map((conflict, idx) => {
              const station = stations[conflict.station];
              if (!station?.latitude || !station?.longitude) return null;

              return (
                <CircleMarker
                  key={`conflict-${idx}`}
                  center={[station.latitude, station.longitude]}
                  radius={15}
                  fillColor="#ff4444"
                  color="#ff0000"
                  weight={2}
                  opacity={0.8}
                  fillOpacity={0.3}
                  className="conflict-zone"
                >
                  <Popup>
                    <div className="conflict-popup">
                      <strong>⚠️ CONFLICT DETECTED</strong>
                      <p>Type: {conflict.type}</p>
                      <p>Trains: {conflict.train1_id} & {conflict.train2_id}</p>
                      <p>Severity: <span className="severity-high">{conflict.severity}</span></p>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>
        </div>

        {/* Right Panel - Conflicts & Stats */}
        <div className="right-panel">
          {/* Critical Alerts */}
          <div className="alerts-panel">
            <div className="panel-header">
              <h2>🚨 Critical Alerts</h2>
              <span className="alert-count blink">{criticalConflicts.length}</span>
            </div>
            <div className="alerts-list">
              {criticalConflicts.length === 0 ? (
                <div className="no-alerts">
                  <div className="success-icon">✓</div>
                  <p>No Critical Conflicts</p>
                  <span>System Operating Normally</span>
                </div>
              ) : (
                criticalConflicts.map((conflict, idx) => (
                  <div key={idx} className="alert-item animate-slide-in" style={{animationDelay: `${idx * 0.1}s`}}>
                    <div className="alert-icon blink">⚠️</div>
                    <div className="alert-content">
                      <div className="alert-title">{conflict.type}</div>
                      <div className="alert-details">
                        🚂 {conflict.train1_id} & {conflict.train2_id}
                      </div>
                      <div className="alert-location">
                        📍 {conflict.station}
                      </div>
                      <div className="alert-time">
                        ⏰ {conflict.time}
                      </div>
                    </div>
                    <div className={`alert-severity ${conflict.severity}`}>
                      {conflict.severity}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="activity-panel">
            <div className="panel-header">
              <h2>📊 Recent Activity</h2>
            </div>
            <div className="activity-list">
              {recentConflicts.slice(0, 5).map((conflict, idx) => (
                <div key={idx} className="activity-item">
                  <div className="activity-icon">
                    {conflict.severity === 'high' ? '🔴' : conflict.severity === 'medium' ? '🟡' : '🟢'}
                  </div>
                  <div className="activity-text">
                    <span className="activity-type">{conflict.type}</span>
                    <span className="activity-detail">at {conflict.station}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Train Details Modal */}
      {selectedTrain && (
        <div className="modal-overlay" onClick={() => setSelectedTrain(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🚂 {selectedTrain.train_name}</h2>
              <button className="close-btn" onClick={() => setSelectedTrain(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="train-info-grid">
                <div className="info-item">
                  <span className="info-label">Train ID</span>
                  <span className="info-value">{selectedTrain.train_id}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Type</span>
                  <span className="info-value">{selectedTrain.train_type}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Priority</span>
                  <span className="info-value">{selectedTrain.priority}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Distance</span>
                  <span className="info-value">{selectedTrain.total_distance} km</span>
                </div>
              </div>
              
              <div className="route-section">
                <h3>📍 Route Details ({selectedTrain.total_stations} stations)</h3>
                <div className="route-list">
                  {selectedTrain.route?.slice(0, 8).map((stop, idx) => (
                    <div key={idx} className="route-stop">
                      <div className="stop-number">{stop.seq}</div>
                      <div className="stop-details">
                        <div className="stop-name">{stop.station_name}</div>
                        <div className="stop-time">
                          Arr: {stop.arrival_time} | Dep: {stop.departure_time}
                        </div>
                        <div className="stop-distance">{stop.distance} km</div>
                      </div>
                    </div>
                  ))}
                  {selectedTrain.route?.length > 8 && (
                    <div className="route-more">
                      + {selectedTrain.route.length - 8} more stations
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
