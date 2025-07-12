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
    console.log('Backend: Fetching saved recipes for user:', userId);
    console.log('Backend: User object from JWT:', req.user);
    
    // First, let's check all saved recipes in the database
    const { data: allSavedRecipes, error: allError } = await supabase
      .from('saved_recipes')
      .select('*');
    
    console.log('Backend: ALL saved recipes in database:', allSavedRecipes);
    console.log('Backend: Total count of all saved recipes:', allSavedRecipes?.length || 0);
    
    if (allSavedRecipes && allSavedRecipes.length > 0) {
      console.log('Backend: User IDs in saved recipes:', allSavedRecipes.map(r => r.user_id));
      console.log('Backend: Current user ID matches any saved recipes:', allSavedRecipes.some(r => r.user_id === userId));
    }
    
    // Now get the user's saved recipes
    const { data: savedRecipes, error } = await supabase
      .from('saved_recipes')
      .select('recipe_data')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    console.log('Backend: Raw saved recipes from Supabase:', savedRecipes);
    console.log('Backend: Supabase error:', error);

    if (error) {
      console.error('Error fetching saved recipes:', error);
      return res.status(500).json({ error: 'Failed to fetch saved recipes' });
    }

    // Log each saved recipe individually
    if (savedRecipes && savedRecipes.length > 0) {
      console.log('Backend: Number of saved recipes found:', savedRecipes.length);
      savedRecipes.forEach((item, index) => {
        console.log(`Backend: Saved recipe ${index + 1}:`, {
          id: item.id,
          user_id: item.user_id,
          spoonacular_id: item.spoonacular_id,
          recipe_id: item.recipe_id,
          has_recipe_data: !!item.recipe_data,
          recipe_data_keys: item.recipe_data ? Object.keys(item.recipe_data) : 'null'
        });
      });
    }

    // Extract recipe data from the saved_recipes table
    const recipes = savedRecipes?.map(item => item.recipe_data).filter(recipe => recipe !== null) || [];
    console.log('Backend: Extracted recipes:', recipes);
    console.log('Backend: Number of extracted recipes:', recipes.length);
    
    res.json({ success: true, recipes });
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

    console.log('Backend: Saving recipe for user:', userId);
    console.log('Backend: User object from JWT:', req.user);
    console.log('Backend: Recipe data to save:', recipe);

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

    res.json({ success: true, message: 'Recipe removed successfully' });
  } catch (error) {
    console.error('Error in remove recipe route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 