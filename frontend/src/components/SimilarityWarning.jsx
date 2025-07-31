import React from 'react';
import './SimilarityWarning.css';

const SimilarityWarning = ({ 
  warning, 
  onIgnore, 
  onViewRecipe, 
  onUseAutofill,
  autofillSuggestion,
  currentRecipeData 
}) => {
  if (!warning || !warning.matches || !Array.isArray(warning.matches)) {
    console.warn('Invalid warning prop:', warning);
    return null;
  }

  // Debug logging to see the actual data structure
  

  const handleIgnore = () => {
    onIgnore();
  };

  const handleUseAutofill = () => {
    if (autofillSuggestion) {
      onUseAutofill(autofillSuggestion);
    }
  };

  const getWarningIcon = () => {
    switch (warning.type) {
      case 'high_similarity':
        return '⚠️';
      case 'moderate_similarity':
        return 'ℹ️';
      default:
        return '💡';
    }
  };

  const getWarningClass = () => {
    switch (warning.type) {
      case 'high_similarity':
        return 'similarity-warning--high';
      case 'moderate_similarity':
        return 'similarity-warning--moderate';
      default:
        return 'similarity-warning--info';
    }
  };

  const formatSimilarityScore = (score) => {
    return Math.round(score * 100);
  };

  return (
    <div className={`similarity-warning ${getWarningClass()}`}>
      <div className="similarity-warning__header">
        <span className="similarity-warning__icon">{getWarningIcon()}</span>
        <h3 className="similarity-warning__title">Similar Recipe Found</h3>
      </div>
      
      <p className="similarity-warning__message">{warning.message}</p>
      
      <div className="similarity-warning__matches">
        {warning.matches && warning.matches.map((match, index) => {
          // Defensive programming - handle malformed data
          if (!match || !match.recipe) {
            console.warn('Malformed match data:', match);
            return null;
          }
          
          return (
            <div key={index} className="similarity-match">
              <div className="similarity-match__header">
                <h4 className="similarity-match__title">{match.recipe.title || 'Untitled Recipe'}</h4>
                <span className="similarity-match__score">
                  {formatSimilarityScore(match.score || 0)}% similar
                </span>
              </div>
            
            <div className="similarity-match__details">
              {match.recipe.cuisine && (
                <span className="similarity-match__tag">{match.recipe.cuisine}</span>
              )}
              {match.recipe.readyInMinutes && (
                <span className="similarity-match__tag">{match.recipe.readyInMinutes} min</span>
              )}
              {match.recipe.difficulty && (
                <span className="similarity-match__tag">{match.recipe.difficulty}</span>
              )}
            </div>
            

            
            {/* The selectedMatch and showDetails state/handlers were removed, so this block is no longer relevant */}
            {/* {selectedMatch === index && (
              <div className="similarity-match__breakdown">
                <h5>Similarity Breakdown:</h5>
                <div className="similarity-breakdown">
                  {match.breakdown && match.breakdown.map((item, idx) => {
                    if (!item || !item.feature) {
                      console.warn('Malformed breakdown item:', item);
                      return null;
                    }
                    return (
                      <div key={idx} className="similarity-breakdown__item">
                        <span className="similarity-breakdown__feature">
                          {item.feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </span>
                        <span className="similarity-breakdown__value">
                          {formatSimilarityScore(item.value || 0)}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )} */}
          </div>
        );
        })}
      </div>
      
      <div className="similarity-warning__actions">
        {autofillSuggestion && (
          <button
            className="similarity-warning__btn similarity-warning__btn--autofill"
            onClick={handleUseAutofill}
          >
            🚀 Use Autofill from Best Match
          </button>
        )}
        
        <button
          className="similarity-warning__btn similarity-warning__btn--ignore"
          onClick={handleIgnore}
        >
          Continue Anyway
        </button>
      </div>
      
      <div className="similarity-warning__info">
        <p>
          <strong>Tip:</strong> You can always edit the recipe details after creation. 
          The autofill feature will help you get started quickly with similar recipes.
        </p>
      </div>
    </div>
  );
};

export default SimilarityWarning; 