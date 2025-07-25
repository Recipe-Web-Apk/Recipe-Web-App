const express = require('express');
const router = express.Router();
const { computeOptimizedSimilarity } = require('../utils/similarityUtils');
const { 
  computeOptimizedSimilarityWithDynamicScoring,
  trackSimilarityInteraction,
  getSimilarityMetrics,
  SIMILARITY_TARGET_VALUES
} = require('../utils/dynamicSimilarityScoring');
const { createClient } = require('@supabase/supabase-js');
const { authenticateToken } = require('../middleware/auth');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Enhanced similarity check with dynamic scoring
router.post('/similar-recipes', authenticateToken, async (req, res) => {
  const { title, ingredients } = req.body;
  const userId = req.user.id;
  
  if (!title || !ingredients) return res.status(400).json({ error: 'Missing fields' });

  try {
    const { data: recipes } = await supabase.from('recipes').select('id, title, ingredients, cuisine, readyInMinutes, difficulty, diets, tags');
    console.log('[SIMILARITY] All recipes in DB:', recipes);
    
    const input = { title, ingredients };
    const matches = [];

    // Compare with each existing recipe using dynamic scoring
    for (const recipe of recipes) {
      const dynamicResult = await computeOptimizedSimilarityWithDynamicScoring(input, recipe, userId);
      
      console.log(`[SIMILARITY] Dynamic comparison: input="${input.title}" vs recipe="${recipe.title}" | score=${dynamicResult.similarityScore.toFixed(3)}`);
      console.log(`[SIMILARITY] Feature breakdown:`, dynamicResult.breakdown);
      
      matches.push({
        recipe,
        score: dynamicResult.similarityScore,
        features: dynamicResult.features,
        weights: dynamicResult.weights,
        breakdown: dynamicResult.breakdown
      });
    }

    // Filter and sort by dynamic score
    const topMatches = matches
      .filter(r => r.score > 0.1)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
    
    console.log('[SIMILARITY] Top dynamic matches:', topMatches);
    res.json(topMatches);
    
  } catch (error) {
    console.error('[SIMILARITY] Error:', error);
    res.status(500).json({ error: 'Failed to check similarity' });
  }
});

// Track user similarity feedback
router.post('/similarity-feedback', authenticateToken, async (req, res) => {
  const { recipe1Id, recipe2Id, recipe1Data, recipe2Data, judgment } = req.body;
  const userId = req.user.id;
  
  if (!recipe1Id || !recipe2Id || !recipe1Data || !recipe2Data || !judgment) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (!SIMILARITY_TARGET_VALUES[judgment]) {
    return res.status(400).json({ 
      error: 'Invalid judgment', 
      validJudgments: Object.keys(SIMILARITY_TARGET_VALUES) 
    });
  }

  try {
    const success = await trackSimilarityInteraction(userId, recipe1Id, recipe2Id, recipe1Data, recipe2Data, judgment);
    
    if (success) {
      res.json({ success: true, message: 'Similarity feedback recorded' });
    } else {
      res.status(500).json({ error: 'Failed to record feedback' });
    }
  } catch (error) {
    console.error('Error recording similarity feedback:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's similarity weights
router.get('/similarity-weights', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  
  try {
    const { data: weights, error } = await supabase
      .from('similarity_feature_weights')
      .select('feature_name, weight, last_updated')
      .eq('user_id', userId)
      .order('feature_name');
    
    if (error) {
      console.error('Error fetching similarity weights:', error);
      return res.status(500).json({ error: 'Failed to fetch weights' });
    }
    
    res.json({ weights: weights || [] });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get similarity metrics
router.get('/similarity-metrics', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  
  try {
    const metrics = await getSimilarityMetrics(userId);
    
    if (metrics) {
      res.json(metrics);
    } else {
      res.status(500).json({ error: 'Failed to fetch metrics' });
    }
  } catch (error) {
    console.error('Error getting similarity metrics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 