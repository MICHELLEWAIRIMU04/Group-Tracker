import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getDashboardData } from '../api';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    member_stats: [],
    activity_stats: [],
    recent_activities: [],
    recent_contributions: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { currentUser, isAdmin } = useContext(AuthContext);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await getDashboardData();
        // Only update state if we have valid data
        if (data) {
          setDashboardData({
            member_stats: data.member_stats || [],
            activity_stats: data.activity_stats || [],
            recent_activities: data.recent_activities || [],
            recent_contributions: data.recent_contributions || []
          });
        }
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  if (loading) {
    return <div className="loading-state">Loading dashboard data...</div>;
  }
  
  if (error) {
    return <div className="error-state">{error}</div>;
  }
  
  // Safely calculate total amount using optional chaining and nullish coalescing
  const totalAmount = dashboardData.member_stats?.reduce(
    (sum, member) => sum + (member.total_contribution || 0), 
    0
  ) ?? 0;
  
  return (
    <div className="dashboard-container">
      <h1>Dashboard</h1>
      
      <div className="welcome-message">
        <h2>Welcome, {currentUser?.username || 'User'}!</h2>
        <p>Here's an overview of the current group activities and contributions.</p>
      </div>
      
      <div className="dashboard-grid">
        {/* Stats Summary Section */}
        <div className="dashboard-card stats-card">
          <h3>Quick Stats</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-number">{dashboardData.member_stats?.length || 0}</span>
              <span className="stat-label">Members</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{dashboardData.activity_stats?.length || 0}</span>
              <span className="stat-label">Activities</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{dashboardData.recent_contributions?.length || 0}</span>
              <span className="stat-label">Recent Contributions</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                ${totalAmount.toFixed(2)}
              </span>
              <span className="stat-label">Total Amount</span>
            </div>
          </div>
        </div>
        
        {/* Recent Activities Section */}
        <div className="dashboard-card recent-activities-card">
          <h3>Recent Activities</h3>
          {dashboardData.recent_activities && dashboardData.recent_activities.length > 0 ? (
            <ul className="activities-list">
              {dashboardData.recent_activities.map(activity => (
                <li key={activity.id} className="activity-item">
                  <div className="activity-name">{activity.name}</div>
                  <div className="activity-description">{activity.description}</div>
                  <div className="activity-date">
                    Created: {new Date(activity.created_at).toLocaleDateString()}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-list">No activities have been created yet.</p>
          )}
          <div className="card-footer">
            <Link to="/activities" className="view-all-link">View All Activities</Link>
            {isAdmin && (
              <Link to="/activities" className="action-link">Create New Activity</Link>
            )}
          </div>
        </div>
        
        {/* Top Contributors Section */}
        <div className="dashboard-card top-contributors-card">
          <h3>Top Contributors</h3>
          {dashboardData.member_stats && dashboardData.member_stats.length > 0 ? (
            <ul className="contributors-list">
              {[...dashboardData.member_stats]
                .sort((a, b) => (b.total_contribution || 0) - (a.total_contribution || 0))
                .slice(0, 5)
                .map(member => (
                  <li key={member.id} className="contributor-item">
                    <div className="contributor-name">{member.username}</div>
                    <div className="contributor-amount">
                      ${(member.total_contribution || 0).toFixed(2)}
                    </div>
                    <div className="contributor-count">
                      {member.contribution_count || 0} contributions
                    </div>
                  </li>
                ))}
            </ul>
          ) : (
            <p className="empty-list">No contributions have been made yet.</p>
          )}
          <div className="card-footer">
            <Link to="/members" className="view-all-link">View All Members</Link>
          </div>
        </div>
        
        {/* Recent Contributions Section */}
        <div className="dashboard-card recent-contributions-card">
          <h3>Recent Contributions</h3>
          {dashboardData.recent_contributions && dashboardData.recent_contributions.length > 0 ? (
            <ul className="contributions-list">
              {dashboardData.recent_contributions.map(contribution => (
                <li key={contribution.id} className="contribution-item">
                  <div className="contribution-user">{contribution.user}</div>
                  <div className="contribution-activity">{contribution.activity}</div>
                  <div className="contribution-amount">
                    ${contribution.amount.toFixed(2)}
                  </div>
                  <div className="contribution-date">
                    {new Date(contribution.date).toLocaleDateString()}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-list">No contributions have been recorded yet.</p>
          )}
          <div className="card-footer">
            <Link to="/contributions" className="view-all-link">View All Contributions</Link>
            {isAdmin && (
              <Link to="/contributions" className="action-link">Add Contribution</Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;