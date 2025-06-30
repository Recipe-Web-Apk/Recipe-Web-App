import React from 'react'
import { useNavigate } from 'react-router-dom'

function SearchResults({ results, searchPerformed }) {
  const navigate = useNavigate()

  if (!searchPerformed) {
    return null
  }

  if (results.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
        <h3>No recipes found</h3>
        <p>Try adjusting your ingredients or calorie range</p>
      </div>
    )
  }

  return (
    <div>
      <h3 style={{ marginBottom: '1rem' }}>
        Found {results.length} recipe{results.length !== 1 ? 's' : ''}
      </h3>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
        gap: '1.5rem' 
      }}>
        {results.map(recipe => (
          <div 
            key={recipe.id}
            onClick={() => navigate(`/recipes/${recipe.id}`)}
            style={{ 
              border: '1px solid #eee', 
              borderRadius: 8, 
              overflow: 'hidden', 
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-4px)'
              e.target.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)'
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)'
              e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            <img 
              src={recipe.image} 
              alt={recipe.name} 
              style={{ 
                width: '100%', 
                height: 180, 
                objectFit: 'cover' 
              }} 
            />
            <div style={{ padding: '1rem' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>
                {recipe.name}
              </h4>
              <p style={{ 
                margin: '0 0 0.5rem 0', 
                fontSize: '0.9rem', 
                color: '#666',
                lineHeight: '1.4'
              }}>
                {recipe.description}
              </p>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                fontSize: '0.9rem',
                color: '#666'
              }}>
                <span>Calories: {recipe.calories}</span>
                <span>Time: {recipe.cookTime}</span>
              </div>
              <div style={{ 
                display: 'flex', 
                gap: '0.3rem', 
                marginTop: '0.5rem',
                flexWrap: 'wrap'
              }}>
                {recipe.tags.slice(0, 3).map(tag => (
                  <span 
                    key={tag} 
                    style={{ 
                      padding: '0.2rem 0.5rem', 
                      background: '#f0f0f0', 
                      borderRadius: 12, 
                      fontSize: '0.8rem',
                      color: '#666'
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SearchResults 