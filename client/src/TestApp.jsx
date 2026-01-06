// Minimal test app to debug white screen issue
import React from 'react';

function TestApp() {
  return (
    <div style={{ 
      padding: '50px', 
      background: '#1a1a2e', 
      color: 'white', 
      minHeight: '100vh',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <h1 style={{ fontSize: '32px', marginBottom: '20px' }}>✅ React is Working!</h1>
      <p style={{ fontSize: '18px', marginBottom: '20px' }}>
        If you can see this, React is rendering correctly.
      </p>
      <div style={{ 
        background: '#2d2d44', 
        padding: '20px', 
        borderRadius: '10px',
        border: '2px solid #4a4a6a'
      }}>
        <h2 style={{ color: '#00ff88', marginBottom: '10px' }}>Debug Info:</h2>
        <ul style={{ listStyle: 'disc', paddingLeft: '20px' }}>
          <li>React Version: {React.version}</li>
          <li>Time: {new Date().toLocaleString()}</li>
          <li>Window Origin: {typeof window !== 'undefined' ? window.location.origin : 'N/A'}</li>
        </ul>
      </div>
    </div>
  );
}

export default TestApp;
