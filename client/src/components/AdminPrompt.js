import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const AdminPrompt = ({ onClose }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { adminLogin } = useContext(AuthContext);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (!username || !password) {
      setError('Please enter both username and password');
      setLoading(false);
      return;
    }
    
    try {
      const result = await adminLogin(username, password);
      
      if (result.success) {
        onClose();
      } else {
        setError(result.error || 'Invalid credentials or not admin');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="admin-prompt-overlay">
      <div className="admin-prompt-container">
        <h2>Admin Login</h2>
        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="admin-username">Admin Username</label>
            <input
              id="admin-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter admin username"
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="admin-password">Admin Password</label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              disabled={loading}
            />
          </div>
          
          <div className="prompt-actions">
            <button 
              type="button" 
              className="cancel-button"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="submit-button"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login as Admin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminPrompt;