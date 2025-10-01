import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Calendar, Clock, User, Mail, Phone, FileText, CheckCircle, ArrowLeft, DollarSign } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './BookConsultation.css';

function BookConsultation() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(1); // 1: Form, 2: Confirmation
  const [formData, setFormData] = useState({
    patientName: user?.name || '',
    patientEmail: user?.email || '',
    patientPhone: '',
    date: '',
    time: '',
    symptoms: ''
  });

  useEffect(() => {
    fetchDoctor();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleTimeSelect = (time) => {
    setFormData({
      ...formData,
      time: time
    });
  };

  const handleContinue = (e) => {
    e.preventDefault();
    setStep(2); // Go to confirmation
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);

    try {
      await axios.post('/api/consultations', {
        ...formData,
        doctorId: doctor.id
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/consultations');
      }, 3000);
    } catch (err) {
      alert('Failed to book consultation. Please try again.');
      setSubmitting(false);
      setStep(1);
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
      <div className="book-consultation-page">
        <div className="container">
          <div className="success-page card">
            <CheckCircle size={80} color="#10b981" />
            <h2>Consultation Booked Successfully!</h2>
            <p>Your appointment has been confirmed</p>
            
            <div className="success-details">
              <div className="success-item">
                <strong>Doctor:</strong> {doctor.name}
              </div>
              <div className="success-item">
                <strong>Date:</strong> {new Date(formData.date).toLocaleDateString()}
              </div>
              <div className="success-item">
                <strong>Time:</strong> {formData.time}
              </div>
              <div className="success-item">
                <strong>Fee:</strong> ₱{doctor.consultationFee}
              </div>
            </div>

            <p className="redirect-text">Redirecting to your consultations...</p>
            
            <button onClick={() => navigate('/consultations')} className="btn btn-primary">
              View My Consultations
            </button>
          </div>
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
            {/* Step Indicator */}
            <div className="step-indicator">
              <div className={`step ${step >= 1 ? 'active' : ''}`}>
                <span className="step-number">1</span>
                <span className="step-label">Details</span>
              </div>
              <div className="step-line"></div>
              <div className={`step ${step >= 2 ? 'active' : ''}`}>
                <span className="step-number">2</span>
                <span className="step-label">Confirm</span>
              </div>
            </div>

            {step === 1 ? (
              <>
                <h2>Book Your Consultation</h2>
                <form onSubmit={handleContinue}>
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
                  placeholder="+63 9123456789"
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

              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                Continue to Confirmation
              </button>
            </form>
              </>
            ) : (
              <>
                <button onClick={handleBack} className="btn btn-secondary" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ArrowLeft size={20} />
                  Back
                </button>
                <h2>Confirm Your Booking</h2>
                <div className="confirmation-details">
                  <div className="confirm-section">
                    <h3>Patient Information</h3>
                    <div className="confirm-item">
                      <strong>Name:</strong> {formData.patientName}
                    </div>
                    <div className="confirm-item">
                      <strong>Email:</strong> {formData.patientEmail}
                    </div>
                    {formData.patientPhone && (
                      <div className="confirm-item">
                        <strong>Phone:</strong> {formData.patientPhone}
                      </div>
                    )}
                  </div>

                  <div className="confirm-section">
                    <h3>Appointment Details</h3>
                    <div className="confirm-item">
                      <strong>Doctor:</strong> {doctor.name}
                    </div>
                    <div className="confirm-item">
                      <strong>Specialty:</strong> {doctor.specialty}
                    </div>
                    <div className="confirm-item">
                      <strong>Date:</strong> {new Date(formData.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                    <div className="confirm-item">
                      <strong>Time:</strong> {formData.time}
                    </div>
                    {formData.symptoms && (
                      <div className="confirm-item">
                        <strong>Reason:</strong> {formData.symptoms}
                      </div>
                    )}
                  </div>

                  <div className="confirm-section fee-section">
                    <div className="fee-item">
                      <DollarSign size={24} />
                      <div>
                        <strong>Consultation Fee</strong>
                        <p className="fee-amount">₱{doctor.consultationFee}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleSubmit} 
                  className="btn btn-primary" 
                  disabled={submitting}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  {submitting ? 'Booking...' : 'Confirm & Book Appointment'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookConsultation;
