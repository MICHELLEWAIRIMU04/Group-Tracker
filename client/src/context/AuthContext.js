import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
        setIsAdmin(user.is_admin);
        console.log('User restored from localStorage:', user);
        
        // Verify token is valid format
        if (!storedToken.startsWith('Bearer ') && !storedToken.startsWith('eyJ')) {
          console.warn('Token format may be invalid:', storedToken);
        }
      } catch (e) {
        console.error('Error parsing stored user:', e);
        // Clear invalid data
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    // Validate inputs
    if (!userData || !token) {
      console.error('Invalid login data:', { userData, token });
      return;
    }
    
    console.log('Logging in user:', userData);
    console.log('Token received:', token);
    
    // Store user data and token
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    
    // Update state
    setCurrentUser(userData);
    setIsAdmin(userData.is_admin);
  };

  const adminLogin = async (username, password) => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Admin login failed:', response.status, errorData);
        throw new Error(errorData.message || 'Admin login failed');
      }

      const data = await response.json();
      
      if (!data.token || !data.user) {
        console.error('Invalid response format:', data);
        throw new Error('Invalid response from server');
      }
      
      login(data.user, data.token);
      return { success: true };
    } catch (error) {
      console.error('Admin login error:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setCurrentUser(null);
    setIsAdmin(false);
    console.log('User logged out');
  };

  return (
    <AuthContext.Provider 
      value={{ 
        currentUser, 
        isAdmin, 
        loading, 
        login, 
        logout,
        adminLogin
      }}>
      {children}
    </AuthContext.Provider>
  );
};