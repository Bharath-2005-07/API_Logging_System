/**
 * Dashboard Page Component
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Dashboard.css';

function DashboardPage({ isAuthenticated }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      fetchStats();
    }
  }, [isAuthenticated]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/users/stats`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setStats(response.data.data);
    } catch (err) {
      setError('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="dashboard-container">
        <div className="welcome-section">
          <h1>Welcome to API Logging System</h1>
          <p>Secure and Immutable API Usage Logging with Blockchain & IPFS</p>
          <div className="feature-grid">
            <div className="feature-card">
              <h3>🔒 Immutable Logs</h3>
              <p>Tamper-proof records on blockchain</p>
            </div>
            <div className="feature-card">
              <h3>⛓️ Blockchain</h3>
              <p>Hash storage and verification</p>
            </div>
            <div className="feature-card">
              <h3>📦 IPFS Storage</h3>
              <p>Decentralized log storage</p>
            </div>
            <div className="feature-card">
              <h3>✍️ Digital Signatures</h3>
              <p>Authenticity verification</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="dashboard-container">
      <h1>Dashboard</h1>
      
      {error && <div className="error-message">{error}</div>}

      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Requests</h3>
            <p className="stat-value">{stats.totalRequests}</p>
          </div>
          <div className="stat-card">
            <h3>Total Cost</h3>
            <p className="stat-value">${(stats.totalCost / 100).toFixed(2)}</p>
          </div>
          <div className="stat-card">
            <h3>User ID</h3>
            <p className="stat-value">{stats.userId}</p>
          </div>
          <div className="stat-card">
            <h3>Registered Since</h3>
            <p className="stat-value">
              {new Date(stats.registeredAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      )}

      <div className="dashboard-actions">
        <button className="action-btn" onClick={() => window.location.href = '/logs'}>
          View Logs
        </button>
        <button className="action-btn" onClick={() => window.location.href = '/billing'}>
          View Billing
        </button>
        <button className="action-btn" onClick={() => window.location.href = '/verification'}>
          Verify Logs
        </button>
      </div>
    </div>
  );
}

export default DashboardPage;
