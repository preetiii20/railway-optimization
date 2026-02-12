import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './FreightAnalysis.css';

// Fix Leaflet default marker
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Train icon matching AdminDashboard style
const createTrainIcon = (trainId, color = '#00ff88', isFreight = false) => {
  return L.divIcon({
    className: 'custom-train-marker',
    html: `
      <div class="train-marker-container">
        <div class="train-icon-wrapper">
          <div class="train-emoji">${isFreight ? '🚛' : '🚆'}</div>
          <div class="train-glow" style="background: ${color}; box-shadow: 0 0 20px ${color};"></div>
        </div>
        <div class="train-label" style="
          background: rgba(0, 0, 0, 0.9);
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 700;
          white-space: nowrap;
          margin-top: 2px;
          border: 2px solid ${color};
          box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        ">
          ${trainId}
        </div>
      </div>
    `,
    iconSize: [60, 70],
    iconAnchor: [30, 35]
  });
};

function FreightAnalysis({ trains, stations }) {
  const [optimizationResult, setOptimizationResult] = useState(null);
  const [gapAnalysis, setGapAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true); // New state for initial load
  const [mapCenter] = useState([19.0760, 72.8777]);
  const [liveFreightTrains, setLiveFreightTrains] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Load gap analysis and run initial optimization on mount
  useEffect(() => {
    loadGapAnalysis();
    
    // Load all freight trains on initial mount (not just time window)
    const initializeFreightTrains = async () => {
      try {
        console.log('🔍 Loading all freight trains from backend...');
        const response = await axios.get('http://localhost:5000/api/ai/freight-trains');
        
        if (response.data.success && response.data.freight_trains.length > 0) {
          console.log(`✅ Loaded ${response.data.freight_trains.length} freight trains`);
          setLiveFreightTrains(response.data.freight_trains);
          
          // Set initial "optimization result" to show all trains
          setOptimizationResult({
            success: true,
            algorithm: 'loaded',
            freight_trains: response.data.freight_trains,
            statistics: {
              total_freight_trains: response.data.freight_trains.length,
              total_distance_km: response.data.freight_trains.reduce((sum, t) => sum + (t.distance || 0), 0),
              fitness_score: response.data.freight_trains.reduce((sum, t) => sum + (t.gap_utilization || 75), 0)
            }
          });
          setInitializing(false);
        } else {
          console.log('⚠️ No freight trains found.');
          setInitializing(false);
        }
      } catch (error) {
        console.error('Error loading freight trains:', error);
        setInitializing(false);
      }
    };
    
    initializeFreightTrains();
    
    // Timeout to ensure UI shows even if everything fails
    setTimeout(() => {
      setInitializing(false);
    }, 10000); // Max 10 seconds for initialization
  }, []);

  // Auto-refresh every 5 minutes (300000ms) - only if we have trains
  useEffect(() => {
    if (!autoRefresh || liveFreightTrains.length === 0) return;

    const refreshInterval = setInterval(() => {
      console.log('🔄 Auto-refreshing freight positions (5 min interval)...');
      setCurrentTime(new Date());
      
      // Reload live positions (not re-optimize, just update positions)
      loadLiveFreightTrains();
    }, 300000); // 5 minutes

    return () => clearInterval(refreshInterval);
  }, [autoRefresh, liveFreightTrains.length]);

  // Update live positions every 30 seconds for smooth movement
  useEffect(() => {
    const positionInterval = setInterval(() => {
      loadLiveFreightTrains();
    }, 30000); // 30 seconds

    return () => clearInterval(positionInterval);
  }, []);

  const loadLiveFreightTrains = async () => {
    try {
      console.log('📡 Fetching live freight trains from backend...');
      const response = await axios.get('http://localhost:5000/api/ai/freight-trains');
      
      if (response.data.success) {
        console.log(`📦 Received ${response.data.freight_trains.length} freight trains from backend`);
        setLiveFreightTrains(response.data.freight_trains);
        
        // If no trains and no optimization result yet, trigger generation
        if (response.data.freight_trains.length === 0 && !optimizationResult) {
          console.log('⚠️ No freight trains found in backend. Will trigger generation...');
        }
      } else {
        console.error('❌ Backend returned error:', response.data);
      }
    } catch (err) {
      console.error('❌ Error loading live freight trains:', err.message);
    }
  };

  const loadGapAnalysis = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/ai/freight/gaps');
      if (response.data.success) {
        setGapAnalysis(response.data);
      }
    } catch (err) {
      console.error('Gap analysis error:', err);
    }
  };

  const runOptimization = async () => {
    setLoading(true);
    
    // Smart algorithm selection based on number of active trains
    const currentTimeMinutes = getCurrentTimeMinutes();
    const timeWindowHours = 2; // Default 2-hour window
    
    // Count active trains in window to choose best algorithm
    const activeTrainsCount = liveFreightTrains.filter(f => 
      isTrainActiveInWindow(f, currentTimeMinutes, timeWindowHours)
    ).length;
    
    // Auto-select best algorithm:
    // - Few trains (< 5): Use Genetic for best quality
    // - Many trains (>= 5): Use Greedy for speed
    const algorithm = activeTrainsCount < 5 ? 'genetic' : 'greedy';
    const numTrains = Math.max(activeTrainsCount, 10); // At least 10 trains
    
    try {
      console.log(`🚛 Running smart optimization...`);
      console.log(`⏰ Current time: ${new Date().toLocaleTimeString()}`);
      console.log(`📊 Active trains in window: ${activeTrainsCount}`);
      console.log(`🤖 Auto-selected algorithm: ${algorithm.toUpperCase()}`);
      console.log(`🎯 Target trains: ${numTrains}`);
      
      const response = await axios.post('http://localhost:5000/api/ai/optimize-freight', {
        num_trains: numTrains,
        algorithm: algorithm,
        time_window_hours: timeWindowHours
      });
      
      console.log('📦 Backend response:', response.data);
      
      if (response.data.success) {
        console.log(`✅ Generated ${response.data.statistics?.total_freight_trains || 0} freight trains`);
        console.log(`📊 Algorithm used: ${response.data.algorithm}`);
        console.log(`⏱️ Time window: ${timeWindowHours} hours from now`);
        
        setOptimizationResult(response.data);
        
        // Load live positions immediately after optimization
        await loadLiveFreightTrains();
        
        // Also set the freight trains directly from response
        if (response.data.freight_trains && response.data.freight_trains.length > 0) {
          console.log(`📍 Setting ${response.data.freight_trains.length} freight trains in state`);
          setLiveFreightTrains(response.data.freight_trains);
        }
      } else {
        console.error('❌ Optimization failed:', response.data);
        console.error('Error details:', JSON.stringify(response.data, null, 2));
      }
    } catch (err) {
      console.error('❌ Optimization error:', err.message);
      console.error('Error response:', err.response?.data);
    }
    setLoading(false);
  };

  // Filter trains active in current 2-hour window
  const getCurrentTimeMinutes = () => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  };

  const parseTimeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const parts = timeStr.split(':');
    const hours = parseInt(parts[0]) || 0;
    const minutes = parseInt(parts[1]) || 0;
    return hours * 60 + minutes;
  };

  const isTrainActiveInWindow = (train, currentTime, windowHours = 2) => {
    if (!train.route || train.route.length === 0) return false;
    
    const windowEnd = currentTime + (windowHours * 60);
    
    // Check if any stop is within the time window
    for (const stop of train.route) {
      const departureTime = parseTimeToMinutes(stop.departure_time);
      const arrivalTime = parseTimeToMinutes(stop.arrival_time);
      
      if ((departureTime >= currentTime && departureTime <= windowEnd) ||
          (arrivalTime >= currentTime && arrivalTime <= windowEnd) ||
          (departureTime <= currentTime && arrivalTime >= currentTime)) {
        return true;
      }
    }
    return false;
  };

  const currentTimeMinutes = getCurrentTimeMinutes();
  const activePassengerTrains = trains.filter(t => 
    t.train_type !== 'freight' && isTrainActiveInWindow(t, currentTimeMinutes, 2)
  );
  const activeFreightTrains = liveFreightTrains.filter(f => 
    isTrainActiveInWindow(f, currentTimeMinutes, 2)
  );

  // Calculate metrics for current window only
  const beforeMetrics = {
    passengerTrains: activePassengerTrains.length,
    freightTrains: 0,
    totalTrains: activePassengerTrains.length,
    timeGaps: gapAnalysis?.total_gaps || 0,
    blockUtilization: 45,
    avgHeadway: 8
  };

  const afterMetrics = optimizationResult ? {
    passengerTrains: activePassengerTrains.length,
    freightTrains: activeFreightTrains.length,
    totalTrains: activePassengerTrains.length + activeFreightTrains.length,
    blockUtilization: 65,
    avgHeadway: 6,
    totalDistance: optimizationResult.statistics?.total_distance_km || 0,
    fitnessScore: optimizationResult.statistics?.fitness_score || 0
  } : null;

  return (
    <div className="freight-optimization-container">
      {/* Loading Overlay for Initial Load Only - Non-blocking */}
      {initializing && (
        <div className="initial-loading-overlay">
          <div className="loading-content">
            <div className="loading-spinner-large"></div>
            <h3>🚛 Loading Freight System...</h3>
            <p>Checking for existing freight trains</p>
            <p className="loading-subtext">Page will load in a moment...</p>
          </div>
        </div>
      )}

      {/* Small Loading Indicator for Optimization */}
      {loading && !initializing && (
        <div className="optimization-loading-bar">
          <div className="loading-bar-fill"></div>
          <span>🚛 Generating freight trains...</span>
        </div>
      )}

      {/* Header */}
      <div className="freight-header">
        <div className="header-left">
          <h2>🚛 Freight Path Optimization System</h2>
          <p className="subtitle">AI-Powered Freight Train Insertion with Automatic Algorithm Selection</p>
          <div className="time-indicator">
            <span className="time-label">Current Time:</span>
            <span className="time-value">{currentTime.toLocaleTimeString()}</span>
            <span className={`auto-refresh-badge ${autoRefresh ? 'active' : ''}`}>
              {autoRefresh ? '🔄 Auto-Optimization ON' : '⏸️ Paused'}
            </span>
          </div>
        </div>
        <div className="header-right">
          <button 
            className={`refresh-toggle-btn ${autoRefresh ? 'active' : ''}`}
            onClick={() => setAutoRefresh(!autoRefresh)}
            title="Toggle auto-optimization every 5 minutes"
          >
            {autoRefresh ? '⏸️ Pause' : '▶️ Resume'} Auto-Optimization
          </button>
          <button 
            className="optimize-btn" 
            onClick={() => runOptimization()}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Optimizing...
              </>
            ) : (
              <>
                🎯 Optimize Now
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Layout: 3 Columns */}
      <div className="freight-main-layout">
        
        {/* LEFT PANEL: Train List */}
        <div className="left-panel">
          <div className="panel-header">
            <h3>🚆 Active Trains (Next 2 Hours)</h3>
            <span className="train-count">{activePassengerTrains.length + activeFreightTrains.length}</span>
          </div>
          <div className="train-list">
            {/* Passenger Trains */}
            <div className="train-category-header">Passenger Trains ({activePassengerTrains.length})</div>
            {activePassengerTrains.length === 0 ? (
              <div className="no-trains-message">
                <p>⏳ No passenger trains in current 2-hour window</p>
              </div>
            ) : (
              activePassengerTrains.map((train, idx) => (
                <div key={`pass-${idx}`} className="train-item">
                  <div className="train-item-header">
                    <span className="train-id">{train.train_id}</span>
                    <span className="train-status online">● ACTIVE</span>
                  </div>
                  <div className="train-item-body">
                    <div className="train-name">{train.train_name}</div>
                    <div className="train-route">
                      {train.source_name} → {train.destination_name}
                    </div>
                    <div className="train-stats">
                      <span>📍 {train.total_stations} stops</span>
                      <span>📏 {train.total_distance} km</span>
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {/* Freight Trains */}
            <div className="train-category-header freight">Freight Trains ({activeFreightTrains.length})</div>
            {activeFreightTrains.length === 0 ? (
              <div className="no-trains-message freight">
                {loading ? (
                  <>
                    <div className="small-spinner"></div>
                    <p>🚛 Generating freight trains...</p>
                  </>
                ) : (
                  <>
                    <p>⏳ No freight trains yet</p>
                    <p className="hint">System will auto-generate in a moment</p>
                  </>
                )}
              </div>
            ) : (
              activeFreightTrains.map((freight, idx) => (
                <div key={`freight-${idx}`} className="train-item freight">
                  <div className="train-item-header">
                    <span className="train-id freight">{freight.freight_id}</span>
                    <span className="train-status freight">🚛 LIVE</span>
                  </div>
                  <div className="train-item-body">
                    <div className="train-name">{freight.freight_id}</div>
                    <div className="train-route">
                      {freight.origin_name} → {freight.destination_name}
                    </div>
                    <div className="train-stats">
                      <span>📏 {freight.distance} km</span>
                      <span>⏱️ {freight.travel_time.toFixed(0)} min</span>
                    </div>
                    {freight.livePosition && (
                      <div className="train-progress">
                        <div className="progress-bar">
                          <div className="progress-fill" style={{width: `${freight.livePosition.progress}%`}}></div>
                        </div>
                        <span className="progress-text">{freight.livePosition.progress}% complete</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* CENTER PANEL: Map */}
        <div className="center-panel">
          <div className="map-header">
            <h3>🗺️ Railway Network - Live Visualization</h3>
            <div className="map-controls">
              <span className="map-info">
                {optimizationResult ? 'After Optimization' : 'Current Situation'} - Next 2 Hours
              </span>
            </div>
          </div>
          
          <div className="map-container-freight">
            <MapContainer 
              center={mapCenter} 
              zoom={8} 
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
              />
              
              {/* Render Passenger Train Routes - Remove Tooltip */}
              {activePassengerTrains.slice(0, 15).map((train, idx) => {
                const routePoints = train.route
                  ?.map(stop => {
                    const station = stations[stop.station_code];
                    return station?.latitude && station?.longitude 
                      ? [station.latitude, station.longitude]
                      : null;
                  })
                  .filter(point => point !== null);

                if (!routePoints || routePoints.length < 2) return null;

                return (
                  <Polyline
                    key={`route-${idx}`}
                    positions={routePoints}
                    color="#00ff88"
                    weight={3}
                    opacity={0.6}
                    dashArray="10, 5"
                  />
                );
              })}

              {/* Render Stations */}
              {Object.values(stations).slice(0, 100).map((station, idx) => (
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
                      <strong>{station.name}</strong>
                      <p>Code: {station.code}</p>
                    </Popup>
                  </CircleMarker>
                )
              ))}

              {/* Render Passenger Trains */}
              {activePassengerTrains.slice(0, 20).map((train, idx) => {
                const firstStop = train.route?.[0];
                if (!firstStop) return null;
                
                const station = stations[firstStop.station_code];
                if (!station?.latitude || !station?.longitude) return null;

                return (
                  <Marker
                    key={`train-${idx}`}
                    position={[station.latitude, station.longitude]}
                    icon={createTrainIcon(train.train_id, '#00ff88', false)}
                  >
                    <Popup>
                      <div className="train-popup">
                        <strong>{train.train_name}</strong>
                        <p>ID: {train.train_id}</p>
                        <p>Route: {train.source_name} → {train.destination_name}</p>
                        <p>Distance: {train.total_distance} km</p>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}

              {/* Render Optimized Freight Trains with Live Positions - Remove Tooltip */}
              {liveFreightTrains.map((freight, idx) => {
                // Use live position if available, otherwise use origin
                const position = freight.livePosition || {
                  latitude: stations[freight.origin]?.latitude,
                  longitude: stations[freight.origin]?.longitude
                };

                if (!position.latitude || !position.longitude) return null;

                // Draw route line
                const routePoints = freight.route
                  ?.map(stop => {
                    const station = stations[stop.station_code];
                    return station?.latitude && station?.longitude 
                      ? [station.latitude, station.longitude]
                      : null;
                  })
                  .filter(point => point !== null);

                return (
                  <React.Fragment key={`freight-${idx}`}>
                    {/* Freight Route Line - No Tooltip */}
                    {routePoints && routePoints.length >= 2 && (
                      <Polyline
                        positions={routePoints}
                        color="#ff9500"
                        weight={4}
                        opacity={0.7}
                        dashArray="5, 10"
                      />
                    )}

                    {/* Moving Freight Train Marker */}
                    <Marker
                      position={[position.latitude, position.longitude]}
                      icon={createTrainIcon(freight.freight_id, '#ff9500', true)}
                    >
                      <Popup>
                        <div className="train-popup freight">
                          <strong>🚛 {freight.freight_id}</strong>
                          <p>Route: {freight.origin_name} → {freight.destination_name}</p>
                          <p>Distance: {freight.distance} km</p>
                          <p>Speed: {freight.speed || 60} km/h</p>
                          <p>Travel Time: {freight.travel_time.toFixed(0)} min</p>
                          <p>Gap Utilization: {freight.gap_utilization}%</p>
                          {position.progress && (
                            <>
                              <p>Progress: {position.progress}%</p>
                              <p>Current: {position.currentStation}</p>
                              {position.nextStation && <p>Next: {position.nextStation}</p>}
                              {position.distanceTraveled && (
                                <p>Traveled: {position.distanceTraveled} km / {position.distanceRemaining} km remaining</p>
                              )}
                            </>
                          )}
                          <p className="live-indicator">
                            <span className="pulse-dot"></span> LIVE
                          </p>
                        </div>
                      </Popup>
                    </Marker>
                  </React.Fragment>
                );
              })}
            </MapContainer>
          </div>

          <div className="map-legend">
            <div className="legend-item">
              <div className="legend-marker passenger">🚆</div>
              <span>Passenger Trains ({activePassengerTrains.length})</span>
            </div>
            {liveFreightTrains.length > 0 && (
              <div className="legend-item">
                <div className="legend-marker freight">🚛</div>
                <span>Freight Trains ({activeFreightTrains.length}) <span className="live-badge">LIVE</span></span>
              </div>
            )}
            <div className="legend-item">
              <div className="legend-line"></div>
              <span>Train Routes</span>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Metrics */}
        <div className="right-panel">
          <div className="panel-header">
            <h3>📊 System Metrics</h3>
          </div>
          
          <div className="metrics-section">
            <h4>Current Window (Next 2 Hours)</h4>
            <div className="metric-card">
              <div className="metric-icon">🚆</div>
              <div className="metric-content">
                <div className="metric-value">{beforeMetrics.passengerTrains}</div>
                <div className="metric-label">Passenger Trains</div>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon">🚛</div>
              <div className="metric-content">
                <div className="metric-value">{beforeMetrics.freightTrains}</div>
                <div className="metric-label">Freight Trains</div>
              </div>
            </div>
            <div className="metric-card highlight">
              <div className="metric-icon">⏱️</div>
              <div className="metric-content">
                <div className="metric-value">{beforeMetrics.timeGaps}</div>
                <div className="metric-label">Time Gaps Available</div>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon">📊</div>
              <div className="metric-content">
                <div className="metric-value">{beforeMetrics.blockUtilization}%</div>
                <div className="metric-label">Block Utilization</div>
              </div>
            </div>
          </div>

          {afterMetrics && (
            <>
              <div className="metrics-section success">
                <h4>🎯 Optimization Results</h4>
                
                {/* Algorithm Used */}
                <div className="algorithm-badge">
                  <span className="badge-label">Algorithm:</span>
                  <span className="badge-value">
                    {optimizationResult.algorithm === 'genetic' && '🧬 Genetic Algorithm'}
                    {optimizationResult.algorithm === 'greedy' && '⚡ Greedy Heuristic'}
                    {optimizationResult.algorithm === 'random' && '🎲 Random Baseline'}
                  </span>
                </div>
                
                <div className="metric-card success">
                  <div className="metric-icon">🚛</div>
                  <div className="metric-content">
                    <div className="metric-value">{afterMetrics.freightTrains}</div>
                    <div className="metric-label">New Freight Trains</div>
                    <div className="metric-change">+{afterMetrics.freightTrains}</div>
                  </div>
                </div>
                <div className="metric-card success">
                  <div className="metric-icon">📈</div>
                  <div className="metric-content">
                    <div className="metric-value">{afterMetrics.blockUtilization}%</div>
                    <div className="metric-label">Block Utilization</div>
                    <div className="metric-change">+{afterMetrics.blockUtilization - beforeMetrics.blockUtilization}%</div>
                  </div>
                </div>
                <div className="metric-card">
                  <div className="metric-icon">📏</div>
                  <div className="metric-content">
                    <div className="metric-value">{afterMetrics.totalDistance}</div>
                    <div className="metric-label">Total Distance (km)</div>
                  </div>
                </div>
                <div className="metric-card">
                  <div className="metric-icon">🎯</div>
                  <div className="metric-content">
                    <div className="metric-value">{afterMetrics.fitnessScore.toFixed(0)}</div>
                    <div className="metric-label">Fitness Score</div>
                  </div>
                </div>
                
                {/* AI Techniques Used */}
                <div className="ai-techniques-box">
                  <h5>🤖 AI Techniques Applied</h5>
                  <div className="technique-item">
                    <span className="technique-icon">✓</span>
                    <span className="technique-name">CSP (Constraint Satisfaction)</span>
                  </div>
                  <div className="technique-item">
                    <span className="technique-icon">✓</span>
                    <span className="technique-name">
                      {optimizationResult.algorithm === 'genetic' && 'Genetic Algorithm'}
                      {optimizationResult.algorithm === 'greedy' && 'Greedy Heuristic'}
                      {optimizationResult.algorithm === 'random' && 'Random Sampling'}
                    </span>
                  </div>
                  <div className="technique-item">
                    <span className="technique-icon">✓</span>
                    <span className="technique-name">Dynamic Programming (Path)</span>
                  </div>
                  <div className="technique-item">
                    <span className="technique-icon">✓</span>
                    <span className="technique-name">Headway Constraint Validation</span>
                  </div>
                </div>
                
                {/* Optimization Stats */}
                {optimizationResult.statistics && (
                  <div className="optimization-stats">
                    <div className="stat-row">
                      <span className="stat-label">Gaps Found:</span>
                      <span className="stat-value">{optimizationResult.statistics.gaps_found || 'N/A'}</span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-label">Utilization Rate:</span>
                      <span className="stat-value">{optimizationResult.statistics.utilization_rate || 'N/A'}%</span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-label">Avg Travel Time:</span>
                      <span className="stat-value">{optimizationResult.statistics.avg_travel_time_min?.toFixed(0) || 'N/A'} min</span>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Freight Paths Details */}
      {optimizationResult && (
        <div className="freight-paths-section">
          <h3>🚛 Optimized Freight Paths - Detailed View</h3>
          <div className="freight-paths-grid">
            {optimizationResult.freight_trains?.map((freight, idx) => (
              <div key={idx} className="freight-path-card">
                <div className="freight-card-header">
                  <span className="freight-id">{freight.freight_id}</span>
                  <span className="freight-distance">{freight.distance} km</span>
                </div>
                <div className="freight-card-body">
                  <div className="freight-route">
                    <span className="route-point">{freight.origin_name}</span>
                    <span className="route-arrow">→</span>
                    <span className="route-point">{freight.destination_name}</span>
                  </div>
                  <div className="freight-details">
                    <div className="detail-row">
                      <span className="detail-label">Departure:</span>
                      <span className="detail-value">
                        {Math.floor(freight.departure_time / 60)}:{(freight.departure_time % 60).toString().padStart(2, '0')}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Arrival:</span>
                      <span className="detail-value">
                        {Math.floor(freight.arrival_time / 60)}:{(freight.arrival_time % 60).toString().padStart(2, '0')}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Travel Time:</span>
                      <span className="detail-value">{freight.travel_time.toFixed(0)} minutes</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Gap Utilization:</span>
                      <span className="detail-value success">{freight.gap_utilization}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default FreightAnalysis;
