import React from 'react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="home-container">
      <div className="hero-section">
        <h1>About Group Tracker</h1>
        <p className="tagline">Our Story and Mission</p>
        <p className="description">
          Group Tracker was developed to provide a simple yet powerful solution for teams and organizations
          to track activities, members, and contributions. Our mission is to help you manage your projects more efficiently.
        </p>
      </div>
      
      <div className="features-section">
        <h2>How It Works</h2>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">1️⃣</div>
            <h3>Create Activities</h3>
            <p>Start by creating activities that represent the different initiatives or projects your team is working on.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">2️⃣</div>
            <h3>Add Members</h3>
            <p>Register the individuals who will be contributing to your projects with their contact details.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">3️⃣</div>
            <h3>Record Contributions</h3>
            <p>Log the various contributions (financial or otherwise) made by members to different activities.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">4️⃣</div>
            <h3>Track Progress</h3>
            <p>Use the dashboard and detailed reports to monitor progress and make informed decisions.</p>
          </div>
        </div>
      </div>
      
      <div className="features-section">
        <h2>Key Features</h2>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Secure Access</h3>
            <p>Role-based permission system ensures only authorized users can access sensitive information.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>Responsive Design</h3>
            <p>Access your project information from any device - desktop, tablet, or mobile phone.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Comprehensive Dashboard</h3>
            <p>Get an overview of all activities, contributions, and member participation at a glance.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🔍</div>
            <h3>Detailed Reporting</h3>
            <p>Generate reports on activities, members, and contributions to track project success.</p>
          </div>
        </div>
      </div>
      
      <div className="cta-section">
        <h2>Ready to Get Started?</h2>
        <p>Join thousands of teams already using Project Tracker to manage their projects effectively.</p>
        
        <div className="hero-buttons">
          <Link to="/register" className="primary-button">
            Sign Up Now
          </Link>
          <Link to="/" className="secondary-button">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default About;