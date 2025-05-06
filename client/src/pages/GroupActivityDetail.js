import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ContributionForm from '../components/ContributionForm';

const GroupActivityDetail = () => {
  const { groupId, activityId } = useParams();
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAddContributionForm, setShowAddContributionForm] = useState(false);
  const [confirmDeleteContribution, setConfirmDeleteContribution] = useState(null);
  
  const { currentUser } = useContext(AuthContext);
  
  // Use useCallback to memoize these functions with proper dependency arrays
  const fetchActivityDetails = useCallback(async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/group/${groupId}/activities/${activityId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch activity details');
      }
      
      const data = await response.json();
      setActivity(data);
      setError('');
    } catch (err) {
      setError('Failed to load activity details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [groupId, activityId]);
  
  const checkGroupAdmin = useCallback(async () => {
    try {
      const response = await fetch(`/api/groups/${groupId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch group details');
      }
      
      const data = await response.json();
      
      // Check if current user is an admin
      const currentMember = data.members.find(
        member => member.id === parseInt(currentUser.id)
      );
      
      if (currentMember && currentMember.is_admin) {
        setIsAdmin(true);
      }
    } catch (err) {
      console.error('Error checking admin status:', err);
    }
  }, [groupId, currentUser.id]);
  
  // Now useEffect depends on the memoized functions
  useEffect(() => {
    fetchActivityDetails();
    checkGroupAdmin();
  }, [fetchActivityDetails, checkGroupAdmin]);
  
  const handleAddContribution = async (contributionData) => {
    try {
      const response = await fetch('/api/contributions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(contributionData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add contribution');
      }
      
      fetchActivityDetails();
      setShowAddContributionForm(false);
    } catch (err) {
      setError(err.message || 'Something went wrong');
      console.error(err);
    }
  };
  
  const handleDeleteContribution = async (id) => {
    try {
      const response = await fetch(`/api/contributions/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete contribution');
      }
      
      fetchActivityDetails();
      setConfirmDeleteContribution(null);
    } catch (err) {
      setError(err.message || 'Something went wrong');
      console.error(err);
    }
  };
  
  // Format time for display
  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) {
      return `${mins} minutes`;
    } else if (mins === 0) {
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    } else {
      return `${hours} hour${hours > 1 ? 's' : ''} ${mins} minute${mins > 1 ? 's' : ''}`;
    }
  };
  
  if (loading) {
    return <div className="loading-state">Loading activity details...</div>;
  }
  
  if (!activity) {
    return (
      <div className="error-state">
        <p>Activity not found or you don't have access</p>
        <Link to={`/groups/${groupId}`} className="back-link">Back to Group</Link>
      </div>
    );
  }
  
  return (
    <div className="activity-details-container">
      <div className="page-header">
        <div className="header-left">
          <Link to={`/groups/${groupId}`} className="back-button">
            Back to Group
          </Link>
          <h1>{activity.name}</h1>
        </div>
        
        <div className="header-actions">
          {isAdmin && (
            <button 
              className="add-button"
              onClick={() => setShowAddContributionForm(true)}
            >
              Add Contribution
            </button>
          )}
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="info-card">
        <h2>Activity Information</h2>
        <p className="activity-description">
          {activity.description || 'No description provided'}
        </p>
        
        <div className="activity-totals">
          <h3>Totals</h3>
          
          <div className="totals-grid">
            {/* Money contributions */}
            {Object.keys(activity.totals?.money || {}).length > 0 && (
              <div className="total-section">
                <h4>Money Contributions</h4>
                <ul className="currency-totals">
                  {Object.entries(activity.totals.money).map(([currency, amount]) => (
                    <li key={currency}>
                      <span className="currency-code">{currency}:</span>
                      <span className="currency-amount">{amount.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Time contributions */}
            {activity.totals?.time?.minutes > 0 && (
              <div className="total-section">
                <h4>Time Contributions</h4>
                <p>{formatTime(activity.totals.time.minutes)}</p>
              </div>
            )}
            
            <div className="total-section">
              <h4>Contributors</h4>
              <p>{activity.contributor_count || 0} member{(activity.contributor_count || 0) !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Contributions list */}
      <div className="contributions-card">
        <h2>Contributions</h2>
        
        {activity.contributions && activity.contributions.length > 0 ? (
          <div className="contributions-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Description</th>
                  <th>Date</th>
                  {isAdmin && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {activity.contributions.map(contribution => (
                  <tr key={contribution.id}>
                    <td>{contribution.user}</td>
                    <td>
                      {contribution.contribution_type === 'money'
                        ? 'Money'
                        : 'Time'}
                    </td>
                    <td>
                      {contribution.contribution_type === 'money'
                        ? `${contribution.currency} ${contribution.amount.toFixed(2)}`
                        : formatTime(contribution.amount)}
                    </td>
                    <td>{contribution.description || '-'}</td>
                    <td>{new Date(contribution.date).toLocaleDateString()}</td>
                    {isAdmin && (
                      <td>
                        <button 
                          className="delete-icon"
                          onClick={() => setConfirmDeleteContribution(contribution)}
                        >
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <p>No contributions have been recorded for this activity.</p>
            {isAdmin && (
              <button 
                className="add-button"
                onClick={() => setShowAddContributionForm(true)}
              >
                Add First Contribution
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Add Contribution Form */}
      {showAddContributionForm && (
        <div className="form-modal">
          <div className="form-container">
            <h2>Add Contribution</h2>
            <ContributionForm 
              onSubmit={handleAddContribution}
              onCancel={() => setShowAddContributionForm(false)}
              groupId={groupId}
            />
          </div>
        </div>
      )}
      
      {/* Confirm Delete Modal */}
      {confirmDeleteContribution && (
        <div className="confirm-modal">
          <div className="confirm-container">
            <h2>Confirm Delete</h2>
            <p>
              Are you sure you want to delete this contribution?
            </p>
            {confirmDeleteContribution.contribution_type === 'money' ? (
              <p>
                {confirmDeleteContribution.currency} {confirmDeleteContribution.amount.toFixed(2)} from {confirmDeleteContribution.user}
              </p>
            ) : (
              <p>
                {formatTime(confirmDeleteContribution.amount)} from {confirmDeleteContribution.user}
              </p>
            )}
            <div className="confirm-actions">
              <button 
                className="cancel-button"
                onClick={() => setConfirmDeleteContribution(null)}
              >
                Cancel
              </button>
              <button 
                className="delete-button"
                onClick={() => handleDeleteContribution(confirmDeleteContribution.id)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupActivityDetail;