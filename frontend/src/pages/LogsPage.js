/**
 * Logs Page Component
 * View, create, and manage API logs
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Logs.css';

function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);

  // Form state for creating new log
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    endpoint: '',
    method: 'GET',
    statusCode: 200,
    requestSize: 0,
    responseSize: 0,
    responseTime: 0,
    metadata: {},
  });
  const [formError, setFormError] = useState('');
  const [creating, setCreating] = useState(false);

  // Filter state
  const [filterEndpoint, setFilterEndpoint] = useState('');
  const [filterMethod, setFilterMethod] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    fetchLogs(1);
  }, [filterEndpoint, filterMethod, filterStatus]);

  const fetchLogs = async (page = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      let url = `${process.env.REACT_APP_BACKEND_URL}/api/logs?page=${page}&limit=10`;
      if (filterEndpoint) url += `&endpoint=${encodeURIComponent(filterEndpoint)}`;
      if (filterMethod && filterMethod !== '') url += `&method=${filterMethod}`;
      if (filterStatus && filterStatus !== '') url += `&statusCode=${filterStatus}`;

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setLogs(response.data.data || []);
      setTotalPages(response.data.pagination.pages || 1);
      setTotalLogs(response.data.pagination.total || 0);
      setCurrentPage(page);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load logs');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLog = async (e) => {
    e.preventDefault();
    setFormError('');
    setCreating(true);

    // Validation
    if (!formData.endpoint.trim()) {
      setFormError('Endpoint is required');
      setCreating(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/logs/create`,
        {
          endpoint: formData.endpoint,
          method: formData.method,
          statusCode: parseInt(formData.statusCode),
          requestSize: parseInt(formData.requestSize) || 0,
          responseSize: parseInt(formData.responseSize) || 0,
          responseTime: parseInt(formData.responseTime) || 0,
          metadata: formData.metadata,
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const logHash = response.data.data.logHash;
      setSuccess('Log created successfully! Verifying...');
      
      // Reset form
      setFormData({
        endpoint: '',
        method: 'GET',
        statusCode: 200,
        requestSize: 0,
        responseSize: 0,
        responseTime: 0,
        metadata: {},
      });
      setShowCreateForm(false);

      // Refresh logs immediately to show pending
      fetchLogs(1);

      // Auto-verify after 5 seconds
      setTimeout(async () => {
        try {
          console.log('Attempting to verify log:', logHash);
          const verifyResponse = await axios.post(
            `${process.env.REACT_APP_BACKEND_URL}/api/logs/${logHash}/verify`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          console.log('Verification successful:', verifyResponse.data);
          setSuccess('Log verified successfully! ✓');
          
          // Refresh logs to show verified status
          setTimeout(() => {
            fetchLogs(1);
            setTimeout(() => {
              setSuccess('');
            }, 2000);
          }, 500);
        } catch (verifyError) {
          console.error('Auto-verification failed:', verifyError.response?.data || verifyError.message);
          // Refresh anyway to show current status
          setTimeout(() => {
            fetchLogs(1);
            setSuccess('');
          }, 500);
        }
      }, 5000);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create log');
    } finally {
      setCreating(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMetadataChange = (e) => {
    try {
      const metadata = JSON.parse(e.target.value);
      setFormData(prev => ({
        ...prev,
        metadata
      }));
    } catch {
      // Invalid JSON, ignore
    }
  };

  const getMethodColor = (method) => {
    const colors = {
      'GET': '#3498db',
      'POST': '#2ecc71',
      'PUT': '#f39c12',
      'DELETE': '#e74c3c',
      'PATCH': '#9b59b6',
    };
    return colors[method] || '#95a5a6';
  };

  const getStatusColor = (statusCode) => {
    if (statusCode >= 200 && statusCode < 300) return '#27ae60'; // Success
    if (statusCode >= 300 && statusCode < 400) return '#3498db'; // Redirect
    if (statusCode >= 400 && statusCode < 500) return '#f39c12'; // Client error
    if (statusCode >= 500) return '#e74c3c'; // Server error
    return '#95a5a6';
  };

  if (loading && logs.length === 0) {
    return (
      <div className="logs-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="logs-container">
      <div className="logs-header">
        <div>
          <h1>API Logs</h1>
          <p className="subtitle">Total: {totalLogs} logs</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? '✕ Cancel' : '➕ Create Log'}
        </button>
      </div>

      {error && (
        <div className="error-banner">
          <span>⚠️ {error}</span>
          <button onClick={() => setError('')}>✕</button>
        </div>
      )}

      {success && (
        <div className="success-banner">
          <span>✓ {success}</span>
        </div>
      )}

      {/* Create Log Form */}
      {showCreateForm && (
        <div className="create-log-form">
          <h2>Create New Log</h2>
          <form onSubmit={handleCreateLog}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="endpoint">Endpoint *</label>
                <input
                  type="text"
                  id="endpoint"
                  name="endpoint"
                  placeholder="e.g., /api/users"
                  value={formData.endpoint}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="method">HTTP Method</label>
                <select
                  id="method"
                  name="method"
                  value={formData.method}
                  onChange={handleFormChange}
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                  <option value="PATCH">PATCH</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="statusCode">Status Code</label>
                <select
                  id="statusCode"
                  name="statusCode"
                  value={formData.statusCode}
                  onChange={handleFormChange}
                >
                  <optgroup label="2xx Success">
                    <option value="200">200 - OK</option>
                    <option value="201">201 - Created</option>
                    <option value="202">202 - Accepted</option>
                    <option value="204">204 - No Content</option>
                  </optgroup>
                  <optgroup label="3xx Redirect">
                    <option value="301">301 - Moved Permanently</option>
                    <option value="302">302 - Found</option>
                    <option value="304">304 - Not Modified</option>
                  </optgroup>
                  <optgroup label="4xx Client Error">
                    <option value="400">400 - Bad Request</option>
                    <option value="401">401 - Unauthorized</option>
                    <option value="403">403 - Forbidden</option>
                    <option value="404">404 - Not Found</option>
                    <option value="422">422 - Validation Error</option>
                    <option value="429">429 - Too Many Requests</option>
                  </optgroup>
                  <optgroup label="5xx Server Error">
                    <option value="500">500 - Internal Server Error</option>
                    <option value="502">502 - Bad Gateway</option>
                    <option value="503">503 - Service Unavailable</option>
                  </optgroup>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="requestSize">Request Size (bytes)</label>
                <input
                  type="number"
                  id="requestSize"
                  name="requestSize"
                  min="0"
                  value={formData.requestSize}
                  onChange={handleFormChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="responseSize">Response Size (bytes)</label>
                <input
                  type="number"
                  id="responseSize"
                  name="responseSize"
                  min="0"
                  value={formData.responseSize}
                  onChange={handleFormChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="responseTime">Response Time (ms)</label>
                <input
                  type="number"
                  id="responseTime"
                  name="responseTime"
                  min="0"
                  value={formData.responseTime}
                  onChange={handleFormChange}
                />
              </div>
            </div>

            <div className="form-group full-width">
              <label htmlFor="metadata">Metadata (JSON, optional)</label>
              <textarea
                id="metadata"
                placeholder='{"userId": "user123", "action": "fetch"}'
                onChange={handleMetadataChange}
                rows="3"
              />
            </div>

            {formError && <div className="form-error">{formError}</div>}

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={creating}
            >
              {creating ? 'Creating...' : '✓ Create Log'}
            </button>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Filter by endpoint..."
            value={filterEndpoint}
            onChange={(e) => {
              setFilterEndpoint(e.target.value);
              setCurrentPage(1);
            }}
            className="filter-input"
          />
          <select
            value={filterMethod}
            onChange={(e) => {
              setFilterMethod(e.target.value);
              setCurrentPage(1);
            }}
            className="filter-select"
          >
            <option value="">All Methods</option>
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
            <option value="PATCH">PATCH</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="filter-select"
          >
            <option value="">All Status Codes</option>
            <option value="2">2xx Success</option>
            <option value="3">3xx Redirect</option>
            <option value="4">4xx Client Error</option>
            <option value="5">5xx Server Error</option>
          </select>
          <button 
            className="btn btn-secondary"
            onClick={() => {
              setFilterEndpoint('');
              setFilterMethod('');
              setFilterStatus('');
              fetchLogs(1);
            }}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Logs Table */}
      {logs.length > 0 ? (
        <div className="logs-table-wrapper">
          <table className="logs-table">
            <thead>
              <tr>
                <th>Endpoint</th>
                <th>Method</th>
                <th>Status</th>
                <th>Time</th>
                <th>Response</th>
                <th>Hash (Blockchain)</th>
                <th>Verified</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log._id} className="log-row">
                  <td className="endpoint-cell">
                    <code>{log.endpoint}</code>
                  </td>
                  <td>
                    <span 
                      className="method-badge"
                      style={{ backgroundColor: getMethodColor(log.method) }}
                    >
                      {log.method}
                    </span>
                  </td>
                  <td>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(log.statusCode) }}
                    >
                      {log.statusCode}
                    </span>
                  </td>
                  <td className="time-cell">
                    <span className="time-badge">{log.responseTime}ms</span>
                  </td>
                  <td className="size-cell">
                    {(log.responseSize / 1024).toFixed(2)} KB
                  </td>
                  <td className="hash-cell">
                    <code title={log.blockchainHash || log.logHash}>
                      {log.blockchainHash 
                        ? log.blockchainHash.substring(0, 8) + '...' + log.blockchainHash.substring(log.blockchainHash.length - 6)
                        : log.logHash.substring(0, 8) + '...' + log.logHash.substring(log.logHash.length - 6)
                      }
                    </code>
                    <button 
                      className="copy-btn"
                      onClick={() => {
                        const hash = log.blockchainHash || log.logHash;
                        navigator.clipboard.writeText(hash);
                        alert('Hash copied to clipboard!');
                      }}
                      title="Copy to clipboard"
                    >
                      📋
                    </button>
                  </td>
                  <td className="verified-cell">
                    <span className={log.verified ? 'verified' : 'pending'}>
                      {log.verified ? '✓ Verified' : '○ Pending'}
                    </span>
                  </td>
                  <td className="date-cell">
                    {new Date(log.createdAt).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <p>📝 No logs found. {!showCreateForm && 'Create your first log to get started!'}</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => fetchLogs(1)}
            disabled={currentPage === 1}
            className="btn btn-sm"
          >
            ⟨⟨ First
          </button>
          <button 
            onClick={() => fetchLogs(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="btn btn-sm"
          >
            ⟨ Previous
          </button>
          
          <div className="page-info">
            Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
          </div>
          
          <button 
            onClick={() => fetchLogs(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="btn btn-sm"
          >
            Next ⟩
          </button>
          <button 
            onClick={() => fetchLogs(totalPages)}
            disabled={currentPage === totalPages}
            className="btn btn-sm"
          >
            Last ⟩⟩
          </button>
        </div>
      )}
    </div>
  );
}

export default LogsPage;
