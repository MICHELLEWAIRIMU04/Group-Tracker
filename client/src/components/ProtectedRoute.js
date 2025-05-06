import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// This component handles protected routes
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useContext(AuthContext);
  
  // If authentication is still loading, show a loading indicator
  if (loading) {
    return <div className="loading-state">Loading...</div>;
  }
  
  // If no user is logged in, redirect to login page
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  // If a user is logged in, render the protected component
  return children;
};

export default ProtectedRoute;