import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet - use CDN instead of local files
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LiveMap = ({ trains, sections, conflicts, mode, selectedTrain, onTrainSelect }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const [mapMode, setMapMode] = useState(mode || 'overview');

  useEffect(() => {
    if (!mapInstanceRef.current) {
      initializeMap();
    }
    updateMapData();
  }, [trains, sections, conflicts]);

  useEffect(() => {
    setMapMode(mode);
    if (mapInstanceRef.current) {
      updateMapStyle();
    }
  }, [mode]);

  const initializeMap = () => {
    // Initialize map centered on India
    mapInstanceRef.current = L.map(mapRef.current, {
      center: [20.5937, 78.9629], // Center of India
      zoom: 6,
      zoomControl: false,
      attributionControl: false
    });

    // Gaming-style dark tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(mapInstanceRef.current);

    // Add custom gaming controls
    addGamingControls();
  };

  const addGamingControls = () => {
    // Custom zoom control with gaming style
    const zoomControl = L.control({ position: 'topright' });
    zoomControl.onAdd = function() {
      const div = L.DomUtil.create('div', 'gaming-zoom-control');
      div.innerHTML = `
        <button class="zoom-btn zoom-in" onclick="window.mapZoomIn()">+</button>
        <button class="zoom-btn zoom-out" onclick="window.mapZoomOut()">-</button>
      `;
      return div;
    };
    zoomControl.addTo(mapInstanceRef.current);

    // Global zoom functions
    window.mapZoomIn = () => mapInstanceRef.current.zoomIn();
    window.mapZoomOut = () => mapInstanceRef.current.zoomOut();

    // Mode selector
    const modeControl = L.control({ position: 'topleft' });
    modeControl.onAdd = function() {
      const div = L.DomUtil.create('div', 'gaming-mode-control');
      div.innerHTML = `
        <div class="mode-selector">
          <button class="mode-btn ${mapMode === 'overview' ? 'active' : ''}" onclick="window.setMapMode('overview')">
            🌍 OVERVIEW
          </button>
          <button class="mode-btn ${mapMode === 'detailed' ? 'active' : ''}" onclick="window.setMapMode('detailed')">
            🔍 DETAILED
          </button>
          <button class="mode-btn ${mapMode === 'conflict' ? 'active' : ''}" onclick="window.setMapMode('conflict')">
            ⚠️ CONFLICTS
          </button>
        </div>
      `;
      return div;
    };
    modeControl.addTo(mapInstanceRef.current);

    window.setMapMode = (mode) => {
      setMapMode(mode);
    };
  };

  const updateMapData = () => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => {
      mapInstanceRef.current.removeLayer(marker);
    });
    markersRef.current = {};

    // Add sections as polylines
    sections.forEach(section => {
      if (section.startCoords && section.endCoords) {
        const sectionLine = L.polyline([
          [section.startCoords.lat, section.startCoords.lng],
          [section.endCoords.lat, section.endCoords.lng]
        ], {
          color: getSectionColor(section.status),
          weight: 4,
          opacity: 0.8,
          className: 'gaming-section-line'
        });

        sectionLine.bindPopup(`
          <div class="gaming-popup">
            <h3>${section.name}</h3>
            <p>Status: ${section.status}</p>
            <p>Capacity: ${section.capacity}</p>
            <p>Length: ${section.length}km</p>
          </div>
        `);

        sectionLine.addTo(mapInstanceRef.current);
      }
    });

    // Add trains as animated markers
    trains.forEach(train => {
      const trainIcon = createTrainIcon(train);
      const marker = L.marker([train.latitude, train.longitude], { 
        icon: trainIcon,
        zIndexOffset: 1000 
      });

      marker.bindPopup(createTrainPopup(train));
      
      marker.on('click', () => {
        onTrainSelect(train);
        highlightTrain(train);
      });

      marker.addTo(mapInstanceRef.current);
      markersRef.current[train._id] = marker;

      // Add train trail effect
      if (train.previousPositions) {
        const trail = L.polyline(train.previousPositions, {
          color: getTrainColor(train.type),
          weight: 2,
          opacity: 0.3,
          dashArray: '5, 10'
        });
        trail.addTo(mapInstanceRef.current);
      }
    });

    // Add conflict zones
    conflicts.forEach(conflict => {
      if (!conflict.resolved && conflict.location) {
        const conflictMarker = L.circleMarker(conflict.location, {
          radius: 20,
          fillColor: '#ff4444',
          color: '#ff0000',
          weight: 2,
          opacity: 0.8,
          fillOpacity: 0.3,
          className: 'conflict-zone pulsing'
        });

        conflictMarker.bindPopup(`
          <div class="gaming-popup conflict">
            <h3>⚠️ CONFLICT ZONE</h3>
            <p>Severity: ${conflict.severity}</p>
            <p>Trains: ${conflict.trainIds.join(', ')}</p>
            <p>Time: ${new Date(conflict.detectedAt).toLocaleTimeString()}</p>
          </div>
        `);

        conflictMarker.addTo(mapInstanceRef.current);
      }
    });
  };

  const createTrainIcon = (train) => {
    const color = getTrainColor(train.type);
    const status = train.delay > 0 ? 'delayed' : 'ontime';
    
    return L.divIcon({
      className: `gaming-train-marker ${train.type} ${status}`,
      html: `
        <div class="train-icon" style="background-color: ${color}">
          <div class="train-symbol">${getTrainSymbol(train.type)}</div>
          <div class="train-id">${train.trainId}</div>
          ${train.delay > 0 ? '<div class="delay-indicator">!</div>' : ''}
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });
  };

  const createTrainPopup = (train) => {
    return `
      <div class="gaming-popup train">
        <div class="popup-header">
          <h3>${getTrainSymbol(train.type)} ${train.name}</h3>
          <span class="train-type">${train.type.toUpperCase()}</span>
        </div>
        <div class="popup-content">
          <div class="info-row">
            <span class="label">ID:</span>
            <span class="value">${train.trainId}</span>
          </div>
          <div class="info-row">
            <span class="label">Status:</span>
            <span class="value ${train.status}">${train.status.toUpperCase()}</span>
          </div>
          <div class="info-row">
            <span class="label">Delay:</span>
            <span class="value ${train.delay > 0 ? 'delayed' : 'ontime'}">
              ${train.delay > 0 ? `+${train.delay}m` : 'On Time'}
            </span>
          </div>
          <div class="info-row">
            <span class="label">Speed:</span>
            <span class="value">${train.speed || 0} km/h</span>
          </div>
          <div class="info-row">
            <span class="label">Position:</span>
            <span class="value">${train.latitude.toFixed(4)}, ${train.longitude.toFixed(4)}</span>
          </div>
        </div>
        <div class="popup-actions">
          <button class="action-btn track" onclick="window.trackTrain('${train._id}')">
            📍 TRACK
          </button>
          <button class="action-btn control" onclick="window.controlTrain('${train._id}')">
            🎮 CONTROL
          </button>
        </div>
      </div>
    `;
  };

  const getTrainColor = (type) => {
    const colors = {
      express: '#00ff88',
      local: '#0088ff',
      freight: '#ff8800',
      special: '#ff0088'
    };
    return colors[type] || '#ffffff';
  };

  const getTrainSymbol = (type) => {
    const symbols = {
      express: '🚄',
      local: '🚂',
      freight: '🚛',
      special: '⭐'
    };
    return symbols[type] || '🚂';
  };

  const getSectionColor = (status) => {
    const colors = {
      clear: '#00ff88',
      congested: '#ffaa00',
      blocked: '#ff4444'
    };
    return colors[status] || '#888888';
  };

  const highlightTrain = (train) => {
    // Add highlight effect to selected train
    const marker = markersRef.current[train._id];
    if (marker) {
      marker.getElement().classList.add('highlighted');
      setTimeout(() => {
        marker.getElement().classList.remove('highlighted');
      }, 3000);
    }
  };

  const updateMapStyle = () => {
    const mapContainer = mapRef.current;
    if (mapContainer) {
      mapContainer.className = `gaming-map ${mapMode}-mode`;
    }
  };

  // Global functions for popup actions
  useEffect(() => {
    window.trackTrain = (trainId) => {
      const train = trains.find(t => t._id === trainId);
      if (train && mapInstanceRef.current) {
        mapInstanceRef.current.setView([train.latitude, train.longitude], 12);
        onTrainSelect(train);
      }
    };

    window.controlTrain = (trainId) => {
      const train = trains.find(t => t._id === trainId);
      if (train) {
        onTrainSelect(train);
        // Additional control logic here
      }
    };

    return () => {
      delete window.trackTrain;
      delete window.controlTrain;
    };
  }, [trains, onTrainSelect]);

  return (
    <div className="live-map-container">
      <div className="map-header">
        <h2 className="map-title">
          <span className="icon">🗺️</span>
          LIVE RAILWAY MAP
        </h2>
        <div className="map-stats">
          <div className="stat">
            <span className="stat-value">{trains.length}</span>
            <span className="stat-label">Trains</span>
          </div>
          <div className="stat">
            <span className="stat-value">{sections.length}</span>
            <span className="stat-label">Sections</span>
          </div>
          <div className="stat">
            <span className="stat-value">{conflicts.filter(c => !c.resolved).length}</span>
            <span className="stat-label">Conflicts</span>
          </div>
        </div>
      </div>
      
      <div ref={mapRef} className={`gaming-map ${mapMode}-mode`}></div>
      
      <div className="map-legend">
        <div className="legend-item">
          <div className="legend-color express"></div>
          <span>Express</span>
        </div>
        <div className="legend-item">
          <div className="legend-color local"></div>
          <span>Local</span>
        </div>
        <div className="legend-item">
          <div className="legend-color freight"></div>
          <span>Freight</span>
        </div>
        <div className="legend-item">
          <div className="legend-color conflict"></div>
          <span>Conflict</span>
        </div>
      </div>
    </div>
  );
};

export default LiveMap;