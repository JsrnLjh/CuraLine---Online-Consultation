import React from 'react';
import './LoadingScreen.css';

function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <img src="/logo.png" alt="CuraLine" className="loading-logo" />
        <h2>CuraLine</h2>
        <p>Your Personalized Health Partner</p>
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      </div>
    </div>
  );
}

export default LoadingScreen;
