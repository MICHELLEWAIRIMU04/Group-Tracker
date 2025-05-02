import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import AdminPrompt from './AdminPrompt';

const Header = () => {
  const { currentUser, isAdmin, logout } = useContext(AuthContext);
  const [showAdminPrompt, setShowAdminPrompt] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const toggleAdminPrompt = () => {
    setShowAdminPrompt(!showAdminPrompt);
  };

  return (
    <header className="app-header">
      <div className="header-container">
        <div className="logo">
          <Link to="/dashboard">Project Tracker</Link>
        </div>
        <div className="header-right">
          {currentUser && (
            <>
              <span className="username">
                Hello, {currentUser.username}
                {isAdmin && <span className="admin-badge">Admin</span>}
              </span>
              {!isAdmin && (
                <button 
                  className="admin-button" 
                  onClick={toggleAdminPrompt}
                >
                  Switch to Admin
                </button>
              )}
              <button 
                className="logout-button" 
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
      {showAdminPrompt && (
        <AdminPrompt onClose={() => setShowAdminPrompt(false)} />
      )}
    </header>
  );
};

export default Header;