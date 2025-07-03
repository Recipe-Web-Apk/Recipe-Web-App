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
      
      const response = await fetch(`http://localhost:5000/api/recipes/${id}`)
      const data = await response.json()
      
      if (response.ok) {
        setRecipe(data.recipe)
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
    const ingredientCount = recipe.ingredients?.length || 0
    if (ingredientCount <= 5) return 'Easy'
    if (ingredientCount <= 10) return 'Medium'
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
                src={recipe.image || 'https://via.placeholder.com/600x400/CCCCCC/666666?text=No+Image'} 
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
                <FiUsers className="stat-icon" />
                <span className="stat-label">Author</span>
                <span className="stat-value">{recipe.user?.username || 'Unknown'}</span>
              </div>
              <div className="stat-item">
                <FiTarget className="stat-icon" />
                <span className="stat-label">Difficulty</span>
                <span className="stat-value">{getDifficulty()}</span>
              </div>
              <div className="stat-item">
                <FiClock className="stat-icon" />
                <span className="stat-label">Ingredients</span>
                <span className="stat-value">{recipe.ingredients?.length || 0}</span>
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

            {/* Description */}
            <div className="recipe-detail-summary">
              <h3>About this recipe</h3>
              <p className="summary-content">{recipe.description}</p>
            </div>

            {/* Ingredients */}
            <div className="recipe-detail-section">
              <h3>Ingredients</h3>
              <div className="ingredients-container">
                <ul className="ingredients-list">
                  {recipe.ingredients?.map((ingredient, index) => (
                    <li 
                      key={index} 
                      className={`ingredient-item ${checkedIngredients.includes(index) ? 'checked' : ''}`}
                      onClick={() => toggleIngredient(index)}
                    >
                      <div className="ingredient-checkbox">
                        {checkedIngredients.includes(index) && <FiCheck />}
                      </div>
                      <span className="ingredient-name">{ingredient}</span>
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
                <div className="instructions-text">
                  {recipe.instructions}
                </div>
              </div>
            </div>
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