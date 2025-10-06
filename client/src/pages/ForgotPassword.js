import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import './Auth.css';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post('/api/auth/forgot-password', { email });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email. Please try again.');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-card">
            <div className="success-message-page">
              <CheckCircle size={64} color="#10b981" />
              <h2>Check Your Email</h2>
              <p>We've sent password reset instructions to:</p>
              <p className="email-highlight">{email}</p>
              <p className="info-text">
                Please check your inbox and follow the instructions to reset your password.
                The link will expire in 1 hour.
              </p>
              <Link to="/login" className="btn btn-primary">
                <ArrowLeft size={20} />
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <img src="/logo.png" alt="CuraLine" className="auth-logo" />
            <h1>Forgot Password?</h1>
            <p>Enter your email and we'll send you instructions to reset your password</p>
          </div>

          {error && (
            <div className="error-message">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>
                <Mail size={18} />
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your.email@example.com"
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary auth-btn" 
              disabled={loading}
            >
              <Mail size={20} />
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <div className="auth-footer">
            <Link to="/login" className="back-link">
              <ArrowLeft size={16} />
              Back to Login
            </Link>
          </div>
        </div>

        <div className="auth-info">
          <h2>Password Reset</h2>
          <ul>
            <li>✓ Secure password reset process</li>
            <li>✓ Email verification required</li>
            <li>✓ Link expires in 1 hour</li>
            <li>✓ Your data stays protected</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
