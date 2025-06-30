import React from 'react'
import { useNavigate } from 'react-router-dom'

function RecipeCard({ recipe, allowDelete, onDelete }) {
  const navigate = useNavigate()

  return (
    <div style={{
      border: '1px solid #eee',
      borderRadius: 8,
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      position: 'relative',
      background: 'white',
      cursor: 'pointer',
      transition: 'transform 0.2s, box-shadow 0.2s'
    }}
      onClick={() => navigate(`/recipes/${recipe.id}`)}
    >
      {allowDelete && (
        <button
          onClick={e => {
            e.stopPropagation()
            onDelete(recipe.id)
          }}
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            background: '#ff4444',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            padding: '0.3rem 0.7rem',
            fontSize: '0.9rem',
            cursor: 'pointer',
            zIndex: 2
          }}
        >
          Remove
        </button>
      )}
      <img
        src={recipe.image}
        alt={recipe.title || recipe.name}
        style={{ width: '100%', height: 180, objectFit: 'cover' }}
      />
      <div style={{ padding: '1rem' }}>
        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>{recipe.title || recipe.name}</h4>
        <div style={{ color: '#666', fontSize: '0.95rem', marginBottom: '0.5rem' }}>
          Calories: {recipe.calories}
        </div>
      </div>
    </div>
  )
}

export default RecipeCard 