import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getAuthToken } from '../utils/auth';
import API_URL from '../config';
import './Profile.css';

const PLANS = [
  { id: 'monthly', label: '1 Month', price: 99,  display: '₹99/month',  popular: false },
  { id: 'yearly',  label: '1 Year',  price: 499, display: '₹499/year',  popular: true  },
];

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function Profile() {
  const { user, login } = useContext(AuthContext);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    phone: user.phone || ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState('');

  const handleUpgrade = async (planId) => {
    setPaymentLoading(true);
    setPaymentMessage('');
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        setPaymentMessage('Failed to load payment gateway. Check your internet connection.');
        setPaymentLoading(false);
        return;
      }

      const token = getAuthToken();
      const orderRes = await fetch(`${API_URL}/api/payment/create-order`, {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId }),
      });
      const orderData = await orderRes.json();
      if (orderData.status !== 'success') {
        setPaymentMessage(orderData.message || 'Failed to initiate payment.');
        setPaymentLoading(false);
        return;
      }

      const { orderId, amount, currency, keyId, planLabel, userName, userEmail } = orderData.data;

      const rzp = new window.Razorpay({
        key: keyId,
        amount,
        currency,
        name: 'CDS Mock Tests',
        description: 'Premium Plan - ' + planLabel,
        order_id: orderId,
        prefill: { name: userName, email: userEmail },
        theme: { color: '#6c63ff' },
        handler: async (response) => {
          try {
            const verifyRes = await fetch(`${API_URL}/api/payment/verify`, {
              method: 'POST',
              headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id:   response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature:  response.razorpay_signature,
                plan: planId,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyData.status === 'success') {
              login(verifyData.data.user, token);
              setPaymentMessage('Premium activated successfully! Welcome to Premium 🎉');
            } else {
              setPaymentMessage(verifyData.message || 'Payment verification failed.');
            }
          } catch (err) {
            setPaymentMessage('Verification error. Contact support with your payment ID.');
          } finally {
            setPaymentLoading(false);
          }
        },
        modal: {
          ondismiss: () => setPaymentLoading(false),
        },
      });
      rzp.open();
    } catch (err) {
      setPaymentMessage('Something went wrong. Please try again.');
      setPaymentLoading(false);
    }
  };

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
      const response = await fetch(`${API_URL}/api/auth/profile`, {
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
                    <p>1 mock test per week. Upgrade to unlock everything.</p>

                    {paymentMessage && (
                      <div className={`alert ${paymentMessage.includes('success') || paymentMessage.includes('activated') ? 'alert-success' : 'alert-error'}`}>
                        {paymentMessage}
                      </div>
                    )}

                    <div className="plan-cards">
                      {PLANS.map((plan) => (
                        <div key={plan.id} className={`plan-card${plan.popular ? ' plan-card-popular' : ''}`}>
                          {plan.popular && <div className="plan-badge">Best Value</div>}
                          <div className="plan-label">{plan.label}</div>
                          <div className="plan-price">{plan.display}</div>
                          <ul className="plan-features">
                            <li>✓ Unlimited mock tests</li>
                            <li>✓ Detailed analytics</li>
                            <li>✓ Leaderboard access</li>
                          </ul>
                          <button
                            className="btn btn-primary"
                            onClick={() => handleUpgrade(plan.id)}
                            disabled={paymentLoading}
                          >
                            {paymentLoading ? 'Processing...' : 'Upgrade - ' + plan.display}
                          </button>
                        </div>
                      ))}
                    </div>
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
