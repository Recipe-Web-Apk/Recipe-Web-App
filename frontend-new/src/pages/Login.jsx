import React, { useState } from 'react'

function Login() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    // Placeholder: No authentication logic
    if (!form.username || !form.password) {
      setError('Both fields are required')
      return
    }
    setError('')
    alert('Login form submitted (no authentication logic)')
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <h2 style={{ marginBottom: '2rem' }}>Login</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', minWidth: 300 }}>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          style={{ padding: '0.7rem', fontSize: '1rem', border: '1px solid #ccc', borderRadius: 4 }}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          style={{ padding: '0.7rem', fontSize: '1rem', border: '1px solid #ccc', borderRadius: 4 }}
        />
        <button type="submit" style={{ padding: '0.7rem', fontSize: '1rem', borderRadius: 4, background: '#222', color: '#fff', border: 'none' }}>
          Login
        </button>
        {error && <div style={{ color: 'red', fontSize: '0.95rem', marginTop: '0.5rem' }}>{error}</div>}
      </form>
    </div>
  )
}

export default Login
