const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// CONSTANTS
const INTERACTION_TYPES = {
  LIKE: 'like',
  SAVE: 'save'
};

const TARGET_VALUES = {
  [INTERACTION_TYPES.LIKE]: 1,
  [INTERACTION_TYPES.SAVE]: 2
};

const FEATURE_DIMENSIONS = [
  'tagSimilarity',
  'ingredientSimilarity',
  'cookingStyleMatch',
  'cookingMethodMatch',
  'seasonMatch',
  'preferenceMatch'
];

// FEATURE EXTRACTION
function extractRecipeFeatures(recipe, userPreferences, userHistory) {
  return {
    tagSimilarity: computeTagSimilarity(recipe, userHistory),
    ingredientSimilarity: computeIngredientSimilarity(recipe, userHistory),
    cookingStyleMatch: computeCookingStyleMatch(recipe, userHistory),
    cookingMethodMatch: computeCookingMethodMatch(recipe, userHistory),
    seasonMatch: computeSeasonMatch(recipe),
    preferenceMatch: computePreferenceMatch(recipe, userPreferences)
  };
}

function computeTagSimilarity(recipe, userHistory) {
  if (!userHistory || userHistory.length === 0) return 0;
  
  const userTags = new Map();
  const now = new Date();
  
  // Build weighted tag map from user history
  userHistory.forEach(interaction => {
    const daysAgo = (now - new Date(interaction.created_at)) / (1000 * 60 * 60 * 24);
    const decay = Math.exp(-0.05 * daysAgo);
    const weight = interaction.interaction_type === 'save' ? 2 : 1;
    const finalWeight = weight * decay;
    
    if (interaction.recipe_features && interaction.recipe_features.tags) {
      interaction.recipe_features.tags.forEach(tag => {
        userTags.set(tag, (userTags.get(tag) || 0) + finalWeight);
      });
    }
  });
  
  if (userTags.size === 0) return 0;
  
  // Calculate overlap with current recipe
  const recipeTags = recipe.tags || recipe.diets || [];
  let totalOverlap = 0;
  let maxPossible = 0;
  
  recipeTags.forEach(tag => {
    if (userTags.has(tag)) {
      totalOverlap += userTags.get(tag);
    }
  });
  
  maxPossible = Array.from(userTags.values()).reduce((a, b) => a + b, 0);
  
  return maxPossible > 0 ? totalOverlap / maxPossible : 0;
}

function computeIngredientSimilarity(recipe, userHistory) {
  if (!userHistory || userHistory.length === 0) return 0;
  
  const userIngredients = new Map();
  const now = new Date();
  
  // Build weighted ingredient map from user history
  userHistory.forEach(interaction => {
    const daysAgo = (now - new Date(interaction.created_at)) / (1000 * 60 * 60 * 24);
    const decay = Math.exp(-0.05 * daysAgo);
    const weight = interaction.interaction_type === 'save' ? 2 : 1;
    const finalWeight = weight * decay;
    
    if (interaction.recipe_features && interaction.recipe_features.ingredients) {
      interaction.recipe_features.ingredients.forEach(ingredient => {
        userIngredients.set(ingredient, (userIngredients.get(ingredient) || 0) + finalWeight);
      });
    }
  });
  
  if (userIngredients.size === 0) return 0;
  
  // Calculate overlap with current recipe
  const recipeIngredients = recipe.extendedIngredients || recipe.ingredients || [];
  const ingredientNames = recipeIngredients.map(ing => 
    typeof ing === 'string' ? ing : (ing.name || ing.original || '')
  );
  
  let totalOverlap = 0;
  let maxPossible = 0;
  
  ingredientNames.forEach(ingredient => {
    if (userIngredients.has(ingredient)) {
      totalOverlap += userIngredients.get(ingredient);
    }
  });
  
  maxPossible = Array.from(userIngredients.values()).reduce((a, b) => a + b, 0);
  
  return maxPossible > 0 ? totalOverlap / maxPossible : 0;
}

function computeCookingStyleMatch(recipe, userHistory) {
  if (!userHistory || userHistory.length === 0) return 0;
  
  const userStyles = new Map();
  const now = new Date();
  
  // Build weighted cooking style map from user history
  userHistory.forEach(interaction => {
    const daysAgo = (now - new Date(interaction.created_at)) / (1000 * 60 * 60 * 24);
    const decay = Math.exp(-0.05 * daysAgo);
    const weight = interaction.interaction_type === 'save' ? 2 : 1;
    const finalWeight = weight * decay;
    
    if (interaction.recipe_features && interaction.recipe_features.cookingStyle) {
      const style = interaction.recipe_features.cookingStyle;
      userStyles.set(style, (userStyles.get(style) || 0) + finalWeight);
    }
  });
  
  if (userStyles.size === 0) return 0;
  
  // Check if current recipe's cooking style matches user preferences
  const recipeStyle = recipe.cookingStyle;
  if (!recipeStyle) return 0;
  
  return userStyles.has(recipeStyle) ? 1 : 0;
}

function computeCookingMethodMatch(recipe, userHistory) {
  if (!userHistory || userHistory.length === 0) return 0;
  
  const userMethods = new Map();
  const now = new Date();
  
  // Build weighted cooking method map from user history
  userHistory.forEach(interaction => {
    const daysAgo = (now - new Date(interaction.created_at)) / (1000 * 60 * 60 * 24);
    const decay = Math.exp(-0.05 * daysAgo);
    const weight = interaction.interaction_type === 'save' ? 2 : 1;
    const finalWeight = weight * decay;
    
    if (interaction.recipe_features && interaction.recipe_features.cookingMethod) {
      const method = interaction.recipe_features.cookingMethod;
      userMethods.set(method, (userMethods.get(method) || 0) + finalWeight);
    }
  });
  
  if (userMethods.size === 0) return 0;
  
  // Check if current recipe's cooking method matches user preferences
  const recipeMethod = recipe.cookingMethod;
  if (!recipeMethod) return 0;
  
  return userMethods.has(recipeMethod) ? 1 : 0;
}

function computeSeasonMatch(recipe) {
  const currentMonth = new Date().getMonth();
  const currentSeason = getSeasonFromMonth(currentMonth);
  
  if (!recipe.season) return 0;
  
  const recipeSeasons = Array.isArray(recipe.season) 
    ? recipe.season 
    : [recipe.season];
  
  return recipeSeasons.includes(currentSeason) ? 1 : 0;
}

function getSeasonFromMonth(month) {
  if ([11, 0, 1].includes(month)) return 'winter';
  if ([2, 3, 4].includes(month)) return 'spring';
  if ([5, 6, 7].includes(month)) return 'summer';
  if ([8, 9, 10].includes(month)) return 'fall';
  return 'all';
}

function computePreferenceMatch(recipe, userPreferences) {
  if (!userPreferences) return 0;
  
  let score = 0;
  let factors = 0;
  
  // Cuisine preference match
  if (userPreferences.cuisine && recipe.cuisine) {
    const cuisineMatch = Array.isArray(userPreferences.cuisine) 
      ? userPreferences.cuisine.includes(recipe.cuisine)
      : userPreferences.cuisine === recipe.cuisine;
    score += cuisineMatch ? 1 : 0;
    factors++;
  }
  
  // Dietary preference match
  if (userPreferences.dietaryTags && recipe.tags) {
    const dietaryTags = Array.isArray(userPreferences.dietaryTags) 
      ? userPreferences.dietaryTags 
      : [userPreferences.dietaryTags];
    
    const matchesDiet = dietaryTags.every(tag => recipe.tags.includes(tag));
    score += matchesDiet ? 1 : 0;
    factors++;
  }
  
  // Cooking style preference match
  if (userPreferences.cookingStyles && recipe.cookingStyle) {
    const styleMatch = userPreferences.cookingStyles.includes(recipe.cookingStyle);
    score += styleMatch ? 1 : 0;
    factors++;
  }
  
  return factors > 0 ? score / factors : 0;
}

// INTERACTION TRACKING
async function trackUserInteraction(userId, recipeId, spoonacularId, interactionType) {
  try {
    const recipe = await getRecipeData(recipeId, spoonacularId);
    const userPreferences = await getUserPreferences(userId);
    const userHistory = await getUserHistory(userId);
    
    const features = extractRecipeFeatures(recipe, userPreferences, userHistory);
    
    const interactionData = {
      user_id: userId,
      recipe_id: recipeId,
      spoonacular_id: spoonacularId,
      interaction_type: interactionType,
      interaction_value: TARGET_VALUES[interactionType],
      recipe_features: features
    };
    
    const { error } = await supabase
      .from('user_interactions')
      .insert(interactionData);
    
    if (error) {
      console.error('Error tracking interaction:', error);
      return false;
    }
    
    // Trigger weight update in background
    setTimeout(() => updateUserWeights(userId, interactionType), 1000);
    
    return true;
  } catch (error) {
    console.error('Error in trackUserInteraction:', error);
    return false;
  }
}

// WEIGHT UPDATING
async function updateUserWeights(userId, interactionType) {
  try {
    // Get training data for this user and interaction type
    const { data: interactions } = await supabase
      .from('user_interactions')
      .select('*')
      .eq('user_id', userId)
      .eq('interaction_type', interactionType)
      .order('created_at', { ascending: false })
      .limit(100);
    
    if (!interactions || interactions.length < 10) {
      return; // Need minimum data for regression
    }
    
    // Prepare training data
    const X = interactions.map(interaction => [
      interaction.recipe_features.tagSimilarity || 0,
      interaction.recipe_features.ingredientSimilarity || 0,
      interaction.recipe_features.cookingStyleMatch || 0,
      interaction.recipe_features.cookingMethodMatch || 0,
      interaction.recipe_features.seasonMatch || 0,
      interaction.recipe_features.preferenceMatch || 0
    ]);
    
    const y = interactions.map(interaction => interaction.interaction_value);
    
    // Perform linear regression
    const weights = performLinearRegression(X, y);
    
    // Update weights in database
    for (let i = 0; i < FEATURE_DIMENSIONS.length; i++) {
      const { error } = await supabase
        .from('user_feature_weights')
        .upsert({
          user_id: userId,
          interaction_type: interactionType,
          feature_name: FEATURE_DIMENSIONS[i],
          weight: weights[i] || 0,
          last_updated: new Date().toISOString()
        });
      
      if (error) {
        console.error('Error updating weight:', error);
      }
    }
    
    // Store model metrics
    const metrics = calculateModelMetrics(X, y, weights);
    await supabase
      .from('regression_metrics')
      .upsert({
        user_id: userId,
        model_version: 'v1',
        interaction_type: interactionType,
        mse: metrics.mse,
        r_squared: metrics.rSquared,
        feature_importance: metrics.featureImportance,
        training_samples: interactions.length,
        last_trained: new Date().toISOString()
      });
    
  } catch (error) {
    console.error('Error updating user weights:', error);
  }
}

// LINEAR REGRESSION IMPLEMENTATION
function performLinearRegression(X, y) {
  // Simple linear regression using normal equation
  const n = X.length;
  const p = X[0].length;
  
  // Add bias term (intercept)
  const XWithBias = X.map(row => [1, ...row]);
  
  // Normal equation: β = (X^T X)^(-1) X^T y
  const XT = transpose(XWithBias);
  const XTX = matrixMultiply(XT, XWithBias);
  const XTy = matrixMultiply(XT, [y]);
  
  // Invert XTX (simplified - for production use proper matrix library)
  const XTXInv = matrixInverse(XTX);
  const beta = matrixMultiply(XTXInv, XTy);
  
  // Return weights (skip bias term)
  return beta.slice(1).map(row => row[0]);
}

function transpose(matrix) {
  return matrix[0].map((_, i) => matrix.map(row => row[i]));
}

function matrixMultiply(A, B) {
  const result = [];
  for (let i = 0; i < A.length; i++) {
    result[i] = [];
    for (let j = 0; j < B[0].length; j++) {
      result[i][j] = 0;
      for (let k = 0; k < A[0].length; k++) {
        result[i][j] += A[i][k] * B[k][j];
      }
    }
  }
  return result;
}

function matrixInverse(matrix) {
  // Simplified matrix inversion for 2x2 or 3x3 matrices
  const n = matrix.length;
  
  if (n === 1) {
    return [[1 / matrix[0][0]]];
  }
  
  if (n === 2) {
    const det = matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
    if (Math.abs(det) < 1e-10) return matrix; // Singular matrix
    
    return [
      [matrix[1][1] / det, -matrix[0][1] / det],
      [-matrix[1][0] / det, matrix[0][0] / det]
    ];
  }
  
  // For larger matrices, return identity (simplified)
  return matrix.map((row, i) => 
    row.map((_, j) => i === j ? 1 : 0)
  );
}

function calculateModelMetrics(X, y, weights) {
  const n = X.length;
  const yMean = y.reduce((a, b) => a + b, 0) / n;
  
  // Calculate predictions
  const predictions = X.map(row => {
    return row.reduce((sum, feature, i) => sum + feature * (weights[i] || 0), 0);
  });
  
  // Calculate MSE
  const mse = predictions.reduce((sum, pred, i) => 
    sum + Math.pow(pred - y[i], 2), 0) / n;
  
  // Calculate R-squared
  const ssRes = predictions.reduce((sum, pred, i) => 
    sum + Math.pow(pred - y[i], 2), 0);
  const ssTot = y.reduce((sum, yi) => 
    sum + Math.pow(yi - yMean, 2), 0);
  const rSquared = 1 - (ssRes / ssTot);
  
  // Calculate feature importance (absolute weights)
  const featureImportance = weights.map((weight, i) => ({
    feature: FEATURE_DIMENSIONS[i],
    importance: Math.abs(weight)
  }));
  
  return { mse, rSquared, featureImportance };
}

// RECOMMENDATION SCORING
async function scoreRecipeForUser(userId, recipe, interactionType) {
  try {
    // Get user's feature weights
    const { data: weights } = await supabase
      .from('user_feature_weights')
      .select('feature_name, weight')
      .eq('user_id', userId)
      .eq('interaction_type', interactionType);
    
    if (!weights || weights.length === 0) {
      // Use default weights if no user-specific weights
      return calculateDefaultScore(recipe);
    }
    
    // Extract recipe features
    const userPreferences = await getUserPreferences(userId);
    const userHistory = await getUserHistory(userId);
    const features = extractRecipeFeatures(recipe, userPreferences, userHistory);
    
    // Calculate weighted score
    let score = 0;
    let totalWeight = 0;
    
    weights.forEach(({ feature_name, weight }) => {
      if (features[feature_name] !== undefined) {
        score += features[feature_name] * weight;
        totalWeight += Math.abs(weight);
      }
    });
    
    // Normalize score
    return totalWeight > 0 ? score / totalWeight : 0.5;
    
  } catch (error) {
    console.error('Error scoring recipe:', error);
    return 0.5;
  }
}

function calculateDefaultScore(recipe) {
  // Default scoring when no user weights available
  const features = {
    tagSimilarity: 0.5,
    ingredientSimilarity: 0.5,
    cookingStyleMatch: 0.5,
    cookingMethodMatch: 0.5,
    seasonMatch: computeSeasonMatch(recipe),
    preferenceMatch: 0.5
  };
  
  const defaultWeights = {
    tagSimilarity: 0.2,
    ingredientSimilarity: 0.2,
    cookingStyleMatch: 0.15,
    cookingMethodMatch: 0.15,
    seasonMatch: 0.1,
    preferenceMatch: 0.2
  };
  
  let score = 0;
  let totalWeight = 0;
  
  Object.entries(defaultWeights).forEach(([feature, weight]) => {
    if (features[feature] !== undefined) {
      score += features[feature] * weight;
      totalWeight += weight;
    }
  });
  
  return totalWeight > 0 ? score / totalWeight : 0.5;
}

// HELPER FUNCTIONS
async function getRecipeData(recipeId, spoonacularId) {
  if (recipeId) {
    const { data } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', recipeId)
      .single();
    return data;
  } else if (spoonacularId) {
    const { data } = await supabase
      .from('spoonacular_cache')
      .select('data')
      .eq('spoonacular_id', spoonacularId)
      .single();
    return data;
  }
  return null;
}

async function getUserPreferences(userId) {
  const { data } = await supabase
    .from('users')
    .select('preferences, diet, cuisine, cookingStyles, dietaryTags')
    .eq('id', userId)
    .single();
  return data;
}

async function getUserHistory(userId) {
  const { data } = await supabase
    .from('user_interactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(100);
  return data || [];
}

// MAIN RECOMMENDATION FUNCTION
async function getRegressionRecommendations(userId, limit = 10) {
  try {
    // Get candidate recipes from Spoonacular
    const spoonacularRecipes = await getSpoonacularRecipes(50);
    
    // Score recipes for like and save
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
    return scoredRecipes
      .sort((a, b) => b.finalScore - a.finalScore)
      .slice(0, limit);
    
  } catch (error) {
    console.error('Error getting regression recommendations:', error);
    return [];
  }
}

async function getSpoonacularRecipes(limit) {
  // This would fetch from Spoonacular API or cache
  // For now, return empty array - will be implemented in recommendations route
  return [];
}

module.exports = {
  trackUserInteraction,
  getRegressionRecommendations,
  scoreRecipeForUser,
  updateUserWeights,
  INTERACTION_TYPES,
  FEATURE_DIMENSIONS,
  TARGET_VALUES
}; 