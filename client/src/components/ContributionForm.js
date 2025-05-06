import React, { useState, useEffect } from 'react';


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
      try {
        // Fetch users
        const response = await fetch('/api/members', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        }
        
        // Fetch activities for the specific group
        let endpoint = '/api/activities';
        if (groupId) {
          endpoint = `/api/group/${groupId}/activities`;
        }
        
        const activitiesResponse = await fetch(endpoint, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (activitiesResponse.ok) {
          const activitiesData = await activitiesResponse.json();
          setActivities(activitiesData);
        }
        
      } catch (err) {
        setError('Failed to load form data');
        console.error(err);
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
        >
          {initialData ? 'Update' : 'Add'} Contribution
        </button>
      </div>
    </form>
  );
};

export default ContributionForm;