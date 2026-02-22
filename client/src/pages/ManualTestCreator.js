import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuthToken } from '../utils/auth';
import './ManualTestCreator.css';

const ManualTestCreator = () => {
  const navigate = useNavigate();
  const [testData, setTestData] = useState({
    title: '',
    description: '',
    duration: 120,
    negativeMarking: true,
    negativeMarks: 0.33,
    passingPercentage: 33,
    isPremium: false
  });

  const [sections, setSections] = useState([
    { name: 'English', questions: [] }
  ]);

  const [currentSection, setCurrentSection] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState({
    questionText: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    explanation: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTestDataChange = (field, value) => {
    setTestData({ ...testData, [field]: value });
  };

  const handleQuestionChange = (field, value) => {
    setCurrentQuestion({ ...currentQuestion, [field]: value });
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = value;
    setCurrentQuestion({ ...currentQuestion, options: newOptions });
  };

  const addQuestion = () => {
    if (!currentQuestion.questionText.trim()) {
      setError('Question text is required');
      return;
    }

    const filledOptions = currentQuestion.options.filter(opt => opt.trim());
    if (filledOptions.length < 2) {
      setError('At least 2 options are required');
      return;
    }

    if (!currentQuestion.correctAnswer) {
      setError('Please select the correct answer');
      return;
    }

    const newSections = [...sections];
    newSections[currentSection].questions.push({
      questionText: currentQuestion.questionText,
      options: currentQuestion.options.filter(opt => opt.trim()),
      correctAnswer: currentQuestion.correctAnswer,
      explanation: currentQuestion.explanation
    });

    setSections(newSections);
    setCurrentQuestion({
      questionText: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      explanation: ''
    });
    setError('');
    setSuccess(`Question added! Total: ${newSections[currentSection].questions.length}`);
    setTimeout(() => setSuccess(''), 2000);
  };

  const removeQuestion = (sectionIndex, questionIndex) => {
    const newSections = [...sections];
    newSections[sectionIndex].questions.splice(questionIndex, 1);
    setSections(newSections);
  };

  const addSection = () => {
    const sectionName = prompt('Enter section name (e.g., General Knowledge, Mathematics):');
    if (sectionName) {
      setSections([...sections, { name: sectionName, questions: [] }]);
    }
  };

  const removeSection = (index) => {
    if (sections.length === 1) {
      setError('Cannot remove the last section');
      return;
    }
    const newSections = sections.filter((_, i) => i !== index);
    setSections(newSections);
    if (currentSection >= newSections.length) {
      setCurrentSection(newSections.length - 1);
    }
  };

  const handleSubmit = async () => {
    if (!testData.title.trim()) {
      setError('Test title is required');
      return;
    }

    const totalQuestions = sections.reduce((sum, section) => sum + section.questions.length, 0);
    if (totalQuestions === 0) {
      setError('Please add at least one question');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = getAuthToken();
      const response = await fetch('/api/admin/create-test-manual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: testData.title,
          description: testData.description,
          duration: parseInt(testData.duration),
          isPremium: testData.isPremium,
          negativeMarking: {
            enabled: testData.negativeMarking,
            deduction: parseFloat(testData.negativeMarks)
          },
          sections: sections.map(section => ({
            name: section.name,
            totalMarks: section.questions.length,
            duration: Math.ceil(parseInt(testData.duration) / sections.length),
            questions: section.questions.map(q => ({
              question: q.questionText,
              options: q.options,
              correctAnswer: parseInt(q.correctAnswer),
              explanation: q.explanation || '',
              marks: 1
            }))
          }))
        })
      });

      const data = await response.json();

      if (data.status === 'success') {
        setSuccess('Test created successfully!');
        setTimeout(() => navigate('/admin/dashboard'), 2000);
      } else {
        setError(data.message || 'Failed to create test');
      }
    } catch (err) {
      console.error('Create Test Error:', err);
      setError('Failed to create test. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const totalQuestions = sections.reduce((sum, section) => sum + section.questions.length, 0);

  return (
    <div className="manual-creator">
      <div className="creator-header">
        <h1>📝 Create Test Manually</h1>
        <p>Add questions one by one without uploading PDF</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* Test Details */}
      <div className="creator-section">
        <h2>Test Details</h2>
        <div className="form-grid">
          <div className="form-group">
            <label>Test Title *</label>
            <input
              type="text"
              value={testData.title}
              onChange={(e) => handleTestDataChange('title', e.target.value)}
              placeholder="e.g., CDS Mock Test 2024"
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={testData.description}
              onChange={(e) => handleTestDataChange('description', e.target.value)}
              placeholder="Brief description of the test"
              rows="2"
            />
          </div>
          <div className="form-group">
            <label>Duration (minutes)</label>
            <input
              type="number"
              value={testData.duration}
              onChange={(e) => handleTestDataChange('duration', parseInt(e.target.value))}
              min="30"
            />
          </div>
          <div className="form-group">
            <label>Passing Percentage</label>
            <input
              type="number"
              value={testData.passingPercentage}
              onChange={(e) => handleTestDataChange('passingPercentage', parseInt(e.target.value))}
              min="0"
              max="100"
            />
          </div>
          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={testData.negativeMarking}
                onChange={(e) => handleTestDataChange('negativeMarking', e.target.checked)}
              />
              Negative Marking
            </label>
            {testData.negativeMarking && (
              <input
                type="number"
                value={testData.negativeMarks}
                onChange={(e) => handleTestDataChange('negativeMarks', parseFloat(e.target.value))}
                step="0.25"
                min="0"
                max="1"
                placeholder="0.33"
              />
            )}
          </div>
          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={testData.isPremium}
                onChange={(e) => handleTestDataChange('isPremium', e.target.checked)}
              />
              Premium Test
            </label>
          </div>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="creator-section">
        <div className="section-header">
          <h2>Sections</h2>
          <button className="btn-add-section" onClick={addSection}>+ Add Section</button>
        </div>
        <div className="section-tabs">
          {sections.map((section, index) => (
            <div
              key={index}
              className={`section-tab ${currentSection === index ? 'active' : ''}`}
              onClick={() => setCurrentSection(index)}
            >
              {section.name} ({section.questions.length})
              {sections.length > 1 && (
                <button
                  className="btn-remove-section"
                  onClick={(e) => { e.stopPropagation(); removeSection(index); }}
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add Question Form */}
      <div className="creator-section">
        <h2>Add Question to {sections[currentSection].name}</h2>
        <div className="question-form">
          <div className="form-group">
            <label>Question Text *</label>
            <textarea
              value={currentQuestion.questionText}
              onChange={(e) => handleQuestionChange('questionText', e.target.value)}
              placeholder="Enter your question here..."
              rows="3"
            />
          </div>

          <div className="options-grid">
            {currentQuestion.options.map((option, index) => (
              <div key={index} className="option-input">
                <label>Option {String.fromCharCode(65 + index)}</label>
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${String.fromCharCode(65 + index)}`}
                />
              </div>
            ))}
          </div>

          <div className="form-group">
            <label>Correct Answer *</label>
            <select
              value={currentQuestion.correctAnswer}
              onChange={(e) => handleQuestionChange('correctAnswer', e.target.value)}
            >
              <option value="">Select correct answer</option>
              {currentQuestion.options.map((option, index) => (
                option.trim() && (
                  <option key={index} value={index}>
                    Option {String.fromCharCode(65 + index)}: {option.substring(0, 50)}
                  </option>
                )
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Explanation (Optional)</label>
            <textarea
              value={currentQuestion.explanation}
              onChange={(e) => handleQuestionChange('explanation', e.target.value)}
              placeholder="Explain why this is the correct answer..."
              rows="2"
            />
          </div>

          <button className="btn-add-question" onClick={addQuestion}>
            ➕ Add Question
          </button>
        </div>
      </div>

      {/* Questions List */}
      {sections[currentSection].questions.length > 0 && (
        <div className="creator-section">
          <h2>Questions in {sections[currentSection].name} ({sections[currentSection].questions.length})</h2>
          <div className="questions-list">
            {sections[currentSection].questions.map((q, qIndex) => (
              <div key={qIndex} className="question-preview">
                <div className="question-preview-header">
                  <strong>Q{qIndex + 1}.</strong> {q.questionText}
                  <button
                    className="btn-remove-question"
                    onClick={() => removeQuestion(currentSection, qIndex)}
                  >
                    🗑️
                  </button>
                </div>
                <div className="question-preview-options">
                  {q.options.map((opt, optIndex) => (
                    <div
                      key={optIndex}
                      className={`preview-option ${q.correctAnswer === optIndex ? 'correct' : ''}`}
                    >
                      {String.fromCharCode(65 + optIndex)}) {opt}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary & Submit */}
      <div className="creator-section">
        <div className="test-summary">
          <h3>Test Summary</h3>
          <div className="summary-stats">
            <div className="summary-item">
              <span className="summary-label">Total Questions:</span>
              <span className="summary-value">{totalQuestions}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Total Marks:</span>
              <span className="summary-value">{totalQuestions}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Sections:</span>
              <span className="summary-value">{sections.length}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Duration:</span>
              <span className="summary-value">{testData.duration} min</span>
            </div>
          </div>
          <button
            className="btn-create-test"
            onClick={handleSubmit}
            disabled={loading || totalQuestions === 0}
          >
            {loading ? 'Creating Test...' : '🚀 Create Test'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManualTestCreator;
