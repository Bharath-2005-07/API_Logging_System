/**
 * Verification Page Component
 */

import React, { useState } from 'react';
import axios from 'axios';
import '../styles/Verification.css';

function VerificationPage() {
  const [logHash, setLogHash] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setVerificationResult(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/logs/${logHash}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setVerificationResult({
        isValid: true,
        log: response.data.data,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
      setVerificationResult({
        isValid: false,
        error: err.response?.data?.message || 'Log not found',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verification-container">
      <h1>Log Verification</h1>

      <form onSubmit={handleVerify} className="verification-form">
        <div className="form-group">
          <label htmlFor="logHash">Log Hash</label>
          <input
            type="text"
            id="logHash"
            value={logHash}
            onChange={(e) => setLogHash(e.target.value)}
            placeholder="Enter log hash to verify"
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Verifying...' : 'Verify Log'}
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}

      {verificationResult && (
        <div className={`verification-result ${verificationResult.isValid ? 'valid' : 'invalid'}`}>
          <h2>{verificationResult.isValid ? '✓ Log Verified' : '✗ Verification Failed'}</h2>
          
          {verificationResult.isValid && verificationResult.log && (
            <div className="log-details">
              <div className="detail">
                <span>Endpoint:</span>
                <strong>{verificationResult.log.endpoint}</strong>
              </div>
              <div className="detail">
                <span>Status Code:</span>
                <strong>{verificationResult.log.statusCode}</strong>
              </div>
              <div className="detail">
                <span>Timestamp:</span>
                <strong>{new Date(verificationResult.log.createdAt).toLocaleString()}</strong>
              </div>
              <div className="detail">
                <span>IPFS Hash:</span>
                <strong className="hash">{verificationResult.log.ipfsHash}</strong>
              </div>
              <div className="detail">
                <span>Blockchain Hash:</span>
                <strong className="hash">{verificationResult.log.blockchainHash}</strong>
              </div>
              <div className="detail">
                <span>Verified:</span>
                <strong>{verificationResult.log.verified ? 'Yes' : 'No'}</strong>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default VerificationPage;
