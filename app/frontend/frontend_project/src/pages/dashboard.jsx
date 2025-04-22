import React from 'react';
import '../css/dashboard.css';
// I have no idea why its in the middle of the screen
const Dashboard = () => {
  return (
    <div className="dashboard-container">
      {/* Sidebar placeholder */} 
      <div className="sidebar-placeholder">
        <div className="sidebar-section">
          <div className="sidebar-title">RUN ANALYSIS</div>
          <button className="sidebar-btn">
            <span>▶</span>
          </button>
        </div>
        
        <div className="sidebar-section">
          <div className="sidebar-title">SELECT MODEL</div>
          <button className="sidebar-btn active">
            Isolation Forest
          </button>
          <button className="sidebar-btn">
            Random Forest
          </button>
        </div>
      </div>
      
      <div className="dashboard-content">
        <h1>Dashboard Content</h1>
        <p>This is the main content area for your dashboard.</p>
      </div>
    </div>
  );
};

export default Dashboard;