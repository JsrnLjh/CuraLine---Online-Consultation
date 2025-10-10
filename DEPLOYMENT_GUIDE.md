# 🚀 CuraLine Deployment Guide - Render.com

This guide will help you deploy your CuraLine E-Health application to Render.com for testing.

---

## 📋 Prerequisites Checklist

Before starting, make sure you have:
- [ ] GitHub account
- [ ] MongoDB Atlas account (free tier)
- [ ] Your code ready to push to GitHub
- [ ] (Optional) Gmail account for email notifications

---

## Step 1: Set Up MongoDB Atlas (Free Cloud Database)

### 1.1 Create MongoDB Atlas Account
1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up with Google or email
3. Choose **FREE** M0 Sandbox tier

### 1.2 Create a Cluster
1. Click "Build a Database"
2. Choose **FREE** M0 tier
3. Select a cloud provider (AWS recommended)
4. Choose region closest to you
5. Click "Create Cluster" (takes 3-5 minutes)

### 1.3 Create Database User
1. Go to "Database Access" (left sidebar)
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Username: `curaline_user`
5. Password: Generate a secure password (save it!)
6. Database User Privileges: "Atlas admin"
7. Click "Add User"

### 1.4 Whitelist All IPs (for Render access)
1. Go to "Network Access" (left sidebar)
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere"
4. IP Address: `0.0.0.0/0`
5. Click "Confirm"

### 1.5 Get Connection String
1. Go to "Database" (left sidebar)
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Driver: Node.js, Version: 4.1 or later
5. Copy the connection string:
   ```
   mongodb+srv://curaline_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<password>` with your actual password
7. Add database name before the `?`:
   ```
   mongodb+srv://curaline_user:yourpassword@cluster0.xxxxx.mongodb.net/curaline?retryWrites=true&w=majority
   ```
8. **Save this connection string** - you'll need it for Render!

---

## Step 2: Push Your Code to GitHub

### 2.1 Initialize Git (if not already done)
```bash
cd c:\Users\jasar\E-Heatlh
git init
```

### 2.2 Add All Files
```bash
git add .
```

### 2.3 Commit
```bash
git commit -m "Prepare CuraLine for deployment"
```

### 2.4 Create GitHub Repository
1. Go to: https://github.com/new
2. Repository name: `curaline-ehealth`
3. Description: "CuraLine - Online Health Consultation Platform"
4. Choose **Public** or **Private**
5. **DO NOT** initialize with README (you already have one)
6. Click "Create repository"

### 2.5 Push to GitHub
```bash
# Replace with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/curaline-ehealth.git
git branch -M main
git push -u origin main
```

---

## Step 3: Deploy on Render.com

### 3.1 Create Render Account
1. Go to: https://render.com
2. Click "Get Started"
3. Sign up with **GitHub** (recommended)
4. Authorize Render to access your repositories

### 3.2 Create New Web Service
1. Click "New +" button (top right)
2. Select "Web Service"
3. Connect your `curaline-ehealth` repository
4. Click "Connect"

### 3.3 Configure Web Service

**Basic Settings:**
- **Name:** `curaline-backend` (or any name you prefer)
- **Region:** Choose closest to you
- **Branch:** `main`
- **Root Directory:** (leave blank)
- **Runtime:** `Node`

**Build & Deploy:**
- **Build Command:** `npm run build`
- **Start Command:** `npm start`

**Instance Type:**
- Choose **Free** tier

### 3.4 Add Environment Variables

Click "Advanced" → "Add Environment Variable"

Add these variables one by one:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | Your MongoDB Atlas connection string from Step 1.5 |
| `PORT` | `5000` |
| `CLIENT_URL` | (Leave blank for now, will update after deployment) |
| `EMAIL_PROVIDER` | `gmail` (optional) |
| `EMAIL_USER` | `your-email@gmail.com` (optional) |
| `EMAIL_PASSWORD` | `your-app-password` (optional) |
| `EMAIL_FROM_NAME` | `CuraLine Health` (optional) |

**Important:** 
- Make sure `MONGODB_URI` is the complete connection string with your password
- Email variables are optional - system works without them

### 3.5 Deploy!
1. Click "Create Web Service"
2. Wait 5-10 minutes for deployment
3. Watch the logs for any errors

**Expected logs:**
```
==> Building...
==> Installing dependencies...
==> Building React app...
==> Build successful!
==> Starting server...
🚀 Server is running on port 5000
✅ MongoDB Connected
🔌 Socket.io server ready for WebRTC signaling
```

### 3.6 Get Your App URL
After successful deployment, you'll get a URL like:
```
https://curaline-backend.onrender.com
```

### 3.7 Update CLIENT_URL Environment Variable
1. Go to your service settings
2. Find "Environment" tab
3. Update `CLIENT_URL` to your Render URL:
   ```
   https://curaline-backend.onrender.com
   ```
4. Click "Save Changes"
5. Service will automatically redeploy

---

## Step 4: Seed the Database

### 4.1 Open Render Shell
1. In your Render dashboard
2. Go to your service
3. Click "Shell" tab (top right)
4. Wait for shell to connect

### 4.2 Run Seed Command
In the shell, type:
```bash
npm run seed
```

**Expected output:**
```
✅ MongoDB Connected
📊 Database: curaline
🗑️  Cleared existing data
✅ Created test users
✅ Created doctors
✅ Database seeded successfully!
```

### 4.3 Verify Seeding
The seed creates:
- **Admin:** admin@curaline.com / admin123
- **Patient:** patient@example.com / patient123
- **4 Doctors:** sarah.johnson@curaline.com / sarah123 (and 3 more)

---

## Step 5: Test Your Deployed App

### 5.1 Open Your App
Visit: `https://your-app-name.onrender.com`

### 5.2 Test Login
1. Click "Login"
2. Try admin account:
   - Email: `admin@curaline.com`
   - Password: `admin123`
3. Should successfully login and redirect to home

### 5.3 Test Key Features
- [ ] Browse doctors page loads
- [ ] Can book a consultation
- [ ] Admin dashboard shows analytics
- [ ] Notifications work

### 5.4 Test Video Calling (Most Important!)

**Browser 1 (Patient):**
1. Login as: `patient@example.com` / `patient123`
2. Book a consultation with any doctor
3. Go to "My Consultations"
4. Click "Join Video Call"
5. **Allow camera and microphone** when prompted

**Browser 2 or Different Device (Doctor):**
1. Login as: `sarah.johnson@curaline.com` / `sarah123`
2. Go to "Doctor Dashboard" → "My Appointments"
3. Find the consultation
4. Click "Join Video Call"
5. **Allow camera and microphone** when prompted

**Test These:**
- ✅ Can see each other's video
- ✅ Can hear each other
- ✅ Camera toggle works
- ✅ Microphone toggle works
- ✅ Chat messages appear instantly
- ✅ Screen sharing works
- ✅ End call disconnects properly

---

## 🎉 Success Checklist

After deployment, verify:
- [ ] App loads at your Render URL
- [ ] Can login with test accounts
- [ ] MongoDB connection works (data persists)
- [ ] Can browse doctors
- [ ] Can book consultations
- [ ] Admin dashboard loads
- [ ] Video calling works between 2 users
- [ ] Chat messages work in video call
- [ ] Camera/microphone permissions granted (HTTPS)
- [ ] No console errors

---

## 🐛 Troubleshooting

### Issue: "Application Error" or 503
**Solution:**
- Check Render logs for errors
- Verify MongoDB connection string is correct
- Make sure all environment variables are set
- Check if build completed successfully

### Issue: MongoDB Connection Failed
**Solution:**
- Verify MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- Check connection string has correct password
- Ensure database user has proper permissions
- Test connection string locally first

### Issue: Video Call Not Connecting
**Solution:**
- Make sure both users are in the same consultation
- Check browser console for WebSocket errors
- Verify HTTPS is enabled (Render provides this automatically)
- Try different browsers (Chrome recommended)
- Check if camera/microphone permissions granted

### Issue: Build Failed
**Solution:**
- Check Render logs for specific error
- Verify `package.json` scripts are correct
- Make sure all dependencies are in `package.json`
- Try building locally: `npm run build`

### Issue: App Sleeps After 15 Minutes
**This is normal on Render free tier:**
- App spins down after 15 min of inactivity
- Wakes up on next request (takes ~30 seconds)
- For testing, this is acceptable
- For production, upgrade to paid tier

---

## 📊 Monitoring Your App

### View Logs
1. Go to Render dashboard
2. Select your service
3. Click "Logs" tab
4. See real-time server logs

### Check Metrics
1. Go to "Metrics" tab
2. View:
   - CPU usage
   - Memory usage
   - Request count
   - Response times

---

## 🔒 Security Notes

### For Production (After Testing):
1. **Change default passwords** in seed script
2. **Set up real email service** (Gmail App Password or SendGrid)
3. **Add TURN servers** for better video connectivity
4. **Enable rate limiting**
5. **Add input validation**
6. **Set up monitoring** (Sentry, LogRocket)
7. **Regular backups** of MongoDB
8. **Use environment-specific configs**

---

## 💰 Cost Breakdown

### Free Tier Limits:
- **Render.com:** 750 hours/month (enough for 1 app running 24/7)
- **MongoDB Atlas:** 512MB storage (enough for testing)
- **Total Cost:** $0/month for testing ✅

### If You Need More:
- **Render Starter:** $7/month (no sleep, more resources)
- **MongoDB M2:** $9/month (2GB storage)

---

## 🚀 Next Steps After Successful Deployment

1. **Share your app URL** with testers
2. **Test video calling** with real users on different networks
3. **Monitor logs** for any errors
4. **Collect feedback** on performance
5. **Consider adding TURN servers** if video doesn't connect on some networks
6. **Set up custom domain** (optional)

---

## 📞 Support

### If You Get Stuck:

**Render.com Issues:**
- Docs: https://render.com/docs
- Community: https://community.render.com

**MongoDB Atlas Issues:**
- Docs: https://www.mongodb.com/docs/atlas/
- Support: https://www.mongodb.com/cloud/atlas/support

**CuraLine App Issues:**
- Check `PROJECT_SUMMARY.md` for complete documentation
- Review server logs in Render dashboard
- Test locally first: `npm run dev`

---

## ✅ Quick Command Reference

```bash
# Local Development
npm run dev              # Start both frontend and backend
npm run seed            # Seed database with test data

# Deployment
git add .               # Stage changes
git commit -m "message" # Commit changes
git push origin main    # Push to GitHub

# Render Shell Commands
npm run seed            # Seed production database
npm start               # Start server (automatic)
```

---

**🎊 Congratulations!** Your CuraLine app is now live and ready for testing!

**Your deployed app:** `https://your-app-name.onrender.com`

**Test accounts:**
- Admin: admin@curaline.com / admin123
- Patient: patient@example.com / patient123
- Doctor: sarah.johnson@curaline.com / sarah123

**Happy testing! 🚀**
