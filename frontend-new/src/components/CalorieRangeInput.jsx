import React from 'react'

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
    <div>
      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
        Calorie Range *
      </label>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem', color: '#666' }}>
            Min Calories
          </label>
          <input
            type="number"
            value={minCalories}
            onChange={(e) => handleMinChange(e.target.value)}
            min="0"
            style={{ 
              width: '100%', 
              padding: '0.7rem', 
              border: '1px solid #ccc', 
              borderRadius: 4 
            }}
            placeholder="0"
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem', color: '#666' }}>
            Max Calories
          </label>
          <input
            type="number"
            value={maxCalories}
            onChange={(e) => handleMaxChange(e.target.value)}
            min="0"
            style={{ 
              width: '100%', 
              padding: '0.7rem', 
              border: '1px solid #ccc', 
              borderRadius: 4 
            }}
            placeholder="1000"
          />
        </div>
      </div>
      {errors.calories && (
        <div style={{ color: '#ff4444', fontSize: '0.9rem', marginTop: '0.3rem' }}>
          {errors.calories}
        </div>
      )}
    </div>
  )
}

export default CalorieRangeInput 