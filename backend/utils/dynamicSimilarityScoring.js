const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Constants and Configuration
const CONSTANTS = {
  MIN_INTERACTIONS: 10,
  SIMILARITY_THRESHOLD: 0.6,
  MAX_TRAINING_SAMPLES: 100,
  LEARNING_RATE: 0.01,
  DEFAULT_WEIGHTS: {
    titleSimilarity: 0.3,
    ingredientSimilarity: 0.4,
    cuisineMatch: 0.1,
    cookingTimeMatch: 0.1,
    difficultyMatch: 0.05,
    dietaryMatch: 0.05
  }
};

const TARGET_VALUES = {
  SIMILAR: 1.0,
  NOT_SIMILAR: 0.0
};

// Feature extraction function
function extractSimilarityFeatures(recipe1, recipe2) {
  const features = {};
  
  // Title similarity using Levenshtein distance
  features.titleSimilarity = computeTitleSimilarity(recipe1.title, recipe2.title);
  
  // Ingredient similarity using Jaccard
  features.ingredientSimilarity = jaccardSimilarity(recipe1.ingredients || [], recipe2.ingredients || []);
  
  // Cuisine match (binary)
  features.cuisineMatch = recipe1.cuisine === recipe2.cuisine ? 1.0 : 0.0;
  
  // Cooking time similarity (normalized difference)
  const time1 = recipe1.readyInMinutes || recipe1.cookTime || 30;
  const time2 = recipe2.readyInMinutes || recipe2.cookTime || 30;
  features.cookingTimeMatch = 1.0 - (Math.abs(time1 - time2) / Math.max(time1, time2, 1));
  
  // Difficulty match (binary)
  features.difficultyMatch = recipe1.difficulty === recipe2.difficulty ? 1.0 : 0.0;
  
  // Dietary tags overlap
  features.dietaryMatch = computeTagOverlap(recipe1.dietaryTags || [], recipe2.dietaryTags || []);
  
  return features;
}

// Helper functions
function computeTitleSimilarity(title1, title2) {
  if (!title1 || !title2) return 0.0;
  
  const normalized1 = title1.toLowerCase().replace(/[^a-z0-9\s]/g, '');
  const normalized2 = title2.toLowerCase().replace(/[^a-z0-9\s]/g, '');
  
  const distance = levenshteinDistance(normalized1, normalized2);
  const maxLength = Math.max(normalized1.length, normalized2.length);
  
  return maxLength === 0 ? 1.0 : 1.0 - (distance / maxLength);
}

function levenshteinDistance(str1, str2) {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

function jaccardSimilarity(ingredients1, ingredients2) {
  if (!ingredients1 || !ingredients2) return 0.0;
  
  const set1 = new Set(ingredients1.map(ing => ing.toLowerCase().trim()));
  const set2 = new Set(ingredients2.map(ing => ing.toLowerCase().trim()));
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return union.size === 0 ? 1.0 : intersection.size / union.size;
}

function computeTagOverlap(tags1, tags2) {
  if (!tags1 || !tags2) return 0.0;
  
  const set1 = new Set(tags1.map(tag => tag.toLowerCase().trim()));
  const set2 = new Set(tags2.map(tag => tag.toLowerCase().trim()));
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return union.size === 0 ? 1.0 : intersection.size / union.size;
}

// User feedback tracking
async function trackSimilarityInteraction(userId, recipe1Id, recipe2Id, userJudgment) {
  try {
    // Get recipes from database
    const { data: recipe1 } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', recipe1Id)
      .single();
    
    const { data: recipe2 } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', recipe2Id)
      .single();
    
    if (!recipe1 || !recipe2) {
      console.error('One or both recipes not found');
      return;
    }
    
    const features = extractSimilarityFeatures(recipe1, recipe2);
    const judgmentValue = userJudgment === 'similar' ? TARGET_VALUES.SIMILAR : TARGET_VALUES.NOT_SIMILAR;
    
    // Save interaction to database
    const { error } = await supabase
      .from('similarity_interactions')
      .insert({
        user_id: userId,
        recipe1_id: recipe1Id,
        recipe2_id: recipe2Id,
        user_judgment: userJudgment,
        judgment_value: judgmentValue,
        recipe_features: features,
        timestamp: new Date().toISOString()
      });
    
    if (error) {
      console.error('Error saving similarity interaction:', error);
      return;
    }
    
    // Check if we have enough data to update weights
    const { count } = await supabase
      .from('similarity_interactions')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);
    
    if (count >= CONSTANTS.MIN_INTERACTIONS) {
      await updateSimilarityWeights(userId);
    }
    
  } catch (error) {
    console.error('Error tracking similarity interaction:', error);
  }
}

// Weight learning using linear regression
async function updateSimilarityWeights(userId) {
  try {
    // Get recent interactions
    const { data: interactions } = await supabase
      .from('similarity_interactions')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(CONSTANTS.MAX_TRAINING_SAMPLES);
    
    if (!interactions || interactions.length < CONSTANTS.MIN_INTERACTIONS) {
      return;
    }
    
    // Prepare training data
    const X = [];
    const y = [];
    
    for (const interaction of interactions) {
      const features = interaction.recipe_features;
      X.push([
        features.titleSimilarity,
        features.ingredientSimilarity,
        features.cuisineMatch,
        features.cookingTimeMatch,
        features.difficultyMatch,
        features.dietaryMatch
      ]);
      y.push(interaction.judgment_value);
    }
    
    // Train linear regression model
    const weights = trainLinearRegression(X, y);
    
    // Normalize weights to sum to 1.0
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    const normalizedWeights = weights.map(w => w / totalWeight);
    
    // Save weights to database
    const featureNames = ['titleSimilarity', 'ingredientSimilarity', 'cuisineMatch', 'cookingTimeMatch', 'difficultyMatch', 'dietaryMatch'];
    
    for (let i = 0; i < featureNames.length; i++) {
      await supabase
        .from('similarity_feature_weights')
        .upsert({
          user_id: userId,
          feature_name: featureNames[i],
          weight: normalizedWeights[i],
          last_updated: new Date().toISOString()
        });
    }
    
    // Calculate and save metrics
    const predictions = X.map(x => predict(x, normalizedWeights));
    const mse = calculateMSE(y, predictions);
    const r_squared = calculateRSquared(y, predictions);
    
    await supabase
      .from('similarity_metrics')
      .upsert({
        user_id: userId,
        mse: mse,
        r_squared: r_squared,
        last_trained: new Date().toISOString()
      });
    
  } catch (error) {
    console.error('Error updating similarity weights:', error);
  }
}

// Simple linear regression training
function trainLinearRegression(X, y) {
  // Simple gradient descent implementation
  const numFeatures = X[0].length;
  let weights = new Array(numFeatures).fill(0.1);
  
  for (let epoch = 0; epoch < 100; epoch++) {
    for (let i = 0; i < X.length; i++) {
      const prediction = predict(X[i], weights);
      const error = y[i] - prediction;
      
      for (let j = 0; j < numFeatures; j++) {
        weights[j] += CONSTANTS.LEARNING_RATE * error * X[i][j];
      }
    }
  }
  
  return weights;
}

function predict(features, weights) {
  return features.reduce((sum, feature, i) => sum + feature * weights[i], 0);
}

function calculateMSE(actual, predicted) {
  return actual.reduce((sum, a, i) => sum + Math.pow(a - predicted[i], 2), 0) / actual.length;
}

function calculateRSquared(actual, predicted) {
  const mean = actual.reduce((sum, a) => sum + a, 0) / actual.length;
  const ssRes = actual.reduce((sum, a, i) => sum + Math.pow(a - predicted[i], 2), 0);
  const ssTot = actual.reduce((sum, a) => sum + Math.pow(a - mean, 2), 0);
  
  return ssTot === 0 ? 1 : 1 - (ssRes / ssTot);
}

// Get user's similarity weights
async function getUserSimilarityWeights(userId) {
  try {
    const { data: weights } = await supabase
      .from('similarity_feature_weights')
      .select('feature_name, weight')
      .eq('user_id', userId);
    
    if (!weights || weights.length === 0) {
      return CONSTANTS.DEFAULT_WEIGHTS;
    }
    
    const weightMap = {};
    for (const weight of weights) {
      weightMap[weight.feature_name] = weight.weight;
    }
    
    return weightMap;
  } catch (error) {
    console.error('Error getting user similarity weights:', error);
    return CONSTANTS.DEFAULT_WEIGHTS;
  }
}

// Dynamic similarity computation
async function computeDynamicSimilarity(userId, recipe1, recipe2) {
  const weights = await getUserSimilarityWeights(userId);
  const features = extractSimilarityFeatures(recipe1, recipe2);
  
  let score = 0;
  for (const [featureName, weight] of Object.entries(weights)) {
    score += features[featureName] * weight;
  }
  
  return score;
}

// Main similarity check function
async function checkSimilarityWithDynamicScoring(userId, newRecipe, existingRecipes) {
  const similarRecipes = [];
  
  for (const existingRecipe of existingRecipes) {
    const similarityScore = await computeDynamicSimilarity(userId, newRecipe, existingRecipe);
    
    if (similarityScore >= CONSTANTS.SIMILARITY_THRESHOLD) {
      similarRecipes.push({
        recipe: existingRecipe,
        score: similarityScore,
        features: extractSimilarityFeatures(newRecipe, existingRecipe)
      });
    }
  }
  
  // Sort by similarity score
  similarRecipes.sort((a, b) => b.score - a.score);
  
  return similarRecipes;
}

module.exports = {
  extractSimilarityFeatures,
  trackSimilarityInteraction,
  updateSimilarityWeights,
  getUserSimilarityWeights,
  computeDynamicSimilarity,
  checkSimilarityWithDynamicScoring,
  TARGET_VALUES,
  CONSTANTS
}; 