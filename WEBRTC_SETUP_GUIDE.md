# WebRTC Video Consultation Setup Guide

## Overview
This guide helps you set up video consultations between different devices on your network or over the internet.

## Common Issues and Solutions

### Issue 1: Cannot Connect Between Different Devices

**Problem:** WebSocket/WebRTC connections fail when testing with two different devices.

**Root Causes:**
1. Server URL is set to `localhost` (only works on same machine)
2. CORS restrictions blocking external connections
3. Missing TURN servers for NAT traversal
4. Firewall blocking WebSocket connections

**Solutions Applied:**
✅ Updated Socket.io CORS configuration to allow all origins
✅ Added TURN servers for NAT traversal
✅ Enhanced error logging and diagnostics
✅ Added automatic server URL detection

---

## Setup Instructions

### For Local Network Testing (Same WiFi)

#### Step 1: Find Your Computer's Local IP Address

**On Windows:**
```powershell
ipconfig
```
Look for "IPv4 Address" under your active network adapter (usually something like `192.168.1.x`)

**On Mac/Linux:**
```bash
ifconfig
# or
ip addr show
```
Look for `inet` address (usually `192.168.x.x` or `10.0.x.x`)

#### Step 2: Configure Environment Variables

Create or update `.env` file in the **server** directory:
```env
PORT=5000
CLIENT_URL=*
```

Create or update `.env` file in the **client** directory:
```env
# Replace 192.168.1.100 with your actual local IP address
REACT_APP_SOCKET_URL=http://192.168.1.100:5000
REACT_APP_API_URL=http://192.168.1.100:5000
```

#### Step 3: Start the Server
```bash
cd server
npm start
```
Server should start on `http://0.0.0.0:5000` (accessible from all network interfaces)

#### Step 4: Start the Client
```bash
cd client
npm start
```

#### Step 5: Access from Other Devices
On your other device (phone, tablet, another computer):
- Open browser and go to: `http://192.168.1.100:3000` (replace with your IP)
- Make sure both devices are on the same WiFi network

---

### For Internet/Remote Testing

#### Option 1: Using ngrok (Recommended for Testing)

1. **Install ngrok:**
   - Download from https://ngrok.com/download
   - Sign up for a free account

2. **Expose your server:**
   ```bash
   ngrok http 5000
   ```
   
3. **Note the forwarding URL** (e.g., `https://abc123.ngrok.io`)

4. **Update client .env:**
   ```env
   REACT_APP_SOCKET_URL=https://abc123.ngrok.io
   REACT_APP_API_URL=https://abc123.ngrok.io
   ```

5. **Expose your client (in another terminal):**
   ```bash
   ngrok http 3000
   ```

6. **Access from any device** using the ngrok URLs

#### Option 2: Deploy to Cloud (Production)

Deploy both server and client to a cloud platform:
- **Heroku** (easy, free tier available)
- **AWS** (scalable, more complex)
- **DigitalOcean** (simple VPS)
- **Vercel** (for client) + **Railway** (for server)

---

## Firewall Configuration

### Windows Firewall
Allow Node.js through firewall:
1. Open Windows Defender Firewall
2. Click "Allow an app through firewall"
3. Find Node.js and check both Private and Public
4. Or run as administrator:
   ```powershell
   netsh advfirewall firewall add rule name="Node.js Server" dir=in action=allow protocol=TCP localport=5000
   ```

### Mac Firewall
1. System Preferences → Security & Privacy → Firewall
2. Click "Firewall Options"
3. Add Node.js to allowed apps

### Linux (UFW)
```bash
sudo ufw allow 5000/tcp
sudo ufw allow 3000/tcp
```

---

## TURN Server Configuration

### Current Setup (Public TURN Servers)
The app now uses free public TURN servers from OpenRelay:
- `turn:openrelay.metered.ca:80`
- `turn:openrelay.metered.ca:443`

**Note:** Public TURN servers have limitations (bandwidth, reliability). For production, use your own TURN server.

### Setting Up Your Own TURN Server (Production)

#### Option 1: Using Coturn (Open Source)

1. **Install Coturn:**
   ```bash
   # Ubuntu/Debian
   sudo apt-get install coturn
   
   # Enable as service
   sudo systemctl enable coturn
   ```

2. **Configure `/etc/turnserver.conf`:**
   ```conf
   listening-port=3478
   tls-listening-port=5349
   
   external-ip=YOUR_PUBLIC_IP
   
   realm=yourdomain.com
   server-name=yourdomain.com
   
   lt-cred-mech
   user=username:password
   
   no-tcp-relay
   no-multicast-peers
   ```

3. **Start Coturn:**
   ```bash
   sudo systemctl start coturn
   ```

4. **Update client ICE configuration:**
   ```javascript
   const ICE_SERVERS = {
     iceServers: [
       { urls: 'stun:stun.l.google.com:19302' },
       {
         urls: 'turn:yourdomain.com:3478',
         username: 'username',
         credential: 'password'
       }
     ]
   };
   ```

#### Option 2: Using Managed Services
- **Twilio STUN/TURN** - https://www.twilio.com/stun-turn
- **Xirsys** - https://xirsys.com/
- **Metered** - https://www.metered.ca/tools/openrelay/

---

## Troubleshooting

### Check 1: Verify Server is Running
```bash
curl http://localhost:5000/api/health
```
Should return JSON with server status.

### Check 2: Test Socket Connection
Open browser console on client and check for:
```
🔌 Connecting to socket server: http://...
✅ Connected to signaling server: <socket-id>
🌐 Socket transport: websocket
```

### Check 3: Test WebRTC Connection
In browser console, look for:
```
🔗 Creating peer connection with ICE servers
🧊 ICE gathering state: gathering
🧊 ICE connection state: checking
🧊 ICE connection state: connected
✅ Peer connection established successfully!
```

### Common Error Messages

#### "Socket connection error: xhr poll error"
- **Cause:** Cannot reach server
- **Fix:** Check server URL, firewall, and network connectivity

#### "ICE connection state: failed"
- **Cause:** Cannot establish peer-to-peer connection
- **Fix:** 
  - Ensure TURN servers are configured
  - Check if both devices can reach TURN servers
  - Verify firewall allows UDP traffic

#### "Failed to get media: NotAllowedError"
- **Cause:** Camera/microphone permission denied
- **Fix:** Grant browser permissions for camera and microphone

#### "Failed to get media: NotFoundError"
- **Cause:** No camera/microphone found
- **Fix:** Connect camera/microphone or use device with built-in hardware

---

## Testing Checklist

- [ ] Server starts without errors
- [ ] Client connects to server
- [ ] Socket.io connection established
- [ ] Camera/microphone permissions granted
- [ ] Local video stream appears
- [ ] Second device can join the same room
- [ ] Remote video stream appears
- [ ] Audio is working both ways
- [ ] Video is working both ways
- [ ] Chat messages are delivered
- [ ] Connection survives network hiccups

---

## Network Requirements

### Minimum Bandwidth
- **Video Call:** 1-2 Mbps upload/download per participant
- **HD Video:** 2-4 Mbps upload/download per participant

### Ports Required
- **HTTP/HTTPS:** 80, 443
- **WebSocket:** Same as HTTP (80/443)
- **STUN:** UDP 3478, 19302
- **TURN:** TCP/UDP 3478, 5349, 80, 443

### Browser Requirements
- Chrome 74+
- Firefox 66+
- Safari 12.1+
- Edge 79+

---

## Production Deployment Recommendations

1. **Use HTTPS/WSS:** WebRTC requires secure context in production
2. **Set up your own TURN server:** Don't rely on public TURN servers
3. **Configure proper CORS:** Restrict origins to your domain
4. **Monitor connection quality:** Track ICE connection states
5. **Implement reconnection logic:** Handle network interruptions gracefully
6. **Add bandwidth adaptation:** Adjust video quality based on network
7. **Set up logging:** Monitor WebRTC stats and errors
8. **Test on multiple networks:** WiFi, 4G, 5G, corporate networks

---

## Quick Start Commands

### Start Everything (Development)
```bash
# Terminal 1 - Start server
cd server
npm start

# Terminal 2 - Start client  
cd client
npm start

# Terminal 3 - Check your local IP
ipconfig  # Windows
ifconfig  # Mac/Linux
```

### Access from another device:
```
http://YOUR_LOCAL_IP:3000
```

---

## Support

If you continue to experience issues:

1. **Check browser console** for detailed error messages
2. **Check server logs** for connection attempts
3. **Verify network connectivity** between devices
4. **Test with different browsers** to rule out browser-specific issues
5. **Try on same device first** to verify basic functionality

For more help, check:
- WebRTC Troubleshooting: https://webrtc.github.io/samples/
- Socket.io Documentation: https://socket.io/docs/v4/
- Browser WebRTC Stats: chrome://webrtc-internals/
