import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useDarkMode } from '../contexts/DarkModeContext';
import DarkModeToggle from './DarkModeToggle';
import './Navbar.css';

function Navbar() {
  const { user, logout } = useAuth();
  const { isDarkMode } = useDarkMode();
  const navigate = useNavigate();

  return (
    <nav className={`navbar ${isDarkMode ? 'dark-mode' : ''}`}>
      <div className="navbar-left">
        <Link to="/" className="navbar-logo">
          <span role="img" aria-label="logo">🍲</span> Recipe Buddy
        </Link>
        <Link to="/recipes" className="navbar-link">Recipes</Link>
        {user && <Link to="/dashboard" className="navbar-link">Dashboard</Link>}
      </div>
      <div className="navbar-right">
        <DarkModeToggle />
        {!user && (
          <>
            <button className="navbar-btn" onClick={() => navigate('/login')}>Login</button>
            <button className="navbar-btn primary" onClick={() => navigate('/register')}>Sign Up</button>
          </>
        )}
        {user && (
          <div className="navbar-user-menu">
            <span className="navbar-user">👤 {user.email}</span>
            <button className="navbar-btn" onClick={logout}>Logout</button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar; 