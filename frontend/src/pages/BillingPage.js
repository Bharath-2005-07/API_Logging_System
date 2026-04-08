/**
 * Billing Page Component
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Billing.css';

function BillingPage() {
  const [billingHistory, setBillingHistory] = useState([]);
  const [currentBilling, setCurrentBilling] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const historyResponse = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/billing/history`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      const currentResponse = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/billing/current`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setBillingHistory(historyResponse.data.data);
      setCurrentBilling(currentResponse.data.data);
    } catch (err) {
      setError('Failed to load billing data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading billing data...</div>;

  return (
    <div className="billing-container">
      <h1>Billing</h1>

      {error && <div className="error-message">{error}</div>}

      {currentBilling && (
        <div className="current-billing-section">
          <h2>Current Period</h2>
          <div className="billing-card">
            <div className="billing-detail">
              <span>Requests:</span>
              <strong>{currentBilling.requestCount}</strong>
            </div>
            <div className="billing-detail">
              <span>Total Cost:</span>
              <strong>${(currentBilling.totalCost / 100).toFixed(2)}</strong>
            </div>
            <div className="billing-detail">
              <span>Status:</span>
              <strong className={`status-${currentBilling.status}`}>
                {currentBilling.status.toUpperCase()}
              </strong>
            </div>
          </div>
        </div>
      )}

      <div className="billing-history-section">
        <h2>Billing History</h2>
        <div className="billing-table">
          <table>
            <thead>
              <tr>
                <th>Period</th>
                <th>Requests</th>
                <th>Total Cost</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {billingHistory.map(record => (
                <tr key={record._id}>
                  <td>
                    {new Date(record.period.startDate).toLocaleDateString()} - 
                    {new Date(record.period.endDate).toLocaleDateString()}
                  </td>
                  <td>{record.requestCount}</td>
                  <td>${(record.totalCost / 100).toFixed(2)}</td>
                  <td className={`status-${record.status}`}>{record.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default BillingPage;
