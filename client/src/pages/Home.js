import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, Clock, Shield } from 'lucide-react';
import './Home.css';

function Home() {
  return (
    <div className="home">
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <img src="/logo.png" alt="CuraLine" className="hero-logo" />
            <h1>Your Personalized Health Partner</h1>
            <p>Connect with experienced doctors online for quality healthcare consultations from the comfort of your home.</p>
            <div className="hero-buttons">
              <Link to="/doctors" className="btn btn-primary">
                <Calendar size={20} />
                Book Consultation
              </Link>
              <Link to="/consultations" className="btn btn-secondary">
                View My Consultations
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      <section className="features">
        <div className="container">
          <h2>Why Choose CuraLine?</h2>
          <div className="grid grid-4">
            <div className="feature-card">
              <div className="feature-icon">
                <Users size={40} />
              </div>
              <h3>Expert Doctors</h3>
              <p>Access to qualified and experienced healthcare professionals across various specialties.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <Clock size={40} />
              </div>
              <h3>Flexible Scheduling</h3>
              <p>Book appointments at your convenience with multiple time slots available.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <Shield size={40} />
              </div>
              <h3>Secure & Private</h3>
              <p>Your health information is protected with industry-standard security measures.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon support-icon">
                <span className="support-text">24/7</span>
              </div>
              <h3>24/7 Support</h3>
              <p>Round-the-clock customer support to assist you with any questions or concerns.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Get Started?</h2>
            <p>Book your first consultation today and experience quality healthcare online.</p>
            <Link to="/doctors" className="btn btn-primary">
              Find a Doctor
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
