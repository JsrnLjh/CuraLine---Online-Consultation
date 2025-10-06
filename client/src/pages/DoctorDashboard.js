import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Calendar, Clock, User, Phone, Mail, FileText, CheckCircle, XCircle, Video } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './DoctorDashboard.css';

function DoctorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'scheduled', 'completed', 'cancelled'
  const [stats, setStats] = useState({
    total: 0,
    scheduled: 0,
    completed: 0,
    cancelled: 0,
    today: 0
  });

  const joinCall = (consultationId) => {
    navigate(`/consultation-room/${consultationId}`);
  };

  useEffect(() => {
    fetchConsultations();
  }, []);

  const fetchConsultations = async () => {
    try {
      const response = await axios.get('/api/consultations');
      // Filter consultations for this doctor (match by doctor name)
      const myConsultations = response.data.filter(c => 
        c.doctorName === user.name || c.doctorId === user.id
      );
      
      setConsultations(myConsultations);
      calculateStats(myConsultations);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load consultations');
      setLoading(false);
    }
  };

  const calculateStats = (consultations) => {
    const today = new Date().toISOString().split('T')[0];
    
    setStats({
      total: consultations.length,
      scheduled: consultations.filter(c => c.status === 'scheduled').length,
      completed: consultations.filter(c => c.status === 'completed').length,
      cancelled: consultations.filter(c => c.status === 'cancelled').length,
      today: consultations.filter(c => c.date === today).length
    });
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.patch(`/api/consultations/${id}`, { status: newStatus });
      const updatedConsultations = consultations.map(c => 
        c.id === id ? { ...c, status: newStatus } : c
      );
      setConsultations(updatedConsultations);
      calculateStats(updatedConsultations);
      alert('Status updated successfully');
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const getFilteredConsultations = () => {
    if (filter === 'all') return consultations;
    return consultations.filter(c => c.status === filter);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      scheduled: { class: 'badge badge-info', icon: <Clock size={14} /> },
      completed: { class: 'badge badge-success', icon: <CheckCircle size={14} /> },
      cancelled: { class: 'badge badge-warning', icon: <XCircle size={14} /> }
    };
    return statusConfig[status] || { class: 'badge', icon: null };
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <div className="loading">Loading your dashboard...</div>
      </div>
    );
  }

  const filteredConsultations = getFilteredConsultations();

  return (
    <div className="doctor-dashboard-page">
      <div className="container">
        <div className="page-header">
          <h1>My Appointments</h1>
          <p>Manage your consultations and patient appointments</p>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card card">
            <div className="stat-icon" style={{ background: '#dbeafe' }}>
              <Calendar size={24} color="#2563eb" />
            </div>
            <div className="stat-content">
              <h3>{stats.total}</h3>
              <p>Total Appointments</p>
            </div>
          </div>

          <div className="stat-card card">
            <div className="stat-icon" style={{ background: '#dbeafe' }}>
              <Clock size={24} color="#2563eb" />
            </div>
            <div className="stat-content">
              <h3>{stats.today}</h3>
              <p>Today's Appointments</p>
            </div>
          </div>

          <div className="stat-card card">
            <div className="stat-icon" style={{ background: '#dbeafe' }}>
              <CheckCircle size={24} color="#2563eb" />
            </div>
            <div className="stat-content">
              <h3>{stats.scheduled}</h3>
              <p>Scheduled</p>
            </div>
          </div>

          <div className="stat-card card">
            <div className="stat-icon" style={{ background: '#dcfce7' }}>
              <CheckCircle size={24} color="#16a34a" />
            </div>
            <div className="stat-content">
              <h3>{stats.completed}</h3>
              <p>Completed</p>
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({consultations.length})
          </button>
          <button 
            className={`filter-btn ${filter === 'scheduled' ? 'active' : ''}`}
            onClick={() => setFilter('scheduled')}
          >
            Scheduled ({stats.scheduled})
          </button>
          <button 
            className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completed ({stats.completed})
          </button>
          <button 
            className={`filter-btn ${filter === 'cancelled' ? 'active' : ''}`}
            onClick={() => setFilter('cancelled')}
          >
            Cancelled ({stats.cancelled})
          </button>
        </div>

        {/* Appointments List */}
        {filteredConsultations.length === 0 ? (
          <div className="empty-state card">
            <Calendar size={64} color="#d1d5db" />
            <h3>No Appointments Found</h3>
            <p>You don't have any {filter !== 'all' ? filter : ''} appointments yet.</p>
          </div>
        ) : (
          <div className="appointments-list">
            {filteredConsultations.map((consultation) => {
              const statusBadge = getStatusBadge(consultation.status);
              return (
                <div key={consultation.id} className="appointment-card card">
                  <div className="appointment-header">
                    <div className="patient-info">
                      <h3>{consultation.patientName}</h3>
                      <span className={statusBadge.class}>
                        {statusBadge.icon}
                        {consultation.status}
                      </span>
                    </div>
                    <div className="appointment-date">
                      <Calendar size={18} />
                      <span>{new Date(consultation.date).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}</span>
                      <Clock size={18} />
                      <span>{consultation.time}</span>
                    </div>
                  </div>

                  <div className="appointment-details">
                    <div className="detail-row">
                      <Mail size={16} />
                      <span>{consultation.patientEmail}</span>
                    </div>
                    {consultation.patientPhone && (
                      <div className="detail-row">
                        <Phone size={16} />
                        <span>{consultation.patientPhone}</span>
                      </div>
                    )}
                  </div>

                  {consultation.symptoms && (
                    <div className="symptoms-section">
                      <div className="symptoms-header">
                        <FileText size={16} />
                        <strong>Reason for Visit:</strong>
                      </div>
                      <p>{consultation.symptoms}</p>
                    </div>
                  )}

                  {consultation.status === 'scheduled' && (
                    <>
                      <div className="appointment-actions">
                        <button 
                          onClick={() => joinCall(consultation.id)}
                          className="btn-join-video"
                        >
                          <Video size={18} />
                          Join Video Call
                        </button>
                      </div>
                      <div className="appointment-actions">
                        <button 
                          onClick={() => handleStatusChange(consultation.id, 'completed')}
                          className="btn-complete"
                        >
                          <CheckCircle size={18} />
                          Mark as Completed
                        </button>
                        <button 
                          onClick={() => handleStatusChange(consultation.id, 'cancelled')}
                          className="btn-cancel-appointment"
                        >
                          <XCircle size={18} />
                          Cancel
                        </button>
                      </div>
                    </>
                  )}

                  <div className="appointment-footer">
                    <small>Booked on {new Date(consultation.createdAt).toLocaleString()}</small>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default DoctorDashboard;
