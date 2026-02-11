import React, { useEffect, useRef } from 'react';
import './TimeDistanceGraph.css';

function TimeDistanceGraph({ trains, stations, conflicts }) {
  const canvasRef = useRef(null);
  
  // Get station list from actual data
  const stationList = Object.values(stations).slice(0, 15);

  useEffect(() => {
    if (!canvasRef.current || trains.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = '#0a0e27';
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    
    // Vertical lines (time)
    for (let i = 0; i <= 24; i++) {
      const x = (i / 24) * width;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
      
      // Time labels
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = '10px Arial';
      ctx.fillText(`${i}:00`, x + 2, height - 5);
    }

    // Horizontal lines (stations)
    stationList.forEach((station, idx) => {
      const y = (idx / stationList.length) * (height - 30);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
      
      // Station labels
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.font = '11px Arial';
      ctx.fillText(station.name?.substring(0, 15) || station.code, 5, y - 5);
    });

    // Draw train paths
    trains.slice(0, 30).forEach((train, idx) => {
      if (!train.route || train.route.length < 2) return;

      const isLocal = train.train_type === 'local';
      const isExpress = train.train_type === 'express';
      ctx.strokeStyle = isLocal ? '#00ff88' : isExpress ? '#4a90e2' : '#ffaa00';
      ctx.lineWidth = 2;
      ctx.beginPath();

      train.route.forEach((stop, stopIdx) => {
        const stationIdx = stationList.findIndex(s => s.code === stop.station_code);
        if (stationIdx === -1) return;

        const time = stop.arrival_minutes || 0;
        const x = (time / 1440) * width; // 1440 minutes in a day
        const y = (stationIdx / stationList.length) * (height - 30);

        if (stopIdx === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();
    });

    // Draw conflict zones
    if (conflicts && conflicts.length > 0) {
      ctx.fillStyle = 'rgba(255, 68, 68, 0.3)';
      conflicts.slice(0, 10).forEach(conflict => {
        const stationIdx = stationList.findIndex(s => 
          s.code === conflict.station_code || s.code === conflict.station
        );
        if (stationIdx !== -1) {
          const y = (stationIdx / stationList.length) * (height - 30);
          ctx.fillRect(0, y - 10, width, 20);
        }
      });
    }

  }, [trains, stations, conflicts, stationList]);

  return (
    <div className="time-distance-graph">
      <div className="graph-header">
        <h3>📊 Time-Distance Graph (Railway Operations View)</h3>
        <div className="graph-legend">
          <span><span className="legend-line green"></span> Local Trains</span>
          <span><span className="legend-line blue"></span> Express Trains</span>
          <span><span className="legend-box red"></span> Conflict Zones</span>
        </div>
      </div>
      <div style={{background: '#0a0e27', borderRadius: '8px', padding: '10px'}}>
        <canvas 
          ref={canvasRef} 
          width={1200} 
          height={400}
          style={{width: '100%', height: 'auto', display: 'block'}}
        />
      </div>
      <div className="graph-info">
        <p>X-axis: Time (24 hours) | Y-axis: Stations | Lines: Train movements</p>
        {trains.length > 0 && (
          <p style={{color: '#4a90e2', marginTop: '5px'}}>
            Showing {Math.min(trains.length, 30)} trains across {stationList.length} stations
          </p>
        )}
      </div>
    </div>
  );
}

export default TimeDistanceGraph;
