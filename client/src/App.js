import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Tests from './pages/Tests';
import TestDetail from './pages/TestDetail';
import TakeTest from './pages/TakeTest';
import Results from './pages/Results';
import ResultDetail from './pages/ResultDetail';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import AdminUpload from './pages/AdminUpload';
import AdminDashboard from './pages/AdminDashboard';
import AdminTests from './pages/AdminTests';
import ManualTestCreator from './pages/ManualTestCreator';
import { AuthContext } from './context/AuthContext';
import { getAuthToken, removeAuthToken } from './utils/auth';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = getAuthToken();
    if (token) {
      // Fetch user profile
      fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(data => {
          if (data.status === 'success') {
            setUser(data.data.user);
          } else {
            removeAuthToken();
          }
          setLoading(false);
        })
        .catch(() => {
          removeAuthToken();
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const logout = () => {
    removeAuthToken();
    setUser(null);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
            <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
            <Route path="/tests" element={user ? <Tests /> : <Navigate to="/login" />} />
            <Route path="/tests/:id" element={user ? <TestDetail /> : <Navigate to="/login" />} />
            <Route path="/test/:attemptId" element={user ? <TakeTest /> : <Navigate to="/login" />} />
            <Route path="/results" element={user ? <Results /> : <Navigate to="/login" />} />
            <Route path="/results/:id" element={user ? <ResultDetail /> : <Navigate to="/login" />} />
            <Route path="/leaderboard/:testId" element={user ? <Leaderboard /> : <Navigate to="/login" />} />
            <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
            <Route path="/admin/dashboard" element={user ? <AdminDashboard /> : <Navigate to="/login" />} />
            <Route path="/admin/upload" element={user ? <AdminUpload /> : <Navigate to="/login" />} />
            <Route path="/admin/tests" element={user ? <AdminTests /> : <Navigate to="/login" />} />
            <Route path="/admin/create" element={user ? <ManualTestCreator /> : <Navigate to="/login" />} />
          </Routes>
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
