const sampleRecipes = [
  {
    id: 1,
    title: "Classic Spaghetti Carbonara",
    image: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=300&fit=crop",
    readyInMinutes: 25,
    servings: 4,
    calories: 450,
    diets: ["gluten free"],
    missedIngredientCount: 0,
    usedIngredientCount: 5
  },
  {
    id: 2,
    title: "Chicken Tikka Masala",
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop",
    readyInMinutes: 45,
    servings: 6,
    calories: 380,
    diets: ["gluten free"],
    missedIngredientCount: 1,
    usedIngredientCount: 4
  },
  {
    id: 3,
    title: "Vegetarian Buddha Bowl",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop",
    readyInMinutes: 30,
    servings: 2,
    calories: 320,
    diets: ["vegetarian", "vegan"],
    missedIngredientCount: 2,
    usedIngredientCount: 3
  },
  {
    id: 4,
    title: "Beef Tacos with Fresh Salsa",
    image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=300&fit=crop",
    readyInMinutes: 35,
    servings: 4,
    calories: 420,
    diets: ["gluten free"],
    missedIngredientCount: 1,
    usedIngredientCount: 4
  },
  {
    id: 5,
    title: "Mediterranean Quinoa Salad",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop",
    readyInMinutes: 20,
    servings: 4,
    calories: 280,
    diets: ["vegetarian", "vegan", "gluten free"],
    missedIngredientCount: 0,
    usedIngredientCount: 6
  },
  {
    id: 6,
    title: "Grilled Salmon with Lemon Herb Butter",
    image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop",
    readyInMinutes: 40,
    servings: 2,
    calories: 520,
    diets: ["gluten free", "pescetarian"],
    missedIngredientCount: 2,
    usedIngredientCount: 3
  },
  {
    id: 7,
    title: "Chocolate Chip Cookies",
    image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&h=300&fit=crop",
    readyInMinutes: 30,
    servings: 24,
    calories: 150,
    diets: ["vegetarian"],
    missedIngredientCount: 1,
    usedIngredientCount: 4
  },
  {
    id: 8,
    title: "Thai Green Curry",
    image: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400&h=300&fit=crop",
    readyInMinutes: 50,
    servings: 4,
    calories: 380,
    diets: ["gluten free"],
    missedIngredientCount: 3,
    usedIngredientCount: 2
  },
  {
    id: 9,
    title: "Breakfast Smoothie Bowl",
    image: "https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=400&h=300&fit=crop",
    readyInMinutes: 10,
    servings: 1,
    calories: 280,
    diets: ["vegetarian", "vegan", "gluten free"],
    missedIngredientCount: 0,
    usedIngredientCount: 5
  },
  {
    id: 10,
    title: "Italian Margherita Pizza",
    image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400&h=300&fit=crop",
    readyInMinutes: 60,
    servings: 4,
    calories: 320,
    diets: ["vegetarian"],
    missedIngredientCount: 2,
    usedIngredientCount: 3
  },
  {
    id: 11,
    title: "Greek Yogurt Parfait",
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop",
    readyInMinutes: 5,
    servings: 1,
    calories: 220,
    diets: ["vegetarian", "gluten free"],
    missedIngredientCount: 0,
    usedIngredientCount: 4
  },
  {
    id: 12,
    title: "Beef Stir Fry with Vegetables",
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop",
    readyInMinutes: 25,
    servings: 4,
    calories: 350,
    diets: ["gluten free"],
    missedIngredientCount: 1,
    usedIngredientCount: 4
  }
];

// Function to filter recipes based on search query
function filterRecipes(query, filters = {}) {
  let filtered = sampleRecipes.filter(recipe => {
    const matchesQuery = recipe.title.toLowerCase().includes(query.toLowerCase());
    
    if (!matchesQuery) return false;
    
    // Apply filters
    if (filters.cuisine) {
      // Simple cuisine matching - in real app this would be more sophisticated
      return true; // For demo purposes, accept all
    }
    
    if (filters.diet) {
      return recipe.diets.includes(filters.diet);
    }
    
    if (filters.maxReadyTime) {
      return recipe.readyInMinutes <= parseInt(filters.maxReadyTime);
    }
    
    return true;
  });
  
  // Apply sorting
  if (filters.sort) {
    switch (filters.sort) {
      case 'time':
        filtered.sort((a, b) => a.readyInMinutes - b.readyInMinutes);
        break;
      case 'calories':
        filtered.sort((a, b) => a.calories - b.calories);
        break;
      case 'popularity':
        // For demo, sort by ID (simulating popularity)
        filtered.sort((a, b) => b.id - a.id);
        break;
      default:
        // relevance - keep original order
        break;
    }
  }
  
  return filtered;
}

// Function to get recipes by ingredients (simplified)
function findRecipesByIngredients(ingredients, calorieRange = {}) {
  // For demo purposes, return a subset of recipes
  // In a real app, this would analyze ingredients more intelligently
  const validIngredients = ingredients.filter(ing => ing.trim());
  
  if (validIngredients.length === 0) return [];
  
  // Return recipes that might contain some of the ingredients
  return sampleRecipes.slice(0, 6).map(recipe => ({
    ...recipe,
    missedIngredientCount: Math.floor(Math.random() * 3),
    usedIngredientCount: Math.floor(Math.random() * 4) + 1
  }));
}

module.exports = {
  sampleRecipes,
  filterRecipes,
  findRecipesByIngredients
}; 