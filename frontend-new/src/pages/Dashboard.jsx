import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import RecipeCard from '../components/RecipeCard'

function Dashboard() {
  const { token } = useAuth()
  const [profile, setProfile] = useState({ username: '', email: '' })
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [form, setForm] = useState({ username: '', email: '' })
  const [profileMsg, setProfileMsg] = useState('')
  const [pwForm, setPwForm] = useState({ password: '', confirm: '' })
  const [pwMsg, setPwMsg] = useState('')
  const [pwLoading, setPwLoading] = useState(false)
  const [savedRecipes, setSavedRecipes] = useState([
    {
      id: 1,
      title: 'Jollof Rice',
      calories: 450,
      image: '/images/jollof.jpg'
    },
    {
      id: 2,
      title: 'Chicken Stew',
      calories: 520,
      image: '/images/stew.jpg'
    }
  ])

  // Fetch profile on mount
  useEffect(() => {
    async function fetchProfile() {
      setLoading(true)
      try {
        const res = await fetch('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        if (res.ok) {
          setProfile({ username: data.user.username, email: data.user.email })
          setForm({ username: data.user.username, email: data.user.email })
        }
      } finally {
        setLoading(false)
      }
    }
    if (token) fetchProfile()
  }, [token])

  // Handle profile form
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
    setProfileMsg('')
  }
  async function handleProfileUpdate(e) {
    e.preventDefault()
    setProfileMsg('')
    const res = await fetch('http://localhost:5000/api/auth/profile', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(form)
    })
    const data = await res.json()
    if (res.ok) {
      setProfileMsg('Profile updated!')
      setProfile(form)
      setEditMode(false)
    } else {
      setProfileMsg(data.error || 'Update failed')
    }
  }

  // Handle password form
  function handlePwChange(e) {
    setPwForm({ ...pwForm, [e.target.name]: e.target.value })
    setPwMsg('')
  }
  async function handlePwUpdate(e) {
    e.preventDefault()
    setPwMsg('')
    if (pwForm.password.length < 6) {
      setPwMsg('Password must be at least 6 characters')
      return
    }
    if (pwForm.password !== pwForm.confirm) {
      setPwMsg('Passwords do not match')
      return
    }
    setPwLoading(true)
    const res = await fetch('http://localhost:5000/api/auth/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ password: pwForm.password })
    })
    const data = await res.json()
    if (res.ok) {
      setPwMsg('Password updated!')
      setPwForm({ password: '', confirm: '' })
    } else {
      setPwMsg(data.error || 'Password update failed')
    }
    setPwLoading(false)
  }

  function handleRemoveRecipe(id) {
    setSavedRecipes(prev => prev.filter(recipe => recipe.id !== id))
  }

  if (loading) return <div style={{ padding: 40 }}>Loading...</div>

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Dashboard</h1>
      <div style={{ maxWidth: 500, marginBottom: 40, background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px #0001', padding: 32 }}>
        <h2 style={{ marginBottom: 24 }}>Profile</h2>
        {!editMode ? (
          <>
            <div style={{ marginBottom: 16 }}>
              <strong>Username:</strong> {profile.username}
            </div>
            <div style={{ marginBottom: 16 }}>
              <strong>Email:</strong> {profile.email}
            </div>
            <button onClick={() => setEditMode(true)} style={{ marginBottom: 24, padding: '8px 20px', borderRadius: 6, background: '#667eea', color: '#fff', border: 'none' }}>
              Edit Profile
            </button>
          </>
        ) : (
          <form onSubmit={handleProfileUpdate} style={{ marginBottom: 24 }}>
            <div style={{ marginBottom: 12 }}>
              <label>
                Username:
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  style={{ marginLeft: 8, padding: 6, borderRadius: 4, border: '1px solid #ccc' }}
                  required
                />
              </label>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>
                Email:
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  style={{ marginLeft: 8, padding: 6, borderRadius: 4, border: '1px solid #ccc' }}
                  required
                />
              </label>
            </div>
            <button type="submit" style={{ marginRight: 12, padding: '8px 20px', borderRadius: 6, background: '#667eea', color: '#fff', border: 'none' }}>
              Save
            </button>
            <button type="button" onClick={() => setEditMode(false)} style={{ padding: '8px 20px', borderRadius: 6, background: '#eee', color: '#333', border: 'none' }}>
              Cancel
            </button>
            {profileMsg && <div style={{ marginTop: 12, color: profileMsg.includes('updated') ? 'green' : 'red' }}>{profileMsg}</div>}
          </form>
        )}

        <h3 style={{ marginTop: 32 }}>Change Password</h3>
        <form onSubmit={handlePwUpdate}>
          <div style={{ marginBottom: 12 }}>
            <input
              type="password"
              name="password"
              placeholder="New password"
              value={pwForm.password}
              onChange={handlePwChange}
              style={{ padding: 6, borderRadius: 4, border: '1px solid #ccc', width: '100%' }}
              required
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <input
              type="password"
              name="confirm"
              placeholder="Confirm new password"
              value={pwForm.confirm}
              onChange={handlePwChange}
              style={{ padding: 6, borderRadius: 4, border: '1px solid #ccc', width: '100%' }}
              required
            />
          </div>
          <button type="submit" disabled={pwLoading} style={{ padding: '8px 20px', borderRadius: 6, background: '#764ba2', color: '#fff', border: 'none' }}>
            {pwLoading ? 'Updating...' : 'Change Password'}
          </button>
          {pwMsg && <div style={{ marginTop: 12, color: pwMsg.includes('updated') ? 'green' : 'red' }}>{pwMsg}</div>}
        </form>
      </div>
      <div>
        <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>Saved Recipes</h2>
        {savedRecipes.length === 0 ? (
          <div style={{ color: '#666', fontSize: '1.1rem', padding: '2rem 0' }}>
            No saved recipes yet
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem'
          }}>
            {savedRecipes.map(recipe => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                allowDelete={true}
                onDelete={handleRemoveRecipe}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard 