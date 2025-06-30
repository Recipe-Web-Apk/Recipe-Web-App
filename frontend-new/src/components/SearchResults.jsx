import React from 'react'
import { useNavigate } from 'react-router-dom'
import './SearchResults.css'

function SearchResults({ results, searchPerformed }) {
  const navigate = useNavigate()

  if (!searchPerformed) {
    return null
  }

  if (results.length === 0) {
    return (
      <div className="no-results">
        <h3 className="no-results-title">No recipes found</h3>
        <p>Try adjusting your ingredients or calorie range</p>
      </div>
    )
  }

  return (
    <div className="search-results">
      <h3 className="search-results-title">
        Found {results.length} recipe{results.length !== 1 ? 's' : ''}
      </h3>
      <div className="search-results-grid">
        {results.map(recipe => (
          <div 
            key={recipe.id}
            onClick={() => navigate(`/recipes/${recipe.id}`)}
            className="recipe-card"
          >
            <img 
              src={recipe.image} 
              alt={recipe.title || recipe.name} 
              className="recipe-card-image"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/300x200/CCCCCC/666666?text=No+Image'
              }}
            />
            <div className="recipe-card-content">
              <h4 className="recipe-card-title">
                {recipe.title || recipe.name}
              </h4>
              <p className="recipe-card-description">
                {recipe.summary ? 
                  recipe.summary.replace(/<[^>]*>/g, '').substring(0, 120) + '...' : 
                  recipe.description || 'No description available'
                }
              </p>
              <div className="recipe-card-meta">
                <span>
                  Calories: {recipe.calories || recipe.nutrition?.nutrients?.find(n => n.name === 'Calories')?.amount || 'N/A'}
                </span>
                <span>
                  Time: {recipe.readyInMinutes ? `${recipe.readyInMinutes} min` : recipe.cookTime || 'N/A'}
                </span>
              </div>
              {recipe.cuisines && recipe.cuisines.length > 0 && (
                <div className="recipe-card-tags">
                  {recipe.cuisines.slice(0, 3).map(cuisine => (
                    <span 
                      key={cuisine} 
                      className="recipe-tag"
                    >
                      {cuisine}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SearchResults 