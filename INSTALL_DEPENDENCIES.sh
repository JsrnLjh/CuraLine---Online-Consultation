#!/bin/bash

echo "========================================"
echo "CuraLine - Installing Dependencies"
echo "========================================"
echo ""

echo "[1/3] Installing backend dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Backend installation failed!"
    exit 1
fi

echo ""
echo "[2/3] Installing frontend dependencies..."
cd client
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Frontend installation failed!"
    cd ..
    exit 1
fi
cd ..

echo ""
echo "[3/3] Verifying installations..."
echo ""
echo "Backend packages installed:"
npm list --depth=0 | grep -E "nodemailer|socket.io"
echo ""
echo "Frontend packages installed:"
cd client
npm list --depth=0 | grep "socket.io-client"
cd ..

echo ""
echo "========================================"
echo "✅ Installation Complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Configure .env file with email credentials"
echo "2. Run: npm run seed"
echo "3. Run: npm run dev"
echo ""
echo "See EMAIL_AND_WEBRTC_SETUP.md for detailed setup instructions."
echo ""
