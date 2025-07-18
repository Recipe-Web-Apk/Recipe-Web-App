import React from 'react';
import './SuggestedAutofillBox.css';

const SuggestedAutofillBox = ({ data, onUseIngredients, onUseInstructions }) => {
  if (!data || (!data.ingredients?.length && !data.instructions?.length)) return null;

  return (
    <div className="autofill-box">
      <h3>🍽 Suggested Recipe Details</h3>

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

      {data.readyInMinutes && (
        <p><strong>Ready In:</strong> {data.readyInMinutes} minutes</p>
      )}
    </div>
  );
};

export default SuggestedAutofillBox; 