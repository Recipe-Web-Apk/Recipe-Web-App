import React from 'react'

function IngredientInputList({ ingredients, setIngredients, errors, setErrors }) {
  function addIngredient() {
    setIngredients(prev => [...prev, ''])
    if (errors.ingredients) {
      setErrors(prev => ({ ...prev, ingredients: '' }))
    }
  }

  function removeIngredient(index) {
    if (ingredients.length > 4) {
      setIngredients(prev => prev.filter((_, i) => i !== index))
    }
  }

  function handleIngredientChange(index, value) {
    const newIngredients = [...ingredients]
    newIngredients[index] = value
    setIngredients(newIngredients)
    
    if (errors.ingredients) {
      setErrors(prev => ({ ...prev, ingredients: '' }))
    }
  }

  function handleKeyPress(e, index) {
    if (e.key === 'Enter' && index === ingredients.length - 1) {
      addIngredient()
    }
  }

  return (
    <div>
      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
        Ingredients (minimum 4) *
      </label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {ingredients.map((ingredient, index) => (
          <div key={index} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input
              type="text"
              value={ingredient}
              onChange={(e) => handleIngredientChange(index, e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              style={{ 
                flex: 1, 
                padding: '0.7rem', 
                border: '1px solid #ccc', 
                borderRadius: 4 
              }}
              placeholder={`Ingredient ${index + 1}`}
            />
            {ingredients.length > 4 && (
              <button
                type="button"
                onClick={() => removeIngredient(index)}
                style={{ 
                  padding: '0.7rem 1rem', 
                  background: '#ff4444', 
                  color: '#fff', 
                  border: 'none', 
                  borderRadius: 4, 
                  cursor: 'pointer' 
                }}
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
        <button
          type="button"
          onClick={addIngredient}
          style={{ 
            padding: '0.3rem 0.8rem', 
            background: '#4CAF50', 
            color: '#fff', 
            border: 'none', 
            borderRadius: 4, 
            cursor: 'pointer',
            fontSize: '0.9rem'
          }}
        >
          + Add Ingredient
        </button>
        <span style={{ fontSize: '0.9rem', color: '#666' }}>
          {ingredients.length}/∞ ingredients
        </span>
      </div>
      {errors.ingredients && (
        <div style={{ color: '#ff4444', fontSize: '0.9rem', marginTop: '0.3rem' }}>
          {errors.ingredients}
        </div>
      )}
    </div>
  )
}

export default IngredientInputList 