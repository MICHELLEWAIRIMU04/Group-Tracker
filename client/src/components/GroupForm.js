import React, { useState } from 'react';

const GroupForm = ({ onSubmit, onCancel, initialData = null }) => {
  const [formData, setFormData] = useState({
    name: initialData ? initialData.name : '',
    description: initialData ? initialData.description : ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // If initialData has an ID, we're editing an existing group
      if (initialData && initialData.id) {
        await onSubmit({ ...formData, id: initialData.id });
      } else {
        await onSubmit(formData);
      }
    } catch (err) {
      setError('Failed to submit group data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error-message">{error}</div>}
      
      <div className="form-group">
        <label htmlFor="name">Group Name</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter group name"
          required
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="description">Description (Optional)</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter a brief description of the group's purpose"
          rows="3"
        ></textarea>
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
          {loading 
            ? (initialData ? 'Updating...' : 'Creating...') 
            : (initialData ? 'Update Group' : 'Create Group')}
        </button>
      </div>
    </form>
  );
};

export default GroupForm;