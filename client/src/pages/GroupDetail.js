import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  getGroupById, 
  getMembers, 
  addGroupMember, 
  removeGroupMember, 
  createGroupActivity 
} from '../api';

const GroupDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [showAddActivityForm, setShowAddActivityForm] = useState(false);
  const [confirmRemoveMember, setConfirmRemoveMember] = useState(null);
  
  const { currentUser } = useContext(AuthContext);
  
  // Add member form state
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('member');
  const [addMemberError, setAddMemberError] = useState('');
  
  // Add activity form state
  const [newActivityName, setNewActivityName] = useState('');
  const [newActivityDescription, setNewActivityDescription] = useState('');
  const [addActivityError, setAddActivityError] = useState('');
  
  // Active tab state
  const [activeTab, setActiveTab] = useState('members');
  
  // Wrap fetchGroupDetails in useCallback with proper dependency array
  const fetchGroupDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      // Use the API function instead of direct fetch
      const data = await getGroupById(id);
      setGroup(data);
      
      // Check if current user is an admin
      const currentMember = data.members.find(
        member => member.id === parseInt(currentUser.id)
      );
      
      if (currentMember && currentMember.is_admin) {
        setIsAdmin(true);
      }
      
    } catch (err) {
      setError(err.message || 'Failed to load group details');
      console.error('Error fetching group details:', err);
    } finally {
      setLoading(false);
    }
  }, [id, currentUser.id]);
  
  // Now the useEffect uses the memoized fetchGroupDetails function
  useEffect(() => {
    fetchGroupDetails();
  }, [fetchGroupDetails]);
  
  const handleAddMember = async (e) => {
    e.preventDefault();
    setAddMemberError('');
    
    try {
      // First, find the user ID by email using the API function
      const users = await getMembers();
      const userToAdd = users.find(user => user.email === newMemberEmail);
      
      if (!userToAdd) {
        setAddMemberError('User with this email not found');
        return;
      }
      
      // Add the user to the group using the API function
      await addGroupMember(id, userToAdd.id, newMemberRole === 'admin');
      
      // Refresh group details
      fetchGroupDetails();
      setShowAddMemberForm(false);
      setNewMemberEmail('');
      setNewMemberRole('member');
    } catch (err) {
      setAddMemberError(err.message || 'Something went wrong');
      console.error('Error adding member:', err);
    }
  };
  
  const handleAddActivity = async (e) => {
    e.preventDefault();
    setAddActivityError('');
    
    try {
      // Use the API function to create a group activity
      const result = await createGroupActivity(id, {
        name: newActivityName,
        description: newActivityDescription
      });
      
      if (result.activity) {
        // Refresh group details
        fetchGroupDetails();
        setShowAddActivityForm(false);
        setNewActivityName('');
        setNewActivityDescription('');
        
        // Switch to activities tab
        setActiveTab('activities');
      } else {
        setAddActivityError(result.message || 'Failed to create activity');
      }
    } catch (err) {
      setAddActivityError(err.message || 'Something went wrong');
      console.error('Error creating activity:', err);
    }
  };
  
  const handleRemoveMember = async (userId) => {
    try {
      setError('');
      
      // Use the API function to remove member
      await removeGroupMember(id, userId);
      
      // If removing current user, redirect to groups page
      if (parseInt(userId) === parseInt(currentUser.id)) {
        navigate('/groups');
        return;
      }
      
      // Refresh group details
      fetchGroupDetails();
      setConfirmRemoveMember(null);
    } catch (err) {
      setError(err.message || 'Failed to remove member');
      console.error('Error removing member:', err);
    }
  };
  
  if (loading) {
    return <div className="loading-state">Loading group details...</div>;
  }
  
  if (!group) {
    return (
      <div className="error-state">
        <p>{error || 'Group not found or you don\'t have access'}</p>
        <Link to="/groups" className="back-link">Back to Groups</Link>
      </div>
    );
  }
  
  return (
    <div className="group-details-container">
      <div className="page-header">
        <div className="header-left">
          <Link to="/groups" className="back-button">
            Back to Groups
          </Link>
          <h1>{group.name}</h1>
        </div>
        
        <div className="header-actions">
          {(isAdmin || parseInt(currentUser.id) === parseInt(group.owner_id)) && (
            <button 
              className="leave-button"
              onClick={() => setConfirmRemoveMember({ id: currentUser.id, username: currentUser.username })}
            >
              Leave Group
            </button>
          )}
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="group-info-card">
        <p className="group-description">
          {group.description || 'No description provided'}
        </p>
        <div className="group-meta">
          <div className="meta-item">
            <span className="meta-label">Owner:</span>
            <span className="meta-value">{group.owner}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Created:</span>
            <span className="meta-value">
              {new Date(group.created_at).toLocaleDateString()}
            </span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Members:</span>
            <span className="meta-value">{group.member_count}</span>
          </div>
        </div>
      </div>
      
      <div className="group-content">
        <div className="tabs">
          <button 
            className={`tab-button ${activeTab === 'members' ? 'active' : ''}`}
            onClick={() => setActiveTab('members')}
          >
            Members
          </button>
          <button 
            className={`tab-button ${activeTab === 'activities' ? 'active' : ''}`}
            onClick={() => setActiveTab('activities')}
          >
            Activities
          </button>
        </div>
        
        <div className="tab-content">
          {activeTab === 'members' && (
            <div className="members-tab">
              <div className="tab-header">
                <h2>Group Members</h2>
                {isAdmin && (
                  <button 
                    className="add-button"
                    onClick={() => setShowAddMemberForm(true)}
                  >
                    Add Member
                  </button>
                )}
              </div>
              
              {showAddMemberForm && (
                <div className="form-modal">
                  <div className="form-container">
                    <h2>Add New Member</h2>
                    {addMemberError && <div className="error-message">{addMemberError}</div>}
                    <form onSubmit={handleAddMember}>
                      <div className="form-group">
                        <label htmlFor="newMemberEmail">Email</label>
                        <input
                          type="email"
                          id="newMemberEmail"
                          value={newMemberEmail}
                          onChange={(e) => setNewMemberEmail(e.target.value)}
                          placeholder="Enter member's email"
                          required
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="newMemberRole">Role</label>
                        <select
                          id="newMemberRole"
                          value={newMemberRole}
                          onChange={(e) => setNewMemberRole(e.target.value)}
                        >
                          <option value="member">Member</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                      
                      <div className="form-actions">
                        <button
                          type="button"
                          className="cancel-button"
                          onClick={() => setShowAddMemberForm(false)}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="submit-button"
                        >
                          Add Member
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
              
              <div className="members-list">
                {group.members && group.members.map(member => (
                  <div key={member.id} className="member-item">
                    <div className="member-info">
                      <div className="member-name">
                        {member.username}
                        {member.id === group.owner_id && (
                          <span className="owner-badge">Owner</span>
                        )}
                        {member.is_admin && member.id !== group.owner_id && (
                          <span className="admin-badge">Admin</span>
                        )}
                        {member.id === parseInt(currentUser.id) && (
                          <span className="you-badge">You</span>
                        )}
                      </div>
                      <div className="member-email">{member.email}</div>
                    </div>
                    
                    {(isAdmin || member.id === parseInt(currentUser.id)) && 
                     member.id !== group.owner_id && (
                      <button
                        className="remove-button"
                        onClick={() => setConfirmRemoveMember(member)}
                      >
                        {member.id === parseInt(currentUser.id) ? 'Leave' : 'Remove'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {activeTab === 'activities' && (
            <div className="activities-tab">
              <div className="tab-header">
                <h2>Group Activities</h2>
                {isAdmin && (
                  <button 
                    className="add-button"
                    onClick={() => setShowAddActivityForm(true)}
                  >
                    Add Activity
                  </button>
                )}
              </div>
              
              {showAddActivityForm && (
                <div className="form-modal">
                  <div className="form-container">
                    <h2>Add New Activity</h2>
                    {addActivityError && <div className="error-message">{addActivityError}</div>}
                    <form onSubmit={handleAddActivity}>
                      <div className="form-group">
                        <label htmlFor="newActivityName">Activity Name</label>
                        <input
                          type="text"
                          id="newActivityName"
                          value={newActivityName}
                          onChange={(e) => setNewActivityName(e.target.value)}
                          placeholder="Enter activity name"
                          required
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="newActivityDescription">Description (Optional)</label>
                        <textarea
                          id="newActivityDescription"
                          value={newActivityDescription}
                          onChange={(e) => setNewActivityDescription(e.target.value)}
                          placeholder="Enter activity description"
                          rows="3"
                        ></textarea>
                      </div>
                      
                      <div className="form-actions">
                        <button
                          type="button"
                          className="cancel-button"
                          onClick={() => setShowAddActivityForm(false)}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="submit-button"
                        >
                          Create Activity
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
              
              {group.activities && group.activities.length > 0 ? (
                <div className="activities-grid">
                  {group.activities.map(activity => (
                    <div key={activity.id} className="activity-card">
                      <h3 className="activity-name">{activity.name}</h3>
                      <p className="activity-description">
                        {activity.description || 'No description provided'}
                      </p>
                      
                      <div className="activity-stats">
                        <div className="stat-item">
                          <span className="stat-label">Contributors:</span>
                          <span className="stat-value">{activity.contributor_count || 0}</span>
                        </div>
                        
                        {activity.totals && Object.keys(activity.totals.money || {}).length > 0 && (
                          <div className="money-contributions">
                            <span className="stat-label">Money:</span>
                            <div className="currency-list">
                              {Object.entries(activity.totals.money).map(([currency, amount]) => (
                                <div key={currency} className="currency-item">
                                  {currency}: {amount.toFixed(2)}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {activity.totals && activity.totals.time && activity.totals.time.minutes > 0 && (
                          <div className="stat-item">
                            <span className="stat-label">Time:</span>
                            <span className="stat-value">{activity.totals.time.formatted}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="activity-actions">
                        <Link
                          to={`/groups/${id}/activities/${activity.id}`}
                          className="view-button"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>No activities have been created yet.</p>
                  {isAdmin && (
                    <button 
                      className="add-button"
                      onClick={() => setShowAddActivityForm(true)}
                    >
                      Create First Activity
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {confirmRemoveMember && (
        <div className="confirm-modal">
          <div className="confirm-container">
            <h2>
              {confirmRemoveMember.id === parseInt(currentUser.id) 
                ? 'Leave Group' 
                : 'Remove Member'}
            </h2>
            <p>
              {confirmRemoveMember.id === parseInt(currentUser.id)
                ? 'Are you sure you want to leave this group?'
                : `Are you sure you want to remove ${confirmRemoveMember.username} from this group?`}
            </p>
            <div className="confirm-actions">
              <button 
                className="cancel-button"
                onClick={() => setConfirmRemoveMember(null)}
              >
                Cancel
              </button>
              <button 
                className="delete-button"
                onClick={() => handleRemoveMember(confirmRemoveMember.id)}
              >
                {confirmRemoveMember.id === parseInt(currentUser.id) ? 'Leave' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupDetail;