import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAuthToken, formatDate, formatTime } from '../utils/auth';
import './ResultDetail.css';

function ResultDetail() {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResultDetail();
  }, [id]);

  const fetchResultDetail = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`/api/results/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.status === 'success') {
        setResult(data.data.result);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching result:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading result details...</div>;
  }

  if (!result) {
    return (
      <div className="container">
        <div className="alert alert-error">Result not found</div>
      </div>
    );
  }

  const accuracy = ((result.score.correctAnswers / (result.score.correctAnswers + result.score.wrongAnswers)) * 100).toFixed(2);

  return (
    <div className="result-detail-page">
      <div className="container">
        <div className="result-header-section">
          <div className="result-title">
            <h1>{result.test.title}</h1>
            <p className="test-info">
              {result.test.type.replace('-', ' ')} • {result.test.category}
            </p>
          </div>
          <Link to={`/leaderboard/${result.test._id}`} className="btn btn-primary">
            View Leaderboard
          </Link>
        </div>

        <div className="score-card-large">
          <div className="score-main">
            <div className="score-circle">
              <div className="score-number">{result.score.percentage}%</div>
              <div className="score-label">Score</div>
            </div>
            <div className="score-details">
              <div className="score-item">
                <span className="label">Marks Obtained</span>
                <span className="value">{result.score.obtainedMarks}/{result.score.totalMarks}</span>
              </div>
              <div className="score-item">
                <span className="label">Rank</span>
                <span className="value">#{result.rank}</span>
              </div>
              <div className="score-item">
                <span className="label">Percentile</span>
                <span className="value">{result.percentile}%ile</span>
              </div>
              <div className="score-item">
                <span className="label">Accuracy</span>
                <span className="value">{accuracy}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="analysis-grid">
          <div className="analysis-card">
            <h3>Question Analysis</h3>
            <div className="question-breakdown">
              <div className="breakdown-item correct">
                <div className="breakdown-count">{result.score.correctAnswers}</div>
                <div className="breakdown-label">Correct</div>
              </div>
              <div className="breakdown-item wrong">
                <div className="breakdown-count">{result.score.wrongAnswers}</div>
                <div className="breakdown-label">Wrong</div>
              </div>
              <div className="breakdown-item skipped">
                <div className="breakdown-count">{result.score.skippedQuestions}</div>
                <div className="breakdown-label">Skipped</div>
              </div>
            </div>
          </div>

          <div className="analysis-card">
            <h3>Time Analysis</h3>
            <div className="time-stats">
              <div className="time-item">
                <span className="time-label">Total Time</span>
                <span className="time-value">{formatTime(result.timeMetrics.totalTime)}</span>
              </div>
              <div className="time-item">
                <span className="time-label">Avg per Question</span>
                <span className="time-value">{result.timeMetrics.averageTimePerQuestion}s</span>
              </div>
              <div className="time-item">
                <span className="time-label">Started At</span>
                <span className="time-value">{new Date(result.timeMetrics.startedAt).toLocaleTimeString()}</span>
              </div>
              <div className="time-item">
                <span className="time-label">Submitted At</span>
                <span className="time-value">{new Date(result.timeMetrics.submittedAt).toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="section-wise-analysis">
          <h2>Section-wise Performance</h2>
          <div className="sections-grid">
            {result.sectionWise.map((section, index) => (
              <div key={index} className="section-card-detailed">
                <h4>{section.sectionName}</h4>
                <div className="section-stats-grid">
                  <div className="section-stat">
                    <span className="stat-label">Total Questions</span>
                    <span className="stat-value">{section.totalQuestions}</span>
                  </div>
                  <div className="section-stat">
                    <span className="stat-label">Attempted</span>
                    <span className="stat-value">{section.attempted}</span>
                  </div>
                  <div className="section-stat">
                    <span className="stat-label">Correct</span>
                    <span className="stat-value success">{section.correct}</span>
                  </div>
                  <div className="section-stat">
                    <span className="stat-label">Wrong</span>
                    <span className="stat-value danger">{section.wrong}</span>
                  </div>
                  <div className="section-stat">
                    <span className="stat-label">Marks</span>
                    <span className="stat-value">{section.marks.toFixed(2)}</span>
                  </div>
                  <div className="section-stat">
                    <span className="stat-label">Accuracy</span>
                    <span className="stat-value">{section.accuracy}%</span>
                  </div>
                </div>
                <div className="section-progress">
                  <div 
                    className="progress-bar" 
                    style={{ width: `${section.accuracy}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="result-footer">
          <p>Test completed on {formatDate(result.completedAt)}</p>
          <div className="footer-actions">
            <Link to="/results" className="btn btn-outline">Back to Results</Link>
            <Link to="/tests" className="btn btn-primary">Take Another Test</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResultDetail;
