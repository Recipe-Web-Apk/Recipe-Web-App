import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useDarkMode } from '../contexts/DarkModeContext'
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser, FiChevronRight } from 'react-icons/fi'
import './Login.css'

function Register() {
  const { register } = useAuth()
  const { isDarkMode } = useDarkMode()
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  function validate(values) {
    const newErrors = {}
    if (!values.username) newErrors.username = 'Username is required'
    if (!values.email) newErrors.email = 'Email is required'
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(values.email)) newErrors.email = 'Email is invalid'
    if (!values.password) newErrors.password = 'Password is required'
    else if (values.password.length < 6) newErrors.password = 'Password must be at least 6 characters'
    if (!values.confirm) newErrors.confirm = 'Confirm your password'
    else if (values.password !== values.confirm) newErrors.confirm = 'Passwords do not match'
    return newErrors
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const validation = validate(form)
    setErrors(validation)
    
    if (Object.keys(validation).length > 0) return

    setLoading(true)
    setSuccess('')

    const result = await register(form.email, form.password, form.username)
    
    if (result.success) {
      setSuccess(result.message)
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } else {
      setErrors({ general: result.error })
    }
    
    setLoading(false)
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: '' })
    if (success) setSuccess('')
  }

  const isValid = Object.keys(validate(form)).length === 0 && Object.values(form).every(Boolean)

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
          <h2 className="login-title">Join Our Community</h2>
          <p className="login-subtitle">Create your account to start cooking</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              <FiUser className="form-icon" />
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              placeholder="Choose a username"
              value={form.username}
              onChange={handleChange}
              className="form-input"
              required
            />
            {errors.username && <div className="form-error">{errors.username}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              <FiMail className="form-icon" />
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              className="form-input"
              required
            />
            {errors.email && <div className="form-error">{errors.email}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              <FiLock className="form-icon" />
              Password
            </label>
            <div className="password-input-container">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                placeholder="Create a password"
                value={form.password}
                onChange={handleChange}
                className="form-input password-input"
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
            {errors.password && <div className="form-error">{errors.password}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="confirm" className="form-label">
              <FiLock className="form-icon" />
              Confirm Password
            </label>
            <div className="password-input-container">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirm"
                name="confirm"
                placeholder="Confirm your password"
                value={form.confirm}
                onChange={handleChange}
                className="form-input password-input"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {errors.confirm && <div className="form-error">{errors.confirm}</div>}
          </div>
          
          {errors.general && (
            <div className="form-error">
              <span className="error-icon">⚠️</span>
              {errors.general}
            </div>
          )}
          
          {success && (
            <div className="form-success">
              <span className="success-icon">✅</span>
              {success}
            </div>
          )}
          
          <button 
            type="submit" 
            className={`login-btn ${loading ? 'loading' : ''}`}
            disabled={!isValid || loading}
          >
            {loading ? (
              <>
                <div className="loading-spinner"></div>
                Creating Account...
              </>
            ) : (
              <>
                Create Account
                <FiChevronRight className="btn-icon" />
              </>
            )}
          </button>
        </form>
        
        <div className="login-footer">
          <p className="login-footer-text">
            Already have an account?{' '}
            <Link to="/login" className="login-link">
              Sign in here
            </Link>
          </p>
        </div>

        <div className="login-features">
          <div className="feature-item">
            <span className="feature-icon">🎯</span>
            <span className="feature-text">Personalized recommendations</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">📝</span>
            <span className="feature-text">Create your own recipes</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🔔</span>
            <span className="feature-text">Get cooking notifications</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
