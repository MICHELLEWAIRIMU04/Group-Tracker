import React, { useState } from 'react';

const ActivityForm = ({ onSubmit, onCancel, initialData = {} }) => {
  const [name, setName] = useState(initialData.name || '');
  const [description, setDescription] = useState(initialData.description || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Form validation
  const validateForm = () => {
    if (!name) {
      setError('Activity name is required');
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
      const activityData = {
        name,
        description,
      };
      
      // If we have an ID, it's an update operation
      if (initialData.id) {
        activityData.id = initialData.id;
      }
      
      await onSubmit(activityData);
    } catch (err) {
      setError('Failed to save activity');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="data-form">
      {error && <div className="error-message">{error}</div>}
      
      <div className="form-group">
        <label htmlFor="name">Activity Name*</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter activity name"
          disabled={loading}
          required
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter activity description (optional)"
          disabled={loading}
          rows={4}
        />
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
          {loading ? 'Saving...' : initialData.id ? 'Update Activity' : 'Add Activity'}
        </button>
      </div>
    </form>
  );
};

export default ActivityForm;