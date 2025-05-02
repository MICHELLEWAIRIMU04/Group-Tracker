import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getMembers, deleteMember, addMember } from '../api';
import MemberForm from '../components/MemberForm';

const MembersList = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  
  const { isAdmin } = useContext(AuthContext);
  
  useEffect(() => {
    fetchMembers();
  }, []);
  
  const fetchMembers = async () => {
    try {
      setLoading(true);
      const data = await getMembers();
      setMembers(data);
      setError('');
    } catch (err) {
      setError('Failed to load members');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddMember = async (memberData) => {
    try {
      const result = await addMember(memberData);
      if (result.user) {
        setMembers([...members, result.user]);
        setShowAddForm(false);
      } else {
        setError(result.message || 'Failed to add member');
      }
    } catch (err) {
      setError('Something went wrong');
      console.error(err);
    }
  };
  
  const handleDeleteMember = async (id) => {
    try {
      const result = await deleteMember(id);
      if (result.message === 'Member deleted successfully') {
        setMembers(members.filter(member => member.id !== id));
        setConfirmDelete(null);
      } else {
        setError(result.message || 'Failed to delete member');
      }
    } catch (err) {
      setError('Something went wrong');
      console.error(err);
    }
  };
  
  if (loading) {
    return <div className="loading-state">Loading members...</div>;
  }
  
  return (
    <div className="members-container">
      <div className="page-header">
        <h1>Members</h1>
        {isAdmin && (
          <button 
            className="add-button"
            onClick={() => setShowAddForm(true)}
          >
            Add Member
          </button>
        )}
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {showAddForm && (
        <div className="form-modal">
          <div className="form-container">
            <h2>Add New Member</h2>
            <MemberForm 
              onSubmit={handleAddMember}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        </div>
      )}
      
      {confirmDelete && (
        <div className="confirm-modal">
          <div className="confirm-container">
            <h2>Confirm Delete</h2>
            <p>Are you sure you want to delete {confirmDelete.username}?</p>
            <div className="confirm-actions">
              <button 
                className="cancel-button"
                onClick={() => setConfirmDelete(null)}
              >
                Cancel
              </button>
              <button 
                className="delete-button"
                onClick={() => handleDeleteMember(confirmDelete.id)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      {members.length > 0 ? (
        <div className="members-grid">
          {members.map(member => (
            <div key={member.id} className="member-card">
              <h3 className="member-name">{member.username}</h3>
              <p className="member-email">{member.email}</p>
              {member.is_admin && (
                <span className="admin-badge">Admin</span>
              )}
              <div className="member-actions">
                <Link 
                  to={`/members/${member.id}`}
                  className="view-button"
                >
                  View Details
                </Link>
                {isAdmin && (
                  <button 
                    className="delete-button"
                    onClick={() => setConfirmDelete(member)}
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
          <p>No members found.</p>
          {isAdmin && (
            <button 
              className="add-button"
              onClick={() => setShowAddForm(true)}
            >
              Add First Member
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default MembersList;