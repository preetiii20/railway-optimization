import React, { useState, useEffect } from 'react';

const KPIGamingPanel = ({ trains, conflicts, score }) => {
  const [kpis, setKpis] = useState({
    throughput: 0,
    efficiency: 0,
    onTimePercentage: 0,
    avgDelay: 0,
    conflictResolutionRate: 0,
    systemHealth: 'optimal'
  });

  const [trends, setTrends] = useState({
    throughput: 'up',
    efficiency: 'up',
    onTimePercentage: 'stable',
    avgDelay: 'down'
  });

  useEffect(() => {
    calculateKPIs();
  }, [trains, conflicts, score]);

  const calculateKPIs = () => {
    if (!trains || trains.length === 0) {
      setKpis({
        throughput: 0,
        efficiency: 0,
        onTimePercentage: 0,
        avgDelay: 0,
        conflictResolutionRate: 0,
        systemHealth: 'offline'
      });
      return;
    }

    // Calculate throughput (trains per hour)
    const throughput = Math.floor(trains.length * 2.5); // Simulated calculation

    // Calculate efficiency (on-time trains / total trains)
    const onTimeTrains = trains.filter(train => train.delay === 0 || train.status === 'on-time').length;
    const efficiency = Math.floor((onTimeTrains / trains.length) * 100);

    // Calculate on-time percentage
    const onTimePercentage = Math.floor((onTimeTrains / trains.length) * 100);

    // Calculate average delay
    const totalDelay = trains.reduce((sum, train) => sum + (train.delay || 0), 0);
    const avgDelay = trains.length > 0 ? (totalDelay / trains.length).toFixed(1) : 0;

    // Calculate conflict resolution rate
    const resolvedConflicts = conflicts.filter(c => c.resolved).length;
    const conflictResolutionRate = conflicts.length > 0 
      ? Math.floor((resolvedConflicts / conflicts.length) * 100) 
      : 100;

    // Determine system health
    let systemHealth = 'optimal';
    if (efficiency < 70 || conflicts.filter(c => !c.resolved).length > 5) {
      systemHealth = 'critical';
    } else if (efficiency < 85 || conflicts.filter(c => !c.resolved).length > 2) {
      systemHealth = 'warning';
    }

    setKpis({
      throughput,
      efficiency,
      onTimePercentage,
      avgDelay: parseFloat(avgDelay),
      conflictResolutionRate,
      systemHealth
    });

    // Update trends (simplified logic)
    updateTrends();
  };

  const updateTrends = () => {
    // Simulate trend calculation based on current performance
    const newTrends = {
      throughput: kpis.throughput > 45 ? 'up' : kpis.throughput < 35 ? 'down' : 'stable',
      efficiency: kpis.efficiency > 85 ? 'up' : kpis.efficiency < 75 ? 'down' : 'stable',
      onTimePercentage: kpis.onTimePercentage > 90 ? 'up' : kpis.onTimePercentage < 80 ? 'down' : 'stable',
      avgDelay: kpis.avgDelay < 2 ? 'down' : kpis.avgDelay > 5 ? 'up' : 'stable'
    };
    setTrends(newTrends);
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      default: return '➡️';
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up': return 'var(--accent-primary)';
      case 'down': return 'var(--accent-danger)';
      default: return 'var(--accent-secondary)';
    }
  };

  const getHealthColor = (health) => {
    switch (health) {
      case 'optimal': return 'var(--accent-primary)';
      case 'warning': return 'var(--accent-warning)';
      case 'critical': return 'var(--accent-danger)';
      default: return 'var(--text-secondary)';
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <div className="kpi-gaming-panel">
      <div className="panel-header">
        <h3 className="panel-title">📊 Performance Metrics</h3>
        <div className="system-health-indicator">
          <div 
            className={`health-dot ${kpis.systemHealth}`}
            style={{ backgroundColor: getHealthColor(kpis.systemHealth) }}
          ></div>
          <span className="health-text">{kpis.systemHealth.toUpperCase()}</span>
        </div>
      </div>

      {/* Main KPI Grid */}
      <div className="kpi-grid">
        <div className="kpi-card primary">
          <div className="kpi-header">
            <span className="kpi-icon">🚄</span>
            <span className="kpi-trend" style={{ color: getTrendColor(trends.throughput) }}>
              {getTrendIcon(trends.throughput)}
            </span>
          </div>
          <div className="kpi-value">{kpis.throughput}</div>
          <div className="kpi-label">Trains/Hour</div>
          <div className="kpi-progress">
            <div 
              className="progress-fill"
              style={{ width: `${Math.min((kpis.throughput / 60) * 100, 100)}%` }}
            ></div>
          </div>
        </div>

        <div className="kpi-card success">
          <div className="kpi-header">
            <span className="kpi-icon">⚡</span>
            <span className="kpi-trend" style={{ color: getTrendColor(trends.efficiency) }}>
              {getTrendIcon(trends.efficiency)}
            </span>
          </div>
          <div className="kpi-value">{kpis.efficiency}%</div>
          <div className="kpi-label">Efficiency</div>
          <div className="kpi-progress">
            <div 
              className="progress-fill"
              style={{ width: `${kpis.efficiency}%` }}
            ></div>
          </div>
        </div>

        <div className="kpi-card info">
          <div className="kpi-header">
            <span className="kpi-icon">🎯</span>
            <span className="kpi-trend" style={{ color: getTrendColor(trends.onTimePercentage) }}>
              {getTrendIcon(trends.onTimePercentage)}
            </span>
          </div>
          <div className="kpi-value">{kpis.onTimePercentage}%</div>
          <div className="kpi-label">On Time</div>
          <div className="kpi-progress">
            <div 
              className="progress-fill"
              style={{ width: `${kpis.onTimePercentage}%` }}
            ></div>
          </div>
        </div>

        <div className="kpi-card warning">
          <div className="kpi-header">
            <span className="kpi-icon">⏱️</span>
            <span className="kpi-trend" style={{ color: getTrendColor(trends.avgDelay) }}>
              {getTrendIcon(trends.avgDelay)}
            </span>
          </div>
          <div className="kpi-value">{kpis.avgDelay}m</div>
          <div className="kpi-label">Avg Delay</div>
          <div className="kpi-progress">
            <div 
              className="progress-fill"
              style={{ 
                width: `${Math.min((kpis.avgDelay / 10) * 100, 100)}%`,
                backgroundColor: 'var(--accent-danger)'
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="secondary-metrics">
        <div className="metric-row">
          <span className="metric-label">Conflict Resolution</span>
          <span className="metric-value">{kpis.conflictResolutionRate}%</span>
        </div>
        <div className="metric-row">
          <span className="metric-label">Active Conflicts</span>
          <span className="metric-value conflict">
            {conflicts.filter(c => !c.resolved).length}
          </span>
        </div>
        <div className="metric-row">
          <span className="metric-label">Player Score</span>
          <span className="metric-value score">{formatNumber(score)}</span>
        </div>
      </div>

      {/* Performance Chart (Simplified) */}
      <div className="performance-chart">
        <h4>Performance Trend</h4>
        <div className="chart-container">
          <div className="chart-bars">
            {[85, 92, 88, 95, 90, 87, 93].map((value, index) => (
              <div key={index} className="chart-bar">
                <div 
                  className="bar-fill"
                  style={{ 
                    height: `${value}%`,
                    backgroundColor: value > 90 ? 'var(--accent-primary)' : 
                                   value > 80 ? 'var(--accent-warning)' : 'var(--accent-danger)'
                  }}
                ></div>
              </div>
            ))}
          </div>
          <div className="chart-labels">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
              <span key={index} className="chart-label">{day}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Achievement Progress */}
      <div className="achievement-progress">
        <h4>Daily Goals</h4>
        <div className="goals-list">
          <div className="goal-item">
            <span className="goal-icon">🎯</span>
            <div className="goal-info">
              <span className="goal-name">Zero Delays</span>
              <div className="goal-progress">
                <div 
                  className="goal-fill"
                  style={{ width: `${Math.min((kpis.onTimePercentage / 100) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
            <span className="goal-status">
              {kpis.onTimePercentage >= 95 ? '✅' : '⏳'}
            </span>
          </div>
          
          <div className="goal-item">
            <span className="goal-icon">⚡</span>
            <div className="goal-info">
              <span className="goal-name">High Efficiency</span>
              <div className="goal-progress">
                <div 
                  className="goal-fill"
                  style={{ width: `${kpis.efficiency}%` }}
                ></div>
              </div>
            </div>
            <span className="goal-status">
              {kpis.efficiency >= 90 ? '✅' : '⏳'}
            </span>
          </div>
          
          <div className="goal-item">
            <span className="goal-icon">🚀</span>
            <div className="goal-info">
              <span className="goal-name">Peak Throughput</span>
              <div className="goal-progress">
                <div 
                  className="goal-fill"
                  style={{ width: `${Math.min((kpis.throughput / 50) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
            <span className="goal-status">
              {kpis.throughput >= 50 ? '✅' : '⏳'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KPIGamingPanel;