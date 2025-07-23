import React from 'react';
import CookingDetails from './CookingDetails';
import './CookingDetailsDemo.css';

const CookingDetailsDemo = () => {
  // Sample recipe data that mimics different cooking scenarios
  const sampleRecipes = [
    {
      id: 1,
      title: "Quick Weeknight Pasta",
      prepTime: 10,
      cookTime: 15,
      totalTime: 25,
      cookingStyle: "Boiling",
      cookingMethod: "Stovetop",
      readyInMinutes: 25
    },
    {
      id: 2,
      title: "Traditional Sunday Roast",
      prepTime: 30,
      cookTime: 180,
      totalTime: 210,
      cookingStyle: "Roasting",
      cookingMethod: "Oven",
      readyInMinutes: 210
    },
    {
      id: 3,
      title: "Crispy Air Fryer Chicken",
      prepTime: 15,
      cookTime: 25,
      totalTime: 40,
      cookingStyle: "Frying",
      cookingMethod: "Air Fryer",
      readyInMinutes: 40
    },
    {
      id: 4,
      title: "Slow Cooker Beef Stew",
      prepTime: 20,
      cookTime: 480,
      totalTime: 500,
      cookingStyle: "Braising",
      cookingMethod: "Slow Cooker",
      readyInMinutes: 500
    },
    {
      id: 5,
      title: "No-Bake Chocolate Cheesecake",
      prepTime: 30,
      cookTime: 0,
      totalTime: 30,
      readyInMinutes: 30
      // No cooking technique or equipment needed for no-bake desserts
    },
    {
      id: 6,
      title: "Fresh Fruit Salad",
      prepTime: 15,
      cookTime: 0,
      totalTime: 15,
      readyInMinutes: 15
      // No cooking technique or equipment needed for raw food
    }
  ];

  return (
    <div className="cooking-details-demo">
      <div className="demo-header">
        <h1>Cooking Details Demo</h1>
        <p>This demo shows how cooking details are displayed, including:</p>
        <ul>
          <li>Prep time, cook time, and total time breakdown</li>
          <li>Time complexity indicators (Quick, Fast, Moderate, Slow, Very Slow)</li>
          <li>Cooking technique and cooking equipment information (when applicable)</li>
          <li>Difficulty assessment based on time and complexity</li>
          <li>Personalized cooking tips based on recipe characteristics</li>
          <li>Smart handling of no-cook recipes (desserts, salads, etc.)</li>
        </ul>
      </div>

      <div className="demo-recipes">
        {sampleRecipes.map((recipe, index) => (
          <div key={recipe.id} className="demo-recipe">
            <h2>{recipe.title}</h2>
            <CookingDetails recipe={recipe} />
          </div>
        ))}
      </div>

      <div className="demo-info">
        <h3>How it works:</h3>
        <div className="info-grid">
          <div className="info-item">
            <h4>⏱️ Time Calculation</h4>
            <p>The system calculates total time from prep time + cook time, or uses readyInMinutes from Spoonacular API. It also determines time complexity levels based on total cooking time.</p>
          </div>
          <div className="info-item">
            <h4>🎯 Cooking Technique</h4>
            <p>Cooking technique refers to the specific method used: Frying, Poaching, Braising, Sautéing, Searing, Steaming, Boiling, Simmering, Roasting, Grilling, Baking, etc. Not all recipes require cooking techniques (e.g., no-bake desserts, fresh salads).</p>
          </div>
          <div className="info-item">
            <h4>🔥 Cooking Equipment</h4>
            <p>Cooking equipment specifies the tools needed: Stovetop, Oven, Grill, Slow Cooker, Air Fryer, Pressure Cooker, Smoker, Steamer, Deep Fryer, Wok, Dutch Oven, etc. Some recipes may not require specific cooking equipment.</p>
          </div>
          <div className="info-item">
            <h4>📊 Difficulty Assessment</h4>
            <p>Difficulty is automatically calculated based on total time and complexity. Quick recipes are usually Easy, longer recipes may be Medium or Hard depending on technique.</p>
          </div>
        </div>
      </div>

      <div className="demo-features">
        <h3>Key Features:</h3>
        <div className="features-grid">
          <div className="feature-item">
            <h4>Visual Time Breakdown</h4>
            <p>Clear display of prep time, cook time, and total time with color-coded icons and hover effects.</p>
          </div>
          <div className="feature-item">
            <h4>Complexity Indicators</h4>
            <p>Color-coded badges showing time complexity with descriptive text explaining what each level means.</p>
          </div>
          <div className="feature-item">
            <h4>Smart Tips</h4>
            <p>Contextual cooking tips based on recipe characteristics like cooking method, time requirements, and complexity.</p>
          </div>
          <div className="feature-item">
            <h4>Responsive Design</h4>
            <p>Fully responsive layout that adapts to different screen sizes and maintains readability on mobile devices.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookingDetailsDemo; 