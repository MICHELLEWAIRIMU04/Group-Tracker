import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getMemberById, deleteMember, createContribution, deleteContribution } from '../api';
import ContributionForm from '../components/ContributionForm';

const MemberDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmDeleteContribution, setConfirmDeleteContribution] = useState(null);
  
  const { isAdmin, currentUser } = useContext(AuthContext);
  const canEdit = isAdmin || (currentUser && currentUser.id === parseInt(id));
  
  const fetchMemberDetails = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getMemberById(id);
      setMember(data);
      setError('');
    } catch (err) {
      setError('Failed to load member details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);
  
  useEffect(() => {
    fetchMemberDetails();
  }, [fetchMemberDetails]);
  
  const handleDeleteMember = async () => {
    try {
      const result = await deleteMember(id);
      if (result.message === 'Member deleted successfully') {
        navigate('/members');
      } else {
        setError(result.message || 'Failed to delete member');
      }
    } catch (err) {
      setError('Something went wrong');
      console.error(err);
    }
  };
  
  const handleAddContribution = async (contributionData) => {
    try {
      const data = {
        ...contributionData,
        user_id: parseInt(id)
      };
      
      const result = await createContribution(data);
      if (result.contribution) {
        // Update member data with new contribution
        fetchMemberDetails();
        setShowAddForm(false);
      } else {
        setError(result.message || 'Failed to add contribution');
      }
    } catch (err) {
      setError('Something went wrong');
      console.error(err);
    }
  };
  
  const handleDeleteContribution = async (contributionId) => {
    try {
      const result = await deleteContribution(contributionId);
      if (result.message === 'Contribution deleted successfully') {
        // Update member data
        fetchMemberDetails();
        setConfirmDeleteContribution(null);
      } else {
        setError(result.message || 'Failed to delete contribution');
      }
    } catch (err) {
      setError('Something went wrong');
      console.error(err);
    }
  };
  
  if (loading) {
    return <div className="loading-state">Loading member details...</div>;
  }
  
  if (!member) {
    return (
      <div className="error-state">
        <p>Member not found</p>
        <Link to="/members" className="back-link">Back to Members</Link>
      </div>
    );
  }
  
  return (
    <div className="member-details-container">
      <div className="page-header">
        <h1>{member.username}</h1>
        <div className="header-actions">
          <Link to="/members" className="back-button">
            Back to Members
          </Link>
          {isAdmin && (
            <button 
              className="delete-button"
              onClick={() => setConfirmDelete(true)}
            >
              Delete Member
            </button>
          )}
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {/* Member Info Section */}
      <div className="info-card">
        <h2>Member Information</h2>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Username:</span>
            <span className="info-value">{member.username}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Email:</span>
            <span className="info-value">{member.email}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Role:</span>
            <span className="info-value">
              {member.is_admin ? 'Administrator' : 'Member'}
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">Total Contribution:</span>
            <span className="info-value">${member.total_contribution?.toFixed(2) || '0.00'}</span>
          </div>
        </div>
      </div>
      
      {/* Contributions Section */}
      <div className="contributions-card">
        <div className="section-header">
          <h2>Contributions</h2>
          {canEdit && (
            <button 
              className="add-button"
              onClick={() => setShowAddForm(true)}
            >
              Add Contribution
            </button>
          )}
        </div>
        
        {member.contributions && member.contributions.length > 0 ? (
          <div className="contributions-list">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Activity</th>
                  <th>Amount</th>
                  <th>Description</th>
                  <th>Date</th>
                  {canEdit && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {member.contributions.map(contribution => (
                  <tr key={contribution.id}>
                    <td>{contribution.activity}</td>
                    <td>${contribution.amount.toFixed(2)}</td>
                    <td>{contribution.description || '-'}</td>
                    <td>{new Date(contribution.date).toLocaleDateString()}</td>
                    {canEdit && (
                      <td>
                        <button 
                          className="delete-icon"
                          onClick={() => setConfirmDeleteContribution(contribution)}
                          title="Delete contribution"
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
            <p>No contributions found.</p>
            {canEdit && (
              <button 
                className="add-button"
                onClick={() => setShowAddForm(true)}
              >
                Add First Contribution
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Add Contribution Form Modal */}
      {showAddForm && (
        <div className="form-modal">
          <div className="form-container">
            <h2>Add Contribution</h2>
            <ContributionForm 
              onSubmit={handleAddContribution}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        </div>
      )}
      
      {/* Confirm Delete Member Modal */}
      {confirmDelete && (
        <div className="confirm-modal">
          <div className="confirm-container">
            <h2>Confirm Delete</h2>
            <p>Are you sure you want to delete this member? This action cannot be undone.</p>
            <div className="confirm-actions">
              <button 
                className="cancel-button"
                onClick={() => setConfirmDelete(false)}
              >
                Cancel
              </button>
              <button 
                className="delete-button"
                onClick={handleDeleteMember}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Confirm Delete Contribution Modal */}
      {confirmDeleteContribution && (
        <div className="confirm-modal">
          <div className="confirm-container">
            <h2>Confirm Delete</h2>
            <p>
              Are you sure you want to delete this contribution of 
              ${confirmDeleteContribution.amount.toFixed(2)} for {confirmDeleteContribution.activity}?
            </p>
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

export default MemberDetails;