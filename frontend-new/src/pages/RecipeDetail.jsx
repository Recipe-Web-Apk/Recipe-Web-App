import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiClock, FiUsers, FiTarget, FiHeart, FiShare2, FiArrowLeft, FiPlay, FiYoutube } from 'react-icons/fi';
import SimilarRecipes from '../components/SimilarRecipes';
import { supabase } from '../supabaseClient';
import './RecipeDetail.css';

function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  const [checkedIngredients, setCheckedIngredients] = useState([]);
  const [showShareToast, setShowShareToast] = useState(false);
  const [dataSource, setDataSource] = useState('spoonacular');

  useEffect(() => {
    fetchRecipeDetails();
    const savedRecipes = JSON.parse(localStorage.getItem('savedRecipes') || '[]');
    setSaved(savedRecipes.includes(parseInt(id)));
  }, [id]);

  async function fetchRecipeDetails() {
    try {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`http://localhost:5000/api/spoonacular/recipe/${id}`);
        if (response.ok) {
          const data = await response.json();
          setRecipe(data);
          setDataSource('spoonacular');
          return;
        }
      } catch (error) {}
      try {
        const { data, error: supabaseError } = await supabase
          .from('recipes')
          .select('*')
          .eq('id', id)
          .single();
        if (supabaseError) throw supabaseError;
        if (data) {
          setRecipe(data);
          setDataSource('supabase');
          return;
        }
      } catch (error) {}
      setError('Recipe not found');
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleSaveRecipe() {
    const savedRecipes = JSON.parse(localStorage.getItem('savedRecipes') || '[]');
    if (saved) {
      const updatedRecipes = savedRecipes.filter(recipeId => recipeId !== parseInt(id));
      localStorage.setItem('savedRecipes', JSON.stringify(updatedRecipes));
      setSaved(false);
    } else {
      savedRecipes.push(parseInt(id));
      localStorage.setItem('savedRecipes', JSON.stringify(savedRecipes));
      setSaved(true);
    }
  }

  async function handleShareRecipe() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: recipe.title,
          text: `Check out this recipe: ${recipe.title}`,
          url: window.location.href,
        });
      } catch (error) {}
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 2000);
    }
  }

  function toggleIngredient(index) {
    setCheckedIngredients(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  }

  function getDifficulty() {
    if (!recipe) return 'Medium';
    const ingredientCount = recipe.ingredients?.length || 0;
    if (ingredientCount <= 5) return 'Easy';
    if (ingredientCount <= 10) return 'Medium';
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

  if (loading) {
    return (
      <div className="recipe-detail-page">
        <div className="card recipe-detail-container">
          <div className="loading-state">
            <div className="loading-spinner">
              <div className="spinner"></div>
              <span>Loading recipe details...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="recipe-detail-page">
        <div className="card recipe-detail-container">
          <div className="error-state">
            <div className="error-state-icon">⚠️</div>
            <h2 className="error-state-title">Error</h2>
            <p className="error-state-description">{error}</p>
            <button onClick={() => navigate('/recipes')} className="back-button">
              <FiArrowLeft /> Back to Recipes
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="recipe-detail-page">
        <div className="card recipe-detail-container">
          <div className="error-state">
            <div className="error-state-icon">🔍</div>
            <h2 className="error-state-title">Recipe Not Found</h2>
            <p className="error-state-description">The recipe you're looking for doesn't exist.</p>
            <button onClick={() => navigate('/recipes')} className="back-button">
              <FiArrowLeft /> Back to Recipes
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="recipe-detail-page">
      <div className="card recipe-detail-container">
        <button onClick={() => navigate(-1)} className="back-button">
          <FiArrowLeft /> Back
        </button>
        <div className="card recipe-detail-header">
          <div className="recipe-hero">
            {recipe.image && (
              <img
                src={recipe.image}
                alt={recipe.title}
                className="recipe-hero-image"
              />
            )}
            <div className="recipe-hero-overlay"></div>
            <div className="recipe-hero-content">
              <h1 className="recipe-title">{recipe.title}</h1>
              {recipe.summary && (
                <p className="recipe-subtitle">
                  {stripHtml(recipe.summary).substring(0, 200)}...
                </p>
              )}
              <div className="recipe-meta">
                {recipe.readyInMinutes && (
                  <div className="recipe-meta-item">
                    <FiClock className="recipe-meta-icon" />
                    <span>{recipe.readyInMinutes} min</span>
                  </div>
                )}
                {recipe.servings && (
                  <div className="recipe-meta-item">
                    <FiUsers className="recipe-meta-icon" />
                    <span>{recipe.servings} servings</span>
                  </div>
                )}
                <div className="recipe-meta-item">
                  <FiTarget className="recipe-meta-icon" />
                  <span>{getDifficulty()}</span>
                </div>
                {recipe.youtube_url && (
                  <div className="recipe-meta-item">
                    <FiYoutube className="recipe-meta-icon" />
                    <span>Video Available</span>
                  </div>
                )}
              </div>
              <div className="recipe-actions">
                <button
                  onClick={handleSaveRecipe}
                  className={`btn ${saved ? 'btn-secondary' : 'btn-primary'}`}
                >
                  <FiHeart className={saved ? 'filled' : ''} />
                  {saved ? 'Saved' : 'Save Recipe'}
                </button>
                <button onClick={handleShareRecipe} className="btn btn-secondary">
                  <FiShare2 /> Share
                </button>
                {recipe.youtube_url && (
                  <button onClick={openYouTubeVideo} className="btn btn-secondary">
                    <FiPlay /> Watch Video
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="card recipe-info">
          <div className="recipe-info-grid">
            <div className="recipe-section">
              <div className="section-header">
                <h2 className="section-title">Ingredients</h2>
              </div>
              <div className="section-content">
                <ul className="ingredients-list">
                  {recipe.ingredients?.map((ingredient, index) => (
                    <li key={index} className="ingredient-item">
                      <input
                        type="checkbox"
                        className="ingredient-checkbox"
                        checked={checkedIngredients.includes(index)}
                        onChange={() => toggleIngredient(index)}
                      />
                      <span className="ingredient-text">
                        {ingredient.original || ingredient}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="recipe-section">
              <div className="section-header">
                <h2 className="section-title">Instructions</h2>
              </div>
              <div className="section-content">
                <ol className="instructions-list">
                  {recipe.instructions?.split('\n').filter(step => step.trim()).map((step, index) => (
                    <li key={index} className="instruction-item">
                      <div className="instruction-number"></div>
                      <div className="instruction-text">
                        {stripHtml(step.trim())}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
          {recipe.nutrition && (
            <div className="card recipe-nutrition">
              <h3 className="nutrition-title">
                Nutrition Information
              </h3>
              <div className="nutrition-grid">
                {recipe.nutrition.nutrients?.slice(0, 8).map((nutrient, index) => (
                  <div key={index} className="nutrition-item">
                    <div className="nutrition-value">
                      {Math.round(nutrient.amount)}{nutrient.unit}
                    </div>
                    <div className="nutrition-label">{nutrient.name}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="recipe-actions-bottom">
            <button
              onClick={handleSaveRecipe}
              className={`btn ${saved ? 'btn-secondary' : 'btn-primary'}`}
            >
              <FiHeart className={saved ? 'filled' : ''} />
              {saved ? 'Recipe Saved' : 'Save This Recipe'}
            </button>
            <button onClick={handleShareRecipe} className="btn btn-secondary">
              <FiShare2 /> Share Recipe
            </button>
            {recipe.youtube_url && (
              <button onClick={openYouTubeVideo} className="btn btn-secondary">
                <FiPlay /> Watch Video Tutorial
              </button>
            )}
          </div>
        </div>
        {dataSource === 'spoonacular' && <SimilarRecipes recipeId={id} />}
        {showShareToast && (
          <div className="toast">
            Recipe link copied to clipboard!
          </div>
        )}
      </div>
    </div>
  );
}

export default RecipeDetail; 