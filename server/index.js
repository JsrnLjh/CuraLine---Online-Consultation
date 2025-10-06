const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const connectDB = require('./config/database');

// Import models
const User = require('./models/User');
const Doctor = require('./models/Doctor');
const Consultation = require('./models/Consultation');
const Notification = require('./models/Notification');
const Payment = require('./models/Payment');
const Prescription = require('./models/Prescription');
const Message = require('./models/Message');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

app.use(cors());
app.use(bodyParser.json());

// Helper function to send email (simulated)
async function sendEmail(to, subject, html) {
  console.log('📧 Email sent to:', to);
  console.log('Subject:', subject);
  console.log('Content:', html);
  return { success: true, messageId: `msg-${Date.now()}` };
}

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
      sendEmail(
        patientEmail,
        'Appointment Confirmation - CuraLine',
        `
          <h2>Appointment Confirmed</h2>
          <p>Dear ${patientName},</p>
          <p>Your consultation has been successfully booked.</p>
          <p><strong>Doctor:</strong> ${doctor.name}</p>
          <p><strong>Specialty:</strong> ${doctor.specialty}</p>
          <p><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${time}</p>
          <p><strong>Fee:</strong> ₱${doctor.consultationFee}</p>
          <p>Thank you for choosing CuraLine!</p>
        `
      );
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

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 Using MongoDB database`);
});
