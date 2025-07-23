const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const { authenticateToken } = require('../middleware/auth');
const axios = require('axios');
const { 
  trackUserInteraction, 
  getRegressionRecommendations, 
  scoreRecipeForUser,
  INTERACTION_TYPES 
} = require('../utils/regressionRecommendation');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Test endpoint without authentication (must be first)
router.get('/test/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log(`Testing recommendations for user: ${userId}`);
    
    // Fetch recipes from Spoonacular
    const spoonacularRecipes = await fetchSpoonacularRecipes(10);
    console.log(`Fetched ${spoonacularRecipes.length} recipes from Spoonacular`);
    
    if (spoonacularRecipes.length === 0) {
      console.log('No recipes fetched from Spoonacular');
      res.json([]);
      return;
    }
    
    // Score recipes using regression system
    const { scoreRecipeForUser, INTERACTION_TYPES } = require('../utils/regressionRecommendation');
    
    const scoredRecipes = await Promise.all(
      spoonacularRecipes.map(async (recipe) => {
        const likeScore = await scoreRecipeForUser(userId, recipe, INTERACTION_TYPES.LIKE);
        const saveScore = await scoreRecipeForUser(userId, recipe, INTERACTION_TYPES.SAVE);
        
        // Weighted combination: 60% like score, 40% save score
        const finalScore = (likeScore * 0.6) + (saveScore * 0.4);
        
        return {
          id: recipe.id,
          title: recipe.title,
          cuisine: recipe.cuisine,
          readyInMinutes: recipe.readyInMinutes,
          image: recipe.image,
          likeScore,
          saveScore,
          finalScore
        };
      })
    );
    
    // Sort by final score and return top recommendations
    const topRecommendations = scoredRecipes
      .sort((a, b) => b.finalScore - a.finalScore)
      .slice(0, 5);
    
    console.log(`Returning ${topRecommendations.length} test recommendations`);
    res.json(topRecommendations);
    
  } catch (err) {
    console.error('Test recommendation error:', err);
    res.status(500).json({ error: 'Failed to generate test recommendations', details: err.message });
  }
});

// Helper functions for fetching user data
async function getUserPreferences(userId) {
  const { data, error } = await supabase
    .from('users')
    .select('preferences, diet, cuisine, cookingStyles, dietaryTags')
    .eq('id', userId)
    .single();
  return error ? null : data;
}

async function getUserLikedRecipes(userId) {
  const { data, error } = await supabase
    .from('likes')
    .select('recipe_id, created_at, recipes (id, title, tags, cuisine, season, dairy_free, ingredients, cookingStyle, cookingMethod, created_at)')
    .eq('user_id', userId);
  if (error) return [];
  return data.map(row => ({ ...row.recipes, created_at: row.created_at })).filter(Boolean);
}

async function getUserSavedRecipes(userId) {
  const { data, error } = await supabase
    .from('saved_recipes')
    .select('spoonacular_id, created_at, recipe_data')
    .eq('user_id', userId);
  if (error) return [];
  return data.map(row => ({ ...row.recipe_data, created_at: row.created_at })).filter(Boolean);
}

async function getUserViewedRecipes(userId) {
  const { data, error } = await supabase
    .from('views')
    .select('recipe_id, created_at, recipes (id, title, tags, cuisine, season, dairy_free, ingredients, cookingStyle, cookingMethod, created_at)')
    .eq('user_id', userId);
  if (error) return [];
  return data.map(row => ({ ...row.recipes, created_at: row.created_at })).filter(Boolean);
}

async function getAllRecipes() {
  const { data, error } = await supabase
    .from('recipes')
    .select('*');
  return error ? [] : data;
}

// Helper: Weighted overlap
function computeWeightedOverlapMap(items, weightedMap) {
  if (!items || items.length === 0) return 0;
  let total = 0;
  items.forEach(item => {
    if (weightedMap.has(item)) {
      total += weightedMap.get(item);
    }
  });
  const maxPossible = Array.from(weightedMap.values()).reduce((a, b) => a + b, 0);
  return maxPossible === 0 ? 0 : total / maxPossible;
}

// Helper: Preference match
function computePreferenceMatch(recipe, preferences) {
  if (!preferences || !recipe) return 0;
  const matchesCuisine = Array.isArray(preferences.cuisine)
    ? preferences.cuisine.includes(recipe.cuisine)
    : preferences.cuisine === recipe.cuisine;
  const dietaryTags = preferences.dietaryTags || preferences.diet || [];
  const matchesDiet = Array.isArray(dietaryTags)
    ? dietaryTags.every(tag => Array.isArray(recipe.tags) && recipe.tags.includes(tag))
    : true;
  const matchesCookingStyle = preferences.cookingStyles && recipe.cookingStyle
    ? preferences.cookingStyles.includes(recipe.cookingStyle)
    : true;
  return matchesCuisine && matchesDiet && matchesCookingStyle ? 1 : 0;
}

// Helper: Seasonality
function isCurrentlyInSeason(seasonTag) {
  const month = new Date().getMonth();
  const currentSeason = getSeasonFromMonth(month);
  if (!seasonTag) return false;
  if (Array.isArray(seasonTag)) {
    return seasonTag.includes(currentSeason);
  }
  return seasonTag === currentSeason;
}

function getSeasonFromMonth(month) {
  if ([11, 0, 1].includes(month)) return 'winter';
  if ([2, 3, 4].includes(month)) return 'spring';
  if ([5, 6, 7].includes(month)) return 'summer';
  if ([8, 9, 10].includes(month)) return 'fall';
}

// Helper: Diversity
function getDiverseRecommendations(sortedRecipes, preferences, count) {
  if (!preferences) return [];
  const diverse = sortedRecipes.filter(recipe => {
    const recipeCuisine = recipe.cuisine || '';
    const recipeCookingStyle = recipe.cookingStyle || '';
    const prefCuisine = Array.isArray(preferences.cuisine) ? preferences.cuisine : [];
    const prefCookingStyles = Array.isArray(preferences.cookingStyles) ? preferences.cookingStyles : [];
    return !prefCuisine.includes(recipeCuisine) ||
      (prefCookingStyles.length > 0 && !prefCookingStyles.includes(recipeCookingStyle));
  });
  const shuffled = diverse.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Helper: Collaborative filtering (simple version)
async function getCollaborativeRecommendations(userId, likedRecipeIds, count) {
  // Find users who liked the same recipes
  const { data: similarLikes } = await supabase
    .from('likes')
    .select('user_id')
    .in('recipe_id', likedRecipeIds)
    .neq('user_id', userId);
  if (!similarLikes || similarLikes.length === 0) return [];
  const similarUserIds = Array.from(new Set(similarLikes.map(like => like.user_id)));
  // Find recipes liked by those users
  const { data: otherLikes } = await supabase
    .from('likes')
    .select('recipe_id, recipes (id, title, tags, cuisine, season, dairy_free, ingredients, cookingStyle, cookingMethod, created_at)')
    .in('user_id', similarUserIds);
  if (!otherLikes || otherLikes.length === 0) return [];
  const otherRecipes = otherLikes.map(row => row.recipes).filter(Boolean);
  // Remove recipes already liked by the user
  const unique = otherRecipes.filter(r => !likedRecipeIds.includes(r.id));
  const shuffled = unique.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Helper to fetch a batch of recipes from Spoonacular
async function fetchSpoonacularRecipes(batchSize = 50) {
  const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;
  const params = {
    apiKey: SPOONACULAR_API_KEY,
    number: batchSize,
    addRecipeInformation: true,
    fillIngredients: true,
    instructionsRequired: false,
    addRecipeNutrition: true // Include nutrition information including calories
  };
  try {
    const response = await axios.get('https://api.spoonacular.com/recipes/random', { params });
    return response.data.recipes || [];
  } catch (error) {
    console.error('Spoonacular fetch error:', error.response?.data || error.message);
    return [];
  }
}

// Track recipe like interaction
router.post('/track-like/:userId', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    const { recipeId, spoonacularId } = req.body;
    
    if (!recipeId && !spoonacularId) {
      return res.status(400).json({ error: 'Recipe ID or Spoonacular ID required' });
    }
    
    const success = await trackUserInteraction(userId, recipeId, spoonacularId, INTERACTION_TYPES.LIKE);
    
    if (success) {
      res.json({ success: true, message: 'Like tracked successfully' });
    } else {
      res.status(500).json({ error: 'Failed to track like' });
    }
  } catch (error) {
    console.error('Error tracking like:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Track recipe save interaction
router.post('/track-save/:userId', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    const { recipeId, spoonacularId } = req.body;
    
    if (!recipeId && !spoonacularId) {
      return res.status(400).json({ error: 'Recipe ID or Spoonacular ID required' });
    }
    
    const success = await trackUserInteraction(userId, recipeId, spoonacularId, INTERACTION_TYPES.SAVE);
    
    if (success) {
      res.json({ success: true, message: 'Save tracked successfully' });
    } else {
      res.status(500).json({ error: 'Failed to track save' });
    }
  } catch (error) {
    console.error('Error tracking save:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's regression model metrics
router.get('/metrics/:userId', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    
    const { data: metrics, error } = await supabase
      .from('regression_metrics')
      .select('*')
      .eq('user_id', userId)
      .order('last_trained', { ascending: false });
    
    if (error) {
      console.error('Error fetching metrics:', error);
      return res.status(500).json({ error: 'Failed to fetch metrics' });
    }
    
    res.json(metrics || []);
  } catch (error) {
    console.error('Error getting metrics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's feature weights
router.get('/weights/:userId', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    
    const { data: weights, error } = await supabase
      .from('user_feature_weights')
      .select('*')
      .eq('user_id', userId)
      .order('interaction_type, feature_name');
    
    if (error) {
      console.error('Error fetching weights:', error);
      return res.status(500).json({ error: 'Failed to fetch weights' });
    }
    
    // Group weights by interaction type
    const groupedWeights = {};
    weights.forEach(weight => {
      if (!groupedWeights[weight.interaction_type]) {
        groupedWeights[weight.interaction_type] = [];
      }
      groupedWeights[weight.interaction_type].push({
        feature: weight.feature_name,
        weight: weight.weight,
        lastUpdated: weight.last_updated
      });
    });
    
    res.json(groupedWeights);
  } catch (error) {
    console.error('Error getting weights:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Main recommendation route - now uses regression system
router.get('/:userId', /* authenticateToken, */ async (req, res) => {
  try {
    const userId = req.params.userId;
    const useRegression = req.query.regression !== 'false'; // Default to true
    
    if (useRegression) {
      // Use new regression-based recommendations
      console.log(`Getting regression recommendations for user: ${userId}`);
      
      // Fetch recipes from Spoonacular
      const spoonacularRecipes = await fetchSpoonacularRecipes(50);
      console.log(`Fetched ${spoonacularRecipes.length} recipes from Spoonacular`);
      
      if (spoonacularRecipes.length === 0) {
        console.log('No recipes fetched from Spoonacular, using fallback');
        // Fallback to original algorithm if no Spoonacular recipes
        const recommendations = await getFallbackRecommendations(userId);
        res.json(recommendations);
        return;
      }
      
      // Score recipes using regression system
      const { scoreRecipeForUser, INTERACTION_TYPES } = require('../utils/regressionRecommendation');
      
      const scoredRecipes = await Promise.all(
        spoonacularRecipes.map(async (recipe) => {
          const likeScore = await scoreRecipeForUser(userId, recipe, INTERACTION_TYPES.LIKE);
          const saveScore = await scoreRecipeForUser(userId, recipe, INTERACTION_TYPES.SAVE);
          
          // Weighted combination: 60% like score, 40% save score
          const finalScore = (likeScore * 0.6) + (saveScore * 0.4);
          
          return {
            ...recipe,
            likeScore,
            saveScore,
            finalScore
          };
        })
      );
      
      // Sort by final score and return top recommendations
      const topRecommendations = scoredRecipes
        .sort((a, b) => b.finalScore - a.finalScore)
        .slice(0, 10);
      
      console.log(`Returning ${topRecommendations.length} regression recommendations`);
      res.json(topRecommendations);
      
    } else {
      // Fallback to original algorithm
      const recommendations = await getFallbackRecommendations(userId);
      res.json(recommendations);
    }
  } catch (err) {
    console.error('Recommendation error:', err);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

// Fallback recommendation function
async function getFallbackRecommendations(userId) {
  const preferences = await getUserPreferences(userId);
  const liked = await getUserLikedRecipes(userId);
  const viewed = await getUserViewedRecipes(userId);
  const saved = await getUserSavedRecipes(userId);
  const now = new Date();
  
  // Weighted interactions
  const interactions = [
    ...liked.map(r => ({ ...r, baseWeight: 1.0 })),
    ...saved.map(r => ({ ...r, baseWeight: 0.7 })),
    ...viewed.map(r => ({ ...r, baseWeight: 0.3 })),
  ];
  
  // Weighted maps
  const weightedTags = new Map();
  const weightedIngredients = new Map();
  const weightedCookingStyles = new Map();
  const weightedCookingMethods = new Map();
  
  interactions.forEach(({ tags = [], ingredients = [], cookingStyle, cookingMethod, created_at, baseWeight }) => {
    const daysAgo = (now - new Date(created_at)) / (1000 * 60 * 60 * 24);
    const decay = Math.exp(-0.05 * daysAgo);
    const finalWeight = baseWeight * decay;
    
    tags.forEach(tag => {
      weightedTags.set(tag, (weightedTags.get(tag) || 0) + finalWeight);
    });
    ingredients.forEach(ingredient => {
      weightedIngredients.set(ingredient, (weightedIngredients.get(ingredient) || 0) + finalWeight);
    });
    if (cookingStyle) {
      weightedCookingStyles.set(cookingStyle, (weightedCookingStyles.get(cookingStyle) || 0) + finalWeight);
    }
    if (cookingMethod) {
      weightedCookingMethods.set(cookingMethod, (weightedCookingMethods.get(cookingMethod) || 0) + finalWeight);
    }
  });
  
  // Fetch candidate recipes from Spoonacular
  const spoonacularRecipes = await fetchSpoonacularRecipes(50);
  
  // Score all Spoonacular recipes
  const scored = spoonacularRecipes.map(recipe => {
    const tagSimilarity = computeWeightedOverlapMap(recipe.diets || recipe.tags, weightedTags);
    const ingredientSimilarity = computeWeightedOverlapMap(
      (recipe.extendedIngredients || []).map(ing => ing.name || ing.original || ''),
      weightedIngredients
    );
    const cookingStyleMatch = recipe.cookingStyle && weightedCookingStyles.has(recipe.cookingStyle) ? 1 : 0;
    const cookingMethodMatch = recipe.cookingMethod && weightedCookingMethods.has(recipe.cookingMethod) ? 1 : 0;
    const preferenceMatch = computePreferenceMatch(recipe, preferences);
    const seasonMatch = isCurrentlyInSeason(recipe.season) ? 1 : 0;
    
    const finalScore =
      preferenceMatch * 0.35 +
      tagSimilarity * 0.2 +
      ingredientSimilarity * 0.15 +
      cookingStyleMatch * 0.1 +
      cookingMethodMatch * 0.1 +
      seasonMatch * 0.1;
    
    return { ...recipe, finalScore };
  });
  
  // Top 10 Spoonacular recipes
  const top10 = scored.sort((a, b) => b.finalScore - a.finalScore).slice(0, 10);
  return top10;
}

module.exports = router; 