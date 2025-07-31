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
    const { title, ingredients, cuisine, readyInMinutes } = req.body;
    const userId = req.user.id;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    // Create input recipe object
    const inputRecipe = {
      title,
      ingredients: ingredients || [],
      cuisine: cuisine || '',
      readyInMinutes: readyInMinutes || 30
    };

    // Fetch relevant recipes (only user's own recipes)
    const candidates = await fetchRelevantRecipes(title, cuisine, userId);
    
    if (candidates.length > 0) {
      console.log('Found candidate recipes:', candidates.map(r => r.title));
    }

    // Get user's dynamic weights
    const userWeights = await getUserWeights(userId);
    const similarityWeights = {
      title: userWeights.title || 0.8,
      ingredients: userWeights.ingredients || 0.2
    };

    // Use the new optimized similarity computation with dynamic weights
    const warning = generateSimilarityWarning(inputRecipe, candidates, similarityWeights, 0.3);
    
    if (warning) {
      return res.json({
        hasSimilarRecipes: true,
        warning,
        autofillSuggestion: null,
        allMatches: warning.matches,
      });
    }

    const response = {
      hasSimilarRecipes: false,
      warning: null,
      autofillSuggestion: null,
      allMatches: []
    };

    res.json(response);

  } catch (error) {
    console.error('Error in similarity check:', error);
    res.status(500).json({ error: 'Failed to check similarity' });
  }
});

module.exports = router; 