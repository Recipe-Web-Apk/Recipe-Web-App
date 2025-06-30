import React, { useState } from 'react'
import IngredientInputList from './IngredientInputList'
import CalorieRangeInput from './CalorieRangeInput'
import SearchResults from './SearchResults'

function RecipeFinder() {
  const [ingredients, setIngredients] = useState(['', '', '', ''])
  const [minCalories, setMinCalories] = useState('')
  const [maxCalories, setMaxCalories] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [searchPerformed, setSearchPerformed] = useState(false)
  const [results, setResults] = useState([])

  const sampleRecipes = [
    {
      id: 1,
      name: 'Spaghetti Carbonara',
      description: 'Classic Italian pasta with eggs, cheese, and pancetta',
      image: 'https://via.placeholder.com/300x200/FF6B6B/FFFFFF?text=Carbonara',
      calories: 650,
      cookTime: '25 min',
      tags: ['Italian', 'Pasta', 'Quick Meal', 'Dinner']
    },
    {
      id: 2,
      name: 'Chicken Stir Fry',
      description: 'Quick and healthy Asian-inspired chicken with vegetables',
      image: 'https://via.placeholder.com/300x200/4ECDC4/FFFFFF?text=Stir+Fry',
      calories: 450,
      cookTime: '20 min',
      tags: ['Asian', 'Quick Meal', 'Healthy', 'Dinner']
    },
    {
      id: 3,
      name: 'Beef Tacos',
      description: 'Flavorful Mexican tacos with seasoned ground beef',
      image: 'https://via.placeholder.com/300x200/45B7D1/FFFFFF?text=Tacos',
      calories: 550,
      cookTime: '30 min',
      tags: ['Mexican', 'Family Meal', 'Quick', 'Dinner']
    },
    {
      id: 4,
      name: 'Vegetable Curry',
      description: 'Spicy vegetarian curry with mixed vegetables',
      image: 'https://via.placeholder.com/300x200/96CEB4/FFFFFF?text=Curry',
      calories: 380,
      cookTime: '45 min',
      tags: ['Indian', 'Vegetarian', 'Spicy', 'Dinner']
    },
    {
      id: 5,
      name: 'Grilled Salmon',
      description: 'Simple grilled salmon with herbs and lemon',
      image: 'https://via.placeholder.com/300x200/FFEAA7/FFFFFF?text=Salmon',
      calories: 420,
      cookTime: '15 min',
      tags: ['Seafood', 'Healthy', 'Quick', 'Dinner']
    },
    {
      id: 6,
      name: 'Chocolate Cake',
      description: 'Rich and moist chocolate cake with frosting',
      image: 'https://via.placeholder.com/300x200/DDA0DD/FFFFFF?text=Cake',
      calories: 350,
      cookTime: '60 min',
      tags: ['Dessert', 'Baking', 'Chocolate', 'Sweet']
    }
  ]

  function validateForm() {
    const newErrors = {}
    
    const validIngredients = ingredients.filter(ing => ing.trim() !== '')
    if (validIngredients.length < 4) {
      newErrors.ingredients = 'Please enter at least 4 ingredients'
    }
    
    if (!minCalories || !maxCalories) {
      newErrors.calories = 'Please enter both minimum and maximum calories'
    } else if (parseInt(minCalories) > parseInt(maxCalories)) {
      newErrors.calories = 'Minimum calories cannot be greater than maximum calories'
    }
    
    return newErrors
  }

  function searchRecipes() {
    const validationErrors = validateForm()
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setLoading(true)
    setSearchPerformed(true)
    
    setTimeout(() => {
      const validIngredients = ingredients.filter(ing => ing.trim() !== '')
      const minCal = parseInt(minCalories)
      const maxCal = parseInt(maxCalories)
      
      const filteredResults = sampleRecipes.filter(recipe => {
        const inCalorieRange = recipe.calories >= minCal && recipe.calories <= maxCal
        
        const hasMatchingIngredients = validIngredients.some(ingredient => {
          const ingredientLower = ingredient.toLowerCase()
          return recipe.name.toLowerCase().includes(ingredientLower) ||
                 recipe.description.toLowerCase().includes(ingredientLower) ||
                 recipe.tags.some(tag => tag.toLowerCase().includes(ingredientLower))
        })
        
        return inCalorieRange && hasMatchingIngredients
      })
      
      setResults(filteredResults)
      setLoading(false)
    }, 1000)
  }

  function clearForm() {
    setIngredients(['', '', '', ''])
    setMinCalories('')
    setMaxCalories('')
    setErrors({})
    setSearchPerformed(false)
    setResults([])
  }

  const isValid = Object.keys(validateForm()).length === 0

  return (
    <div style={{ 
      width: '100%', 
      background: '#f7f7f7', 
      padding: '3rem 0', 
      borderTop: '1px solid #eee'
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem', textAlign: 'center' }}>
          Recipe Finder
        </h2>
        <p style={{ 
          fontSize: '1.1rem', 
          maxWidth: 600, 
          textAlign: 'center', 
          color: '#555',
          margin: '0 auto 2rem auto'
        }}>
          Enter at least 4 ingredients and a calorie range to discover recipes tailored to your needs.
        </p>

        <div style={{ 
          background: 'white', 
          padding: '2rem', 
          borderRadius: 8, 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <IngredientInputList 
              ingredients={ingredients}
              setIngredients={setIngredients}
              errors={errors}
              setErrors={setErrors}
            />

            <CalorieRangeInput 
              minCalories={minCalories}
              maxCalories={maxCalories}
              setMinCalories={setMinCalories}
              setMaxCalories={setMaxCalories}
              errors={errors}
              setErrors={setErrors}
            />

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                onClick={clearForm}
                style={{ 
                  padding: '0.7rem 1.5rem', 
                  background: '#f0f0f0', 
                  color: '#222', 
                  border: '1px solid #ddd', 
                  borderRadius: 4, 
                  cursor: 'pointer' 
                }}
              >
                Clear
              </button>
              <button
                onClick={searchRecipes}
                disabled={!isValid || loading}
                style={{ 
                  padding: '0.7rem 1.5rem', 
                  background: isValid && !loading ? '#222' : '#ccc', 
                  color: '#fff', 
                  border: 'none', 
                  borderRadius: 4, 
                  cursor: isValid && !loading ? 'pointer' : 'not-allowed' 
                }}
              >
                {loading ? 'Searching...' : 'Find Recipes'}
              </button>
            </div>
          </div>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '1.1rem', color: '#666' }}>
              Searching for recipes...
            </div>
          </div>
        )}

        <SearchResults 
          results={results}
          searchPerformed={searchPerformed}
        />
      </div>
    </div>
  )
}

export default RecipeFinder 