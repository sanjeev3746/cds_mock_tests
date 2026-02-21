import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.status === 'success') {
        setStats(data.data);
      } else {
        setError(data.message || 'Failed to load dashboard data');
      }
    } catch (err) {
      console.error('Dashboard Error:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTest = async (testId) => {
    if (!window.confirm('Are you sure you want to delete this test?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/tests/${testId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.status === 'success') {
        alert('Test deleted successfully');
        fetchDashboardData(); // Refresh data
      } else {
        alert(data.message || 'Failed to delete test');
      }
    } catch (err) {
      console.error('Delete Error:', err);
      alert('Failed to delete test');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Manage your CDS Mock Test Platform</p>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <Link to="/admin/create" className="action-card create-action">
          <div className="action-icon">✏️</div>
          <h3>Create Test</h3>
          <p>Add questions manually</p>
        </Link>
        <Link to="/admin/upload" className="action-card upload-action">
          <div className="action-icon">📤</div>
          <h3>Upload PDF</h3>
          <p>Extract from PDF files</p>
        </Link>
        <div className="action-card" onClick={() => navigate('/tests')}>
          <div className="action-icon">📝</div>
          <h3>View Tests</h3>
          <p>Browse all tests</p>
        </div>
        <div className="action-card">
          <div className="action-icon">👥</div>
          <h3>Users</h3>
          <p>{stats.stats.totalUsers} registered</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>{stats.stats.totalTests}</h3>
            <p>Total Tests</p>
            <span className="stat-sub">{stats.stats.activeTests} active</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👤</div>
          <div className="stat-content">
            <h3>{stats.stats.totalUsers}</h3>
            <p>Total Users</p>
            <span className="stat-sub">{stats.stats.premiumUsers} premium</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✍️</div>
          <div className="stat-content">
            <h3>{stats.stats.totalAttempts}</h3>
            <p>Total Attempts</p>
            <span className="stat-sub">{stats.stats.completedAttempts} completed</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats.stats.totalResults}</h3>
            <p>Results Generated</p>
            <span className="stat-sub">
              {stats.stats.totalAttempts > 0 
                ? Math.round((stats.stats.totalResults / stats.stats.totalAttempts) * 100) 
                : 0}% completion
            </span>
          </div>
        </div>
      </div>

      {/* Recent Tests */}
      <div className="dashboard-section">
        <h2>Recent Tests</h2>
        <div className="tests-table">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Duration</th>
                <th>Marks</th>
                <th>Attempts</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentTests.map(test => (
                <tr key={test._id}>
                  <td>
                    <Link to={`/test/${test._id}`} className="test-link">
                      {test.title}
                    </Link>
                  </td>
                  <td>{test.duration} min</td>
                  <td>{test.totalMarks}</td>
                  <td>{test.attemptsCount || 0}</td>
                  <td>
                    <span className={`status-badge ${test.isActive ? 'active' : 'inactive'}`}>
                      {test.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{formatDate(test.createdAt)}</td>
                  <td>
                    <button 
                      className="delete-btn" 
                      onClick={() => handleDeleteTest(test._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="dashboard-section">
        <h2>Recent Attempts</h2>
        <div className="activity-list">
          {stats.recentAttempts.slice(0, 5).map(attempt => (
            <div key={attempt._id} className="activity-item">
              <div className="activity-icon">
                {attempt.status === 'completed' ? '✅' : 
                 attempt.status === 'in-progress' ? '⏳' : '📝'}
              </div>
              <div className="activity-content">
                <p className="activity-user">
                  <strong>{attempt.user?.name}</strong> 
                  {attempt.status === 'completed' ? ' completed ' : ' started '}
                  <strong>{attempt.test?.title}</strong>
                </p>
                <p className="activity-time">{formatDate(attempt.startedAt)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Performers */}
      <div className="dashboard-section">
        <h2>Top Performers</h2>
        <div className="leaderboard-table">
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Name</th>
                <th>Test</th>
                <th>Score</th>
                <th>Percentage</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.topPerformers.slice(0, 5).map((result, index) => (
                <tr key={result._id}>
                  <td>
                    <span className={`rank rank-${index + 1}`}>
                      {index + 1}
                    </span>
                  </td>
                  <td>{result.user?.name}</td>
                  <td>{result.test?.title}</td>
                  <td>{result.score?.obtainedMarks}/{result.score?.totalMarks}</td>
                  <td>
                    <span className="percentage">{result.score?.percentage?.toFixed(1)}%</span>
                  </td>
                  <td>{formatDate(result.timeMetrics?.submittedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
