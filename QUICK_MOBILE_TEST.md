# 📱 Quick Mobile Video Test Guide

## 🚀 Fast Setup (5 Minutes)

### **Step 1: Start Server**
```bash
npm run dev
```

### **Step 2: Get Your Local IP**
**Windows:**
```bash
ipconfig
# Look for "IPv4 Address" (e.g., 192.168.1.100)
```

**Mac/Linux:**
```bash
ifconfig | grep "inet "
# Look for your local IP (e.g., 192.168.1.100)
```

### **Step 3: Test on Mobile**
1. Open mobile browser (Safari on iOS, Chrome on Android)
2. Go to: `http://YOUR_IP:3000`
3. Login with test account:
   - Email: `patient@example.com`
   - Password: `patient123`
4. Navigate to a consultation room
5. **Grant camera/microphone permissions**
6. Video should display!

---

## ✅ Quick Checklist

### **If Video Shows:**
- ✅ Success! Mobile video is working
- ✅ Test camera flip button (🔄 icon)
- ✅ Test with another device joining
- ✅ Test audio quality
- ✅ Test chat functionality

### **If Video Doesn't Show:**
1. **Check permissions** - Did you allow camera/microphone?
2. **Tap the screen** - Autoplay might be blocked
3. **Check console** - Open browser dev tools
4. **Try HTTPS** - Use ngrok if on cellular data
5. **Restart app** - Close and reopen browser

---

## 🔧 Quick Fixes

### **Black Screen?**
```
→ Tap anywhere on the screen
→ Check if camera LED is on
→ Try flipping camera (🔄 button)
```

### **No Permissions Prompt?**
```
iOS: Settings → Safari → Camera/Microphone → Allow
Android: Chrome → Settings → Site Settings → Permissions
```

### **Connection Failed?**
```
→ Check if both devices are on same WiFi
→ Verify server is running (check terminal)
→ Try restarting the server
```

---

## 📊 What to Look For

### **Console Logs (Success):**
```
📱 Mobile device detected: true
🎥 Initializing media with mobile optimizations...
✅ Local media initialized
✅ Local video playing
📹 Received remote stream
✅ Remote video playing
```

### **Console Logs (Error):**
```
❌ Failed to get media: NotAllowedError
→ Fix: Grant permissions in browser settings

⚠️ Autoplay prevented
→ Fix: Tap screen (handled automatically)
```

---

## 🎯 Quick Test Scenarios

### **Test 1: Solo Test (1 device)**
1. Join a consultation room
2. Should see your own video (local)
3. Camera flip button should appear
4. Try flipping camera

### **Test 2: Two Devices (Desktop + Mobile)**
1. Desktop: Join room as doctor
2. Mobile: Join same room as patient
3. Both should see each other's video
4. Test audio by speaking
5. Test chat messages

### **Test 3: Two Mobile Devices**
1. Phone 1: Join as doctor
2. Phone 2: Join as patient
3. Both should see video
4. Test camera flip on both
5. Test audio quality

---

## 🆘 Emergency Troubleshooting

### **Nothing Works?**
1. Restart server: `Ctrl+C` then `npm run dev`
2. Clear browser cache
3. Try different browser
4. Restart mobile device
5. Check [MOBILE_VIDEO_GUIDE.md](MOBILE_VIDEO_GUIDE.md) for details

### **Need HTTPS?**
```bash
# Install ngrok: https://ngrok.com/download
# Then run:
ngrok http 5000

# Use the HTTPS URL on mobile
# Example: https://abc123.ngrok.io
```

---

## 📱 Device-Specific Tips

### **iPhone/iPad:**
- Use Safari (best compatibility)
- Ensure iOS 11 or higher
- Video displays inline (not fullscreen)
- Front camera is default

### **Android:**
- Use Chrome (recommended)
- Ensure Android 7 or higher
- May need to tap to start video
- Back camera may be default

---

## ✨ Features to Test

- [ ] Local video displays
- [ ] Remote video displays
- [ ] Audio works both ways
- [ ] Camera flip button (mobile only)
- [ ] Video on/off toggle
- [ ] Audio mute/unmute
- [ ] Chat messages
- [ ] Screen sharing (desktop only)
- [ ] End call button

---

## 🎉 Success Indicators

**You'll know it's working when:**
1. ✅ You see your own face (local video)
2. ✅ You see the other person (remote video)
3. ✅ You can hear each other
4. ✅ Camera flip button appears (mobile)
5. ✅ No error messages in console

---

## 📞 Support

**Still stuck?** Check these files:
- 📱 [MOBILE_VIDEO_GUIDE.md](MOBILE_VIDEO_GUIDE.md) - Detailed guide
- 🔧 [MOBILE_VIDEO_FIXES.md](MOBILE_VIDEO_FIXES.md) - Technical details
- 📘 [QUICK_FIX_GUIDE.md](QUICK_FIX_GUIDE.md) - General troubleshooting

---

**Quick Test Time:** ~5 minutes  
**Full Test Time:** ~15 minutes  
**Difficulty:** Easy 🟢
