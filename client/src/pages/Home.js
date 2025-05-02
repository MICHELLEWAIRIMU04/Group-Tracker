import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Home = () => {
  const { currentUser } = useContext(AuthContext);
  
  return (
    <div className="home-container">
      <div className="hero-section">
        <h1>Welcome to Project Tracker</h1>
        <p className="tagline">Track, Manage, Succeed</p>
        <p className="description">
          A comprehensive solution for tracking project activities and contributions.
          Keep all your project data organized and easily accessible in one place.
        </p>
        
        <div className="hero-buttons">
          {!currentUser ? (
            <>
              <Link to="/login" className="primary-button">
                Login
              </Link>
              <Link to="/register" className="secondary-button">
                Register
              </Link>
            </>
          ) : (
            <Link to="/dashboard" className="primary-button">
              Go to Dashboard
            </Link>
          )}
        </div>
      </div>
      
      <div className="features-section">
        <h2>Why Choose Project Tracker?</h2>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Activity Tracking</h3>
            <p>Create and manage various project activities with detailed statistics and contribution history.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">👥</div>
            <h3>Member Management</h3>
            <p>Maintain a database of project members and track their individual and collective contributions.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">💰</div>
            <h3>Contribution Records</h3>
            <p>Record and track all financial contributions to different project activities with detailed reports.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">📈</div>
            <h3>Statistical Dashboard</h3>
            <p>Get comprehensive insights with a detailed overview of project progress and member activities.</p>
          </div>
        </div>
      </div>
      
      <div className="cta-section">
        <h2>Ready to Start Tracking Your Projects?</h2>
        <p>Join thousands of teams who use Project Tracker to organize their activities and resources efficiently.</p>
        
        {!currentUser ? (
          <Link to="/register" className="primary-button">
            Create Free Account
          </Link>
        ) : (
          <Link to="/dashboard" className="primary-button">
            Go to Dashboard
          </Link>
        )}
      </div>
      
      <div className="use-cases-section">
        <h2>Perfect For</h2>
        
        <div className="use-cases-grid">
          <div className="use-case">
            <h3>Community Projects</h3>
            <p>Track volunteer hours, donations, and activities for community initiatives and non-profits.</p>
          </div>
          
          <div className="use-case">
            <h3>Team Collaboration</h3>
            <p>Monitor team contributions, resource allocation, and project milestones in one central place.</p>
          </div>
          
          <div className="use-case">
            <h3>Financial Tracking</h3>
            <p>Keep detailed records of all financial contributions and expenses across multiple projects.</p>
          </div>
        </div>
        
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <Link to="/about" className="secondary-button">
            Learn More About Us
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;