/**
 * Logs Page Component
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Logs.css';

function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchLogs(currentPage);
  }, [currentPage]);

  const fetchLogs = async (page) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/logs?page=${page}&limit=10`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setLogs(response.data.data);
      setTotalPages(response.data.pagination.pages);
    } catch (err) {
      setError('Failed to load logs');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading logs...</div>;

  return (
    <div className="logs-container">
      <h1>API Logs</h1>
      
      {error && <div className="error-message">{error}</div>}

      <div className="logs-table">
        <table>
          <thead>
            <tr>
              <th>Endpoint</th>
              <th>Method</th>
              <th>Status</th>
              <th>Time</th>
              <th>IPFS Hash</th>
              <th>Verified</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log._id}>
                <td>{log.endpoint}</td>
                <td><span className={`method ${log.method}`}>{log.method}</span></td>
                <td><span className={`status status-${log.statusCode}`}>{log.statusCode}</span></td>
                <td>{new Date(log.createdAt).toLocaleString()}</td>
                <td className="ipfs-hash">{log.ipfsHash.substring(0, 16)}...</td>
                <td>{log.verified ? '✓' : '✗'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button 
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button 
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default LogsPage;
