import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <p>
          &copy; {currentYear} Project Tracker. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;