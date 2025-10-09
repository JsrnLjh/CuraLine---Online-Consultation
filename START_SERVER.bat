@echo off
echo ========================================
echo CuraLine - Starting Server
echo ========================================
echo.

echo [1/3] Checking MongoDB...
sc query MongoDB | find "RUNNING" >nul
if %errorlevel% equ 0 (
    echo    ✅ MongoDB is running
) else (
    echo    ⚠️  MongoDB is not running
    echo    Attempting to start MongoDB...
    net start MongoDB 2>nul
    if %errorlevel% equ 0 (
        echo    ✅ MongoDB started successfully
    ) else (
        echo    ❌ Could not start MongoDB service
        echo    Please start MongoDB manually or run as Administrator
        echo.
        echo    Continuing anyway (will use simulation mode for emails)...
    )
)

echo.
echo [2/3] Checking port 5000...
netstat -ano | findstr :5000 >nul
if %errorlevel% equ 0 (
    echo    ⚠️  Port 5000 is in use
    echo    Killing existing process...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do (
        taskkill /PID %%a /F >nul 2>&1
    )
    timeout /t 2 /nobreak >nul
    echo    ✅ Port cleared
) else (
    echo    ✅ Port 5000 is available
)

echo.
echo [3/3] Starting server...
echo.
echo ========================================
echo Server Output:
echo ========================================
echo.

npm run dev

pause
