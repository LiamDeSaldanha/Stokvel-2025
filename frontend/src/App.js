import React, { useState, useEffect } from 'react';
import './index.css';
import { apiService } from './services/api';

function App() {
  const [apiStatus, setApiStatus] = useState(null);
  const [dbStatus, setDbStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.checkHealth();
      setApiStatus(response.status);
      setDbStatus(response.database);
    } catch (err) {
      setError('Failed to connect to API');
      console.error('Health check failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="App">
      <div className="container">
        <h1>🏦 Stokvel App</h1>
        <p>Full-stack application with React, Node.js, FastAPI, and PostgreSQL</p>
        
        <div className="status">
          <div className="status-item">
            <h3>Frontend</h3>
            <p>✅ Running</p>
          </div>
          <div className="status-item">
            <h3>Backend API</h3>
            <p>{loading ? '⏳ Checking...' : apiStatus === 'healthy' ? '✅ Healthy' : '❌ Down'}</p>
          </div>
          <div className="status-item">
            <h3>Database</h3>
            <p>{loading ? '⏳ Checking...' : dbStatus === 'connected' ? '✅ Connected' : '❌ Disconnected'}</p>
          </div>
        </div>

        {error && <div className="error">{error}</div>}
        
        <button onClick={checkHealth}>
          Refresh Status
        </button>

        <div style={{ marginTop: '2rem', fontSize: '0.9rem' }}>
          <p>🐳 Running in Docker containers</p>
          <p>🚀 Ready for n8n integration</p>
        </div>
      </div>
    </div>
  );
}

export default App;
