import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAuthToken, formatTime } from '../utils/auth';
import MathText from '../components/MathText';
import './TakeTest.css';

function TakeTest() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  
  const [attempt, setAttempt] = useState(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    fetchAttempt();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attemptId]);

  useEffect(() => {
    if (attempt) {
      startTimer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);

  const fetchAttempt = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`/api/tests/attempt/${attemptId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        setAttempt(data.data.attempt);
        
        // Load saved answers
        const savedAnswers = {};
        if (data.data.attempt.currentAnswers) {
          // currentAnswers is now a plain object (converted from Map on backend)
          Object.entries(data.data.attempt.currentAnswers).forEach(([key, value]) => {
            savedAnswers[key] = value.selectedAnswer;
          });
        }
        setAnswers(savedAnswers);
        
        // Calculate time remaining
        const expiresAt = new Date(data.data.attempt.expiresAt);
        const now = new Date();
        const remaining = Math.floor((expiresAt - now) / 1000);
        setTimeRemaining(Math.max(0, remaining));
      } else {
        alert(data.message);
        navigate('/tests');
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching attempt:', error);
      alert('Failed to load test');
      navigate('/tests');
    }
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const saveAnswer = async (sectionIdx, questionIdx, answer) => {
    const answerKey = `${sectionIdx}-${questionIdx}`;
    const newAnswers = { ...answers, [answerKey]: answer };
    setAnswers(newAnswers);

    try {
      const token = getAuthToken();
      await fetch(`/api/tests/attempt/${attemptId}/answer`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sectionIndex: sectionIdx,
          questionIndex: questionIdx,
          selectedAnswer: answer
        })
      });
    } catch (error) {
      console.error('Error saving answer:', error);
    }
  };

  const handleSubmit = async (autoSubmit = false) => {
    if (!autoSubmit && !window.confirm('Are you sure you want to submit the test?')) {
      return;
    }

    setSubmitting(true);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    try {
      const token = getAuthToken();
      const response = await fetch(`/api/tests/attempt/${attemptId}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        navigate(`/results/${data.data.result.id}`);
      } else {
        alert(data.message);
        setSubmitting(false);
      }
    } catch (error) {
      console.error('Error submitting test:', error);
      alert('Failed to submit test');
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    const section = attempt.test.sections[currentSection];
    if (currentQuestion < section.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else if (currentSection < attempt.test.sections.length - 1) {
      setCurrentSection(currentSection + 1);
      setCurrentQuestion(0);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    } else if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
      const prevSection = attempt.test.sections[currentSection - 1];
      setCurrentQuestion(prevSection.questions.length - 1);
    }
  };

  const jumpToQuestion = (sectionIdx, questionIdx) => {
    setCurrentSection(sectionIdx);
    setCurrentQuestion(questionIdx);
  };

  if (loading) {
    return <div className="loading">Loading test...</div>;
  }

  if (!attempt || !attempt.test) {
    return <div className="loading">Test data not available</div>;
  }

  const section = attempt.test.sections[currentSection];
  const question = section.questions[currentQuestion];
  const answerKey = `${currentSection}-${currentQuestion}`;
  const selectedAnswer = answers[answerKey];

  const totalQuestions = attempt.test.sections.reduce((sum, s) => sum + s.questions.length, 0);
  const answeredCount = Object.keys(answers).filter(key => answers[key] !== undefined && answers[key] !== null).length;

  return (
    <div className="take-test-page">
      <div className="test-header-fixed">
        <div className="container">
          <div className="test-header-content">
            <div className="test-info">
              <h3>{attempt.test.title}</h3>
              <p>Question {currentQuestion + 1} of {section.questions.length} in {section.name}</p>
            </div>
            <div className="test-timer">
              <div className={`timer ${timeRemaining < 300 ? 'warning' : ''}`}>
                ⏱️ {formatTime(timeRemaining)}
              </div>
              <button onClick={handleSubmit} className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Test'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="test-content">
        <div className="container">
          <div className="test-layout">
            <div className="question-panel">
              <div className="section-indicator">
                <strong>Section:</strong> {section.name}
              </div>

              <div className="question-card">
                <div className="question-number">
                  Question {currentQuestion + 1}
                </div>
                {question.directions && (
                  <div className="question-directions">
                    <MathText text={question.directions} />
                  </div>
                )}
                <div className="question-text">
                  <MathText text={question.question} />
                </div>

                <div className="options">
                  {question.options.map((option, idx) => (
                    <div
                      key={idx}
                      className={`option ${selectedAnswer === idx ? 'selected' : ''}`}
                      onClick={() => saveAnswer(currentSection, currentQuestion, idx)}
                    >
                      <input
                        type="radio"
                        name="answer"
                        checked={selectedAnswer === idx}
                        onChange={() => {}}
                      />
                      <span className="option-label">{String.fromCharCode(65 + idx)}.</span>
                      <span className="option-text"><MathText text={option} /></span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="navigation-buttons">
                <button
                  onClick={handlePrevious}
                  className="btn btn-outline"
                  disabled={currentSection === 0 && currentQuestion === 0}
                >
                  Previous
                </button>
                <button
                  onClick={() => saveAnswer(currentSection, currentQuestion, null)}
                  className="btn btn-secondary"
                  disabled={selectedAnswer === undefined || selectedAnswer === null}
                >
                  Clear Response
                </button>
                <button
                  onClick={handleNext}
                  className="btn btn-primary"
                  disabled={currentSection === attempt.test.sections.length - 1 && 
                           currentQuestion === section.questions.length - 1}
                >
                  Next
                </button>
              </div>
            </div>

            <div className="sidebar">
              <div className="progress-card">
                <h4>Progress</h4>
                <div className="progress-stats">
                  <div className="stat">
                    <span className="stat-value">{answeredCount}</span>
                    <span className="stat-label">Answered</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">{totalQuestions - answeredCount}</span>
                    <span className="stat-label">Remaining</span>
                  </div>
                </div>
              </div>

              <div className="questions-grid-card">
                <h4>Questions</h4>
                {attempt.test.sections.map((sec, secIdx) => (
                  <div key={secIdx} className="section-questions">
                    <div className="section-name">{sec.name}</div>
                    <div className="questions-grid">
                      {sec.questions.map((_, qIdx) => {
                        const key = `${secIdx}-${qIdx}`;
                        const isAnswered = answers[key] !== undefined && answers[key] !== null;
                        const isCurrent = secIdx === currentSection && qIdx === currentQuestion;
                        
                        return (
                          <button
                            key={qIdx}
                            className={`question-number-btn ${isAnswered ? 'answered' : ''} ${isCurrent ? 'current' : ''}`}
                            onClick={() => jumpToQuestion(secIdx, qIdx)}
                          >
                            {qIdx + 1}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="legend">
                <div className="legend-item">
                  <span className="legend-box answered"></span>
                  <span>Answered</span>
                </div>
                <div className="legend-item">
                  <span className="legend-box"></span>
                  <span>Not Answered</span>
                </div>
                <div className="legend-item">
                  <span className="legend-box current"></span>
                  <span>Current</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TakeTest;
