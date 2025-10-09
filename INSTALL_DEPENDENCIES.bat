@echo off
echo ========================================
echo CuraLine - Installing Dependencies
echo ========================================
echo.

echo [1/3] Installing backend dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Backend installation failed!
    pause
    exit /b 1
)

echo.
echo [2/3] Installing frontend dependencies...
cd client
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Frontend installation failed!
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo [3/3] Verifying installations...
echo.
echo Backend packages installed:
call npm list --depth=0 | findstr "nodemailer socket.io"
echo.
echo Frontend packages installed:
cd client
call npm list --depth=0 | findstr "socket.io-client"
cd ..

echo.
echo ========================================
echo ✅ Installation Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Configure .env file with email credentials
echo 2. Run: npm run seed
echo 3. Run: npm run dev
echo.
echo See EMAIL_AND_WEBRTC_SETUP.md for detailed setup instructions.
echo.
pause
