import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
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
import DoctorDashboard from './pages/DoctorDashboard';
import Profile from './pages/Profile';
import ConsultationRoom from './pages/ConsultationRoom';
import Payment from './pages/Payment';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
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

            <Route path="/doctor/appointments" element={
              <ProtectedRoute requireDoctor={true}>
                <>
                  <Header />
                  <DoctorDashboard />
                </>
              </ProtectedRoute>
            } />

            {/* Profile route (all authenticated users) */}
            <Route path="/profile" element={
              <ProtectedRoute>
                <>
                  <Header />
                  <Profile />
                </>
              </ProtectedRoute>
            } />

            {/* Consultation Room (Video Call & Chat) */}
            <Route path="/consultation-room/:consultationId" element={
              <ProtectedRoute>
                <ConsultationRoom />
              </ProtectedRoute>
            } />

            {/* Payment */}
            <Route path="/payment/:consultationId" element={
              <ProtectedRoute>
                <>
                  <Header />
                  <Payment />
                </>
              </ProtectedRoute>
            } />
            </Routes>
          </div>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
