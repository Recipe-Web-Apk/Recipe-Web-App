import React from 'react';
import IngredientTooltip from './IngredientTooltip';
import './IngredientTooltipDemo.css';

const IngredientTooltipDemo = () => {
  const demoIngredients = [
    'salt',
    'garlic',
    'olive oil',
    'fresh basil',
    'chicken',
    'tomatoes',
    'onion',
    'butter',
    'flour',
    'eggs',
    'milk',
    'cheese',
    'lemon',
    'pepper',
    'honey'
  ];

  return (
    <div className="tooltip-demo">
      <h2>Ingredient Tooltip Demo</h2>
      <p className="demo-description">
        Hover over any ingredient below to see helpful cooking tips and information!
      </p>
      
      <div className="demo-ingredients">
        {demoIngredients.map((ingredient, index) => (
          <IngredientTooltip key={index} ingredient={ingredient}>
            <span className="demo-ingredient">
              {ingredient}
            </span>
          </IngredientTooltip>
        ))}
      </div>
      
      <div className="demo-info">
        <h3>Features:</h3>
        <ul>
          <li>✨ Specific tips for common ingredients</li>
          <li>🌿 Category-based tips for fresh herbs, vegetables, etc.</li>
          <li>🎨 Beautiful gradient design with smooth animations</li>
          <li>📱 Responsive design for mobile devices</li>
          <li>🌙 Dark mode support</li>
          <li>♿ Accessibility features</li>
        </ul>
      </div>
    </div>
  );
};

export default IngredientTooltipDemo; 