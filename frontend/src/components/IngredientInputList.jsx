import React from 'react'
import IngredientTooltip from './IngredientTooltip'
import './IngredientInputList.css'

function IngredientInputList({ 
  ingredients, 
  setIngredients, 
  errors, 
  setErrors, 
  minIngredients = 4,
  allowRemovalBelowMin = false,
  label = "Ingredients (minimum 4) *"
}) {
  function addIngredient() {
    setIngredients(prev => [...prev, ''])
    if (errors.ingredients) {
      setErrors(prev => ({ ...prev, ingredients: '' }))
    }
  }

  function removeIngredient(index) {
    if (allowRemovalBelowMin || ingredients.length > minIngredients) {
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
    <div className="ingredient-input-list">
      <label className="ingredient-input-label">
        {label}
      </label>
      <div className="ingredient-inputs-container">
        {ingredients.map((ingredient, index) => (
          <div key={index} className="ingredient-input-row">
            <IngredientTooltip ingredient={ingredient}>
              <input
                type="text"
                value={ingredient}
                onChange={(e) => handleIngredientChange(index, e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                className="ingredient-input"
                placeholder={`Ingredient ${index + 1}`}
              />
            </IngredientTooltip>
            {(allowRemovalBelowMin || ingredients.length > minIngredients) && (
              <button
                type="button"
                onClick={() => removeIngredient(index)}
                className="btn-remove-ingredient"
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>
      <div className="ingredient-actions">
        <button
          type="button"
          onClick={addIngredient}
          className="btn-add-ingredient"
        >
          + Add Ingredient
        </button>
        <span className="ingredient-count">
          {ingredients.length}/∞ ingredients
        </span>
      </div>
      {errors.ingredients && (
        <div className="ingredient-error">
          {errors.ingredients}
        </div>
      )}
    </div>
  )
}

export default IngredientInputList 