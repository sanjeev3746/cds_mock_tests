import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

function Navbar() {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="navbar">
      <div className="container nav-container">
        <Link to="/" className="logo">
          <span className="logo-icon">🎖️</span>
          <span className="logo-text">CDS Mock Test</span>
        </Link>

        <ul className="nav-links">
          {user ? (
            <>
              <li><Link to="/dashboard">Dashboard</Link></li>
              <li><Link to="/tests">Tests</Link></li>
              <li><Link to="/results">My Results</Link></li>
              {user.isAdmin && (
                <li><Link to="/admin/dashboard" className="admin-link">⚙️ Admin</Link></li>
              )}
              <li>
                <div className="user-menu">
                  <span className="user-name">{user.name}</span>
                  {user.isPremium && <span className="premium-badge">Premium</span>}
                  <div className="dropdown">
                    <Link to="/profile">Profile</Link>
                    <button onClick={logout}>Logout</button>
                  </div>
                </div>
              </li>
            </>
          ) : (
            <>
              <li><Link to="/login" className="btn btn-outline">Login</Link></li>
              <li><Link to="/register" className="btn btn-primary">Register</Link></li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
