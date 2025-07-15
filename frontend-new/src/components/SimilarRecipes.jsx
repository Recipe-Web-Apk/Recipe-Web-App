import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiClock, FiUsers } from 'react-icons/fi'
import './SimilarRecipes.css'
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../contexts/AuthContext';

function SimilarRecipes({ recipeId }) {
  const [similarRecipes, setSimilarRecipes] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { token } = useAuth();

  useEffect(() => {
    if (!recipeId) {
      console.warn('Skipping fetch: recipeId is missing');
      return;
    }

    const fetchSimilarRecipes = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await axiosInstance.get(`/spoonacular/similar/${recipeId}`, { headers });
        const data = response.data
        
        if (response.status === 200) {
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
    };

    fetchSimilarRecipes();
  }, [recipeId, token]);

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
                src={recipe.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4='}
                alt={recipe.title} 
                onError={e => { e.target.onerror = null; e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4='; }}
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