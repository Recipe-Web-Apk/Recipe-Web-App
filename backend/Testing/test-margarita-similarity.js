const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testMargaritaSimilarity() {
  console.log('🧪 Testing Margarita Similarity...\n');

  try {
    // Test with margarita title
    console.log('1️⃣ Testing with margarita title...');
    const response = await axios.post(`${BASE_URL}/api/recipe/test-similarity`, {
      title: 'margarita',
      ingredients: ['tequila', 'lime juice', 'triple sec']
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
          score: m.score,
          scorePercentage: m.scorePercentage,
          breakdown: m.breakdown.map(b => ({
            feature: b.feature,
            percentage: b.percentage
          }))
        }))
      });
    }

    if (response.data.autofillSuggestion) {
      console.log('🔄 Autofill suggestion:', {
        ingredients: response.data.autofillSuggestion.ingredients,
        instructions: response.data.autofillSuggestion.instructions,
        cookingTime: response.data.autofillSuggestion.cookingTime,
        cuisine: response.data.autofillSuggestion.cuisine
      });
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testMargaritaSimilarity(); 