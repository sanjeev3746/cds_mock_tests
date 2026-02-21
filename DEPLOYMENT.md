# 🚀 Deployment Guide

Deploy your CDS Mock Test Platform to production in 3 steps.

## 📋 Pre-Deployment Checklist

- [ ] MongoDB Atlas account created
- [ ] GitHub repository created
- [ ] All features tested locally
- [ ] Environment variables documented
- [ ] Sample data ready

## 🗄️ Step 1: MongoDB Atlas Setup

### 1.1 Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for free account
3. Create a new project: "CDS Mock Test"

### 1.2 Create Database Cluster
1. Click "Build a Database"
2. Choose **FREE** tier (M0 Sandbox)
3. Select region closest to your users (e.g., Mumbai for India)
4. Click "Create Cluster"

### 1.3 Create Database User
1. Go to "Database Access"
2. Click "Add New Database User"
3. Choose authentication method: Password
4. Username: `cds_admin`
5. Password: Generate strong password (save it!)
6. User Privileges: Read and write to any database
7. Click "Add User"

### 1.4 Configure Network Access
1. Go to "Network Access"
2. Click "Add IP Address"
3. Choose "Allow Access from Anywhere" (0.0.0.0/0)
   - Note: For production, restrict to specific IPs
4. Click "Confirm"

### 1.5 Get Connection String
1. Go to "Database" → Click "Connect"
2. Choose "Connect your application"
3. Copy connection string:
```
mongodb+srv://cds_admin:<password>@cluster0.xxxxx.mongodb.net/cds_mock_test?retryWrites=true&w=majority
```
4. Replace `<password>` with your actual password
5. Save this for deployment

### 1.6 Seed Data (Optional)
```bash
# Update .env with Atlas connection string
MONGODB_URI=mongodb+srv://cds_admin:yourpassword@cluster0.xxxxx.mongodb.net/cds_mock_test

# Run seeder
node seedData.js
```

## 🔧 Step 2: Backend Deployment (Render)

### 2.1 Push Code to GitHub
```bash
git init
git add .
git commit -m "Initial commit - CDS Mock Test Platform"
git branch -M main
git remote add origin https://github.com/yourusername/cds-mock-test.git
git push -u origin main
```

### 2.2 Deploy on Render
1. Go to https://render.com and sign up
2. Click "New +" → "Web Service"
3. Connect GitHub repository
4. Configure:
   - **Name**: cds-mock-test-api
   - **Region**: Singapore (closest to India)
   - **Branch**: main
   - **Root Directory**: (leave blank)
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: Free

### 2.3 Set Environment Variables
In Render dashboard, go to "Environment" and add:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://cds_admin:yourpassword@cluster0.xxxxx.mongodb.net/cds_mock_test
JWT_SECRET=your_super_strong_secret_key_min_32_chars
JWT_EXPIRE=30d
CLIENT_URL=https://your-frontend-url.vercel.app
```

### 2.4 Deploy
1. Click "Create Web Service"
2. Wait 2-3 minutes for deployment
3. Note your backend URL: `https://cds-mock-test-api.onrender.com`

## 🎨 Step 3: Frontend Deployment (Vercel)

### 3.1 Update API URL
Edit `client/package.json` - Remove or update proxy for production:
```json
{
  "proxy": "https://cds-mock-test-api.onrender.com"
}
```

Or create `client/src/config.js`:
```javascript
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
```

Update all fetch calls:
```javascript
import { API_URL } from './config';

fetch(`${API_URL}/api/auth/login`, ...)
```

### 3.2 Deploy on Vercel
1. Go to https://vercel.com and sign up with GitHub
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Create React App
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

### 3.3 Set Environment Variables (if using)
```env
REACT_APP_API_URL=https://cds-mock-test-api.onrender.com
```

### 3.4 Deploy
1. Click "Deploy"
2. Wait 1-2 minutes
3. Your site is live! 🎉
4. URL: `https://cds-mock-test.vercel.app`

### 3.5 Update Backend CORS
Go back to Render → Environment → Update:
```env
CLIENT_URL=https://cds-mock-test.vercel.app
```

## ✅ Step 4: Verification

### 4.1 Test Backend
```bash
curl https://cds-mock-test-api.onrender.com/api/health
```
Should return:
```json
{
  "status": "success",
  "message": "CDS Mock Test API is running"
}
```

### 4.2 Test Frontend
1. Open `https://cds-mock-test.vercel.app`
2. Register a new account
3. Take a test
4. Check results and leaderboard

### 4.3 Test Full Flow
1. Register → Should create user in MongoDB
2. Login → Should return JWT token
3. Browse tests → Should show available tests
4. Start test → Should create attempt
5. Submit test → Should calculate results
6. View leaderboard → Should show rankings

## 🌐 Alternative Deployment Options

### Backend Alternatives

#### Railway.app
1. Sign up at https://railway.app
2. Click "New Project" → "Deploy from GitHub"
3. Select repository
4. Add environment variables
5. Deploy

#### Heroku
1. Install Heroku CLI
2. `heroku create cds-mock-test-api`
3. `heroku config:set MONGODB_URI=...`
4. `git push heroku main`

### Frontend Alternatives

#### Netlify
1. Go to https://netlify.com
2. Drag and drop `client/build` folder
3. Configure build settings
4. Deploy

#### GitHub Pages
```bash
npm install gh-pages --save-dev
```
Add to `package.json`:
```json
{
  "homepage": "https://yourusername.github.io/cds-mock-test",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d build"
  }
}
```
Run: `npm run deploy`

## 🔒 Security Best Practices

### 1. Environment Variables
✅ Never commit `.env` file
✅ Use strong JWT secret (min 32 characters)
✅ Different secrets for dev/prod

### 2. Database
✅ Use MongoDB Atlas instead of self-hosted
✅ Enable IP whitelist (don't use 0.0.0.0/0 in production)
✅ Use strong database passwords
✅ Enable MongoDB encryption at rest

### 3. API
✅ Enable rate limiting (already implemented)
✅ Use HTTPS only
✅ Implement CORS properly
✅ Validate all inputs

### 4. Authentication
✅ Use bcrypt for passwords (already implemented)
✅ Use JWT with expiration
✅ Implement refresh tokens (future)
✅ Add 2FA (future)

## 📊 Monitoring

### 1. Backend Monitoring
- **Render**: Built-in logs and metrics
- **Railway**: Real-time logs
- **Custom**: Use services like Sentry, LogRocket

### 2. Database Monitoring
- MongoDB Atlas provides built-in monitoring
- View query performance
- Set up alerts

### 3. Frontend Monitoring
- Vercel Analytics (paid)
- Google Analytics (free)
- Clarity by Microsoft (free)

## 🚀 Post-Deployment

### 1. Custom Domain (Optional)
**Vercel**:
1. Go to Project Settings → Domains
2. Add your domain: `cdsmocktest.com`
3. Update DNS records as instructed

**Render**:
1. Go to Settings → Custom Domains
2. Add domain and update DNS

### 2. SSL Certificate
- Both Vercel and Render provide free SSL
- Auto-renewed
- No configuration needed

### 3. CDN
- Vercel uses Edge Network (CDN included)
- For images/videos, consider Cloudinary or AWS S3

### 4. Email Service
For future email features:
- SendGrid (free tier: 100 emails/day)
- Mailgun (free tier: 5000 emails/month)
- AWS SES (very cheap)

## 💰 Cost Estimate

### Free Tier (0-1000 users)
- MongoDB Atlas: Free (512MB)
- Render: Free (but sleeps after inactivity)
- Vercel: Free (unlimited bandwidth)
- **Total: ₹0/month**

### Paid Tier (1000+ users)
- MongoDB Atlas: $25/month (M2)
- Render: $7/month (always on)
- Vercel: Free still works
- **Total: ~₹2,500/month**

### Premium Features
- Payment Gateway: Razorpay (2% + ₹3 per transaction)
- Email Service: SendGrid (~₹750/month for 10k emails)
- CDN: Cloudinary (Free tier sufficient initially)

## 📈 Scaling Strategy

### Stage 1: 0-1000 users
- Free tiers sufficient
- Monitor usage

### Stage 2: 1000-10,000 users
- Upgrade MongoDB Atlas to M2
- Upgrade Render to paid plan
- Add CDN for assets

### Stage 3: 10,000+ users
- Consider managed MongoDB
- Use load balancer
- Implement caching (Redis)
- Move to dedicated servers

## 🎯 Launch Checklist

- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] Database seeded with initial tests
- [ ] All features tested in production
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active
- [ ] Analytics set up
- [ ] Error monitoring active
- [ ] Social media pages created
- [ ] Telegram channel ready
- [ ] First blog post written
- [ ] SEO optimized

## 🆘 Troubleshooting

### Issue: "Request failed with status code 502"
**Solution**: Render free tier sleeps after 15 min of inactivity. First request wakes it up (takes 30-60 seconds).

### Issue: CORS error
**Solution**: Update `CLIENT_URL` in backend environment variables.

### Issue: MongoDB connection timeout
**Solution**: Check IP whitelist in MongoDB Atlas. Add 0.0.0.0/0 for testing.

### Issue: Frontend shows old version
**Solution**: Clear Vercel cache: Settings → Clear Cache and Redeploy.

## 📞 Support

If you face any deployment issues:
1. Check platform-specific documentation
2. Check logs in respective dashboards
3. Open an issue on GitHub

---

**Congratulations! Your CDS Mock Test Platform is now live!** 🎉

Share it with friends and start helping defence aspirants!

🇮🇳 Jai Hind! 🎖️
