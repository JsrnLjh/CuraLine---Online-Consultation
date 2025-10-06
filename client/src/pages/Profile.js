import React, { useState } from 'react';
import axios from 'axios';
import { User, Mail, Phone, Lock, Save, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

function Profile() {
  const { user, login } = useAuth();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'password'
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [saving, setSaving] = useState(false);

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords({
      ...showPasswords,
      [field]: !showPasswords[field]
    });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await axios.put(`/api/admin/users/${user.id}`, {
        ...profileData,
        role: user.role
      });
      
      // Update auth context with new user data
      login({ ...user, ...response.data });
      alert('Profile updated successfully');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      alert('Please fill in all password fields');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert('New password must be at least 6 characters long');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    setSaving(true);

    try {
      await axios.post('/api/auth/change-password', {
        userId: user.id,
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      alert('Password changed successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="container">
        <div className="page-header">
          <h1>My Profile</h1>
          <p>Manage your account settings</p>
        </div>

        {/* Tabs */}
        <div className="profile-tabs">
          <button 
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <User size={20} />
            Profile Information
          </button>
          <button 
            className={`tab-btn ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => setActiveTab('password')}
          >
            <Lock size={20} />
            Change Password
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="profile-content card">
            <h2>Profile Information</h2>
            <p className="section-description">Update your personal information</p>

            <form onSubmit={handleSaveProfile}>
              <div className="form-group">
                <label>
                  <User size={18} />
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={profileData.name}
                  onChange={handleProfileChange}
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
                  name="email"
                  value={profileData.email}
                  onChange={handleProfileChange}
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
                  name="phone"
                  value={profileData.phone}
                  onChange={handleProfileChange}
                  placeholder="+63 9123456789"
                />
              </div>

              <div className="form-group">
                <label>Account Type</label>
                <div className="role-display">
                  <span className={`role-badge ${user.role}`}>
                    {user.role === 'doctor' ? '👨‍⚕️' : '👤'} {user.role}
                  </span>
                </div>
                <small className="help-text">Contact admin to change your account type</small>
              </div>

              <button type="submit" className="btn btn-primary" disabled={saving}>
                <Save size={20} />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <div className="profile-content card">
            <h2>Change Password</h2>
            <p className="section-description">Update your password to keep your account secure</p>

            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label>
                  <Lock size={18} />
                  Current Password *
                </label>
                <div className="password-input">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => togglePasswordVisibility('current')}
                  >
                    {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>
                  <Lock size={18} />
                  New Password *
                </label>
                <div className="password-input">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                    placeholder="Enter new password (min 6 characters)"
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => togglePasswordVisibility('new')}
                  >
                    {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <small className="help-text">Password must be at least 6 characters long</small>
              </div>

              <div className="form-group">
                <label>
                  <Lock size={18} />
                  Confirm New Password *
                </label>
                <div className="password-input">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => togglePasswordVisibility('confirm')}
                  >
                    {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" disabled={saving}>
                <Lock size={20} />
                {saving ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
