# Test Accounts - Quick Reference

## Pre-configured Login Credentials

### 🩺 Admin/Doctor Account
```
Email:    admin@example.com
Password: admin123
Role:     Doctor
```

**Access:**
- ✅ Admin Dashboard
- ✅ Analytics & Reports
- ✅ Calendar View
- ✅ All Patient Features
- ✅ "Doctor" Badge in Header

**Login URL:** http://localhost:3000/login

---

### 👤 Patient Account
```
Email:    patient@example.com
Password: patient123
Role:     Patient
```

**Access:**
- ✅ Browse Doctors
- ✅ Book Consultations
- ✅ View My Consultations
- ❌ Admin Dashboard (Restricted)

**Login URL:** http://localhost:3000/login

---

## Quick Start

1. **Start the application:**
   ```bash
   npm run dev
   ```

2. **Open browser:**
   ```
   http://localhost:3000
   ```

3. **Login with test account:**
   - Use admin@example.com for doctor access
   - Use patient@example.com for patient access

4. **Test the features:**
   - Admin: Check analytics, calendar, and reports
   - Patient: Browse doctors and book consultations

---

## Creating New Accounts

You can also create new accounts at:
```
http://localhost:3000/register
```

Choose role:
- **Patient** - Regular user access
- **Doctor** - Admin dashboard access

---

## Notes

⚠️ **Development Only**
- These are test accounts for development
- Passwords are not hashed
- Data is stored in memory (resets on server restart)

🔒 **For Production**
- Remove or change default credentials
- Implement proper password hashing
- Use database for persistent storage
- Add email verification

---

**Last Updated:** 2025-10-01
