import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getActivities, createActivity, deleteActivity } from '../api';
import ActivityForm from '../components/ActivityForm';

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [activityStats, setActivityStats] = useState({});
  
  const { isAdmin } = useContext(AuthContext);
  
  useEffect(() => {
    fetchActivities();
  }, []);
  
  const fetchActivities = async () => {
    try {
      setLoading(true);
      const data = await getActivities();
      setActivities(data);
      
      // Calculate statistics for each activity
      const stats = {};
      // Using Promise.all to handle multiple fetches in parallel
      await Promise.all(data.map(async (activity) => {
        const activityDetail = await fetch(`http://127.0.0.1:5000/api/activities/${activity.id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }).then(res => res.json());
        
        const totalContribution = activityDetail.contributions 
          ? activityDetail.contributions.reduce((sum, contrib) => sum + contrib.amount, 0)
          : 0;
          
        const contributorCount = activityDetail.contributions 
          ? new Set(activityDetail.contributions.map(contrib => contrib.user_id)).size
          : 0;
        
        stats[activity.id] = {
          totalContribution,
          contributorCount
        };
      }));
      
      setActivityStats(stats);
      setError('');
    } catch (err) {
      setError('Failed to load activities');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddActivity = async (activityData) => {
    try {
      const result = await createActivity(activityData);
      if (result.activity) {
        setActivities([...activities, result.activity]);
        setShowAddForm(false);
        
        // Initialize stats for the new activity
        setActivityStats({
          ...activityStats,
          [result.activity.id]: {
            totalContribution: 0,
            contributorCount: 0
          }
        });
      } else {
        setError(result.message || 'Failed to add activity');
      }
    } catch (err) {
      setError('Something went wrong');
      console.error(err);
    }
  };
  
  const handleDeleteActivity = async (id) => {
    try {
      const result = await deleteActivity(id);
      if (result.message === 'Activity deleted successfully') {
        setActivities(activities.filter(activity => activity.id !== id));
        setConfirmDelete(null);
        
        // Remove stats for deleted activity
        const newStats = { ...activityStats };
        delete newStats[id];
        setActivityStats(newStats);
      } else {
        setError(result.message || 'Failed to delete activity');
      }
    } catch (err) {
      setError('Something went wrong');
      console.error(err);
    }
  };
  
  if (loading) {
    return <div className="loading-state">Loading activities...</div>;
  }
  
  return (
    <div className="activities-container">
      <div className="page-header">
        <h1>Activities</h1>
        {isAdmin && (
          <button 
            className="add-button"
            onClick={() => setShowAddForm(true)}
          >
            Add Activity
          </button>
        )}
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {showAddForm && (
        <div className="form-modal">
          <div className="form-container">
            <h2>Add New Activity</h2>
            <ActivityForm 
              onSubmit={handleAddActivity}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        </div>
      )}
      
      {confirmDelete && (
        <div className="confirm-modal">
          <div className="confirm-container">
            <h2>Confirm Delete</h2>
            <p>Are you sure you want to delete {confirmDelete.name}?</p>
            {activityStats[confirmDelete.id]?.contributorCount > 0 && (
              <p className="warning-text">
                Warning: This activity has {activityStats[confirmDelete.id].contributorCount} contributors 
                and ${activityStats[confirmDelete.id].totalContribution.toFixed(2)} in contributions 
                that will also be deleted.
              </p>
            )}
            <div className="confirm-actions">
              <button 
                className="cancel-button"
                onClick={() => setConfirmDelete(null)}
              >
                Cancel
              </button>
              <button 
                className="delete-button"
                onClick={() => handleDeleteActivity(confirmDelete.id)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      {activities.length > 0 ? (
        <div className="activities-grid">
          {activities.map(activity => (
            <div key={activity.id} className="activity-card">
              <h3 className="activity-name">{activity.name}</h3>
              <p className="activity-description">
                {activity.description || 'No description provided'}
              </p>
              <div className="activity-stats">
                <div className="stat-item">
                  <span className="stat-label">Contributors:</span>
                  <span className="stat-value">
                    {activityStats[activity.id]?.contributorCount || 0}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Total Amount:</span>
                  <span className="stat-value">
                    ${activityStats[activity.id]?.totalContribution.toFixed(2) || '0.00'}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Created:</span>
                  <span className="stat-value">
                    {new Date(activity.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              {isAdmin && (
                <div className="activity-actions">
                  <button 
                    className="delete-button"
                    onClick={() => setConfirmDelete(activity)}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>No activities found.</p>
          {isAdmin && (
            <button 
              className="add-button"
              onClick={() => setShowAddForm(true)}
            >
              Add First Activity
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Activities;