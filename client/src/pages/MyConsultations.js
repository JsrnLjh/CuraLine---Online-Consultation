import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Clock, User, FileText } from 'lucide-react';
import './MyConsultations.css';

function MyConsultations() {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);

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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyConsultations;
