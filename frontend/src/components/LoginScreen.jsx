import { useState } from 'react';
import '../styles/control-room.css';

const LoginScreen = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    role: 'controller'
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate login process
    setTimeout(() => {
      onLogin(credentials);
      setIsLoading(false);
    }, 1500);
  };

  const roles = [
    { value: 'controller', label: 'Section Controller', description: 'Monitor and control train operations' },
    { value: 'supervisor', label: 'Supervisor', description: 'Oversee multiple sections and analytics' },
    { value: 'analyst', label: 'Analyst', description: 'Access reports and historical data' },
    { value: 'admin', label: 'Administrator', description: 'Full system access and configuration' }
  ];

  return (
    <div className="login-screen">
      <div className="login-background">
        <div className="railway-animation">
          <div className="train-track"></div>
          <div className="moving-train">🚂</div>
        </div>
      </div>
      
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="system-logo-large">🚦</div>
            <h1>RailOpt Control Center</h1>
            <p>AI-Powered Railway Operations Management</p>
          </div>
          
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                value={credentials.username}
                onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                placeholder="Enter your username"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Enter your password"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="role">Role</label>
              <select
                id="role"
                value={credentials.role}
                onChange={(e) => setCredentials(prev => ({ ...prev, role: e.target.value }))}
              >
                {roles.map(role => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
              <div className="role-description">
                {roles.find(r => r.value === credentials.role)?.description}
              </div>
            </div>
            
            <button 
              type="submit" 
              className="login-button"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="loading-spinner"></div>
                  Authenticating...
                </>
              ) : (
                'Access Control Room'
              )}
            </button>
          </form>
          
          <div className="login-footer">
            <div className="demo-credentials">
              <strong>Demo Credentials:</strong><br/>
              Username: demo | Password: demo123
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .login-screen {
          min-height: 100vh;
          background: var(--bg-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }
        
        .login-background {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0.1;
        }
        
        .railway-animation {
          position: relative;
          width: 100%;
          height: 100%;
        }
        
        .train-track {
          position: absolute;
          top: 50%;
          left: 0;
          width: 100%;
          height: 4px;
          background: repeating-linear-gradient(
            90deg,
            var(--railway-blue) 0px,
            var(--railway-blue) 20px,
            transparent 20px,
            transparent 40px
          );
          transform: translateY(-50%);
        }
        
        .moving-train {
          position: absolute;
          top: 50%;
          font-size: 2rem;
          animation: moveTrain 10s linear infinite;
          transform: translateY(-50%);
        }
        
        @keyframes moveTrain {
          0% { left: -100px; }
          100% { left: calc(100% + 100px); }
        }
        
        .login-container {
          position: relative;
          z-index: 1;
        }
        
        .login-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 2rem;
          width: 400px;
          box-shadow: var(--shadow-lg);
        }
        
        .login-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        
        .system-logo-large {
          font-size: 3rem;
          margin-bottom: 1rem;
        }
        
        .login-header h1 {
          margin: 0 0 0.5rem 0;
          color: var(--railway-blue-light);
          font-size: 1.5rem;
          font-weight: 700;
        }
        
        .login-header p {
          margin: 0;
          color: var(--text-secondary);
          font-size: 0.875rem;
        }
        
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .form-group label {
          font-weight: 500;
          color: var(--text-primary);
          font-size: 0.875rem;
        }
        
        .form-group input,
        .form-group select {
          padding: 0.75rem;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 6px;
          color: var(--text-primary);
          font-size: 0.875rem;
        }
        
        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: var(--railway-blue);
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }
        
        .role-description {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-style: italic;
        }
        
        .login-button {
          padding: 0.75rem 1.5rem;
          background: var(--railway-blue);
          color: white;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition-fast);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
        
        .login-button:hover:not(:disabled) {
          background: var(--railway-blue-dark);
          transform: translateY(-1px);
        }
        
        .login-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .loading-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .login-footer {
          margin-top: 2rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border-color);
          text-align: center;
        }
        
        .demo-credentials {
          font-size: 0.75rem;
          color: var(--text-muted);
          background: var(--bg-card);
          padding: 0.75rem;
          border-radius: 6px;
        }
      `}</style>
    </div>
  );
};

export default LoginScreen;