import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuthToken } from '../utils/auth';
import './AdminTests.css';

const AdminTests = () => {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch('/api/admin/tests', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.status === 'success') {
        setTests(data.data.tests);
      } else {
        setError('Failed to load tests');
      }
    } catch (err) {
      console.error('Fetch Tests Error:', err);
      setError('Failed to load tests');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (testId) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`/api/admin/tests/${testId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.status === 'success') {
        setSuccess('Test deleted successfully');
        setTests(tests.filter(test => test._id !== testId));
        setDeleteConfirm(null);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to delete test');
      }
    } catch (err) {
      console.error('Delete Test Error:', err);
      setError('Failed to delete test');
    }
  };

  const toggleTestStatus = async (testId, currentStatus) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`/api/admin/tests/${testId}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      const data = await response.json();

      if (data.status === 'success') {
        setTests(tests.map(test => 
          test._id === testId ? { ...test, isActive: !currentStatus } : test
        ));
        setSuccess(`Test ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to update test status');
      }
    } catch (err) {
      console.error('Toggle Status Error:', err);
      setError('Failed to update test status');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return <div className="admin-tests-container"><div className="loading">Loading tests...</div></div>;
  }

  return (
    <div className="admin-tests-container">
      <div className="admin-tests-header">
        <div>
          <h1>📝 Manage Tests</h1>
          <p>View, edit, and delete all tests</p>
        </div>
        <div className="header-actions">
          <button className="btn-create" onClick={() => navigate('/admin/create')}>
            ✏️ Create New Test
          </button>
          <button className="btn-back" onClick={() => navigate('/admin/dashboard')}>
            ← Back to Dashboard
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="tests-stats">
        <div className="stat-box">
          <span className="stat-label">Total Tests</span>
          <span className="stat-value">{tests.length}</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Active Tests</span>
          <span className="stat-value">{tests.filter(t => t.isActive).length}</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Premium Tests</span>
          <span className="stat-value">{tests.filter(t => t.isPremium).length}</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Total Attempts</span>
          <span className="stat-value">{tests.reduce((sum, t) => sum + (t.attemptsCount || 0), 0)}</span>
        </div>
      </div>

      <div className="tests-table-container">
        {tests.length === 0 ? (
          <div className="no-tests">
            <p>No tests found. Create your first test!</p>
            <button className="btn-create-large" onClick={() => navigate('/admin/create')}>
              ✏️ Create Test
            </button>
          </div>
        ) : (
          <table className="tests-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Duration</th>
                <th>Marks</th>
                <th>Attempts</th>
                <th>Status</th>
                {/* Question type column removed as requested */}
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tests.map((test) => (
                <tr key={test._id} className={!test.isActive ? 'inactive-test' : ''}>
                  <td>
                    <div className="test-title">{test.title}</div>
                    {test.description && (
                      <div className="test-description">{test.description.substring(0, 60)}...</div>
                    )}
                  </td>
                  <td>{test.duration} min</td>
                  <td>{test.totalMarks}</td>
                  <td>{test.attemptsCount || 0}</td>
                  <td>
                    <span className={`status-badge ${test.isActive ? 'active' : 'inactive'}`}>
                      {test.isActive ? '✓ Active' : '✕ Inactive'}
                    </span>
                  </td>
                  <td>
                    {test.isPremium ? (
                      <span className="premium-badge">👑 Premium</span>
                    ) : (
                      <span className="free-badge">Free</span>
                    )}
                  </td>
                  <td>{formatDate(test.createdAt)}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-toggle"
                        onClick={() => toggleTestStatus(test._id, test.isActive)}
                        title={test.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {test.isActive ? '⏸' : '▶'}
                      </button>
                      <button
                        className="btn-view"
                        onClick={() => navigate(`/tests/${test._id}`)}
                        title="View Test"
                      >
                        👁
                      </button>
                      <button
                        className="btn-edit"
                        onClick={() => navigate(`/admin/edit-test/${test._id}`)}
                        title="Edit Test"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => setDeleteConfirm(test._id)}
                        title="Delete Test"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>⚠️ Confirm Delete</h2>
            <p>Are you sure you want to delete this test?</p>
            <p className="warning-text">
              This action cannot be undone. All associated attempts and results will be affected.
            </p>
            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button
                className="btn-confirm-delete"
                onClick={() => handleDelete(deleteConfirm)}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTests;
