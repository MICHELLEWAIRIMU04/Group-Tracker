import React, { useState, useEffect } from 'react';
import { getMembers, getGroupActivities } from '../api';

const ContributionForm = ({ 
  onSubmit, 
  onCancel, 
  initialData = null, 
  fixedUserId = null,
  groupId = null
}) => {
  const [formData, setFormData] = useState({
    user_id: fixedUserId || '',
    activity_id: '',
    contribution_type: 'money',
    amount: '',
    currency: 'USD',
    description: ''
  });
  
  const [users, setUsers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Currency options
  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
    { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
    { code: 'ZAR', symbol: 'R', name: 'South African Rand' }
  ];
  
  useEffect(() => {
    // If initialData is provided, initialize form with it
    if (initialData) {
      setFormData({
        user_id: initialData.user_id || '',
        activity_id: initialData.activity_id || '',
        contribution_type: initialData.contribution_type || 'money',
        amount: initialData.amount || '',
        currency: initialData.currency || 'USD',
        description: initialData.description || ''
      });
    }
    
    // Load users and activities
    const fetchData = async () => {
      setLoading(true);
      setError('');
      
      try {
        // Fetch users using the API function
        const userData = await getMembers();
        setUsers(userData);
        
        // Fetch activities for the specific group
        if (groupId) {
          // Use the API function to get activities for the group
          const activitiesData = await getGroupActivities(groupId);
          setActivities(activitiesData);
        } else {
          // If no groupId is provided, we can't fetch activities
          // This is because all activities need a group ID in your API
          setError('Group ID is required to fetch activities');
          setActivities([]);
        }
      } catch (err) {
        setError('Failed to load form data: ' + (err.message || 'Unknown error'));
        console.error('Error loading form data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [initialData, groupId]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Convert amount to a number
    const submissionData = {
      ...formData,
      amount: parseFloat(formData.amount)
    };
    
    // If it's editing an existing contribution, include the ID
    if (initialData && initialData.id) {
      submissionData.id = initialData.id;
    }
    
    // Additionally pass the groupId back if it was provided
    if (groupId) {
      submissionData.group_id = groupId;
    }
    
    onSubmit(submissionData);
  };
  
  if (loading) {
    return <div className="loading-state">Loading form data...</div>;
  }
  
  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error-message">{error}</div>}
      
      {!fixedUserId && (
        <div className="form-group">
          <label htmlFor="user_id">Member</label>
          <select
            id="user_id"
            name="user_id"
            value={formData.user_id}
            onChange={handleChange}
            required
          >
            <option value="">Select a member</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.username}
              </option>
            ))}
          </select>
        </div>
      )}
      
      <div className="form-group">
        <label htmlFor="activity_id">Activity</label>
        <select
          id="activity_id"
          name="activity_id"
          value={formData.activity_id}
          onChange={handleChange}
          required
        >
          <option value="">Select an activity</option>
          {activities.map(activity => (
            <option key={activity.id} value={activity.id}>
              {activity.name}
            </option>
          ))}
        </select>
        {!groupId && <div className="helper-text error-text">A group must be selected to load activities</div>}
      </div>
      
      <div className="form-group">
        <label htmlFor="contribution_type">Contribution Type</label>
        <select
          id="contribution_type"
          name="contribution_type"
          value={formData.contribution_type}
          onChange={handleChange}
          required
        >
          <option value="money">Money</option>
          <option value="time">Time</option>
        </select>
      </div>
      
      <div className="form-group">
        <label htmlFor="amount">
          {formData.contribution_type === 'money' ? 'Amount' : 'Time (minutes)'}
        </label>
        <input
          type="number"
          id="amount"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          placeholder={formData.contribution_type === 'money' ? 'Enter amount' : 'Enter time in minutes'}
          min="0"
          step={formData.contribution_type === 'money' ? '0.01' : '1'}
          required
        />
        
        {formData.contribution_type === 'time' && (
          <div className="helper-text">
            Example: 90 minutes = 1 hour and 30 minutes
          </div>
        )}
      </div>
      
      {formData.contribution_type === 'money' && (
        <div className="form-group">
          <label htmlFor="currency">Currency</label>
          <select
            id="currency"
            name="currency"
            value={formData.currency}
            onChange={handleChange}
            required
          >
            {currencies.map(currency => (
              <option key={currency.code} value={currency.code}>
                {currency.code} - {currency.name} ({currency.symbol})
              </option>
            ))}
          </select>
        </div>
      )}
      
      <div className="form-group">
        <label htmlFor="description">Description (Optional)</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter a brief description"
          rows="3"
        ></textarea>
      </div>
      
      <div className="form-actions">
        <button
          type="button"
          className="cancel-button"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="submit-button"
          disabled={!groupId || activities.length === 0}
        >
          {initialData ? 'Update' : 'Add'} Contribution
        </button>
      </div>
    </form>
  );
};

export default ContributionForm;