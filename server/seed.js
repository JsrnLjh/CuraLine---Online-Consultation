const mongoose = require('mongoose');
const connectDB = require('./config/database');
const User = require('./models/User');
const Doctor = require('./models/Doctor');

const seedDatabase = async () => {
  try {
    await connectDB();

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

    // Create individual user accounts for each doctor
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

    console.log('✅ Created user accounts for all doctors');

    // Create doctor profiles linked to user accounts
    const doctors = [
      {
        name: 'Dr. Sarah Johnson',
        specialty: 'General Practitioner',
        experience: '10 years',
        rating: 4.8,
        reviews: 156,
        consultationFee: 500,
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
        bio: 'Experienced General Practitioner with a focus on preventive care and family medicine. Committed to providing compassionate, patient-centered healthcare.',
        education: 'MD - University of the Philippines, Residency - Philippine General Hospital',
        languages: ['English', 'Filipino', 'Tagalog'],
        certifications: ['Board Certified in Family Medicine', 'Advanced Cardiac Life Support (ACLS)', 'Pediatric Advanced Life Support (PALS)'],
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
        bio: 'Renowned Cardiologist specializing in interventional cardiology and heart disease prevention. Published researcher in cardiovascular medicine.',
        education: 'MD - Ateneo School of Medicine, Fellowship - Johns Hopkins Hospital',
        languages: ['English', 'Mandarin', 'Filipino'],
        certifications: ['Board Certified in Cardiology', 'Fellow of the American College of Cardiology', 'Interventional Cardiology Certification'],
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
        bio: 'Board-certified Dermatologist with expertise in medical, surgical, and cosmetic dermatology. Passionate about skin health and aesthetic treatments.',
        education: 'MD - University of Santo Tomas, Dermatology Residency - St. Luke\'s Medical Center',
        languages: ['English', 'Spanish', 'Filipino'],
        certifications: ['Board Certified in Dermatology', 'Cosmetic Dermatology Certificate', 'Laser Surgery Certification'],
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
        bio: 'Dedicated Pediatrician committed to providing comprehensive healthcare for children from infancy through adolescence.',
        education: 'MD - Far Eastern University, Residency - Philippine Children\'s Medical Center',
        languages: ['English', 'Filipino'],
        certifications: ['Board Certified in Pediatrics', 'Pediatric Advanced Life Support (PALS)', 'Neonatal Resuscitation Program (NRP)'],
        availability: ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'],
        userId: drJamesUser._id
      }
    ];

    await Doctor.insertMany(doctors);

    console.log('✅ Created doctor profiles');
    console.log('\n📝 Login Credentials:');
    console.log('\n👑 Admin Account (Full Access):');
    console.log('   System Administrator: admin@curaline.com / admin123');
    console.log('\n👨‍⚕️ Doctor Accounts (Doctor Dashboard Only):');
    console.log('   Dr. Sarah Johnson: sarah.johnson@curaline.com / sarah123');
    console.log('   Dr. Michael Chen: michael.chen@curaline.com / michael123');
    console.log('   Dr. Emily Rodriguez: emily.rodriguez@curaline.com / emily123');
    console.log('   Dr. James Anderson: james.anderson@curaline.com / james123');
    console.log('\n👤 Patient Account:');
    console.log('   Test Patient: patient@example.com / patient123');
    console.log('\n✅ Database seeded successfully!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
