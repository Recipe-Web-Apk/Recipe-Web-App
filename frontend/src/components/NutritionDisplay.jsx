import React from 'react';
import { getCompleteNutrition, formatCalories } from '../utils/calorieUtils';
import './NutritionDisplay.css';

const NutritionDisplay = ({ recipe }) => {
  const nutrition = getCompleteNutrition(recipe);
  
  if (!nutrition) {
    return (
      <div className="nutrition-display">
        <h3>Nutrition Information</h3>
        <p className="nutrition-unavailable">Nutrition information not available for this recipe.</p>
      </div>
    );
  }

  const { calories, protein, fat, carbohydrates, fiber, sugar, sodium, percentages, isBalanced } = nutrition;

  return (
    <div className="nutrition-display">
      <h3>Nutrition Information</h3>
      
      {/* Calories Section */}
      <div className="nutrition-section">
        <div className="calories-display">
          <span className="calories-value">{formatCalories(calories)}</span>
          <span className="calories-label">per serving</span>
        </div>
      </div>

      {/* Macronutrients Section */}
      <div className="nutrition-section">
        <h4>Macronutrients</h4>
        <div className="macros-grid">
          <div className="macro-item protein">
            <div className="macro-header">
              <span className="macro-name">Protein</span>
              <span className="macro-value">{protein}g</span>
            </div>
            {percentages && (
              <div className="macro-percentage">
                <div className="percentage-bar">
                  <div 
                    className="percentage-fill protein-fill"
                    style={{ width: `${percentages.protein}%` }}
                  ></div>
                </div>
                <span className="percentage-text">{percentages.protein}%</span>
              </div>
            )}
          </div>

          <div className="macro-item fat">
            <div className="macro-header">
              <span className="macro-name">Fat</span>
              <span className="macro-value">{fat}g</span>
            </div>
            {percentages && (
              <div className="macro-percentage">
                <div className="percentage-bar">
                  <div 
                    className="percentage-fill fat-fill"
                    style={{ width: `${percentages.fat}%` }}
                  ></div>
                </div>
                <span className="percentage-text">{percentages.fat}%</span>
              </div>
            )}
          </div>

          <div className="macro-item carbs">
            <div className="macro-header">
              <span className="macro-name">Carbohydrates</span>
              <span className="macro-value">{carbohydrates}g</span>
            </div>
            {percentages && (
              <div className="macro-percentage">
                <div className="percentage-bar">
                  <div 
                    className="percentage-fill carbs-fill"
                    style={{ width: `${percentages.carbohydrates}%` }}
                  ></div>
                </div>
                <span className="percentage-text">{percentages.carbohydrates}%</span>
              </div>
            )}
          </div>
        </div>

        {/* Macro Balance Indicator */}
        {percentages && (
          <div className="macro-balance">
            <div className={`balance-indicator ${isBalanced ? 'balanced' : 'unbalanced'}`}>
              <span className="balance-icon">
                {isBalanced ? '✓' : '⚠'}
              </span>
              <span className="balance-text">
                {isBalanced ? 'Balanced Macros' : 'Macro Imbalance'}
              </span>
            </div>
            <div className="balance-details">
              <small>
                Recommended: Protein 10-35%, Fat 20-35%, Carbs 45-65%
              </small>
            </div>
          </div>
        )}
      </div>

      {/* Additional Nutrients */}
      <div className="nutrition-section">
        <h4>Other Nutrients</h4>
        <div className="nutrients-grid">
          {fiber && (
            <div className="nutrient-item">
              <span className="nutrient-name">Fiber</span>
              <span className="nutrient-value">{fiber}g</span>
            </div>
          )}
          {sugar && (
            <div className="nutrient-item">
              <span className="nutrient-name">Sugar</span>
              <span className="nutrient-value">{sugar}g</span>
            </div>
          )}
          {sodium && (
            <div className="nutrient-item">
              <span className="nutrient-name">Sodium</span>
              <span className="nutrient-value">{sodium}mg</span>
            </div>
          )}
        </div>
      </div>

      {/* Nutrition Tips */}
      <div className="nutrition-tips">
        <h4>Nutrition Tips</h4>
        <ul className="tips-list">
          {calories > 600 && (
            <li>This is a high-calorie meal. Consider portion control or pairing with lighter sides.</li>
          )}
          {calories < 200 && (
            <li>This is a light meal. You might want to add protein or healthy fats for satiety.</li>
          )}
          {protein && protein < 10 && (
            <li>Low in protein. Consider adding lean protein sources like chicken, fish, or legumes.</li>
          )}
          {fiber && fiber < 3 && (
            <li>Low in fiber. Add vegetables, fruits, or whole grains to increase fiber content.</li>
          )}
          {sodium && sodium > 800 && (
            <li>High in sodium. Consider reducing salt or using herbs and spices for flavor.</li>
          )}
          {isBalanced && (
            <li>Great macro balance! This recipe provides a good mix of protein, fat, and carbohydrates.</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default NutritionDisplay; 