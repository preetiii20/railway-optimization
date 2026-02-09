import { useState, useEffect } from 'react';
import { getAuditLogs } from '../services/api';
import '../styles/control-room.css';

const AuditDashboard = ({ user, onLogout }) => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    section: 'all',
    user: 'all',
    action: 'all'
  });
  const [isLoading, setIsLoading] = useState(false);

  // Mock audit data
  const mockAuditData = [
    {
      id: 1,
      timestamp: new Date(Date.now() - 3600000),
      section: 'Section A-B-C',
      conflictId: 'CONF-001',
      conflictType: 'Crossing Conflict',
      aiRecommendation: 'Hold Freight F205 at Station B for 8 minutes',
      userAction: 'Applied',
      user: 'controller_1',
      result: 'Delay reduced by 12 minutes',
      confidence: 94
    },
    {
      id: 2,
      timestamp: new Date(Date.now() - 7200000),
      section: 'Section A-B-C',
      conflictId: 'CONF-002',
      conflictType: 'Platform Conflict',
      aiRecommendation: 'Redirect Express T101 to Platform 2',
      userAction: 'Modified',
      user: 'controller_1',
      result: 'Alternative solution applied',
      confidence: 87
    },
    {
      id: 3,
      timestamp: new Date(Date.now() - 10800000),
      section: 'Section D-E-F',
      conflictId: 'CONF-003',
      conflictType: 'Precedence Conflict',
      aiRecommendation: 'Give priority to Express T203',
      userAction: 'Rejected',
      user: 'controller_2',
      result: 'Manual override - safety concern',
      confidence: 91
    },
    {
      id: 4,
      timestamp: new Date(Date.now() - 14400000),
      section: 'Section A-B-C',
      conflictId: 'CONF-004',
      conflictType: 'Signal Failure',
      aiRecommendation: 'Reroute via Loop A',
      userAction: 'Applied',
      user: 'controller_1',
      result: 'Normal operations resumed',
      confidence: 96
    }
  ];

  useEffect(() => {
    loadAuditLogs();
  }, [filters]);

  const loadAuditLogs = async () => {
    setIsLoading(true);
    try {
      // In real implementation, use API
      // const response = await getAuditLogs(filters);
      // setAuditLogs(response.data);
      
      // For demo, use mock data
      setTimeout(() => {
        setAuditLogs(mockAuditData);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('Failed to load audit logs:', error);
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const exportLogs = () => {
    // Create CSV content
    const headers = ['Timestamp', 'Section', 'Conflict Type', 'AI Recommendation', 'User Action', 'User', 'Result'];
    const csvContent = [
      headers.join(','),
      ...auditLogs.map(log => [
        log.timestamp.toISOString(),
        log.section,
        log.conflictType,
        `"${log.aiRecommendation}"`,
        log.userAction,
        log.user,
        `"${log.result}"`
      ].join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getActionBadgeClass = (action) => {
    switch (action.toLowerCase()) {
      case 'applied': return 'success';
      case 'rejected': return 'danger';
      case 'modified': return 'warning';
      default: return 'secondary';
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return 'var(--status-success)';
    if (confidence >= 80) return 'var(--status-warning)';
    return 'var(--status-danger)';
  };

  return (
    <div className="audit-dashboard">
      {/* Header */}
      <header className="audit-header">
        <div className="header-content">
          <div className="system-title">
            <span className="system-logo">📋</span>
            <div>
              <span className="system-name">RailOpt Audit System</span>
              <span className="system-subtitle">Decision Tracking & Compliance</span>
            </div>
          </div>
          
          <div className="header-actions">
            <button className="action-btn btn-primary" onClick={exportLogs}>
              📊 Export Logs
            </button>
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

      {/* Filters */}
      <div className="audit-filters">
        <div className="filter-group">
          <label>Date From:</label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label>Date To:</label>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => handleFilterChange('dateTo', e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label>Section:</label>
          <select
            value={filters.section}
            onChange={(e) => handleFilterChange('section', e.target.value)}
          >
            <option value="all">All Sections</option>
            <option value="Section A-B-C">Section A-B-C</option>
            <option value="Section D-E-F">Section D-E-F</option>
            <option value="Section G-H-I">Section G-H-I</option>
          </select>
        </div>
        <div className="filter-group">
          <label>User:</label>
          <select
            value={filters.user}
            onChange={(e) => handleFilterChange('user', e.target.value)}
          >
            <option value="all">All Users</option>
            <option value="controller_1">Controller 1</option>
            <option value="controller_2">Controller 2</option>
            <option value="supervisor_1">Supervisor 1</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Action:</label>
          <select
            value={filters.action}
            onChange={(e) => handleFilterChange('action', e.target.value)}
          >
            <option value="all">All Actions</option>
            <option value="applied">Applied</option>
            <option value="rejected">Rejected</option>
            <option value="modified">Modified</option>
          </select>
        </div>
      </div>

      {/* Audit Statistics */}
      <div className="audit-stats">
        <div className="stat-card success">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-value">{auditLogs.filter(log => log.userAction === 'Applied').length}</div>
            <div className="stat-label">AI Recommendations Applied</div>
          </div>
        </div>
        <div className="stat-card danger">
          <div className="stat-icon">❌</div>
          <div className="stat-content">
            <div className="stat-value">{auditLogs.filter(log => log.userAction === 'Rejected').length}</div>
            <div className="stat-label">AI Recommendations Rejected</div>
          </div>
        </div>
        <div className="stat-card warning">
          <div className="stat-icon">✏️</div>
          <div className="stat-content">
            <div className="stat-value">{auditLogs.filter(log => log.userAction === 'Modified').length}</div>
            <div className="stat-label">AI Recommendations Modified</div>
          </div>
        </div>
        <div className="stat-card info">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <div className="stat-value">
              {auditLogs.length > 0 ? Math.round((auditLogs.filter(log => log.userAction === 'Applied').length / auditLogs.length) * 100) : 0}%
            </div>
            <div className="stat-label">AI Acceptance Rate</div>
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="audit-logs">
        <h3>Decision Audit Trail</h3>
        
        {isLoading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <span>Loading audit logs...</span>
          </div>
        ) : (
          <div className="audit-table">
            <table>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Section</th>
                  <th>Conflict Type</th>
                  <th>AI Recommendation</th>
                  <th>Confidence</th>
                  <th>User Action</th>
                  <th>Controller</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map(log => (
                  <tr key={log.id}>
                    <td>
                      <div className="timestamp">
                        <div>{log.timestamp.toLocaleDateString()}</div>
                        <div className="time">{log.timestamp.toLocaleTimeString()}</div>
                      </div>
                    </td>
                    <td>{log.section}</td>
                    <td>
                      <span className="conflict-type">{log.conflictType}</span>
                      <small className="conflict-id">{log.conflictId}</small>
                    </td>
                    <td className="recommendation-cell">
                      <div className="recommendation-text">{log.aiRecommendation}</div>
                    </td>
                    <td>
                      <div 
                        className="confidence-bar"
                        style={{ '--confidence': `${log.confidence}%`, '--color': getConfidenceColor(log.confidence) }}
                      >
                        <span className="confidence-text">{log.confidence}%</span>
                      </div>
                    </td>
                    <td>
                      <span className={`action-badge ${getActionBadgeClass(log.userAction)}`}>
                        {log.userAction}
                      </span>
                    </td>
                    <td>{log.user}</td>
                    <td className="result-cell">
                      <div className="result-text">{log.result}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditDashboard;