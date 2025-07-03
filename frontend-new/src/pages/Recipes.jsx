import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { SPOONACULAR_ENDPOINTS, LOCAL_ENDPOINTS, FILTER_OPTIONS, DIFFICULTY_LEVELS, SEARCH_SUGGESTIONS, DEFAULTS } from '../constants/paths'
import './Recipes.css'
import { supabase } from '../supabaseClient'

function Recipes() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchInput, setSearchInput] = useState("")
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
  const debounceRef = useRef()
  const [isFetching, setIsFetching] = useState(false)
  const [dataSource, setDataSource] = useState(() => localStorage.getItem('recipeDataSource') || 'spoonacular')

  // When dataSource changes, remember it
  useEffect(() => {
    localStorage.setItem('recipeDataSource', dataSource)
  }, [dataSource])

  // Debounced live search effect
  useEffect(() => {
    if (!searchInput.trim()) {
      setSearchQuery('')
      setRecipes([])
      setTotalResults(0)
      setHasMore(false)
      setLoading(false)
      setIsFetching(false)
      return
    }
    if (loading) {
      setLoading(true)
    } else {
      setIsFetching(true)
    }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setSearchQuery(searchInput.trim())
      localStorage.setItem('lastSearch', searchInput.trim())
    }, 400)
    return () => clearTimeout(debounceRef.current)
    // eslint-disable-next-line
  }, [searchInput])

  // Fetch recipes when searchQuery, filters, or sortBy changes
  useEffect(() => {
    setOffset(0)
    setHasMore(true)
    if (searchQuery.trim()) {
      fetchRecipes(true, searchQuery)
    } else {
      setLoading(false)
      setIsFetching(false)
    }
    // eslint-disable-next-line
  }, [filters, sortBy, searchQuery])

  async function fetchRecipes(reset = false, queryOverride = null) {
    try {
      if (reset) {
        if (loading) {
          setLoading(true)
        } else {
          setIsFetching(true)
        }
        setOffset(0)
      } else {
        setLoadingMore(true)
      }
      const currentOffset = reset ? 0 : offset
      const queryToUse = queryOverride !== null ? queryOverride : searchQuery
      if (!queryToUse.trim()) {
        setRecipes([])
        setTotalResults(0)
        setHasMore(false)
        setLoading(false)
        setIsFetching(false)
        setLoadingMore(false)
        return
      }
      let newRecipes = []
      let total = 0
      if (dataSource === 'spoonacular') {
        const params = new URLSearchParams({
          query: queryToUse,
          offset: currentOffset.toString(),
          sort: sortBy,
          ...filters
        })
        const url = `${SPOONACULAR_ENDPOINTS.SEARCH}?${params}`
        const response = await fetch(url)
        const data = await response.json()
        newRecipes = data.results || []
        total = data.totalResults || 0
      } else {
        // Supabase search for My Recipes
        let supabaseQuery = supabase
          .from('recipes')
          .select('*', { count: 'exact' })
          .ilike('title', `%${queryToUse}%`)
          .range(currentOffset, currentOffset + DEFAULTS.RECIPES_PER_PAGE - 1)
          .order('id', { ascending: false })
        const { data, error, count } = await supabaseQuery
        if (error) throw error
        newRecipes = data || []
        total = count || 0
      }
      if (reset) {
        setRecipes(newRecipes)
      } else {
        const existingIds = new Set(recipes.map(recipe => recipe.id))
        const uniqueNewRecipes = newRecipes.filter(recipe => !existingIds.has(recipe.id))
        setRecipes(prev => [...prev, ...uniqueNewRecipes])
      }
      const nextOffset = currentOffset + newRecipes.length
      setHasMore(nextOffset < total)
      setOffset(nextOffset)
      setTotalResults(total)
    } catch (err) {
      console.error('Error fetching recipes:', err)
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
      setIsFetching(false)
      setLoadingMore(false)
    }
  }

  function handleSearch(e) {
    e.preventDefault()
    if (searchInput.trim()) {
      setSearchQuery(searchInput.trim())
      localStorage.setItem('lastSearch', searchInput.trim())
    } else {
      setSearchInput('')
      setSearchQuery('')
      setRecipes([])
      setTotalResults(0)
      setHasMore(false)
      localStorage.removeItem('lastSearch')
    }
  }

  function handleClear() {
    setSearchInput('')
    setSearchQuery('')
    setRecipes([])
    setTotalResults(0)
    setHasMore(false)
    localStorage.removeItem('lastSearch')
  }

  function handleLoadMore() {
    if (!loadingMore && hasMore) {
      fetchRecipes(false)
    }
  }

  function handleImageError(e) {
    e.target.src = DEFAULTS.PLACEHOLDER_IMAGE
  }

  function getDifficultyColor(readyInMinutes) {
    if (!readyInMinutes) return DIFFICULTY_LEVELS.UNKNOWN.color
    if (readyInMinutes <= DIFFICULTY_LEVELS.EASY.maxTime) return DIFFICULTY_LEVELS.EASY.color
    if (readyInMinutes <= DIFFICULTY_LEVELS.MEDIUM.maxTime) return DIFFICULTY_LEVELS.MEDIUM.color
    return DIFFICULTY_LEVELS.HARD.color
  }

  function getDifficultyText(readyInMinutes) {
    if (!readyInMinutes) return DIFFICULTY_LEVELS.UNKNOWN.label
    if (readyInMinutes <= DIFFICULTY_LEVELS.EASY.maxTime) return DIFFICULTY_LEVELS.EASY.label
    if (readyInMinutes <= DIFFICULTY_LEVELS.MEDIUM.maxTime) return DIFFICULTY_LEVELS.MEDIUM.label
    return DIFFICULTY_LEVELS.HARD.label
  }

  function getDifficultyClass(readyInMinutes) {
    if (!readyInMinutes) return 'unknown'
    if (readyInMinutes <= DIFFICULTY_LEVELS.EASY.maxTime) return 'easy'
    if (readyInMinutes <= DIFFICULTY_LEVELS.MEDIUM.maxTime) return 'medium'
    return 'hard'
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
      <div className="loading-container">
        <h1 className="loading-title">Explore Recipes</h1>
        <div className="loading-text">Loading delicious recipes...</div>
      </div>
    )
  }

  if (error) {
  return (
      <div className="error-container">
        <h1 className="error-title">Explore Recipes</h1>
        <div className="error-message">{error}</div>
        <button 
          onClick={() => fetchRecipes(true)} 
          className="retry-btn"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="recipes-container">
      {/* Data Source Toggle */}
      <div className="data-source-toggle">
        <button
          className={dataSource === 'spoonacular' ? 'active' : ''}
          onClick={() => setDataSource('spoonacular')}
        >
          Explore
        </button>
        <button
          className={dataSource === 'local' ? 'active' : ''}
          onClick={() => setDataSource('local')}
        >
          My Recipes
        </button>
      </div>
      <div className="recipes-header">
        <div>
          <h1 className="recipes-title">Explore Recipes</h1>
          <p className="recipes-subtitle">
            {totalResults > 0 ? `Found ${totalResults} delicious recipes` : 'Discover recipes from around the world'}
          </p>
        </div>
        {isAuthenticated && (
          <button 
            onClick={() => navigate('/recipes/create')}
            className="add-recipe-btn"
          >
            + Add Recipe
          </button>
        )}
      </div>
      
      {/* Search Bar */}
      <div className="search-section">
        <form onSubmit={handleSearch} className="search-form" autoComplete="off">
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search recipes by name or ingredient (e.g., pasta, chicken, vegan)"
            className="search-input"
            autoFocus
            aria-label="Search recipes"
          />
          {searchInput && (
            <button
              type="button"
              className="clear-btn"
              aria-label="Clear search"
              onClick={handleClear}
              tabIndex={0}
            >
              ×
            </button>
          )}
          <button type="submit" className="search-btn">
            Search
          </button>
        </form>
        <div className="search-tip">
          💡 Try searching for: {SEARCH_SUGGESTIONS.slice(0, 5).join(', ')}
        </div>
      </div>

      {/* Result Count and Spinner */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minHeight: 32 }}>
        {!loading && recipes.length > 0 && (
          <div className="result-count">
            {totalResults === 1
              ? '1 recipe found'
              : `${totalResults} recipes found`}
          </div>
        )}
        {isFetching && (
          <div className="spinner" aria-label="Searching"></div>
        )}
      </div>

      {/* Filter and Sort Controls */}
      <div className="filter-section">
        <div className="filter-header">
          <h3 className="filter-title">Filters & Sort</h3>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="toggle-filters-btn"
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        {showFilters && (
          <div className="filters-grid">
            {/* Sort By */}
            <div className="filter-group">
              <label className="filter-label">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select"
              >
                {FILTER_OPTIONS.SORT_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Cuisine */}
            <div className="filter-group">
              <label className="filter-label">Cuisine</label>
              <select
                value={filters.cuisine}
                onChange={(e) => setFilters(prev => ({ ...prev, cuisine: e.target.value }))}
                className="filter-select"
              >
                <option value="">All Cuisines</option>
                {FILTER_OPTIONS.CUISINES.map(cuisine => (
                  <option key={cuisine.value} value={cuisine.value}>
                    {cuisine.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Diet */}
            <div className="filter-group">
              <label className="filter-label">Diet</label>
              <select
                value={filters.diet}
                onChange={(e) => setFilters(prev => ({ ...prev, diet: e.target.value }))}
                className="filter-select"
              >
                <option value="">All Diets</option>
                {FILTER_OPTIONS.DIETS.map(diet => (
                  <option key={diet.value} value={diet.value}>
                    {diet.label}
                  </option>
                ))}
              </select>
              </div>

            {/* Max Ready Time */}
            <div className="filter-group">
              <label className="filter-label">Max Time (min)</label>
              <select
                value={filters.maxReadyTime}
                onChange={(e) => setFilters(prev => ({ ...prev, maxReadyTime: e.target.value }))}
                className="filter-select"
              >
                <option value="">Any Time</option>
                {FILTER_OPTIONS.TIME_OPTIONS.map(time => (
                  <option key={time.value} value={time.value}>
                    {time.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {(filters.cuisine || filters.diet || filters.maxReadyTime) && (
          <div className="active-filters">
            <span className="active-filters-label">Active filters:</span>
            {filters.cuisine && (
              <span className="filter-chip cuisine">
                {filters.cuisine} ✕
              </span>
            )}
            {filters.diet && (
              <span className="filter-chip diet">
                {filters.diet} ✕
              </span>
            )}
            {filters.maxReadyTime && (
              <span className="filter-chip time">
                ≤{filters.maxReadyTime}min ✕
              </span>
            )}
            <button onClick={clearFilters} className="clear-filters-btn">
              Clear all
            </button>
          </div>
        )}
      </div>
      
      {!isAuthenticated && (
        <div className="login-tip">
          <p>
            💡 <strong>Tip:</strong> Log in to create and save your own recipes!
          </p>
        </div>
      )}
      
      {/* Empty State with Suggestions */}
      {!isFetching && !loading && recipes.length === 0 && (
        <div className="empty-state">
          <h3>No recipes found</h3>
          <p>
            Try another ingredient or use one of the suggestions below:
          </p>
          <div className="empty-state-suggestions">
            {SEARCH_SUGGESTIONS.slice(0, 6).map(term => (
              <button
                key={term}
                onClick={() => setSearchInput(term)}
                className="empty-state-suggestion"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {!loading && recipes.length > 0 && (
        <>
          <div className="recipes-grid">
            {recipes.map(recipe => (
              <div 
                key={recipe.id} 
                onClick={() => navigate(`/recipes/${recipe.id}`)}
                className="recipe-card"
              >
                {/* Difficulty Badge */}
                <div className={`difficulty-badge ${getDifficultyClass(recipe.readyInMinutes)}`}>
                  {getDifficultyText(recipe.readyInMinutes)}
                </div>

                <img 
                  src={recipe.image || DEFAULTS.PLACEHOLDER_IMAGE} 
                  alt={recipe.title} 
                  className="recipe-image"
                  onError={handleImageError}
                />
                <div className="recipe-content">
                  <h3 className="recipe-title">
                    {recipe.title}
                  </h3>
                  
                  {/* Recipe Tags */}
                  <div className="recipe-tags">
                    {recipe.cuisines?.slice(0, 2).map((cuisine, index) => (
                      <span key={index} className="recipe-tag cuisine">
                        {cuisine}
                      </span>
                    ))}
                    {recipe.dishTypes?.slice(0, 1).map((dishType, index) => (
                      <span key={index} className="recipe-tag dish-type">
                        {dishType}
                      </span>
                    ))}
                  </div>
                  
                  <div className="recipe-meta">
                    <span className="recipe-time">
                      ⏱️ {recipe.readyInMinutes || 'N/A'} min
                    </span>
                    <span className="recipe-servings">
                      👥 {recipe.servings || 'N/A'} servings
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Load More Button */}
          {hasMore && (
            <div className="load-more-section">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="load-more-btn"
              >
                {loadingMore ? 'Loading...' : 'Load More Recipes'}
              </button>
              <p className="load-more-info">
                Showing {recipes.length} of {totalResults} recipes
              </p>
            </div>
          )}
          
          {!hasMore && recipes.length > 0 && (
            <div className="end-results">
              <p>🎉 You've seen all {totalResults} recipes for "{searchQuery}"!</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Recipes 