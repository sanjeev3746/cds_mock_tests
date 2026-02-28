import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './AdminUsers.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all | admin | premium | regular

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.status === 'success') {
        setUsers(data.data.users);
      } else {
        setError(data.message || 'Failed to load users');
      }
    } catch {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAdmin = async (userId, name) => {
    if (!window.confirm(`Toggle admin status for ${name}?`)) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/users/${userId}/toggle-admin`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.status === 'success') {
        setUsers(prev => prev.map(u => u._id === userId ? { ...u, isAdmin: data.data.isAdmin } : u));
      } else {
        alert(data.message);
      }
    } catch {
      alert('Failed to update user');
    }
  };

  const handleTogglePremium = async (userId, name) => {
    if (!window.confirm(`Toggle premium status for ${name}?`)) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/users/${userId}/toggle-premium`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.status === 'success') {
        setUsers(prev => prev.map(u => u._id === userId ? { ...u, isPremium: data.data.isPremium } : u));
      } else {
        alert(data.message);
      }
    } catch {
      alert('Failed to update user');
    }
  };

  const handleDelete = async (userId, name) => {
    if (!window.confirm(`Permanently delete user "${name}"? This will also delete their attempts and results.`)) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.status === 'success') {
        setUsers(prev => prev.filter(u => u._id !== userId));
      } else {
        alert(data.message);
      }
    } catch {
      alert('Failed to delete user');
    }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

  const filtered = users.filter(u => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === 'all' ||
      (filter === 'admin' && u.isAdmin) ||
      (filter === 'premium' && u.isPremium) ||
      (filter === 'regular' && !u.isAdmin && !u.isPremium);
    return matchesSearch && matchesFilter;
  });

  if (loading) return <div className="admin-users"><div className="loading">Loading users...</div></div>;
  if (error) return <div className="admin-users"><div className="error-message">{error}</div></div>;

  return (
    <div className="admin-users">
      <div className="users-header">
        <div>
          <h1>User Management</h1>
          <p>{users.length} total users</p>
        </div>
        <Link to="/admin/dashboard" className="btn-back">← Dashboard</Link>
      </div>

      {/* Summary cards */}
      <div className="users-summary">
        <div className="summary-card">
          <span className="summary-num">{users.length}</span>
          <span className="summary-label">Total</span>
        </div>
        <div className="summary-card admin">
          <span className="summary-num">{users.filter(u => u.isAdmin).length}</span>
          <span className="summary-label">Admins</span>
        </div>
        <div className="summary-card premium">
          <span className="summary-num">{users.filter(u => u.isPremium).length}</span>
          <span className="summary-label">Premium</span>
        </div>
        <div className="summary-card regular">
          <span className="summary-num">{users.filter(u => !u.isAdmin && !u.isPremium).length}</span>
          <span className="summary-label">Regular</span>
        </div>
      </div>

      {/* Filters */}
      <div className="users-controls">
        <input
          className="search-input"
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="filter-tabs">
          {['all', 'admin', 'premium', 'regular'].map(f => (
            <button
              key={f}
              className={`filter-tab ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Users table */}
      <div className="users-table-wrap">
        <table className="users-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Joined</th>
              <th>Attempts</th>
              <th>Results</th>
              <th>Role</th>
              <th>Premium</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan="9" style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>No users found</td></tr>
            ) : (
              filtered.map((u, i) => (
                <tr key={u._id}>
                  <td>{i + 1}</td>
                  <td>
                    <div className="user-name-cell">
                      <div className="user-avatar">{u.name.charAt(0).toUpperCase()}</div>
                      <span>{u.name}</span>
                    </div>
                  </td>
                  <td className="email-cell">{u.email}</td>
                  <td>{formatDate(u.createdAt)}</td>
                  <td><span className="count-badge">{u.attemptsCount || 0}</span></td>
                  <td><span className="count-badge">{u.resultsCount || 0}</span></td>
                  <td>
                    <span className={`role-badge ${u.isAdmin ? 'admin' : 'regular'}`}>
                      {u.isAdmin ? '🛡️ Admin' : '👤 User'}
                    </span>
                  </td>
                  <td>
                    <span className={`premium-badge ${u.isPremium ? 'yes' : 'no'}`}>
                      {u.isPremium ? '⭐ Premium' : 'Free'}
                    </span>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button
                        className="action-btn admin-btn"
                        onClick={() => handleToggleAdmin(u._id, u.name)}
                        title={u.isAdmin ? 'Remove Admin' : 'Make Admin'}
                      >
                        {u.isAdmin ? '⬇ Admin' : '⬆ Admin'}
                      </button>
                      <button
                        className="action-btn premium-btn"
                        onClick={() => handleTogglePremium(u._id, u.name)}
                        title={u.isPremium ? 'Remove Premium' : 'Grant Premium'}
                      >
                        {u.isPremium ? '⬇ Premium' : '⬆ Premium'}
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDelete(u._id, u.name)}
                        title="Delete User"
                      >
                        🗑 Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;
