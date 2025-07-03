import React, { useState } from 'react'
import UserInfoCard from '../components/UserInfoCard'
import RecipeCard from '../components/RecipeCard'
import { useAuth } from '../contexts/AuthContext'

function Dashboard() {
  const { user, changePassword, updateProfile } = useAuth()
  const [savedRecipes, setSavedRecipes] = useState([])
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [changeStatus, setChangeStatus] = useState(null)
  const [editing, setEditing] = useState(false)
  const [editUsername, setEditUsername] = useState(user?.username || '')
  const [editEmail, setEditEmail] = useState(user?.email || '')
  const [editStatus, setEditStatus] = useState(null)

  function handleRemoveRecipe(id) {
    setSavedRecipes(prev => prev.filter(recipe => recipe.id !== id))
  }

  async function handleChangePassword(e) {
    e.preventDefault()
    setChangeStatus(null)
    const result = await changePassword(currentPassword, newPassword)
    if (result.success) {
      setChangeStatus('Password changed successfully')
      setCurrentPassword('')
      setNewPassword('')
    } else {
      setChangeStatus(result.error || 'Failed to change password')
    }
  }

  function handleEditProfile() {
    setEditUsername(user?.username || '')
    setEditEmail(user?.email || '')
    setEditStatus(null)
    setEditing(true)
  }

  async function handleSaveProfile(e) {
    e.preventDefault()
    setEditStatus(null)
    const result = await updateProfile(editUsername, editEmail)
    if (result.success) {
      setEditStatus('Profile updated successfully')
      setEditing(false)
    } else {
      setEditStatus(result.error || 'Failed to update profile')
    }
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Dashboard</h1>
      <UserInfoCard user={user} onEditProfile={handleEditProfile} />
      {editing && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <form onSubmit={handleSaveProfile} style={{ background: 'white', padding: '2rem', borderRadius: 8, minWidth: 320, boxShadow: '0 2px 12px rgba(0,0,0,0.15)' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Edit Profile</h2>
            <div style={{ marginBottom: '1rem' }}>
              <input
                type="text"
                placeholder="Username"
                value={editUsername}
                onChange={e => setEditUsername(e.target.value)}
                style={{ width: '100%', padding: '0.5rem' }}
                required
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <input
                type="email"
                placeholder="Email"
                value={editEmail}
                onChange={e => setEditEmail(e.target.value)}
                style={{ width: '100%', padding: '0.5rem' }}
                required
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="submit" style={{ padding: '0.5rem 1.5rem' }}>Save</button>
              <button type="button" style={{ padding: '0.5rem 1.5rem' }} onClick={() => setEditing(false)}>Cancel</button>
            </div>
            {editStatus && <div style={{ marginTop: '1rem', color: editStatus.includes('success') ? 'green' : 'red' }}>{editStatus}</div>}
          </form>
        </div>
      )}
      <div style={{ margin: '2rem 0', maxWidth: 400 }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Change Password</h2>
        <form onSubmit={handleChangePassword}>
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="password"
              placeholder="Current Password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              style={{ width: '100%', padding: '0.5rem' }}
              required
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              style={{ width: '100%', padding: '0.5rem' }}
              required
            />
          </div>
          <button type="submit" style={{ padding: '0.5rem 1.5rem' }}>Change Password</button>
        </form>
        {changeStatus && <div style={{ marginTop: '1rem', color: changeStatus.includes('success') ? 'green' : 'red' }}>{changeStatus}</div>}
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