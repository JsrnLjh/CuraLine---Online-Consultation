# Quick Fix Guide - WebRTC Connection Issues

## 🚨 Problem: Cannot connect between two devices

### Quick Diagnosis
Run this command to check your setup:
```bash
npm run test-connection
```

### Quick Fix Steps

#### 1️⃣ Find Your Local IP Address
**Windows:**
```powershell
ipconfig
```
Look for "IPv4 Address" (e.g., `192.168.1.100`)

**Mac/Linux:**
```bash
ifconfig | grep "inet "
```

#### 2️⃣ Update Client Environment
Create `client/.env` file:
```env
REACT_APP_SOCKET_URL=http://YOUR_IP:5000
REACT_APP_API_URL=http://YOUR_IP:5000
```
Replace `YOUR_IP` with the IP from step 1.

#### 3️⃣ Update Server Environment
Create `server/.env` file:
```env
PORT=5000
CLIENT_URL=*
MONGODB_URI=mongodb://localhost:27017/curaline
```

#### 4️⃣ Allow Through Firewall
**Windows:**
```powershell
# Run as Administrator
netsh advfirewall firewall add rule name="Node Server" dir=in action=allow protocol=TCP localport=5000
```

**Mac:**
System Preferences → Security & Privacy → Firewall → Allow Node.js

#### 5️⃣ Restart Everything
```bash
# Stop all running processes (Ctrl+C)
# Then restart:
cd server
npm start

# In another terminal:
cd client  
npm start
```

#### 6️⃣ Test Connection
- **Device 1:** Open `http://YOUR_IP:3000`
- **Device 2:** Open `http://YOUR_IP:3000`
- Both devices must be on the **same WiFi network**

---

## 🔍 Common Error Messages

### "Socket connection error: xhr poll error"
**Cause:** Cannot reach server  
**Fix:** 
- Check if server is running
- Verify IP address in `.env` file
- Check firewall settings

### "Failed to get media: NotAllowedError"
**Cause:** Camera/mic permission denied  
**Fix:** 
- Click "Allow" when browser asks for permissions
- Check browser settings → Site permissions
- Try HTTPS instead of HTTP (required by some browsers)

### "ICE connection state: failed"
**Cause:** Cannot establish peer connection  
**Fix:** 
- Already fixed with TURN servers in latest update
- Check if both devices can access internet
- Verify firewall allows UDP traffic

### "Connection timeout"
**Cause:** Network blocking WebSocket  
**Fix:**
- Check corporate firewall/proxy settings
- Try different network (mobile hotspot)
- Use ngrok for testing (see full guide)

---

## ✅ Verification Checklist

Open browser console (F12) and verify you see:

```
✅ 🔌 Connecting to socket server: http://...
✅ ✅ Connected to signaling server: <socket-id>
✅ 🌐 Socket transport: websocket
✅ 🔗 Creating peer connection with ICE servers
✅ 🧊 ICE connection state: connected
✅ ✅ Peer connection established successfully!
```

If you see ❌ or errors, check the specific error message above.

---

## 🆘 Still Not Working?

1. **Test on same device first:**
   - Open two browser windows
   - Use `http://localhost:3000`
   - If this works, issue is network-related

2. **Check both devices are on same WiFi:**
   - Not guest network
   - Not VPN active
   - Not mobile data

3. **Try different browser:**
   - Chrome (recommended)
   - Firefox
   - Edge

4. **Check server logs:**
   - Look for connection attempts
   - Verify users joining rooms

5. **Read full guide:**
   - See `WEBRTC_SETUP_GUIDE.md` for detailed instructions

---

## 📱 Testing with Phone

1. Make sure phone is on **same WiFi** as computer
2. On phone, open browser and go to: `http://YOUR_COMPUTER_IP:3000`
3. Allow camera/microphone permissions
4. Join the same consultation room as computer

---

## 🌐 For Internet Testing (Not Local Network)

Use ngrok:
```bash
# Install ngrok from https://ngrok.com

# Terminal 1 - Expose server
ngrok http 5000

# Copy the https URL (e.g., https://abc123.ngrok.io)

# Update client/.env
REACT_APP_SOCKET_URL=https://abc123.ngrok.io
REACT_APP_API_URL=https://abc123.ngrok.io

# Terminal 2 - Expose client
ngrok http 3000

# Access from any device using the ngrok URLs
```

---

## 💡 Pro Tips

- **Always use HTTPS in production** (WebRTC requirement)
- **Test with Chrome DevTools** → More Tools → WebRTC Internals
- **Monitor network tab** to see failed requests
- **Check console for detailed logs** (we added extensive logging)
- **One change at a time** when troubleshooting

---

## 📞 Support Resources

- Full Setup Guide: `WEBRTC_SETUP_GUIDE.md`
- Test Script: `npm run test-connection`
- WebRTC Stats: `chrome://webrtc-internals/`
- Socket.io Debug: Add `?transport=websocket` to URL
