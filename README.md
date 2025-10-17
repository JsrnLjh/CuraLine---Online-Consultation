# CuraLine - E-Health Online Consultation System

A modern, full-stack electronic health consultation platform that connects patients with healthcare professionals for online consultations. **CuraLine** is your personalized health partner.

## Features

### Authentication & Security
- 🔐 **User Authentication** - Secure login and registration system
- 👥 **Role-Based Access** - Separate access levels for patients and doctors
- 🔒 **Protected Routes** - All main features require authentication
- 🚪 **Session Management** - Persistent login sessions

### Patient Features
- 🏥 **Browse Doctors** - View profiles of experienced healthcare professionals across various specialties
- 📅 **Book Consultations** - Schedule appointments with available time slots
- 👤 **Patient Management** - Manage personal consultation history

### Admin Dashboard Features (Doctors Only)
- 📊 **Analytics & Reports** - Comprehensive statistics on consultations (daily, weekly, monthly, yearly)
- 👥 **Patient Tracking** - Monitor total patients and weekly patient counts
- 📅 **Calendar View** - Visual calendar showing all scheduled appointments
- 🔍 **Doctor Filtering** - Filter appointments by specific doctors
- 📈 **Performance Metrics** - Track consultations by doctor and specialty
- 📋 **Status Overview** - Monitor scheduled, completed, and cancelled appointments

### Video Consultation Features
- 🎥 **WebRTC Video Calls** - Real-time video consultations with doctors
- 📱 **Mobile Optimized** - Full support for iOS and Android devices
- 🔄 **Camera Flip** - Switch between front and back camera on mobile
- 🎤 **Audio Controls** - Mute/unmute microphone during calls
- 📹 **Video Controls** - Turn camera on/off as needed
- 💬 **In-Call Chat** - Text messaging during video consultations
- 🖥️ **Screen Sharing** - Share screen for better communication

### General Features
- 💻 **Modern UI** - Beautiful, responsive interface built with React
- 🎨 **CuraLine Branding** - Professional logo and consistent design
- 📱 **Fully Responsive** - Works seamlessly on desktop, tablet, and mobile

## Tech Stack

### Backend
- Node.js
- Express.js
- CORS enabled
- RESTful API architecture

### Frontend
- React 18
- React Router for navigation
- Axios for API calls
- Lucide React for icons
- Modern CSS with responsive design

## Project Structure

```
E-Health/
├── server/
│   └── index.js          # Express server and API routes
├── client/
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── components/   # Reusable components
│       ├── pages/        # Page components
│       ├── App.js        # Main app component
│       └── index.js      # Entry point
├── package.json          # Root dependencies
└── README.md
```

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Setup Instructions

1. **Clone or navigate to the project directory**
   ```bash
   cd E-Health
   ```

2. **Install all dependencies (root and client)**
   ```bash
   npm run install-all
   ```

   Or install manually:
   ```bash
   # Install root dependencies
   npm install

   # Install client dependencies
   cd client
   npm install
   cd ..
   ```

## Running the Application

### Option 1: Run both server and client concurrently (Recommended)
```bash
npm run dev
```

### Option 2: Run separately

**Terminal 1 - Start the backend server:**
```bash
npm run server
```
Server will run on http://localhos t:5000

**Terminal 2 - Start the React frontend:**
```bash
npm run client
```
Client will run on http://localhost:3000

### Testing WebRTC Video Consultations Between Devices

For testing video consultations on different devices (phones, tablets, other computers):

**Quick Start:**
```bash
# Run the testing setup helper
START_FOR_TESTING.bat

# Or run diagnostics
npm run test-connection
```

**See detailed guides:**
- 📘 **[Quick Fix Guide](QUICK_FIX_GUIDE.md)** - Fast troubleshooting
- 📗 **[WebRTC Setup Guide](WEBRTC_SETUP_GUIDE.md)** - Comprehensive instructions
- 📙 **[Fixes Summary](WEBRTC_FIXES_SUMMARY.md)** - What was fixed and why
- 📱 **[Mobile Video Guide](MOBILE_VIDEO_GUIDE.md)** - Mobile testing & troubleshooting (NEW!)

## Usage

### Getting Started
1. **Register** - Create an account as Patient or Doctor at `/register`
2. **Login** - Sign in to your account at `/login`
3. Access is automatically granted based on your role

### Patient Portal
1. **Home Page** - Landing page with information about the service
2. **Doctors** - Browse available doctors and their specialties
3. **Book Consultation** - Select a doctor and fill out the booking form
4. **My Consultations** - View all your booked consultations

### Admin Dashboard (Doctors Only)
5. **Admin Dashboard** - Access comprehensive analytics and reports
   - View consultation statistics (today, week, month, year)
   - Monitor patient counts and trends
   - Track consultations by doctor and specialty
   - View status breakdown (scheduled, completed, cancelled)
   - Switch to calendar view to see all appointments
   - Filter appointments by specific doctors

### User Roles
- **Patients**: Can book and manage consultations
- **Doctors**: Have all patient features + admin dashboard access

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user (patient or doctor)
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info

### Doctors
- `GET /api/doctors` - Get all doctors
- `GET /api/doctors/:id` - Get doctor by ID

### Consultations
- `POST /api/consultations` - Book a new consultation
- `GET /api/consultations` - Get all consultations
- `GET /api/consultations/:id` - Get consultation by ID
- `PATCH /api/consultations/:id` - Update consultation status

### Analytics (Admin - Doctors Only)
- `GET /api/analytics/stats` - Get comprehensive dashboard statistics
- `GET /api/analytics/calendar` - Get all appointments for calendar view
- `GET /api/analytics/consultations-by-date` - Get consultations filtered by date range

### Health Check
- `GET /api/health` - Check API status

## Sample Data

### Test Accounts
For quick testing, use these pre-configured accounts:

**Admin/Doctor Account:**
- Email: `admin@example.com`
- Password: `admin123`
- Access: Full admin dashboard + all patient features

**Patient Account:**
- Email: `patient@example.com`
- Password: `patient123`
- Access: Patient features only

### Sample Doctors
The application comes with 4 sample doctors:
- Dr. Sarah Johnson - General Practitioner
- Dr. Michael Chen - Cardiologist
- Dr. Emily Rodriguez - Dermatologist
- Dr. James Wilson - Pediatrician

## Future Enhancements

- 🔐 User authentication and authorization
- 💾 Database integration (MongoDB/PostgreSQL)
- 💬 Real-time video consultation
- 📧 Email notifications
- 💳 Payment integration
- 📱 Mobile app version
- 🔔 SMS reminders
- 📊 Advanced analytics with charts (Chart.js/Recharts)
- 🔔 Real-time notifications for appointments
- 📄 Export reports to PDF/Excel

## Development Notes

- The application currently uses in-memory storage for data
- For production, implement a proper database solution
- Add environment variables for sensitive configuration
- Implement proper error handling and validation
- Add unit and integration tests

## License

MIT License - feel free to use this project for learning or as a starting point for your own application.

## Support

For issues or questions, please create an issue in the repository.

---

Built with ❤️ for better healthcare accessibility
