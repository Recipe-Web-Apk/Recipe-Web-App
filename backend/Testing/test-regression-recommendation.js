const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

// Configuration
const BASE_URL = 'http://localhost:5000';
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Test data
const testUsers = [
  {
    id: 'test-regression-user-1',
    username: 'regressionuser1',
    preferences: {
      cuisine: ['italian', 'mexican'],
      diet: 'vegetarian',
      dietaryTags: ['vegetarian', 'healthy'],
      cookingStyles: ['quick', 'easy']
    }
  },
  {
    id: 'test-regression-user-2', 
    username: 'regressionuser2',
    preferences: {
      cuisine: ['asian', 'indian'],
      diet: 'vegan',
      dietaryTags: ['vegan', 'spicy'],
      cookingStyles: ['traditional', 'complex']
    }
  }
];

const testRecipes = [
  {
    id: 'regression-recipe-1',
    title: 'Spaghetti Carbonara',
    tags: ['italian', 'pasta', 'quick'],
    cuisine: 'italian',
    season: 'all',
    dairy_free: false,
    ingredients: ['pasta', 'eggs', 'bacon', 'cheese'],
    cookingStyle: 'quick',
    cookingMethod: 'stovetop',
    calories: 450,
    protein: 25,
    fat: 18,
    carbohydrates: 45,
    difficulty: 'medium',
    cookTime: 20,
    prepTime: 10
  },
  {
    id: 'regression-recipe-2',
    title: 'Vegetarian Tacos',
    tags: ['mexican', 'vegetarian', 'healthy'],
    cuisine: 'mexican',
    season: 'summer',
    dairy_free: true,
    ingredients: ['beans', 'corn', 'tomatoes', 'avocado'],
    cookingStyle: 'easy',
    cookingMethod: 'stovetop',
    calories: 320,
    protein: 12,
    fat: 8,
    carbohydrates: 52,
    difficulty: 'easy',
    cookTime: 15,
    prepTime: 10
  },
  {
    id: 'regression-recipe-3',
    title: 'Chicken Curry',
    tags: ['indian', 'spicy', 'traditional'],
    cuisine: 'indian',
    season: 'winter',
    dairy_free: false,
    ingredients: ['chicken', 'curry', 'rice', 'spices'],
    cookingStyle: 'traditional',
    cookingMethod: 'stovetop',
    calories: 380,
    protein: 35,
    fat: 12,
    carbohydrates: 28,
    difficulty: 'hard',
    cookTime: 45,
    prepTime: 20
  }
];

// Helper functions
async function createTestUser(user) {
  try {
    const { error } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        username: user.username,
        preferences: user.preferences,
        diet: user.preferences.diet,
        cuisine: user.preferences.cuisine
      });
    
    if (error) {
      console.error('Error creating test user:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error in createTestUser:', error);
    return false;
  }
}

async function createTestRecipe(recipe) {
  try {
    const { error } = await supabase
      .from('recipes')
      .upsert({
        id: recipe.id,
        title: recipe.title,
        tags: recipe.tags,
        cuisine: recipe.cuisine,
        season: recipe.season,
        dairy_free: recipe.dairy_free,
        ingredients: recipe.ingredients,
        cookingStyle: recipe.cookingStyle,
        cookingMethod: recipe.cookingMethod,
        calories: recipe.calories,
        difficulty: recipe.difficulty,
        cookTime: recipe.cookTime,
        prepTime: recipe.prepTime
      });
    
    if (error) {
      console.error('Error creating test recipe:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error in createTestRecipe:', error);
    return false;
  }
}

async function trackTestInteractions(userId, recipeId, interactions) {
  try {
    for (const interaction of interactions) {
      const response = await axios.post(
        `${BASE_URL}/recommendations/track-${interaction.type}/${userId}`,
        { recipeId },
        { headers: { Authorization: 'Bearer test-token' } }
      );
      
      if (response.status !== 200) {
        console.error(`Failed to track ${interaction.type}:`, response.data);
        return false;
      }
      
      // Wait a bit between interactions
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return true;
  } catch (error) {
    console.error('Error tracking interactions:', error.response?.data || error.message);
    return false;
  }
}

// Test functions
async function testDatabaseSetup() {
  console.log('\n🧪 Testing Database Setup...');
  
  try {
    // Create test users
    for (const user of testUsers) {
      const success = await createTestUser(user);
      if (!success) {
        console.error(`❌ Failed to create user: ${user.username}`);
        return false;
      }
    }
    
    // Create test recipes
    for (const recipe of testRecipes) {
      const success = await createTestRecipe(recipe);
      if (!success) {
        console.error(`❌ Failed to create recipe: ${recipe.title}`);
        return false;
      }
    }
    
    console.log('✅ Database setup completed successfully');
    return true;
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    return false;
  }
}

async function testInteractionTracking() {
  console.log('\n🧪 Testing Interaction Tracking...');
  
  try {
    const testUser = testUsers[0];
    const testRecipe = testRecipes[0];
    
    // Track various interactions (focus on like and save)
    const interactions = [
      { type: 'view', count: 3 },
      { type: 'like', count: 1 },
      { type: 'save', count: 1 }
    ];
    
    for (const interaction of interactions) {
      for (let i = 0; i < interaction.count; i++) {
        const response = await axios.post(
          `${BASE_URL}/recommendations/track-${interaction.type}/${testUser.id}`,
          { recipeId: testRecipe.id },
          { headers: { Authorization: 'Bearer test-token' } }
        );
        
        if (response.status !== 200) {
          console.error(`❌ Failed to track ${interaction.type}:`, response.data);
          return false;
        }
      }
    }
    
    console.log('✅ Interaction tracking completed successfully');
    return true;
  } catch (error) {
    console.error('❌ Interaction tracking failed:', error.response?.data || error.message);
    return false;
  }
}

async function testRegressionRecommendations() {
  console.log('\n🧪 Testing Regression Recommendations...');
  
  try {
    const testUser = testUsers[0];
    
    // Generate some interaction data first (focus on like and save)
    await trackTestInteractions(testUser.id, testRecipes[0].id, [
      { type: 'view', count: 2 },
      { type: 'like', count: 1 }
    ]);
    
    await trackTestInteractions(testUser.id, testRecipes[1].id, [
      { type: 'view', count: 1 },
      { type: 'save', count: 1 }
    ]);
    
    // Wait for weight updates
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test regression recommendations
    const response = await axios.get(`${BASE_URL}/recommendations/${testUser.id}`, {
      headers: { Authorization: 'Bearer test-token' }
    });
    
    const recommendations = response.data;
    console.log(`\nReceived ${recommendations.length} regression recommendations`);
    
    // Check if recommendations have regression scores (focus on like and save)
    const hasRegressionScores = recommendations.some(recipe => 
      recipe.likeScore !== undefined || 
      recipe.saveScore !== undefined ||
      recipe.finalScore !== undefined
    );
    
    console.log(`- Has regression scores: ${hasRegressionScores ? '✅' : '❌'}`);
    
    if (recommendations.length > 0) {
      const firstRecipe = recommendations[0];
      console.log('- Sample recipe scores:');
      console.log(`  * Like Score: ${firstRecipe.likeScore?.toFixed(3) || 'N/A'}`);
      console.log(`  * Save Score: ${firstRecipe.saveScore?.toFixed(3) || 'N/A'}`);
      console.log(`  * Final Score: ${firstRecipe.finalScore?.toFixed(3) || 'N/A'}`);
    }
    
    return hasRegressionScores;
  } catch (error) {
    console.error('❌ Regression recommendations test failed:', error.response?.data || error.message);
    return false;
  }
}

async function testFeatureWeights() {
  console.log('\n🧪 Testing Feature Weights...');
  
  try {
    const testUser = testUsers[0];
    
    // Get user's feature weights
    const response = await axios.get(`${BASE_URL}/recommendations/weights/${testUser.id}`, {
      headers: { Authorization: 'Bearer test-token' }
    });
    
    const weights = response.data;
    console.log('\nFeature weights by interaction type:');
    
    Object.entries(weights).forEach(([interactionType, featureWeights]) => {
      console.log(`\n${interactionType.toUpperCase()}:`);
      featureWeights.forEach(weight => {
        console.log(`  - ${weight.feature}: ${weight.weight.toFixed(4)}`);
      });
    });
    
    // Check if weights exist for main features (focus on like and save)
    const hasMainFeatures = Object.values(weights).some(interactionWeights => 
      interactionWeights.some(weight => 
        ['relevance', 'cuisine_type', 'popularity', 'season'].includes(weight.feature)
      )
    );
    
    // Check if we have like and save weights
    const hasLikeAndSaveWeights = weights.like && weights.save;
    
    console.log(`\n- Has main features (relevance, cuisine_type, popularity, season): ${hasMainFeatures ? '✅' : '❌'}`);
    console.log(`- Has like and save weights: ${hasLikeAndSaveWeights ? '✅' : '❌'}`);
    
    return hasMainFeatures && hasLikeAndSaveWeights;
  } catch (error) {
    console.error('❌ Feature weights test failed:', error.response?.data || error.message);
    return false;
  }
}

async function testModelMetrics() {
  console.log('\n🧪 Testing Model Metrics...');
  
  try {
    const testUser = testUsers[0];
    
    // Get model metrics
    const response = await axios.get(`${BASE_URL}/recommendations/metrics/${testUser.id}`, {
      headers: { Authorization: 'Bearer test-token' }
    });
    
    const metrics = response.data;
    console.log(`\nReceived ${metrics.length} model metrics`);
    
    if (metrics.length > 0) {
      const latestMetric = metrics[0];
      console.log('\nLatest model metrics:');
      console.log(`- Interaction Type: ${latestMetric.interaction_type}`);
      console.log(`- Model Version: ${latestMetric.model_version}`);
      console.log(`- MSE: ${latestMetric.mse?.toFixed(4) || 'N/A'}`);
      console.log(`- R-squared: ${latestMetric.r_squared?.toFixed(4) || 'N/A'}`);
      console.log(`- Training Samples: ${latestMetric.training_samples || 'N/A'}`);
      console.log(`- Last Trained: ${latestMetric.last_trained || 'N/A'}`);
      
      if (latestMetric.feature_importance) {
        console.log('- Feature Importance:');
        latestMetric.feature_importance.forEach(feature => {
          console.log(`  * ${feature.feature}: ${feature.importance.toFixed(4)}`);
        });
      }
    }
    
    const hasMetrics = metrics.length > 0;
    console.log(`\n- Has model metrics: ${hasMetrics ? '✅' : '❌'}`);
    
    return hasMetrics;
  } catch (error) {
    console.error('❌ Model metrics test failed:', error.response?.data || error.message);
    return false;
  }
}

async function testFallbackAlgorithm() {
  console.log('\n🧪 Testing Fallback Algorithm...');
  
  try {
    const testUser = testUsers[0];
    
    // Test original algorithm by setting regression=false
    const response = await axios.get(`${BASE_URL}/recommendations/${testUser.id}?regression=false`, {
      headers: { Authorization: 'Bearer test-token' }
    });
    
    const recommendations = response.data;
    console.log(`\nReceived ${recommendations.length} fallback recommendations`);
    
    // Check if recommendations use original scoring (no like/save scores)
    const usesOriginalScoring = recommendations.some(recipe => 
      recipe.finalScore !== undefined && 
      recipe.likeScore === undefined &&
      recipe.saveScore === undefined
    );
    
    console.log(`- Uses original scoring: ${usesOriginalScoring ? '✅' : '❌'}`);
    
    if (recommendations.length > 0) {
      const firstRecipe = recommendations[0];
      console.log(`- Sample final score: ${firstRecipe.finalScore?.toFixed(3) || 'N/A'}`);
    }
    
    return usesOriginalScoring;
  } catch (error) {
    console.error('❌ Fallback algorithm test failed:', error.response?.data || error.message);
    return false;
  }
}

async function testNutritionalFeatures() {
  console.log('\n🧪 Testing Nutritional Features...');
  
  try {
    const testUser = testUsers[0];
    
    // Get feature weights to check if nutritional features are included
    const response = await axios.get(`${BASE_URL}/recommendations/weights/${testUser.id}`, {
      headers: { Authorization: 'Bearer test-token' }
    });
    
    const weights = response.data;
    const nutritionalFeatures = ['calories', 'protein', 'fat', 'carbohydrates', 'fiber', 'sugar', 'sodium'];
    
    let hasNutritionalFeatures = false;
    Object.values(weights).forEach(interactionWeights => {
      const hasNutrition = interactionWeights.some(weight => 
        nutritionalFeatures.includes(weight.feature)
      );
      if (hasNutrition) hasNutritionalFeatures = true;
    });
    
    console.log(`- Has nutritional features: ${hasNutritionalFeatures ? '✅' : '❌'}`);
    
    if (hasNutritionalFeatures) {
      console.log('- Nutritional features found:');
      Object.values(weights).forEach(interactionWeights => {
        const nutritionWeights = interactionWeights.filter(weight => 
          nutritionalFeatures.includes(weight.feature)
        );
        if (nutritionWeights.length > 0) {
          nutritionWeights.forEach(weight => {
            console.log(`  * ${weight.feature}: ${weight.weight.toFixed(4)}`);
          });
        }
      });
    }
    
    return hasNutritionalFeatures;
  } catch (error) {
    console.error('❌ Nutritional features test failed:', error.response?.data || error.message);
    return false;
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Regression Recommendation System Tests...\n');
  
  const tests = [
    { name: 'Database Setup', fn: testDatabaseSetup },
    { name: 'Interaction Tracking', fn: testInteractionTracking },
    { name: 'Regression Recommendations', fn: testRegressionRecommendations },
    { name: 'Feature Weights', fn: testFeatureWeights },
    { name: 'Model Metrics', fn: testModelMetrics },
    { name: 'Fallback Algorithm', fn: testFallbackAlgorithm },
    { name: 'Nutritional Features', fn: testNutritionalFeatures }
  ];
  
  const results = [];
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      results.push({ name: test.name, passed: result });
      console.log(`${result ? '✅' : '❌'} ${test.name}: ${result ? 'PASSED' : 'FAILED'}\n`);
    } catch (error) {
      console.error(`❌ ${test.name}: ERROR - ${error.message}\n`);
      results.push({ name: test.name, passed: false });
    }
  }
  
  // Summary
  console.log('📊 Test Summary:');
  const passedTests = results.filter(r => r.passed).length;
  const totalTests = results.length;
  
  results.forEach(result => {
    console.log(`${result.passed ? '✅' : '❌'} ${result.name}`);
  });
  
  console.log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Regression recommendation system is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Please check the implementation.');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  runAllTests,
  testDatabaseSetup,
  testInteractionTracking,
  testRegressionRecommendations,
  testFeatureWeights,
  testModelMetrics,
  testFallbackAlgorithm,
  testNutritionalFeatures
}; 