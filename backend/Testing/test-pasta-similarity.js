const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testPastaSimilarity() {
  console.log('🧪 Testing Pasta Similarity...\n');

  try {
    // Test with pasta title
    console.log('1️⃣ Testing with pasta title...');
    const response = await axios.post(`${BASE_URL}/api/recipe/test-similarity`, {
      title: 'Chicken Pasta Carbonara',
      ingredients: ['chicken', 'pasta', 'eggs', 'cheese', 'bacon']
    });

    console.log('✅ Response received:', {
      hasSimilarRecipes: response.data.hasSimilarRecipes,
      warningType: response.data.warning?.type,
      warningMessage: response.data.warning?.message,
      matchesCount: response.data.allMatches?.length || 0,
      hasAutofillSuggestion: !!response.data.autofillSuggestion
    });

    if (response.data.warning) {
      console.log('📊 Warning details:', {
        type: response.data.warning.type,
        message: response.data.warning.message,
        matches: response.data.warning.matches.map(m => ({
          title: m.recipe.title,
          score: m.score
        }))
      });
    }

    // Test with non-pasta title
    console.log('\n2️⃣ Testing with non-pasta title...');
    const response2 = await axios.post(`${BASE_URL}/api/recipe/test-similarity`, {
      title: 'Beef Stir Fry',
      ingredients: ['beef', 'vegetables', 'soy sauce']
    });

    console.log('✅ Response received:', {
      hasSimilarRecipes: response2.data.hasSimilarRecipes,
      warningType: response2.data.warning?.type,
      matchesCount: response2.data.allMatches?.length || 0
    });

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testPastaSimilarity(); 