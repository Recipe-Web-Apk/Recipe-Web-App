import React from 'react';
import { Link } from 'react-router-dom';
import './RecipeCard.css';

function RecipeCard({ recipe, onDelete, onEdit, allowEdit, allowDelete, onFavorite, isFavorite }) {
  return (
    <article className="card recipe-card" tabIndex={0} aria-label={recipe.title}>
      <Link to={`/recipes/${recipe.id}`} tabIndex={-1}>
        <img
          src={recipe.image || 'https://via.placeholder.com/400x300?text=No+Image'}
          alt={recipe.title}
          className="recipe-card-image"
        />
      </Link>
      <div className="recipe-card-body">
        <h2 className="recipe-card-title" title={recipe.title}>{recipe.title}</h2>
        <div className="recipe-card-meta">
          {recipe.readyInMinutes && <span>{recipe.readyInMinutes} min</span>}
          {recipe.servings && <span>{recipe.servings} servings</span>}
        </div>
        {recipe.summary && (
          <div className="recipe-card-description">
            {recipe.summary.replace(/<[^>]+>/g, '').slice(0, 120)}{recipe.summary.length > 120 ? '...' : ''}
          </div>
        )}
        <div className="recipe-card-actions">
          <Link to={`/recipes/${recipe.id}`} className="recipe-card-btn">
            View
          </Link>
          {allowEdit && (
            <button className="recipe-card-btn" onClick={() => onEdit(recipe.id)}>
              Edit
            </button>
          )}
          {allowDelete && (
            <button className="recipe-card-btn" onClick={() => onDelete(recipe.id)}>
              Delete
            </button>
          )}
          {onFavorite && (
            <button
              className={`recipe-card-favorite${isFavorite ? ' filled' : ''}`}
              onClick={() => onFavorite(recipe.id)}
              aria-label={isFavorite ? 'Unfavorite' : 'Favorite'}
              title={isFavorite ? 'Unfavorite' : 'Favorite'}
              type="button"
            >
              {isFavorite ? '\u2665' : '\u2661'}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export default RecipeCard; 