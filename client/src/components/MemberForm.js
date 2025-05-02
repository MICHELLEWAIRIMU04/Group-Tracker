import React, { useState } from 'react';

const MemberForm = ({ onSubmit, onCancel, initialData = {} }) => {
  const [username, setUsername] = useState(initialData.username || '');
  const [email, setEmail] = useState(initialData.email || '');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(initialData.is_admin || false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Form validation
  const validateForm = () => {
    if (!username || !email || (!initialData.id && !password)) {
      setError('Required fields cannot be empty');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    if (password && password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const memberData = {
        username,
        email,
        is_admin: isAdmin,
      };
      
      // Only include password if it's provided (for new members or password changes)
      if (password) {
        memberData.password = password;
      }
      
      // If we have an ID, it's an update operation
      if (initialData.id) {
        memberData.id = initialData.id;
      }
      
      await onSubmit(memberData);
    } catch (err) {
      setError('Failed to save member data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="data-form">
      {error && <div className="error-message">{error}</div>}
      
      <div className="form-group">
        <label htmlFor="username">Username*</label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter username"
          disabled={loading}
          required
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="email">Email*</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email"
          disabled={loading}
          required
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="password">
          {initialData.id ? 'Password (leave blank to keep current)' : 'Password*'}
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={initialData.id ? "Enter new password" : "Enter password"}
          disabled={loading}
          required={!initialData.id}
        />
      </div>
      
      <div className="form-group checkbox-group">
        <label>
          <input
            type="checkbox"
            checked={isAdmin}
            onChange={(e) => setIsAdmin(e.target.checked)}
            disabled={loading}
          />
          Admin privileges
        </label>
      </div>
      
      <div className="form-actions">
        <button 
          type="button" 
          className="cancel-button"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </button>
        <button 
          type="submit" 
          className="submit-button"
          disabled={loading}
        >
          {loading ? 'Saving...' : initialData.id ? 'Update Member' : 'Add Member'}
        </button>
      </div>
    </form>
  );
};

export default MemberForm;