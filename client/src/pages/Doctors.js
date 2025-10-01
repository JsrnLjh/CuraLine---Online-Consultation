import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Star, Calendar } from 'lucide-react';
import './Doctors.css';

function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await axios.get('/api/doctors');
      setDoctors(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load doctors. Please try again later.');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <div className="loading">Loading doctors...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="doctors-page">
      <div className="container">
        <div className="page-header">
          <h1>Our Doctors</h1>
          <p>Choose from our team of experienced healthcare professionals</p>
        </div>

        <div className="grid grid-2">
          {doctors.map((doctor) => (
            <div key={doctor.id} className="doctor-card card">
              <div className="doctor-header">
                <img src={doctor.image} alt={doctor.name} className="doctor-image" />
                <div className="doctor-info">
                  <h3>{doctor.name}</h3>
                  <p className="specialty">{doctor.specialty}</p>
                  <div className="rating">
                    <Star size={16} fill="#fbbf24" color="#fbbf24" />
                    <span>{doctor.rating}</span>
                  </div>
                </div>
              </div>
              <div className="doctor-details">
                <p><strong>Experience:</strong> {doctor.experience}</p>
                <p><strong>Available Slots:</strong> {doctor.availability.length} slots today</p>
              </div>
              <Link to={`/book/${doctor.id}`} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                <Calendar size={20} />
                Book Consultation
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Doctors;
