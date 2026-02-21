const jwt = require('jsonwebtoken');

// Generate JWT Token
exports.generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// Calculate score for a test
exports.calculateScore = (test, answers) => {
  let totalMarks = 0;
  let obtainedMarks = 0;
  let correctAnswers = 0;
  let wrongAnswers = 0;
  let skippedQuestions = 0;

  const sectionWise = [];

  test.sections.forEach((section, sectionIndex) => {
    const sectionStats = {
      sectionName: section.name,
      totalQuestions: section.questions.length,
      attempted: 0,
      correct: 0,
      wrong: 0,
      skipped: 0,
      marks: 0,
      accuracy: 0
    };

    section.questions.forEach((question, questionIndex) => {
      totalMarks += question.marks;

      const answerKey = `${sectionIndex}-${questionIndex}`;
      const userAnswer = answers[answerKey];

      if (userAnswer === undefined || userAnswer === null || userAnswer === -1) {
        skippedQuestions++;
        sectionStats.skipped++;
      } else {
        sectionStats.attempted++;
        
        if (userAnswer === question.correctAnswer) {
          correctAnswers++;
          sectionStats.correct++;
          const marksGained = question.marks;
          obtainedMarks += marksGained;
          sectionStats.marks += marksGained;
        } else {
          wrongAnswers++;
          sectionStats.wrong++;
          
          // Apply negative marking if enabled
          if (test.negativeMarking.enabled) {
            const deduction = question.marks * test.negativeMarking.deduction;
            obtainedMarks -= deduction;
            sectionStats.marks -= deduction;
          }
        }
      }
    });

    // Calculate section accuracy
    if (sectionStats.attempted > 0) {
      sectionStats.accuracy = ((sectionStats.correct / sectionStats.attempted) * 100).toFixed(2);
    }

    sectionWise.push(sectionStats);
  });

  // Ensure obtained marks is not negative
  obtainedMarks = Math.max(0, obtainedMarks);

  const percentage = ((obtainedMarks / totalMarks) * 100).toFixed(2);

  return {
    score: {
      totalMarks,
      obtainedMarks: parseFloat(obtainedMarks.toFixed(2)),
      percentage: parseFloat(percentage),
      correctAnswers,
      wrongAnswers,
      skippedQuestions
    },
    sectionWise
  };
};

// Format time duration
exports.formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
};

// Validate email
exports.isValidEmail = (email) => {
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

// Generate random string
exports.generateRandomString = (length = 10) => {
  return Math.random().toString(36).substring(2, length + 2);
};
