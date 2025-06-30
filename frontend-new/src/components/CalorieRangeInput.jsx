import React from 'react'
import './CalorieRangeInput.css'

function CalorieRangeInput({ minCalories, maxCalories, setMinCalories, setMaxCalories, errors, setErrors }) {
  function handleMinChange(value) {
    setMinCalories(value)
    if (errors.calories) {
      setErrors(prev => ({ ...prev, calories: '' }))
    }
  }

  function handleMaxChange(value) {
    setMaxCalories(value)
    if (errors.calories) {
      setErrors(prev => ({ ...prev, calories: '' }))
    }
  }

  return (
    <div className="calorie-range-input">
      <label className="calorie-range-label">
        Calorie Range *
      </label>
      <div className="calorie-inputs-grid">
        <div className="calorie-input-group">
          <label className="calorie-input-sub-label">
            Min Calories
          </label>
          <input
            type="number"
            value={minCalories}
            onChange={(e) => handleMinChange(e.target.value)}
            min="0"
            className="calorie-input"
            placeholder="0"
          />
        </div>
        <div className="calorie-input-group">
          <label className="calorie-input-sub-label">
            Max Calories
          </label>
          <input
            type="number"
            value={maxCalories}
            onChange={(e) => handleMaxChange(e.target.value)}
            min="0"
            className="calorie-input"
            placeholder="1000"
          />
        </div>
      </div>
      {errors.calories && (
        <div className="calorie-error">
          {errors.calories}
        </div>
      )}
    </div>
  )
}

export default CalorieRangeInput 