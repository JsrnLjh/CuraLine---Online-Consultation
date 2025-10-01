const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// In-memory data storage (replace with database in production)
const doctors = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    specialty: 'General Practitioner',
    experience: '10 years',
    rating: 4.8,
    availability: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'
  },
  {
    id: '2',
    name: 'Dr. Michael Chen',
    specialty: 'Cardiologist',
    experience: '15 years',
    rating: 4.9,
    availability: ['10:00', '11:00', '14:00', '15:00'],
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael'
  },
  {
    id: '3',
    name: 'Dr. Emily Rodriguez',
    specialty: 'Dermatologist',
    experience: '8 years',
    rating: 4.7,
    availability: ['09:00', '10:00', '13:00', '14:00', '16:00'],
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily'
  },
  {
    id: '4',
    name: 'Dr. James Wilson',
    specialty: 'Pediatrician',
    experience: '12 years',
    rating: 4.9,
    availability: ['09:00', '11:00', '14:00', '15:00', '16:00'],
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James'
  }
];

const consultations = [];
const patients = [];
const users = [
  // Default test accounts
  {
    id: 'admin-001',
    name: 'Admin Doctor',
    email: 'admin@example.com',
    phone: '+1234567890',
    password: 'admin123',
    role: 'doctor',
    createdAt: new Date().toISOString()
  },
  {
    id: 'patient-001',
    name: 'Test Patient',
    email: 'patient@example.com',
    phone: '+0987654321',
    password: 'patient123',
    role: 'patient',
    createdAt: new Date().toISOString()
  }
]; // Store registered users

// Authentication Routes

// Register new user
app.post('/api/auth/register', (req, res) => {
  const { name, email, phone, password, role } = req.body;

  // Validate required fields
  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // Check if user already exists
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ message: 'Email already registered' });
  }

  // Create new user
  const user = {
    id: uuidv4(),
    name,
    email,
    phone,
    password, // In production, hash this password!
    role, // 'patient' or 'doctor'
    createdAt: new Date().toISOString()
  };

  users.push(user);

  // Return user without password
  const { password: _, ...userWithoutPassword } = user;
  res.status(201).json({ 
    message: 'Registration successful',
    user: userWithoutPassword 
  });
});

// Login user
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  // Validate required fields
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  // Find user
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  // Return user without password
  const { password: _, ...userWithoutPassword } = user;
  res.json({ 
    message: 'Login successful',
    user: userWithoutPassword 
  });
});

// Get current user
app.get('/api/auth/me', (req, res) => {
  // In production, verify JWT token from headers
  const userId = req.headers['x-user-id'];
  
  if (!userId) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const user = users.find(u => u.id === userId);
  
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const { password: _, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

// Routes

// Get all doctors
app.get('/api/doctors', (req, res) => {
  res.json(doctors);
});

// Get doctor by ID
app.get('/api/doctors/:id', (req, res) => {
  const doctor = doctors.find(d => d.id === req.params.id);
  if (doctor) {
    res.json(doctor);
  } else {
    res.status(404).json({ message: 'Doctor not found' });
  }
});

// Book a consultation
app.post('/api/consultations', (req, res) => {
  const { patientName, patientEmail, patientPhone, doctorId, date, time, symptoms } = req.body;

  if (!patientName || !patientEmail || !doctorId || !date || !time) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const doctor = doctors.find(d => d.id === doctorId);
  if (!doctor) {
    return res.status(404).json({ message: 'Doctor not found' });
  }

  const consultation = {
    id: uuidv4(),
    patientName,
    patientEmail,
    patientPhone,
    doctorId,
    doctorName: doctor.name,
    doctorSpecialty: doctor.specialty,
    date,
    time,
    symptoms,
    status: 'scheduled',
    createdAt: new Date().toISOString()
  };

  consultations.push(consultation);
  res.status(201).json(consultation);
});

// Get all consultations
app.get('/api/consultations', (req, res) => {
  res.json(consultations);
});

// Get consultation by ID
app.get('/api/consultations/:id', (req, res) => {
  const consultation = consultations.find(c => c.id === req.params.id);
  if (consultation) {
    res.json(consultation);
  } else {
    res.status(404).json({ message: 'Consultation not found' });
  }
});

// Update consultation status
app.patch('/api/consultations/:id', (req, res) => {
  const { status } = req.body;
  const consultation = consultations.find(c => c.id === req.params.id);
  
  if (consultation) {
    consultation.status = status;
    res.json(consultation);
  } else {
    res.status(404).json({ message: 'Consultation not found' });
  }
});

// Analytics endpoints

// Get dashboard statistics
app.get('/api/analytics/stats', (req, res) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  const yearAgo = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);

  // Count consultations by period
  const todayConsultations = consultations.filter(c => 
    new Date(c.createdAt) >= today
  ).length;

  const weekConsultations = consultations.filter(c => 
    new Date(c.createdAt) >= weekAgo
  ).length;

  const monthConsultations = consultations.filter(c => 
    new Date(c.createdAt) >= monthAgo
  ).length;

  const yearConsultations = consultations.filter(c => 
    new Date(c.createdAt) >= yearAgo
  ).length;

  // Get unique patients
  const uniquePatients = new Set(consultations.map(c => c.patientEmail));
  const weeklyPatients = new Set(
    consultations
      .filter(c => new Date(c.createdAt) >= weekAgo)
      .map(c => c.patientEmail)
  );

  // Count by status
  const scheduled = consultations.filter(c => c.status === 'scheduled').length;
  const completed = consultations.filter(c => c.status === 'completed').length;
  const cancelled = consultations.filter(c => c.status === 'cancelled').length;

  // Consultations by doctor
  const byDoctor = doctors.map(doctor => ({
    doctorName: doctor.name,
    count: consultations.filter(c => c.doctorId === doctor.id).length
  }));

  // Consultations by specialty
  const specialties = {};
  consultations.forEach(c => {
    if (!specialties[c.doctorSpecialty]) {
      specialties[c.doctorSpecialty] = 0;
    }
    specialties[c.doctorSpecialty]++;
  });

  res.json({
    consultations: {
      today: todayConsultations,
      week: weekConsultations,
      month: monthConsultations,
      year: yearConsultations,
      total: consultations.length
    },
    patients: {
      total: uniquePatients.size,
      weekly: weeklyPatients.size
    },
    status: {
      scheduled,
      completed,
      cancelled
    },
    byDoctor,
    bySpecialty: Object.entries(specialties).map(([specialty, count]) => ({
      specialty,
      count
    })),
    doctors: {
      total: doctors.length
    }
  });
});

// Get calendar events (all scheduled consultations)
app.get('/api/analytics/calendar', (req, res) => {
  const events = consultations.map(c => ({
    id: c.id,
    title: `${c.patientName} - ${c.doctorName}`,
    date: c.date,
    time: c.time,
    doctorId: c.doctorId,
    doctorName: c.doctorName,
    patientName: c.patientName,
    status: c.status,
    specialty: c.doctorSpecialty
  }));

  res.json(events);
});

// Get consultations by date range
app.get('/api/analytics/consultations-by-date', (req, res) => {
  const { startDate, endDate } = req.query;
  
  let filtered = consultations;
  
  if (startDate) {
    filtered = filtered.filter(c => new Date(c.date) >= new Date(startDate));
  }
  
  if (endDate) {
    filtered = filtered.filter(c => new Date(c.date) <= new Date(endDate));
  }

  // Group by date
  const byDate = {};
  filtered.forEach(c => {
    if (!byDate[c.date]) {
      byDate[c.date] = 0;
    }
    byDate[c.date]++;
  });

  res.json(
    Object.entries(byDate)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
  );
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'E-Health API is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
