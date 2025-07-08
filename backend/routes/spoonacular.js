const express = require('express');
const axios = require('axios');
const router = express.Router();

// Test route to check if this router is working
router.get('/test', (req, res) => {
  const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;
  res.json({ message: 'Spoonacular router is working', apiKey: SPOONACULAR_API_KEY ? 'Present' : 'Missing' });
});

// Proxy endpoint for searching recipes
router.get('/search', async (req, res) => {
  const { 
    query, 
    offset = 0, 
    sort = 'relevance',
    cuisine,
    diet,
    intolerances,
    maxReadyTime,
    minProtein,
    maxCalories,
    minCalories // <-- add minCalories
  } = req.query;
  
  if (!query) return res.status(400).json({ error: 'Query is required' });

  const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;
  console.log('API Key:', SPOONACULAR_API_KEY ? 'Present' : 'Missing');
  console.log('Query:', query);
  console.log('Offset:', offset);
  console.log('Filters:', { sort, cuisine, diet, intolerances, maxReadyTime, minProtein, maxCalories });

  try {
    // Build params object, only including defined values
    const params = {
      query,
      apiKey: SPOONACULAR_API_KEY,
      number: 12, // Increased number of results
      offset: parseInt(offset),
      addRecipeInformation: true,
      fillIngredients: true,
      instructionsRequired: true
    };

    // Add optional parameters if they exist
    if (sort && sort !== 'relevance') {
      params.sort = sort;
      params.sortDirection = sort === 'time' ? 'asc' : 'desc';
    }
    if (cuisine) params.cuisine = cuisine;
    if (diet) params.diet = diet;
    if (intolerances) params.intolerances = intolerances;
    if (maxReadyTime) params.maxReadyTime = parseInt(maxReadyTime);
    if (minProtein) params.minProtein = parseInt(minProtein);
    if (maxCalories) params.maxCalories = parseInt(maxCalories);

    const response = await axios.get('https://api.spoonacular.com/recipes/complexSearch', {
      params
    });
    let results = response.data.results || [];
    // Filter by minCalories if provided
    if (minCalories) {
      const min = parseInt(minCalories);
      results = results.filter(recipe => {
        // Try to get calories from nutrition.nutrients
        if (recipe.nutrition && Array.isArray(recipe.nutrition.nutrients)) {
          const cal = recipe.nutrition.nutrients.find(n => n.name === 'Calories');
          return cal && cal.amount >= min;
        }
        // Fallback: if no nutrition info, include the recipe
        return true;
      });
    }
    // Normalize ingredients for each recipe
    results = results.map(recipe => ({
      ...recipe,
      ingredients: Array.isArray(recipe.extendedIngredients) ? recipe.extendedIngredients.map(ing => ing.original || ing.name || '') : [],
    }));
    res.json({ ...response.data, results });
  } catch (error) {
    console.error('Spoonacular API Error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to fetch from Spoonacular',
      details: error.response?.data || error.message 
    });
  }
});

// Get detailed recipe information by ID
router.get('/recipe/:id', async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: 'Recipe ID is required' });

  const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;
  console.log('Getting recipe details for ID:', id);

  try {
    const response = await axios.get(`https://api.spoonacular.com/recipes/${id}/information`, {
      params: {
        apiKey: SPOONACULAR_API_KEY,
        includeNutrition: true
      },
    });
    const data = response.data;
    // Normalize the recipe object for frontend compatibility
    const normalized = {
      id: data.id,
      title: data.title,
      image: data.image,
      summary: data.summary,
      description: data.summary, // fallback
      instructions: data.instructions,
      readyInMinutes: data.readyInMinutes,
      cookTime: data.cookingMinutes || data.readyInMinutes,
      prepTime: data.preparationMinutes,
      servings: data.servings,
      cuisines: data.cuisines,
      dishTypes: data.dishTypes,
      diets: data.diets,
      nutrition: data.nutrition,
      calories: data.nutrition && Array.isArray(data.nutrition.nutrients) ? (data.nutrition.nutrients.find(n => n.name === 'Calories')?.amount) : undefined,
      ingredients: Array.isArray(data.extendedIngredients) ? data.extendedIngredients.map(ing => ing.original || ing.name || '') : [],
      youtube_url: data.sourceUrl && data.sourceUrl.includes('youtube') ? data.sourceUrl : undefined,
      sourceUrl: data.sourceUrl,
    };
    res.json(normalized);
  } catch (error) {
    console.error('Spoonacular Recipe Details Error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to fetch recipe details',
      details: error.response?.data || error.message 
    });
  }
});

// Get similar recipes
router.get('/similar/:id', async (req, res) => {
  try {
    const { id } = req.params
    const apiKey = process.env.SPOONACULAR_API_KEY
    
    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured' })
    }

    // First get similar recipe IDs
    const similarResponse = await axios.get(
      `https://api.spoonacular.com/recipes/${id}/similar`,
      {
        params: {
          apiKey,
          number: 6 // Limit to 6 similar recipes
        }
      }
    )

    // Then get detailed information for each similar recipe
    const detailedRecipes = await Promise.all(
      similarResponse.data.map(async (recipe) => {
        try {
          const detailResponse = await axios.get(
            `https://api.spoonacular.com/recipes/${recipe.id}/information`,
            {
              params: { apiKey }
            }
          )
          return detailResponse.data
        } catch (error) {
          console.error(`Error fetching details for recipe ${recipe.id}:`, error.message)
          // Return basic info if detailed fetch fails
          return {
            id: recipe.id,
            title: recipe.title,
            image: recipe.image,
            readyInMinutes: recipe.readyInMinutes,
            servings: recipe.servings
          }
        }
      })
    )

    res.json(detailedRecipes)
  } catch (error) {
    console.error('Error fetching similar recipes:', error.response?.data || error.message)
    res.status(500).json({ 
      error: 'Failed to fetch similar recipes',
      details: error.response?.data || error.message 
    })
  }
})

module.exports = router; 