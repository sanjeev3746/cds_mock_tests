# 🎖️ CDS Mock Test Platform

A complete **Online Mock Test Platform** for CDS (Combined Defence Services) exam preparation. Built with Node.js, Express, MongoDB, and React.

## 🌟 Features

### Phase 1 (MVP) - ✅ Implemented

- **User Authentication**
  - Secure registration and login with JWT
  - Password hashing with bcrypt
  - Protected routes

- **Mock Test Engine**
  - Real exam-like interface
  - 2-hour timer with auto-submission
  - Section-wise navigation (English, GK, Maths)
  - Question flagging and review
  - Save and resume functionality

- **Scoring & Analytics**
  - Instant score calculation
  - Negative marking support
  - Section-wise performance analysis
  - Time metrics and accuracy tracking

- **Leaderboard**
  - Test-specific rankings
  - Percentile calculation
  - Global top performers

- **Result Analysis**
  - Detailed performance reports
  - Section-wise breakdown
  - Question-by-question analysis (Premium)

- **Freemium Model**
  - Free: 1 test per week
  - Premium: Unlimited tests + detailed solutions

## 🏗️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database (with Mongoose ODM)
- **JWT** - Authentication
- **Bcrypt** - Password hashing

### Frontend
- **React** - UI library
- **React Router** - Navigation
- **CSS** - Styling (no frameworks, custom design)

## 📁 Project Structure

```
mock_paper/
├── server.js                 # Main server file
├── package.json             # Backend dependencies
├── .env.example             # Environment variables template
├── seedData.js              # Sample test data seeder
│
├── models/                  # MongoDB schemas
│   ├── User.js             # User model with stats
│   ├── Test.js             # Test structure with sections
│   ├── Result.js           # Test results and analytics
│   └── Attempt.js          # Active test attempts
│
├── controllers/            # Business logic
│   ├── authController.js   # Authentication handlers
│   ├── testController.js   # Test management
│   ├── resultController.js # Result processing
│   └── leaderboardController.js # Rankings
│
├── routes/                 # API routes
│   ├── auth.js            # Auth endpoints
│   ├── tests.js           # Test endpoints
│   ├── results.js         # Result endpoints
│   └── leaderboard.js     # Leaderboard endpoints
│
├── middleware/            # Custom middleware
│   └── auth.js           # JWT verification
│
├── utils/                # Helper functions
│   └── helpers.js        # Utility functions
│
└── client/               # React frontend
    ├── package.json      # Frontend dependencies
    ├── public/          # Static files
    └── src/
        ├── App.js       # Main app component
        ├── index.js     # Entry point
        ├── index.css    # Global styles
        ├── components/  # Reusable components
        │   └── Navbar.js
        ├── pages/       # Route pages
        │   ├── Home.js
        │   ├── Login.js
        │   ├── Register.js
        │   ├── Dashboard.js
        │   ├── Tests.js
        │   ├── TestDetail.js
        │   ├── TakeTest.js
        │   ├── Results.js
        │   ├── ResultDetail.js
        │   ├── Leaderboard.js
        │   └── Profile.js
        ├── context/     # React context
        │   └── AuthContext.js
        └── utils/       # Frontend utilities
            └── auth.js
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
cd e:\Internship Projects\mock_paper
```

2. **Install backend dependencies**
```bash
npm install
```

3. **Install frontend dependencies**
```bash
cd client
npm install
cd ..
```

4. **Setup environment variables**

Create a `.env` file in the root directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/cds_mock_test
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:3000
```

For MongoDB Atlas (Production):
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cds_mock_test
```

5. **Seed sample test data** (Optional)
```bash
node seedData.js
```

### Running the Application

#### Development Mode

**Run backend server:**
```bash
npm run dev
```
Server runs on: `http://localhost:5000`

**Run frontend (in a new terminal):**
```bash
cd client
npm start
```
Frontend runs on: `http://localhost:3000`

#### Production Mode

**Build frontend:**
```bash
npm run build
```

**Run server:**
```bash
npm start
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/password` - Change password

### Tests
- `GET /api/tests` - Get all available tests
- `GET /api/tests/:id` - Get test details
- `POST /api/tests/:id/start` - Start test attempt
- `GET /api/tests/attempt/:attemptId` - Get attempt status
- `PUT /api/tests/attempt/:attemptId/answer` - Save answer
- `POST /api/tests/attempt/:attemptId/submit` - Submit test
- `POST /api/tests/create` - Create new test

### Results
- `GET /api/results` - Get user's all results
- `GET /api/results/:id` - Get result details
- `GET /api/results/test/:testId` - Results for specific test
- `GET /api/results/:id/analysis` - Detailed analysis (Premium)

### Leaderboard
- `GET /api/leaderboard/:testId` - Test leaderboard
- `GET /api/leaderboard/global/top` - Global rankings

## 🎯 Database Schema

### User
- Authentication details (email, password)
- Profile info (name, phone)
- Premium status and expiry
- Statistics (total tests, average score, best score)

### Test
- Test metadata (title, description, type, category)
- Sections with questions
- Duration and marking scheme
- Negative marking configuration

### Result
- User reference
- Test reference
- Answers with correctness
- Score breakdown
- Section-wise analysis
- Time metrics
- Rank and percentile

### Attempt
- Active test session
- Start and expiry time
- Current answers (saved progress)
- Last activity tracking

## 🔐 Authentication Flow

1. User registers/logs in
2. Server generates JWT token
3. Token stored in localStorage
4. Token sent with each API request in Authorization header
5. Middleware verifies token before protected routes

## 🎨 UI/UX Highlights

- **Clean, Military-themed Design** - Olive green color scheme
- **Fully Responsive** - Works on mobile, tablet, and desktop
- **Real-time Timer** - Visual countdown with warnings
- **Progress Tracking** - Visual question grid
- **Intuitive Navigation** - Easy section and question switching
- **Performance Graphs** - Visual analytics

## 💰 Monetization Strategy

### Free Users
- 1 mock test per week
- Basic score report
- Leaderboard access

### Premium Users (₹99/month)
- Unlimited mock tests
- Detailed solutions with explanations
- Advanced analytics
- Performance insights
- Rank prediction

## 🚀 Deployment

### Backend (Render / Heroku / Railway)

1. Set environment variables in platform dashboard
2. Connect GitHub repository
3. Deploy

### Frontend (Vercel / Netlify)

1. Build React app: `npm run build`
2. Deploy `client/build` folder
3. Set environment variables if needed

### MongoDB (MongoDB Atlas)

1. Create free cluster on MongoDB Atlas
2. Get connection string
3. Add to `.env` as `MONGODB_URI`

## 📈 Future Enhancements (Phase 2)

- [ ] Payment gateway integration (Razorpay/Stripe)
- [ ] Email notifications
- [ ] Daily mini quizzes
- [ ] Study material repository
- [ ] Discussion forum
- [ ] Mobile app (React Native)
- [ ] Performance prediction AI
- [ ] Video solutions
- [ ] Telegram bot integration
- [ ] Admin dashboard for test creation
- [ ] Expand to NDA, AFCAT, CAPF

## 🤝 Contributing

This is a personal project, but contributions are welcome!

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 📝 License

MIT License - feel free to use this project for learning or commercial purposes.

## 👤 Author

Built by a CS student passionate about EdTech and defence preparation.

## 🙏 Acknowledgments

- UPSC for CDS exam pattern
- Defence aspirants community for feedback
- Open source community for amazing tools

## 📞 Support

For issues or questions:
- Open an issue on GitHub
- Email: support@cdsmocktest.com (setup when live)

## 🎯 Goals

- Help 10,000+ defence aspirants
- Become the go-to platform for CDS preparation
- Build a sustainable EdTech business
- Create a strong personal brand in the defence exam space

---

**Made with ❤️ for India's future defence officers**

🇮🇳 **Jai Hind!** 🎖️
