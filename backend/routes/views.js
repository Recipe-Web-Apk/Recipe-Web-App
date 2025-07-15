const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const { authenticateToken } = require('../middleware/auth');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// POST /api/views - Record a view
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { recipe_id } = req.body;
    if (!recipe_id) {
      return res.status(400).json({ error: 'Recipe ID is required' });
    }
    const { data, error } = await supabase
      .from('views')
      .insert([{ user_id: userId, recipe_id }])
      .select();
    if (error) {
      return res.status(500).json({ error: 'Failed to record view' });
    }
    res.json({ success: true, view: data[0] });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/views - Get all views for the logged-in user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { data, error } = await supabase
      .from('views')
      .select('*')
      .eq('user_id', userId)
      .order('viewed_at', { ascending: false });
    if (error) {
      return res.status(500).json({ error: 'Failed to fetch views' });
    }
    res.json({ success: true, views: data });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 