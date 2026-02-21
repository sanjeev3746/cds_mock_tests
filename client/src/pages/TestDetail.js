import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAuthToken } from '../utils/auth';
import './TestDetail.css';

function TestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    fetchTestDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchTestDetail = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`/api/tests/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.status === 'success') {
        setTest(data.data.test);
      } else {
        setError(data.message);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching test:', error);
      setError('Failed to load test details');
      setLoading(false);
    }
  };

  const handleStartTest = async () => {
    setStarting(true);
    setError('');

    try {
      const token = getAuthToken();
      const response = await fetch(`/api/tests/${id}/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        navigate(`/test/${data.data.attempt._id}`);
      } else {
        setError(data.message);
        setStarting(false);
      }
    } catch (error) {
      console.error('Error starting test:', error);
      setError('Failed to start test');
      setStarting(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading test details...</div>;
  }

  if (error && !test) {
    return (
      <div className="container">
        <div className="alert alert-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="test-detail-page">
      <div className="container">
        <div className="test-detail-card">
          <div className="detail-header">
            <h1>{test.title}</h1>
            <span className={`test-badge ${test.type}`}>
              {test.type.replace('-', ' ')}
            </span>
          </div>

          <p className="test-description">{test.description}</p>

          {error && <div className="alert alert-error">{error}</div>}

          <div className="test-info-grid">
            <div className="info-box">
              <div className="info-icon">⏱️</div>
              <div>
                <h4>Duration</h4>
                <p>{test.duration} minutes</p>
              </div>
            </div>
            <div className="info-box">
              <div className="info-icon">📊</div>
              <div>
                <h4>Total Marks</h4>
                <p>{test.totalMarks} marks</p>
              </div>
            </div>
            <div className="info-box">
              <div className="info-icon">📝</div>
              <div>
                <h4>Questions</h4>
                <p>{test.sections.reduce((sum, s) => sum + s.questions.length, 0)} questions</p>
              </div>
            </div>
            <div className="info-box">
              <div className="info-icon">⚠️</div>
              <div>
                <h4>Negative Marking</h4>
                <p>{test.negativeMarking.enabled ? `Yes (${test.negativeMarking.deduction})` : 'No'}</p>
              </div>
            </div>
          </div>

          <div className="sections-info">
            <h3>Test Sections</h3>
            {test.sections.map((section, index) => (
              <div key={index} className="section-card">
                <div className="section-header">
                  <h4>{section.name}</h4>
                  <span className="badge">{section.questions.length} questions</span>
                </div>
                <div className="section-details">
                  <span>⏱️ {section.duration} mins</span>
                  <span>📊 {section.totalMarks} marks</span>
                </div>
              </div>
            ))}
          </div>

          <div className="instructions">
            <h3>Instructions</h3>
            <ul>
              <li>Once you start the test, timer will begin automatically</li>
              <li>Test will auto-submit when time expires</li>
              <li>You can flag questions for review</li>
              <li>Negative marking: {test.negativeMarking.enabled ? `${test.negativeMarking.deduction} marks deducted for wrong answers` : 'None'}</li>
              <li>You can submit the test before time ends</li>
              <li>Make sure you have stable internet connection</li>
            </ul>
          </div>

          <div className="action-buttons">
            <button
              onClick={handleStartTest}
              className="btn btn-primary btn-large"
              disabled={starting}
            >
              {starting ? 'Starting...' : 'Start Test'}
            </button>
            <button
              onClick={() => navigate('/tests')}
              className="btn btn-outline btn-large"
            >
              Back to Tests
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TestDetail;
