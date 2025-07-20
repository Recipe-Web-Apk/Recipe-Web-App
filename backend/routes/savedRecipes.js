const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const { authenticateToken } = require('../middleware/auth');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// GET /api/saved-recipes - Get user's saved recipes
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('saved_recipes')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: 'Failed to fetch saved recipes' });
    }

    const recipes = data.map(entry => ({
      ...entry.recipe_data,
      saved_recipe_id: entry.id,
      spoonacular_id: entry.spoonacular_id,
      user_id: entry.user_id
    }));

    res.json({ success: true, recipes });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/saved-recipes - Save a recipe
router.post('/', authenticateToken, async (req, res) => {
  try {
    console.log('Auth header:', req.headers.authorization);
    console.log('User:', req.user);
    console.log('Recipe:', req.body.recipe);

    const userId = req.user.id;
    const { recipe } = req.body;

    if (!recipe || !recipe.id) {
      return res.status(400).json({ error: 'Recipe data is required' });
    }

    // Check if recipe is already saved
    const { data: existingRecipe, error: checkError } = await supabase
      .from('saved_recipes')
      .select('*')
      .eq('user_id', userId)
      .eq('spoonacular_id', recipe.id)
      .single();

    console.log('Backend: Existing recipe check result:', existingRecipe);
    console.log('Backend: Existing recipe check error:', checkError);

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking existing recipe:', checkError);
      return res.status(500).json({ error: 'Failed to check existing recipe' });
    }

    if (existingRecipe) {
      console.log('Backend: Recipe already saved, returning error');
      return res.status(400).json({ error: 'Recipe is already saved' });
    }

    // Save the recipe
    const { data: savedRecipe, error: saveError } = await supabase
      .from('saved_recipes')
      .insert([{
        user_id: userId,
        spoonacular_id: recipe.id,
        recipe_data: recipe
      }])
      .select();

    console.log('Backend: Save result:', savedRecipe);
    console.log('Backend: Save error:', saveError);

    if (saveError) {
      console.error('Error saving recipe:', saveError);
      return res.status(500).json({ error: 'Failed to save recipe' });
    }

    res.json({ 
      success: true,
      message: 'Recipe saved successfully',
      recipe: savedRecipe[0]
    });
  } catch (error) {
    console.error('Error in save recipe route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/saved-recipes/:id - Remove a saved recipe
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const recipeId = req.params.id;

    // First, try to delete by the row's primary key (id)
    const { data: rowById, error: rowByIdError } = await supabase
      .from('saved_recipes')
      .select('*')
      .eq('user_id', userId)
      .eq('id', recipeId)
      .single();

    if (rowById && !rowByIdError) {
      // Row exists, delete by PK
      const { error } = await supabase
        .from('saved_recipes')
        .delete()
        .eq('user_id', userId)
        .eq('id', recipeId);
      if (error) {
        console.error('Error removing saved recipe by PK:', error);
        return res.status(500).json({ error: 'Failed to remove recipe' });
      }
      return res.json({ success: true, message: 'Recipe removed successfully (by PK)' });
    }

    // Fallback: Determine if this is a Spoonacular recipe (integer ID) or local recipe (UUID)
    const isSpoonacularRecipe = !isNaN(recipeId);
    let query = supabase
      .from('saved_recipes')
      .delete()
      .eq('user_id', userId);
    if (isSpoonacularRecipe) {
      query = query.eq('spoonacular_id', parseInt(recipeId));
    } else {
      query = query.eq('recipe_id', recipeId);
    }
    const { error } = await query;
    if (error) {
      console.error('Error removing saved recipe:', error);
      return res.status(500).json({ error: 'Failed to remove recipe' });
    }
    res.json({ success: true, message: 'Recipe removed successfully' });
  } catch (error) {
    console.error('Error in remove recipe route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 