const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const { authenticateToken } = require('../middleware/auth');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Helper to get a Supabase client with the user's token for RLS
function getUserSupabaseClient(token) {
  return createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Authorization: `Bearer ${token}` } }
  });
}

// POST /api/recipes - Create a new recipe
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const recipeData = req.body;
    const token = req.headers.authorization?.split(' ')[1];
    const userSupabase = getUserSupabaseClient(token);

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
    if (recipeData.cookingStyle) recipe.cookingStyle = recipeData.cookingStyle;
    if (recipeData.cookingMethod) recipe.cookingMethod = recipeData.cookingMethod;
    if (recipeData.tags) recipe.tags = recipeData.tags.trim();
    
    // Calculate total time
    if (recipe.prepTime || recipe.cookTime) {
      recipe.totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);
    }

    console.log('Creating recipe with data:', recipe);

    const { data, error } = await userSupabase
      .from('recipes')
      .insert([recipe])
      .select();

    if (error) {
      console.error('Error creating recipe:', error);
      return res.status(500).json({ error: error.message || 'Failed to create recipe' });
    }

    res.json({ 
      success: true,
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
    const token = req.headers.authorization?.split(' ')[1];
    const userSupabase = getUserSupabaseClient(token);
    
    const { data: recipes, error } = await userSupabase
      .from('recipes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching recipes:', error);
      return res.status(500).json({ error: 'Failed to fetch recipes' });
    }

    res.json({ success: true, recipes: recipes || [] });
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
    const token = req.headers.authorization?.split(' ')[1];
    const userSupabase = getUserSupabaseClient(token);

    // Validate that recipeId is a valid integer
    if (isNaN(recipeId)) {
      return res.status(400).json({ error: 'Invalid recipe ID' });
    }

    const { data, error } = await userSupabase
      .from('recipes')
      .select('*')
      .eq('id', Number(recipeId))
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

// PUT /api/recipes/:id - Update a user-created recipe by ID
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const recipeId = req.params.id;
    const updateData = req.body;
    const token = req.headers.authorization?.split(' ')[1];
    const userSupabase = getUserSupabaseClient(token);

    // Validate that recipeId is a valid integer
    if (isNaN(recipeId)) {
      console.log('[EDIT RECIPE] Invalid recipe ID:', recipeId);
      return res.status(400).json({ error: 'Invalid recipe ID' });
    }

    // Only allow updating fields that are present in the request body
    const allowedFields = [
      'title', 'description', 'ingredients', 'instructions', 'image', 'youtube_url',
      'prepTime', 'cookTime', 'servings', 'calories', 'difficulty', 'category', 'tags'
    ];
    const updateFields = {};
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        updateFields[field] = updateData[field];
      }
    }
    // If ingredients is an array, format as PostgreSQL array string
    if (Array.isArray(updateFields.ingredients)) {
      updateFields.ingredients = `{${updateFields.ingredients.map(ing => `"${ing.replace(/"/g, '\\"')}"`).join(',')}}`;
    }
    // If tags is an array, format as comma-separated string
    if (Array.isArray(updateFields.tags)) {
      updateFields.tags = updateFields.tags.join(',');
    }

    // Debug logs
    console.log('[EDIT RECIPE] Attempting update:', {
      recipeId,
      userId,
      updateFields
    });

    // Update the recipe only if it belongs to the user
    const { data, error } = await userSupabase
      .from('recipes')
      .update(updateFields)
      .eq('id', Number(recipeId))
      .eq('user_id', userId)
      .select()
      .single();

    // Log the result of the update query
    console.log('[EDIT RECIPE] Update result:', { data, error });

    if (error) {
      console.error('[EDIT RECIPE] Error updating recipe:', error);
      return res.status(500).json({ error: error.message || 'Failed to update recipe' });
    }
    if (!data) {
      console.warn('[EDIT RECIPE] No recipe found or permission denied for:', { recipeId, userId });
      return res.status(404).json({ error: 'Recipe not found or you do not have permission to edit it' });
    }
    res.json({ success: true, message: 'Recipe updated successfully', recipe: data });
  } catch (error) {
    console.error('[EDIT RECIPE] Error in update recipe route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 