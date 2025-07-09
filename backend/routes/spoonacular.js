const express = require('express');
const axios = require('axios');
const router = express.Router();
const { filterRecipes, findRecipesByIngredients } = require('../data/sampleRecipes');

// Test route to check if this router is working
router.get('/test', (req, res) => {
  const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;
  res.json({ message: 'Spoonacular router is working', apiKey: SPOONACULAR_API_KEY ? 'Present' : 'Missing' });
});

// Test route to simulate API limit error
router.get('/test-limit', (req, res) => {
  res.status(429).json({ 
    error: 'API rate limit reached',
    message: 'The daily API limit has been reached. Please try again tomorrow or upgrade your plan.',
    details: { status: 'failure', code: 402, message: 'Your daily points limit of 150 has been reached.' }
  });
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
    maxCalories
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
    res.json(response.data);
  } catch (error) {
    console.error('Spoonacular API Error:', error.response?.data || error.message);
    
    // Check if it's a rate limit error
    if (error.response?.data?.code === 402) {
      console.log('API limit reached, using sample data as fallback');
      
      // Use sample data as fallback
      const sampleResults = filterRecipes(query, { sort, cuisine, diet, intolerances, maxReadyTime });
      const offset = parseInt(req.query.offset) || 0;
      const number = parseInt(req.query.number) || 12;
      
      const paginatedResults = sampleResults.slice(offset, offset + number);
      
      res.json({
        results: paginatedResults,
        totalResults: sampleResults.length,
        offset: offset,
        number: paginatedResults.length
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to fetch from Spoonacular',
        details: error.response?.data || error.message 
      });
    }
  }
});

// Find recipes by ingredients
router.get('/findByIngredients', async (req, res) => {
  const { 
    ingredients, 
    ranking = 2, 
    ignorePantry = true,
    minCalories,
    maxCalories
  } = req.query;
  
  if (!ingredients) return res.status(400).json({ error: 'Ingredients are required' });

  const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;
  console.log('Finding recipes by ingredients:', ingredients);

  try {
    // Build params object
    const params = {
      ingredients,
      apiKey: SPOONACULAR_API_KEY,
      ranking: parseInt(ranking),
      ignorePantry: ignorePantry === 'true',
      number: 12
    };

    // Add calorie constraints if provided
    if (minCalories) params.minCalories = parseInt(minCalories);
    if (maxCalories) params.maxCalories = parseInt(maxCalories);

    const response = await axios.get('https://api.spoonacular.com/recipes/findByIngredients', {
      params
    });

    // Get detailed information for each recipe
    const detailedRecipes = await Promise.all(
      response.data.map(async (recipe) => {
        try {
          const detailResponse = await axios.get(
            `https://api.spoonacular.com/recipes/${recipe.id}/information`,
            {
              params: { apiKey: SPOONACULAR_API_KEY }
            }
          );
          return {
            ...detailResponse.data,
            missedIngredientCount: recipe.missedIngredientCount,
            usedIngredientCount: recipe.usedIngredientCount,
            unusedIngredients: recipe.unusedIngredients,
            usedIngredients: recipe.usedIngredients
          };
        } catch (error) {
          console.error(`Error fetching details for recipe ${recipe.id}:`, error.message);
          // Return basic info if detailed fetch fails
          return {
            id: recipe.id,
            title: recipe.title,
            image: recipe.image,
            readyInMinutes: recipe.readyInMinutes,
            servings: recipe.servings,
            missedIngredientCount: recipe.missedIngredientCount,
            usedIngredientCount: recipe.usedIngredientCount,
            unusedIngredients: recipe.unusedIngredients,
            usedIngredients: recipe.usedIngredients
          };
        }
      })
    );

    res.json(detailedRecipes);
  } catch (error) {
    console.error('Spoonacular findByIngredients Error:', error.response?.data || error.message);
    
    // Check if it's a rate limit error
    if (error.response?.data?.code === 402) {
      console.log('API limit reached, using sample data as fallback for ingredient search');
      
      // Use sample data as fallback
      const sampleResults = findRecipesByIngredients(ingredients.split(','), { minCalories, maxCalories });
      
      res.json(sampleResults);
    } else {
      res.status(500).json({ 
        error: 'Failed to find recipes by ingredients',
        details: error.response?.data || error.message 
      });
    }
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
      },
    });
    res.json(response.data);
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