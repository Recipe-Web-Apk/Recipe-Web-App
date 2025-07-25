const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testSimilarityNoAuth() {
  console.log('🧪 Testing Similarity Without Authentication...\n');

  try {
    // Test similarity check without authentication
    console.log('1️⃣ Testing similarity check...');
    const similarityResponse = await axios.post(`${BASE_URL}/api/recipe/test-similarity`, {
      title: 'Chicken Pasta Carbonara',
      ingredients: ['chicken', 'pasta', 'eggs', 'cheese', 'bacon']
    });

    console.log('✅ Similarity check response:', {
      hasSimilarRecipes: similarityResponse.data.hasSimilarRecipes,
      warningType: similarityResponse.data.warning?.type,
      matchesCount: similarityResponse.data.allMatches?.length || 0,
      hasAutofillSuggestion: !!similarityResponse.data.autofillSuggestion
    });

    if (similarityResponse.data.warning) {
      console.log('📊 Warning details:', {
        type: similarityResponse.data.warning.type,
        message: similarityResponse.data.warning.message,
        matches: similarityResponse.data.warning.matches.map(m => ({
          title: m.recipe.title,
          score: m.score
        }))
      });
    }

    // Test with different recipes
    console.log('\n2️⃣ Testing different recipes...');
    const testCases = [
      {
        title: 'Chicken Pasta Carbonara',
        ingredients: ['chicken', 'pasta', 'eggs', 'cheese', 'bacon'],
        expected: 'high similarity'
      },
      {
        title: 'Beef Stir Fry',
        ingredients: ['beef', 'vegetables', 'soy sauce'],
        expected: 'low similarity'
      }
    ];

    for (const testCase of testCases) {
      const testResponse = await axios.post(`${BASE_URL}/api/recipe/test-similarity`, {
        title: testCase.title,
        ingredients: testCase.ingredients
      });

      const hasSimilarRecipes = testResponse.data.hasSimilarRecipes;
      const warningType = testResponse.data.warning?.type;
      
      console.log(`   ${testCase.title}: ${hasSimilarRecipes ? '✅ Similar recipes found' : '❌ No similar recipes'} (${warningType || 'none'})`);
    }

    console.log('\n🎉 Similarity Test Complete!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testSimilarityNoAuth(); 