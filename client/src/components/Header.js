import React, { useContext, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import AdminPrompt from './AdminPrompt';

const Header = () => {
  const { currentUser, isAdmin, logout } = useContext(AuthContext);
  const [showAdminPrompt, setShowAdminPrompt] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const toggleAdminPrompt = () => {
    setShowAdminPrompt(!showAdminPrompt);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="app-header">
      <div className="header-container">
        <div className="logo">
          <Link to="/">Project Tracker</Link>
        </div>

        {/* Navigation Links */}
        <nav className={`header-nav ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Home
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            About
          </NavLink>
          {currentUser && (
            <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Dashboard
            </NavLink>
          )}
        </nav>

        <div className="header-right">
          {currentUser ? (
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
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="login-button">Login</Link>
              <Link to="/register" className="register-button">Register</Link>
            </div>
          )}
          
          <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
            <span className="menu-icon">☰</span>
          </button>
        </div>
      </div>
      {showAdminPrompt && (
        <AdminPrompt onClose={() => setShowAdminPrompt(false)} />
      )}
    </header>
  );
};

export default Header;