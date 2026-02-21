import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getAuthToken } from '../utils/auth';
import './Profile.css';

function Profile() {
  const { user, login } = useContext(AuthContext);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    phone: user.phone || ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const token = getAuthToken();
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        login(data.data.user, token);
        setMessage('Profile updated successfully!');
        setEditing(false);
      } else {
        setMessage(data.message || 'Update failed');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-container">
          <div className="profile-header">
            <div className="avatar">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="user-info-header">
              <h1>{user.name}</h1>
              <p>{user.email}</p>
              {user.isPremium && (
                <span className="premium-badge-large">💎 Premium Member</span>
              )}
            </div>
          </div>

          <div className="profile-grid">
            <div className="profile-section">
              <h2>Profile Information</h2>
              
              {message && (
                <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-error'}`}>
                  {message}
                </div>
              )}

              {editing ? (
                <form onSubmit={handleSubmit}>
                  <div className="input-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      pattern="[0-9]{10}"
                      placeholder="10-digit mobile number"
                    />
                  </div>

                  <div className="button-group">
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => {
                        setEditing(false);
                        setFormData({ name: user.name, phone: user.phone || '' });
                        setMessage('');
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="profile-details">
                  <div className="detail-item">
                    <span className="detail-label">Name</span>
                    <span className="detail-value">{user.name}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Email</span>
                    <span className="detail-value">{user.email}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Phone</span>
                    <span className="detail-value">{user.phone || 'Not provided'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Member Since</span>
                    <span className="detail-value">
                      {new Date(user.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>

                  <button onClick={() => setEditing(true)} className="btn btn-primary">
                    Edit Profile
                  </button>
                </div>
              )}
            </div>

            <div className="profile-section">
              <h2>Statistics</h2>
              <div className="stats-grid-profile">
                <div className="stat-card-profile">
                  <div className="stat-icon">📝</div>
                  <div className="stat-info">
                    <div className="stat-value">{user.stats.totalTests || 0}</div>
                    <div className="stat-label">Total Tests</div>
                  </div>
                </div>
                <div className="stat-card-profile">
                  <div className="stat-icon">📊</div>
                  <div className="stat-info">
                    <div className="stat-value">{user.stats.averageScore?.toFixed(1) || 0}</div>
                    <div className="stat-label">Avg Score</div>
                  </div>
                </div>
                <div className="stat-card-profile">
                  <div className="stat-icon">🏆</div>
                  <div className="stat-info">
                    <div className="stat-value">{user.stats.bestScore || 0}</div>
                    <div className="stat-label">Best Score</div>
                  </div>
                </div>
                <div className="stat-card-profile">
                  <div className="stat-icon">⏱️</div>
                  <div className="stat-info">
                    <div className="stat-value">{Math.floor((user.stats.totalTimeSpent || 0) / 3600)}h</div>
                    <div className="stat-label">Study Time</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="profile-section">
              <h2>Subscription</h2>
              {user.isPremium ? (
                <div className="subscription-info premium">
                  <div className="subscription-icon">💎</div>
                  <div className="subscription-details">
                    <h3>Premium Active</h3>
                    <p>You have unlimited access to all tests and features</p>
                    {user.premiumExpiresAt && (
                      <p className="expiry-date">
                        Expires on: {new Date(user.premiumExpiresAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="subscription-info free">
                  <div className="subscription-icon">🆓</div>
                  <div className="subscription-details">
                    <h3>Free Plan</h3>
                    <p>1 mock test per week</p>
                    <button className="btn btn-secondary mt-20">
                      Upgrade to Premium - ₹99/month
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
