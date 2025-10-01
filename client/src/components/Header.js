import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Calendar, Users, Home, LayoutDashboard, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Header.css';

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isDoctor } = useAuth();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
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
            <span>My Consultations</span>
          </Link>
          {isDoctor() && (
            <Link to="/admin" className={`nav-link ${isActive('/admin')}`}>
              <LayoutDashboard size={20} />
              <span>Admin</span>
            </Link>
          )}
        </nav>
        <div className="user-section">
          <div className="user-info">
            <User size={18} />
            <span>{user?.name}</span>
            {user?.role === 'doctor' && <span className="role-badge">Doctor</span>}
          </div>
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
