import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getContributions, createContribution, deleteContribution, updateContribution, getGroups } from '../api';
import ContributionForm from '../components/ContributionForm';

const Contributions = () => {
  const [contributions, setContributions] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editContribution, setEditContribution] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  
  // Only get isAdmin from the AuthContext
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
  
  useEffect(() => {
    fetchContributions();
  }, []);
  
  const fetchContributions = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getContributions();
      setContributions(data);
    } catch (err) {
      setError('Failed to load contributions: ' + (err.message || 'Unknown error'));
      console.error('Error fetching contributions:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddContribution = async (contributionData) => {
    try {
      if (!isAdmin) {
        setError('Admin privileges required to manage contributions');
        return;
      }
      
      setError('');
      const result = await createContribution(contributionData);
      
      if (result && result.contribution) {
        setContributions([...contributions, result.contribution]);
        setShowAddForm(false);
      } else {
        setError(result?.message || 'Failed to add contribution');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
      console.error('Error adding contribution:', err);
    }
  };
  
  const handleUpdateContribution = async (contributionData) => {
    try {
      if (!isAdmin) {
        setError('Admin privileges required to manage contributions');
        return;
      }
      
      setError('');
      const result = await updateContribution(contributionData.id, contributionData);
      
      if (result && result.contribution) {
        setContributions(
          contributions.map(item => 
            item.id === result.contribution.id ? result.contribution : item
          )
        );
        setEditContribution(null);
      } else {
        setError(result?.message || 'Failed to update contribution');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
      console.error('Error updating contribution:', err);
    }
  };
  
  const handleDeleteContribution = async (id) => {
    try {
      if (!isAdmin) {
        setError('Admin privileges required to manage contributions');
        return;
      }
      
      setError('');
      const result = await deleteContribution(id);
      
      if (result && result.message === 'Contribution deleted successfully') {
        setContributions(contributions.filter(item => item.id !== id));
        setConfirmDelete(null);
      } else {
        setError(result?.message || 'Failed to delete contribution');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
      console.error('Error deleting contribution:', err);
    }
  };
  
  const handleGroupChange = (e) => {
    setSelectedGroupId(parseInt(e.target.value));
  };
  
  // Sort contributions by date (newest first)
  const sortedContributions = [...(contributions || [])].sort((a, b) => 
    new Date(b.date || b.created_at) - new Date(a.date || a.created_at)
  );
  
  if (loading && groups.length === 0) {
    return <div className="loading-state">Loading data...</div>;
  }
  
  if (groups.length === 0) {
    return (
      <div className="error-state">
        <p>You need to create a group first before you can manage contributions.</p>
        <a href="/groups" className="button">Go to Groups</a>
      </div>
    );
  }
  
  return (
    <div className="contributions-container">
      <div className="page-header">
        <h1>Contributions</h1>
        <div className="header-controls">
          {isAdmin && (
            <button 
              className="add-button"
              onClick={() => setShowAddForm(true)}
              disabled={!selectedGroupId}
            >
              Add Contribution
            </button>
          )}
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {/* Add Contribution Form Modal */}
      {showAddForm && (
        <div className="form-modal">
          <div className="form-container">
            <h2>Add Contribution</h2>
            <div className="form-group">
              <label htmlFor="group-select">Select Group</label>
              <select
                id="group-select"
                value={selectedGroupId || ''}
                onChange={handleGroupChange}
                className="group-selector"
              >
                <option value="">Select a Group</option>
                {groups.map(group => (
                  <option key={group.id} value={group.id}>{group.name}</option>
                ))}
              </select>
            </div>
            <ContributionForm 
              onSubmit={handleAddContribution}
              onCancel={() => setShowAddForm(false)}
              groupId={selectedGroupId}
            />
          </div>
        </div>
      )}
      
      {/* Edit Contribution Form Modal */}
      {editContribution && (
        <div className="form-modal">
          <div className="form-container">
            <h2>Edit Contribution</h2>
            <div className="form-group">
              <label htmlFor="group-select">Select Group</label>
              <select
                id="group-select"
                value={selectedGroupId || ''}
                onChange={handleGroupChange}
                className="group-selector"
              >
                <option value="">Select a Group</option>
                {groups.map(group => (
                  <option key={group.id} value={group.id}>{group.name}</option>
                ))}
              </select>
            </div>
            <ContributionForm 
              initialData={editContribution}
              onSubmit={handleUpdateContribution}
              onCancel={() => setEditContribution(null)}
              fixedUserId={editContribution.user_id}
              groupId={selectedGroupId}
            />
          </div>
        </div>
      )}
      
      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div className="confirm-modal">
          <div className="confirm-container">
            <h2>Confirm Delete</h2>
            <p>
              Are you sure you want to delete this contribution of 
              ${confirmDelete.amount.toFixed(2)} for {confirmDelete.activity}?
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
                onClick={() => handleDeleteContribution(confirmDelete.id)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Group Selector for Viewing Contributions */}
      <div className="filter-controls">
        <div className="form-group">
          <label htmlFor="filter-group">Filter by Group</label>
          <select
            id="filter-group"
            value={selectedGroupId || ''}
            onChange={handleGroupChange}
            className="group-selector"
          >
            <option value="">All Groups</option>
            {groups.map(group => (
              <option key={group.id} value={group.id}>{group.name}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Contributions Table */}
      {contributions && contributions.length > 0 ? (
        <div className="contributions-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Activity</th>
                <th>Amount</th>
                <th>Description</th>
                <th>Date</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {sortedContributions.map(contribution => (
                <tr key={contribution.id}>
                  <td>{contribution.user}</td>
                  <td>{contribution.activity}</td>
                  <td>
                    {contribution.contribution_type === 'money' 
                      ? `${contribution.currency || 'USD'} ${contribution.amount.toFixed(2)}` 
                      : `${contribution.amount} minutes`}
                  </td>
                  <td>{contribution.description || '-'}</td>
                  <td>{new Date(contribution.date || contribution.created_at).toLocaleDateString()}</td>
                  {isAdmin && (
                    <td>
                      <div className="table-actions">
                        <button 
                          className="edit-icon"
                          onClick={() => setEditContribution(contribution)}
                          title="Edit contribution"
                        >
                          Edit
                        </button>
                        <button 
                          className="delete-icon"
                          onClick={() => setConfirmDelete(contribution)}
                          title="Delete contribution"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <p>No contributions found.</p>
          {isAdmin && (
            <button 
              className="add-button"
              onClick={() => setShowAddForm(true)}
              disabled={!selectedGroupId}
            >
              Add First Contribution
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Contributions;