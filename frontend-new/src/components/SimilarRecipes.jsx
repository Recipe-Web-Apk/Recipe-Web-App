import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiClock, FiUsers } from 'react-icons/fi'
import './SimilarRecipes.css'

function SimilarRecipes({ recipeId }) {
  const [similarRecipes, setSimilarRecipes] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (recipeId) {
      fetchSimilarRecipes()
    }
  }, [recipeId])

  async function fetchSimilarRecipes() {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`http://localhost:5000/api/spoonacular/similar/${recipeId}`)
      const data = await response.json()
      
      if (response.ok) {
        setSimilarRecipes(data)
      } else {
        setError(data.error || 'Failed to fetch similar recipes')
      }
    } catch (error) {
      console.error('Error fetching similar recipes:', error)
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="similar-recipes">
        <h3>Similar Recipes</h3>
        <div className="similar-recipes-loading">
          <div className="loading-spinner"></div>
          <p>Loading similar recipes...</p>
        </div>
      </div>
    )
  }

  if (error || similarRecipes.length === 0) {
    return null // Don't show anything if there's an error or no similar recipes
  }

  return (
    <div className="similar-recipes">
      <h3>You might also like</h3>
      <div className="similar-recipes-grid">
        {similarRecipes.map((recipe) => (
          <Link 
            to={`/recipes/${recipe.id}`} 
            key={recipe.id} 
            className="similar-recipe-card"
          >
            <div className="similar-recipe-image">
              <img 
                src={recipe.image} 
                alt={recipe.title}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/300x200/CCCCCC/666666?text=No+Image'
                }}
              />
            </div>
            <div className="similar-recipe-info">
              <h4 className="similar-recipe-title">{recipe.title}</h4>
              <div className="similar-recipe-stats">
                <span className="stat">
                  <FiClock />
                  {recipe.readyInMinutes || 'N/A'} min
                </span>
                <span className="stat">
                  <FiUsers />
                  {recipe.servings || 'N/A'}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default SimilarRecipes 