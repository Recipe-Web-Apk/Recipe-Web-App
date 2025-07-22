import React from 'react'
import IngredientTooltip from './IngredientTooltip'

function IngredientsSection({ form, errors, handleIngredientChange, addIngredient, removeIngredient }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <label style={{ fontWeight: 'bold' }}>
          Ingredients *
        </label>
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
      </div>
      {form.ingredients.map((ingredient, index) => (
        <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <IngredientTooltip ingredient={ingredient}>
            <input
              type="text"
              value={ingredient}
              onChange={(e) => handleIngredientChange(index, e.target.value)}
              style={{ 
                flex: 1, 
                padding: '0.7rem', 
                border: '1px solid #ccc', 
                borderRadius: 4 
              }}
              placeholder={`Ingredient ${index + 1}`}
            />
          </IngredientTooltip>
          {form.ingredients.length > 1 && (
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
      {errors.ingredients && <div style={{ color: '#ff4444', fontSize: '0.9rem', marginTop: '0.3rem' }}>{errors.ingredients}</div>}
    </div>
  )
}

export default IngredientsSection 