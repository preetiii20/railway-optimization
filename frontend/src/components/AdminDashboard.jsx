import { useState, useEffect } from 'react';
import { getTrains, getSections, getUsers } from '../services/api';
import '../styles/control-room.css';

const AdminDashboard = ({ user, onLogout }) => {
  const [systemStats, setSystemStats] = useState({
    totalSections: 0,
    totalTrains: 0,
    activeSections: 0,
    totalUsers: 0,
    systemStatus: 'operational'
  });

  const [activeModule, setActiveModule] = useState('overview');

  useEffect(() => {
    loadSystemStats();
  }, []);

  const loadSystemStats = async () => {
    try {
      const [trainsRes, sectionsRes] = await Promise.all([
        getTrains(),
        getSections()
      ]);

      setSystemStats({
        totalSections: sectionsRes.data.data?.length || 3,
        totalTrains: trainsRes.data.data?.length || 8,
        activeSections: 2,
        totalUsers: 12,
        systemStatus: 'operational'
      });
    } catch (error) {
      console.error('Failed to load system stats:', error);
    }
  };

  const adminModules = [
    { id: 'overview', name: 'System Overview', icon: '📊', description: 'System status and statistics' },
    { id: 'sections', name: 'Manage Sections', icon: '🛤️', description: 'Railway section configuration' },
    { id: 'stations', name: 'Stations & Platforms', icon: '🏢', description: 'Station and platform setup' },
    { id: 'tracks', name: 'Track Blocks', icon: '🚧', description: 'Track block configuration' },
    { id: 'trains', name: 'Train Master', icon: '🚂', description: 'Train fleet management' },
    { id: 'timetable', name: 'Timetable Upload', icon: '📅', description: 'Schedule management' },
    { id: 'users', name: 'User Management', icon: '👥', description: 'User accounts and roles' }
  ];

  const renderModuleContent = () => {
    switch (activeModule) {
      case 'overview':
        return (
          <div className="admin-overview">
            <div className="stats-grid">
              <div className="stat-card primary">
                <div className="stat-icon">🛤️</div>
                <div className="stat-content">
                  <div className="stat-value">{systemStats.totalSections}</div>
                  <div className="stat-label">Total Sections</div>
                </div>
              </div>
              <div className="stat-card success">
                <div className="stat-icon">🚂</div>
                <div className="stat-content">
                  <div className="stat-value">{systemStats.totalTrains}</div>
                  <div className="stat-label">Total Trains</div>
                </div>
              </div>
              <div className="stat-card warning">
                <div className="stat-icon">⚡</div>
                <div className="stat-content">
                  <div className="stat-value">{systemStats.activeSections}</div>
                  <div className="stat-label">Active Sections</div>
                </div>
              </div>
              <div className="stat-card info">
                <div className="stat-icon">👥</div>
                <div className="stat-content">
                  <div className="stat-value">{systemStats.totalUsers}</div>
                  <div className="stat-label">Total Users</div>
                </div>
              </div>
            </div>

            <div className="system-status-panel">
              <h3>System Status</h3>
              <div className="status-items">
                <div className="status-item">
                  <div className="status-dot online"></div>
                  <span>Database Connection: Online</span>
                </div>
                <div className="status-item">
                  <div className="status-dot online"></div>
                  <span>AI Engine: Operational</span>
                </div>
                <div className="status-item">
                  <div className="status-dot online"></div>
                  <span>Real-time Updates: Active</span>
                </div>
                <div className="status-item">
                  <div className="status-dot warning"></div>
                  <span>Backup System: Scheduled</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'sections':
        return (
          <div className="admin-module">
            <h3>Section Management</h3>
            <div className="module-actions">
              <button className="action-btn btn-primary">+ Add New Section</button>
              <button className="action-btn btn-secondary">Import Configuration</button>
            </div>
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>Section ID</th>
                    <th>Name</th>
                    <th>Tracks</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>SEC-001</td>
                    <td>Section A-B-C</td>
                    <td>3 tracks</td>
                    <td><span className="status-badge active">Active</span></td>
                    <td>
                      <button className="table-btn edit">Edit</button>
                      <button className="table-btn delete">Delete</button>
                    </td>
                  </tr>
                  <tr>
                    <td>SEC-002</td>
                    <td>Section D-E-F</td>
                    <td>2 tracks</td>
                    <td><span className="status-badge inactive">Inactive</span></td>
                    <td>
                      <button className="table-btn edit">Edit</button>
                      <button className="table-btn delete">Delete</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'trains':
        return (
          <div className="admin-module">
            <h3>Train Fleet Management</h3>
            <div className="module-actions">
              <button className="action-btn btn-primary">+ Add New Train</button>
              <button className="action-btn btn-secondary">Bulk Import</button>
            </div>
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>Train ID</th>
                    <th>Type</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>T101</td>
                    <td>Express</td>
                    <td>High (9)</td>
                    <td><span className="status-badge active">Active</span></td>
                    <td>
                      <button className="table-btn edit">Edit</button>
                      <button className="table-btn delete">Delete</button>
                    </td>
                  </tr>
                  <tr>
                    <td>F205</td>
                    <td>Freight</td>
                    <td>Medium (5)</td>
                    <td><span className="status-badge active">Active</span></td>
                    <td>
                      <button className="table-btn edit">Edit</button>
                      <button className="table-btn delete">Delete</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'users':
        return (
          <div className="admin-module">
            <h3>User Management</h3>
            <div className="module-actions">
              <button className="action-btn btn-primary">+ Add New User</button>
              <button className="action-btn btn-secondary">Export Users</button>
            </div>
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Role</th>
                    <th>Section</th>
                    <th>Last Login</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>controller_1</td>
                    <td>Section Controller</td>
                    <td>Section A-B-C</td>
                    <td>2 hours ago</td>
                    <td>
                      <button className="table-btn edit">Edit</button>
                      <button className="table-btn delete">Delete</button>
                    </td>
                  </tr>
                  <tr>
                    <td>supervisor_1</td>
                    <td>Supervisor</td>
                    <td>All Sections</td>
                    <td>1 day ago</td>
                    <td>
                      <button className="table-btn edit">Edit</button>
                      <button className="table-btn delete">Delete</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );

      default:
        return <div>Select a module from the sidebar</div>;
    }
  };

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="admin-header">
        <div className="header-content">
          <div className="system-title">
            <span className="system-logo">⚙️</span>
            <div>
              <span className="system-name">RailOpt Admin Panel</span>
              <span className="system-subtitle">System Configuration & Management</span>
            </div>
          </div>
          
          <div className="header-actions">
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

      <div className="admin-layout">
        {/* Sidebar */}
        <aside className="admin-sidebar">
          <nav className="admin-nav">
            {adminModules.map(module => (
              <button
                key={module.id}
                className={`nav-item ${activeModule === module.id ? 'active' : ''}`}
                onClick={() => setActiveModule(module.id)}
              >
                <span className="nav-icon">{module.icon}</span>
                <div className="nav-content">
                  <span className="nav-name">{module.name}</span>
                  <span className="nav-description">{module.description}</span>
                </div>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="admin-main">
          <div className="admin-content">
            {renderModuleContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;