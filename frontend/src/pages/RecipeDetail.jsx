import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useDarkMode } from '../contexts/DarkModeContext'
import { useAuth } from '../contexts/AuthContext'
import { 
  FiClock, 
  FiUsers, 
  FiTarget, 
  FiShare2, 
  FiArrowLeft,
  FiCheck,
  FiChevronDown,
  FiChevronUp,
  FiYoutube,
  FiCalendar,
  FiZap
} from 'react-icons/fi'
import SimilarRecipes from '../components/SimilarRecipes'
import IngredientTooltip from '../components/IngredientTooltip'
import NutritionDisplay from '../components/NutritionDisplay'
import CookingDetails from '../components/CookingDetails'
import { extractCalories, formatCalories } from '../utils/calorieUtils'
import './RecipeDetail.css'
import axiosInstance from '../api/axiosInstance';
import SaveRecipeButton from '../components/SaveRecipeButton';
import LikeButton from '../components/LikeButton';

function RecipeDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation();
  const source = location.state?.source;
  const passedRecipeData = location.state?.recipeData;
  const { isDarkMode } = useDarkMode()
  const { token } = useAuth();
  const [recipe, setRecipe] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [checkedIngredients, setCheckedIngredients] = useState([])
  const [expandedInstructions, setExpandedInstructions] = useState(true)
  const [showShareToast, setShowShareToast] = useState(false)
  const [dataSource, setDataSource] = useState('spoonacular') // Default to spoonacular

  const fetchRecipeDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      if (source === 'user') {
        const response = await axiosInstance.get(`/recipes/${id}`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (response.data.recipe) {
          setRecipe(response.data.recipe);
          setDataSource('user');
          return;
        }
        setError('Recipe not found or you do not have permission to view it');
        return;
      }
      if (source === 'spoonacular') {
        const response = await axiosInstance.get(`/spoonacular/recipe/${id}`);
        if (response.data) {
          setRecipe(response.data);
          setDataSource('spoonacular');
          return;
        }
        setError('Recipe not found');
        return;
      }
      // Default to spoonacular if no source specified
      const response = await axiosInstance.get(`/spoonacular/recipe/${id}`);
      if (response.data) {
        setRecipe(response.data);
        setDataSource('spoonacular');
      } else {
        setError('Recipe not found');
      }
    } catch (error) {
      console.error('Error fetching recipe details:', error);
      setError('Failed to load recipe');
    } finally {
      setLoading(false);
    }
  }, [id, source, token]);

  useEffect(() => {
    if (passedRecipeData) {
      // Ensure recipe.id is set for API liked recipes
      let recipeObj = { ...passedRecipeData };
      if (!recipeObj.id && recipeObj.recipe_id) {
        recipeObj.id = recipeObj.recipe_id;
      }
      // Detect if it's an API recipe (spoonacular)
      const isApiRecipe = recipeObj.readyInMinutes !== undefined || recipeObj.spoonacularSourceUrl !== undefined;
      setRecipe(recipeObj);
      setDataSource(source || (isApiRecipe ? 'spoonacular' : 'user'));
      setLoading(false);
    } else {
      fetchRecipeDetails();
    }
    // Check if recipe is saved in localStorage - removed for now
    // const savedRecipes = JSON.parse(localStorage.getItem('savedRecipes') || '[]');
    // setSaved(savedRecipes.includes(parseInt(id)));
  }, [id, passedRecipeData, source, fetchRecipeDetails]);

  // Record a view when the recipe is loaded and user is logged in
  useEffect(() => {
    if (recipe && recipe.id && token) {
      axiosInstance.post('/views', { recipe_id: recipe.id }, {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(err => {
        // Silent fail, but log for debugging
        console.warn('Failed to record view:', err);
      });
    }
  }, [recipe, token]);

  function toggleIngredient(index) {
    setCheckedIngredients(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  }

  function getDifficulty() {
    if (!recipe.readyInMinutes) return 'Unknown';
    if (recipe.readyInMinutes <= 15) return 'Easy';
    if (recipe.readyInMinutes <= 30) return 'Medium';
    return 'Hard';
  }

  function openYouTubeVideo() {
    if (recipe.youtube_url) {
      window.open(recipe.youtube_url, '_blank');
    }
  }

  function stripHtml(html) {
    if (!html) return '';
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }

  async function handleShareRecipe() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: recipe.title,
          text: `Check out this recipe: ${recipe.title}`,
          url: window.location.href,
        });
      } catch (error) {
        // Silent fail
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 2000);
    }
  }

  // Helper function to extract ingredients properly
  function getIngredients() {
    if (!recipe) return []
    
    // Handle different data sources
    if (dataSource === 'spoonacular') {
      // Spoonacular API format
      if (recipe.extendedIngredients && Array.isArray(recipe.extendedIngredients)) {
        return recipe.extendedIngredients.map(ing => ing.original || ing.name || '')
      }
      if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
        return recipe.ingredients
      }
    } else {
      // Supabase format - ingredients might be stored as JSON string
      if (recipe.ingredients) {
        if (typeof recipe.ingredients === 'string') {
          try {
            return JSON.parse(recipe.ingredients)
          } catch {
            return recipe.ingredients.split(',').map(ing => ing.trim())
          }
        }
        if (Array.isArray(recipe.ingredients)) {
          return recipe.ingredients
        }
      }
    }
    
    return []
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

  // Debug log for recipe object
  

  return (
    <div className={`recipe-detail ${isDarkMode ? 'dark-mode' : ''}`}>
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
                src={recipe.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjMwMCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4='}
                alt={recipe.title}
                className="recipe-detail-image"
                onError={e => { 
                  e.target.onerror = null; 
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjMwMCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4='; 
                }}
              />
              
              {/* YouTube Video Button */}
              {recipe.youtube_url && (
                <div className="youtube-video-container">
                  <button 
                    onClick={openYouTubeVideo}
                    className="youtube-video-btn"
                    title="Watch cooking video"
                  >
                    <FiYoutube />
                    <span>Watch Video</span>
                  </button>
                </div>
              )}
            </div>

            {/* Recipe Stats with Icons */}
            <div className="recipe-detail-stats">
              {/* First Row */}
              <div className="stat-item">
                <FiUsers className="stat-icon" />
                <span className="stat-label">Servings</span>
                <span className="stat-value">{recipe.servings || recipe.yield || 'N/A'}</span>
              </div>
              <div className="stat-item">
                <FiZap className="stat-icon" />
                <span className="stat-label">Calories</span>
                <span className="stat-value">{formatCalories(extractCalories(recipe))}</span>
              </div>
              <div className="stat-item">
                <FiClock className="stat-icon" />
                <span className="stat-label">Total Time</span>
                <span className="stat-value">
                  {(() => {
                    const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0) + (recipe.readyInMinutes || 0)
                    return totalTime > 0 ? `${totalTime} min` : 'N/A'
                  })()}
                </span>
              </div>
              
              {/* Second Row */}
              <div className="stat-item">
                <FiCalendar className="stat-icon" />
                <span className="stat-label">Prep Time</span>
                <span className="stat-value">{recipe.prepTime ? `${recipe.prepTime} min` : 'N/A'}</span>
              </div>
              <div className="stat-item">
                <FiClock className="stat-icon" />
                <span className="stat-label">Cook Time</span>
                <span className="stat-value">{recipe.cookTime ? `${recipe.cookTime} min` : 'N/A'}</span>
              </div>
              <div className="stat-item">
                <FiTarget className="stat-icon" />
                <span className="stat-label">Difficulty</span>
                <span className="stat-value">{getDifficulty()}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="recipe-actions">
              <SaveRecipeButton recipe={recipe} />
              <LikeButton recipe={recipe} />
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
              <p className="summary-content">{stripHtml(recipe.description || recipe.summary)}</p>
            </div>

            {/* Recipe Details */}
            {(recipe.category || recipe.cuisine || recipe.diet || recipe.tags) && (
              <div className="recipe-detail-section">
                <h3>Recipe Details</h3>
                <div className="recipe-tags">
                  {recipe.category && (
                    <span className="tag category-tag">{recipe.category}</span>
                  )}
                  {recipe.cuisine && (
                    <span className="tag cuisine-tag">{recipe.cuisine}</span>
                  )}
                  {recipe.diet && (
                    <span className="tag diet-tag">{recipe.diet}</span>
                  )}
                  {recipe.tags && recipe.tags.split(',').map((tag, index) => (
                    <span key={index} className="tag">{tag.trim()}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Ingredients */}
            <div className="recipe-detail-section">
              <h3>Ingredients</h3>
              <div className="ingredients-container">
                <ul className="ingredients-list">
                  {getIngredients().map((ingredient, index) => {
                    let ingredientText = ingredient
                    const cleanIngredient = stripHtml(ingredientText)
                    
                    return (
                      <li 
                        key={index} 
                        className={`ingredient-item ${checkedIngredients.includes(index) ? 'checked' : ''}`}
                        onClick={() => toggleIngredient(index)}
                      >
                        <div className="ingredient-checkbox">
                          {checkedIngredients.includes(index) && <FiCheck />}
                        </div>
                        <IngredientTooltip ingredient={cleanIngredient}>
                          <span className="ingredient-name">
                            {cleanIngredient}
                          </span>
                        </IngredientTooltip>
                      </li>
                    )
                  })}
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
                  {stripHtml(recipe.instructions)}
                </div>
              </div>
            </div>

            {/* Cooking Details */}
            <CookingDetails recipe={recipe} />
            
            {/* Nutrition Information */}
            <NutritionDisplay recipe={recipe} />
          </div>
        </div>

        {/* Share Toast */}
        {showShareToast && (
          <div className="toast">
            <p>Link copied to clipboard!</p>
          </div>
        )}

        {/* Similar Recipes */}
        {dataSource === 'user' && (
          <SimilarRecipes recipeId={recipe?.id || recipe?.recipe_id || id} />
        )}
      </div>
    </div>
  )
}

export default RecipeDetail; 
