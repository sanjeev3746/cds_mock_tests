import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAuthToken, formatDate } from '../utils/auth';
import './Results.css';

function Results() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch('/api/results', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.status === 'success') {
        setResults(data.data.results);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching results:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading results...</div>;
  }

  return (
    <div className="results-page">
      <div className="container">
        <div className="page-header">
          <h1>My Test Results</h1>
          <p>View your past performance and track your progress</p>
        </div>

        {results.length > 0 ? (
          <div className="results-list">
            {results.map((result) => (
              <Link
                key={result._id}
                to={`/results/${result._id}`}
                className="result-card"
              >
                <div className="result-header">
                  <div>
                    <h3>{result.test.title}</h3>
                    <p className="test-meta">
                      {/* Question type badge removed as requested */} {result.test.category}
                    </p>
                  </div>
                  <div className="result-rank">
                    <span className="rank-badge">Rank #{result.rank}</span>
                    <span className="percentile">{result.percentile}%ile</span>
                  </div>
                </div>

                <div className="result-stats">
                  <div className="stat-item">
                    <div className="stat-label">Score</div>
                    <div className="stat-value">
                      {result.score.obtainedMarks}/{result.score.totalMarks}
                    </div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-label">Percentage</div>
                    <div className="stat-value">{result.score.percentage}%</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-label">Correct</div>
                    <div className="stat-value success">{result.score.correctAnswers}</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-label">Wrong</div>
                    <div className="stat-value danger">{result.score.wrongAnswers}</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-label">Skipped</div>
                    <div className="stat-value">{result.score.skippedQuestions}</div>
                  </div>
                </div>

                <div className="result-footer">
                  <span className="result-date">
                    📅 {formatDate(result.completedAt)}
                  </span>
                  <span className="view-details">View Details →</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <h3>No Results Yet</h3>
            <p>Take your first mock test to see results here</p>
            <Link to="/tests" className="btn btn-primary">
              Browse Tests
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default Results;
