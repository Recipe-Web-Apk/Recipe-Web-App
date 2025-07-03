import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function Recipes() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('pasta')
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [totalResults, setTotalResults] = useState(0)
  
  // Filter and sort states
  const [filters, setFilters] = useState({
    cuisine: '',
    diet: '',
    intolerances: '',
    maxReadyTime: '',
    minProtein: '',
    maxCalories: ''
  })
  const [sortBy, setSortBy] = useState('relevance')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    // Reset pagination when search query or filters change
    setOffset(0)
    setRecipes([])
    setHasMore(true)
    fetchRecipes(true)
  }, [searchQuery, filters, sortBy])

  async function fetchRecipes(reset = false) {
    try {
      if (reset) {
        setLoading(true)
        setOffset(0)
      } else {
        setLoadingMore(true)
      }
      
      const currentOffset = reset ? 0 : offset
      
      // Build query parameters
      const params = new URLSearchParams({
        query: searchQuery,
        offset: currentOffset.toString(),
        sort: sortBy,
        ...filters
      })
      
      const response = await fetch(`http://localhost:5000/api/spoonacular/search?${params}`)
      const data = await response.json()
      
      if (response.ok) {
        const newRecipes = data.results || []
        setTotalResults(data.totalResults || 0)
        
        if (reset) {
          setRecipes(newRecipes)
        } else {
          // Prevent duplicates by checking IDs
          const existingIds = new Set(recipes.map(recipe => recipe.id))
          const uniqueNewRecipes = newRecipes.filter(recipe => !existingIds.has(recipe.id))
          setRecipes(prev => [...prev, ...uniqueNewRecipes])
        }
        
        // Check if there are more results
        const nextOffset = currentOffset + newRecipes.length
        setHasMore(nextOffset < (data.totalResults || 0))
        setOffset(nextOffset)
      } else {
        setError(data.error || 'Failed to fetch recipes')
      }
    } catch (err) {
      console.error('Error fetching recipes:', err)
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  function handleSearch(e) {
    e.preventDefault()
    if (searchQuery.trim()) {
      setSearchQuery(searchQuery.trim())
    }
  }

  function handleLoadMore() {
    if (!loadingMore && hasMore) {
      fetchRecipes(false)
    }
  }

  function handleImageError(e) {
    e.target.src = 'https://via.placeholder.com/300x200/CCCCCC/666666?text=No+Image'
  }

  function getDifficultyColor(readyInMinutes) {
    if (!readyInMinutes) return '#666'
    if (readyInMinutes <= 30) return '#28a745'
    if (readyInMinutes <= 60) return '#ffc107'
    return '#dc3545'
  }

  function getDifficultyText(readyInMinutes) {
    if (!readyInMinutes) return 'Unknown'
    if (readyInMinutes <= 30) return 'Easy'
    if (readyInMinutes <= 60) return 'Medium'
    return 'Hard'
  }

  function clearFilters() {
    setFilters({
      cuisine: '',
      diet: '',
      intolerances: '',
      maxReadyTime: '',
      minProtein: '',
      maxCalories: ''
    })
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
          onClick={() => fetchRecipes(true)} 
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
            {totalResults > 0 ? `Found ${totalResults} delicious recipes` : 'Discover recipes from around the world'}
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

      {/* Filter and Sort Controls */}
      <div style={{ 
        background: '#fff', 
        padding: '1.5rem', 
        borderRadius: 12, 
        marginBottom: '2rem',
        border: '1px solid #e9ecef',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#333' }}>Filters & Sort</h3>
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              padding: '0.5rem 1rem',
              background: '#f8f9fa',
              border: '1px solid #ddd',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        {showFilters && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            {/* Sort By */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  fontSize: '0.9rem'
                }}
              >
                <option value="relevance">Relevance</option>
                <option value="time">Quickest First</option>
                <option value="calories">Lowest Calories</option>
                <option value="popularity">Most Popular</option>
              </select>
            </div>

            {/* Cuisine */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>Cuisine</label>
              <select
                value={filters.cuisine}
                onChange={(e) => setFilters(prev => ({ ...prev, cuisine: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  fontSize: '0.9rem'
                }}
              >
                <option value="">All Cuisines</option>
                <option value="italian">Italian</option>
                <option value="mexican">Mexican</option>
                <option value="asian">Asian</option>
                <option value="american">American</option>
                <option value="mediterranean">Mediterranean</option>
                <option value="indian">Indian</option>
              </select>
            </div>

            {/* Diet */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>Diet</label>
              <select
                value={filters.diet}
                onChange={(e) => setFilters(prev => ({ ...prev, diet: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  fontSize: '0.9rem'
                }}
              >
                <option value="">All Diets</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="vegan">Vegan</option>
                <option value="gluten-free">Gluten Free</option>
                <option value="ketogenic">Keto</option>
                <option value="paleo">Paleo</option>
              </select>
            </div>

            {/* Max Ready Time */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>Max Time (min)</label>
              <select
                value={filters.maxReadyTime}
                onChange={(e) => setFilters(prev => ({ ...prev, maxReadyTime: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  fontSize: '0.9rem'
                }}
              >
                <option value="">Any Time</option>
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">1 hour</option>
              </select>
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {(filters.cuisine || filters.diet || filters.maxReadyTime) && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', color: '#666' }}>Active filters:</span>
            {filters.cuisine && (
              <span style={{ 
                background: '#e3f2fd', 
                color: '#1976d2', 
                padding: '0.3rem 0.8rem', 
                borderRadius: 12, 
                fontSize: '0.8rem' 
              }}>
                {filters.cuisine} ✕
              </span>
            )}
            {filters.diet && (
              <span style={{ 
                background: '#e8f5e8', 
                color: '#2e7d32', 
                padding: '0.3rem 0.8rem', 
                borderRadius: 12, 
                fontSize: '0.8rem' 
              }}>
                {filters.diet} ✕
              </span>
            )}
            {filters.maxReadyTime && (
              <span style={{ 
                background: '#fff3e0', 
                color: '#f57c00', 
                padding: '0.3rem 0.8rem', 
                borderRadius: 12, 
                fontSize: '0.8rem' 
              }}>
                ≤{filters.maxReadyTime}min ✕
              </span>
            )}
            <button
              onClick={clearFilters}
              style={{
                background: 'none',
                border: 'none',
                color: '#666',
                cursor: 'pointer',
                fontSize: '0.9rem',
                textDecoration: 'underline'
              }}
            >
              Clear all
            </button>
          </div>
        )}
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
            Try adjusting your filters or search for something else
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
        <>
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
                  background: 'white',
                  position: 'relative'
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
                {/* Difficulty Badge */}
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: getDifficultyColor(recipe.readyInMinutes),
                  color: 'white',
                  padding: '0.3rem 0.8rem',
                  borderRadius: 12,
                  fontSize: '0.8rem',
                  fontWeight: '500',
                  zIndex: 2
                }}>
                  {getDifficultyText(recipe.readyInMinutes)}
                </div>

                <img 
                  src={recipe.image || 'https://via.placeholder.com/300x200/CCCCCC/666666?text=No+Image'} 
                  alt={recipe.title} 
                  style={{ width: '100%', height: 220, objectFit: 'cover' }}
                  onError={handleImageError}
                />
                <div style={{ padding: '1.5rem' }}>
                  <h3 style={{ 
                    margin: '0 0 0.8rem 0', 
                    fontSize: '1.3rem', 
                    color: '#333',
                    fontWeight: '600',
                    lineHeight: '1.3'
                  }}>
                    {recipe.title}
                  </h3>
                  
                  {/* Recipe Tags */}
                  <div style={{ 
                    display: 'flex', 
                    gap: '0.5rem', 
                    flexWrap: 'wrap',
                    marginBottom: '1rem'
                  }}>
                    {recipe.cuisines?.slice(0, 2).map((cuisine, index) => (
                      <span key={index} style={{
                        background: '#f0f8ff',
                        color: '#0066cc',
                        padding: '0.2rem 0.6rem',
                        borderRadius: 8,
                        fontSize: '0.75rem',
                        fontWeight: '500'
                      }}>
                        {cuisine}
                      </span>
                    ))}
                    {recipe.dishTypes?.slice(0, 1).map((dishType, index) => (
                      <span key={index} style={{
                        background: '#fff0f0',
                        color: '#cc0000',
                        padding: '0.2rem 0.6rem',
                        borderRadius: 8,
                        fontSize: '0.75rem',
                        fontWeight: '500'
                      }}>
                        {dishType}
                      </span>
                    ))}
                  </div>
                  
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
          
          {/* Load More Button */}
          {hasMore && (
            <div style={{ textAlign: 'center', marginTop: '3rem' }}>
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                style={{
                  padding: '1rem 2rem',
                  background: loadingMore ? '#ccc' : '#222',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  cursor: loadingMore ? 'not-allowed' : 'pointer',
                  fontSize: '1.1rem',
                  fontWeight: '500',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (!loadingMore) e.target.style.background = '#444'
                }}
                onMouseLeave={(e) => {
                  if (!loadingMore) e.target.style.background = '#222'
                }}
              >
                {loadingMore ? 'Loading...' : 'Load More Recipes'}
              </button>
              <p style={{ marginTop: '0.5rem', color: '#666', fontSize: '0.9rem' }}>
                Showing {recipes.length} of {totalResults} recipes
              </p>
            </div>
          )}
          
          {!hasMore && recipes.length > 0 && (
            <div style={{ 
              textAlign: 'center', 
              marginTop: '2rem', 
              padding: '1rem',
              background: '#f8f9fa',
              borderRadius: 8,
              color: '#666'
            }}>
              <p style={{ margin: 0 }}>🎉 You've seen all {totalResults} recipes for "{searchQuery}"!</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Recipes 