@echo off
echo ========================================
echo CuraLine WebRTC Testing Setup
echo ========================================
echo.

echo Step 1: Finding your local IP address...
echo.
ipconfig | findstr /i "IPv4"
echo.
echo Copy one of the IPv4 addresses above (e.g., 192.168.1.100)
echo.

echo Step 2: Running connection diagnostics...
echo.
call npm run test-connection
echo.

echo ========================================
echo Next Steps:
echo ========================================
echo.
echo 1. Create client\.env file with:
echo    REACT_APP_SOCKET_URL=http://YOUR_IP:5000
echo    REACT_APP_API_URL=http://YOUR_IP:5000
echo.
echo 2. Create server\.env file with:
echo    PORT=5000
echo    CLIENT_URL=*
echo    MONGODB_URI=mongodb://localhost:27017/curaline
echo.
echo 3. Start the server:
echo    cd server
echo    npm start
echo.
echo 4. Start the client (in another terminal):
echo    cd client
echo    npm start
echo.
echo 5. Access from other devices:
echo    http://YOUR_IP:3000
echo.
echo ========================================
echo For detailed instructions, see:
echo - QUICK_FIX_GUIDE.md
echo - WEBRTC_SETUP_GUIDE.md
echo ========================================
echo.
pause
