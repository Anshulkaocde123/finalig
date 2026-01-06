import React from 'react';

const Home = ({ isDarkMode, setIsDarkMode }) => {
    return (
        <div style={{ 
            padding: '50px', 
            background: isDarkMode ? '#1a1a2e' : '#ffffff', 
            color: isDarkMode ? 'white' : '#1a1a2e', 
            minHeight: '100vh',
            fontFamily: 'system-ui, sans-serif'
        }}>
            <h1 style={{ fontSize: '32px', marginBottom: '20px' }}>
                🏟️ VNIT GAMES - Home Page Working!
            </h1>
            <p style={{ fontSize: '18px', marginBottom: '20px' }}>
                The React app is rendering. This is a simplified home page for debugging.
            </p>
            <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                style={{
                    padding: '10px 20px',
                    background: isDarkMode ? '#4a4a6a' : '#1a1a2e',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '16px'
                }}
            >
                Toggle Dark Mode ({isDarkMode ? 'ON' : 'OFF'})
            </button>
            
            <div style={{ marginTop: '30px' }}>
                <a href="/leaderboard" style={{ color: isDarkMode ? '#00ff88' : '#1a3a6b', marginRight: '20px' }}>
                    🏆 Leaderboard
                </a>
                <a href="/login" style={{ color: isDarkMode ? '#00ff88' : '#1a3a6b' }}>
                    🔐 Admin Login
                </a>
            </div>
        </div>
    );
};

export default Home;
