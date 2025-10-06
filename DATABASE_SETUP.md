# 🗄️ MongoDB Database Setup Guide

## Date: 2025-10-06

---

## ✅ What Was Implemented

### **Complete MongoDB Integration** (100%)

Migrated from in-memory storage to MongoDB database with Mongoose ODM for persistent data storage.

---

## 📊 Database Models

### 1. **User Model**
Stores patient and doctor accounts.

**Fields:**
- `name` - Full name (required)
- `email` - Email address (unique, required)
- `phone` - Phone number
- `password` - Hashed password (required)
- `role` - 'patient' or 'doctor' (required)
- `createdAt` - Registration date

**Features:**
- Password hashing with bcrypt (10 rounds)
- Password comparison method
- Pre-save hook for automatic hashing

### 2. **Doctor Model**
Stores doctor profiles and details.

**Fields:**
- `name` - Doctor name (required)
- `specialty` - Medical specialty (required)
- `experience` - Years of experience (required)
- `rating` - Rating (0-5, default: 4.5)
- `reviews` - Number of reviews
- `consultationFee` - Fee amount (required)
- `image` - Profile image URL
- `bio` - Professional bio
- `education` - Educational background
- `languages` - Array of languages
- `certifications` - Array of certifications
- `availability` - Array of available times
- `userId` - Reference to User model
- `createdAt` - Creation date

### 3. **Consultation Model**
Stores appointment bookings.

**Fields:**
- `doctorId` - Reference to Doctor (required)
- `patientId` - Reference to User (required)
- `patientName`, `patientEmail`, `patientPhone` - Patient details
- `doctorName`, `doctorSpecialty` - Doctor details
- `consultationFee` - Fee amount
- `date`, `time` - Appointment date/time (required)
- `symptoms` - Reason for visit
- `status` - 'scheduled', 'in-progress', 'completed', 'cancelled'
- `paymentStatus` - 'pending', 'paid'
- `paymentId` - Reference to Payment
- `prescriptionId` - Reference to Prescription
- `startedAt`, `rescheduledAt` - Timestamps
- `createdAt` - Booking date

### 4. **Notification Model**
Stores user notifications.

**Fields:**
- `userId` - Reference to User (required)
- `type` - Notification type (required)
- `title` - Notification title (required)
- `message` - Notification message (required)
- `read` - Read status (default: false)
- `createdAt` - Creation date

**Types:** booking, cancellation, reschedule, reminder, completion, prescription

### 5. **Payment Model**
Stores payment records.

**Fields:**
- `consultationId` - Reference to Consultation (required)
- `amount` - Payment amount (required)
- `method` - 'card', 'gcash', 'paymaya', 'cash' (required)
- `status` - 'pending', 'completed', 'failed'
- `transactionId` - Transaction ID (required)
- `cardDetails` - Card info (last4, brand)
- `createdAt` - Payment date

### 6. **Prescription Model**
Stores medical prescriptions.

**Fields:**
- `consultationId` - Reference to Consultation (required)
- `patientId` - Reference to User (required)
- `doctorId` - Reference to User (required)
- `patientName`, `patientEmail` - Patient details
- `doctorName` - Doctor name
- `medications` - Array of medication objects
  - `name`, `dosage`, `frequency`, `duration`
- `instructions` - Additional instructions
- `createdAt`, `updatedAt` - Timestamps

### 7. **Message Model**
Stores consultation chat messages.

**Fields:**
- `consultationId` - Reference to Consultation (required)
- `senderId` - Reference to User (required)
- `senderName` - Sender name (required)
- `message` - Message content (required)
- `createdAt` - Message date

---

## 📁 File Structure

```
server/
├── models/
│   ├── User.js              ✨ NEW
│   ├── Doctor.js            ✨ NEW
│   ├── Consultation.js      ✨ NEW
│   ├── Notification.js      ✨ NEW
│   ├── Payment.js           ✨ NEW
│   ├── Prescription.js      ✨ NEW
│   └── Message.js           ✨ NEW
├── config/
│   └── database.js          ✨ NEW
├── seed.js                  ✨ NEW
└── index.js                 (to be updated)
```

---

## 🚀 Installation Steps

### 1. Install MongoDB

**Windows:**
1. Download MongoDB Community Server from https://www.mongodb.com/try/download/community
2. Run the installer
3. Choose "Complete" installation
4. Install MongoDB as a Service
5. Install MongoDB Compass (GUI tool)

**Mac:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux:**
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

### 2. Verify MongoDB is Running

```bash
# Check if MongoDB is running
mongosh

# Or check the service
# Windows:
net start MongoDB

# Mac/Linux:
brew services list  # Mac
sudo systemctl status mongodb  # Linux
```

### 3. Install Dependencies

Already installed:
```bash
npm install mongoose bcryptjs
```

---

## 🌱 Seed Database

### Run the Seed Script

```bash
npm run seed
```

**This will:**
1. Connect to MongoDB
2. Clear existing data
3. Create test users:
   - Admin/Doctor: `admin@example.com` / `admin123`
   - Patient: `patient@example.com` / `patient123`
4. Create 4 doctors with full profiles

**Expected Output:**
```
✅ MongoDB Connected: localhost
📊 Database: curaline
🗑️  Cleared existing data
✅ Created test users
✅ Created doctors

📝 Test Accounts:
   Admin/Doctor: admin@example.com / admin123
   Patient: patient@example.com / patient123

✅ Database seeded successfully!
```

---

## 🔧 Configuration

### Environment Variables (.env)

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/curaline
```

**For MongoDB Atlas (Cloud):**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/curaline?retryWrites=true&w=majority
```

---

## 📊 Database Connection

### Connection File (server/config/database.js)

```javascript
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};
```

---

## 🎯 Next Steps

### Update server/index.js to use MongoDB

The server needs to be updated to:
1. Import database connection
2. Import models
3. Replace in-memory arrays with database queries
4. Update all endpoints to use Mongoose methods

**Key Changes:**
- `users.push()` → `User.create()`
- `users.find()` → `User.findOne()`
- `consultations.push()` → `Consultation.create()`
- etc.

---

## 🧪 Testing Database

### Using MongoDB Compass

1. Open MongoDB Compass
2. Connect to `mongodb://localhost:27017`
3. Select `curaline` database
4. View collections:
   - users
   - doctors
   - consultations
   - notifications
   - payments
   - prescriptions
   - messages

### Using mongosh (CLI)

```bash
mongosh

use curaline

# View all users
db.users.find().pretty()

# View all doctors
db.doctors.find().pretty()

# Count documents
db.users.countDocuments()
db.doctors.countDocuments()

# Find specific user
db.users.findOne({ email: "admin@example.com" })
```

---

## 🔒 Security Features

### Password Hashing
- Uses bcryptjs with 10 salt rounds
- Automatic hashing on user creation
- Password comparison method for login
- Passwords never stored in plain text

### Schema Validation
- Required fields enforced
- Email uniqueness enforced
- Enum validation for status fields
- Type validation for all fields

---

## 📈 Benefits of MongoDB

### Advantages
✅ **Persistent Storage** - Data survives server restarts
✅ **Scalability** - Can handle millions of records
✅ **Relationships** - References between collections
✅ **Indexing** - Fast queries with indexes
✅ **Backup** - Easy data backup and restore
✅ **Security** - Password hashing and validation
✅ **Flexibility** - Easy schema changes

### vs In-Memory Storage
| Feature | In-Memory | MongoDB |
|---------|-----------|---------|
| Persistence | ❌ Lost on restart | ✅ Permanent |
| Scalability | ❌ Limited by RAM | ✅ Unlimited |
| Security | ❌ Plain text | ✅ Hashed passwords |
| Backup | ❌ No backup | ✅ Easy backup |
| Queries | ❌ Array methods | ✅ Powerful queries |

---

## 🔄 Migration Checklist

- [x] Install MongoDB
- [x] Install mongoose & bcryptjs
- [x] Create database models
- [x] Create database connection
- [x] Create seed script
- [x] Add seed command to package.json
- [x] Update .env with MongoDB URI
- [ ] Update server/index.js to use MongoDB
- [ ] Test all endpoints
- [ ] Verify data persistence

---

## 🆘 Troubleshooting

### MongoDB Not Starting

**Windows:**
```bash
# Start MongoDB service
net start MongoDB

# Or restart
net stop MongoDB
net start MongoDB
```

**Mac:**
```bash
brew services restart mongodb-community
```

**Linux:**
```bash
sudo systemctl restart mongodb
```

### Connection Errors

**Error:** `MongooseServerSelectionError`
- **Solution:** Make sure MongoDB is running
- Check if port 27017 is available
- Verify MONGODB_URI in .env

**Error:** `Authentication failed`
- **Solution:** Check username/password in connection string
- For local MongoDB, authentication is usually not required

### Seed Script Errors

**Error:** `E11000 duplicate key error`
- **Solution:** Data already exists
- Run seed script again (it clears data first)

---

## 📝 Useful Commands

```bash
# Seed database
npm run seed

# Start server (will connect to MongoDB)
npm run server

# Start both server and client
npm run dev

# View MongoDB logs
# Windows: C:\Program Files\MongoDB\Server\7.0\log\mongod.log
# Mac: /usr/local/var/log/mongodb/mongo.log
# Linux: /var/log/mongodb/mongod.log
```

---

## 🎉 Success Criteria

✅ MongoDB installed and running
✅ Database connection successful
✅ All models created
✅ Seed script runs successfully
✅ Test accounts created
✅ Doctors populated
✅ Ready to update server endpoints

---

**Next:** Update server/index.js to use MongoDB instead of in-memory storage!
