import React from 'react';
import { useNavigate } from 'react-router-dom';

function Sidebar() {
  const navigate = useNavigate();

  return (
    <div style={{
      width: '250px',
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #1a1a2e 0%, #0a0a0f 100%)',
      borderRight: '2px solid rgba(0,255,136,0.3)',
      padding: '20px',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 100
    }}>
      <h2 style={{
        color: '#00ff88',
        marginBottom: '30px',
        fontSize: '22px',
        textAlign: 'center',
        fontWeight: 'bold'
      }}>
        🚂 IRIS Admin
      </h2>
      
      <nav style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '15px 20px',
            background: 'rgba(0,255,136,0.2)',
            border: '2px solid #00ff88',
            borderRadius: '10px',
            color: 'white',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.3s'
          }}
          onMouseOver={(e) => e.target.style.background = 'rgba(0,255,136,0.3)'}
          onMouseOut={(e) => e.target.style.background = 'rgba(0,255,136,0.2)'}
        >
          📊 Dashboard
        </button>
        
        <button
          onClick={() => navigate('/ai-features')}
          style={{
            padding: '15px 20px',
            background: 'linear-gradient(135deg, #0088ff 0%, #00ff88 100%)',
            border: '2px solid #00ff88',
            borderRadius: '10px',
            color: 'white',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 0 20px rgba(0,255,136,0.5)',
            transition: 'all 0.3s'
          }}
          onMouseOver={(e) => e.target.style.boxShadow = '0 0 30px rgba(0,255,136,0.8)'}
          onMouseOut={(e) => e.target.style.boxShadow = '0 0 20px rgba(0,255,136,0.5)'}
        >
          🤖 AI Features ✨
        </button>
      </nav>
    </div>
  );
}

export default Sidebar;
