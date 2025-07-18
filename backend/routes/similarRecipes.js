const express = require('express');
const router = express.Router();
const { computeOptimizedSimilarity } = require('../utils/noLibraryRecipeSimilarity');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

router.post('/similar-recipes', async (req, res) => {
  const { title, ingredients } = req.body;
  if (!title || !ingredients) return res.status(400).json({ error: 'Missing fields' });

  const { data: recipes } = await supabase.from('recipes').select('id, title, ingredients');
  const input = { title, ingredients };

  const matches = recipes.map(r => {
    const { score, titleScore, ingredientsScore } = computeOptimizedSimilarity(input, r);
    return { recipe: r, score, titleScore, ingredientsScore };
  });

  const topMatches = matches.filter(r => r.score > 0.6).sort((a, b) => b.score - a.score).slice(0, 5);
  res.json(topMatches);
});

module.exports = router; 