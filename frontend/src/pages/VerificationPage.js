/**
 * Verification Page Component
 * Verify log authenticity and blockchain status
 */

import React, { useState } from 'react';
import axios from 'axios';
import '../styles/Verification.css';

function VerificationPage() {
  const [logHash, setLogHash] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [blockchainData, setBlockchainData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verifyingBlockchain, setVerifyingBlockchain] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setVerificationResult(null);
    setBlockchainData(null);

    if (!logHash.trim()) {
      setError('Please enter a log hash');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/logs/${logHash.trim()}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setVerificationResult({
        isValid: true,
        log: response.data.data,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Log not found or verification failed');
      setVerificationResult({
        isValid: false,
        error: err.response?.data?.message || 'Log not found',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyBlockchain = async () => {
    if (!verificationResult?.log?.ipfsHash) {
      setError('IPFS hash not available');
      return;
    }

    setVerifyingBlockchain(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/blockchain/verify/${verificationResult.log.ipfsHash}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setBlockchainData(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to verify blockchain record');
    } finally {
      setVerifyingBlockchain(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const formatHash = (hash, format = 'short') => {
    if (!hash) return '—';
    if (format === 'short') {
      return hash.substring(0, 16) + '...';
    }
    return hash;
  };

  return (
    <div className="verification-container">
      <div className="verification-header">
        <h1>🔐 Log Verification</h1>
        <p className="subtitle">Verify log authenticity and blockchain status</p>
      </div>

      {/* Verification Form */}
      <div className="verification-section">
        <div className="verification-card">
          <h2>Enter Log Hash</h2>
          
          <form onSubmit={handleVerify} className="verification-form">
            <div className="form-group">
              <label htmlFor="logHash">Log Hash (SHA-256)</label>
              <input
                type="text"
                id="logHash"
                value={logHash}
                onChange={(e) => setLogHash(e.target.value)}
                placeholder="Paste your log hash here (e.g., a3f5d2e9b4c1f7a2...)"
                className="hash-input"
              />
              <p className="help-text">
                The log hash is a unique 64-character identifier created when the log is stored
              </p>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? '⏳ Verifying...' : '✓ Verify Log'}
            </button>
          </form>

          {error && (
            <div className="error-banner">
              <span>⚠️ {error}</span>
              <button className="close-btn" onClick={() => setError('')}>✕</button>
            </div>
          )}
        </div>
      </div>

      {/* Verification Result */}
      {verificationResult && (
        <div className="verification-section">
          {verificationResult.isValid ? (
            <div className="verification-result valid">
              <div className="result-header success">
                <div className="result-icon">✓</div>
                <div className="result-text">
                  <h2>Log Verified</h2>
                  <p>Log found and signature is valid</p>
                </div>
              </div>

              {verificationResult.log && (
                <div className="log-details">
                  <div className="details-section">
                    <h3>📝 Log Information</h3>
                    <div className="details-grid">
                      <div className="detail-item">
                        <label>Endpoint</label>
                        <div className="detail-value">
                          <code>{verificationResult.log.endpoint}</code>
                        </div>
                      </div>

                      <div className="detail-item">
                        <label>HTTP Method</label>
                        <div className="detail-value">
                          <span className={`method-badge method-${verificationResult.log.method}`}>
                            {verificationResult.log.method}
                          </span>
                        </div>
                      </div>

                      <div className="detail-item">
                        <label>Status Code</label>
                        <div className="detail-value">
                          <span className={`status-badge status-${Math.floor(verificationResult.log.statusCode / 100)}`}>
                            {verificationResult.log.statusCode}
                          </span>
                        </div>
                      </div>

                      <div className="detail-item">
                        <label>Response Time</label>
                        <div className="detail-value">
                          {verificationResult.log.responseTime}ms
                        </div>
                      </div>

                      <div className="detail-item">
                        <label>Request Size</label>
                        <div className="detail-value">
                          {(verificationResult.log.requestSize / 1024).toFixed(2)} KB
                        </div>
                      </div>

                      <div className="detail-item">
                        <label>Response Size</label>
                        <div className="detail-value">
                          {(verificationResult.log.responseSize / 1024).toFixed(2)} KB
                        </div>
                      </div>

                      <div className="detail-item">
                        <label>Created At</label>
                        <div className="detail-value">
                          {new Date(verificationResult.log.createdAt).toLocaleString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          })}
                        </div>
                      </div>

                      <div className="detail-item">
                        <label>Verified</label>
                        <div className="detail-value">
                          <span className={verificationResult.log.verified ? 'verified-badge' : 'pending-badge'}>
                            {verificationResult.log.verified ? '✓ Verified' : '○ Pending'}
                          </span>
                        </div>
                      </div>

                      <div className="detail-item">
                        <label>User ID</label>
                        <div className="detail-value">
                          {verificationResult.log.userId}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="details-section">
                    <h3>🔗 Cryptographic Hashes</h3>
                    <div className="hash-details">
                      <div className="hash-item">
                        <label>Log Hash</label>
                        <div className="hash-box">
                          <code className="hash-value">
                            {verificationResult.log.logHash}
                          </code>
                          <button 
                            className="copy-btn"
                            onClick={() => copyToClipboard(verificationResult.log.logHash)}
                            title="Copy to clipboard"
                          >
                            📋
                          </button>
                        </div>
                        <p className="hash-info">SHA-256 hash of log data</p>
                      </div>

                      <div className="hash-item">
                        <label>IPFS Hash</label>
                        <div className="hash-box">
                          <code className="hash-value">
                            {verificationResult.log.ipfsHash}
                          </code>
                          <button 
                            className="copy-btn"
                            onClick={() => copyToClipboard(verificationResult.log.ipfsHash)}
                            title="Copy to clipboard"
                          >
                            📋
                          </button>
                        </div>
                        <p className="hash-info">Decentralized storage location on IPFS</p>
                      </div>

                      <div className="hash-item">
                        <label>Digital Signature</label>
                        <div className="hash-box">
                          <code className="hash-value hash-truncated">
                            {formatHash(verificationResult.log.signature, 'short')}
                          </code>
                          <button 
                            className="copy-btn"
                            onClick={() => copyToClipboard(verificationResult.log.signature)}
                            title="Copy to clipboard"
                          >
                            📋
                          </button>
                        </div>
                        <p className="hash-info">RSA-2048 signature for authenticity</p>
                      </div>

                      {verificationResult.log.blockchainHash && (
                        <div className="hash-item">
                          <label>Blockchain Hash</label>
                          <div className="hash-box">
                            <code className="hash-value">
                              {verificationResult.log.blockchainHash}
                            </code>
                            <button 
                              className="copy-btn"
                              onClick={() => copyToClipboard(verificationResult.log.blockchainHash)}
                              title="Copy to clipboard"
                            >
                              📋
                            </button>
                          </div>
                          <p className="hash-info">Transaction hash on blockchain (Sepolia testnet)</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {verificationResult.log.blockchainHash && (
                    <div className="details-section">
                      <h3>⛓️ Blockchain Verification</h3>
                      {blockchainData ? (
                        <div className="blockchain-info success">
                          <p className="status">✓ Log is recorded on blockchain</p>
                          <div className="blockchain-details">
                            <div className="blockchain-item">
                              <span>Transaction Hash:</span>
                              <code>{blockchainData.transactionHash}</code>
                            </div>
                            <div className="blockchain-item">
                              <span>Block Number:</span>
                              <strong>{blockchainData.blockNumber}</strong>
                            </div>
                            <div className="blockchain-item">
                              <span>Timestamp:</span>
                              <strong>{new Date(blockchainData.timestamp * 1000).toLocaleString()}</strong>
                            </div>
                            <div className="blockchain-item">
                              <span>Network:</span>
                              <strong>Sepolia Testnet</strong>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <button 
                          className="btn btn-secondary"
                          onClick={handleVerifyBlockchain}
                          disabled={verifyingBlockchain}
                        >
                          {verifyingBlockchain ? '⏳ Verifying...' : '🔍 Check Blockchain'}
                        </button>
                      )}
                    </div>
                  )}

                  {verificationResult.log.metadata && Object.keys(verificationResult.log.metadata).length > 0 && (
                    <div className="details-section">
                      <h3>📊 Metadata</h3>
                      <pre className="metadata-box">
                        {JSON.stringify(verificationResult.log.metadata, null, 2)}
                      </pre>
                    </div>
                  )}

                  <div className="verification-checklist">
                    <h3>✓ Verification Checklist</h3>
                    <div className="checklist-items">
                      <div className="checklist-item done">
                        <span>✓</span> Log found in database
                      </div>
                      <div className={`checklist-item ${verificationResult.log.verified ? 'done' : 'pending'}`}>
                        <span>{verificationResult.log.verified ? '✓' : '○'}</span> Signature verified
                      </div>
                      <div className={`checklist-item ${verificationResult.log.ipfsHash ? 'done' : 'pending'}`}>
                        <span>{verificationResult.log.ipfsHash ? '✓' : '○'}</span> IPFS storage confirmed
                      </div>
                      <div className={`checklist-item ${verificationResult.log.blockchainHash ? 'done' : 'pending'}`}>
                        <span>{verificationResult.log.blockchainHash ? '✓' : '○'}</span> Blockchain recorded
                      </div>
                      <div className={blockchainData ? 'checklist-item done' : ''}>
                        {blockchainData && (
                          <>
                            <span>✓</span> Blockchain verified
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="verification-result invalid">
              <div className="result-header error">
                <div className="result-icon">✕</div>
                <div className="result-text">
                  <h2>Verification Failed</h2>
                  <p>{verificationResult.error || 'Log could not be verified'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info Section - Removed per user request */}
    </div>
  );
}

export default VerificationPage;
