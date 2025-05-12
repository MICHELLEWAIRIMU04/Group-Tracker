import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { 
  getGroupActivities, 
  createGroupActivity, 
  deleteGroupActivity, 
  getGroupActivityById,
  getGroups
} from '../api';
import ActivityForm from '../components/ActivityForm';

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [activityStats, setActivityStats] = useState({});
  
  const { isAdmin } = useContext(AuthContext);
  
  // First, fetch available groups
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const groupsData = await getGroups();
        setGroups(groupsData);
        
        // Select the first group by default if available
        if (groupsData && groupsData.length > 0) {
          setSelectedGroupId(groupsData[0].id);
        }
      } catch (err) {
        setError('Failed to load groups');
        console.error('Error fetching groups:', err);
      }
    };
    
    fetchGroups();
  }, []);
  
  // Then, fetch activities for the selected group
  useEffect(() => {
    if (selectedGroupId) {
      fetchActivities(selectedGroupId);
    }
  }, [selectedGroupId]);
  
  const fetchActivities = async (groupId) => {
    try {
      if (!groupId) {
        setError('Please select a group first');
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError('');
      
      // Use the API function to get activities for the selected group
      const data = await getGroupActivities(groupId);
      setActivities(data);
      
      // Calculate statistics for each activity
      const stats = {};
      
      // Using Promise.all to handle multiple fetches in parallel
      if (data && data.length > 0) {
        await Promise.all(data.map(async (activity) => {
          try {
            // Use API function to get activity details
            const activityDetail = await getGroupActivityById(groupId, activity.id);
            
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
          } catch (err) {
            console.error(`Error fetching details for activity ${activity.id}:`, err);
            // Set default values if we couldn't get the details
            stats[activity.id] = {
              totalContribution: 0,
              contributorCount: 0
            };
          }
        }));
      }
      
      setActivityStats(stats);
    } catch (err) {
      setError(err.message || 'Failed to load activities');
      console.error('Error fetching activities:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddActivity = async (activityData) => {
    try {
      if (!selectedGroupId) {
        setError('Please select a group first');
        return;
      }
      
      setError('');
      const result = await createGroupActivity(selectedGroupId, activityData);
      
      if (result && result.activity) {
        // Add the new activity to the list
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
        setError(result?.message || 'Failed to add activity');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
      console.error('Error adding activity:', err);
    }
  };
  
  const handleDeleteActivity = async (id) => {
    try {
      if (!selectedGroupId) {
        setError('Please select a group first');
        return;
      }
      
      setError('');
      const result = await deleteGroupActivity(selectedGroupId, id);
      
      if (result && result.message === 'Activity deleted successfully') {
        // Remove the deleted activity from the list
        setActivities(activities.filter(activity => activity.id !== id));
        setConfirmDelete(null);
        
        // Remove stats for deleted activity
        const newStats = { ...activityStats };
        delete newStats[id];
        setActivityStats(newStats);
      } else {
        setError(result?.message || 'Failed to delete activity');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
      console.error('Error deleting activity:', err);
    }
  };
  
  const handleGroupChange = (e) => {
    setSelectedGroupId(parseInt(e.target.value));
  };
  
  if (loading && !selectedGroupId) {
    return <div className="loading-state">Loading groups...</div>;
  }
  
  if (groups.length === 0) {
    return (
      <div className="error-state">
        <p>You need to create a group first before you can manage activities.</p>
        <a href="/groups" className="button">Go to Groups</a>
      </div>
    );
  }
  
  return (
    <div className="activities-container">
      <div className="page-header">
        <h1>Activities</h1>
        <div className="header-controls">
          <select 
            value={selectedGroupId || ''} 
            onChange={handleGroupChange}
            className="group-selector"
          >
            <option value="">Select a Group</option>
            {groups.map(group => (
              <option key={group.id} value={group.id}>{group.name}</option>
            ))}
          </select>
          
          {isAdmin && selectedGroupId && (
            <button 
              className="add-button"
              onClick={() => setShowAddForm(true)}
            >
              Add Activity
            </button>
          )}
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {showAddForm && selectedGroupId && (
        <div className="form-modal">
          <div className="form-container">
            <h2>Add New Activity to {groups.find(g => g.id === selectedGroupId)?.name}</h2>
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
      
      {selectedGroupId && loading && (
        <div className="loading-state">Loading activities...</div>
      )}
      
      {selectedGroupId && !loading && activities && activities.length > 0 ? (
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
      ) : selectedGroupId && !loading ? (
        <div className="empty-state">
          <p>No activities found in this group.</p>
          {isAdmin && (
            <button 
              className="add-button"
              onClick={() => setShowAddForm(true)}
            >
              Add First Activity
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default Activities;