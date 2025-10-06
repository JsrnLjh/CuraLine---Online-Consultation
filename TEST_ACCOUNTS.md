# Test Accounts - Quick Reference

## Pre-configured Login Credentials

## 👑 Admin Account (Full System Access)

### System Administrator
- **Email:** admin@curaline.com
- **Password:** admin123
- **Role:** Admin

**Admin Access:**
- ✅ Full Admin Dashboard
- ✅ Manage Users & Doctors (CRUD operations)
- ✅ View all system analytics
- ✅ Calendar view of all appointments
- ✅ Complete system control

---

## 👨‍⚕️ Doctor Accounts (Doctor Dashboard Only)

Each doctor has their own individual account to access the Doctor Dashboard:

### Dr. Sarah Johnson (General Practitioner)
- **Email:** sarah.johnson@curaline.com
- **Password:** sarah123
- **Specialty:** General Practitioner
- **Fee:** ₱500

### Dr. Michael Chen (Cardiologist)
- **Email:** michael.chen@curaline.com
- **Password:** michael123
- **Specialty:** Cardiologist
- **Fee:** ₱800

### Dr. Emily Rodriguez (Dermatologist)
- **Email:** emily.rodriguez@curaline.com
- **Password:** emily123
- **Specialty:** Dermatologist
- **Fee:** ₱600

### Dr. James Anderson (Pediatrician)
- **Email:** james.anderson@curaline.com
- **Password:** james123
- **Specialty:** Pediatrician
- **Fee:** ₱550
**Doctor Access:**
- ✅ View their own appointments only
- ✅ Mark appointments as completed
- ✅ Cancel appointments
- ✅ Issue prescriptions
- ✅ Join video consultations
- ❌ Admin Dashboard (Restricted to Admin only)
- ❌ Manage Users & Doctors (Restricted to Admin only)

---

## 👤 Patient Account
- **Email:** patient@example.com
- **Password:** patient123
- **Role:** Patient

**Patient Access:**
- ✅ Browse Doctors
- ✅ Book Consultations
- ✅ View My Consultations
- ✅ Make Payments
- ✅ Join Video Calls
- ❌ Doctor Dashboard (Restricted)
- ❌ Admin Dashboard (Restricted)

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
   - Use admin@curaline.com for full admin access
   - Use any doctor email for doctor dashboard access
   - Use patient@example.com for patient access

4. **Test the features:**
   - Admin: Manage users/doctors, view analytics, full system control
   - Doctor: View appointments, issue prescriptions, join video calls
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

⚠️ **Important Notes**
- These are test accounts for development
- Passwords are hashed with bcrypt
- Data is stored in MongoDB (persistent)
- Run `npm run seed` to reset/recreate accounts

🔒 **For Production**
- Remove or change default credentials
- Add email verification
- Implement 2FA
- Use strong passwords

---

**Last Updated:** 2025-10-06
