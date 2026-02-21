// API Configuration
// In production, REACT_APP_API_URL will be set by Vercel
// In development, it falls back to localhost
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default API_URL;
