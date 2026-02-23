import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAuthToken } from '../utils/auth';
import './Tests.css';

function Tests() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch('/api/tests', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.status === 'success') {
        setTests(data.data.tests);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tests:', error);
      setLoading(false);
    }
  };

  const filteredTests = tests.filter(test => {
    if (filter === 'all') return true;
    return test.type === filter;
  });

  if (loading) {
    return <div className="loading">Loading tests...</div>;
  }

  return (
    <div className="tests-page">
      <div className="container">
        <div className="page-header">
          <h1>Available Mock Tests</h1>
          <p>Choose a test and start practicing</p>
        </div>

        <div className="filter-section">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Tests
          </button>
          <button
            className={`filter-btn ${filter === 'full-length' ? 'active' : ''}`}
            onClick={() => setFilter('full-length')}
          >
            Full Length
          </button>
          <button
            className={`filter-btn ${filter === 'sectional' ? 'active' : ''}`}
            onClick={() => setFilter('sectional')}
          >
            Sectional
          </button>
          <button
            className={`filter-btn ${filter === 'topic-wise' ? 'active' : ''}`}
            onClick={() => setFilter('topic-wise')}
          >
            Topic Wise
          </button>
        </div>

        {filteredTests.length > 0 ? (
          <div className="tests-grid">
            {filteredTests.map((test) => (
              <div key={test._id} className="test-card">
                <div className="test-header">
                  <h3>{test.title}</h3>
                  {/* Question type badge removed as requested */}
                </div>
                <p className="test-description">{test.description}</p>
                <div className="test-details">
                  <div className="detail-item">
                    <span className="detail-icon">🎯</span>
                    <span>{test.category}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-icon">📝</span>
                    <span>{test.sections.reduce((sum, s) => sum + s.questions.length, 0)} Questions</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-icon">⏱️</span>
                    <span>{test.duration} mins</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-icon">📊</span>
                    <span>{test.totalMarks} marks</span>
                  </div>
                </div>
                <div className="test-stats">
                  <span>👥 {test.attemptsCount} attempts</span>
                  {test.isPremium && <span className="premium-badge">💎 Premium</span>}
                </div>
                <Link to={`/tests/${test._id}`} className="btn btn-primary btn-block">
                  View Details
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No tests found</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Tests;
