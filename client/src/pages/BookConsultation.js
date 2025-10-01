import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Calendar, Clock, User, Mail, Phone, FileText, CheckCircle } from 'lucide-react';
import './BookConsultation.css';

function BookConsultation() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    patientName: '',
    patientEmail: '',
    patientPhone: '',
    date: '',
    time: '',
    symptoms: ''
  });

  useEffect(() => {
    fetchDoctor();
  }, [doctorId]);

  const fetchDoctor = async () => {
    try {
      const response = await axios.get(`/api/doctors/${doctorId}`);
      setDoctor(response.data);
      setLoading(false);
    } catch (err) {
      alert('Failed to load doctor information');
      navigate('/doctors');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await axios.post('/api/consultations', {
        ...formData,
        doctorId: doctor.id
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/consultations');
      }, 2000);
    } catch (err) {
      alert('Failed to book consultation. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="container" style={{ padding: '60px 20px' }}>
        <div className="success-message">
          <CheckCircle size={64} color="#10b981" />
          <h2>Consultation Booked Successfully!</h2>
          <p>Redirecting to your consultations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="book-consultation-page">
      <div className="container">
        <div className="booking-container">
          <div className="doctor-summary card">
            <img src={doctor.image} alt={doctor.name} className="doctor-image-large" />
            <h2>{doctor.name}</h2>
            <p className="specialty">{doctor.specialty}</p>
            <div className="doctor-meta">
              <p><strong>Experience:</strong> {doctor.experience}</p>
              <p><strong>Rating:</strong> ⭐ {doctor.rating}</p>
            </div>
          </div>

          <div className="booking-form card">
            <h2>Book Your Consultation</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>
                  <User size={18} />
                  Full Name *
                </label>
                <input
                  type="text"
                  name="patientName"
                  value={formData.patientName}
                  onChange={handleChange}
                  required
                  placeholder="Enter your full name"
                />
              </div>

              <div className="form-group">
                <label>
                  <Mail size={18} />
                  Email Address *
                </label>
                <input
                  type="email"
                  name="patientEmail"
                  value={formData.patientEmail}
                  onChange={handleChange}
                  required
                  placeholder="your.email@example.com"
                />
              </div>

              <div className="form-group">
                <label>
                  <Phone size={18} />
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="patientPhone"
                  value={formData.patientPhone}
                  onChange={handleChange}
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    <Calendar size={18} />
                    Date *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="form-group">
                  <label>
                    <Clock size={18} />
                    Time *
                  </label>
                  <select
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select time</option>
                    {doctor.availability.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>
                  <FileText size={18} />
                  Symptoms / Reason for Consultation
                </label>
                <textarea
                  name="symptoms"
                  value={formData.symptoms}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Describe your symptoms or reason for consultation..."
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: '100%', justifyContent: 'center' }}>
                {submitting ? 'Booking...' : 'Confirm Booking'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookConsultation;
