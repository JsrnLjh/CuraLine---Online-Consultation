import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Clock, User, FileText, XCircle, AlertCircle, Edit3 } from 'lucide-react';
import './MyConsultations.css';

function MyConsultations() {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [reschedulingId, setReschedulingId] = useState(null);
  const [rescheduleData, setRescheduleData] = useState({ date: '', time: '' });
  const [availableTimes] = useState(['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00']);

  useEffect(() => {
    fetchConsultations();
  }, []);

  const fetchConsultations = async () => {
    try {
      const response = await axios.get('/api/consultations');
      setConsultations(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load consultations');
      setLoading(false);
    }
  };

  const handleCancelConsultation = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this consultation?')) {
      return;
    }

    setCancellingId(id);
    try {
      await axios.patch(`/api/consultations/${id}`, { status: 'cancelled' });
      // Update local state
      setConsultations(consultations.map(c => 
        c.id === id ? { ...c, status: 'cancelled' } : c
      ));
      alert('Consultation cancelled successfully');
    } catch (err) {
      alert('Failed to cancel consultation. Please try again.');
    } finally {
      setCancellingId(null);
    }
  };

  const handleStartReschedule = (consultation) => {
    setReschedulingId(consultation.id);
    setRescheduleData({
      date: consultation.date,
      time: consultation.time
    });
  };

  const handleReschedule = async (id) => {
    if (!rescheduleData.date || !rescheduleData.time) {
      alert('Please select both date and time');
      return;
    }

    try {
      const response = await axios.patch(`/api/consultations/${id}/reschedule`, rescheduleData);
      setConsultations(consultations.map(c => 
        c.id === id ? response.data : c
      ));
      setReschedulingId(null);
      setRescheduleData({ date: '', time: '' });
      alert('Consultation rescheduled successfully');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reschedule consultation');
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      scheduled: 'badge badge-info',
      completed: 'badge badge-success',
      cancelled: 'badge badge-warning'
    };
    return statusClasses[status] || 'badge';
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <div className="loading">Loading consultations...</div>
      </div>
    );
  }

  return (
    <div className="consultations-page">
      <div className="container">
        <div className="page-header">
          <h1>My Consultations</h1>
          <p>View and manage your upcoming and past consultations</p>
        </div>

        {consultations.length === 0 ? (
          <div className="empty-state card">
            <Calendar size={64} color="#d1d5db" />
            <h3>No Consultations Yet</h3>
            <p>You haven't booked any consultations. Book your first consultation to get started!</p>
            <a href="/doctors" className="btn btn-primary">
              Browse Doctors
            </a>
          </div>
        ) : (
          <div className="consultations-list">
            {consultations.map((consultation) => (
              <div key={consultation.id} className="consultation-card card">
                <div className="consultation-header">
                  <div>
                    <h3>{consultation.doctorName}</h3>
                    <p className="specialty">{consultation.doctorSpecialty}</p>
                  </div>
                  <span className={getStatusBadge(consultation.status)}>
                    {consultation.status}
                  </span>
                </div>

                <div className="consultation-details">
                  <div className="detail-item">
                    <User size={18} />
                    <span>{consultation.patientName}</span>
                  </div>
                  <div className="detail-item">
                    <Calendar size={18} />
                    <span>{new Date(consultation.date).toLocaleDateString()}</span>
                  </div>
                  <div className="detail-item">
                    <Clock size={18} />
                    <span>{consultation.time}</span>
                  </div>
                </div>

                {consultation.symptoms && (
                  <div className="consultation-symptoms">
                    <div className="detail-item">
                      <FileText size={18} />
                      <span><strong>Symptoms:</strong></span>
                    </div>
                    <p>{consultation.symptoms}</p>
                  </div>
                )}

                <div className="consultation-footer">
                  <small>Booked on {new Date(consultation.createdAt).toLocaleString()}</small>
                </div>

                {consultation.status === 'scheduled' && (
                  <>
                    {reschedulingId === consultation.id ? (
                      <div className="reschedule-form">
                        <h4>Reschedule Appointment</h4>
                        <div className="reschedule-inputs">
                          <div className="form-group">
                            <label>New Date</label>
                            <input
                              type="date"
                              value={rescheduleData.date}
                              onChange={(e) => setRescheduleData({...rescheduleData, date: e.target.value})}
                              min={new Date().toISOString().split('T')[0]}
                            />
                          </div>
                          <div className="form-group">
                            <label>New Time</label>
                            <select
                              value={rescheduleData.time}
                              onChange={(e) => setRescheduleData({...rescheduleData, time: e.target.value})}
                            >
                              <option value="">Select time</option>
                              {availableTimes.map(time => (
                                <option key={time} value={time}>{time}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="reschedule-actions">
                          <button 
                            onClick={() => handleReschedule(consultation.id)}
                            className="btn-reschedule-confirm"
                          >
                            Confirm Reschedule
                          </button>
                          <button 
                            onClick={() => setReschedulingId(null)}
                            className="btn-reschedule-cancel"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="consultation-actions">
                        <button 
                          onClick={() => handleStartReschedule(consultation)}
                          className="btn-reschedule"
                        >
                          <Edit3 size={18} />
                          Reschedule
                        </button>
                        <button 
                          onClick={() => handleCancelConsultation(consultation.id)}
                          className="btn-cancel"
                          disabled={cancellingId === consultation.id}
                        >
                          <XCircle size={18} />
                          {cancellingId === consultation.id ? 'Cancelling...' : 'Cancel'}
                        </button>
                      </div>
                    )}
                  </>
                )}

                {consultation.status === 'cancelled' && (
                  <div className="cancellation-notice">
                    <AlertCircle size={18} />
                    <span>This appointment has been cancelled</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyConsultations;
