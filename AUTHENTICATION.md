# Authentication System Documentation

## Overview
CuraLine now features a complete authentication system with login/register functionality and role-based access control. Users must authenticate before accessing the application, and the admin dashboard is restricted to doctors only.

## User Roles

### 1. Patient
- Can browse doctors
- Can book consultations
- Can view their own consultations
- **Cannot** access admin dashboard

### 2. Doctor
- All patient capabilities
- **Can** access admin dashboard
- Can view analytics and calendar
- Special "Doctor" badge in header

## Authentication Flow

### Registration
1. User visits `/register`
2. Fills out registration form:
   - Full Name
   - Email Address
   - Phone Number (optional)
   - Password (min 6 characters)
   - Confirm Password
   - Account Type (Patient/Doctor)
3. System validates:
   - All required fields present
   - Email not already registered
   - Passwords match
   - Password length >= 6 characters
4. User is automatically logged in and redirected:
   - Doctors → `/admin` (Admin Dashboard)
   - Patients → `/` (Home Page)

### Login
1. User visits `/login`
2. Enters email and password
3. System validates credentials
4. User is redirected based on role:
   - Doctors → `/admin`
   - Patients → `/`

### Logout
1. User clicks "Logout" button in header
2. Session is cleared from localStorage
3. User is redirected to `/login`

## Protected Routes

All main application routes require authentication:

- `/` - Home (requires login)
- `/doctors` - Browse Doctors (requires login)
- `/book/:doctorId` - Book Consultation (requires login)
- `/consultations` - My Consultations (requires login)
- `/admin` - Admin Dashboard (requires login + doctor role)

Public routes (no authentication required):
- `/login` - Login page
- `/register` - Registration page

## Technical Implementation

### Frontend Components

#### AuthContext (`client/src/context/AuthContext.js`)
- Manages authentication state
- Provides user data throughout the app
- Handles login/logout operations
- Persists session in localStorage

**Key Functions:**
```javascript
const { user, login, logout, isDoctor, isPatient, loading } = useAuth();
```

#### ProtectedRoute (`client/src/components/ProtectedRoute.js`)
- Wrapper component for protected routes
- Redirects to `/login` if not authenticated
- Supports role-based access with `requireDoctor` prop

**Usage:**
```jsx
<ProtectedRoute requireDoctor={true}>
  <AdminDashboard />
</ProtectedRoute>
```

#### Login Page (`client/src/pages/Login.js`)
- Email and password form
- Error handling and display
- Automatic redirection based on role
- Link to registration page

#### Register Page (`client/src/pages/Register.js`)
- Complete registration form
- Password validation
- Role selection (Patient/Doctor)
- Automatic login after registration

### Backend API Endpoints

#### POST `/api/auth/register`
Register a new user

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "password123",
  "role": "patient" // or "doctor"
}
```

**Response:**
```json
{
  "message": "Registration successful",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "role": "patient",
    "createdAt": "2025-10-01T..."
  }
}
```

#### POST `/api/auth/login`
Login existing user

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "patient"
  }
}
```

#### GET `/api/auth/me`
Get current user (requires authentication)

**Headers:**
```
x-user-id: user-uuid
```

## UI Components

### Header Updates
- Shows logged-in user's name
- Displays "Doctor" badge for doctor accounts
- Logout button with hover effect
- Admin link only visible to doctors
- Responsive design for mobile

### Styling
- Modern gradient backgrounds
- Clean form inputs with icons
- Error message display
- Responsive layout (desktop/mobile)
- Consistent with CuraLine branding

## Security Notes

### Current Implementation (Development)
⚠️ **For development purposes only:**
- Passwords stored in plain text
- No JWT tokens
- Session stored in localStorage
- Simple email/password validation

### Production Recommendations
🔒 **Before deploying to production:**

1. **Password Security**
   - Hash passwords with bcrypt
   - Implement password strength requirements
   - Add password reset functionality

2. **Token-Based Authentication**
   - Implement JWT (JSON Web Tokens)
   - Store tokens securely (httpOnly cookies)
   - Add token refresh mechanism
   - Implement token expiration

3. **Database Integration**
   - Replace in-memory storage with database
   - Use proper user models
   - Implement database indexes

4. **Additional Security**
   - Add CSRF protection
   - Implement rate limiting
   - Add email verification
   - Enable 2FA (Two-Factor Authentication)
   - Add session management
   - Implement account lockout after failed attempts

5. **API Security**
   - Add middleware for authentication
   - Validate all inputs
   - Sanitize user data
   - Implement proper error handling

## User Experience

### First-Time Users
1. Visit application → Redirected to `/login`
2. Click "Sign up" → Go to `/register`
3. Complete registration → Auto-login → Redirected to home/admin

### Returning Users
1. Visit application → Redirected to `/login`
2. Enter credentials → Redirected to home/admin
3. Session persists until logout

### Role-Based Experience

**Patients See:**
- Home, Doctors, My Consultations in navigation
- No admin dashboard access
- User name and logout button

**Doctors See:**
- Home, Doctors, My Consultations, Admin in navigation
- Full admin dashboard access
- "Doctor" badge next to name
- User name and logout button

## Testing the System

### Quick Test with Pre-configured Accounts

**Test as Admin/Doctor:**
- Email: `admin@example.com`
- Password: `admin123`
- Expected: Redirect to admin dashboard, see "Doctor" badge

**Test as Patient:**
- Email: `patient@example.com`
- Password: `patient123`
- Expected: Redirect to home page, no admin access

### Test by Creating New Accounts

**Test as Patient:**
1. Register with role "Patient"
2. Verify redirect to home page
3. Confirm no admin link in navigation
4. Try accessing `/admin` → Should redirect to home

**Test as Doctor:**
1. Register with role "Doctor"
2. Verify redirect to admin dashboard
3. Confirm "Doctor" badge appears
4. Verify admin link in navigation
5. Access admin dashboard successfully

### Test Authentication
1. Logout → Verify redirect to login
2. Try accessing protected route → Verify redirect to login
3. Login → Verify redirect based on role
4. Refresh page → Verify session persists

## Files Created/Modified

### New Files
- `client/src/context/AuthContext.js` - Authentication context
- `client/src/components/ProtectedRoute.js` - Route protection
- `client/src/pages/Login.js` - Login page
- `client/src/pages/Register.js` - Registration page
- `client/src/pages/Auth.css` - Authentication styling

### Modified Files
- `client/src/App.js` - Added auth routes and protection
- `client/src/components/Header.js` - Added user info and logout
- `client/src/components/Header.css` - Added user section styling
- `server/index.js` - Added authentication endpoints

## Future Enhancements

- Email verification
- Password reset via email
- Social login (Google, Facebook)
- Two-factor authentication
- Session timeout
- Remember me functionality
- User profile management
- Account settings page
- Activity logs
- Admin user management

---

**Note:** This is a development implementation. Please implement proper security measures before production deployment.
