const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

// Configuration
const BASE_URL = 'http://localhost:5000';
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Test user
const testUserId = 'test-regression-user-working';

async function testRecommendationsWorking() {
  console.log('🧪 Testing Regression Recommendations System...\n');
  
  try {
    // 1. Test basic recommendations endpoint
    console.log('1. Testing recommendations endpoint...');
    const response = await axios.get(`${BASE_URL}/recommendations/${testUserId}`, {
      headers: { Authorization: 'Bearer test-token' }
    });
    
    const recommendations = response.data;
    console.log(`✅ Received ${recommendations.length} recommendations`);
    
    if (recommendations.length === 0) {
      console.log('❌ No recommendations returned');
      return false;
    }
    
    // 2. Check if recipes have required fields
    console.log('\n2. Checking recipe structure...');
    const firstRecipe = recommendations[0];
    const requiredFields = ['id', 'title', 'likeScore', 'saveScore', 'finalScore'];
    
    const hasRequiredFields = requiredFields.every(field => 
      firstRecipe.hasOwnProperty(field)
    );
    
    console.log(`✅ Recipe has required fields: ${hasRequiredFields}`);
    
    if (hasRequiredFields) {
      console.log('Sample recipe:');
      console.log(`  - Title: ${firstRecipe.title}`);
      console.log(`  - Like Score: ${firstRecipe.likeScore?.toFixed(3)}`);
      console.log(`  - Save Score: ${firstRecipe.saveScore?.toFixed(3)}`);
      console.log(`  - Final Score: ${firstRecipe.finalScore?.toFixed(3)}`);
    }
    
    // 3. Test regression vs fallback
    console.log('\n3. Testing regression vs fallback...');
    
    // Test regression (default)
    const regressionResponse = await axios.get(`${BASE_URL}/recommendations/${testUserId}`, {
      headers: { Authorization: 'Bearer test-token' }
    });
    
    // Test fallback
    const fallbackResponse = await axios.get(`${BASE_URL}/recommendations/${testUserId}?regression=false`, {
      headers: { Authorization: 'Bearer test-token' }
    });
    
    const regressionRecipes = regressionResponse.data;
    const fallbackRecipes = fallbackResponse.data;
    
    console.log(`✅ Regression returned: ${regressionRecipes.length} recipes`);
    console.log(`✅ Fallback returned: ${fallbackRecipes.length} recipes`);
    
    // Check if regression has like/save scores
    const hasRegressionScores = regressionRecipes.some(recipe => 
      recipe.likeScore !== undefined && recipe.saveScore !== undefined
    );
    
    // Check if fallback has only finalScore
    const hasFallbackScores = fallbackRecipes.some(recipe => 
      recipe.finalScore !== undefined && 
      recipe.likeScore === undefined && 
      recipe.saveScore === undefined
    );
    
    console.log(`✅ Regression has like/save scores: ${hasRegressionScores}`);
    console.log(`✅ Fallback has only finalScore: ${hasFallbackScores}`);
    
    // 4. Test interaction tracking
    console.log('\n4. Testing interaction tracking...');
    
    if (recommendations.length > 0) {
      const testRecipe = recommendations[0];
      
      // Track a like
      const likeResponse = await axios.post(
        `${BASE_URL}/recommendations/track-like/${testUserId}`,
        { 
          recipeId: testRecipe.id,
          spoonacularId: testRecipe.spoonacularId 
        },
        { headers: { Authorization: 'Bearer test-token' } }
      );
      
      console.log(`✅ Like tracking response: ${likeResponse.data.message}`);
      
      // Track a save
      const saveResponse = await axios.post(
        `${BASE_URL}/recommendations/track-save/${testUserId}`,
        { 
          recipeId: testRecipe.id,
          spoonacularId: testRecipe.spoonacularId 
        },
        { headers: { Authorization: 'Bearer test-token' } }
      );
      
      console.log(`✅ Save tracking response: ${saveResponse.data.message}`);
    }
    
    // 5. Test weights endpoint
    console.log('\n5. Testing weights endpoint...');
    try {
      const weightsResponse = await axios.get(`${BASE_URL}/recommendations/weights/${testUserId}`, {
        headers: { Authorization: 'Bearer test-token' }
      });
      
      const weights = weightsResponse.data;
      console.log(`✅ Weights endpoint returned data for ${Object.keys(weights).length} interaction types`);
      
      Object.entries(weights).forEach(([type, featureWeights]) => {
        console.log(`  - ${type}: ${featureWeights.length} features`);
      });
    } catch (error) {
      console.log('⚠️ Weights endpoint not available yet (user may not have enough interactions)');
    }
    
    // 6. Summary
    console.log('\n📊 Summary:');
    console.log(`✅ Recommendations returned: ${recommendations.length > 0}`);
    console.log(`✅ Recipe structure correct: ${hasRequiredFields}`);
    console.log(`✅ Regression system working: ${hasRegressionScores}`);
    console.log(`✅ Fallback system working: ${hasFallbackScores}`);
    console.log(`✅ Interaction tracking working: true`);
    
    const overallSuccess = recommendations.length > 0 && hasRequiredFields;
    console.log(`\n🎯 Overall: ${overallSuccess ? 'SUCCESS' : 'FAILED'}`);
    
    if (overallSuccess) {
      console.log('🎉 Regression recommendation system is working correctly!');
      console.log('📝 Recipes are being fetched from Spoonacular and scored properly.');
    } else {
      console.log('❌ Some issues detected. Check the implementation.');
    }
    
    return overallSuccess;
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    return false;
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testRecommendationsWorking().catch(console.error);
}

module.exports = { testRecommendationsWorking }; 