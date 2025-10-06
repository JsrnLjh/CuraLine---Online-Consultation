import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import './Auth.css';

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState({
    password: false,
    confirm: false
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      await axios.post('/api/auth/reset-password', {
        token,
        password: formData.password
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. The link may have expired.');
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
              <h2>Password Reset Successful!</h2>
              <p>Your password has been successfully reset.</p>
              <p className="info-text">
                You can now login with your new password.
              </p>
              <p className="redirect-text">Redirecting to login...</p>
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
            <h1>Reset Password</h1>
            <p>Enter your new password below</p>
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
                <Lock size={18} />
                New Password
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword.password ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter new password"
                  minLength="6"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword({...showPassword, password: !showPassword.password})}
                >
                  {showPassword.password ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <small>Must be at least 6 characters</small>
            </div>

            <div className="form-group">
              <label>
                <Lock size={18} />
                Confirm New Password
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword.confirm ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword({...showPassword, confirm: !showPassword.confirm})}
                >
                  {showPassword.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary auth-btn" 
              disabled={loading}
            >
              <Lock size={20} />
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>

          <div className="auth-footer">
            <Link to="/login" className="back-link">
              Back to Login
            </Link>
          </div>
        </div>

        <div className="auth-info">
          <h2>Create Strong Password</h2>
          <ul>
            <li>✓ At least 6 characters long</li>
            <li>✓ Mix of letters and numbers</li>
            <li>✓ Avoid common passwords</li>
            <li>✓ Keep it secure and unique</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
