import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar({ user, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
      document.body.classList.add('dark');
      setDark(true);
    }
  }, []);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.body.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  const handleHamburger = () => setMenuOpen((open) => !open);
  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo" onClick={closeMenu}>
        RecipeApp
      </Link>
      <button className="navbar-hamburger" onClick={handleHamburger} aria-label="Toggle navigation">
        <span aria-hidden="true">☰</span>
      </button>
      <div className={`navbar-links${menuOpen ? ' open' : ''}`}>
        <Link to="/" className="navbar-link" onClick={closeMenu}>
          Home
        </Link>
        <Link to="/recipes" className="navbar-link" onClick={closeMenu}>
          Recipes
        </Link>
        <Link to="/explore" className="navbar-link" onClick={closeMenu}>
          Explore
        </Link>
        {user && (
          <Link to="/dashboard" className="navbar-link" onClick={closeMenu}>
            Dashboard
          </Link>
        )}
      </div>
      <div className="navbar-actions">
        <button className="navbar-btn" onClick={toggleDark} aria-label="Toggle dark mode">
          {dark ? 'Light' : 'Dark'}
        </button>
        {user ? (
          <>
            <span className="navbar-link" style={{ cursor: 'default', opacity: 0.8 }}>{user.email}</span>
            <button className="navbar-btn" onClick={onLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="navbar-btn">Login</Link>
            <Link to="/register" className="navbar-btn">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar; 