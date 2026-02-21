const pdfParse = require('pdf-parse');

/**
 * Parse PDF and extract questions with options and answers
 * Supports multiple formats including CDS, NDA, AFCAT, etc.
 */
const extractQuestionsFromPDF = async (pdfBuffer) => {
  try {
    const data = await pdfParse(pdfBuffer);
    const text = data.text;

    console.log('=== PDF Parser Debug ===');
    console.log('Total text length:', text.length);
    console.log('First 500 characters:', text.substring(0, 500));
    
    const questions = [];
    
    // Split text into lines
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    console.log('Total lines:', lines.length);
    console.log('First 10 lines:', lines.slice(0, 10));
    
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      
      // Multiple question number patterns:
      // 1. Question   OR   1) Question   OR   Q1. Question   OR   Q.1 Question
      const questionMatch = line.match(/^(?:Q[\.\s]?)?(\d+)[\.\)]\s*(.+)/i);
      
      if (questionMatch) {
        const questionNum = parseInt(questionMatch[1]);
        let questionText = questionMatch[2];
        
        console.log(`Found question ${questionNum}: ${questionText.substring(0, 50)}...`);
        
        // Collect multi-line question text
        i++;
        let optionStarted = false;
        while (i < lines.length && !optionStarted) {
          // Check if next line is an option or next question
          if (lines[i].match(/^[A-D][\.\)]/i) || 
              lines[i].match(/^\([A-D]\)/i) ||
              lines[i].match(/^(?:Q[\.\s]?)?\d+[\.\)]/i)) {
            break;
          }
          questionText += ' ' + lines[i];
          i++;
        }
        
        // Extract options - support multiple formats
        const options = [];
        let correctAnswer = '';
        
        // Patterns: A) text   OR   (A) text   OR   A. text
        while (i < lines.length && options.length < 4) {
          const optionMatch = lines[i].match(/^(?:\()?([A-D])[\.\)]\)?\s*(.+)/i);
          if (optionMatch) {
            const optionLetter = optionMatch[1].toUpperCase();
            let optionText = optionMatch[2];
            
            // Handle multi-line options
            let nextIdx = i + 1;
            while (nextIdx < lines.length && 
                   !lines[nextIdx].match(/^(?:\()?[A-D][\.\)]/i) &&
                   !lines[nextIdx].match(/^(?:Q[\.\s]?)?\d+[\.\)]/i) &&
                   !lines[nextIdx].match(/(?:Answer|Ans|Correct)/i)) {
              optionText += ' ' + lines[nextIdx];
              nextIdx++;
            }
            i = nextIdx;
            
            options.push({
              option: optionLetter,
              text: optionText.trim()
            });
            console.log(`  Option ${optionLetter}: ${optionText.substring(0, 30)}...`);
          } else {
            break;
          }
        }
        
        // Look for answer in next few lines
        // Patterns: Answer: A   OR   Ans: A   OR   Correct: A   OR   (A)
        for (let j = 0; j < 5 && (i + j) < lines.length; j++) {
          const answerMatch = lines[i + j].match(/(?:Answer|Ans|Correct|Key)[:.\s]*\(?([A-D])\)?/i);
          if (answerMatch) {
            correctAnswer = answerMatch[1].toUpperCase();
            i += j + 1;
            console.log(`  Correct Answer: ${correctAnswer}`);
            break;
          }
        }
        
        // Only add question if it has at least 2 options
        if (options.length >= 2) {
          questions.push({
            questionNumber: questionNum,
            questionText: questionText.trim(),
            options,
            correctAnswer: correctAnswer || '', // Leave empty if not found
            explanation: ''
          });
          console.log(`✓ Added question ${questionNum} with ${options.length} options`);
        } else {
          console.log(`✗ Skipped question ${questionNum} - only ${options.length} options found`);
        }
      } else {
        i++;
      }
    }
    
    console.log(`=== Total questions extracted: ${questions.length} ===`);
    
    return {
      success: true,
      totalQuestions: questions.length,
      questions,
      rawText: text.substring(0, 2000), // First 2000 chars for preview
      debugInfo: {
        totalLines: lines.length,
        firstLines: lines.slice(0, 20)
      }
    };
    
  } catch (error) {
    console.error('PDF Parse Error:', error);
    return {
      success: false,
      error: error.message,
      questions: [],
      rawText: ''
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
