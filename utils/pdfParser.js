const pdfParse = require('pdf-parse');

/**
 * Parse PDF and extract questions with options and answers
 * Supports common Indian exam paper formats (CDS, NDA, AFCAT, etc.)
 */
const extractQuestionsFromPDF = async (pdfBuffer) => {
  try {
    const data = await pdfParse(pdfBuffer);
    const text = data.text;

    const questions = [];
    
    // Pattern to match question blocks
    // Example formats:
    // 1. Question text?
    //    A) Option 1
    //    B) Option 2
    //    C) Option 3
    //    D) Option 4
    //    Answer: A or (A) or Ans: A
    
    // Split text into lines
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      
      // Check if line starts with a question number (1., 2., Q1., etc.)
      const questionMatch = line.match(/^(\d+)[\.\)]\s*(.+)/);
      
      if (questionMatch) {
        const questionNum = parseInt(questionMatch[1]);
        let questionText = questionMatch[2];
        
        // Collect multi-line question text
        i++;
        while (i < lines.length && !lines[i].match(/^[A-D][\.\)]/i)) {
          if (!lines[i].match(/^(\d+)[\.\)]/)) {
            questionText += ' ' + lines[i];
          } else {
            break;
          }
          i++;
        }
        
        // Extract options
        const options = [];
        let correctAnswer = '';
        
        // Look for options A, B, C, D
        while (i < lines.length && options.length < 4) {
          const optionMatch = lines[i].match(/^([A-D])[\.\)]\s*(.+)/i);
          if (optionMatch) {
            const optionLetter = optionMatch[1].toUpperCase();
            const optionText = optionMatch[2];
            options.push({
              option: optionLetter,
              text: optionText
            });
            i++;
          } else {
            break;
          }
        }
        
        // Look for answer in next few lines
        for (let j = 0; j < 3 && (i + j) < lines.length; j++) {
          const answerMatch = lines[i + j].match(/(?:Answer|Ans|Correct)[:.\s]*\(?([A-D])\)?/i);
          if (answerMatch) {
            correctAnswer = answerMatch[1].toUpperCase();
            i += j + 1;
            break;
          }
        }
        
        // Only add question if it has at least 2 options
        if (options.length >= 2) {
          questions.push({
            questionNumber: questionNum,
            questionText: questionText.trim(),
            options,
            correctAnswer: correctAnswer || 'A', // Default to A if not found
            explanation: '' // Leave empty for manual entry
          });
        }
      } else {
        i++;
      }
    }
    
    return {
      success: true,
      totalQuestions: questions.length,
      questions,
      rawText: text.substring(0, 1000) // First 1000 chars for preview
    };
    
  } catch (error) {
    console.error('PDF Parse Error:', error);
    return {
      success: false,
      error: error.message,
      questions: []
    };
  }
};

/**
 * Categorize questions by section based on question numbers or keywords
 */
const categorizeQuestions = (questions) => {
  const sections = {
    english: [],
    generalKnowledge: [],
    mathematics: []
  };
  
  // Simple categorization - can be improved with keywords
  const questionsPerSection = Math.ceil(questions.length / 3);
  
  questions.forEach((q, index) => {
    if (index < questionsPerSection) {
      sections.english.push(q);
    } else if (index < questionsPerSection * 2) {
      sections.generalKnowledge.push(q);
    } else {
      sections.mathematics.push(q);
    }
  });
  
  return sections;
};

module.exports = {
  extractQuestionsFromPDF,
  categorizeQuestions
};
