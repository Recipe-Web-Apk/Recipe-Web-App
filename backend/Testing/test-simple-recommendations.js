const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:5000';

async function testSimpleRecommendations() {
  console.log('🧪 Testing Simple Recommendations (No Auth)...\n');
  
  try {
    // Test the recommendations endpoint without auth
    console.log('1. Testing recommendations endpoint without auth...');
    const response = await axios.get(`${BASE_URL}/api/recommendations/test-user`);
    
    const recommendations = response.data;
    console.log(`✅ Received ${recommendations.length} recommendations`);
    
    if (recommendations.length === 0) {
      console.log('❌ No recommendations returned');
      return false;
    }
    
    // Check recipe structure
    console.log('\n2. Checking recipe structure...');
    const firstRecipe = recommendations[0];
    
    console.log('Sample recipe:');
    console.log(`  - ID: ${firstRecipe.id}`);
    console.log(`  - Title: ${firstRecipe.title}`);
    console.log(`  - Cuisine: ${firstRecipe.cuisine || 'N/A'}`);
    console.log(`  - Ready in: ${firstRecipe.readyInMinutes || 'N/A'} minutes`);
    
    // Check for regression scores
    if (firstRecipe.likeScore !== undefined) {
      console.log(`  - Like Score: ${firstRecipe.likeScore.toFixed(3)}`);
      console.log(`  - Save Score: ${firstRecipe.saveScore.toFixed(3)}`);
      console.log(`  - Final Score: ${firstRecipe.finalScore.toFixed(3)}`);
      console.log('✅ Regression scores present');
    } else {
      console.log('⚠️ No regression scores (using fallback algorithm)');
    }
    
    // Show a few more recipes
    console.log('\n3. Sample recommendations:');
    recommendations.slice(0, 3).forEach((recipe, index) => {
      console.log(`${index + 1}. ${recipe.title}`);
      if (recipe.likeScore !== undefined) {
        console.log(`   Score: ${recipe.finalScore.toFixed(3)}`);
      }
    });
    
    console.log('\n✅ SUCCESS: Recommendations system is working!');
    console.log(`📝 Returned ${recommendations.length} recipes from Spoonacular`);
    
    return true;
    
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('❌ Authentication required - this is expected');
      console.log('💡 The endpoint is working but requires a valid token');
      return false;
    } else {
      console.error('❌ Test failed:', error.response?.data || error.message);
      return false;
    }
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testSimpleRecommendations().catch(console.error);
}

module.exports = { testSimpleRecommendations }; 