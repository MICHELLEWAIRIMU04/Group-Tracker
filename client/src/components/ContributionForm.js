import React, { useState, useEffect } from 'react';
import { getActivities, getMembers } from '../api';

const ContributionForm = ({ onSubmit, onCancel, initialData = {}, fixedUserId = null }) => {
  const [amount, setAmount] = useState(initialData.amount || '');
  const [description, setDescription] = useState(initialData.description || '');
  const [activityId, setActivityId] = useState(initialData.activity_id || '');
  const [userId, setUserId] = useState(initialData.user_id || fixedUserId || '');
  
  const [activities, setActivities] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const [activitiesData, membersData] = await Promise.all([
          getActivities(),
          fixedUserId ? null : getMembers() // Only fetch members if needed
        ]);
        
        setActivities(activitiesData);
        if (membersData) {
          setMembers(membersData);
        }
        
        // Set default activity if none selected and options available
        if (!activityId && activitiesData.length > 0) {
          setActivityId(activitiesData[0].id);
        }
        
        // Set default user if none selected and options available
        if (!fixedUserId && !userId && membersData && membersData.length > 0) {
          setUserId(membersData[0].id);
        }
      } catch (err) {
        setError('Failed to load form data');
        console.error(err);
      } finally {
        setFormLoading(false);
      }
    };
    
    fetchFormData();
  }, [fixedUserId, activityId, userId]);
  
  // Form validation
  const validateForm = () => {
    if (!amount || !activityId || (!fixedUserId && !userId)) {
      setError('Please fill in all required fields');
      return false;
    }
    
    if (isNaN(amount) || parseFloat(amount) <= 0) {
      setError('Please enter a valid positive amount');
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
      const contributionData = {
        amount: parseFloat(amount),
        description,
        activity_id: parseInt(activityId),
        user_id: parseInt(fixedUserId || userId),
      };
      
      if (initialData.id) {
        contributionData.id = initialData.id;
      }
      
      await onSubmit(contributionData);
    } catch (err) {
      setError('Failed to save contribution');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  if (formLoading) {
    return <div className="loading-state">Loading form data...</div>;
  }
  
  if (activities.length === 0) {
    return (
      <div className="form-error">
        <p>No activities available. Please create activities first.</p>
        <div className="form-actions">
          <button 
            type="button" 
            className="cancel-button"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit} className="data-form">
      {error && <div className="error-message">{error}</div>}
      
      {!fixedUserId && (
        <div className="form-group">
          <label htmlFor="user">Member*</label>
          <select
            id="user"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            disabled={loading || members.length === 0}
            required
          >
            {members.length === 0 ? (
              <option value="">No members available</option>
            ) : (
              members.map(member => (
                <option key={member.id} value={member.id}>
                  {member.username}
                </option>
              ))
            )}
          </select>
        </div>
      )}
      
      <div className="form-group">
        <label htmlFor="activity">Activity*</label>
        <select
          id="activity"
          value={activityId}
          onChange={(e) => setActivityId(e.target.value)}
          disabled={loading}
          required
        >
          {activities.map(activity => (
            <option key={activity.id} value={activity.id}>
              {activity.name}
            </option>
          ))}
        </select>
      </div>
      
      <div className="form-group">
        <label htmlFor="amount">Amount*</label>
        <input
          id="amount"
          type="number"
          step="0.01"
          min="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
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
          placeholder="Enter description (optional)"
          disabled={loading}
          rows={3}
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
          {loading ? 'Saving...' : initialData.id ? 'Update Contribution' : 'Add Contribution'}
        </button>
      </div>
    </form>
  );
};

export default ContributionForm;