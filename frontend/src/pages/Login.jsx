import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useDarkMode } from '../contexts/DarkModeContext';
import { FiMail, FiLock, FiEye, FiEyeOff, FiChevronRight } from 'react-icons/fi';
import './Login.css';

function Login() {
  const { login } = useAuth();
  const { isDarkMode } = useDarkMode();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Login failed.');
      }
    } catch (err) {
      setError('An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`login-page ${isDarkMode ? 'dark-mode' : ''}`}>
      <div className="login-background">
        <div className="login-background-overlay"></div>
        <div className="login-background-pattern"></div>
      </div>
      
      <div className="login-container">
        <div className="login-header">
          <div className="login-logo">
            <span className="login-logo-icon">🍳</span>
            <h1 className="login-logo-text">RecipeHub</h1>
          </div>
          <h2 className="login-title">Welcome Back</h2>
          <p className="login-subtitle">Sign in to your account to continue cooking</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit} autoComplete="off">
          <div className="form-group">
            <label htmlFor="login-email" className="form-label">
              <FiMail className="form-icon" />
              Email Address
            </label>
            <input
              id="login-email"
              className="form-input"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email"
              autoComplete="username"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password" className="form-label">
              <FiLock className="form-icon" />
              Password
            </label>
            <div className="password-input-container">
              <input
                id="login-password"
                className="form-input password-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          {error && (
            <div className="form-error">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <button 
            className={`login-btn ${loading ? 'loading' : ''}`} 
            type="submit" 
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="loading-spinner"></div>
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <FiChevronRight className="btn-icon" />
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          <p className="login-footer-text">
            Don't have an account?{' '}
            <Link to="/register" className="login-link">
              Create one here
            </Link>
          </p>
        </div>

        <div className="login-features">
          <div className="feature-item">
            <span className="feature-icon">📚</span>
            <span className="feature-text">Access thousands of recipes</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">💾</span>
            <span className="feature-text">Save your favorites</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">👥</span>
            <span className="feature-text">Join our community</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
