/**
 * WebRTC Connection Test Script
 * Run this to diagnose connection issues
 */

const os = require('os');
const http = require('http');

console.log('\n🔍 CuraLine WebRTC Connection Diagnostics\n');
console.log('='.repeat(50));

// 1. Check Network Interfaces
console.log('\n📡 Network Interfaces:');
const interfaces = os.networkInterfaces();
Object.keys(interfaces).forEach(name => {
  interfaces[name].forEach(iface => {
    if (iface.family === 'IPv4' && !iface.internal) {
      console.log(`   ✓ ${name}: ${iface.address}`);
      console.log(`     Use this IP for local network testing:`);
      console.log(`     Client: http://${iface.address}:3000`);
      console.log(`     Server: http://${iface.address}:5000`);
    }
  });
});

// 2. Check if server is running
console.log('\n🔌 Checking Server Status:');
const checkServer = (port) => {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}/api/health`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          console.log(`   ✓ Server is running on port ${port}`);
          console.log(`   ✓ Version: ${json.version || 'N/A'}`);
          console.log(`   ✓ Status: ${json.status || 'N/A'}`);
          resolve(true);
        } catch (e) {
          console.log(`   ⚠ Server responded but with invalid JSON`);
          resolve(false);
        }
      });
    });
    
    req.on('error', () => {
      console.log(`   ✗ Server is NOT running on port ${port}`);
      console.log(`   → Start server with: cd server && npm start`);
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      console.log(`   ✗ Server connection timeout`);
      req.destroy();
      resolve(false);
    });
  });
};

// 3. Check environment files
console.log('\n📄 Environment Configuration:');
const fs = require('fs');
const path = require('path');

const checkEnvFile = (filePath, name) => {
  if (fs.existsSync(filePath)) {
    console.log(`   ✓ ${name} exists`);
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('REACT_APP_SOCKET_URL') || content.includes('CLIENT_URL')) {
      console.log(`   ✓ Contains required variables`);
    }
  } else {
    console.log(`   ⚠ ${name} not found`);
    console.log(`   → Copy from ${name}.example`);
  }
};

checkEnvFile(path.join(__dirname, 'server', '.env'), 'server/.env');
checkEnvFile(path.join(__dirname, 'client', '.env'), 'client/.env');

// 4. Check dependencies
console.log('\n📦 Dependencies:');
const checkPackage = (dir, name) => {
  const packagePath = path.join(__dirname, dir, 'package.json');
  if (fs.existsSync(packagePath)) {
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    
    const required = dir === 'server' 
      ? ['socket.io', 'express', 'cors']
      : ['socket.io-client', 'react', 'axios'];
    
    required.forEach(dep => {
      if (deps[dep]) {
        console.log(`   ✓ ${name}: ${dep} installed`);
      } else {
        console.log(`   ✗ ${name}: ${dep} missing`);
        console.log(`   → Run: cd ${dir} && npm install`);
      }
    });
  }
};

checkPackage('server', 'Server');
checkPackage('client', 'Client');

// Run async checks
(async () => {
  await checkServer(5000);
  
  console.log('\n' + '='.repeat(50));
  console.log('\n📋 Next Steps:\n');
  console.log('1. Ensure server is running: cd server && npm start');
  console.log('2. Ensure client is running: cd client && npm start');
  console.log('3. Configure .env files with your local IP address');
  console.log('4. Open browser console to see detailed WebRTC logs');
  console.log('5. Check WEBRTC_SETUP_GUIDE.md for detailed instructions');
  console.log('\n💡 For testing between devices:');
  console.log('   - Both devices must be on the same WiFi network');
  console.log('   - Use your local IP address (shown above)');
  console.log('   - Allow Node.js through your firewall');
  console.log('\n');
})();
