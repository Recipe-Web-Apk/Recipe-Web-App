const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const { authenticateToken } = require('../middleware/auth');
const axios = require('axios');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

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
    instructionsRequired: false
  };
  try {
    const response = await axios.get('https://api.spoonacular.com/recipes/random', { params });
    return response.data.recipes || [];
  } catch (error) {
    console.error('Spoonacular fetch error:', error.response?.data || error.message);
    return [];
  }
}

// Main recommendation route
router.get('/:userId', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.userId;
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
    res.json(top10);
  } catch (err) {
    console.error('Recommendation error:', err);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

module.exports = router; 