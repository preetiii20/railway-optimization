import { useState } from 'react';
import LoginScreen from '../components/LoginScreen';
import ControlRoomDashboard from '../components/ControlRoomDashboard';
import AdminDashboard from '../components/AdminDashboard';
import SupervisorDashboard from '../components/SupervisorDashboard';
import AuditDashboard from '../components/AuditDashboard';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);

  // Handle login
  const handleLogin = (userData) => {
    setUser(userData);
    setUserRole(userData.role);
  };

  // Handle logout
  const handleLogout = () => {
    setUser(null);
    setUserRole(null);
    localStorage.removeItem('authToken');
  };

  // If not logged in, show login screen
  if (!user || !userRole) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // Route to appropriate dashboard based on role
  switch (userRole) {
    case 'admin':
      return <AdminDashboard user={user} onLogout={handleLogout} />;
    case 'controller':
      return <ControlRoomDashboard user={user} onLogout={handleLogout} />;
    case 'supervisor':
      return <SupervisorDashboard user={user} onLogout={handleLogout} />;
    case 'auditor':
      return <AuditDashboard user={user} onLogout={handleLogout} />;
    default:
      return <ControlRoomDashboard user={user} onLogout={handleLogout} />;
  }
};

export default Dashboard;