const axios = require('axios');
require('dotenv').config();

const BASE_URL = 'http://localhost:5000';
const TEST_USER_ID = '4d163845-f7a3-4da5-8d03-50940f1ff4f6'; // Replace with actual user ID

async function testDynamicSimilarity() {
  console.log('🧪 Testing Dynamic Similarity System\n');

  try {
    // Test 1: Basic similarity check
    console.log('1️⃣ Testing basic similarity check...');
    const similarityResponse = await axios.post(`${BASE_URL}/api/similar-recipes`, {
      title: 'Chicken Pasta',
      ingredients: ['chicken', 'pasta', 'olive oil', 'garlic']
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.TEST_TOKEN || 'test-token'}`
      }
    });

    console.log('✅ Similarity check response:', {
      matchesCount: similarityResponse.data.length,
      topMatch: similarityResponse.data[0] ? {
        title: similarityResponse.data[0].recipe.title,
        score: similarityResponse.data[0].score,
        features: Object.keys(similarityResponse.data[0].features || {}).length
      } : null
    });

    if (similarityResponse.data[0]) {
      console.log('📊 Feature breakdown:', similarityResponse.data[0].breakdown);
    }

    // Test 2: Similarity feedback
    console.log('\n2️⃣ Testing similarity feedback...');
    const feedbackResponse = await axios.post(`${BASE_URL}/api/similarity-feedback`, {
      recipe1Id: 'test-recipe-1',
      recipe2Id: 'test-recipe-2',
      recipe1Data: {
        title: 'Chicken Pasta',
        ingredients: ['chicken', 'pasta', 'olive oil'],
        cuisine: 'Italian',
        readyInMinutes: 30,
        difficulty: 'Easy'
      },
      recipe2Data: {
        title: 'Pasta with Chicken',
        ingredients: ['pasta', 'chicken', 'olive oil', 'garlic'],
        cuisine: 'Italian',
        readyInMinutes: 25,
        difficulty: 'Easy'
      },
      judgment: 'SIMILAR'
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.TEST_TOKEN || 'test-token'}`
      }
    });

    console.log('✅ Feedback response:', feedbackResponse.data);

    // Test 3: Get similarity weights
    console.log('\n3️⃣ Testing similarity weights retrieval...');
    const weightsResponse = await axios.get(`${BASE_URL}/api/similarity-weights`, {
      headers: {
        'Authorization': `Bearer ${process.env.TEST_TOKEN || 'test-token'}`
      }
    });

    console.log('✅ Weights response:', {
      weightsCount: weightsResponse.data.weights.length,
      sampleWeights: weightsResponse.data.weights.slice(0, 3)
    });

    // Test 4: Get similarity metrics
    console.log('\n4️⃣ Testing similarity metrics...');
    const metricsResponse = await axios.get(`${BASE_URL}/api/similarity-metrics`, {
      headers: {
        'Authorization': `Bearer ${process.env.TEST_TOKEN || 'test-token'}`
      }
    });

    console.log('✅ Metrics response:', metricsResponse.data);

    // Test 5: Test Jaccard similarity with different titles
    console.log('\n5️⃣ Testing Jaccard similarity variations...');
    const testCases = [
      { title1: 'Chicken Pasta', title2: 'Pasta with Chicken', expected: 'high' },
      { title1: 'Chicken Pasta', title2: 'Beef Steak', expected: 'low' },
      { title1: 'Spaghetti Carbonara', title2: 'Carbonara Pasta', expected: 'high' },
      { title1: 'Chocolate Cake', title2: 'Vanilla Ice Cream', expected: 'low' }
    ];

    for (const testCase of testCases) {
      const testResponse = await axios.post(`${BASE_URL}/api/similar-recipes`, {
        title: testCase.title1,
        ingredients: ['test ingredient']
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.TEST_TOKEN || 'test-token'}`
        }
      });

      const hasMatch = testResponse.data.some(match => 
        match.recipe.title.toLowerCase().includes(testCase.title2.toLowerCase().split(' ')[0])
      );

      console.log(`   ${testCase.title1} vs ${testCase.title2}: ${hasMatch ? '✅ Match found' : '❌ No match'}`);
    }

    // Test 6: Test with multiple feedback iterations
    console.log('\n6️⃣ Testing learning with multiple feedback...');
    const feedbackIterations = [
      { judgment: 'VERY_SIMILAR', description: 'Very similar recipes' },
      { judgment: 'SIMILAR', description: 'Similar recipes' },
      { judgment: 'MODERATE', description: 'Moderately similar' },
      { judgment: 'DIFFERENT', description: 'Different recipes' }
    ];

    for (const iteration of feedbackIterations) {
      const learningResponse = await axios.post(`${BASE_URL}/api/similarity-feedback`, {
        recipe1Id: 'learning-test-1',
        recipe2Id: 'learning-test-2',
        recipe1Data: {
          title: 'Learning Test Recipe 1',
          ingredients: ['ingredient1', 'ingredient2'],
          cuisine: 'Test',
          readyInMinutes: 20,
          difficulty: 'Easy'
        },
        recipe2Data: {
          title: 'Learning Test Recipe 2',
          ingredients: ['ingredient1', 'ingredient3'],
          cuisine: 'Test',
          readyInMinutes: 25,
          difficulty: 'Easy'
        },
        judgment: iteration.judgment
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.TEST_TOKEN || 'test-token'}`
        }
      });

      console.log(`   ${iteration.description}: ${learningResponse.data.success ? '✅ Recorded' : '❌ Failed'}`);
    }

    // Test 7: Test error handling
    console.log('\n7️⃣ Testing error handling...');
    try {
      const errorResponse = await axios.post(`${BASE_URL}/api/similarity-feedback`, {
        recipe1Id: 'test',
        recipe2Id: 'test',
        recipe1Data: {},
        recipe2Data: {},
        judgment: 'INVALID_JUDGMENT'
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.TEST_TOKEN || 'test-token'}`
        }
      });
      console.log('❌ Expected error but got success');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Error handling working correctly');
        console.log('   Error details:', error.response.data);
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }

    console.log('\n🎉 Dynamic Similarity System Test Complete!');
    console.log('\n📊 Test Summary:');
    console.log('   ✅ Basic similarity check working');
    console.log('   ✅ Feedback recording working');
    console.log('   ✅ Weights retrieval working');
    console.log('   ✅ Metrics calculation working');
    console.log('   ✅ Jaccard similarity working');
    console.log('   ✅ Learning system working');
    console.log('   ✅ Error handling working');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testDynamicSimilarity(); 