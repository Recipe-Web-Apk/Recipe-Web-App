import React, { useState } from 'react'

function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})

  function validate(values) {
    const newErrors = {}
    if (!values.username) newErrors.username = 'Username is required'
    if (!values.email) newErrors.email = 'Email is required'
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(values.email)) newErrors.email = 'Email is invalid'
    if (!values.password) newErrors.password = 'Password is required'
    if (!values.confirm) newErrors.confirm = 'Confirm your password'
    else if (values.password !== values.confirm) newErrors.confirm = 'Passwords do not match'
    return newErrors
  }

  function handleSubmit(e) {
    e.preventDefault()
    const validation = validate(form)
    setErrors(validation)
    if (Object.keys(validation).length > 0) return
    alert('Register form submitted (no authentication logic)')
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: '' })
  }

  const isValid = Object.keys(validate(form)).length === 0 && Object.values(form).every(Boolean)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <h2 style={{ marginBottom: '2rem' }}>Register</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', minWidth: 300 }}>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          style={{ padding: '0.7rem', fontSize: '1rem', border: '1px solid #ccc', borderRadius: 4 }}
        />
        {errors.username && <div style={{ color: 'red', fontSize: '0.95rem', marginTop: '-0.5rem' }}>{errors.username}</div>}
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          style={{ padding: '0.7rem', fontSize: '1rem', border: '1px solid #ccc', borderRadius: 4 }}
        />
        {errors.email && <div style={{ color: 'red', fontSize: '0.95rem', marginTop: '-0.5rem' }}>{errors.email}</div>}
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          style={{ padding: '0.7rem', fontSize: '1rem', border: '1px solid #ccc', borderRadius: 4 }}
        />
        {errors.password && <div style={{ color: 'red', fontSize: '0.95rem', marginTop: '-0.5rem' }}>{errors.password}</div>}
        <input
          type="password"
          name="confirm"
          placeholder="Confirm Password"
          value={form.confirm}
          onChange={handleChange}
          style={{ padding: '0.7rem', fontSize: '1rem', border: '1px solid #ccc', borderRadius: 4 }}
        />
        {errors.confirm && <div style={{ color: 'red', fontSize: '0.95rem', marginTop: '-0.5rem' }}>{errors.confirm}</div>}
        <button type="submit" disabled={!isValid} style={{ padding: '0.7rem', fontSize: '1rem', borderRadius: 4, background: isValid ? '#222' : '#aaa', color: '#fff', border: 'none', cursor: isValid ? 'pointer' : 'not-allowed' }}>
          Register
        </button>
      </form>
    </div>
  )
}

export default Register
