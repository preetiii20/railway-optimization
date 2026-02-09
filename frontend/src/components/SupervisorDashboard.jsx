import { useState, useEffect } from 'react';
import { getKPIs, getTrains, getSections } from '../services/api';
import '../styles/control-room.css';

const SupervisorDashboard = ({ user, onLogout }) => {
  const [overallKPIs, setOverallKPIs] = useState({
    totalSections: 3,
    totalTrains: 15,
    avgDelay: 4.2,
    onTimePercentage: 92,
    totalConflicts: 2,
    throughput: 45
  });

  const [sectionPerformance, setSectionPerformance] = useState([
    { id: 'SEC-001', name: 'Section A-B-C', trains: 8, delay: 3.5, onTime: 94, conflicts: 1, status: 'operational' },
    { id: 'SEC-002', name: 'Section D-E-F', trains: 5, delay: 5.2, onTime: 88, conflicts: 1, status: 'warning' },
    { id: 'SEC-003', name: 'Section G-H-I', trains: 2, delay: 2.1, onTime: 96, conflicts: 0, status: 'optimal' }
  ]);

  const [activeView, setActiveView] = useState('overview');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [kpisRes, trainsRes, sectionsRes] = await Promise.all([
        getKPIs('24h'),
        getTrains(),
        getSections()
      ]);

      // Update with real data when available
      console.log('Loaded supervisor data:', { kpisRes, trainsRes, sectionsRes });
    } catch (error) {
      console.error('Failed to load supervisor data:', error);
    }
  };

  const renderOverview = () => (
    <div className="supervisor-overview">
      {/* Overall KPIs */}
      <div className="kpi-section">
        <h3>System-wide Performance</h3>
        <div className="kpi-grid-supervisor">
          <div className="kpi-card primary">
            <div className="kpi-icon">🛤️</div>
            <div className="kpi-content">
              <div className="kpi-value">{overallKPIs.totalSections}</div>
              <div className="kpi-label">Active Sections</div>
            </div>
          </div>
          <div className="kpi-card success">
            <div className="kpi-icon">🚂</div>
            <div className="kpi-content">
              <div className="kpi-value">{overallKPIs.totalTrains}</div>
              <div className="kpi-label">Total Trains</div>
            </div>
          </div>
          <div className="kpi-card warning">
            <div className="kpi-icon">⏱️</div>
            <div className="kpi-content">
              <div className="kpi-value">{overallKPIs.avgDelay}m</div>
              <div className="kpi-label">Avg Delay</div>
            </div>
          </div>
          <div className="kpi-card info">
            <div className="kpi-icon">📊</div>
            <div className="kpi-content">
              <div className="kpi-value">{overallKPIs.onTimePercentage}%</div>
              <div className="kpi-label">On Time</div>
            </div>
          </div>
          <div className="kpi-card danger">
            <div className="kpi-icon">⚠️</div>
            <div className="kpi-content">
              <div className="kpi-value">{overallKPIs.totalConflicts}</div>
              <div className="kpi-label">Active Conflicts</div>
            </div>
          </div>
          <div className="kpi-card secondary">
            <div className="kpi-icon">🚀</div>
            <div className="kpi-content">
              <div className="kpi-value">{overallKPIs.throughput}</div>
              <div className="kpi-label">Trains/Hour</div>
            </div>
          </div>
        </div>
      </div>

      {/* Section Performance Table */}
      <div className="section-performance">
        <h3>Section Performance Overview</h3>
        <div className="performance-table">
          <table>
            <thead>
              <tr>
                <th>Section</th>
                <th>Active Trains</th>
                <th>Avg Delay</th>
                <th>On Time %</th>
                <th>Conflicts</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sectionPerformance.map(section => (
                <tr key={section.id}>
                  <td>
                    <div className="section-info">
                      <strong>{section.name}</strong>
                      <small>{section.id}</small>
                    </div>
                  </td>
                  <td>{section.trains}</td>
                  <td className={section.delay > 5 ? 'text-danger' : 'text-success'}>
                    {section.delay}m
                  </td>
                  <td className={section.onTime < 90 ? 'text-danger' : 'text-success'}>
                    {section.onTime}%
                  </td>
                  <td className={section.conflicts > 0 ? 'text-danger' : 'text-success'}>
                    {section.conflicts}
                  </td>
                  <td>
                    <span className={`status-badge ${section.status}`}>
                      {section.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <button className="table-btn view">View Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Charts */}
      <div className="performance-charts">
        <div className="chart-container">
          <h4>Daily Delay Trend</h4>
          <div className="chart-placeholder">
            <div className="chart-bars">
              {[3.2, 4.1, 2.8, 5.5, 4.2, 3.9, 4.2].map((value, index) => (
                <div 
                  key={index} 
                  className="chart-bar" 
                  style={{ height: `${value * 10}%` }}
                  title={`Day ${index + 1}: ${value}m`}
                ></div>
              ))}
            </div>
            <div className="chart-labels">
              <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
            </div>
          </div>
        </div>

        <div className="chart-container">
          <h4>Throughput by Section</h4>
          <div className="chart-placeholder">
            <div className="pie-chart">
              <div className="pie-segment" style={{ '--percentage': '45%', '--color': 'var(--railway-blue)' }}></div>
              <div className="pie-segment" style={{ '--percentage': '30%', '--color': 'var(--status-success)' }}></div>
              <div className="pie-segment" style={{ '--percentage': '25%', '--color': 'var(--status-warning)' }}></div>
            </div>
            <div className="pie-legend">
              <div className="legend-item">
                <div className="legend-color" style={{ background: 'var(--railway-blue)' }}></div>
                <span>Section A-B-C (45%)</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ background: 'var(--status-success)' }}></div>
                <span>Section D-E-F (30%)</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ background: 'var(--status-warning)' }}></div>
                <span>Section G-H-I (25%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="supervisor-reports">
      <h3>Performance Reports</h3>
      <div className="report-actions">
        <button className="action-btn btn-primary">Generate Daily Report</button>
        <button className="action-btn btn-secondary">Export Analytics</button>
        <button className="action-btn btn-info">Schedule Report</button>
      </div>
      
      <div className="report-list">
        <div className="report-item">
          <div className="report-info">
            <h4>Daily Operations Report</h4>
            <p>Generated: Today 08:00 AM</p>
          </div>
          <div className="report-actions">
            <button className="table-btn view">View</button>
            <button className="table-btn download">Download</button>
          </div>
        </div>
        <div className="report-item">
          <div className="report-info">
            <h4>Weekly Performance Summary</h4>
            <p>Generated: Yesterday 11:30 PM</p>
          </div>
          <div className="report-actions">
            <button className="table-btn view">View</button>
            <button className="table-btn download">Download</button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="supervisor-dashboard">
      {/* Header */}
      <header className="supervisor-header">
        <div className="header-content">
          <div className="system-title">
            <span className="system-logo">👩‍💼</span>
            <div>
              <span className="system-name">RailOpt Supervisor Panel</span>
              <span className="system-subtitle">Multi-Section Performance Monitoring</span>
            </div>
          </div>
          
          <div className="header-actions">
            <div className="view-selector">
              <button 
                className={`view-btn ${activeView === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveView('overview')}
              >
                📊 Overview
              </button>
              <button 
                className={`view-btn ${activeView === 'reports' ? 'active' : ''}`}
                onClick={() => setActiveView('reports')}
              >
                📋 Reports
              </button>
            </div>
            
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <span className="user-role">{user.role}</span>
            </div>
            <button className="logout-btn" onClick={onLogout}>
              🚪 Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="supervisor-main">
        <div className="supervisor-content">
          {activeView === 'overview' ? renderOverview() : renderReports()}
        </div>
      </main>
    </div>
  );
};

export default SupervisorDashboard;