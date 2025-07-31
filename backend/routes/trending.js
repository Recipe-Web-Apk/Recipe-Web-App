const express = require('express');
const router = express.Router();
const axios = require('axios');

// Cache for trending recipes (refresh every 30 minutes)
let trendingCache = {
  recipes: [],
  timestamp: 0,
  cacheDuration: 30 * 60 * 1000 // 30 minutes
};

async function fetchTrendingRecipes() {
  try {
    const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;
    
    if (!SPOONACULAR_API_KEY) {
      console.error('Spoonacular API key not found');
      return [];
    }

    const response = await axios.get(`https://api.spoonacular.com/recipes/complexSearch`, {
      params: {
        apiKey: SPOONACULAR_API_KEY,
        query: 'popular',
        sort: 'popularity',
        number: 12,
        addRecipeInformation: true,
        fillIngredients: true
      }
    });

    if (response.data && response.data.results) {
      return response.data.results.map(recipe => ({
        id: recipe.id,
        title: recipe.title,
        image: recipe.image,
        readyInMinutes: recipe.readyInMinutes,
        servings: recipe.servings,
        cuisine: recipe.cuisines?.[0] || 'International',
        diet: recipe.diets?.[0] || null
      }));
    }

    return [];
  } catch (error) {
    console.error('Error fetching trending recipes:', error.message);
    return [];
  }
}

// GET /api/trending - Get trending recipes
router.get('/', async (req, res) => {
  try {
    const now = Date.now();
    
    // Check if cache is still valid
    if (trendingCache.recipes.length > 0 && (now - trendingCache.timestamp) < trendingCache.cacheDuration) {
      console.log('Returning cached trending recipes');
      return res.json(trendingCache.recipes);
    }

    // Fetch fresh data
    console.log('Fetching fresh trending recipes');
    const recipes = await fetchTrendingRecipes();
    
    // Update cache
    trendingCache.recipes = recipes;
    trendingCache.timestamp = now;
    
    res.json(recipes);
  } catch (error) {
    console.error('Error in trending recipes route:', error);
    
    // Return cached data if available, even if expired
    if (trendingCache.recipes.length > 0) {
      console.log('Returning expired cache due to error');
      return res.json(trendingCache.recipes);
    }
    
    res.status(500).json({ error: 'Failed to fetch trending recipes' });
  }
});

module.exports = router; 