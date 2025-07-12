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
              src={recipe.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4='}
              alt={recipe.title} 
              onError={e => { e.target.onerror = null; e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4='; }}
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