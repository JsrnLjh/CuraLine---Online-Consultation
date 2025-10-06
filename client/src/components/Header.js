import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Calendar, Users, Home, LayoutDashboard, LogOut, User, ChevronDown, Settings, Stethoscope } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import './Header.css';

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isDoctor } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <img src="/logo.png" alt="CuraLine Logo" className="logo-image" />
        </Link>
        <nav className="nav">
          <Link to="/" className={`nav-link ${isActive('/')}`}>
            <Home size={20} />
            <span>Home</span>
          </Link>
          <Link to="/doctors" className={`nav-link ${isActive('/doctors')}`}>
            <Users size={20} />
            <span>Doctors</span>
          </Link>
          <Link to="/consultations" className={`nav-link ${isActive('/consultations')}`}>
            <Calendar size={20} />
            <span>Consultations</span>
          </Link>
          {isDoctor() && (
            <>
              <Link to="/doctor/appointments" className={`nav-link ${isActive('/doctor/appointments')}`}>
                <Stethoscope size={20} />
                <span>Appointments</span>
              </Link>
              <Link to="/admin" className={`nav-link ${isActive('/admin')}`}>
                <LayoutDashboard size={20} />
                <span>Admin</span>
              </Link>
            </>
          )}
        </nav>
        <div className="user-section">
          <NotificationBell />
          <div className="user-menu">
            <button className="user-info" onClick={toggleDropdown}>
              <User size={18} />
              <span>{user?.name}</span>
              {user?.role === 'doctor' && <span className="role-badge">Doctor</span>}
              <ChevronDown size={16} className={`dropdown-icon ${showDropdown ? 'open' : ''}`} />
            </button>
            
            {showDropdown && (
              <div className="dropdown-menu">
                <Link to="/profile" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                  <Settings size={16} />
                  <span>Profile Settings</span>
                </Link>
                <button onClick={handleLogout} className="dropdown-item logout">
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
