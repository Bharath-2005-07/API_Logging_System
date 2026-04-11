/**
 * Dashboard Page Component
 * Shows user statistics, recent logs, and quick actions
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';

function DashboardPage({ isAuthenticated }) {
  const navigate = useNavigate();
  const [userStats, setUserStats] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch user stats
      const statsResponse = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/users/stats`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Fetch user profile
      const profileResponse = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/users/profile`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Fetch recent logs
      const logsResponse = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/logs?page=1&limit=5`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUserStats(statsResponse.data.data);
      setUserProfile(profileResponse.data.data);
      setRecentLogs(logsResponse.data.data || []);
      setError('');
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  // Not authenticated view
  if (!isAuthenticated) {
    return (
      <div className="dashboard-container">
        <div className="welcome-section">
          <div className="welcome-content">
            <h1>Welcome to API Logging System</h1>
            <p className="subtitle">
              ✓ Secure | ✓ Immutable | ✓ Decentralized | ✓ Verified
            </p>
            <p className="description">
              Enterprise-grade API usage logging with blockchain verification, 
              IPFS storage, and digital signatures for complete transparency.
            </p>
          </div>

          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Immutable Logs</h3>
              <p>Tamper-proof records stored on blockchain</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⛓️</div>
              <h3>Blockchain</h3>
              <p>Hash storage and permanent verification</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📦</div>
              <h3>IPFS Storage</h3>
              <p>Decentralized and distributed storage</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">✍️</div>
              <h3>Digital Signatures</h3>
              <p>RSA-2048 authenticity verification</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Analytics</h3>
              <p>Real-time usage statistics and billing</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔐</div>
              <h3>Security</h3>
              <p>JWT authentication and rate limiting</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !userStats) {
    return (
      <div className="dashboard-container">
        <div className="error-container">
          <div className="error-box">
            <h2>⚠️ Error Loading Dashboard</h2>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={handleRefresh}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main dashboard view
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p className="subtitle">
            Welcome back, <strong>{userProfile?.name || 'User'}</strong>
          </p>
        </div>
        <button 
          className="btn btn-refresh" 
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? '↻ Refreshing...' : '↻ Refresh'}
        </button>
      </div>

      {error && (
        <div className="warning-banner">
          <span>⚠️ {error}</span>
        </div>
      )}

      {/* Statistics Cards */}
      {userStats && (
        <div className="stats-section">
          <div className="stats-grid">
            <div className="stat-card card-requests">
              <div className="stat-icon">📝</div>
              <div className="stat-content">
                <h3>Total Requests</h3>
                <p className="stat-value">{userStats.totalRequests}</p>
                <p className="stat-label">API calls</p>
              </div>
            </div>

            <div className="stat-card card-cost">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <h3>Total Cost</h3>
                <p className="stat-value">
                  ${(userStats.totalCost / 100).toFixed(2)}
                </p>
                <p className="stat-label">USD</p>
              </div>
            </div>

            <div className="stat-card card-user">
              <div className="stat-icon">👤</div>
              <div className="stat-content">
                <h3>User ID</h3>
                <p className="stat-value">{userProfile?.userId}</p>
                <p className="stat-label">Account</p>
              </div>
            </div>

            <div className="stat-card card-registered">
              <div className="stat-icon">📅</div>
              <div className="stat-content">
                <h3>Member Since</h3>
                <p className="stat-value">
                  {new Date(userStats.registeredAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
                <p className="stat-label">Account created</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Logs Section */}
      <div className="recent-logs-section">
        <div className="section-header">
          <h2>Recent Logs</h2>
          <button 
            className="btn btn-link" 
            onClick={() => navigate('/logs')}
          >
            View All →
          </button>
        </div>

        {recentLogs.length > 0 ? (
          <div className="logs-preview">
            <table className="logs-table">
              <thead>
                <tr>
                  <th>Endpoint</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Time</th>
                  <th>IPFS</th>
                </tr>
              </thead>
              <tbody>
                {recentLogs.map((log) => (
                  <tr key={log._id} className="log-row">
                    <td className="endpoint">{log.endpoint}</td>
                    <td>
                      <span className={`method-badge method-${log.method}`}>
                        {log.method}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge status-${Math.floor(log.statusCode / 100)}`}>
                        {log.statusCode}
                      </span>
                    </td>
                    <td className="timestamp">
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </td>
                    <td className="status-check">
                      {log.verified ? '✓ Verified' : '○ Pending'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <p>📝 No logs yet. Create your first log to get started!</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="actions-section">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <button 
            className="action-card"
            onClick={() => navigate('/logs')}
          >
            <div className="action-icon">📊</div>
            <h3>View Logs</h3>
            <p>See all your API logs</p>
          </button>

          <button 
            className="action-card"
            onClick={() => navigate('/logs')}
          >
            <div className="action-icon">➕</div>
            <h3>Create Log</h3>
            <p>Record a new API call</p>
          </button>

          <button 
            className="action-card"
            onClick={() => navigate('/billing')}
          >
            <div className="action-icon">💳</div>
            <h3>View Billing</h3>
            <p>Check your usage and costs</p>
          </button>

          <button 
            className="action-card"
            onClick={() => navigate('/verification')}
          >
            <div className="action-icon">✓</div>
            <h3>Verify Logs</h3>
            <p>Verify log authenticity</p>
          </button>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
