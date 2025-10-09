# 📧 Email Configuration - Quick Start

## 🚀 Fastest Setup (Gmail - 5 minutes)

### Step 1: Get Gmail App Password

1. Go to your Google Account: https://myaccount.google.com
2. Click **Security** (left sidebar)
3. Enable **2-Step Verification** (if not already enabled)
4. Go back to Security → **App passwords**
5. Select:
   - App: **Mail**
   - Device: **Other (Custom name)**
   - Name it: **CuraLine**
6. Click **Generate**
7. **Copy the 16-character password** (format: xxxx xxxx xxxx xxxx)

### Step 2: Update .env File

Open `.env` file in the root directory and update these lines:

```env
EMAIL_PROVIDER=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
EMAIL_FROM_NAME=CuraLine Health
CLIENT_URL=http://localhost:3000
```

**Replace:**
- `your-email@gmail.com` with your actual Gmail address
- `xxxx xxxx xxxx xxxx` with the app password you copied

### Step 3: Test It!

```bash
npm run dev
```

Then:
1. Register a new account or login
2. Book a consultation
3. Check your email inbox for confirmation!

---

## ✅ What Emails Will Be Sent?

Once configured, the system automatically sends:

| Action | Email Sent |
|--------|-----------|
| Book consultation | ✅ Booking confirmation with details |
| Forgot password | ✅ Password reset link (1 hour expiry) |
| Doctor issues prescription | ✅ Prescription notification |
| Password changed | ✅ Password reset confirmation |

---

## 🔧 Troubleshooting

### "Invalid login" error
- ✅ Make sure you're using the **App Password**, not your regular Gmail password
- ✅ Remove any spaces from the app password in .env file
- ✅ Ensure 2-Step Verification is enabled

### Emails not arriving
- ✅ Check spam/junk folder
- ✅ Verify EMAIL_USER is correct in .env
- ✅ Check server console for error messages
- ✅ Restart the server after changing .env

### "Less secure app" error
- ✅ Use App Password (see Step 1 above)
- ✅ Don't use "Allow less secure apps" option

---

## 🎯 Alternative: SendGrid (Production Recommended)

If you need more reliability or higher volume:

### Step 1: Sign Up
- Go to: https://sendgrid.com
- Free tier: 100 emails/day forever

### Step 2: Get API Key
1. Login to SendGrid
2. Go to **Settings** → **API Keys**
3. Click **Create API Key**
4. Name: **CuraLine**
5. Permissions: **Full Access**
6. Click **Create & View**
7. **Copy the API key** (starts with `SG.`)

### Step 3: Update .env
```env
EMAIL_PROVIDER=sendgrid
EMAIL_USER=noreply@yourdomain.com
SENDGRID_API_KEY=SG.your-api-key-here
EMAIL_FROM_NAME=CuraLine Health
CLIENT_URL=http://localhost:3000
```

---

## 📝 Email Templates Included

All emails use professional HTML templates with:
- ✅ CuraLine branding
- ✅ Gradient header design
- ✅ Responsive layout
- ✅ Call-to-action buttons
- ✅ Professional footer

Templates are in: `server/services/emailService.js`

---

## 🔒 Security Notes

- ✅ Never commit `.env` file to Git (already in .gitignore)
- ✅ Use App Passwords, not regular passwords
- ✅ For production, use SendGrid or similar service
- ✅ Keep API keys secret

---

## 🧪 Testing Without Email Setup

If you don't want to configure email yet:

**The system will still work!**

Emails will be logged to the server console instead:

```
📧 ========== SIMULATED EMAIL ==========
To: patient@example.com
Subject: Booking Confirmation - CuraLine
Content: [email content]
========================================
```

This is perfect for development and testing.

---

## 📞 Need Help?

1. Check server console for error messages
2. Verify .env file syntax (no quotes needed)
3. Restart server after changing .env
4. See full guide: `EMAIL_AND_WEBRTC_SETUP.md`

---

**Last Updated:** October 9, 2025
