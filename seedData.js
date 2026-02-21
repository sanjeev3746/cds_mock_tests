const mongoose = require('mongoose');
const Test = require('./models/Test');
require('dotenv').config();

// Sample CDS Test Data
const sampleTests = [
  {
    title: 'CDS Full Length Mock Test - 1',
    description: 'Complete mock test covering English, GK, and Mathematics as per CDS pattern',
    type: 'full-length',
    category: 'IMA/INA/AFA',
    totalMarks: 300,
    duration: 120,
    isPremium: false,
    negativeMarking: {
      enabled: true,
      deduction: 0.33
    },
    sections: [
      {
        name: 'English',
        totalMarks: 100,
        duration: 40,
        questions: [
          {
            question: 'Choose the word most similar in meaning to "ABUNDANT"',
            options: ['Scarce', 'Plentiful', 'Limited', 'Rare'],
            correctAnswer: 1,
            explanation: 'Abundant means plentiful or existing in large quantities.',
            marks: 1
          },
          {
            question: 'Identify the error in: "Neither of the two boys have done their homework."',
            options: ['Neither of', 'two boys', 'have done', 'No error'],
            correctAnswer: 2,
            explanation: '"Neither" is singular, so it should be "has done" instead of "have done".',
            marks: 1
          },
          {
            question: 'Choose the correct passive voice: "They are building a new hospital."',
            options: [
              'A new hospital is being built by them',
              'A new hospital was being built by them',
              'A new hospital has been built by them',
              'A new hospital is built by them'
            ],
            correctAnswer: 0,
            explanation: 'Present continuous tense in passive voice uses "is/are being + past participle".',
            marks: 1
          },
          {
            question: 'Fill in the blank: "He is senior ____ me."',
            options: ['than', 'to', 'from', 'over'],
            correctAnswer: 1,
            explanation: 'Senior and junior are followed by "to", not "than".',
            marks: 1
          },
          {
            question: 'Choose the antonym of "METICULOUS"',
            options: ['Careful', 'Careless', 'Thorough', 'Precise'],
            correctAnswer: 1,
            explanation: 'Meticulous means very careful and precise. Its antonym is careless.',
            marks: 1
          }
        ]
      },
      {
        name: 'GK',
        totalMarks: 100,
        duration: 40,
        questions: [
          {
            question: 'Who is the Supreme Commander of the Indian Armed Forces?',
            options: ['Prime Minister', 'President', 'Defence Minister', 'Chief of Defence Staff'],
            correctAnswer: 1,
            explanation: 'The President of India is the Supreme Commander of the Indian Armed Forces.',
            marks: 1
          },
          {
            question: 'The Indian Military Academy is located in:',
            options: ['Dehradun', 'Pune', 'Hyderabad', 'Bangalore'],
            correctAnswer: 0,
            explanation: 'The Indian Military Academy (IMA) is located in Dehradun, Uttarakhand.',
            marks: 1
          },
          {
            question: 'Which missile is known as "Fire and Forget" missile?',
            options: ['Prithvi', 'Agni', 'Nag', 'BrahMos'],
            correctAnswer: 2,
            explanation: 'Nag is an anti-tank guided missile with "Fire and Forget" capability.',
            marks: 1
          },
          {
            question: 'Operation Vijay was related to:',
            options: ['Kargil War', 'Siachen Conflict', 'Indo-Pak War 1971', 'Goa Liberation'],
            correctAnswer: 0,
            explanation: 'Operation Vijay was the code name for the Indian armed forces operations during the 1999 Kargil War.',
            marks: 1
          },
          {
            question: 'The highest gallantry award in India is:',
            options: ['Ashok Chakra', 'Param Vir Chakra', 'Vir Chakra', 'Mahavir Chakra'],
            correctAnswer: 1,
            explanation: 'Param Vir Chakra is India\'s highest military decoration awarded for the highest degree of valour in the presence of the enemy.',
            marks: 1
          }
        ]
      },
      {
        name: 'Maths',
        totalMarks: 100,
        duration: 40,
        questions: [
          {
            question: 'If 20% of a number is 50, what is the number?',
            options: ['200', '250', '300', '350'],
            correctAnswer: 1,
            explanation: 'Let the number be x. Then 20% of x = 50, which means (20/100) × x = 50. Therefore x = 250.',
            marks: 1
          },
          {
            question: 'The average of 5 consecutive numbers is 18. What is the largest number?',
            options: ['18', '19', '20', '21'],
            correctAnswer: 2,
            explanation: 'If average is 18, the numbers are 16, 17, 18, 19, 20. The largest is 20.',
            marks: 1
          },
          {
            question: 'A train 100m long passes a pole in 5 seconds. What is its speed in km/hr?',
            options: ['72', '60', '54', '36'],
            correctAnswer: 0,
            explanation: 'Speed = Distance/Time = 100/5 = 20 m/s. Converting to km/hr: 20 × (18/5) = 72 km/hr.',
            marks: 1
          },
          {
            question: 'If the ratio of two numbers is 3:4 and their sum is 140, what is the larger number?',
            options: ['60', '70', '80', '90'],
            correctAnswer: 2,
            explanation: 'Let numbers be 3x and 4x. Then 3x + 4x = 140, so 7x = 140, x = 20. Larger number = 4x = 80.',
            marks: 1
          },
          {
            question: 'What is the compound interest on ₹10,000 at 10% per annum for 2 years?',
            options: ['₹2,000', '₹2,100', '₹2,200', '₹2,500'],
            correctAnswer: 1,
            explanation: 'CI = P(1+r/100)^t - P = 10000(1.1)^2 - 10000 = 12100 - 10000 = ₹2,100.',
            marks: 1
          }
        ]
      }
    ]
  },
  {
    title: 'CDS English Sectional Test',
    description: 'Focused practice on English section covering vocabulary, grammar, and comprehension',
    type: 'sectional',
    category: 'IMA/INA/AFA',
    totalMarks: 100,
    duration: 40,
    isPremium: false,
    negativeMarking: {
      enabled: true,
      deduction: 0.33
    },
    sections: [
      {
        name: 'English',
        totalMarks: 100,
        duration: 40,
        questions: [
          {
            question: 'Choose the correctly spelled word:',
            options: ['Accomodation', 'Accommodation', 'Acommodation', 'Acomodation'],
            correctAnswer: 1,
            explanation: 'The correct spelling is "Accommodation" with double c and double m.',
            marks: 1
          },
          {
            question: 'Fill in the blank: "She is addicted ____ smoking."',
            options: ['with', 'to', 'of', 'for'],
            correctAnswer: 1,
            explanation: '"Addicted to" is the correct phrase. We use "to" after addicted.',
            marks: 1
          },
          {
            question: 'What is the meaning of the idiom "A blessing in disguise"?',
            options: [
              'An obvious advantage',
              'Something good that initially seemed bad',
              'A hidden curse',
              'A fake blessing'
            ],
            correctAnswer: 1,
            explanation: '"A blessing in disguise" means something that seems bad at first but turns out to be good.',
            marks: 1
          }
        ]
      }
    ]
  }
];

// Seed database
const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');

    // Clear existing tests
    await Test.deleteMany({});
    console.log('🗑️  Cleared existing tests');

    // Insert sample tests
    await Test.insertMany(sampleTests);
    console.log('✅ Sample tests inserted successfully');

    console.log('\n📊 Database seeded with:');
    console.log(`   - ${sampleTests.length} tests`);
    console.log(`   - Total questions: ${sampleTests.reduce((sum, test) => 
      sum + test.sections.reduce((s, section) => s + section.questions.length, 0), 0)}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
