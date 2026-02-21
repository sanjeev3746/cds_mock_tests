import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getAuthToken } from '../utils/auth';
import './Dashboard.css';

function Dashboard() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [recentTests, setRecentTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = getAuthToken();
      
      // Fetch user results
      const response = await fetch('/api/results', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        setRecentTests(data.data.results.slice(0, 5));
        // Stats are already in user object from context
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1>Welcome back, {user.name}! 🎖️</h1>
            <p className="subtitle">Continue your CDS preparation journey</p>
          </div>
          {!user.isPremium && (
            <div className="premium-prompt">
              <p>Upgrade to Premium for unlimited tests!</p>
              <button className="btn btn-secondary">Upgrade Now</button>
            </div>
          )}
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📝</div>
            <div className="stat-info">
              <h3>{user.stats.totalTests || 0}</h3>
              <p>Tests Taken</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-info">
              <h3>{user.stats.averageScore?.toFixed(1) || 0}</h3>
              <p>Average Score</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🏆</div>
            <div className="stat-info">
              <h3>{user.stats.bestScore || 0}</h3>
              <p>Best Score</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⏱️</div>
            <div className="stat-info">
              <h3>{Math.floor((user.stats.totalTimeSpent || 0) / 3600)}h</h3>
              <p>Time Spent</p>
            </div>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-section">
            <h2>Quick Actions</h2>
            <div className="action-cards">
              <Link to="/tests" className="action-card">
                <div className="action-icon">📝</div>
                <h3>Take Mock Test</h3>
                <p>Start a new practice test</p>
              </Link>
              <Link to="/results" className="action-card">
                <div className="action-icon">📊</div>
                <h3>View Results</h3>
                <p>Check your past performance</p>
              </Link>
              <Link to="/profile" className="action-card">
                <div className="action-icon">👤</div>
                <h3>My Profile</h3>
                <p>Update your details</p>
              </Link>
            </div>
          </div>

          <div className="dashboard-section">
            <div className="section-header">
              <h2>Recent Tests</h2>
              <Link to="/results">View All</Link>
            </div>
            {recentTests.length > 0 ? (
              <div className="recent-tests">
                {recentTests.map((result) => (
                  <Link
                    key={result._id}
                    to={`/results/${result._id}`}
                    className="test-item"
                  >
                    <div className="test-info">
                      <h4>{result.test.title}</h4>
                      <p className="test-date">
                        {new Date(result.completedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="test-score">
                      <span className="score">
                        {result.score.obtainedMarks}/{result.score.totalMarks}
                      </span>
                      <span className="percentage">{result.score.percentage}%</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No tests taken yet</p>
                <Link to="/tests" className="btn btn-primary">
                  Take Your First Test
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
