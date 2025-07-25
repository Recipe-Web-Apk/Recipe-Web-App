/**
 * Similarity check route
 */

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

const { generateSimilarityWarning } = require('../utils/similarityUtils');
const { fetchRelevantRecipes, getUserWeights } = require('../similarity/storage');

/**
 * POST /api/recipe/check-similarity
 * Check for similar recipes and return warnings
 */
router.post('/check-similarity', authenticateToken, async (req, res) => {
  try {
    console.log('🔍 SIMILARITY CHECK: Route hit successfully');
    const { title, ingredients, cuisine, readyInMinutes } = req.body;
    const userId = req.user.id;

    if (!title) {
      console.log('❌ SIMILARITY CHECK: No title provided');
      return res.status(400).json({ error: 'Title is required' });
    }

    console.log('🔍 SIMILARITY CHECK: Processing request for:', { title, ingredients, cuisine, readyInMinutes, userId });

    // Create input recipe object
    const inputRecipe = {
      title,
      ingredients: ingredients || [],
      cuisine: cuisine || '',
      readyInMinutes: readyInMinutes || 30
    };

    // Fetch relevant recipes (only user's own recipes)
    console.log('🔍 SIMILARITY CHECK: Fetching relevant recipes...');
    console.log('🔍 SIMILARITY CHECK: About to call fetchRelevantRecipes with:', { title, cuisine, userId });
    const candidates = await fetchRelevantRecipes(title, cuisine, userId);
    console.log(`🔍 SIMILARITY CHECK: fetchRelevantRecipes returned ${candidates.length} candidates`);
    console.log('🔍 SIMILARITY CHECK: Candidates:', candidates);
    
    if (candidates.length > 0) {
      console.log('🔍 SIMILARITY CHECK: Candidate recipes:', candidates.map(r => r.title));
    }

    // Get user's dynamic weights
    const userWeights = await getUserWeights(userId);
    const similarityWeights = {
      title: userWeights.title || 0.8,
      ingredients: userWeights.ingredients || 0.2
    };

    // Use the new optimized similarity computation with dynamic weights
    console.log('🔍 SIMILARITY CHECK: Computing similarity with weights:', similarityWeights);
    const warning = generateSimilarityWarning(inputRecipe, candidates, similarityWeights, 0.3);
    
    if (warning) {
      console.log('🔍 SIMILARITY CHECK: WARNING DETECTED!', warning.type, warning.message);
      return res.json({
        hasSimilarRecipes: true,
        warning,
        autofillSuggestion: null,
        allMatches: warning.matches,
      });
    } else {
      console.log('🔍 SIMILARITY CHECK: No similarity warning detected');
    }

    const response = {
      hasSimilarRecipes: false,
      warning: null,
      autofillSuggestion: null,
      allMatches: []
    };

    console.log('Similarity check response:', {
      hasSimilarRecipes: response.hasSimilarRecipes,
      warningType: warning?.type,
      matchCount: warning?.matches?.length || 0
    });

    res.json(response);

  } catch (error) {
    console.error('Error in similarity check:', error);
    res.status(500).json({ error: 'Failed to check similarity' });
  }
});

module.exports = router; 