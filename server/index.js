const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const connectDB = require('./config/database');
const { initializeEmailService, sendEmail, emailTemplates } = require('./services/emailService');
const { setupSocketServer } = require('./services/socketService');

// Import models
const User = require('./models/User');
const Doctor = require('./models/Doctor');
const Consultation = require('./models/Consultation');
const Notification = require('./models/Notification');
const Payment = require('./models/Payment');
const Prescription = require('./models/Prescription');
const Message = require('./models/Message');
const PasswordReset = require('./models/PasswordReset');
const ConsultationHistory = require('./models/ConsultationHistory');
const Analytics = require('./models/Analytics');
const Expense = require('./models/Expense');
const Payroll = require('./models/Payroll');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Initialize Email Service
initializeEmailService();

// Setup Socket.io for WebRTC
setupSocketServer(io);

app.use(cors());
app.use(bodyParser.json());

// Email service is now imported from services/emailService.js

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'CuraLine E-Health API with MongoDB',
    version: '2.0.0',
    status: 'running',
    database: 'MongoDB',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth/*',
      doctors: '/api/doctors',
      consultations: '/api/consultations',
      analytics: '/api/analytics/*',
      admin: '/api/admin/*',
      notifications: '/api/notifications/*',
      payments: '/api/payments/*',
      prescriptions: '/api/prescriptions/*'
    }
  });
});

// Authentication Routes

// Register
app.post('/api/auth/register', async (req, res) => {
  const { name, email, phone, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create new user (password will be hashed automatically)
    const user = await User.create({
      name,
      email,
      phone,
      password,
      role: role || 'patient'
    });

    // Return user without password
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt
    };

    res.status(201).json({ 
      message: 'Registration successful',
      user: userResponse 
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  try {
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Return user without password
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt
    };

    console.log(`✅ Login successful: ${user.name} (${user.role})`);

    res.json({ 
      message: 'Login successful',
      user: userResponse 
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get current user
app.get('/api/auth/me', async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ message: 'User ID required' });
  }

  try {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt
    });
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Change password
app.post('/api/auth/change-password', async (req, res) => {
  const { userId, currentPassword, newPassword } = req.body;

  if (!userId || !currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Update password (will be hashed automatically)
    user.password = newPassword;
    await user.save();
    
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Forgot password - Send reset link
app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists or not for security
      return res.json({ message: 'If that email exists, a reset link has been sent' });
    }

    // Generate reset token
    const resetToken = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${user._id}`;
    
    // Set expiration to 1 hour from now
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour

    // Create password reset record
    await PasswordReset.create({
      userId: user._id,
      email: user.email,
      token: resetToken,
      expiresAt
    });

    // Send email with reset link
    const resetLink = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
    const emailContent = emailTemplates.passwordReset({ resetLink });
    sendEmail({
      to: user.email,
      subject: emailContent.subject,
      html: emailContent.html
    });

    res.json({ message: 'If that email exists, a reset link has been sent' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset password - Update password with token
app.post('/api/auth/reset-password', async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ message: 'Token and password are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  try {
    // Find reset token
    const resetRecord = await PasswordReset.findOne({ 
      token,
      used: false,
      expiresAt: { $gt: new Date() }
    });

    if (!resetRecord) {
      return res.status(400).json({ message: 'Invalid or expired reset link' });
    }

    // Find user
    const user = await User.findById(resetRecord.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update password (will be hashed automatically)
    user.password = password;
    await user.save();

    // Mark token as used
    resetRecord.used = true;
    await resetRecord.save();

    // Send confirmation email
    sendEmail(
      user.email,
      'Password Reset Successful - CuraLine',
      `
        <h2>Password Reset Successful</h2>
        <p>Hello ${user.name},</p>
        <p>Your password has been successfully reset.</p>
        <p>You can now login with your new password.</p>
        <p>If you didn't make this change, please contact us immediately.</p>
        <p>Best regards,<br>CuraLine Team</p>
      `
    );

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Doctor Routes

// Get all doctors
app.get('/api/doctors', async (req, res) => {
  try {
    const doctors = await Doctor.find().sort({ createdAt: -1 });
    // Format doctors to include 'id' field for frontend compatibility
    const formattedDoctors = doctors.map(doc => ({
      id: doc._id.toString(),
      _id: doc._id,
      name: doc.name,
      specialty: doc.specialty,
      experience: doc.experience,
      rating: doc.rating,
      reviews: doc.reviews,
      consultationFee: doc.consultationFee,
      image: doc.image,
      bio: doc.bio,
      education: doc.education,
      languages: doc.languages,
      certifications: doc.certifications,
      availability: doc.availability,
      userId: doc.userId,
      createdAt: doc.createdAt
    }));
    res.json(formattedDoctors);
  } catch (err) {
    console.error('Get doctors error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get doctor by ID
app.get('/api/doctors/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (doctor) {
      // Format doctor to include 'id' field
      const formattedDoctor = {
        id: doctor._id.toString(),
        _id: doctor._id,
        name: doctor.name,
        specialty: doctor.specialty,
        experience: doctor.experience,
        rating: doctor.rating,
        reviews: doctor.reviews,
        consultationFee: doctor.consultationFee,
        image: doctor.image,
        bio: doctor.bio,
        education: doctor.education,
        languages: doctor.languages,
        certifications: doctor.certifications,
        availability: doctor.availability,
        userId: doctor.userId,
        createdAt: doctor.createdAt
      };
      res.json(formattedDoctor);
    } else {
      res.status(404).json({ message: 'Doctor not found' });
    }
  } catch (err) {
    console.error('Get doctor error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Consultation Routes

// Book a consultation
app.post('/api/consultations', async (req, res) => {
  const { patientName, patientEmail, patientPhone, doctorId, date, time, symptoms } = req.body;

  if (!patientName || !patientEmail || !doctorId || !date || !time) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Find patient user
    const patientUser = await User.findOne({ email: patientEmail });

    const consultation = await Consultation.create({
      doctorId: doctor._id,
      patientId: patientUser ? patientUser._id : null,
      patientName,
      patientEmail,
      patientPhone,
      doctorName: doctor.name,
      doctorSpecialty: doctor.specialty,
      consultationFee: doctor.consultationFee,
      date,
      time,
      symptoms,
      status: 'scheduled',
      paymentStatus: 'pending'
    });

    // Send notification
    if (patientUser) {
      await Notification.create({
        userId: patientUser._id,
        type: 'booking',
        title: 'Appointment Booked',
        message: `Your consultation with ${doctor.name} on ${new Date(date).toLocaleDateString()} at ${time} has been confirmed.`
      });
      
      // Send email
      const emailContent = emailTemplates.bookingConfirmation({
        patientName,
        doctorName: doctor.name,
        specialty: doctor.specialty,
        date: new Date(date).toLocaleDateString(),
        time,
        fee: doctor.consultationFee
      });
      sendEmail({
        to: patientEmail,
        subject: emailContent.subject,
        html: emailContent.html
      });
    }
    
    // Format consultation response with 'id' field
    const formattedConsultation = {
      id: consultation._id.toString(),
      ...consultation.toObject()
    };
    
    res.status(201).json(formattedConsultation);
  } catch (err) {
    console.error('Book consultation error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all consultations
app.get('/api/consultations', async (req, res) => {
  try {
    const consultations = await Consultation.find().sort({ createdAt: -1 });
    // Format consultations to include 'id' field
    const formattedConsultations = consultations.map(c => ({
      id: c._id.toString(),
      ...c.toObject()
    }));
    res.json(formattedConsultations);
  } catch (err) {
    console.error('Get consultations error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get consultation by ID
app.get('/api/consultations/:id', async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id);
    if (consultation) {
      const formattedConsultation = {
        id: consultation._id.toString(),
        ...consultation.toObject()
      };
      res.json(formattedConsultation);
    } else {
      res.status(404).json({ message: 'Consultation not found' });
    }
  } catch (err) {
    console.error('Get consultation error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update consultation status
app.patch('/api/consultations/:id', async (req, res) => {
  const { status } = req.body;
  
  try {
    const consultation = await Consultation.findById(req.params.id);
    
    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }

    const oldStatus = consultation.status;
    consultation.status = status;
    await consultation.save();
    
    // Send notifications based on status change
    const patientUser = await User.findOne({ email: consultation.patientEmail });
    
    if (status === 'cancelled' && oldStatus !== 'cancelled' && patientUser) {
      await Notification.create({
        userId: patientUser._id,
        type: 'cancellation',
        title: 'Appointment Cancelled',
        message: `Your consultation with ${consultation.doctorName} on ${new Date(consultation.date).toLocaleDateString()} has been cancelled.`
      });
      
      sendEmail(
        consultation.patientEmail,
        'Appointment Cancelled - CuraLine',
        `
          <h2>Appointment Cancelled</h2>
          <p>Dear ${consultation.patientName},</p>
          <p>Your consultation has been cancelled.</p>
          <p><strong>Doctor:</strong> ${consultation.doctorName}</p>
          <p><strong>Date:</strong> ${new Date(consultation.date).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${consultation.time}</p>
        `
      );
    } else if (status === 'completed' && oldStatus !== 'completed' && patientUser) {
      await Notification.create({
        userId: patientUser._id,
        type: 'completion',
        title: 'Appointment Completed',
        message: `Your consultation with ${consultation.doctorName} has been completed. Thank you for choosing CuraLine!`
      });
    }
    
    res.json(consultation);
  } catch (err) {
    console.error('Update consultation error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reschedule consultation
app.patch('/api/consultations/:id/reschedule', async (req, res) => {
  const { date, time } = req.body;

  if (!date || !time) {
    return res.status(400).json({ message: 'Date and time are required' });
  }

  try {
    const consultation = await Consultation.findById(req.params.id);
    
    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }

    if (consultation.status === 'cancelled') {
      return res.status(400).json({ message: 'Cannot reschedule a cancelled consultation' });
    }

    consultation.date = date;
    consultation.time = time;
    consultation.rescheduledAt = new Date();
    await consultation.save();

    // Send reschedule notification
    const patientUser = await User.findOne({ email: consultation.patientEmail });
    if (patientUser) {
      await Notification.create({
        userId: patientUser._id,
        type: 'reschedule',
        title: 'Appointment Rescheduled',
        message: `Your consultation with ${consultation.doctorName} has been rescheduled to ${new Date(date).toLocaleDateString()} at ${time}.`
      });
      
      sendEmail(
        consultation.patientEmail,
        'Appointment Rescheduled - CuraLine',
        `
          <h2>Appointment Rescheduled</h2>
          <p>Dear ${consultation.patientName},</p>
          <p>Your consultation has been rescheduled.</p>
          <p><strong>Doctor:</strong> ${consultation.doctorName}</p>
          <p><strong>New Date:</strong> ${new Date(date).toLocaleDateString()}</p>
          <p><strong>New Time:</strong> ${time}</p>
        `
      );
    }

    res.json(consultation);
  } catch (err) {
    console.error('Reschedule consultation error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Analytics endpoints
app.get('/api/analytics/stats', async (req, res) => {
  try {
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const totalDoctors = await Doctor.countDocuments();
    const totalConsultations = await Consultation.countDocuments();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayConsultations = await Consultation.countDocuments({
      createdAt: { $gte: today }
    });

    // Get weekly patients (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weeklyPatients = await User.countDocuments({
      role: 'patient',
      createdAt: { $gte: weekAgo }
    });

    // Get consultation status counts
    const scheduledCount = await Consultation.countDocuments({ status: 'scheduled' });
    const completedCount = await Consultation.countDocuments({ status: 'completed' });
    const cancelledCount = await Consultation.countDocuments({ status: 'cancelled' });

    // Format response to match frontend expectations
    res.json({
      consultations: {
        total: totalConsultations,
        today: todayConsultations,
        scheduled: scheduledCount,
        completed: completedCount,
        cancelled: cancelledCount
      },
      patients: {
        total: totalPatients,
        weekly: weeklyPatients
      },
      doctors: {
        total: totalDoctors
      },
      status: {
        scheduled: scheduledCount,
        completed: completedCount,
        cancelled: cancelledCount
      }
    });
  } catch (err) {
    console.error('Get stats error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/analytics/calendar', async (req, res) => {
  try {
    const consultations = await Consultation.find({ status: { $ne: 'cancelled' } });
    // Format consultations with id field
    const formattedConsultations = consultations.map(c => ({
      id: c._id.toString(),
      ...c.toObject()
    }));
    res.json(formattedConsultations);
  } catch (err) {
    console.error('Get calendar error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/analytics/consultations-by-date', async (req, res) => {
  const { date } = req.query;
  
  try {
    const consultations = await Consultation.find({ date });
    // Format consultations with id field
    const formattedConsultations = consultations.map(c => ({
      id: c._id.toString(),
      ...c.toObject()
    }));
    res.json(formattedConsultations);
  } catch (err) {
    console.error('Get consultations by date error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin Management Routes

// Get all users
app.get('/api/admin/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user
app.put('/api/admin/users/:id', async (req, res) => {
  const { name, email, phone, role } = req.body;

  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if email is being changed and if it's already taken
    if (email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.role = role || user.role;
    
    await user.save();

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt
    };

    res.json(userResponse);
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user
app.delete('/api/admin/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add doctor
app.post('/api/admin/doctors', async (req, res) => {
  try {
    const doctor = await Doctor.create(req.body);
    res.status(201).json(doctor);
  } catch (err) {
    console.error('Add doctor error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update doctor
app.put('/api/admin/doctors/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    res.json(doctor);
  } catch (err) {
    console.error('Update doctor error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete doctor
app.delete('/api/admin/doctors/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    res.json({ message: 'Doctor deleted successfully' });
  } catch (err) {
    console.error('Delete doctor error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Notification Endpoints

// Get notifications for a user
app.get('/api/notifications/:userId', async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.params.userId })
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    console.error('Get notifications error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark notification as read
app.patch('/api/notifications/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    notification.read = true;
    await notification.save();
    res.json(notification);
  } catch (err) {
    console.error('Mark notification read error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark all notifications as read for a user
app.patch('/api/notifications/user/:userId/read-all', async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.params.userId },
      { read: true }
    );
    
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    console.error('Mark all read error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete notification
app.delete('/api/notifications/:id', async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    res.json({ message: 'Notification deleted' });
  } catch (err) {
    console.error('Delete notification error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Payment Endpoints

// Process payment
app.post('/api/payments', async (req, res) => {
  const { consultationId, amount, method, cardDetails } = req.body;

  if (!consultationId || !amount || !method) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const consultation = await Consultation.findById(consultationId);
    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }

    const payment = await Payment.create({
      consultationId,
      amount,
      method,
      status: 'completed',
      transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      cardDetails: method === 'card' && cardDetails ? {
        last4: cardDetails.cardNumber?.slice(-4),
        brand: 'Visa'
      } : undefined
    });

    // Update consultation with payment info
    consultation.paymentId = payment._id;
    consultation.paymentStatus = 'paid';
    await consultation.save();

    res.status(201).json(payment);
  } catch (err) {
    console.error('Process payment error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get payment by consultation ID
app.get('/api/payments/consultation/:consultationId', async (req, res) => {
  try {
    const payment = await Payment.findOne({ consultationId: req.params.consultationId });
    
    if (payment) {
      res.json(payment);
    } else {
      res.status(404).json({ message: 'Payment not found' });
    }
  } catch (err) {
    console.error('Get payment error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all payments for a user
app.get('/api/payments/user/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userConsultations = await Consultation.find({ patientEmail: user.email });
    const consultationIds = userConsultations.map(c => c._id);
    const userPayments = await Payment.find({ consultationId: { $in: consultationIds } });

    res.json(userPayments);
  } catch (err) {
    console.error('Get user payments error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Prescription Endpoints

// Create prescription
app.post('/api/prescriptions', async (req, res) => {
  const { consultationId, medications, instructions, doctorId } = req.body;

  if (!consultationId || !medications || !doctorId) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const consultation = await Consultation.findById(consultationId);
    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }

    const patientUser = await User.findOne({ email: consultation.patientEmail });

    const prescription = await Prescription.create({
      consultationId,
      patientId: patientUser?._id,
      doctorId,
      patientName: consultation.patientName,
      patientEmail: consultation.patientEmail,
      doctorName: consultation.doctorName,
      medications,
      instructions
    });

    // Update consultation with prescription
    consultation.prescriptionId = prescription._id;
    await consultation.save();

    // Send notification to patient
    if (patientUser) {
      await Notification.create({
        userId: patientUser._id,
        type: 'prescription',
        title: 'Prescription Available',
        message: `Dr. ${consultation.doctorName} has issued a prescription for your consultation.`
      });
      
      // Send email notification
      const emailContent = emailTemplates.prescriptionIssued({
        patientName: consultation.patientName,
        doctorName: consultation.doctorName
      });
      sendEmail({
        to: consultation.patientEmail,
        subject: emailContent.subject,
        html: emailContent.html
      });
    }

    res.status(201).json(prescription);
  } catch (err) {
    console.error('Create prescription error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get prescriptions for a consultation
app.get('/api/prescriptions/consultation/:consultationId', async (req, res) => {
  try {
    const prescription = await Prescription.findOne({ consultationId: req.params.consultationId });
    
    if (prescription) {
      res.json(prescription);
    } else {
      res.status(404).json({ message: 'Prescription not found' });
    }
  } catch (err) {
    console.error('Get prescription error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all prescriptions for a user
app.get('/api/prescriptions/user/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userPrescriptions = await Prescription.find({ patientEmail: user.email });
    res.json(userPrescriptions);
  } catch (err) {
    console.error('Get user prescriptions error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update prescription
app.put('/api/prescriptions/:id', async (req, res) => {
  const { medications, instructions } = req.body;

  try {
    const prescription = await Prescription.findById(req.params.id);
    
    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    prescription.medications = medications || prescription.medications;
    prescription.instructions = instructions || prescription.instructions;
    prescription.updatedAt = new Date();
    await prescription.save();

    res.json(prescription);
  } catch (err) {
    console.error('Update prescription error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Consultation Room Endpoints (Video Call & Chat)

// Get messages for a consultation
app.get('/api/consultation-room/:consultationId/messages', async (req, res) => {
  try {
    const messages = await Message.find({ consultationId: req.params.consultationId })
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    console.error('Get messages error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send message in consultation room
app.post('/api/consultation-room/:consultationId/messages', async (req, res) => {
  const { senderId, senderName, message } = req.body;

  if (!senderId || !senderName || !message) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const newMessage = await Message.create({
      consultationId: req.params.consultationId,
      senderId,
      senderName,
      message
    });

    res.status(201).json(newMessage);
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start consultation
app.patch('/api/consultation-room/:consultationId/start', async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.consultationId);

    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }

    consultation.status = 'in-progress';
    consultation.startedAt = new Date();
    await consultation.save();

    res.json(consultation);
  } catch (err) {
    console.error('Start consultation error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'E-Health API with MongoDB is running' });
});

// ==================== DAILY CONSULTATION RESET & ANALYTICS ====================

// Function to archive completed consultations and update analytics
async function archiveAndResetConsultations() {
  try {
    console.log('🔄 Starting daily consultation archive and reset...');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Get all consultations from yesterday
    const yesterdayConsultations = await Consultation.find({
      createdAt: { $gte: yesterday, $lt: today }
    });
    
    console.log(`📊 Found ${yesterdayConsultations.length} consultations from yesterday`);
    
    // Archive each consultation to history
    for (const consultation of yesterdayConsultations) {
      await ConsultationHistory.create({
        originalConsultationId: consultation._id,
        doctorId: consultation.doctorId,
        patientId: consultation.patientId,
        patientName: consultation.patientName,
        patientEmail: consultation.patientEmail,
        patientPhone: consultation.patientPhone,
        doctorName: consultation.doctorName,
        doctorSpecialty: consultation.doctorSpecialty,
        consultationFee: consultation.consultationFee,
        date: consultation.date,
        time: consultation.time,
        symptoms: consultation.symptoms,
        status: consultation.status,
        paymentStatus: consultation.paymentStatus,
        paymentId: consultation.paymentId,
        prescriptionId: consultation.prescriptionId,
        startedAt: consultation.startedAt,
        completedAt: consultation.status === 'completed' ? new Date() : null,
        originalCreatedAt: consultation.createdAt
      });
    }
    
    // Generate analytics for yesterday
    await generateDailyAnalytics(yesterday);
    
    // Delete yesterday's consultations from main collection
    await Consultation.deleteMany({
      createdAt: { $gte: yesterday, $lt: today }
    });
    
    console.log('✅ Daily consultation archive and reset completed');
  } catch (err) {
    console.error('❌ Error in daily consultation reset:', err);
  }
}

// Function to generate daily analytics
async function generateDailyAnalytics(date) {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    // Get consultations for the day
    const consultations = await ConsultationHistory.find({
      originalCreatedAt: { $gte: startOfDay, $lte: endOfDay }
    });
    
    // Get payments for the day
    const payments = await Payment.find({
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });
    
    // Calculate metrics
    const totalConsultations = consultations.length;
    const completedConsultations = consultations.filter(c => c.status === 'completed').length;
    const cancelledConsultations = consultations.filter(c => c.status === 'cancelled').length;
    const scheduledConsultations = consultations.filter(c => c.status === 'scheduled').length;
    
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
    const avgRevenue = totalConsultations > 0 ? totalRevenue / totalConsultations : 0;
    
    // Get unique patients
    const uniquePatientEmails = [...new Set(consultations.map(c => c.patientEmail))];
    const newPatients = uniquePatientEmails.length;
    
    // Get active doctors
    const uniqueDoctorIds = [...new Set(consultations.map(c => c.doctorId.toString()))];
    
    // Payment breakdown
    const paymentBreakdown = {
      card: payments.filter(p => p.method === 'card').length,
      gcash: payments.filter(p => p.method === 'gcash').length,
      paymaya: payments.filter(p => p.method === 'paymaya').length,
      cash: payments.filter(p => p.method === 'cash').length
    };
    
    // Specialty breakdown
    const specialtyMap = {};
    consultations.forEach(c => {
      if (!specialtyMap[c.doctorSpecialty]) {
        specialtyMap[c.doctorSpecialty] = { count: 0, revenue: 0 };
      }
      specialtyMap[c.doctorSpecialty].count++;
      specialtyMap[c.doctorSpecialty].revenue += c.consultationFee;
    });
    
    const specialtyBreakdown = Object.keys(specialtyMap).map(specialty => ({
      specialty,
      count: specialtyMap[specialty].count,
      revenue: specialtyMap[specialty].revenue
    }));
    
    // Top doctors
    const doctorMap = {};
    consultations.forEach(c => {
      const docId = c.doctorId.toString();
      if (!doctorMap[docId]) {
        doctorMap[docId] = {
          doctorId: c.doctorId,
          doctorName: c.doctorName,
          consultationCount: 0,
          revenue: 0
        };
      }
      doctorMap[docId].consultationCount++;
      doctorMap[docId].revenue += c.consultationFee;
    });
    
    const topDoctors = Object.values(doctorMap)
      .sort((a, b) => b.consultationCount - a.consultationCount)
      .slice(0, 10);
    
    // Create or update analytics record
    await Analytics.findOneAndUpdate(
      { date: startOfDay, period: 'daily' },
      {
        consultations: {
          total: totalConsultations,
          completed: completedConsultations,
          cancelled: cancelledConsultations,
          scheduled: scheduledConsultations
        },
        revenue: {
          total: totalRevenue,
          consultationFees: totalRevenue,
          averagePerConsultation: avgRevenue
        },
        patients: {
          new: newPatients,
          returning: 0,
          total: newPatients
        },
        doctors: {
          active: uniqueDoctorIds.length,
          totalConsultations: totalConsultations
        },
        payments: {
          total: payments.length,
          byMethod: paymentBreakdown
        },
        specialtyBreakdown,
        topDoctors
      },
      { upsert: true, new: true }
    );
    
    console.log(`📈 Analytics generated for ${date.toDateString()}`);
  } catch (err) {
    console.error('Error generating daily analytics:', err);
  }
}

// Schedule daily reset at midnight
function scheduleDailyReset() {
  const now = new Date();
  const night = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1, // Next day
    0, 0, 0 // At midnight
  );
  const msToMidnight = night.getTime() - now.getTime();
  
  setTimeout(() => {
    archiveAndResetConsultations();
    // Schedule next reset
    setInterval(archiveAndResetConsultations, 24 * 60 * 60 * 1000); // Every 24 hours
  }, msToMidnight);
  
  console.log(`⏰ Daily consultation reset scheduled for midnight (in ${Math.round(msToMidnight / 1000 / 60)} minutes)`);
}

// ==================== ANALYTICS ENDPOINTS ====================

// HIGH PRIORITY ANALYTICS

// Get consultation statistics (daily, weekly, monthly, yearly)
app.get('/api/analytics/consultations', async (req, res) => {
  try {
    const { period = 'daily', startDate, endDate } = req.query;
    
    let query = { period };
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const analytics = await Analytics.find(query).sort({ date: -1 }).limit(100);
    
    // Also get current day stats from active consultations
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayConsultations = await Consultation.find({
      createdAt: { $gte: today }
    });
    
    const currentDayStats = {
      total: todayConsultations.length,
      completed: todayConsultations.filter(c => c.status === 'completed').length,
      cancelled: todayConsultations.filter(c => c.status === 'cancelled').length,
      scheduled: todayConsultations.filter(c => c.status === 'scheduled').length,
      inProgress: todayConsultations.filter(c => c.status === 'in-progress').length
    };
    
    res.json({
      historical: analytics,
      currentDay: currentDayStats
    });
  } catch (err) {
    console.error('Get consultation analytics error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get revenue analytics
app.get('/api/analytics/revenue', async (req, res) => {
  try {
    const { period = 'daily', startDate, endDate } = req.query;
    
    let query = { period };
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const analytics = await Analytics.find(query).sort({ date: -1 }).limit(100);
    
    const revenueData = analytics.map(a => ({
      date: a.date,
      total: a.revenue.total,
      consultationFees: a.revenue.consultationFees,
      average: a.revenue.averagePerConsultation,
      consultationCount: a.consultations.total
    }));
    
    const totalRevenue = revenueData.reduce((sum, r) => sum + r.total, 0);
    const avgRevenue = revenueData.length > 0 ? totalRevenue / revenueData.length : 0;
    
    res.json({
      data: revenueData,
      summary: {
        total: totalRevenue,
        average: avgRevenue,
        period: period
      }
    });
  } catch (err) {
    console.error('Get revenue analytics error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get patient analytics
app.get('/api/analytics/patients', async (req, res) => {
  try {
    const { period = 'daily' } = req.query;
    
    const analytics = await Analytics.find({ period }).sort({ date: -1 }).limit(30);
    
    const patientData = analytics.map(a => ({
      date: a.date,
      new: a.patients.new,
      returning: a.patients.returning,
      total: a.patients.total
    }));
    
    // Get total unique patients from history
    const allPatients = await ConsultationHistory.distinct('patientEmail');
    const totalPatients = allPatients.length;
    
    res.json({
      data: patientData,
      summary: {
        totalUnique: totalPatients,
        period: period
      }
    });
  } catch (err) {
    console.error('Get patient analytics error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// MEDIUM PRIORITY ANALYTICS

// Get payroll data
app.get('/api/analytics/payroll', async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (startDate && endDate) {
      query['period.start'] = { $gte: new Date(startDate) };
      query['period.end'] = { $lte: new Date(endDate) };
    }
    
    const payrolls = await Payroll.find(query).sort({ 'period.end': -1 });
    
    const totalPayroll = payrolls.reduce((sum, p) => sum + p.netPay, 0);
    const totalRevenue = payrolls.reduce((sum, p) => sum + p.totalRevenue, 0);
    
    res.json({
      payrolls,
      summary: {
        totalPayroll,
        totalRevenue,
        count: payrolls.length
      }
    });
  } catch (err) {
    console.error('Get payroll error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create payroll
app.post('/api/analytics/payroll', async (req, res) => {
  try {
    const { doctorId, periodStart, periodEnd, commissionRate = 70 } = req.body;
    
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    // Get consultations for the period
    const consultations = await ConsultationHistory.find({
      doctorId,
      originalCreatedAt: {
        $gte: new Date(periodStart),
        $lte: new Date(periodEnd)
      },
      status: 'completed',
      paymentStatus: 'paid'
    });
    
    const consultationsCount = consultations.length;
    const totalRevenue = consultations.reduce((sum, c) => sum + c.consultationFee, 0);
    const commission = (totalRevenue * commissionRate) / 100;
    const netPay = commission;
    
    const payroll = await Payroll.create({
      doctorId,
      doctorName: doctor.name,
      period: {
        start: new Date(periodStart),
        end: new Date(periodEnd)
      },
      consultationsCount,
      totalRevenue,
      commission,
      commissionRate,
      netPay,
      status: 'pending'
    });
    
    res.status(201).json(payroll);
  } catch (err) {
    console.error('Create payroll error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update payroll status
app.patch('/api/analytics/payroll/:id', async (req, res) => {
  try {
    const { status, paymentDate, notes } = req.body;
    
    const payroll = await Payroll.findById(req.params.id);
    if (!payroll) {
      return res.status(404).json({ message: 'Payroll not found' });
    }
    
    if (status) payroll.status = status;
    if (paymentDate) payroll.paymentDate = new Date(paymentDate);
    if (notes) payroll.notes = notes;
    
    await payroll.save();
    res.json(payroll);
  } catch (err) {
    console.error('Update payroll error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get expenses
app.get('/api/analytics/expenses', async (req, res) => {
  try {
    const { category, status, startDate, endDate } = req.query;
    
    let query = {};
    if (category) query.category = category;
    if (status) query.status = status;
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const expenses = await Expense.find(query).sort({ date: -1 });
    
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const byCategory = {};
    expenses.forEach(e => {
      byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
    });
    
    res.json({
      expenses,
      summary: {
        total: totalExpenses,
        byCategory,
        count: expenses.length
      }
    });
  } catch (err) {
    console.error('Get expenses error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create expense
app.post('/api/analytics/expenses', async (req, res) => {
  try {
    const expense = await Expense.create(req.body);
    res.status(201).json(expense);
  } catch (err) {
    console.error('Create expense error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update expense
app.put('/api/analytics/expenses/:id', async (req, res) => {
  try {
    const expense = await Expense.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    res.json(expense);
  } catch (err) {
    console.error('Update expense error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete expense
app.delete('/api/analytics/expenses/:id', async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    res.json({ message: 'Expense deleted successfully' });
  } catch (err) {
    console.error('Delete expense error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get doctor performance
app.get('/api/analytics/doctor-performance', async (req, res) => {
  try {
    const { period = 'daily', limit = 10 } = req.query;
    
    const analytics = await Analytics.find({ period })
      .sort({ date: -1 })
      .limit(1);
    
    if (analytics.length === 0) {
      return res.json({ topDoctors: [] });
    }
    
    res.json({
      topDoctors: analytics[0].topDoctors.slice(0, parseInt(limit)),
      date: analytics[0].date
    });
  } catch (err) {
    console.error('Get doctor performance error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// LOW PRIORITY ANALYTICS

// Get specialty breakdown
app.get('/api/analytics/specialties', async (req, res) => {
  try {
    const { period = 'daily' } = req.query;
    
    const analytics = await Analytics.find({ period })
      .sort({ date: -1 })
      .limit(1);
    
    if (analytics.length === 0) {
      return res.json({ specialties: [] });
    }
    
    res.json({
      specialties: analytics[0].specialtyBreakdown,
      date: analytics[0].date
    });
  } catch (err) {
    console.error('Get specialty analytics error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get payment method breakdown
app.get('/api/analytics/payment-methods', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let query = { period: 'daily' };
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const analytics = await Analytics.find(query).sort({ date: -1 });
    
    const aggregated = {
      card: 0,
      gcash: 0,
      paymaya: 0,
      cash: 0
    };
    
    analytics.forEach(a => {
      aggregated.card += a.payments.byMethod.card;
      aggregated.gcash += a.payments.byMethod.gcash;
      aggregated.paymaya += a.payments.byMethod.paymaya;
      aggregated.cash += a.payments.byMethod.cash;
    });
    
    res.json({
      paymentMethods: aggregated,
      total: Object.values(aggregated).reduce((sum, val) => sum + val, 0)
    });
  } catch (err) {
    console.error('Get payment methods error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get consultation history (archived consultations)
app.get('/api/analytics/consultation-history', async (req, res) => {
  try {
    const { patientEmail, doctorId, startDate, endDate, status } = req.query;
    
    let query = {};
    if (patientEmail) query.patientEmail = patientEmail;
    if (doctorId) query.doctorId = doctorId;
    if (status) query.status = status;
    if (startDate && endDate) {
      query.originalCreatedAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const history = await ConsultationHistory.find(query)
      .sort({ originalCreatedAt: -1 })
      .limit(100);
    
    res.json(history);
  } catch (err) {
    console.error('Get consultation history error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get comprehensive dashboard stats
app.get('/api/analytics/dashboard', async (req, res) => {
  try {
    // Get today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayConsultations = await Consultation.countDocuments({
      createdAt: { $gte: today }
    });
    
    // Get this week's analytics
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const weekAnalytics = await Analytics.find({
      period: 'daily',
      date: { $gte: weekAgo }
    });
    
    const weeklyConsultations = weekAnalytics.reduce((sum, a) => sum + a.consultations.total, 0);
    const weeklyRevenue = weekAnalytics.reduce((sum, a) => sum + a.revenue.total, 0);
    
    // Get this month's analytics
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    
    const monthAnalytics = await Analytics.find({
      period: 'daily',
      date: { $gte: monthAgo }
    });
    
    const monthlyConsultations = monthAnalytics.reduce((sum, a) => sum + a.consultations.total, 0);
    const monthlyRevenue = monthAnalytics.reduce((sum, a) => sum + a.revenue.total, 0);
    
    // Get yearly stats
    const yearAgo = new Date();
    yearAgo.setFullYear(yearAgo.getFullYear() - 1);
    
    const yearAnalytics = await Analytics.find({
      period: 'daily',
      date: { $gte: yearAgo }
    });
    
    const yearlyConsultations = yearAnalytics.reduce((sum, a) => sum + a.consultations.total, 0);
    const yearlyRevenue = yearAnalytics.reduce((sum, a) => sum + a.revenue.total, 0);
    
    // Get total patients and doctors
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const totalDoctors = await Doctor.countDocuments();
    
    // Get pending payrolls
    const pendingPayrolls = await Payroll.countDocuments({ status: 'pending' });
    
    // Get this month's expenses
    const monthExpenses = await Expense.find({
      date: { $gte: monthAgo }
    });
    const monthlyExpenses = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
    
    res.json({
      today: {
        consultations: todayConsultations
      },
      week: {
        consultations: weeklyConsultations,
        revenue: weeklyRevenue
      },
      month: {
        consultations: monthlyConsultations,
        revenue: monthlyRevenue,
        expenses: monthlyExpenses,
        netProfit: monthlyRevenue - monthlyExpenses
      },
      year: {
        consultations: yearlyConsultations,
        revenue: yearlyRevenue
      },
      totals: {
        patients: totalPatients,
        doctors: totalDoctors,
        pendingPayrolls
      }
    });
  } catch (err) {
    console.error('Get dashboard stats error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Serve static files from React build in production
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  
  // Serve static files
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  // Handle React routing - return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 Using MongoDB database`);
  console.log(`🔌 Socket.io server ready for WebRTC signaling`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Start the daily reset scheduler
  scheduleDailyReset();
});
