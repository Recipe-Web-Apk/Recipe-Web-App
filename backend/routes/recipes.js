const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const { authenticateToken } = require('../middleware/auth');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// POST /api/recipes - Create a new recipe
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const recipeData = req.body;

    // Validate required fields
    if (!recipeData.title || !recipeData.description || !recipeData.ingredients || !recipeData.instructions) {
      return res.status(400).json({ error: 'Missing required fields: title, description, ingredients, instructions' });
    }

    // Format ingredients as PostgreSQL array
    const ingredientsArray = `{${recipeData.ingredients.map(ing => `"${ing.replace(/"/g, '\\"')}"`).join(',')}}`;

    // Prepare recipe data
    const recipe = {
      title: recipeData.title.trim(),
      description: recipeData.description.trim(),
      ingredients: ingredientsArray,
      instructions: recipeData.instructions,
      user_id: userId,
      image: recipeData.image || null,
      youtube_url: recipeData.youtube_url || null
    };

    // Add optional fields only if they exist
    if (recipeData.prepTime) recipe.prepTime = parseInt(recipeData.prepTime);
    if (recipeData.cookTime) recipe.cookTime = parseInt(recipeData.cookTime);
    if (recipeData.servings) recipe.servings = parseInt(recipeData.servings);
    if (recipeData.calories) recipe.calories = parseInt(recipeData.calories);
    if (recipeData.difficulty) recipe.difficulty = recipeData.difficulty;
    if (recipeData.category) recipe.category = recipeData.category;
    if (recipeData.tags) recipe.tags = recipeData.tags.trim();

    console.log('Creating recipe with data:', recipe);

    const { data, error } = await supabase
      .from('recipes')
      .insert([recipe])
      .select();

    if (error) {
      console.error('Error creating recipe:', error);
      return res.status(500).json({ error: error.message || 'Failed to create recipe' });
    }

    res.json({ 
      message: 'Recipe created successfully',
      recipe: data[0]
    });
  } catch (error) {
    console.error('Error in create recipe route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/recipes - Get user's recipes
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const { data: recipes, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching recipes:', error);
      return res.status(500).json({ error: 'Failed to fetch recipes' });
    }

    res.json({ recipes: recipes || [] });
  } catch (error) {
    console.error('Error in get recipes route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/recipes/:id - Get a single user-created recipe by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const recipeId = req.params.id;

    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', recipeId)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned
      console.error('Error fetching recipe:', error);
      return res.status(500).json({ error: 'Failed to fetch recipe' });
    }

    if (!data) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    res.json({ recipe: data });
  } catch (error) {
    console.error('Error in get recipe by id route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 