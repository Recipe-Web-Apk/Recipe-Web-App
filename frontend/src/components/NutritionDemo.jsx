import React from 'react';
import NutritionDisplay from './NutritionDisplay';
import './NutritionDemo.css';

const NutritionDemo = () => {
  // Sample recipe data that mimics Spoonacular API response
  const sampleRecipes = [
    {
      id: 1,
      title: "Grilled Chicken Salad",
      nutrition: {
        nutrients: [
          { name: 'Calories', amount: 350, unit: 'kcal' },
          { name: 'Protein', amount: 35, unit: 'g' },
          { name: 'Fat', amount: 12, unit: 'g' },
          { name: 'Carbohydrates', amount: 25, unit: 'g' },
          { name: 'Fiber', amount: 8, unit: 'g' },
          { name: 'Sugar', amount: 5, unit: 'g' },
          { name: 'Sodium', amount: 450, unit: 'mg' }
        ]
      }
    },
    {
      id: 2,
      title: "Pasta Carbonara",
      nutrition: {
        nutrients: [
          { name: 'Calories', amount: 650, unit: 'kcal' },
          { name: 'Protein', amount: 25, unit: 'g' },
          { name: 'Fat', amount: 35, unit: 'g' },
          { name: 'Carbohydrates', amount: 55, unit: 'g' },
          { name: 'Fiber', amount: 3, unit: 'g' },
          { name: 'Sugar', amount: 8, unit: 'g' },
          { name: 'Sodium', amount: 850, unit: 'mg' }
        ]
      }
    },
    {
      id: 3,
      title: "Quinoa Bowl",
      nutrition: {
        nutrients: [
          { name: 'Calories', amount: 280, unit: 'kcal' },
          { name: 'Protein', amount: 12, unit: 'g' },
          { name: 'Fat', amount: 8, unit: 'g' },
          { name: 'Carbohydrates', amount: 45, unit: 'g' },
          { name: 'Fiber', amount: 12, unit: 'g' },
          { name: 'Sugar', amount: 3, unit: 'g' },
          { name: 'Sodium', amount: 320, unit: 'mg' }
        ]
      }
    }
  ];

  return (
    <div className="nutrition-demo">
      <div className="demo-header">
        <h1>Nutrition Information Demo</h1>
        <p>This demo shows how nutrition information from Spoonacular API is displayed, including:</p>
        <ul>
          <li>Calories per serving</li>
          <li>Macronutrient breakdown (Protein, Fat, Carbohydrates)</li>
          <li>Macronutrient percentages with visual progress bars</li>
          <li>Macro balance indicators</li>
          <li>Additional nutrients (Fiber, Sugar, Sodium)</li>
          <li>Personalized nutrition tips</li>
        </ul>
      </div>

      <div className="demo-recipes">
        {sampleRecipes.map((recipe, index) => (
          <div key={recipe.id} className="demo-recipe">
            <h2>{recipe.title}</h2>
            <NutritionDisplay recipe={recipe} />
          </div>
        ))}
      </div>

      <div className="demo-info">
        <h3>How it works:</h3>
        <div className="info-grid">
          <div className="info-item">
            <h4>🔍 Data Extraction</h4>
            <p>The system extracts nutrition data from multiple possible locations in the Spoonacular API response, including direct properties and nested nutrition objects.</p>
          </div>
          <div className="info-item">
            <h4>📊 Percentage Calculation</h4>
            <p>Macronutrient percentages are calculated by converting grams to calories (4 cal/g for protein/carbs, 9 cal/g for fat) and calculating the percentage of total calories.</p>
          </div>
          <div className="info-item">
            <h4>⚖️ Balance Assessment</h4>
            <p>Recipes are assessed for macro balance based on recommended ranges: Protein 10-35%, Fat 20-35%, Carbohydrates 45-65%.</p>
          </div>
          <div className="info-item">
            <h4>💡 Smart Tips</h4>
            <p>Personalized nutrition tips are provided based on calorie content, macro balance, and specific nutrient levels to help users make informed choices.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NutritionDemo; 