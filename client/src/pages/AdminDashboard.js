import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Calendar as CalendarIcon, 
  Users, 
  Activity, 
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  BarChart3,
  Settings
} from 'lucide-react';
import './AdminDashboard.css';
import CalendarView from '../components/CalendarView';

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('overview'); // 'overview' or 'calendar'

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/analytics/stats');
      setStats(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load statistics');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <div className="error">Failed to load dashboard data</div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Monitor and manage your healthcare platform</p>
          </div>
          <div className="header-actions">
            <Link to="/admin/analytics" className="btn btn-primary">
              <BarChart3 size={20} />
              Analytics & Reports
            </Link>
            <Link to="/admin/management" className="btn btn-secondary">
              <Settings size={20} />
              Manage Users & Doctors
            </Link>
            <div className="view-toggle">
              <button 
                className={`toggle-btn ${activeView === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveView('overview')}
              >
                <BarChart3 size={20} />
                Overview
              </button>
              <button 
                className={`toggle-btn ${activeView === 'calendar' ? 'active' : ''}`}
                onClick={() => setActiveView('calendar')}
              >
                <CalendarIcon size={20} />
                Calendar
              </button>
            </div>
          </div>
        </div>

        {activeView === 'overview' ? (
          <>
            {/* Key Metrics */}
            <div className="metrics-grid">
              <div className="metric-card card">
                <div className="metric-icon" style={{ background: '#dbeafe' }}>
                  <Activity size={28} color="#2563eb" />
                </div>
                <div className="metric-content">
                  <h3>Total Consultations</h3>
                  <p className="metric-value">{stats.consultations.total}</p>
                  <span className="metric-label">All time</span>
                </div>
              </div>

              <div className="metric-card card">
                <div className="metric-icon" style={{ background: '#dcfce7' }}>
                  <Users size={28} color="#16a34a" />
                </div>
                <div className="metric-content">
                  <h3>Total Patients</h3>
                  <p className="metric-value">{stats.patients.total}</p>
                  <span className="metric-label">{stats.patients.weekly} this week</span>
                </div>
              </div>

              <div className="metric-card card">
                <div className="metric-icon" style={{ background: '#fef3c7' }}>
                  <TrendingUp size={28} color="#ca8a04" />
                </div>
                <div className="metric-content">
                  <h3>Active Doctors</h3>
                  <p className="metric-value">{stats.doctors.total}</p>
                  <span className="metric-label">Available now</span>
                </div>
              </div>

              <div className="metric-card card">
                <div className="metric-icon" style={{ background: '#e0e7ff' }}>
                  <Clock size={28} color="#6366f1" />
                </div>
                <div className="metric-content">
                  <h3>Scheduled</h3>
                  <p className="metric-value">{stats.status.scheduled}</p>
                  <span className="metric-label">Upcoming appointments</span>
                </div>
              </div>
            </div>

            {/* Consultations by Status */}
            <div className="section-grid">
              <div className="card">
                <h2>Consultations Overview</h2>
                <div className="period-stats">
                  <div className="period-item">
                    <div className="period-label">Total</div>
                    <div className="period-value">{stats.consultations.total}</div>
                  </div>
                  <div className="period-item">
                    <div className="period-label">Today</div>
                    <div className="period-value">{stats.consultations.today}</div>
                  </div>
                  <div className="period-item">
                    <div className="period-label">Scheduled</div>
                    <div className="period-value">{stats.consultations.scheduled}</div>
                  </div>
                  <div className="period-item">
                    <div className="period-label">Completed</div>
                    <div className="period-value">{stats.consultations.completed}</div>
                  </div>
                </div>
              </div>

              <div className="card">
                <h2>Status Overview</h2>
                <div className="status-list">
                  <div className="status-item">
                    <div className="status-info">
                      <CheckCircle size={20} color="#16a34a" />
                      <span>Completed</span>
                    </div>
                    <span className="status-count">{stats.status.completed}</span>
                  </div>
                  <div className="status-item">
                    <div className="status-info">
                      <Clock size={20} color="#2563eb" />
                      <span>Scheduled</span>
                    </div>
                    <span className="status-count">{stats.status.scheduled}</span>
                  </div>
                  <div className="status-item">
                    <div className="status-info">
                      <XCircle size={20} color="#dc2626" />
                      <span>Cancelled</span>
                    </div>
                    <span className="status-count">{stats.status.cancelled}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Patient Statistics */}
            <div className="section-grid">
              <div className="card">
                <h2>Patient Statistics</h2>
                <div className="chart-list">
                  <div className="chart-item">
                    <div className="chart-label">Total Patients</div>
                    <div className="chart-bar-container">
                      <div 
                        className="chart-bar" 
                        style={{ width: '100%' }}
                      />
                    </div>
                    <div className="chart-value">{stats.patients.total}</div>
                  </div>
                  <div className="chart-item">
                    <div className="chart-label">New This Week</div>
                    <div className="chart-bar-container">
                      <div 
                        className="chart-bar specialty-bar" 
                        style={{ 
                          width: `${stats.patients.total > 0 ? (stats.patients.weekly / stats.patients.total) * 100 : 0}%` 
                        }}
                      />
                    </div>
                    <div className="chart-value">{stats.patients.weekly}</div>
                  </div>
                </div>
              </div>

              <div className="card">
                <h2>Doctor Statistics</h2>
                <div className="chart-list">
                  <div className="chart-item">
                    <div className="chart-label">Active Doctors</div>
                    <div className="chart-bar-container">
                      <div 
                        className="chart-bar" 
                        style={{ width: '100%' }}
                      />
                    </div>
                    <div className="chart-value">{stats.doctors.total}</div>
                  </div>
                  <div className="chart-item">
                    <div className="chart-label">Available Now</div>
                    <div className="chart-bar-container">
                      <div 
                        className="chart-bar specialty-bar" 
                        style={{ width: '100%' }}
                      />
                    </div>
                    <div className="chart-value">{stats.doctors.total}</div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <CalendarView />
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
