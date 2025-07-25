import React from 'react';
import './SuggestedAutofillBox.css';

const SuggestedAutofillBox = ({ data, onUseIngredients, onUseInstructions, onUseStats, onUseImage, onUseDescription, onUseCategory, onUseDifficulty, onUseTags, onUseYoutubeUrl }) => {
  if (!data || (!data.ingredients?.length && !data.instructions?.length)) return null;

  return (
    <div className="autofill-box">
      <h3>🍽 Suggested Recipe Details</h3>
      {data.title && (
        <h4 style={{ marginTop: '0.5rem', marginBottom: '1rem', color: '#666' }}>
          "{data.title}"
        </h4>
      )}

      {data.image && (
        <div className="autofill-image">
          <img src={data.image} alt="Suggested dish" />
        </div>
      )}

      {data.image && onUseImage && (
        <div style={{ marginBottom: '1rem' }}>
          <button onClick={() => onUseImage(data.image)}>Use This Image</button>
        </div>
      )}

      {data.description && onUseDescription && (
        <div style={{ marginBottom: '1rem' }}>
          <div><strong>Description:</strong> {data.description}</div>
          <button onClick={() => onUseDescription(data.description)}>Use This Description</button>
        </div>
      )}

      {data.category && onUseCategory && (
        <div style={{ marginBottom: '1rem' }}>
          <div><strong>Category:</strong> {data.category}</div>
          <button onClick={() => onUseCategory(data.category)}>Use This Category</button>
        </div>
      )}

      {data.difficulty && onUseDifficulty && (
        <div style={{ marginBottom: '1rem' }}>
          <div><strong>Difficulty:</strong> {data.difficulty}</div>
          <button onClick={() => onUseDifficulty(data.difficulty)}>Use This Difficulty</button>
        </div>
      )}

      {data.tags && onUseTags && (
        <div style={{ marginBottom: '1rem' }}>
          <div><strong>Tags:</strong> {data.tags}</div>
          <button onClick={() => onUseTags(data.tags)}>Use These Tags</button>
        </div>
      )}

      {data.youtube_url && onUseYoutubeUrl && (
        <div style={{ marginBottom: '1rem' }}>
          <div><strong>YouTube URL:</strong> <a href={data.youtube_url} target="_blank" rel="noopener noreferrer">{data.youtube_url}</a></div>
          <button onClick={() => onUseYoutubeUrl(data.youtube_url)}>Use This YouTube URL</button>
        </div>
      )}

      {data.ingredients?.length > 0 && (
        <div>
          <h4>Ingredients</h4>
          <ul>
            {data.ingredients.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
          <button onClick={() => onUseIngredients(data.ingredients)}>Use These Ingredients</button>
        </div>
      )}

      {data.instructions && (
        <div>
          <h4>Instructions</h4>
          {data.instructions.length > 0 ? (
            <>
              <ol>
                {data.instructions.map((step, i) => <li key={i}>{step}</li>)}
              </ol>
              <button onClick={() => onUseInstructions(data.instructions)}>Use These Instructions</button>
            </>
          ) : (
            <p style={{ color: '#666', fontStyle: 'italic' }}>No instructions available</p>
          )}
        </div>
      )}

      {(data.cookingStats?.readyInMinutes || data.cookingStats?.calories || data.cookingStats?.servings) && (
        <div>
          <h4>Recipe Stats</h4>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            {data.cookingStats?.readyInMinutes && <span><strong>Cooking Time:</strong> {data.cookingStats.readyInMinutes} min</span>}
            {data.cookingStats?.calories && <span><strong>Calories:</strong> {Math.round(data.cookingStats.calories)}</span>}
            {data.cookingStats?.servings && <span><strong>Servings:</strong> {data.cookingStats.servings}</span>}
          </div>
          <button onClick={() => onUseStats && onUseStats(data.cookingStats)}>Use These Stats</button>
        </div>
      )}
    </div>
  );
};

export default SuggestedAutofillBox; 