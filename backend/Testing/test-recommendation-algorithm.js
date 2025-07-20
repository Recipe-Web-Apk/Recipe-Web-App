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
    id: 'test-user-1',
    username: 'testuser1',
    preferences: {
      cuisine: ['italian', 'mexican'],
      diet: 'vegetarian',
      dietaryTags: ['vegetarian', 'healthy'],
      cookingStyles: ['quick', 'easy']
    }
  },
  {
    id: 'test-user-2', 
    username: 'testuser2',
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
    id: 'recipe-1',
    title: 'Spaghetti Carbonara',
    tags: ['italian', 'pasta', 'quick'],
    cuisine: 'italian',
    season: 'all',
    dairy_free: false,
    ingredients: ['pasta', 'eggs', 'bacon', 'cheese'],
    cookingStyle: 'quick',
    cookingMethod: 'stovetop'
  },
  {
    id: 'recipe-2',
    title: 'Vegetarian Tacos',
    tags: ['mexican', 'vegetarian', 'healthy'],
    cuisine: 'mexican',
    season: 'summer',
    dairy_free: true,
    ingredients: ['beans', 'corn', 'tomatoes', 'avocado'],
    cookingStyle: 'easy',
    cookingMethod: 'stovetop'
  },
  {
    id: 'recipe-3',
    title: 'Chicken Curry',
    tags: ['indian', 'spicy', 'traditional'],
    cuisine: 'indian',
    season: 'winter',
    dairy_free: false,
    ingredients: ['chicken', 'curry', 'rice', 'spices'],
    cookingStyle: 'traditional',
    cookingMethod: 'stovetop'
  }
];

// Helper functions
async function createTestUser(userData) {
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id: userData.id,
      username: userData.username,
      preferences: userData.preferences,
      diet: userData.preferences.diet,
      cuisine: userData.preferences.cuisine[0],
      cookingStyles: userData.preferences.cookingStyles
    });
  
  if (error) {
    console.error('Error creating test user:', error);
    return false;
  }
  return true;
}

async function createTestRecipe(recipeData) {
  const { data, error } = await supabase
    .from('recipes')
    .upsert(recipeData);
  
  if (error) {
    console.error('Error creating test recipe:', error);
    return false;
  }
  return true;
}

async function createTestInteraction(userId, recipeId, interactionType) {
  const tableName = interactionType === 'like' ? 'likes' : 
                   interactionType === 'view' ? 'views' : 'saved_recipes';
  
  const { data, error } = await supabase
    .from(tableName)
    .upsert({
      user_id: userId,
      recipe_id: recipeId
    });
  
  if (error) {
    console.error(`Error creating ${interactionType}:`, error);
    return false;
  }
  return true;
}

// Test functions
async function testUserPreferenceMatching() {
  console.log('\n🧪 Testing User Preference Matching...');
  
  try {
    // Create test users
    for (const user of testUsers) {
      await createTestUser(user);
    }
    
    // Test preference matching for each user
    for (const user of testUsers) {
      const response = await axios.get(`${BASE_URL}/recommendations/${user.id}`, {
        headers: { Authorization: 'Bearer test-token' }
      });
      
      console.log(`\nUser: ${user.username}`);
      console.log('Preferences:', user.preferences);
      console.log('Recommendations received:', response.data.length);
      
      // Check if recommendations match user preferences
      const recommendations = response.data;
      const preferenceMatches = recommendations.filter(recipe => {
        const cuisineMatch = user.preferences.cuisine.includes(recipe.cuisine);
        const tagMatch = user.preferences.dietaryTags.some(tag => 
          recipe.diets?.includes(tag) || recipe.tags?.includes(tag)
        );
        return cuisineMatch || tagMatch;
      });
      
      console.log(`Preference matches: ${preferenceMatches.length}/${recommendations.length}`);
      console.log('Sample recommendations:', recommendations.slice(0, 3).map(r => ({
        title: r.title,
        cuisine: r.cuisine,
        diets: r.diets,
        finalScore: r.finalScore
      })));
    }
    
    return true;
  } catch (error) {
    console.error('❌ User preference matching test failed:', error.response?.data || error.message);
    return false;
  }
}

async function testRecipeScoring() {
  console.log('\n🧪 Testing Recipe Scoring Algorithm...');
  
  try {
    // Create test recipes
    for (const recipe of testRecipes) {
      await createTestRecipe(recipe);
    }
    
    // Test scoring with different user profiles
    const testUser = testUsers[0];
    const response = await axios.get(`${BASE_URL}/recommendations/${testUser.id}`, {
      headers: { Authorization: 'Bearer test-token' }
    });
    
    const recommendations = response.data;
    console.log(`\nReceived ${recommendations.length} recommendations`);
    
    // Analyze scoring distribution
    const scores = recommendations.map(r => r.finalScore);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const maxScore = Math.max(...scores);
    const minScore = Math.min(...scores);
    
    console.log('Score Analysis:');
    console.log(`- Average score: ${avgScore.toFixed(3)}`);
    console.log(`- Max score: ${maxScore.toFixed(3)}`);
    console.log(`- Min score: ${minScore.toFixed(3)}`);
    console.log(`- Score range: ${(maxScore - minScore).toFixed(3)}`);
    
    // Check if scores are reasonable (between 0 and 1)
    const validScores = scores.every(score => score >= 0 && score <= 1);
    console.log(`- All scores valid (0-1): ${validScores ? '✅' : '❌'}`);
    
    return validScores;
  } catch (error) {
    console.error('❌ Recipe scoring test failed:', error.response?.data || error.message);
    return false;
  }
}

async function testCollaborativeFiltering() {
  console.log('\n🧪 Testing Collaborative Filtering...');
  
  try {
    // Create test interactions
    await createTestInteraction('test-user-1', 'recipe-1', 'like');
    await createTestInteraction('test-user-1', 'recipe-2', 'like');
    await createTestInteraction('test-user-2', 'recipe-1', 'like');
    await createTestInteraction('test-user-2', 'recipe-3', 'like');
    
    // Test recommendations for user 1
    const response = await axios.get(`${BASE_URL}/recommendations/test-user-1`, {
      headers: { Authorization: 'Bearer test-token' }
    });
    
    const recommendations = response.data;
    console.log(`\nUser 1 received ${recommendations.length} recommendations`);
    
    // Check if recommendations include recipes liked by similar users
    const similarUserLikes = ['recipe-3']; // User 2 liked recipe-3
    const collaborativeMatches = recommendations.filter(recipe => 
      similarUserLikes.includes(recipe.id)
    );
    
    console.log(`Collaborative filtering matches: ${collaborativeMatches.length}`);
    console.log('Collaborative matches:', collaborativeMatches.map(r => r.title));
    
    return collaborativeMatches.length > 0;
  } catch (error) {
    console.error('❌ Collaborative filtering test failed:', error.response?.data || error.message);
    return false;
  }
}

async function testSeasonality() {
  console.log('\n🧪 Testing Seasonality Algorithm...');
  
  try {
    const currentMonth = new Date().getMonth();
    const currentSeason = getSeasonFromMonth(currentMonth);
    
    console.log(`Current month: ${currentMonth}, Season: ${currentSeason}`);
    
    // Test with a user who has seasonal preferences
    const seasonalUser = {
      id: 'seasonal-user',
      username: 'seasonaluser',
      preferences: {
        cuisine: ['italian'],
        diet: 'vegetarian',
        dietaryTags: ['seasonal'],
        cookingStyles: ['quick']
      }
    };
    
    await createTestUser(seasonalUser);
    
    const response = await axios.get(`${BASE_URL}/recommendations/seasonal-user`, {
      headers: { Authorization: 'Bearer test-token' }
    });
    
    const recommendations = response.data;
    console.log(`\nReceived ${recommendations.length} recommendations`);
    
    // Check for seasonal recipes
    const seasonalRecipes = recommendations.filter(recipe => 
      recipe.season === currentSeason || recipe.season === 'all'
    );
    
    console.log(`Seasonal recipes (${currentSeason}): ${seasonalRecipes.length}`);
    console.log('Seasonal recipe examples:', seasonalRecipes.slice(0, 3).map(r => ({
      title: r.title,
      season: r.season
    })));
    
    return seasonalRecipes.length > 0;
  } catch (error) {
    console.error('❌ Seasonality test failed:', error.response?.data || error.message);
    return false;
  }
}

async function testDiversity() {
  console.log('\n🧪 Testing Recommendation Diversity...');
  
  try {
    const testUser = testUsers[0];
    const response = await axios.get(`${BASE_URL}/recommendations/${testUser.id}`, {
      headers: { Authorization: 'Bearer test-token' }
    });
    
    const recommendations = response.data;
    console.log(`\nReceived ${recommendations.length} recommendations`);
    
    // Analyze diversity
    const cuisines = [...new Set(recommendations.map(r => r.cuisine).filter(Boolean))];
    const cookingStyles = [...new Set(recommendations.map(r => r.cookingStyle).filter(Boolean))];
    
    console.log('Diversity Analysis:');
    console.log(`- Unique cuisines: ${cuisines.length} (${cuisines.join(', ')})`);
    console.log(`- Unique cooking styles: ${cookingStyles.length} (${cookingStyles.join(', ')})`);
    
    // Check for diversity (should have multiple cuisines/styles)
    const hasDiversity = cuisines.length > 1 || cookingStyles.length > 1;
    console.log(`- Has diversity: ${hasDiversity ? '✅' : '❌'}`);
    
    return hasDiversity;
  } catch (error) {
    console.error('❌ Diversity test failed:', error.response?.data || error.message);
    return false;
  }
}

// Helper function for seasonality
function getSeasonFromMonth(month) {
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'fall';
  return 'winter';
}

async function testPerformance() {
  console.log('\n🧪 Testing Performance...');
  
  try {
    const testUser = testUsers[0];
    const startTime = Date.now();
    
    const response = await axios.get(`${BASE_URL}/recommendations/${testUser.id}`, {
      headers: { Authorization: 'Bearer test-token' }
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`\nPerformance Results:`);
    console.log(`- Response time: ${duration}ms`);
    console.log(`- Recommendations returned: ${response.data.length}`);
    console.log(`- Performance rating: ${duration < 2000 ? '✅ Good' : duration < 5000 ? '⚠️ Acceptable' : '❌ Slow'}`);
    
    return duration < 5000; // Should complete within 5 seconds
  } catch (error) {
    console.error('❌ Performance test failed:', error.response?.data || error.message);
    return false;
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Recommendation Algorithm Tests...\n');
  
  const tests = [
    { name: 'User Preference Matching', fn: testUserPreferenceMatching },
    { name: 'Recipe Scoring', fn: testRecipeScoring },
    { name: 'Collaborative Filtering', fn: testCollaborativeFiltering },
    { name: 'Seasonality', fn: testSeasonality },
    { name: 'Diversity', fn: testDiversity },
    { name: 'Performance', fn: testPerformance }
  ];
  
  const results = [];
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      results.push({ name: test.name, passed: result });
      console.log(`${result ? '✅' : '❌'} ${test.name}: ${result ? 'PASSED' : 'FAILED'}`);
    } catch (error) {
      console.error(`❌ ${test.name}: ERROR - ${error.message}`);
      results.push({ name: test.name, passed: false });
    }
  }
  
  // Summary
  console.log('\n📊 Test Summary:');
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  console.log(`${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! Recommendation algorithm is working correctly.');
  } else {
    console.log('⚠️ Some tests failed. Check the implementation.');
  }
  
  return results;
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Test runner error:', error);
      process.exit(1);
    });
}

module.exports = {
  runAllTests,
  testUserPreferenceMatching,
  testRecipeScoring,
  testCollaborativeFiltering,
  testSeasonality,
  testDiversity,
  testPerformance
}; 