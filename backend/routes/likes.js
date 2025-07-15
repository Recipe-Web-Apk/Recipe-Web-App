const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const { authenticateToken } = require('../middleware/auth');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { data, error } = await supabase
      .from('likes')
      .select('*')
      .eq('user_id', userId);
    if (error) {
      return res.status(500).json({ error: 'Failed to fetch liked recipes' });
    }
    // If recipe_data exists, use it as the recipe object
    const likes = data.map(like => like.recipe_data ? { ...like.recipe_data, liked_id: like.id } : like);
    res.json({ success: true, likes });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { recipe_id, recipe_data } = req.body;
    if (!recipe_id) {
      return res.status(400).json({ error: 'Recipe ID is required' });
    }
    const { data: existingLike, error: checkError } = await supabase
      .from('likes')
      .select('*')
      .eq('user_id', userId)
      .eq('recipe_id', recipe_id)
      .single();
    if (checkError && checkError.code !== 'PGRST116') {
      return res.status(500).json({ error: 'Failed to check existing like' });
    }
    if (existingLike) {
      return res.status(400).json({ error: 'Recipe is already liked' });
    }
    const { data: newLike, error: likeError } = await supabase
      .from('likes')
      .insert([{
        user_id: userId,
        recipe_id,
        recipe_data: recipe_data || null
      }])
      .select();
    if (likeError) {
      return res.status(500).json({ error: 'Failed to like recipe' });
    }
    res.json({ 
      success: true,
      message: 'Recipe liked successfully',
      like: newLike[0]
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:recipeId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const recipeId = req.params.recipeId;
    if (!recipeId) {
      return res.status(400).json({ error: 'Recipe ID is required' });
    }
    const { error: unlikeError } = await supabase
      .from('likes')
      .delete()
      .eq('user_id', userId)
      .eq('recipe_id', recipeId);
    if (unlikeError) {
      return res.status(500).json({ error: 'Failed to unlike recipe' });
    }
    res.json({ 
      success: true,
      message: 'Recipe unliked successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/check/:recipeId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const recipeId = req.params.recipeId;
    if (!recipeId) {
      return res.status(400).json({ error: 'Recipe ID is required' });
    }
    const { data, error } = await supabase
      .from('likes')
      .select('*')
      .eq('user_id', userId)
      .eq('recipe_id', recipeId)
      .single();
    if (error && error.code !== 'PGRST116') {
      return res.status(500).json({ error: 'Failed to check like status' });
    }
    res.json({ 
      success: true,
      isLiked: !!data
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 