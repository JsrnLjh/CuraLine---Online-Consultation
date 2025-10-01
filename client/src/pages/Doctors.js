import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Star, Calendar, Search, Filter, DollarSign, MessageCircle, Award } from 'lucide-react';
import './Doctors.css';

function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [sortBy, setSortBy] = useState('rating');

  useEffect(() => {
    fetchDoctors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    filterAndSortDoctors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctors, searchTerm, selectedSpecialty, sortBy]);

  const fetchDoctors = async () => {
    try {
      const response = await axios.get('/api/doctors');
      setDoctors(response.data);
      setFilteredDoctors(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load doctors. Please try again later.');
      setLoading(false);
    }
  };

  const filterAndSortDoctors = () => {
    let filtered = [...doctors];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(doctor =>
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Specialty filter
    if (selectedSpecialty !== 'all') {
      filtered = filtered.filter(doctor => doctor.specialty === selectedSpecialty);
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'experience') return parseInt(b.experience) - parseInt(a.experience);
      if (sortBy === 'fee-low') return a.consultationFee - b.consultationFee;
      if (sortBy === 'fee-high') return b.consultationFee - a.consultationFee;
      return 0;
    });

    setFilteredDoctors(filtered);
  };

  const getSpecialties = () => {
    const specialties = [...new Set(doctors.map(d => d.specialty))];
    return specialties;
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

        {/* Search and Filter Section */}
        <div className="search-filter-section">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search by name or specialty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filters">
            <div className="filter-group">
              <Filter size={18} />
              <select value={selectedSpecialty} onChange={(e) => setSelectedSpecialty(e.target.value)}>
                <option value="all">All Specialties</option>
                {getSpecialties().map(specialty => (
                  <option key={specialty} value={specialty}>{specialty}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <span>Sort by:</span>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="rating">Highest Rating</option>
                <option value="experience">Most Experience</option>
                <option value="fee-low">Lowest Fee</option>
                <option value="fee-high">Highest Fee</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="results-count">
          Showing {filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? 's' : ''}
        </div>

        {/* Doctor Cards */}
        <div className="grid grid-2">
          {filteredDoctors.map((doctor) => (
            <div key={doctor.id} className="doctor-card card">
              <div className="doctor-header">
                <img src={doctor.image} alt={doctor.name} className="doctor-image" />
                <div className="doctor-info">
                  <h3>{doctor.name}</h3>
                  <p className="specialty">{doctor.specialty}</p>
                  <div className="rating">
                    <Star size={16} fill="#fbbf24" color="#fbbf24" />
                    <span>{doctor.rating}</span>
                    <span className="reviews">({doctor.reviews} reviews)</span>
                  </div>
                </div>
              </div>

              <div className="doctor-bio">
                <p>{doctor.bio}</p>
              </div>

              <div className="doctor-details">
                <div className="detail-item">
                  <Award size={16} />
                  <span>{doctor.experience} experience</span>
                </div>
                <div className="detail-item">
                  <DollarSign size={16} />
                  <span>₱{doctor.consultationFee} consultation fee</span>
                </div>
                <div className="detail-item">
                  <MessageCircle size={16} />
                  <span>{doctor.languages.join(', ')}</span>
                </div>
              </div>

              <div className="doctor-education">
                <p><strong>Education:</strong> {doctor.education}</p>
              </div>

              <div className="doctor-availability">
                <p><strong>Available Today:</strong></p>
                <div className="time-slots-preview">
                  {doctor.availability.slice(0, 4).map((time, idx) => (
                    <span key={idx} className="time-slot-mini">{time}</span>
                  ))}
                  {doctor.availability.length > 4 && (
                    <span className="more-slots">+{doctor.availability.length - 4} more</span>
                  )}
                </div>
              </div>

              <Link to={`/book/${doctor.id}`} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                <Calendar size={20} />
                Book Consultation
              </Link>
            </div>
          ))}
        </div>

        {filteredDoctors.length === 0 && (
          <div className="no-results">
            <p>No doctors found matching your criteria.</p>
            <button onClick={() => { setSearchTerm(''); setSelectedSpecialty('all'); }} className="btn btn-secondary">
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Doctors;
