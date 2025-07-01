import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  FiClock, 
  FiUsers, 
  FiTarget, 
  FiHeart, 
  FiShare2, 
  FiArrowLeft,
  FiCheck,
  FiChevronDown,
  FiChevronUp
} from 'react-icons/fi'
import SimilarRecipes from '../components/SimilarRecipes'
import './RecipeDetail.css'

function RecipeDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [recipe, setRecipe] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saved, setSaved] = useState(false)
  const [checkedIngredients, setCheckedIngredients] = useState([])
  const [expandedInstructions, setExpandedInstructions] = useState(true)
  const [showShareToast, setShowShareToast] = useState(false)

  useEffect(() => {
    fetchRecipeDetails()
    // Check if recipe is saved in localStorage
    const savedRecipes = JSON.parse(localStorage.getItem('savedRecipes') || '[]')
    setSaved(savedRecipes.includes(parseInt(id)))
  }, [id])

  async function fetchRecipeDetails() {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`http://localhost:5000/api/spoonacular/recipe/${id}`)
      const data = await response.json()
      
      if (response.ok) {
        setRecipe(data)
      } else {
        setError(data.error || 'Failed to fetch recipe details')
      }
    } catch (error) {
      console.error('Error fetching recipe:', error)
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleSaveRecipe() {
    const savedRecipes = JSON.parse(localStorage.getItem('savedRecipes') || '[]')
    
    if (saved) {
      // Remove from saved
      const updatedRecipes = savedRecipes.filter(recipeId => recipeId !== parseInt(id))
      localStorage.setItem('savedRecipes', JSON.stringify(updatedRecipes))
      setSaved(false)
    } else {
      // Add to saved
      savedRecipes.push(parseInt(id))
      localStorage.setItem('savedRecipes', JSON.stringify(savedRecipes))
      setSaved(true)
    }
  }

  async function handleShareRecipe() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: recipe.title,
          text: `Check out this recipe: ${recipe.title}`,
          url: window.location.href,
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      setShowShareToast(true)
      setTimeout(() => setShowShareToast(false), 2000)
    }
  }

  function toggleIngredient(index) {
    setCheckedIngredients(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }

  function getDifficulty() {
    if (!recipe) return 'Medium'
    const time = recipe.readyInMinutes
    if (time <= 30) return 'Easy'
    if (time <= 60) return 'Medium'
    return 'Hard'
  }

  if (loading) {
    return (
      <div className="recipe-detail-loading">
        <div className="loading-spinner"></div>
        <p>Loading recipe details...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="recipe-detail-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/recipes')} className="btn-back">
          <FiArrowLeft /> Back to Recipes
        </button>
      </div>
    )
  }

  if (!recipe) {
    return (
      <div className="recipe-detail-error">
        <h2>Recipe Not Found</h2>
        <p>The recipe you're looking for doesn't exist.</p>
        <button onClick={() => navigate('/recipes')} className="btn-back">
          <FiArrowLeft /> Back to Recipes
        </button>
      </div>
    )
  }

  return (
    <div className="recipe-detail">
      <div className="recipe-detail-container">
        {/* Header with Back Button */}
        <div className="recipe-detail-header">
          <button onClick={() => navigate(-1)} className="btn-back">
            <FiArrowLeft /> Back
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="recipe-detail-content">
          {/* Left Column - Image and Basic Info */}
          <div className="recipe-detail-left">
            <div className="recipe-detail-image-container">
              <img 
                src={recipe.image} 
                alt={recipe.title}
                className="recipe-detail-image"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/600x400/CCCCCC/666666?text=No+Image'
                }}
              />
            </div>

            {/* Recipe Stats with Icons */}
            <div className="recipe-detail-stats">
              <div className="stat-item">
                <FiClock className="stat-icon" />
                <span className="stat-label">Prep Time</span>
                <span className="stat-value">{recipe.readyInMinutes} min</span>
              </div>
              <div className="stat-item">
                <FiUsers className="stat-icon" />
                <span className="stat-label">Servings</span>
                <span className="stat-value">{recipe.servings}</span>
              </div>
              <div className="stat-item">
                <FiTarget className="stat-icon" />
                <span className="stat-label">Difficulty</span>
                <span className="stat-value">{getDifficulty()}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="recipe-actions">
              <button 
                onClick={handleSaveRecipe}
                className={`btn-save ${saved ? 'saved' : ''}`}
              >
                <FiHeart className={saved ? 'filled' : ''} />
                {saved ? 'Saved' : 'Save Recipe'}
              </button>
              <button onClick={handleShareRecipe} className="btn-share">
                <FiShare2 />
                Share
              </button>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="recipe-detail-right">
            <h1 className="recipe-detail-title">{recipe.title}</h1>

            {/* Tags */}
            {(recipe.cuisines?.length > 0 || recipe.dishTypes?.length > 0) && (
              <div className="recipe-tags">
                {recipe.cuisines?.map((cuisine, index) => (
                  <span key={index} className="tag cuisine-tag">{cuisine}</span>
                ))}
                {recipe.dishTypes?.map((dishType, index) => (
                  <span key={index} className="tag dish-tag">{dishType}</span>
                ))}
              </div>
            )}

            {/* Summary */}
            <div className="recipe-detail-summary">
              <h3>About this recipe</h3>
              <div 
                className="summary-content"
                dangerouslySetInnerHTML={{ __html: recipe.summary }}
              />
            </div>

            {/* Ingredients */}
            <div className="recipe-detail-section">
              <h3>Ingredients</h3>
              <div className="ingredients-container">
                <ul className="ingredients-list">
                  {recipe.extendedIngredients?.map((ingredient, index) => (
                    <li 
                      key={index} 
                      className={`ingredient-item ${checkedIngredients.includes(index) ? 'checked' : ''}`}
                      onClick={() => toggleIngredient(index)}
                    >
                      <div className="ingredient-checkbox">
                        {checkedIngredients.includes(index) && <FiCheck />}
                      </div>
                      <span className="ingredient-amount">
                        {ingredient.amount} {ingredient.unit}
                      </span>
                      <span className="ingredient-name">{ingredient.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Instructions */}
            <div className="recipe-detail-section">
              <div className="section-header">
                <h3>Instructions</h3>
                <button 
                  onClick={() => setExpandedInstructions(!expandedInstructions)}
                  className="btn-toggle"
                >
                  {expandedInstructions ? <FiChevronUp /> : <FiChevronDown />}
                </button>
              </div>
              <div className={`instructions-content ${expandedInstructions ? 'expanded' : 'collapsed'}`}>
                {recipe.analyzedInstructions?.[0]?.steps ? (
                  <ol className="instructions-list">
                    {recipe.analyzedInstructions[0].steps.map((step, index) => (
                      <li key={index} className="instruction-step">
                        <span className="step-number">{index + 1}</span>
                        <span className="step-text">{step.step}</span>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <div 
                    className="instructions-text"
                    dangerouslySetInnerHTML={{ __html: recipe.instructions }}
                  />
                )}
              </div>
            </div>

            {/* Nutrition Information */}
            {recipe.nutrition?.nutrients && (
              <div className="recipe-detail-section">
                <h3>Nutrition Information</h3>
                <div className="nutrition-grid">
                  {recipe.nutrition.nutrients.slice(0, 8).map((nutrient, index) => (
                    <div key={index} className="nutrition-item">
                      <span className="nutrition-name">{nutrient.name}</span>
                      <span className="nutrition-value">
                        {nutrient.amount} {nutrient.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Share Toast */}
        {showShareToast && (
          <div className="toast">
            <p>Link copied to clipboard!</p>
          </div>
        )}

        {/* Similar Recipes */}
        <SimilarRecipes recipeId={id} />
      </div>
    </div>
  )
}

export default RecipeDetail 