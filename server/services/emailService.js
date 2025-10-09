const nodemailer = require('nodemailer');

/**
 * Email Service using Nodemailer
 * Supports Gmail, SendGrid, and other SMTP providers
 */

// Create transporter based on environment variables
const createTransporter = () => {
  const emailProvider = process.env.EMAIL_PROVIDER || 'gmail';

  if (emailProvider === 'gmail') {
    // Gmail configuration
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD // Use App Password for Gmail
      }
    });
  } else if (emailProvider === 'sendgrid') {
    // SendGrid configuration
    return nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
      }
    });
  } else if (emailProvider === 'smtp') {
    // Custom SMTP configuration
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });
  } else {
    // Fallback to console logging if no provider configured
    console.warn('⚠️  No email provider configured. Emails will be logged to console.');
    return null;
  }
};

let transporter = null;

// Initialize transporter
const initializeEmailService = () => {
  try {
    transporter = createTransporter();
    if (transporter) {
      console.log('✅ Email service initialized');
    } else {
      console.log('📧 Email service running in simulation mode');
    }
  } catch (error) {
    console.error('❌ Email service initialization failed:', error.message);
    transporter = null;
  }
};

/**
 * Send email function
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} options.text - Plain text content (optional)
 */
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    // If no transporter, simulate email
    if (!transporter) {
      console.log('\n📧 ========== SIMULATED EMAIL ==========');
      console.log('To:', to);
      console.log('Subject:', subject);
      console.log('Content:', text || html);
      console.log('========================================\n');
      return { success: true, messageId: `simulated-${Date.now()}`, simulated: true };
    }

    // Send real email
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'CuraLine'}" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, '') // Strip HTML for text version
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId, simulated: false };
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    
    // Fallback to console logging
    console.log('\n📧 ========== EMAIL (Failed to send) ==========');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('Error:', error.message);
    console.log('==============================================\n');
    
    return { success: false, error: error.message, simulated: true };
  }
};

/**
 * Email Templates
 */

const emailTemplates = {
  // Booking confirmation email
  bookingConfirmation: (data) => ({
    subject: 'Booking Confirmation - CuraLine',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏥 CuraLine</h1>
            <h2>Booking Confirmation</h2>
          </div>
          <div class="content">
            <p>Dear ${data.patientName},</p>
            <p>Your consultation has been successfully booked!</p>
            
            <div class="details">
              <h3>Appointment Details:</h3>
              <p><strong>Doctor:</strong> ${data.doctorName}</p>
              <p><strong>Specialty:</strong> ${data.specialty}</p>
              <p><strong>Date:</strong> ${data.date}</p>
              <p><strong>Time:</strong> ${data.time}</p>
              <p><strong>Consultation Fee:</strong> ₱${data.fee}</p>
            </div>
            
            <p>Please make sure to complete your payment before the appointment.</p>
            
            <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/consultations" class="button">View My Consultations</a>
            
            <p>If you need to reschedule or cancel, please do so at least 24 hours in advance.</p>
            
            <div class="footer">
              <p>© 2025 CuraLine. All rights reserved.</p>
              <p>This is an automated message, please do not reply.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // Password reset email
  passwordReset: (data) => ({
    subject: 'Password Reset Request - CuraLine',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .warning { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏥 CuraLine</h1>
            <h2>Password Reset</h2>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            
            <a href="${data.resetLink}" class="button">Reset Password</a>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #667eea;">${data.resetLink}</p>
            
            <div class="warning">
              <strong>⚠️ Security Notice:</strong>
              <p>This link will expire in 1 hour. If you didn't request this reset, please ignore this email.</p>
            </div>
            
            <div class="footer">
              <p>© 2025 CuraLine. All rights reserved.</p>
              <p>This is an automated message, please do not reply.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // Appointment reminder
  appointmentReminder: (data) => ({
    subject: 'Appointment Reminder - CuraLine',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏥 CuraLine</h1>
            <h2>Appointment Reminder</h2>
          </div>
          <div class="content">
            <p>Dear ${data.patientName},</p>
            <p>This is a reminder that you have an upcoming appointment:</p>
            
            <div class="details">
              <h3>Appointment Details:</h3>
              <p><strong>Doctor:</strong> ${data.doctorName}</p>
              <p><strong>Date:</strong> ${data.date}</p>
              <p><strong>Time:</strong> ${data.time}</p>
            </div>
            
            <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/consultation-room/${data.consultationId}" class="button">Join Video Call</a>
            
            <p>Please be ready 5 minutes before your scheduled time.</p>
            
            <div class="footer">
              <p>© 2025 CuraLine. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // Prescription notification
  prescriptionIssued: (data) => ({
    subject: 'Prescription Issued - CuraLine',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏥 CuraLine</h1>
            <h2>Prescription Issued</h2>
          </div>
          <div class="content">
            <p>Dear ${data.patientName},</p>
            <p>Dr. ${data.doctorName} has issued a prescription for you.</p>
            
            <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/consultations" class="button">View Prescription</a>
            
            <p>Please follow the prescribed medication and dosage instructions carefully.</p>
            
            <div class="footer">
              <p>© 2025 CuraLine. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  })
};

module.exports = {
  initializeEmailService,
  sendEmail,
  emailTemplates
};
