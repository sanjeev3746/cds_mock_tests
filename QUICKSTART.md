# 🚀 Quick Start Guide

Get your CDS Mock Test Platform running in 5 minutes!

## Step 1: Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

## Step 2: Setup MongoDB

### Option A: Local MongoDB
1. Install MongoDB from https://www.mongodb.com/try/download/community
2. Start MongoDB service:
   - Windows: MongoDB runs as a service automatically
   - Mac: `brew services start mongodb-community`
   - Linux: `sudo systemctl start mongod`

### Option B: MongoDB Atlas (Cloud - Recommended)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a new cluster (Free tier available)
4. Click "Connect" → "Connect your application"
5. Copy the connection string
6. Update `.env` file with your connection string

## Step 3: Configure Environment Variables

The `.env` file is already created. Update if needed:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/cds_mock_test
JWT_SECRET=cds_mock_test_secret_key_2024_strong_random_string
CLIENT_URL=http://localhost:3000
```

## Step 4: Seed Sample Data

```bash
node seedData.js
```

This creates 2 sample tests:
1. CDS Full Length Mock Test - 1 (15 questions across 3 sections)
2. CDS English Sectional Test (3 questions)

## Step 5: Run the Application

### Terminal 1 - Backend Server
```bash
npm run dev
```
✅ Server running on http://localhost:5000

### Terminal 2 - Frontend
```bash
cd client
npm start
```
✅ Frontend running on http://localhost:3000

## Step 6: Create Your Account

1. Open http://localhost:3000
2. Click "Register"
3. Fill in your details:
   - Name: Test User
   - Email: test@example.com
   - Password: password123
4. Click "Register"

## Step 7: Take Your First Test

1. You'll be redirected to the Dashboard
2. Click "Take Mock Test" or navigate to "Tests"
3. Click on "CDS Full Length Mock Test - 1"
4. Click "Start Test"
5. Answer the questions
6. Click "Submit Test"
7. View your results!

## 📊 Test the Full Flow

### 1. Register
**Endpoint**: `POST http://localhost:5000/api/auth/register`
```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123"
}
```

### 2. Login
**Endpoint**: `POST http://localhost:5000/api/auth/login`
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

### 3. Get Tests
**Endpoint**: `GET http://localhost:5000/api/tests`
**Headers**: `Authorization: Bearer YOUR_TOKEN`

### 4. Start Test
**Endpoint**: `POST http://localhost:5000/api/tests/:testId/start`

### 5. Submit Test
**Endpoint**: `POST http://localhost:5000/api/tests/attempt/:attemptId/submit`

## 🐛 Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Make sure MongoDB is running
- Windows: Check Services → MongoDB should be running
- Mac/Linux: Run `mongod` in terminal

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution**: Change port in `.env` file or kill process using port 5000

### React App Not Starting
```
Error: Something is already running on port 3000
```
**Solution**: Kill process on port 3000 or it will offer port 3001

### JWT Token Error
```
Error: invalid token
```
**Solution**: Clear localStorage and login again

## 🎯 Next Steps

1. **Add More Tests**: Modify `seedData.js` to add more questions
2. **Customize Design**: Edit CSS files in `client/src/pages/`
3. **Add Features**: Check README.md for feature ideas
4. **Deploy**: See DEPLOYMENT.md for deployment guide

## 💡 Tips

- Use **Chrome DevTools** to inspect API calls (Network tab)
- Check **MongoDB Compass** to view database visually
- Use **Postman** to test API endpoints
- View **console.log** in terminal for backend logs
- Check browser console for frontend errors

## 📝 Sample User Flow

1. User registers → Gets JWT token
2. User browses tests → Clicks on a test
3. User starts test → Attempt created in database
4. User answers questions → Answers saved in real-time
5. Timer expires or user submits → Result calculated
6. User views result → Sees rank, percentile, analytics
7. User checks leaderboard → Compares with others

## 🎉 You're Ready!

You now have a fully functional CDS Mock Test Platform running locally. Time to customize it and make it your own!

**Questions?** Check README.md or open an issue on GitHub.

---

Happy Coding! 🚀
