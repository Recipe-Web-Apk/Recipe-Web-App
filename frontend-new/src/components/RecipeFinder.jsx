import React, { useState } from 'react'
import IngredientInputList from './IngredientInputList'
import CalorieRangeInput from './CalorieRangeInput'
import SearchResults from './SearchResults'
import './RecipeFinder.css'

function RecipeFinder() {
  const [ingredients, setIngredients] = useState(['', '', '', ''])
  const [minCalories, setMinCalories] = useState('')
  const [maxCalories, setMaxCalories] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [searchPerformed, setSearchPerformed] = useState(false)
  const [results, setResults] = useState([])
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  function validateForm() {
    const newErrors = {}
    
    const validIngredients = ingredients.filter(ing => ing.trim() !== '')
    if (validIngredients.length < 4) {
      newErrors.ingredients = 'Please enter at least 4 ingredients'
    }
    
    if (!minCalories || !maxCalories) {
      newErrors.calories = 'Please enter both minimum and maximum calories'
    } else if (parseInt(minCalories) > parseInt(maxCalories)) {
      newErrors.calories = 'Minimum calories cannot be greater than maximum calories'
    }
    
    return newErrors
  }

  async function searchRecipes(isLoadMore = false) {
    const validationErrors = validateForm()
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    if (isLoadMore) {
      setLoadingMore(true)
    } else {
      setLoading(true)
      setSearchPerformed(true)
      setOffset(0)
      setResults([])
    }
    
    try {
      const validIngredients = ingredients.filter(ing => ing.trim() !== '')
      const query = validIngredients.join(', ')
      
      const response = await fetch(`http://localhost:5000/api/spoonacular/search?query=${encodeURIComponent(query)}&offset=${isLoadMore ? offset : 0}`)
      const data = await response.json()
      
      if (response.ok) {
        const newResults = data.results || []
        
        if (isLoadMore) {
          setResults(prev => [...prev, ...newResults])
        } else {
          setResults(newResults)
        }
        
        setOffset(isLoadMore ? offset + 10 : 10)
        setHasMore(newResults.length === 10) // If we got 10 results, there might be more
      } else {
        console.error('API Error:', data)
        setErrors({ api: 'Failed to fetch recipes. Please try again.' })
      }
    } catch (error) {
      console.error('Network Error:', error)
      setErrors({ api: 'Network error. Please check your connection.' })
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  function loadMore() {
    searchRecipes(true)
  }

  function clearForm() {
    setIngredients(['', '', '', ''])
    setMinCalories('')
    setMaxCalories('')
    setErrors({})
    setSearchPerformed(false)
    setResults([])
    setOffset(0)
    setHasMore(true)
  }

  const isValid = Object.keys(validateForm()).length === 0

  return (
    <div className="recipe-finder">
      <div className="recipe-finder-container">
        <h2 className="recipe-finder-title">
          Recipe Finder
        </h2>
        <p className="recipe-finder-description">
          Enter at least 4 ingredients and a calorie range to discover recipes tailored to your needs.
        </p>

        <div className="recipe-finder-form">
          <div className="recipe-finder-form-content">
            <IngredientInputList 
              ingredients={ingredients}
              setIngredients={setIngredients}
              errors={errors}
              setErrors={setErrors}
            />

            <CalorieRangeInput 
              minCalories={minCalories}
              maxCalories={maxCalories}
              setMinCalories={setMinCalories}
              setMaxCalories={setMaxCalories}
              errors={errors}
              setErrors={setErrors}
            />

            <div className="recipe-finder-actions">
              <button
                onClick={clearForm}
                className="btn-clear"
              >
                Clear
              </button>
              <button
                onClick={() => searchRecipes(false)}
                disabled={!isValid || loading}
                className="btn-search"
              >
                {loading ? 'Searching...' : 'Find Recipes'}
              </button>
            </div>
          </div>
        </div>

        {errors.api && (
          <div className="error-message">
            {errors.api}
          </div>
        )}

        {loading && (
          <div className="loading-message">
            <div className="loading-message-text">
              Searching for recipes...
            </div>
          </div>
        )}

        <SearchResults 
          results={results}
          searchPerformed={searchPerformed}
        />

        {hasMore && results.length > 0 && (
          <div className="load-more-container">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="btn-load-more"
            >
              {loadingMore ? 'Loading...' : 'Load More Recipes'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default RecipeFinder 