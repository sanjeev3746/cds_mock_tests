import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuthToken } from '../utils/auth';
import './AdminUpload.css';

function AdminUpload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [extractedQuestions, setExtractedQuestions] = useState([]);
  const [testData, setTestData] = useState({
    title: '',
    description: '',
    duration: 120
  });
  const [currentStep, setCurrentStep] = useState(1); // 1: Upload, 2: Review, 3: Save
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError('');
    } else {
      setError('Please select a valid PDF file');
      setFile(null);
    }
  };

  const handleUploadAndParse = async () => {
    if (!file) {
      setError('Please select a PDF file');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('pdf', file);

      const token = getAuthToken();
      const response = await fetch('/api/admin/upload-pdf', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      // Handle non-JSON responses (like 502 errors)
      if (!response.ok) {
        let errorMessage = 'Failed to upload PDF';
        try {
          const data = await response.json();
          errorMessage = data.message || errorMessage;
        } catch (jsonError) {
          // Response is not JSON - likely a server error
          if (response.status === 502) {
            errorMessage = 'Server timeout - PDF may be too large or image-based. Try a smaller file or convert with OCR first.';
          } else if (response.status === 413) {
            errorMessage = 'File too large. Maximum size is 150MB.';
          } else if (response.status === 408) {
            errorMessage = 'Processing timeout. File may be too large or image-based.';
          } else {
            errorMessage = `Server error (${response.status}). Please try again.`;
          }
        }
        setError(errorMessage);
        return;
      }

      const data = await response.json();

      if (data.status === 'success') {
        setExtractedQuestions(data.data.questions);
        setTestData({
          ...testData,
          title: file.name.replace('.pdf', '')
        });
        setCurrentStep(2);
        setSuccess(`Successfully extracted ${data.data.totalQuestions} questions!`);
      } else if (data.status === 'warning') {
        // Image-based PDF warning
        setError(data.message || 'PDF is image-based. Please convert with OCR first.');
      } else {
        setError(data.message || 'Failed to parse PDF');
      }
    } catch (err) {
      console.error('Upload Error:', err);
      if (err.name === 'SyntaxError') {
        setError('Server error processing PDF. File may be too large or corrupt.');
      } else {
        setError('Failed to upload PDF. Please try again.');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleQuestionEdit = (index, field, value) => {
    const updated = [...extractedQuestions];
    updated[index][field] = value;
    setExtractedQuestions(updated);
  };

  const handleOptionEdit = (qIndex, optIndex, value) => {
    const updated = [...extractedQuestions];
    updated[qIndex].options[optIndex].text = value;
    setExtractedQuestions(updated);
  };

  const handleDeleteQuestion = (index) => {
    const updated = extractedQuestions.filter((_, i) => i !== index);
    setExtractedQuestions(updated);
  };

  const handleCreateTest = async () => {
    if (!testData.title) {
      setError('Please enter a test title');
      return;
    }

    if (extractedQuestions.length === 0) {
      setError('No questions to create test');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const token = getAuthToken();
      const response = await fetch('/api/admin/create-test-from-pdf', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...testData,
          questions: extractedQuestions
        })
      });

      const data = await response.json();

      if (data.status === 'success') {
        setSuccess('Test created successfully!');
        setTimeout(() => {
          navigate('/tests');
        }, 2000);
      } else {
        setError(data.message || 'Failed to create test');
      }
    } catch (err) {
      console.error('Create Test Error:', err);
      setError('Failed to create test. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="admin-upload-container">
      <div className="admin-upload-header">
        <h1>📄 Upload Question Paper</h1>
        <p>Upload a PDF file to automatically extract and create a mock test</p>
      </div>

      {/* Progress Steps */}
      <div className="upload-steps">
        <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
          <span className="step-number">1</span>
          <span className="step-label">Upload PDF</span>
        </div>
        <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
          <span className="step-number">2</span>
          <span className="step-label">Review Questions</span>
        </div>
        <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
          <span className="step-number">3</span>
          <span className="step-label">Create Test</span>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Step 1: Upload */}
      {currentStep === 1 && (
        <div className="upload-section">
          <div className="upload-box">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              id="pdf-upload"
              className="file-input"
            />
            <label htmlFor="pdf-upload" className="upload-label">
              <div className="upload-icon">📁</div>
              <div className="upload-text">
                {file ? file.name : 'Click to select PDF file or drag & drop'}
              </div>
              <div className="upload-hint">Maximum file size: 150MB (Recommended: under 30MB for best performance)</div>
            </label>
          </div>

          <div className="upload-instructions">
            <h3>📋 Supported PDF Format:</h3>
            <ul>
              <li>Questions numbered (1., 2., 3., etc.)</li>
              <li>Options labeled as A), B), C), D)</li>
              <li>Answers indicated as "Answer: A" or "Ans: A"</li>
            </ul>
            <div className="example-format">
              <strong>Example:</strong>
              <pre>
{`1. What is the capital of India?
   A) Mumbai
   B) Delhi
   C) Kolkata
   D) Chennai
   Answer: B`}
              </pre>
            </div>
          </div>

          <button
            onClick={handleUploadAndParse}
            disabled={!file || uploading}
            className="btn btn-primary btn-large"
          >
            {uploading ? 'Parsing PDF...' : 'Upload & Extract Questions'}
          </button>
        </div>
      )}

      {/* Step 2: Review Questions */}
      {currentStep === 2 && (
        <div className="review-section">
          <div className="test-info-form">
            <h3>Test Information</h3>
            <div className="form-group">
              <label>Test Title *</label>
              <input
                type="text"
                value={testData.title}
                onChange={(e) => setTestData({ ...testData, title: e.target.value })}
                placeholder="e.g., CDS Mock Test - February 2024"
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={testData.description}
                onChange={(e) => setTestData({ ...testData, description: e.target.value })}
                placeholder="Brief description of the test"
                className="form-control"
                rows="3"
              />
            </div>
            <div className="form-group">
              <label>Duration (minutes)</label>
              <input
                type="number"
                value={testData.duration}
                onChange={(e) => setTestData({ ...testData, duration: parseInt(e.target.value) })}
                className="form-control"
                min="30"
                max="300"
              />
            </div>
          </div>

          <div className="questions-list">
            <h3>Extracted Questions ({extractedQuestions.length})</h3>
            <p className="hint">Review and edit questions before creating the test</p>

            {extractedQuestions.map((q, qIndex) => (
              <div key={qIndex} className="question-card">
                <div className="question-header">
                  <span className="question-number">Q{qIndex + 1}</span>
                  <button
                    onClick={() => handleDeleteQuestion(qIndex)}
                    className="btn-delete"
                    title="Delete question"
                  >
                    🗑️
                  </button>
                </div>

                <div className="form-group">
                  <label>Question Text</label>
                  <textarea
                    value={q.questionText}
                    onChange={(e) => handleQuestionEdit(qIndex, 'questionText', e.target.value)}
                    className="form-control"
                    rows="2"
                  />
                </div>

                <div className="options-grid">
                  {q.options.map((opt, optIndex) => (
                    <div key={optIndex} className="option-item">
                      <label>{opt.option})</label>
                      <input
                        type="text"
                        value={opt.text}
                        onChange={(e) => handleOptionEdit(qIndex, optIndex, e.target.value)}
                        className="form-control"
                      />
                    </div>
                  ))}
                </div>

                <div className="question-meta">
                  <div className="form-group">
                    <label>Correct Answer</label>
                    <select
                      value={q.correctAnswer}
                      onChange={(e) => handleQuestionEdit(qIndex, 'correctAnswer', e.target.value)}
                      className="form-control"
                    >
                      {q.options.map(opt => (
                        <option key={opt.option} value={opt.option}>{opt.option}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Explanation (Optional)</label>
                    <input
                      type="text"
                      value={q.explanation}
                      onChange={(e) => handleQuestionEdit(qIndex, 'explanation', e.target.value)}
                      placeholder="Add explanation for the answer"
                      className="form-control"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="action-buttons">
            <button
              onClick={() => setCurrentStep(1)}
              className="btn btn-secondary"
            >
              ← Back to Upload
            </button>
            <button
              onClick={handleCreateTest}
              disabled={uploading || !testData.title}
              className="btn btn-primary btn-large"
            >
              {uploading ? 'Creating Test...' : 'Create Test →'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUpload;
