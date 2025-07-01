import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Login.css'

function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const { register } = useAuth()
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
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">Join our recipe community</p>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username" className="form-label">Username</label>
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
            {errors.username && <div className="auth-error">{errors.username}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
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
            {errors.email && <div className="auth-error">{errors.email}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Create a password"
              value={form.password}
              onChange={handleChange}
              className="form-input"
              required
            />
            {errors.password && <div className="auth-error">{errors.password}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="confirm" className="form-label">Confirm Password</label>
            <input
              type="password"
              id="confirm"
              name="confirm"
              placeholder="Confirm your password"
              value={form.confirm}
              onChange={handleChange}
              className="form-input"
              required
            />
            {errors.confirm && <div className="auth-error">{errors.confirm}</div>}
          </div>
          
          <button 
            type="submit" 
            className="auth-button"
            disabled={!isValid || loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
          
          {errors.general && (
            <div className="auth-error">
              {errors.general}
            </div>
          )}
          
          {success && (
            <div className="auth-success">
              {success}
            </div>
          )}
        </form>
        
        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
