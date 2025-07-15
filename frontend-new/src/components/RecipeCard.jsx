import React from 'react';
import { Link } from 'react-router-dom';
import { FiEye, FiEdit3 } from 'react-icons/fi';
import LikeButton from './LikeButton';
import './RecipeCard.css';

function RecipeCard({ recipe, onEdit, allowEdit, onFavorite, isFavorite }) {
  return (
    <article className="recipe-card" tabIndex={0} aria-label={recipe.title}>
      <Link
        to={`/recipes/${recipe.id}`}
        tabIndex={-1}
        state={{
          source: recipe.spoonacularSourceUrl || recipe.readyInMinutes ? 'spoonacular' : 'user',
          recipeData: recipe
        }}
      >
        <img
          src={recipe.image || "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4="}
          alt={recipe.title}
          onError={e => { e.target.onerror = null; e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4="; }}
          className="recipe-image"
        />
      </Link>
      <div className="recipe-card-body">
        <h2 className="recipe-card-title" title={recipe.title}>{recipe.title}</h2>
        <div className="recipe-card-meta">
          {recipe.readyInMinutes
            ? <span>⏱ {recipe.readyInMinutes} min</span>
            : recipe.cookTime
              ? <span>⏱ {recipe.cookTime} min</span>
              : null}
          {recipe.servings && <span>🍽 {recipe.servings} servings</span>}
        </div>
        {recipe.summary ? (
          <div className="recipe-card-description">
            {recipe.summary.replace(/<[^>]+>/g, '').slice(0, 120)}{recipe.summary.length > 120 ? '...' : ''}
          </div>
        ) : recipe.description ? (
          <div className="recipe-card-description">
            {recipe.description.slice(0, 120)}{recipe.description.length > 120 ? '...' : ''}
          </div>
        ) : null}
        <div className="recipe-card-actions">
          <Link to={`/recipes/${recipe.id}`} className={`recipe-card-btn ${!allowEdit ? 'recipe-card-btn-view-only' : 'recipe-card-btn-view'}`}
            state={{
              source: recipe.spoonacularSourceUrl || recipe.readyInMinutes ? 'spoonacular' : 'user',
              recipeData: recipe
            }}
          >
            <FiEye /> View
          </Link>
          {allowEdit && (
            <button className="recipe-card-btn recipe-card-btn-edit" onClick={() => onEdit(recipe.id)}>
              <FiEdit3 /> Edit
            </button>
          )}
          <LikeButton recipe={recipe} />
          {onFavorite && (
            <button
              className={`recipe-card-favorite${isFavorite ? ' filled' : ''}`}
              onClick={() => onFavorite(recipe.id)}
              aria-label={isFavorite ? 'Unfavorite' : 'Favorite'}
              title={isFavorite ? 'Unfavorite' : 'Favorite'}
              type="button"
            >
              {isFavorite ? '♥' : '♡'}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export default RecipeCard; 