import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import GroupForm from '../components/GroupForm';

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  
  const { currentUser } = useContext(AuthContext);
  
  useEffect(() => {
    fetchGroups();
  }, []);
  
  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/groups', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch groups');
      }
      
      const data = await response.json();
      setGroups(data);
      setError('');
    } catch (err) {
      setError('Failed to load groups');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddGroup = async (groupData) => {
    try {
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(groupData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create group');
      }
      
      const result = await response.json();
      setGroups([...groups, result.group]);
      setShowAddForm(false);
    } catch (err) {
      setError(err.message || 'Something went wrong');
      console.error(err);
    }
  };
  
  const handleDeleteGroup = async (id) => {
    try {
      const response = await fetch(`/api/groups/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete group');
      }
      
      const result = await response.json();
      
      if (result.message === 'Group deleted successfully') {
        setGroups(groups.filter(group => group.id !== id));
        setConfirmDelete(null);
      } else {
        setError(result.message || 'Failed to delete group');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
      console.error(err);
    }
  };
  
  if (loading) {
    return <div className="loading-state">Loading groups...</div>;
  }
  
  return (
    <div className="groups-container">
      <div className="page-header">
        <h1>My Groups</h1>
        <button 
          className="add-button"
          onClick={() => setShowAddForm(true)}
        >
          Create New Group
        </button>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {showAddForm && (
        <div className="form-modal">
          <div className="form-container">
            <h2>Create New Group</h2>
            <GroupForm 
              onSubmit={handleAddGroup}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        </div>
      )}
      
      {confirmDelete && (
        <div className="confirm-modal">
          <div className="confirm-container">
            <h2>Confirm Delete</h2>
            <p>Are you sure you want to delete the group "{confirmDelete.name}"?</p>
            <p className="warning-text">
              This will permanently delete all activities and contributions associated with this group.
            </p>
            <div className="confirm-actions">
              <button 
                className="cancel-button"
                onClick={() => setConfirmDelete(null)}
              >
                Cancel
              </button>
              <button 
                className="delete-button"
                onClick={() => handleDeleteGroup(confirmDelete.id)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      {groups.length > 0 ? (
        <div className="groups-grid">
          {groups.map(group => (
            <div key={group.id} className="group-card">
              <h3 className="group-name">{group.name}</h3>
              <p className="group-description">
                {group.description || 'No description provided'}
              </p>
              <div className="group-stats">
                <div className="stat-item">
                  <span className="stat-label">Members:</span>
                  <span className="stat-value">{group.member_count}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Created:</span>
                  <span className="stat-value">
                    {new Date(group.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <div className="group-owner">
                {group.owner_id === parseInt(currentUser.id) ? (
                  <span className="owner-badge">You are the owner</span>
                ) : (
                  <span>Owner: {group.owner}</span>
                )}
              </div>
              
              <div className="group-actions">
                <Link 
                  to={`/groups/${group.id}`}
                  className="view-button"
                >
                  View Group
                </Link>
                {group.owner_id === parseInt(currentUser.id) && (
                  <button 
                    className="delete-button"
                    onClick={() => setConfirmDelete(group)}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>You don't have any groups yet.</p>
          <button 
            className="add-button"
            onClick={() => setShowAddForm(true)}
          >
            Create Your First Group
          </button>
        </div>
      )}
    </div>
  );
};

export default Groups;