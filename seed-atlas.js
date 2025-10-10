const mongoose = require('mongoose');
const User = require('./server/models/User');
const Doctor = require('./server/models/Doctor');

// MongoDB Atlas connection string
const MONGODB_URI = 'mongodb+srv://jasarenoelijah_db_user:mOVEYesO6tDV51CM@curaline.dvthh8z.mongodb.net/curaline?retryWrites=true&w=majority&appName=Curaline';

const seedDatabase = async () => {
  try {
    console.log('🔌 Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    
    console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);
    console.log(`📊 Database: ${mongoose.connection.name}`);

    // Clear existing data
    await User.deleteMany({});
    await Doctor.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create admin account
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@curaline.com',
      phone: '+63-917-000-0000',
      password: 'admin123',
      role: 'admin'
    });

    // Create test patient
    const testPatient = await User.create({
      name: 'Test Patient',
      email: 'patient@example.com',
      phone: '+0987654321',
      password: 'patient123',
      role: 'patient'
    });

    // Create doctor user accounts
    const drSarahUser = await User.create({
      name: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@curaline.com',
      phone: '+63-917-123-4567',
      password: 'sarah123',
      role: 'doctor'
    });

    const drMichaelUser = await User.create({
      name: 'Dr. Michael Chen',
      email: 'michael.chen@curaline.com',
      phone: '+63-917-234-5678',
      password: 'michael123',
      role: 'doctor'
    });

    const drEmilyUser = await User.create({
      name: 'Dr. Emily Rodriguez',
      email: 'emily.rodriguez@curaline.com',
      phone: '+63-917-345-6789',
      password: 'emily123',
      role: 'doctor'
    });

    const drJamesUser = await User.create({
      name: 'Dr. James Anderson',
      email: 'james.anderson@curaline.com',
      phone: '+63-917-456-7890',
      password: 'james123',
      role: 'doctor'
    });

    console.log('✅ Created user accounts');

    // Create doctor profiles
    const doctors = [
      {
        name: 'Dr. Sarah Johnson',
        specialty: 'General Practitioner',
        experience: '10 years',
        rating: 4.8,
        reviews: 156,
        consultationFee: 500,
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
        bio: 'Experienced General Practitioner with a focus on preventive care and family medicine.',
        education: 'MD - University of the Philippines, Residency - Philippine General Hospital',
        languages: ['English', 'Filipino', 'Tagalog'],
        certifications: ['Board Certified in Family Medicine', 'ACLS', 'PALS'],
        availability: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
        userId: drSarahUser._id
      },
      {
        name: 'Dr. Michael Chen',
        specialty: 'Cardiologist',
        experience: '15 years',
        rating: 4.9,
        reviews: 203,
        consultationFee: 800,
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
        bio: 'Renowned Cardiologist specializing in interventional cardiology and heart disease prevention.',
        education: 'MD - Ateneo School of Medicine, Fellowship - Johns Hopkins Hospital',
        languages: ['English', 'Mandarin', 'Filipino'],
        certifications: ['Board Certified in Cardiology', 'Fellow of ACC', 'Interventional Cardiology'],
        availability: ['09:00', '10:00', '13:00', '14:00', '15:00'],
        userId: drMichaelUser._id
      },
      {
        name: 'Dr. Emily Rodriguez',
        specialty: 'Dermatologist',
        experience: '8 years',
        rating: 4.7,
        reviews: 128,
        consultationFee: 600,
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
        bio: 'Board-certified Dermatologist with expertise in medical, surgical, and cosmetic dermatology.',
        education: 'MD - University of Santo Tomas, Dermatology Residency - St. Luke\'s Medical Center',
        languages: ['English', 'Spanish', 'Filipino'],
        certifications: ['Board Certified in Dermatology', 'Cosmetic Dermatology', 'Laser Surgery'],
        availability: ['10:00', '11:00', '13:00', '14:00', '15:00', '16:00'],
        userId: drEmilyUser._id
      },
      {
        name: 'Dr. James Anderson',
        specialty: 'Pediatrician',
        experience: '12 years',
        rating: 4.9,
        reviews: 187,
        consultationFee: 550,
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
        bio: 'Dedicated Pediatrician committed to providing comprehensive healthcare for children.',
        education: 'MD - Far Eastern University, Residency - Philippine Children\'s Medical Center',
        languages: ['English', 'Filipino'],
        certifications: ['Board Certified in Pediatrics', 'PALS', 'NRP'],
        availability: ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'],
        userId: drJamesUser._id
      }
    ];

    await Doctor.insertMany(doctors);
    console.log('✅ Created doctor profiles');

    // Verify
    const doctorCount = await Doctor.countDocuments();
    const userCount = await User.countDocuments();
    
    console.log(`\n📊 Verification:`);
    console.log(`   Users created: ${userCount}`);
    console.log(`   Doctors created: ${doctorCount}`);

    console.log('\n📝 Login Credentials:');
    console.log('\n👑 Admin: admin@curaline.com / admin123');
    console.log('👤 Patient: patient@example.com / patient123');
    console.log('👨‍⚕️ Doctor: sarah.johnson@curaline.com / sarah123');
    console.log('\n✅ MongoDB Atlas seeded successfully!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

seedDatabase();
