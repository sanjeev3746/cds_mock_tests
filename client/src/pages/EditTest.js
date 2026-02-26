import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAuthToken } from '../utils/auth';
import MathText from '../components/MathText';
import './ManualTestCreator.css';

const EditTest = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [testData, setTestData] = useState({
    title: '',
    description: '',
    duration: 120,
    negativeMarking: true,
    negativeMarks: 0.33,
    isPremium: false
  });

  const [sections, setSections] = useState([]);
  const [currentSection, setCurrentSection] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState({
    questionText: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    explanation: ''
  });
  const [editIndex, setEditIndex] = useState(null); // For editing individual questions

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTestData();
  }, [id]);

  const fetchTestData = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`/api/admin/tests/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.status === 'success') {
        const test = data.data.test;
        setTestData({
          title: test.title,
          description: test.description || '',
          duration: test.duration,
          negativeMarking: test.negativeMarking?.enabled || false,
          negativeMarks: test.negativeMarking?.deduction || 0.33,
          isPremium: test.isPremium || false
        });

        // Transform sections data for editing
        const transformedSections = test.sections.map(section => ({
          name: section.name,
          questions: section.questions.map(q => ({
            questionType: q.questionType || 'normal',
            directions: q.directions || '',
            questionText: q.question,
            options: q.options || ['', '', '', ''],
            correctAnswer: q.correctAnswer || '',
            explanation: q.explanation || '',
            arrangementParts: q.arrangementParts || ['', '', '', ''],
            arrangementOrder: q.questionType === 'arrangement' ? q.correctAnswer : ''
          }))
        }));

        setSections(transformedSections);
        setLoading(false);
      } else {
        setError('Failed to load test data');
        setLoading(false);
      }
    } catch (err) {
      console.error('Fetch Test Error:', err);
      setError('Failed to load test data');
      setLoading(false);
    }
  };

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

    if (currentQuestion.correctAnswer === '') {
      setError('Please select the correct answer');
      return;
    }

    const newSections = [...sections];
    if (editIndex !== null) {
      // Edit existing question
      newSections[currentSection].questions[editIndex] = { ...currentQuestion };
      setEditIndex(null);
      setSuccess('Question updated!');
    } else {
      // Add new question
      newSections[currentSection].questions.push({ ...currentQuestion });
      setSuccess(`Question added! Total: ${newSections[currentSection].questions.length}`);
    }
    setSections(newSections);
    setCurrentQuestion({
      questionText: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      explanation: ''
    });
    setError('');
    setTimeout(() => setSuccess(''), 2000);
  };

  // Edit a question
  const handleEditQuestion = (q, idx) => {
    setCurrentQuestion({ ...q });
    setEditIndex(idx);
    setError('');
    setSuccess('Editing question...');
  };

  // Rearrangement (drag-and-drop)
  const handleDragStart = (e, idx) => {
    e.dataTransfer.setData('drag-question-index', idx);
  };
  const handleDrop = (e, dropIdx) => {
    const dragIdx = parseInt(e.dataTransfer.getData('drag-question-index'));
    if (dragIdx === dropIdx) return;
    const newSections = [...sections];
    const questions = [...newSections[currentSection].questions];
    const [moved] = questions.splice(dragIdx, 1);
    questions.splice(dropIdx, 0, moved);
    newSections[currentSection].questions = questions;
    setSections(newSections);
  };
  const handleDragOver = (e) => {
    e.preventDefault();
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

    setSaving(true);
    setError('');

    try {
      const token = getAuthToken();
      const response = await fetch(`/api/admin/tests/${id}`, {
        method: 'PUT',
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
        setSuccess('Test updated successfully!');
        setTimeout(() => navigate('/admin/tests'), 2000);
      } else {
        setError(data.message || 'Failed to update test');
      }
    } catch (err) {
      console.error('Update Test Error:', err);
      setError('Failed to update test. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const totalQuestions = sections.reduce((sum, section) => sum + section.questions.length, 0);

  if (loading) {
    return <div className="manual-creator"><div className="loading">Loading test data...</div></div>;
  }

  return (
    <div className="manual-creator">
      <div className="creator-header">
        <h1>✏️ Edit Test</h1>
        <p>Modify test details and questions</p>
        <button className="btn-back" onClick={() => navigate('/admin/tests')}>
          ← Back to Tests
        </button>
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
              placeholder="Brief description of the test..."
              rows="2"
            />
          </div>
          <div className="form-group">
            <label>Duration (minutes)</label>
            <input
              type="number"
              value={testData.duration}
              onChange={(e) => handleTestDataChange('duration', parseInt(e.target.value))}
              min="1"
              placeholder="120"
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
        <h2>Add/Edit Question to {sections[currentSection]?.name}</h2>
        <div className="question-form">
          <div className="form-group">
            <label>Directions (optional)</label>
            <textarea
              value={currentQuestion.directions}
              onChange={e => handleQuestionChange('directions', e.target.value)}
              placeholder="Write directions for this question (e.g., Arrange the parts to form a meaningful sentence)"
              rows="2"
            />
          </div>
          <div className="form-group">
            <label>Question Text *</label>
            <textarea
              value={currentQuestion.questionText}
              onChange={e => handleQuestionChange('questionText', e.target.value)}
              placeholder="Enter your question here... Use $...$ for math, e.g. $x^2 + \frac{1}{x} = 5$"
              rows="3"
            />
            {currentQuestion.questionText && currentQuestion.questionText.trim() && (
              <div className="math-preview">
                <span className="math-preview-label">Preview:</span>
                <MathText text={currentQuestion.questionText} />
              </div>
            )}
            <div style={{marginTop: '0.5rem'}}>
              <button type="button" onClick={() => {
                // Insert underline tags for selected text
                const sel = window.getSelection();
                if (sel && sel.toString()) {
                  const label = prompt('Label this part (P, Q, R, S):');
                  if (label && ['P','Q','R','S'].includes(label.toUpperCase())) {
                    const newText = currentQuestion.questionText.replace(sel.toString(), `<u>${sel.toString()}</u> (${label.toUpperCase()})`);
                    handleQuestionChange('questionText', newText);
                  }
                } else {
                  alert('Select text in the box above to underline and label.');
                }
              }}>Underline & Label Selected</button>
            </div>
          </div>
          {currentQuestion.questionType === 'arrangement' ? (
            <>
              <div className="arrangement-grid">
                {["P", "Q", "R", "S"].map((label, idx) => (
                  <div key={label} className="arrangement-part">
                    <label>Part {label}</label>
                    <input
                      type="text"
                      value={currentQuestion.arrangementParts[idx]}
                      onChange={e => {
                        const parts = [...currentQuestion.arrangementParts];
                        parts[idx] = e.target.value;
                        handleQuestionChange('arrangementParts', parts);
                      }}
                      placeholder={`Enter part ${label}`}
                    />
                  </div>
                ))}
              </div>
              <div className="form-group">
                <label>Correct Order (e.g., PQRS)</label>
                <input
                  type="text"
                  value={currentQuestion.arrangementOrder}
                  onChange={e => handleQuestionChange('arrangementOrder', e.target.value.toUpperCase())}
                  maxLength={4}
                  placeholder="PQRS"
                />
              </div>
              <div className="arrangement-preview">
                <strong>Preview:</strong>
                <div>
                  {["P", "Q", "R", "S"].map((label, idx) => (
                    <span key={label} style={{ marginRight: 8 }}>
                      <strong>{label}:</strong> {currentQuestion.arrangementParts[idx] || <em>...</em>}
                    </span>
                  ))}
                </div>
                {currentQuestion.arrangementOrder.length === 4 && (
                  <div style={{ marginTop: 8 }}>
                    <strong>Order:</strong> {currentQuestion.arrangementOrder.split('').map(l => currentQuestion.arrangementParts[["P","Q","R","S"].indexOf(l)]).join(' ')}
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="options-grid">
                {currentQuestion.options.map((option, index) => (
                  <div key={index} className="option-input">
                    <label>Option {String.fromCharCode(65 + index)}</label>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      placeholder={`Option ${String.fromCharCode(65 + index)} — use $...$ for math`}
                    />
                    {option && option.trim() && option.includes('$') && (
                      <div className="math-preview" style={{ marginTop: '4px', padding: '4px 8px' }}>
                        <MathText text={option} />
                      </div>
                    )}
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
            </>
          )}
          <div className="form-group">
            <label>Explanation (optional)</label>
            <textarea
              value={currentQuestion.explanation}
              onChange={(e) => handleQuestionChange('explanation', e.target.value)}
              placeholder="Explain why this answer is correct..."
              rows="2"
            />
          </div>
          <button className="btn-add-question" onClick={addQuestion}>
            + Add Question
          </button>
        </div>
      </div>

      {/* Questions List */}
      {sections[currentSection]?.questions.length > 0 && (
        <div className="creator-section">
          <h2>Questions in {sections[currentSection].name} ({sections[currentSection].questions.length})</h2>
          <div className="questions-list">
            {sections[currentSection].questions.map((q, index) => (
              <div
                key={index}
                className="question-preview"
                draggable
                onDragStart={e => handleDragStart(e, index)}
                onDrop={e => handleDrop(e, index)}
                onDragOver={handleDragOver}
                style={{ cursor: 'move', opacity: editIndex === index ? 0.5 : 1 }}
              >
                <div className="question-header">
                  <h4>Q{index + 1}. <MathText text={q.questionText} /></h4>
                  <button
                    className="btn-edit-question"
                    onClick={() => handleEditQuestion(q, index)}
                  >
                    ✎
                  </button>
                  <button
                    className="btn-remove-question"
                    onClick={() => removeQuestion(currentSection, index)}
                  >
                    ×
                  </button>
                </div>
                <div className="options-preview">
                  {q.options.map((opt, optIndex) => (
                    <div
                      key={optIndex}
                      className={`option-preview ${q.correctAnswer === optIndex ? 'correct' : ''}`}
                    >
                      {String.fromCharCode(65 + optIndex)}. <MathText text={opt} />
                    </div>
                  ))}
                </div>
                {q.explanation && (
                  <div className="explanation-preview">
                    <strong>Explanation:</strong> {q.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div style={{fontSize: '0.9em', color: '#888', marginTop: 8}}>
            Drag and drop questions to rearrange. Click ✎ to edit.
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
            disabled={saving || totalQuestions === 0}
          >
            {saving ? 'Updating Test...' : '💾 Update Test'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditTest;
