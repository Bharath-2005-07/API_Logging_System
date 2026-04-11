/**
 * Billing Page Component
 * View billing information, costs, and payment history
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Billing.css';

function BillingPage() {
  const [billingHistory, setBillingHistory] = useState([]);
  const [currentBilling, setCurrentBilling] = useState(null);
  const [monthlyStats, setMonthlyStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      console.log('[BILLING PAGE] Fetching billing data...');
      
      // Fetch current month billing
      const currentResponse = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/billing/current-month`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      console.log('[BILLING PAGE] Current billing response:', currentResponse.data);
      
      // Fetch billing history
      const historyResponse = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/billing/history?page=1&limit=12`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      console.log('[BILLING PAGE] History response:', historyResponse.data);

      setCurrentBilling(currentResponse.data.data);
      setBillingHistory(historyResponse.data.data || []);
      
      // Calculate monthly stats
      if (historyResponse.data.data && historyResponse.data.data.length > 0) {
        const total = historyResponse.data.data.reduce((sum, record) => {
          return sum + (record.totalCost || 0);
        }, 0);
        
        const totalRequests = historyResponse.data.data.reduce((sum, record) => {
          return sum + (record.requestCount || 0);
        }, 0);

        setMonthlyStats({
          totalCost: total,
          totalRequests: totalRequests,
          averageCost: total / historyResponse.data.data.length,
          recordCount: historyResponse.data.data.length
        });
      }
      
      setError('');
    } catch (err) {
      console.error('[BILLING PAGE] Error fetching billing:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to load billing data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': '#f39c12',
      'paid': '#27ae60',
      'overdue': '#e74c3c',
      'failed': '#c0392b'
    };
    return colors[status?.toLowerCase()] || '#95a5a6';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'pending': '⏳ Pending',
      'paid': '✓ Paid',
      'overdue': '⚠️ Overdue',
      'failed': '✕ Failed'
    };
    return labels[status?.toLowerCase()] || status;
  };

  const handlePayNow = () => {
    setShowPaymentModal(true);
    setPaymentAmount('');
    setPaymentError('');
  };

  const handlePayment = async () => {
    const amount = parseFloat(paymentAmount);
    const totalCost = (currentBilling?.totalCost || 0) / 100;

    if (!paymentAmount || isNaN(amount) || amount <= 0) {
      setPaymentError('Please enter a valid payment amount');
      return;
    }

    setIsProcessing(true);
    setPaymentError('');
    setPaymentSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/billing/payment`,
        {
          billingId: currentBilling._id,
          amountPaid: amount
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const result = response.data.data;
      
      if (result.refundAmount > 0) {
        setPaymentSuccess(`✓ Payment successful! Refund: $${result.refundAmount.toFixed(2)}`);
      } else {
        setPaymentSuccess(`✓ Payment successful! Remaining: $${result.remaining.toFixed(2)}`);
      }

      setTimeout(() => {
        setShowPaymentModal(false);
        fetchBillingData();
      }, 2000);
    } catch (err) {
      setPaymentError(err.response?.data?.message || 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="billing-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading billing information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="billing-container">
      <div className="billing-header">
        <div>
          <h1>💳 Billing & Costs</h1>
          <p className="subtitle">Track your API usage and costs</p>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <span>⚠️ {error}</span>
          <button onClick={() => setError('')}>✕</button>
        </div>
      )}

      {/* Current Period Summary */}
      {currentBilling && (
        <div className="current-billing-section">
          <h2>Current Period (This Month)</h2>
          <div className="billing-summary">
            <div className="summary-card primary">
              <div className="card-icon">📊</div>
              <div className="card-content">
                <label>Total Requests</label>
                <p className="card-value">{currentBilling.requestCount || 0}</p>
                <p className="card-label">API calls</p>
              </div>
            </div>

            <div className="summary-card accent">
              <div className="card-icon">💰</div>
              <div className="card-content">
                <label>Total Cost</label>
                <p className="card-value">
                  ${((currentBilling.totalCost || 0) / 100).toFixed(2)}
                </p>
                <p className="card-label">USD</p>
              </div>
            </div>

            <div className="summary-card">
              <div className="card-icon">📅</div>
              <div className="card-content">
                <label>Billing Period</label>
                <p className="card-value">
                  {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
                <p className="card-label">Current month</p>
              </div>
            </div>

            <div className="summary-card">
              <div className="card-icon" style={{ color: getStatusColor(currentBilling.status) }}>
                {currentBilling.status === 'paid' ? '✓' : currentBilling.status === 'pending' ? '⏳' : '⚠️'}
              </div>
              <div className="card-content">
                <label>Payment Status</label>
                <p className="card-value" style={{ color: getStatusColor(currentBilling.status) }}>
                  {getStatusLabel(currentBilling.status)}
                </p>
                <p className="card-label">Current status</p>
              </div>
            </div>
          </div>

          {currentBilling.status === 'pending' && (
            <div className="action-banner">
              <p>💡 Payment for this period is pending. Make sure to review and settle any outstanding balance.</p>
              <button className="btn btn-primary" onClick={handlePayNow}>
                Pay Now
              </button>
            </div>
          )}
          
          {currentBilling.status === 'paid' && (
            <div className="action-banner success">
              <p>✓ Payment completed for this period. Thank you!</p>
            </div>
          )}
        </div>
      )}

      {/* Overall Statistics */}
      {monthlyStats && monthlyStats.recordCount > 1 && (
        <div className="statistics-section">
          <h2>Billing Statistics</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <label>Total Cost (All Time)</label>
              <p className="stat-value">
                ${(monthlyStats.totalCost / 100).toFixed(2)}
              </p>
              <p className="stat-label">Last {monthlyStats.recordCount} months</p>
            </div>

            <div className="stat-item">
              <label>Average Monthly Cost</label>
              <p className="stat-value">
                ${(monthlyStats.averageCost / 100).toFixed(2)}
              </p>
              <p className="stat-label">Per month</p>
            </div>

            <div className="stat-item">
              <label>Total Requests</label>
              <p className="stat-value">
                {monthlyStats.totalRequests.toLocaleString()}
              </p>
              <p className="stat-label">All requests</p>
            </div>

            <div className="stat-item">
              <label>Cost Per Request</label>
              <p className="stat-value">
                ${(monthlyStats.totalCost / (monthlyStats.totalRequests || 1) / 100).toFixed(4)}
              </p>
              <p className="stat-label">Average</p>
            </div>
          </div>
        </div>
      )}

      {/* Billing History Table */}
      <div className="billing-history-section">
        <div className="section-header">
          <h2>Billing History</h2>
          <button 
            className="btn btn-secondary"
            onClick={() => fetchBillingData()}
          >
            ↻ Refresh
          </button>
        </div>

        {billingHistory.length > 0 ? (
          <div className="billing-table-wrapper">
            <table className="billing-table">
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Requests</th>
                  <th>Total Cost</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {billingHistory.map((record) => (
                  <tr key={record._id} className="billing-row">
                    <td className="period-cell">
                      {new Date(record.period?.startDate || record.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="date-cell">
                      {new Date(record.period?.startDate || record.createdAt).toLocaleDateString('en-US', {
                        month: 'numeric',
                        day: 'numeric',
                        year: '2-digit'
                      })}
                    </td>
                    <td className="date-cell">
                      {new Date(record.period?.endDate || record.createdAt).toLocaleDateString('en-US', {
                        month: 'numeric',
                        day: 'numeric',
                        year: '2-digit'
                      })}
                    </td>
                    <td className="request-cell">
                      {record.requestCount || 0}
                    </td>
                    <td className="cost-cell">
                      <span className="cost-amount">
                        ${((record.totalCost || 0) / 100).toFixed(2)}
                      </span>
                    </td>
                    <td className="status-cell">
                      <span 
                        className="status-badge"
                        style={{ 
                          backgroundColor: getStatusColor(record.paymentStatus || record.status)
                        }}
                      >
                        {getStatusLabel(record.paymentStatus || record.status)}
                      </span>
                    </td>
                    <td className="action-cell">
                      <button className="action-link" title="View details">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <p>📝 No billing history available.</p>
          </div>
        )}
      </div>

      {/* Pricing Information */}
      <div className="pricing-section">
        <h2>📋 Pricing Information</h2>
        <div className="pricing-cards">
          <div className="pricing-card">
            <h3>Base Request Cost</h3>
            <p className="price">$2.00</p>
            <p className="description">Per API request (GET, PUT, DELETE, etc.)</p>
          </div>

          <div className="pricing-card">
            <h3>POST Request Cost</h3>
            <p className="price">+$5.00</p>
            <p className="description">Additional charge for POST requests</p>
          </div>

          <div className="pricing-card">
            <h3>Total POST Cost</h3>
            <p className="price">$7.00</p>
            <p className="description">$2 base + $5 for POST method</p>
          </div>

          <div className="pricing-card">
            <h3>Blockchain Recording</h3>
            <p className="price">Included</p>
            <p className="description">All logs automatically recorded</p>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="payment-section">
        <h2>💳 Payment Methods</h2>
        <div className="payment-info">
          <p>We currently accept the following payment methods:</p>
          <ul className="payment-methods">
            <li>🏦 Bank Transfer</li>
            <li>💳 Credit/Debit Card</li>
            <li>🪙 Cryptocurrency (ETH, USDC)</li>
            <li>💰 Wire Transfer</li>
          </ul>
          <button className="btn btn-primary">
            Add Payment Method
          </button>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="modal-overlay" onClick={() => !isProcessing && setShowPaymentModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>💳 Make Payment</h2>
              <button 
                className="modal-close" 
                onClick={() => !isProcessing && setShowPaymentModal(false)}
                disabled={isProcessing}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="payment-info-box">
                <p><strong>Amount Due:</strong> ${((currentBilling?.totalCost || 0) / 100).toFixed(2)}</p>
              </div>

              <div className="form-group">
                <label htmlFor="paymentAmount">Enter Payment Amount</label>
                <div className="input-with-currency">
                  <span className="currency">$</span>
                  <input
                    type="number"
                    id="paymentAmount"
                    placeholder="0.00"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    disabled={isProcessing}
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>

              {paymentError && (
                <div className="error-message">
                  ✕ {paymentError}
                </div>
              )}

              {paymentSuccess && (
                <div className="success-message">
                  {paymentSuccess}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowPaymentModal(false)}
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handlePayment}
                disabled={isProcessing || !paymentAmount}
              >
                {isProcessing ? 'Processing...' : 'Pay'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BillingPage;
