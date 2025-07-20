import React, { useState, useEffect, useCallback } from 'react'
import UserInfoCard from '../components/UserInfoCard'
import RecipeCard from '../components/RecipeCard'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../supabaseClient'
import axiosInstance from '../api/axiosInstance';
import { useDarkMode } from '../contexts/DarkModeContext';
import { FiPlus, FiBookmark, FiEdit3, FiClock, FiUsers, FiEye, FiHeart } from 'react-icons/fi';

function Dashboard() {
  const { user, changePassword, updateProfile, token } = useAuth()
  const { isDarkMode } = useDarkMode()
  const [savedRecipes, setSavedRecipes] = useState([])
  const [myRecipes, setMyRecipes] = useState([])
  const [likedRecipes, setLikedRecipes] = useState([])
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

  const fetchRecipes = useCallback(async () => {
    if (!token) {
      console.log('Dashboard: No token available, skipping fetch');
      return;
    }
    
    try {
      setLoading(true);
      console.log('Dashboard: Starting to fetch recipes...');
      console.log('Dashboard: Token exists:', !!token);
      console.log('Dashboard: Token preview:', token.substring(0, 20) + '...');
      
      const createdResponse = await axiosInstance.get('/recipes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Dashboard: Created recipes response:', createdResponse.data);
      if (createdResponse.data.success) {
        setMyRecipes(createdResponse.data.recipes || []);
        console.log('Dashboard: Set myRecipes to:', createdResponse.data.recipes);
      } else {
        console.error('Dashboard: Error in created recipes response:', createdResponse.data.error);
        setMyRecipes([]);
      }

      const response = await axiosInstance.get('/saved-recipes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Dashboard: Saved recipes response:', response.data);

      if (response.data.success) {
        console.log('Dashboard: Setting saved recipes:', response.data.recipes);
        setSavedRecipes(response.data.recipes || []);
        console.log("Dashboard: Final saved recipes count:", response.data.recipes?.length || 0);
      } else {
        console.error('Dashboard: Error in saved recipes response:', response.data.error);
        setSavedRecipes([]);
      }

      const likedResponse = await axiosInstance.get('/likes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Dashboard: Liked recipes response:', likedResponse.data);

      if (likedResponse.data.success) {
        console.log('Dashboard: Setting liked recipes:', likedResponse.data.likes);
        setLikedRecipes(likedResponse.data.likes || []);
      } else {
        console.error('Dashboard: Error in liked recipes response:', likedResponse.data.error);
        setLikedRecipes([]);
      }
    } catch (error) {
      console.error('Dashboard: Error fetching recipes:', error);
      console.error('Dashboard: Error response:', error.response?.data);
      console.error('Dashboard: Error status:', error.response?.status);
      setSavedRecipes([]);
      setMyRecipes([]);
      setLikedRecipes([]);
    } finally {
      setLoading(false);
      console.log('Dashboard: Finished fetching recipes');
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchRecipes()
    }
  }, [token, fetchRecipes])

  // Listen for recipe save/unsave events from other pages
  useEffect(() => {
    console.log('Dashboard: Setting up event listeners for recipe save/unsave');
    
    const handleRecipeSaved = (e) => {
      console.log('Dashboard: Recipe saved event received', e.detail);
      console.log('Dashboard: Current token exists?', !!token);
      // Refresh saved recipes when user saves from other pages
      if (token) {
        console.log('Dashboard: Calling fetchRecipes after save event');
        fetchRecipes()
      }
    }

    const handleRecipeUnsaved = (e) => {
      console.log('Dashboard: Recipe unsaved event received', e.detail);
      console.log('Dashboard: Current token exists?', !!token);
      // Refresh saved recipes when user unsaves from other pages
      if (token) {
        console.log('Dashboard: Calling fetchRecipes after unsave event');
        fetchRecipes()
      }
    }

    window.addEventListener('recipeSaved', handleRecipeSaved)
    window.addEventListener('recipeUnsaved', handleRecipeUnsaved)
    
    return () => {
      console.log('Dashboard: Cleaning up event listeners');
      window.removeEventListener('recipeSaved', handleRecipeSaved)
      window.removeEventListener('recipeUnsaved', handleRecipeUnsaved)
    }
  }, [token, fetchRecipes])

  // Refresh recipes when component mounts or when returning from other pages
  useEffect(() => {
    const handleFocus = () => {
      fetchRecipes()
    }
    
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [fetchRecipes])

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
  const normalizedSavedRecipes = savedRecipes.map(recipe => {
    return { ...recipe };
  });
  console.log('Dashboard: Current user:', user);
  console.log('Dashboard: Current user ID:', user?.id);
  console.log('Dashboard: Token exists:', !!token);
  console.log('Dashboard: myRecipes raw:', myRecipes);
  console.log('Dashboard: savedRecipes raw:', savedRecipes);
  console.log('Dashboard: normalizedMyRecipes:', normalizedMyRecipes);
  console.log('Dashboard: normalizedSavedRecipes:', normalizedSavedRecipes);
  console.log('Dashboard: myRecipes length:', normalizedMyRecipes.length);
  console.log('Dashboard: savedRecipes length:', normalizedSavedRecipes.length);
  console.log('Dashboard: likedRecipes:', likedRecipes);
  if (likedRecipes.length > 0) {
    console.log('Dashboard: first liked recipe:', likedRecipes[0]);
  }

  const dashboardStyles = {
    container: {
      maxWidth: 1200,
      margin: '0 auto',
      padding: '2rem',
      minHeight: '100vh',
      backgroundColor: isDarkMode ? '#1a1a1a' : '#f8f9fa',
      color: isDarkMode ? '#ffffff' : '#333333'
    },
    header: {
      marginBottom: '3rem',
      textAlign: 'center'
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      marginBottom: '0.5rem',
      background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text'
    },
    subtitle: {
      fontSize: '1.1rem',
      color: isDarkMode ? '#b0b0b0' : '#666666',
      marginBottom: '2rem'
    },
    statsContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1.5rem',
      marginBottom: '3rem'
    },
    statCard: {
      background: isDarkMode ? '#2d2d2d' : '#ffffff',
      padding: '1.5rem',
      borderRadius: '12px',
      boxShadow: isDarkMode ? '0 4px 6px rgba(0, 0, 0, 0.3)' : '0 2px 10px rgba(0, 0, 0, 0.1)',
      textAlign: 'center',
      border: isDarkMode ? '1px solid #404040' : '1px solid #e9ecef',
      transition: 'all 0.2s ease-in-out'
    },
    statNumber: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#f97316',
      marginBottom: '0.5rem'
    },
    statLabel: {
      fontSize: '0.9rem',
      color: isDarkMode ? '#b0b0b0' : '#666666',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    section: {
      marginBottom: '3rem'
    },
    sectionHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1.5rem',
      paddingBottom: '1rem',
      borderBottom: isDarkMode ? '2px solid #404040' : '2px solid #e9ecef'
    },
    sectionTitle: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      color: isDarkMode ? '#ffffff' : '#333333'
    },
    createButton: {
      background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
      color: 'white',
      padding: '12px 24px',
      borderRadius: '12px',
      textDecoration: 'none',
      fontSize: '14px',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.2s ease-in-out',
      border: 'none',
      cursor: 'pointer',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)'
    },
    emptyState: {
      textAlign: 'center',
      padding: '3rem 1rem',
      color: isDarkMode ? '#b0b0b0' : '#666666'
    },
    emptyStateIcon: {
      fontSize: '3rem',
      marginBottom: '1rem',
      opacity: 0.5
    },
    emptyStateText: {
      fontSize: '1.1rem',
      marginBottom: '1rem'
    },
    emptyStateLink: {
      color: '#f97316',
      textDecoration: 'none',
      fontWeight: '600',
      padding: '12px 24px',
      borderRadius: '12px',
      background: isDarkMode ? '#374151' : '#f3f4f6',
      display: 'inline-block',
      transition: 'all 0.2s ease-in-out'
    },
    recipesGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '2rem'
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    modalContent: {
      background: isDarkMode ? '#2d2d2d' : '#ffffff',
      padding: '2rem',
      borderRadius: '12px',
      minWidth: 400,
      maxWidth: '90vw',
      boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
    },
    modalTitle: {
      fontSize: '1.3rem',
      marginBottom: '1.5rem',
      fontWeight: 'bold'
    },
    input: {
      width: '100%',
      padding: '12px',
      marginBottom: '1rem',
      borderRadius: '8px',
      border: isDarkMode ? '1px solid #404040' : '1px solid #ddd',
      background: isDarkMode ? '#1a1a1a' : '#ffffff',
      color: isDarkMode ? '#ffffff' : '#333333'
    },
    buttonGroup: {
      display: 'flex',
      gap: '1rem',
      justifyContent: 'flex-end'
    },
    button: {
      padding: '12px 24px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontWeight: '600',
      transition: 'all 0.2s ease-in-out'
    },
    primaryButton: {
      background: '#f97316',
      color: 'white'
    },
    secondaryButton: {
      background: isDarkMode ? '#404040' : '#f8f9fa',
      color: isDarkMode ? '#ffffff' : '#333333'
    },
    statusMessage: {
      marginTop: '1rem',
      padding: '12px',
      borderRadius: '8px',
      fontSize: '0.9rem'
    },
    successStatus: {
      background: '#d4edda',
      color: '#155724',
      border: '1px solid #c3e6cb'
    },
    errorStatus: {
      background: '#f8d7da',
      color: '#721c24',
      border: '1px solid #f5c6cb'
    }
  };

  return (
    <div style={dashboardStyles.container}>
      {/* Header */}
      <div style={dashboardStyles.header}>
        <h1 style={dashboardStyles.title}>Welcome back, {user?.username || 'Chef'}! 👨‍🍳</h1>
        <p style={dashboardStyles.subtitle}>Manage your recipes and discover new favorites</p>
      </div>

      {/* User Info Card */}
      <UserInfoCard user={user} onEditProfile={handleEditProfile} />

      {/* Stats Overview */}
      <div style={dashboardStyles.statsContainer}>
        <div style={dashboardStyles.statCard}>
          <div style={dashboardStyles.statNumber}>{normalizedMyRecipes.length}</div>
          <div style={dashboardStyles.statLabel}>My Recipes</div>
        </div>
        <div style={dashboardStyles.statCard}>
          <div style={dashboardStyles.statNumber}>{normalizedSavedRecipes.length}</div>
          <div style={dashboardStyles.statLabel}>Saved Recipes</div>
        </div>
        <div style={dashboardStyles.statCard}>
          <div style={dashboardStyles.statNumber}>
            {normalizedMyRecipes.reduce((total, recipe) => total + (recipe.cookTime || 0), 0)}
          </div>
          <div style={dashboardStyles.statLabel}>Total Cook Time (min)</div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {editing && (
        <div style={dashboardStyles.modal}>
          <form onSubmit={handleSaveProfile} style={dashboardStyles.modalContent}>
            <h2 style={dashboardStyles.modalTitle}>Edit Profile</h2>
            <input
              type="text"
              placeholder="Username"
              value={editUsername}
              onChange={e => setEditUsername(e.target.value)}
              style={dashboardStyles.input}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={editEmail}
              onChange={e => setEditEmail(e.target.value)}
              style={dashboardStyles.input}
              required
            />
            <div style={dashboardStyles.buttonGroup}>
              <button 
                type="button" 
                onClick={() => setEditing(false)} 
                style={{...dashboardStyles.button, ...dashboardStyles.secondaryButton}}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                style={{...dashboardStyles.button, ...dashboardStyles.primaryButton}}
              >
                Save Changes
              </button>
            </div>
            {editStatus && (
              <div style={{
                ...dashboardStyles.statusMessage,
                ...(editStatus.includes('success') ? dashboardStyles.successStatus : dashboardStyles.errorStatus)
              }}>
                {editStatus}
              </div>
            )}
          </form>
        </div>
      )}

      {loading ? (
        <div style={dashboardStyles.emptyState}>
          <div style={dashboardStyles.emptyStateIcon}>⏳</div>
          <div style={dashboardStyles.emptyStateText}>Loading your recipes...</div>
        </div>
      ) : (
        <>
          {/* My Created Recipes Section */}
          <div style={dashboardStyles.section}>
            <div style={dashboardStyles.sectionHeader}>
              <h2 style={dashboardStyles.sectionTitle}>
                <FiEdit3 /> My Recipes
              </h2>
              <a 
                href="/recipes/create" 
                style={dashboardStyles.createButton}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.05)';
                  e.target.style.boxShadow = '0 6px 16px rgba(249, 115, 22, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = '0 4px 12px rgba(249, 115, 22, 0.3)';
                }}
              >
                <FiPlus /> Create Recipe
              </a>
            </div>
            
            {normalizedMyRecipes.length === 0 ? (
              <div style={dashboardStyles.emptyState}>
                <div style={dashboardStyles.emptyStateIcon}>🍳</div>
                <div style={dashboardStyles.emptyStateText}>
                  You haven't created any recipes yet.
                </div>
                <a href="/recipes/create" style={dashboardStyles.emptyStateLink}>
                  Create your first recipe! →
                </a>
              </div>
            ) : (
              <div style={dashboardStyles.recipesGrid}>
                {normalizedMyRecipes.map(recipe => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    allowEdit={true}
                    onEdit={() => window.location.href = `/recipes/edit/${recipe.id}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Saved Recipes Section */}
          <div style={dashboardStyles.section}>
            <div style={dashboardStyles.sectionHeader}>
              <h2 style={dashboardStyles.sectionTitle}>
                <FiBookmark /> Saved Recipes
              </h2>
            </div>
            
            {normalizedSavedRecipes.length === 0 ? (
              <div style={dashboardStyles.emptyState}>
                <div style={dashboardStyles.emptyStateIcon}>❤️</div>
                <div style={dashboardStyles.emptyStateText}>
                  No saved recipes yet.
                </div>
                <a href="/recipes" style={dashboardStyles.emptyStateLink}>
                  Browse recipes and save your favorites! →
                </a>
              </div>
            ) : (
              <div style={dashboardStyles.recipesGrid}>
                {normalizedSavedRecipes.map(recipe => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    allowEdit={false}
                    onEdit={null}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Liked Recipes Section */}
          <div style={dashboardStyles.section}>
            <div style={dashboardStyles.sectionHeader}>
              <h2 style={dashboardStyles.sectionTitle}>
                <FiHeart /> Liked Recipes
              </h2>
            </div>
            
            {likedRecipes.length === 0 ? (
              <div style={dashboardStyles.emptyState}>
                <div style={dashboardStyles.emptyStateIcon}>💖</div>
                <div style={dashboardStyles.emptyStateText}>
                  No liked recipes yet.
                </div>
                <a href="/recipes" style={dashboardStyles.emptyStateLink}>
                  Browse recipes and like your favorites! →
                </a>
              </div>
            ) : (
              <div style={dashboardStyles.recipesGrid}>
                {likedRecipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
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