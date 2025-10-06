import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

    try {
      const response = await axios.post('/api/auth/login', formData);
      login(response.data.user);
      
      // Redirect based on role
      if (response.data.user.role === 'admin') {
        navigate('/admin');
      } else if (response.data.user.role === 'doctor') {
        navigate('/doctor/appointments');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <img src="/logo.png" alt="CuraLine" className="auth-logo" />
            <h1>Welcome Back</h1>
            <p>Sign in to your CuraLine account</p>
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
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="your.email@example.com"
              />
            </div>

            <div className="form-group">
              <label>
                <Lock size={18} />
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
              />
            </div>

            <div className="forgot-password-link">
              <Link to="/forgot-password">Forgot password?</Link>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary auth-btn" 
              disabled={loading}
            >
              <LogIn size={20} />
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="auth-footer">
            <p>Don't have an account? <Link to="/register">Sign up</Link></p>
          </div>
        </div>

        <div className="auth-info">
          <h2>Your Personalized Health Partner</h2>
          <ul>
            <li>✓ Connect with experienced doctors</li>
            <li>✓ Book consultations online</li>
            <li>✓ Secure and private</li>
            <li>✓ 24/7 support</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Login;
