// Quick test to check if server starts without errors
console.log('Testing server startup...\n');

try {
  // Test email service
  console.log('1. Testing email service import...');
  const emailService = require('./server/services/emailService');
  console.log('   ✅ Email service loaded');
  
  // Test socket service
  console.log('2. Testing socket service import...');
  const socketService = require('./server/services/socketService');
  console.log('   ✅ Socket service loaded');
  
  // Test if nodemailer is available
  console.log('3. Testing nodemailer...');
  const nodemailer = require('nodemailer');
  console.log('   ✅ Nodemailer available');
  
  // Test if socket.io is available
  console.log('4. Testing socket.io...');
  const socketIo = require('socket.io');
  console.log('   ✅ Socket.io available');
  
  console.log('\n✅ All imports successful! Server should start without errors.\n');
  
} catch (error) {
  console.error('\n❌ Error found:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}
