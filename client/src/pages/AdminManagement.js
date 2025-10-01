import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, UserPlus, Edit2, Trash2, Save, X, Shield, UserCheck } from 'lucide-react';
import './AdminManagement.css';

function AdminManagement() {
  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'doctors'
  const [users, setUsers] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [showAddDoctor, setShowAddDoctor] = useState(false);
  const [newDoctor, setNewDoctor] = useState({
    name: '',
    specialty: '',
    experience: '',
    rating: 4.5,
    consultationFee: 500,
    bio: '',
    education: '',
    languages: 'English, Filipino',
    certifications: '',
    availability: '09:00, 10:00, 11:00, 14:00, 15:00, 16:00'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, doctorsRes] = await Promise.all([
        axios.get('/api/admin/users'),
        axios.get('/api/doctors')
      ]);
      setUsers(usersRes.data);
      setDoctors(doctorsRes.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load data');
      setLoading(false);
    }
  };

  // User Management
  const handleEditUser = (user) => {
    setEditingUser({ ...user });
  };

  const handleSaveUser = async () => {
    try {
      await axios.put(`/api/admin/users/${editingUser.id}`, editingUser);
      setUsers(users.map(u => u.id === editingUser.id ? editingUser : u));
      setEditingUser(null);
      alert('User updated successfully');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await axios.delete(`/api/admin/users/${id}`);
      setUsers(users.filter(u => u.id !== id));
      alert('User deleted successfully');
    } catch (err) {
      alert('Failed to delete user');
    }
  };

  // Doctor Management
  const handleEditDoctor = (doctor) => {
    setEditingDoctor({
      ...doctor,
      languages: doctor.languages.join(', '),
      certifications: doctor.certifications.join(', '),
      availability: doctor.availability.join(', ')
    });
  };

  const handleSaveDoctor = async () => {
    try {
      const doctorData = {
        ...editingDoctor,
        languages: editingDoctor.languages.split(',').map(l => l.trim()),
        certifications: editingDoctor.certifications.split(',').map(c => c.trim()),
        availability: editingDoctor.availability.split(',').map(a => a.trim())
      };
      
      await axios.put(`/api/admin/doctors/${editingDoctor.id}`, doctorData);
      await fetchData(); // Refresh data
      setEditingDoctor(null);
      alert('Doctor updated successfully');
    } catch (err) {
      alert('Failed to update doctor');
    }
  };

  const handleAddDoctor = async () => {
    try {
      const doctorData = {
        ...newDoctor,
        languages: newDoctor.languages.split(',').map(l => l.trim()),
        certifications: newDoctor.certifications.split(',').map(c => c.trim()).filter(c => c),
        availability: newDoctor.availability.split(',').map(a => a.trim())
      };

      await axios.post('/api/admin/doctors', doctorData);
      await fetchData();
      setShowAddDoctor(false);
      setNewDoctor({
        name: '',
        specialty: '',
        experience: '',
        rating: 4.5,
        consultationFee: 500,
        bio: '',
        education: '',
        languages: 'English, Filipino',
        certifications: '',
        availability: '09:00, 10:00, 11:00, 14:00, 15:00, 16:00'
      });
      alert('Doctor added successfully');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add doctor');
    }
  };

  const handleDeleteDoctor = async (id) => {
    if (!window.confirm('Are you sure you want to delete this doctor?')) return;

    try {
      await axios.delete(`/api/admin/doctors/${id}`);
      setDoctors(doctors.filter(d => d.id !== id));
      alert('Doctor deleted successfully');
    } catch (err) {
      alert('Failed to delete doctor');
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="admin-management-page">
      <div className="container">
        <div className="page-header">
          <h1>Admin Management</h1>
          <p>Manage users and doctors</p>
        </div>

        {/* Tabs */}
        <div className="management-tabs">
          <button 
            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={20} />
            User Management ({users.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'doctors' ? 'active' : ''}`}
            onClick={() => setActiveTab('doctors')}
          >
            <Shield size={20} />
            Doctor Management ({doctors.length})
          </button>
        </div>

        {/* User Management Tab */}
        {activeTab === 'users' && (
          <div className="management-content">
            <div className="table-container card">
              <table className="management-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      {editingUser?.id === user.id ? (
                        <>
                          <td>
                            <input
                              type="text"
                              value={editingUser.name}
                              onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                              className="edit-input"
                            />
                          </td>
                          <td>
                            <input
                              type="email"
                              value={editingUser.email}
                              onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                              className="edit-input"
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              value={editingUser.phone || ''}
                              onChange={(e) => setEditingUser({...editingUser, phone: e.target.value})}
                              className="edit-input"
                            />
                          </td>
                          <td>
                            <select
                              value={editingUser.role}
                              onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                              className="edit-select"
                            >
                              <option value="patient">Patient</option>
                              <option value="doctor">Doctor</option>
                            </select>
                          </td>
                          <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                          <td>
                            <div className="action-buttons">
                              <button onClick={handleSaveUser} className="btn-icon btn-success">
                                <Save size={16} />
                              </button>
                              <button onClick={() => setEditingUser(null)} className="btn-icon btn-secondary">
                                <X size={16} />
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td>{user.name}</td>
                          <td>{user.email}</td>
                          <td>{user.phone || '-'}</td>
                          <td>
                            <span className={`role-badge ${user.role}`}>
                              {user.role === 'doctor' ? <Shield size={14} /> : <UserCheck size={14} />}
                              {user.role}
                            </span>
                          </td>
                          <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                          <td>
                            <div className="action-buttons">
                              <button onClick={() => handleEditUser(user)} className="btn-icon btn-primary">
                                <Edit2 size={16} />
                              </button>
                              <button onClick={() => handleDeleteUser(user.id)} className="btn-icon btn-danger">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Doctor Management Tab */}
        {activeTab === 'doctors' && (
          <div className="management-content">
            <button onClick={() => setShowAddDoctor(true)} className="btn btn-primary" style={{ marginBottom: '20px' }}>
              <UserPlus size={20} />
              Add New Doctor
            </button>

            {/* Add Doctor Form */}
            {showAddDoctor && (
              <div className="add-doctor-form card" style={{ marginBottom: '20px' }}>
                <h3>Add New Doctor</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Name *</label>
                    <input
                      type="text"
                      value={newDoctor.name}
                      onChange={(e) => setNewDoctor({...newDoctor, name: e.target.value})}
                      placeholder="Dr. John Doe"
                    />
                  </div>
                  <div className="form-group">
                    <label>Specialty *</label>
                    <input
                      type="text"
                      value={newDoctor.specialty}
                      onChange={(e) => setNewDoctor({...newDoctor, specialty: e.target.value})}
                      placeholder="Cardiologist"
                    />
                  </div>
                  <div className="form-group">
                    <label>Experience *</label>
                    <input
                      type="text"
                      value={newDoctor.experience}
                      onChange={(e) => setNewDoctor({...newDoctor, experience: e.target.value})}
                      placeholder="10 years"
                    />
                  </div>
                  <div className="form-group">
                    <label>Consultation Fee (₱)</label>
                    <input
                      type="number"
                      value={newDoctor.consultationFee}
                      onChange={(e) => setNewDoctor({...newDoctor, consultationFee: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Bio</label>
                    <textarea
                      value={newDoctor.bio}
                      onChange={(e) => setNewDoctor({...newDoctor, bio: e.target.value})}
                      rows="3"
                      placeholder="Professional bio..."
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Education</label>
                    <input
                      type="text"
                      value={newDoctor.education}
                      onChange={(e) => setNewDoctor({...newDoctor, education: e.target.value})}
                      placeholder="MD - University Name"
                    />
                  </div>
                  <div className="form-group">
                    <label>Languages (comma-separated)</label>
                    <input
                      type="text"
                      value={newDoctor.languages}
                      onChange={(e) => setNewDoctor({...newDoctor, languages: e.target.value})}
                      placeholder="English, Filipino"
                    />
                  </div>
                  <div className="form-group">
                    <label>Certifications (comma-separated)</label>
                    <input
                      type="text"
                      value={newDoctor.certifications}
                      onChange={(e) => setNewDoctor({...newDoctor, certifications: e.target.value})}
                      placeholder="Board Certified, etc."
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Availability (comma-separated times)</label>
                    <input
                      type="text"
                      value={newDoctor.availability}
                      onChange={(e) => setNewDoctor({...newDoctor, availability: e.target.value})}
                      placeholder="09:00, 10:00, 11:00"
                    />
                  </div>
                </div>
                <div className="form-actions">
                  <button onClick={handleAddDoctor} className="btn btn-primary">
                    <Save size={18} />
                    Add Doctor
                  </button>
                  <button onClick={() => setShowAddDoctor(false)} className="btn btn-secondary">
                    <X size={18} />
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Doctors List */}
            <div className="doctors-grid">
              {doctors.map(doctor => (
                <div key={doctor.id} className="doctor-management-card card">
                  {editingDoctor?.id === doctor.id ? (
                    <>
                      <div className="form-group">
                        <label>Name</label>
                        <input
                          type="text"
                          value={editingDoctor.name}
                          onChange={(e) => setEditingDoctor({...editingDoctor, name: e.target.value})}
                        />
                      </div>
                      <div className="form-group">
                        <label>Specialty</label>
                        <input
                          type="text"
                          value={editingDoctor.specialty}
                          onChange={(e) => setEditingDoctor({...editingDoctor, specialty: e.target.value})}
                        />
                      </div>
                      <div className="form-group">
                        <label>Experience</label>
                        <input
                          type="text"
                          value={editingDoctor.experience}
                          onChange={(e) => setEditingDoctor({...editingDoctor, experience: e.target.value})}
                        />
                      </div>
                      <div className="form-group">
                        <label>Consultation Fee</label>
                        <input
                          type="number"
                          value={editingDoctor.consultationFee}
                          onChange={(e) => setEditingDoctor({...editingDoctor, consultationFee: parseInt(e.target.value)})}
                        />
                      </div>
                      <div className="form-group">
                        <label>Bio</label>
                        <textarea
                          value={editingDoctor.bio}
                          onChange={(e) => setEditingDoctor({...editingDoctor, bio: e.target.value})}
                          rows="3"
                        />
                      </div>
                      <div className="form-actions">
                        <button onClick={handleSaveDoctor} className="btn btn-primary btn-sm">
                          <Save size={16} />
                          Save
                        </button>
                        <button onClick={() => setEditingDoctor(null)} className="btn btn-secondary btn-sm">
                          <X size={16} />
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <img src={doctor.image} alt={doctor.name} className="doctor-avatar" />
                      <h3>{doctor.name}</h3>
                      <p className="specialty">{doctor.specialty}</p>
                      <div className="doctor-stats">
                        <span>⭐ {doctor.rating}</span>
                        <span>₱{doctor.consultationFee}</span>
                        <span>{doctor.experience}</span>
                      </div>
                      <p className="doctor-bio-short">{doctor.bio.substring(0, 100)}...</p>
                      <div className="action-buttons">
                        <button onClick={() => handleEditDoctor(doctor)} className="btn-icon btn-primary">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDeleteDoctor(doctor.id)} className="btn-icon btn-danger">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminManagement;
