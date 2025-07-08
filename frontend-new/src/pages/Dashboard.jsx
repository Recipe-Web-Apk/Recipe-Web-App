import React, { useState, useEffect } from 'react'
import UserInfoCard from '../components/UserInfoCard'
import RecipeCard from '../components/RecipeCard'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../supabaseClient'
import './Dashboard.css'

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
    fetchRecipes()
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
      const userId = getUserId()
      
      // Fetch user's created recipes
      const { data: createdRecipes, error: createdError } = await supabase
        .from('recipes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (createdError) {
        console.error('Error fetching created recipes:', createdError)
      } else {
        setMyRecipes(createdRecipes || [])
      }

      // Fetch saved recipes (from localStorage for now)
      const savedRecipeIds = JSON.parse(localStorage.getItem('savedRecipes') || '[]')
      if (savedRecipeIds.length > 0) {
        // For saved recipes, we'll fetch from Spoonacular API
        const savedRecipesData = []
        for (const recipeId of savedRecipeIds) {
          try {
            const response = await fetch(`http://localhost:5000/api/spoonacular/recipe/${recipeId}`)
            if (response.ok) {
              const recipe = await response.json()
              savedRecipesData.push(recipe)
            }
          } catch (error) {
            console.error(`Error fetching saved recipe ${recipeId}:`, error)
          }
        }
        setSavedRecipes(savedRecipesData)
      }
    } catch (error) {
      console.error('Error fetching recipes:', error)
    } finally {
      setLoading(false)
    }
  }

  function handleRemoveRecipe(id) {
    setSavedRecipes(prev => prev.filter(recipe => recipe.id !== id))
    // Also remove from localStorage
    const savedRecipes = JSON.parse(localStorage.getItem('savedRecipes') || '[]')
    const updatedRecipes = savedRecipes.filter(recipeId => recipeId !== id)
    localStorage.setItem('savedRecipes', JSON.stringify(updatedRecipes))
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

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Dashboard</h1>
      <UserInfoCard user={user} onEditProfile={handleEditProfile} />
      {editing && (
        <div className="dashboard-modal">
          <form onSubmit={handleSaveProfile} className="dashboard-modal-form">
            <h2 className="dashboard-form-title">Edit Profile</h2>
            <div className="dashboard-form-group">
              <input
                type="text"
                placeholder="Username"
                value={editUsername}
                onChange={e => setEditUsername(e.target.value)}
                className="dashboard-input"
                required
              />
            </div>
            <div className="dashboard-form-group">
              <input
                type="email"
                placeholder="Email"
                value={editEmail}
                onChange={e => setEditEmail(e.target.value)}
                className="dashboard-input"
                required
              />
            </div>
            <div className="dashboard-btn-group">
              <button type="submit" className="dashboard-btn">Save</button>
              <button type="button" className="dashboard-btn" onClick={() => setEditing(false)}>Cancel</button>
            </div>
            {editStatus && <div className={`dashboard-status${editStatus.includes('success') ? '' : ' error'}`}>{editStatus}</div>}
          </form>
        </div>
      )}
      <div className="dashboard-section" style={{ maxWidth: 400 }}>
        <h2 className="dashboard-form-title">Change Password</h2>
        <form onSubmit={handleChangePassword}>
          <div className="dashboard-form-group">
            <input
              type="password"
              placeholder="Current Password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              className="dashboard-input"
              required
            />
          </div>
          <div className="dashboard-form-group">
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="dashboard-input"
              required
            />
          </div>
          <button type="submit" className="dashboard-btn">Change Password</button>
        </form>
        {changeStatus && <div className={`dashboard-status${changeStatus.includes('success') ? '' : ' error'}`}>{changeStatus}</div>}
      </div>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '1.1rem', color: '#666' }}>Loading your recipes...</div>
        </div>
      ) : (
        <>
          {/* My Created Recipes */}
          <div className="dashboard-section">
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
            {myRecipes.length === 0 ? (
              <div style={{ color: '#666', fontSize: '1.1rem', padding: '2rem 0' }}>
                You haven't created any recipes yet. <a href="/recipes/create" style={{ color: '#007bff', textDecoration: 'none' }}>Create your first recipe!</a>
              </div>
            ) : (
              <div className="dashboard-recipe-grid">
                {myRecipes.map(recipe => (
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
          <div className="dashboard-section">
            <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>Saved Recipes</h2>
            {savedRecipes.length === 0 ? (
              <div style={{ color: '#666', fontSize: '1.1rem', padding: '2rem 0' }}>
                No saved recipes yet. Browse recipes and save your favorites!
              </div>
            ) : (
              <div className="dashboard-recipe-grid">
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
        </>
      )}
    </div>
  )
}

export default Dashboard 