import React from 'react';
import { FiClock, FiZap, FiThermometer, FiTarget } from 'react-icons/fi';
import './CookingDetails.css';

const CookingDetails = ({ recipe }) => {
  // Calculate total time from various possible sources
  const getTotalTime = () => {
    if (recipe.totalTime) return recipe.totalTime;
    if (recipe.readyInMinutes) return recipe.readyInMinutes;
    const prepTime = recipe.prepTime || 0;
    const cookTime = recipe.cookTime || 0;
    return prepTime + cookTime;
  };

  // Get cooking technique from recipe data
  const getCookingTechnique = () => {
    return recipe.cookingStyle || null;
  };

  // Get cooking equipment from recipe data
  const getCookingEquipment = () => {
    return recipe.cookingMethod || null;
  };

  // Determine time complexity based on total time
  const getTimeComplexity = (totalTime) => {
    if (totalTime <= 15) return { level: 'Quick', color: '#4CAF50', icon: '⚡' };
    if (totalTime <= 30) return { level: 'Fast', color: '#8BC34A', icon: '🚀' };
    if (totalTime <= 60) return { level: 'Moderate', color: '#FF9800', icon: '⏱️' };
    if (totalTime <= 120) return { level: 'Slow', color: '#FF5722', icon: '🐌' };
    return { level: 'Very Slow', color: '#9C27B0', icon: '⏰' };
  };

  // Get difficulty based on time and complexity
  const getDifficulty = (totalTime) => {
    if (totalTime <= 20) return { level: 'Easy', color: '#4CAF50' };
    if (totalTime <= 45) return { level: 'Medium', color: '#FF9800' };
    return { level: 'Hard', color: '#F44336' };
  };

  const totalTime = getTotalTime();
  const timeComplexity = getTimeComplexity(totalTime);
  const difficulty = getDifficulty(totalTime);
  const cookingTechnique = getCookingTechnique();
  const cookingEquipment = getCookingEquipment();

  if (!totalTime && !recipe.prepTime && !recipe.cookTime && !recipe.readyInMinutes) {
    return (
      <div className="cooking-details">
        <h3>Cooking Details</h3>
        <p className="no-details">Cooking time information not available for this recipe.</p>
      </div>
    );
  }

  return (
    <div className="cooking-details">
      <h3>Cooking Details</h3>
      
      {/* Time Breakdown */}
      <div className="time-breakdown">
        <div className="time-item prep-time">
          <div className="time-icon">
            <FiClock />
          </div>
          <div className="time-content">
            <span className="time-label">Prep Time</span>
            <span className="time-value">
              {recipe.prepTime ? `${recipe.prepTime} min` : 'N/A'}
            </span>
          </div>
        </div>

        <div className="time-item cook-time">
          <div className="time-icon">
            <FiThermometer />
          </div>
          <div className="time-content">
            <span className="time-label">Cook Time</span>
            <span className="time-value">
              {recipe.cookTime ? `${recipe.cookTime} min` : recipe.readyInMinutes ? `${recipe.readyInMinutes} min` : 'N/A'}
            </span>
          </div>
        </div>

        <div className="time-item total-time">
          <div className="time-icon">
            <FiZap />
          </div>
          <div className="time-content">
            <span className="time-label">Total Time</span>
            <span className="time-value">{totalTime} min</span>
          </div>
        </div>
      </div>

      {/* Time Complexity Indicator */}
      <div className="complexity-indicator">
        <div 
          className="complexity-badge"
          style={{ backgroundColor: timeComplexity.color }}
        >
          <span className="complexity-icon">{timeComplexity.icon}</span>
          <span className="complexity-text">{timeComplexity.level}</span>
        </div>
        <span className="complexity-description">
          {timeComplexity.level === 'Quick' && 'Ready in 15 minutes or less'}
          {timeComplexity.level === 'Fast' && 'Ready in 15-30 minutes'}
          {timeComplexity.level === 'Moderate' && 'Ready in 30-60 minutes'}
          {timeComplexity.level === 'Slow' && 'Ready in 1-2 hours'}
          {timeComplexity.level === 'Very Slow' && 'Takes more than 2 hours'}
        </span>
      </div>

      {/* Cooking Technique and Equipment */}
      <div className="cooking-info">
        <div className="cooking-item">
          <div className="cooking-icon">
            <FiTarget />
          </div>
          <div className="cooking-content">
            <span className="cooking-label">Cooking Technique</span>
            <span className={`cooking-value ${!cookingTechnique ? 'not-specified' : ''}`}>
              {cookingTechnique || 'Not specified'}
            </span>
          </div>
        </div>

        <div className="cooking-item">
          <div className="cooking-icon">
            <FiThermometer />
          </div>
          <div className="cooking-content">
            <span className="cooking-label">Cooking Equipment</span>
            <span className={`cooking-value ${!cookingEquipment ? 'not-specified' : ''}`}>
              {cookingEquipment || 'Not specified'}
            </span>
          </div>
        </div>
      </div>

      {/* Difficulty Level */}
      <div className="difficulty-section">
        <div 
          className="difficulty-badge"
          style={{ backgroundColor: difficulty.color }}
        >
          <span className="difficulty-text">{difficulty.level}</span>
        </div>
        <span className="difficulty-description">
          {difficulty.level === 'Easy' && 'Perfect for beginners'}
          {difficulty.level === 'Medium' && 'Some cooking experience helpful'}
          {difficulty.level === 'Hard' && 'Requires advanced cooking skills'}
        </span>
      </div>

      {/* Cooking Tips */}
      <div className="cooking-tips">
        <h4>Cooking Tips</h4>
        <ul className="tips-list">
          {totalTime > 60 && (
            <li>This is a longer recipe. Consider prepping ingredients ahead of time.</li>
          )}
          {totalTime <= 20 && (
            <li>Quick and easy recipe perfect for busy weeknights!</li>
          )}
          {recipe.prepTime > recipe.cookTime && (
            <li>Most of the time is prep work. You can prepare ingredients in advance.</li>
          )}
          {recipe.cookTime > recipe.prepTime && (
            <li>Most time is spent cooking. Plan accordingly and don't rush the cooking process.</li>
          )}
          {cookingEquipment === 'Oven' && (
            <li>Preheat your oven before starting prep work for best results.</li>
          )}
          {cookingEquipment === 'Grill' && (
            <li>Make sure your grill is properly heated before cooking.</li>
          )}
          {cookingEquipment === 'Slow Cooker' && (
            <li>Perfect for hands-off cooking. Set it and forget it!</li>
          )}
          {cookingEquipment === 'Air Fryer' && (
            <li>Preheat your air fryer for 3-5 minutes before cooking for best results.</li>
          )}
          {cookingEquipment === 'Pressure Cooker' && (
            <li>Follow safety guidelines and ensure proper sealing before cooking.</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default CookingDetails; 