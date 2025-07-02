import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function Recipes() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('pasta')

  useEffect(() => {
    fetchRecipes()
  }, [searchQuery])

  async function fetchRecipes() {
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:5000/api/spoonacular/search?query=${encodeURIComponent(searchQuery)}&offset=0`)
      const data = await response.json()
      
      if (response.ok) {
        setRecipes(data.results || [])
      } else {
        setError(data.error || 'Failed to fetch recipes')
      }
    } catch (err) {
      console.error('Error fetching recipes:', err)
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleSearch(e) {
    e.preventDefault()
    if (searchQuery.trim()) {
      fetchRecipes()
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '2rem', maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#333' }}>Explore Recipes</h1>
        <div style={{ fontSize: '1.1rem', color: '#666' }}>Loading delicious recipes...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#333' }}>Explore Recipes</h1>
        <div style={{ color: 'red', marginBottom: '1rem', fontSize: '1.1rem' }}>{error}</div>
        <button 
          onClick={fetchRecipes} 
          style={{ 
            padding: '0.7rem 1.5rem', 
            background: '#222', 
            color: '#fff', 
            border: 'none', 
            borderRadius: 4, 
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', margin: '0 0 0.5rem 0', color: '#333' }}>Explore Recipes</h1>
          <p style={{ color: '#666', fontSize: '1.1rem', margin: 0 }}>
            Discover delicious recipes from around the world
          </p>
        </div>
        {isAuthenticated && (
          <button 
            onClick={() => navigate('/recipes/create')}
            style={{ 
              padding: '0.8rem 1.8rem', 
              background: '#222', 
              color: '#fff', 
              border: 'none', 
              borderRadius: 6, 
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.background = '#444'}
            onMouseLeave={(e) => e.target.style.background = '#222'}
          >
            + Add Recipe
          </button>
        )}
      </div>
      
      {/* Search Bar */}
      <div style={{ 
        background: '#f8f9fa', 
        padding: '1.5rem', 
        borderRadius: 12, 
        marginBottom: '2rem',
        border: '1px solid #e9ecef'
      }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for recipes (e.g., pasta, chicken, dessert)..."
            style={{
              flex: 1,
              padding: '0.8rem 1rem',
              border: '1px solid #ddd',
              borderRadius: 6,
              fontSize: '1rem'
            }}
          />
          <button
            type="submit"
            style={{
              padding: '0.8rem 1.5rem',
              background: '#222',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Search
          </button>
        </form>
        <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
          💡 Try searching for: pasta, chicken, dessert, vegetarian, quick meals
        </div>
      </div>
      
      {!isAuthenticated && (
        <div style={{ 
          background: '#f8f9fa', 
          padding: '1rem', 
          borderRadius: 8, 
          marginBottom: '2rem',
          border: '1px solid #e9ecef'
        }}>
          <p style={{ margin: 0, color: '#666' }}>
            💡 <strong>Tip:</strong> Log in to create and save your own recipes!
          </p>
        </div>
      )}
      
      {recipes.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '3rem', 
          color: '#666',
          background: '#f8f9fa',
          borderRadius: 12
        }}>
          <h3 style={{ marginBottom: '1rem', color: '#333' }}>No recipes found</h3>
          <p style={{ marginBottom: '1.5rem' }}>
            Try a different search term or browse our categories
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {['pasta', 'chicken', 'dessert', 'vegetarian'].map(term => (
              <button
                key={term}
                onClick={() => setSearchQuery(term)}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#fff',
                  border: '1px solid #ddd',
                  borderRadius: 20,
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
          {recipes.map(recipe => (
            <div 
              key={recipe.id} 
              onClick={() => navigate(`/recipes/${recipe.id}`)}
              style={{ 
                border: '1px solid #eee', 
                borderRadius: 12, 
                overflow: 'hidden', 
                boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                background: 'white'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)'
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)'
              }}
            >
              <img 
                src={recipe.image || 'https://via.placeholder.com/300x200/CCCCCC/666666?text=No+Image'} 
                alt={recipe.title} 
                style={{ width: '100%', height: 220, objectFit: 'cover' }} 
              />
              <div style={{ padding: '1.5rem' }}>
                <h3 style={{ 
                  margin: '0 0 0.8rem 0', 
                  fontSize: '1.3rem', 
                  color: '#333',
                  fontWeight: '600'
                }}>
                  {recipe.title}
                </h3>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  color: '#666', 
                  fontSize: '0.9rem',
                  paddingTop: '0.5rem',
                  borderTop: '1px solid #f0f0f0'
                }}>
                  <span style={{ fontWeight: '500' }}>
                    ⏱️ {recipe.readyInMinutes || 'N/A'} min
                  </span>
                  <span style={{ 
                    background: '#f8f9fa', 
                    padding: '0.3rem 0.8rem', 
                    borderRadius: 12,
                    fontSize: '0.8rem'
                  }}>
                    👥 {recipe.servings || 'N/A'} servings
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Recipes 