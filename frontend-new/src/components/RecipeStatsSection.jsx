import React from 'react'

function RecipeStatsSection({ form, errors, handleChange }) {
  const difficultyOptions = ['Easy', 'Medium', 'Hard']

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Prep Time (min) *
          </label>
          <input
            type="number"
            name="prepTime"
            value={form.prepTime}
            onChange={handleChange}
            min="1"
            style={{ 
              width: '100%', 
              padding: '0.7rem', 
              border: `1px solid ${errors.prepTime ? '#ff4444' : '#ccc'}`, 
              borderRadius: 4 
            }}
          />
          {errors.prepTime && <div style={{ color: '#ff4444', fontSize: '0.9rem', marginTop: '0.3rem' }}>{errors.prepTime}</div>}
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Cook Time (min) *
          </label>
          <input
            type="number"
            name="cookTime"
            value={form.cookTime}
            onChange={handleChange}
            min="1"
            style={{ 
              width: '100%', 
              padding: '0.7rem', 
              border: `1px solid ${errors.cookTime ? '#ff4444' : '#ccc'}`, 
              borderRadius: 4 
            }}
          />
          {errors.cookTime && <div style={{ color: '#ff4444', fontSize: '0.9rem', marginTop: '0.3rem' }}>{errors.cookTime}</div>}
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Servings *
          </label>
          <input
            type="number"
            name="servings"
            value={form.servings}
            onChange={handleChange}
            min="1"
            style={{ 
              width: '100%', 
              padding: '0.7rem', 
              border: `1px solid ${errors.servings ? '#ff4444' : '#ccc'}`, 
              borderRadius: 4 
            }}
          />
          {errors.servings && <div style={{ color: '#ff4444', fontSize: '0.9rem', marginTop: '0.3rem' }}>{errors.servings}</div>}
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Calories *
          </label>
          <input
            type="number"
            name="calories"
            value={form.calories}
            onChange={handleChange}
            min="1"
            style={{ 
              width: '100%', 
              padding: '0.7rem', 
              border: `1px solid ${errors.calories ? '#ff4444' : '#ccc'}`, 
              borderRadius: 4 
            }}
          />
          {errors.calories && <div style={{ color: '#ff4444', fontSize: '0.9rem', marginTop: '0.3rem' }}>{errors.calories}</div>}
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Difficulty *
          </label>
          <select
            name="difficulty"
            value={form.difficulty}
            onChange={handleChange}
            style={{ 
              width: '100%', 
              padding: '0.7rem', 
              border: `1px solid ${errors.difficulty ? '#ff4444' : '#ccc'}`, 
              borderRadius: 4 
            }}
          >
            <option value="">Select difficulty</option>
            {difficultyOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          {errors.difficulty && <div style={{ color: '#ff4444', fontSize: '0.9rem', marginTop: '0.3rem' }}>{errors.difficulty}</div>}
        </div>
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
          Tags
        </label>
        <input
          type="text"
          name="tags"
          value={form.tags}
          onChange={handleChange}
          style={{ 
            width: '100%', 
            padding: '0.7rem', 
            border: '1px solid #ccc', 
            borderRadius: 4 
          }}
          placeholder="Enter tags separated by commas (e.g., Italian, Quick, Vegetarian)"
        />
      </div>
    </>
  )
}

export default RecipeStatsSection 