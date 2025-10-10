# 🚀 Quick Deployment Checklist

Use this checklist to deploy CuraLine to Render.com step by step.

---

## ✅ Pre-Deployment (Do This First)

- [ ] **MongoDB Atlas Setup**
  - [ ] Create free account at mongodb.com/cloud/atlas
  - [ ] Create M0 (free) cluster
  - [ ] Create database user (save username/password)
  - [ ] Whitelist all IPs (0.0.0.0/0)
  - [ ] Get connection string and save it

- [ ] **GitHub Setup**
  - [ ] Create GitHub account (if needed)
  - [ ] Create new repository: `curaline-ehealth`
  - [ ] Keep repository URL handy

- [ ] **Local Preparation**
  - [ ] All code is working locally (`npm run dev`)
  - [ ] No errors in console
  - [ ] Video calling tested locally

---

## 📦 Step 1: Push to GitHub (5 minutes)

```bash
# In your project folder: c:\Users\jasar\E-Heatlh

# 1. Initialize git (if not done)
git init

# 2. Add all files
git add .

# 3. Commit
git commit -m "Prepare CuraLine for Render.com deployment"

# 4. Add remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/curaline-ehealth.git

# 5. Push
git branch -M main
git push -u origin main
```

**Verify:** Check GitHub - all files should be there ✅

---

## 🌐 Step 2: Deploy on Render.com (10 minutes)

### 2.1 Create Account
- [ ] Go to render.com
- [ ] Sign up with GitHub
- [ ] Authorize Render

### 2.2 Create Web Service
- [ ] Click "New +" → "Web Service"
- [ ] Connect `curaline-ehealth` repository
- [ ] Click "Connect"

### 2.3 Configure Service
- [ ] **Name:** `curaline-backend`
- [ ] **Region:** Choose closest
- [ ] **Branch:** `main`
- [ ] **Runtime:** `Node`
- [ ] **Build Command:** `npm run build`
- [ ] **Start Command:** `npm start`
- [ ] **Instance Type:** Free

### 2.4 Add Environment Variables
Click "Advanced" → Add these variables:

```
NODE_ENV = production
MONGODB_URI = mongodb+srv://username:password@cluster.mongodb.net/curaline?retryWrites=true&w=majority
PORT = 5000
CLIENT_URL = (leave blank for now)
```

**Optional (for email):**
```
EMAIL_PROVIDER = gmail
EMAIL_USER = your-email@gmail.com
EMAIL_PASSWORD = your-app-password
EMAIL_FROM_NAME = CuraLine Health
```

- [ ] All environment variables added
- [ ] MongoDB URI has your actual password
- [ ] Click "Create Web Service"

### 2.5 Wait for Deployment
- [ ] Watch logs (5-10 minutes)
- [ ] Look for: "Build successful!"
- [ ] Look for: "Server is running"
- [ ] Look for: "MongoDB Connected"

### 2.6 Update CLIENT_URL
- [ ] Copy your Render URL: `https://curaline-backend.onrender.com`
- [ ] Go to Environment tab
- [ ] Update `CLIENT_URL` to your Render URL
- [ ] Save (will auto-redeploy)

**Your app URL:** ___________________________________

---

## 🌱 Step 3: Seed Database (2 minutes)

- [ ] In Render dashboard, click "Shell" tab
- [ ] Wait for shell to connect
- [ ] Run: `npm run seed`
- [ ] See: "Database seeded successfully!"

**Test accounts created:**
- Admin: admin@curaline.com / admin123
- Patient: patient@example.com / patient123
- Doctor: sarah.johnson@curaline.com / sarah123

---

## 🧪 Step 4: Test Your App (5 minutes)

### Basic Tests
- [ ] Open: `https://your-app-name.onrender.com`
- [ ] App loads without errors
- [ ] Can login as admin
- [ ] Can browse doctors
- [ ] Can book consultation
- [ ] Admin dashboard loads

### Video Calling Test (MOST IMPORTANT!)

**Browser 1 (Patient):**
- [ ] Login: patient@example.com / patient123
- [ ] Book consultation
- [ ] Go to "My Consultations"
- [ ] Click "Join Video Call"
- [ ] Allow camera/microphone

**Browser 2 (Doctor):**
- [ ] Login: sarah.johnson@curaline.com / sarah123
- [ ] Go to "Doctor Dashboard"
- [ ] Click "Join Video Call" on same consultation
- [ ] Allow camera/microphone

**Verify:**
- [ ] Both can see each other's video
- [ ] Audio works both ways
- [ ] Camera toggle works
- [ ] Microphone toggle works
- [ ] Chat messages appear
- [ ] Screen sharing works
- [ ] End call works

---

## ✅ Success Criteria

Your deployment is successful if:
- ✅ App loads at Render URL
- ✅ Can login with test accounts
- ✅ Data persists (MongoDB working)
- ✅ Video calling connects
- ✅ Chat works in video call
- ✅ HTTPS enabled (camera/mic work)
- ✅ No errors in browser console

---

## 🐛 Quick Troubleshooting

### App won't load
→ Check Render logs for errors
→ Verify MongoDB connection string

### MongoDB connection failed
→ Check IP whitelist (0.0.0.0/0)
→ Verify password in connection string

### Video call not connecting
→ Check both users in same consultation
→ Verify HTTPS is enabled (should be automatic)
→ Try Chrome browser
→ Check camera/mic permissions

### Build failed
→ Check Render logs
→ Verify package.json scripts
→ Try building locally first

---

## 📊 Your Deployment Info

Fill this in for reference:

**GitHub Repository:** ___________________________________

**Render App URL:** ___________________________________

**MongoDB Cluster:** ___________________________________

**Deployment Date:** ___________________________________

**Status:** ⬜ Deployed ⬜ Tested ⬜ Working

---

## 🎉 Next Steps

After successful deployment:

1. **Share URL** with testers
2. **Test on different devices** and networks
3. **Monitor Render logs** for errors
4. **Collect feedback** on video quality
5. **Consider TURN servers** if needed
6. **Set up custom domain** (optional)

---

## 📞 Need Help?

- **Render Docs:** https://render.com/docs
- **MongoDB Docs:** https://www.mongodb.com/docs/atlas/
- **Full Guide:** See `DEPLOYMENT_GUIDE.md`
- **Project Docs:** See `PROJECT_SUMMARY.md`

---

**Total Time:** ~25 minutes
**Cost:** $0 (Free tier)
**Difficulty:** Easy ⭐⭐☆☆☆

**Good luck! 🚀**
