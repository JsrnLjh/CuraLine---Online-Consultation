import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Doctors from './pages/Doctors';
import BookConsultation from './pages/BookConsultation';
import MyConsultations from './pages/MyConsultations';
import AdminDashboard from './pages/AdminDashboard';
import AdminManagement from './pages/AdminManagement';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <>
                  <Header />
                  <Home />
                </>
              </ProtectedRoute>
            } />
            
            <Route path="/doctors" element={
              <ProtectedRoute>
                <>
                  <Header />
                  <Doctors />
                </>
              </ProtectedRoute>
            } />
            
            <Route path="/book/:doctorId" element={
              <ProtectedRoute>
                <>
                  <Header />
                  <BookConsultation />
                </>
              </ProtectedRoute>
            } />
            
            <Route path="/consultations" element={
              <ProtectedRoute>
                <>
                  <Header />
                  <MyConsultations />
                </>
              </ProtectedRoute>
            } />
            
            {/* Doctor-only routes */}
            <Route path="/admin" element={
              <ProtectedRoute requireDoctor={true}>
                <>
                  <Header />
                  <AdminDashboard />
                </>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/management" element={
              <ProtectedRoute requireDoctor={true}>
                <>
                  <Header />
                  <AdminManagement />
                </>
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
