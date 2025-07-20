import React from 'react';
import './SuggestedAutofillBox.css';

const SuggestedAutofillBox = ({ data, onUseIngredients, onUseInstructions, onUseStats }) => {
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

      {data.ingredients?.length > 0 && (
        <div>
          <h4>Ingredients</h4>
          <ul>
            {data.ingredients.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
          <button onClick={() => onUseIngredients(data.ingredients)}>Use These Ingredients</button>
        </div>
      )}

      {data.instructions?.length > 0 && (
        <div>
          <h4>Instructions</h4>
          <ol>
            {data.instructions.map((step, i) => <li key={i}>{step}</li>)}
          </ol>
          <button onClick={() => onUseInstructions(data.instructions)}>Use These Instructions</button>
        </div>
      )}

      {(data.readyInMinutes || data.calories || data.servings) && (
        <div>
          <h4>Recipe Stats</h4>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            {data.readyInMinutes && <span><strong>Cooking Time:</strong> {data.readyInMinutes} min</span>}
            {data.calories && <span><strong>Calories:</strong> {Math.round(data.calories)}</span>}
            {data.servings && <span><strong>Servings:</strong> {data.servings}</span>}
          </div>
          <button onClick={() => onUseStats && onUseStats(data)}>Use These Stats</button>
        </div>
      )}
    </div>
  );
};

export default SuggestedAutofillBox; 