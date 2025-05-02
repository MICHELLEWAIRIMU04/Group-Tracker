import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getContributions, createContribution, deleteContribution, updateContribution } from '../api';
import ContributionForm from '../components/ContributionForm';

const Contributions = () => {
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editContribution, setEditContribution] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  
  // Only get isAdmin from the AuthContext
  const { isAdmin } = useContext(AuthContext);
  
  useEffect(() => {
    fetchContributions();
  }, []);
  
  const fetchContributions = async () => {
    try {
      setLoading(true);
      const data = await getContributions();
      setContributions(data);
      setError('');
    } catch (err) {
      setError('Failed to load contributions');
      console.error(err);
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
      
      const result = await createContribution(contributionData);
      if (result.contribution) {
        setContributions([...contributions, result.contribution]);
        setShowAddForm(false);
      } else {
        setError(result.message || 'Failed to add contribution');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
      console.error(err);
    }
  };
  
  const handleUpdateContribution = async (contributionData) => {
    try {
      if (!isAdmin) {
        setError('Admin privileges required to manage contributions');
        return;
      }
      
      const result = await updateContribution(contributionData.id, contributionData);
      if (result.contribution) {
        setContributions(
          contributions.map(item => 
            item.id === result.contribution.id ? result.contribution : item
          )
        );
        setEditContribution(null);
      } else {
        setError(result.message || 'Failed to update contribution');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
      console.error(err);
    }
  };
  
  const handleDeleteContribution = async (id) => {
    try {
      if (!isAdmin) {
        setError('Admin privileges required to manage contributions');
        return;
      }
      
      const result = await deleteContribution(id);
      if (result.message === 'Contribution deleted successfully') {
        setContributions(contributions.filter(item => item.id !== id));
        setConfirmDelete(null);
      } else {
        setError(result.message || 'Failed to delete contribution');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
      console.error(err);
    }
  };
  
  // Sort contributions by date (newest first)
  const sortedContributions = [...contributions].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );
  
  if (loading) {
    return <div className="loading-state">Loading contributions...</div>;
  }
  
  return (
    <div className="contributions-container">
      <div className="page-header">
        <h1>Contributions</h1>
        {isAdmin && (
          <button 
            className="add-button"
            onClick={() => setShowAddForm(true)}
          >
            Add Contribution
          </button>
        )}
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
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
      
      {/* Edit Contribution Form Modal */}
      {editContribution && (
        <div className="form-modal">
          <div className="form-container">
            <h2>Edit Contribution</h2>
            <ContributionForm 
              initialData={editContribution}
              onSubmit={handleUpdateContribution}
              onCancel={() => setEditContribution(null)}
              fixedUserId={editContribution.user_id}
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
      
      {/* Contributions Table */}
      {contributions.length > 0 ? (
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
                  <td>${contribution.amount.toFixed(2)}</td>
                  <td>{contribution.description || '-'}</td>
                  <td>{new Date(contribution.date).toLocaleDateString()}</td>
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