import React, { useState, useEffect } from 'react'
import UserInfoCard from '../components/UserInfoCard'
import RecipeCard from '../components/RecipeCard'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../supabaseClient'

function Dashboard() {
  const { user, changePassword, updateProfile, token } = useAuth()
  const [savedRecipes, setSavedRecipes] = useState([])
  const [myRecipes, setMyRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [changeStatus, setChangeStatus] = useState(null)
  const [editing, setEditing] = useState(false)
  const [editUsername, setEditUsername] = useState(user?.username || '')
  const [editEmail, setEditEmail] = useState(user?.email || '')
  const [editStatus, setEditStatus] = useState(null)

  // Extract user ID from JWT token
  const getUserId = () => {
    if (!token) return null
    try {
      const tokenParts = token.split('.')
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]))
        return payload.sub
      }
    } catch (error) {
      console.error('Error parsing token:', error)
    }
    return null
  }

  useEffect(() => {
    if (token) {
      fetchRecipes()
    }
  }, [token])

  // Listen for recipe save/unsave events from other pages
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'recipeSaved' || e.key === 'recipeUnsaved') {
        // Refresh saved recipes when user saves/unsaves from other pages
        if (token) {
          fetchRecipes()
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [token])

  // Refresh recipes when component mounts or when returning from other pages
  useEffect(() => {
    const handleFocus = () => {
      fetchRecipes()
    }
    
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  async function fetchRecipes() {
    if (!token) return
    
    try {
      setLoading(true)
      // Fetch user's created recipes from backend API
      const createdResponse = await fetch('http://localhost:5000/api/recipes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (createdResponse.ok) {
        const data = await createdResponse.json()
        setMyRecipes(data.recipes || [])
      } else {
        console.error('Error fetching created recipes:', createdResponse.status, createdResponse.statusText)
        setMyRecipes([])
      }

      // Fetch saved recipes from backend API
      const response = await fetch('http://localhost:5000/api/saved-recipes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setSavedRecipes(data.recipes || [])
      } else {
        console.error('Error fetching saved recipes:', response.status, response.statusText)
        setSavedRecipes([])
      }
    } catch (error) {
      console.error('Error fetching recipes:', error)
      setSavedRecipes([])
      setMyRecipes([])
    } finally {
      setLoading(false)
    }
  }

  async function handleRemoveRecipe(id) {
    try {
      const response = await fetch(`http://localhost:5000/api/saved-recipes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Update local state
        setSavedRecipes(prev => prev.filter(recipe => recipe.id !== id))
      } else {
        console.error('Error removing saved recipe:', response.status, response.statusText)
        alert('Failed to remove recipe')
      }
    } catch (error) {
      console.error('Error removing saved recipe:', error)
      alert('Failed to remove recipe')
    }
  }

  async function handleDeleteMyRecipe(id) {
    try {
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting recipe:', error)
        alert('Failed to delete recipe')
      } else {
        setMyRecipes(prev => prev.filter(recipe => recipe.id !== id))
        alert('Recipe deleted successfully')
      }
    } catch (error) {
      console.error('Error deleting recipe:', error)
      alert('Failed to delete recipe')
    }
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

  // Add logging and normalization before rendering
  const normalizedMyRecipes = myRecipes.map(recipe => ({
    ...recipe
  }));
  const normalizedSavedRecipes = savedRecipes.map(item => {
    const recipe = item.recipe_data ? item.recipe_data : item;
    return { ...recipe };
  });
  console.log('myRecipes:', normalizedMyRecipes);
  console.log('savedRecipes:', normalizedSavedRecipes);

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

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '1.1rem', color: '#666' }}>Loading your recipes...</div>
        </div>
      ) : (
        <>
          {/* My Created Recipes */}
          <div style={{ marginTop: '3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.3rem', margin: 0 }}>My Recipes</h2>
              <a 
                href="/recipes/create" 
                style={{ 
                  background: '#007bff', 
                  color: 'white', 
                  padding: '0.5rem 1rem', 
                  borderRadius: 4, 
                  textDecoration: 'none',
                  fontSize: '0.9rem'
                }}
              >
                + Create Recipe
              </a>
            </div>
            {normalizedMyRecipes.length === 0 ? (
              <div style={{ color: '#666', fontSize: '1.1rem', padding: '2rem 0' }}>
                You haven't created any recipes yet. <a href="/recipes/create" style={{ color: '#007bff', textDecoration: 'none' }}>Create your first recipe!</a>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '2rem'
              }}>
                {normalizedMyRecipes.map(recipe => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    allowDelete={true}
                    onDelete={handleDeleteMyRecipe}
                    allowEdit={true}
                    onEdit={() => window.location.href = `/recipes/edit/${recipe.id}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Saved Recipes */}
          <div style={{ marginTop: '3rem' }}>
            <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>Saved Recipes</h2>
            {normalizedSavedRecipes.length === 0 ? (
              <div style={{ color: '#666', fontSize: '1.1rem', padding: '2rem 0' }}>
                No saved recipes yet. Browse recipes and save your favorites!
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '2rem'
              }}>
                {normalizedSavedRecipes.map(recipe => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    allowDelete={false}
                    onDelete={null}
                    allowEdit={false}
                    onEdit={null}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default Dashboard 