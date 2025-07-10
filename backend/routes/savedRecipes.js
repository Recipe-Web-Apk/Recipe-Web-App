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
    
    const { data: savedRecipes, error } = await supabase
      .from('saved_recipes')
      .select('recipe_data')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching saved recipes:', error);
      return res.status(500).json({ error: 'Failed to fetch saved recipes' });
    }

    // Extract recipe data from the saved_recipes table
    const recipes = savedRecipes?.map(item => item.recipe_data) || [];
    
    res.json({ recipes });
  } catch (error) {
    console.error('Error in saved recipes route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/saved-recipes - Save a recipe
router.post('/', authenticateToken, async (req, res) => {
  try {
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

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking existing recipe:', checkError);
      return res.status(500).json({ error: 'Failed to check existing recipe' });
    }

    if (existingRecipe) {
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

    if (saveError) {
      console.error('Error saving recipe:', saveError);
      return res.status(500).json({ error: 'Failed to save recipe' });
    }

    res.json({ 
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

    // Determine if this is a Spoonacular recipe (integer ID) or local recipe (UUID)
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

    res.json({ message: 'Recipe removed successfully' });
  } catch (error) {
    console.error('Error in remove recipe route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 