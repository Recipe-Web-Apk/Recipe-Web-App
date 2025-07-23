const express = require('express');
const axiosInstance = require('../axiosInstance');
const router = express.Router();
const { sampleRecipes, filterRecipes, findRecipesByIngredients } = require('../data/sampleRecipes');

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
      instructionsRequired: true,
      addRecipeNutrition: true // Include nutrition information including calories
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

    const response = await axiosInstance.get('https://api.spoonacular.com/recipes/complexSearch', {
      params
    });
    res.json(response.data);
  } catch (error) {
    console.error('Spoonacular API Error:', error.response?.data || error.message);
    
    // Check if it's a rate limit error
    if (error.response?.data?.code === 402) {
      console.log('API limit reached, using sample data as fallback');
      console.log('Query:', query);
      console.log('Filters:', { sort, cuisine, diet, intolerances, maxReadyTime });
      
      // Use sample data as fallback
      const sampleResults = filterRecipes(query, { sort, cuisine, diet, intolerances, maxReadyTime });
      console.log('Sample results found:', sampleResults.length);
      
      const offset = parseInt(req.query.offset) || 0;
      const number = parseInt(req.query.number) || 12;
      
      const paginatedResults = sampleResults.slice(offset, offset + number);
      console.log('Paginated results:', paginatedResults.length);
      
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
  const userIngredients = ingredients.split(',').map(ing => ing.trim().toLowerCase());

  try {
    // Build params object
    const params = {
      ingredients,
      apiKey: SPOONACULAR_API_KEY,
      ranking: parseInt(ranking),
      ignorePantry: ignorePantry === 'true',
      number: 50 // Get more results to filter from
    };

    // Add calorie constraints if provided
    if (minCalories) params.minCalories = parseInt(minCalories);
    if (maxCalories) params.maxCalories = parseInt(maxCalories);

    const response = await axiosInstance.get('https://api.spoonacular.com/recipes/findByIngredients', {
      params
    });

    // Get detailed information for each recipe
    const detailedRecipes = await Promise.all(
      response.data.map(async (recipe) => {
        try {
          const detailResponse = await axiosInstance.get(
            `https://api.spoonacular.com/recipes/${recipe.id}/information`,
            {
              params: { 
                apiKey: SPOONACULAR_API_KEY,
                includeNutrition: true // Include nutrition information including calories
              }
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

    // Filter recipes to only include those that contain ALL user ingredients
    const filteredRecipes = detailedRecipes.filter(recipe => {
      if (!recipe.extendedIngredients || !Array.isArray(recipe.extendedIngredients)) {
        return false;
      }

      // Get all recipe ingredients as lowercase strings
      const recipeIngredients = recipe.extendedIngredients.map(ing => 
        (ing.original || ing.name || '').toLowerCase()
      );

      // Check if ALL user ingredients are present in the recipe
      const hasAllIngredients = userIngredients.every(userIngredient => 
        recipeIngredients.some(recipeIngredient => 
          recipeIngredient.includes(userIngredient) || userIngredient.includes(recipeIngredient)
        )
      );

      return hasAllIngredients;
    });

    // Sort by how many ingredients are used (most used first)
    filteredRecipes.sort((a, b) => {
      const aUsed = a.usedIngredientCount || 0;
      const bUsed = b.usedIngredientCount || 0;
      return bUsed - aUsed;
    });

    // Limit to 12 results
    const finalResults = filteredRecipes.slice(0, 12);

    res.json(finalResults);
  } catch (error) {
    console.error('Spoonacular findByIngredients Error:', error.response?.data || error.message);
    
    // Check if it's a rate limit error
    if (error.response?.data?.code === 402) {
      console.log('API limit reached, using sample data as fallback for ingredient search');
      
      // Use sample data as fallback - filter to only include recipes with all ingredients
      const sampleResults = findRecipesByIngredients(userIngredients, { minCalories, maxCalories });
      
      // For sample data, we'll simulate the filtering
      const filteredSampleResults = sampleResults.filter(recipe => {
        // Simulate that all sample recipes contain the ingredients (for demo purposes)
        return true;
      });
      
      res.json(filteredSampleResults);
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

  try {
    const response = await axiosInstance.get(`https://api.spoonacular.com/recipes/${id}/information`, {
      params: {
        apiKey: SPOONACULAR_API_KEY,
        includeNutrition: true, // Include nutrition information including calories
      },
    });
    res.json(response.data);
  } catch (error) {
    console.error('Spoonacular Recipe Details Error:', error.response?.data || error.message);
    
    // Check if it's a rate limit error
    if (error.response?.data?.code === 402) {
      console.log('API limit reached, using sample data as fallback for recipe details');
      
      // Use sample data as fallback - find a recipe by ID or return first one
      const sampleRecipe = sampleRecipes.find(recipe => recipe.id === parseInt(id)) || sampleRecipes[0];
      
      if (sampleRecipe) {
        // Enhance the sample recipe with more details to match Spoonacular format
        const enhancedRecipe = {
          ...sampleRecipe,
          extendedIngredients: [
            { original: '2 cups flour', name: 'flour', amount: 2, unit: 'cups' },
            { original: '1 cup water', name: 'water', amount: 1, unit: 'cup' },
            { original: '1 tsp salt', name: 'salt', amount: 1, unit: 'tsp' }
          ],
          instructions: '1. Mix all ingredients together.\n2. Cook according to recipe.\n3. Serve and enjoy!',
          summary: `A delicious ${sampleRecipe.title.toLowerCase()} recipe that's easy to make and perfect for any occasion.`,
          nutrition: {
            nutrients: [
              { name: 'Calories', amount: sampleRecipe.calories || 300, unit: 'kcal' },
              { name: 'Protein', amount: 10, unit: 'g' },
              { name: 'Fat', amount: 5, unit: 'g' },
              { name: 'Carbohydrates', amount: 50, unit: 'g' }
            ]
          }
        };
        
        res.json(enhancedRecipe);
      } else {
        res.status(404).json({ error: 'Recipe not found' });
      }
    } else {
      res.status(500).json({ 
        error: 'Failed to fetch recipe details',
        details: error.response?.data || error.message 
      });
    }
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
    const similarResponse = await axiosInstance.get(
      `https://api.spoonacular.com/recipes/${id}/similar`,
      {
        params: {
          apiKey: apiKey,
          number: 6 // Limit to 6 similar recipes
        }
      }
    )

    // Then get detailed information for each similar recipe
    const detailedRecipes = await Promise.all(
      similarResponse.data.map(async (recipe) => {
        try {
          const detailResponse = await axiosInstance.get(
            `https://api.spoonacular.com/recipes/${recipe.id}/information`,
            {
              params: { 
                apiKey: apiKey,
                includeNutrition: true // Include nutrition information including calories
              }
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
    
    // Check if it's a rate limit error
    if (error.response?.data?.code === 402) {
      console.log('API limit reached, using sample data as fallback for similar recipes');
      
      // Use sample data as fallback - return a few sample recipes
      const similarRecipes = sampleRecipes.slice(0, 6).map(recipe => ({
        ...recipe,
        extendedIngredients: [
          { original: '2 cups flour', name: 'flour', amount: 2, unit: 'cups' },
          { original: '1 cup water', name: 'water', amount: 1, unit: 'cup' }
        ],
        instructions: '1. Mix ingredients.\n2. Cook and serve.',
        summary: `A delicious ${recipe.title.toLowerCase()} recipe.`
      }));
      
      res.json(similarRecipes);
    } else {
      res.status(500).json({ 
        error: 'Failed to fetch similar recipes',
        details: error.response?.data || error.message 
      })
    }
  }
})

// GET /api/spoonacular/suggest - Get recipe suggestions for auto-complete
router.get('/suggest', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.length < 2) {
      return res.json({ results: [] });
    }

    const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;
    const lowerQuery = query.toLowerCase();
    // Use a lightweight search to get suggestions
    const response = await axiosInstance.get(
      'https://api.spoonacular.com/recipes/complexSearch',
      {
        params: {
          query,
          apiKey: SPOONACULAR_API_KEY,
          number: 10, // Get more results for better variety
          addRecipeInformation: false, // Don't need full recipe info
          fillIngredients: false,
          instructionsRequired: false,
          sort: 'relevance' // Ensure most relevant results first
        }
      }
    );

    if (response.status === 200 && response.data.results) {
      const suggestions = response.data.results
        .filter(recipe => recipe.title && recipe.title.toLowerCase().includes(lowerQuery))
        .map(recipe => ({
          id: recipe.id,
          title: recipe.title,
          image: recipe.image,
          type: 'recipe'
        }));
      
      res.json({ results: suggestions });
    } else {
      res.json({ results: [] });
    }
  } catch (error) {
    console.error('Suggest API error:', error.message);
    
    // Check if it's a rate limit error and use sample data as fallback
    if (error.response?.data?.code === 402) {
      console.log('API limit reached, using sample data as fallback for suggestions');
      const { query } = req.query;
      const lowerQuery = query.toLowerCase();
      // Use sample data as fallback - filter recipes that match the query
      const sampleResults = filterRecipes(query, {});
      const suggestions = sampleResults
        .filter(recipe => recipe.title && recipe.title.toLowerCase().includes(lowerQuery))
        .slice(0, 10)
        .map(recipe => ({
          id: recipe.id,
          title: recipe.title,
          image: recipe.image,
          type: 'recipe'
        }));
      
      res.json({ results: suggestions });
    } else {
      // Return empty results on error to prevent breaking the UI
      res.json({ results: [] });
    }
  }
});

router.get('/spoonacular/autocomplete', async (req, res) => {
  const { query } = req.query;
  try {
    const response = await axiosInstance.get('https://api.spoonacular.com/recipes/autocomplete', {
      params: {
        query,
        number: 5,
        apiKey: process.env.SPOONACULAR_API_KEY
      }
    });
    res.json(response.data);
  } catch (error) {
    res.json([]);
  }
});

module.exports = router;