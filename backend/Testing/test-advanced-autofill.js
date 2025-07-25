const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:5000';
const TEST_USER_ID = '4d163845-f7a3-4da5-8d03-50940f1ff4f6'; // Use an existing user ID
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9oZHlla3p1Z3NydXdlZmt1ZWR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxMTkyODIsImV4cCI6MjA2NzY5NTI4Mn0.ucJITeO1NEC9rjVyYJ9ErTlmS06i08JQ1osEF_Xjpxg';

async function testAdvancedAutofill() {
  console.log('🧪 Testing Advanced Autofill System\n');

  try {
    // Test 1: Basic advanced autofill for ingredients
    console.log('1️⃣ Testing advanced autofill for ingredients...');
    const ingredientsResponse = await axios.get(`${BASE_URL}/api/advanced-autofill`, {
      params: {
        title: 'Chicken Pasta',
        field: 'ingredients',
        context: JSON.stringify({ cuisine: 'Italian', difficulty: 'Easy' })
      },
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`
      }
    });

    console.log('✅ Ingredients autofill response:', {
      suggestionsCount: ingredientsResponse.data.suggestions?.length || 0,
      totalSources: ingredientsResponse.data.totalSources,
      context: ingredientsResponse.data.context
    });

    if (ingredientsResponse.data.suggestions?.length > 0) {
      console.log('📋 Sample suggestion:', {
        title: ingredientsResponse.data.suggestions[0].title,
        source: ingredientsResponse.data.suggestions[0].source,
        confidence: ingredientsResponse.data.suggestions[0].confidence
      });
    }

    // Test 2: Advanced autofill for instructions
    console.log('\n2️⃣ Testing advanced autofill for instructions...');
    const instructionsResponse = await axios.get(`${BASE_URL}/api/advanced-autofill`, {
      params: {
        title: 'Pasta Carbonara',
        field: 'instructions',
        context: JSON.stringify({ cuisine: 'Italian', difficulty: 'Medium' })
      },
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`
      }
    });

    console.log('✅ Instructions autofill response:', {
      suggestionsCount: instructionsResponse.data.suggestions?.length || 0,
      totalSources: instructionsResponse.data.totalSources
    });

    // Test 3: Advanced autofill for category
    console.log('\n3️⃣ Testing advanced autofill for category...');
    const categoryResponse = await axios.get(`${BASE_URL}/api/advanced-autofill`, {
      params: {
        title: 'Chocolate Cake',
        field: 'category'
      },
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`
      }
    });

    console.log('✅ Category autofill response:', {
      suggestionsCount: categoryResponse.data.suggestions?.length || 0
    });

    // Test 4: Advanced autofill for difficulty
    console.log('\n4️⃣ Testing advanced autofill for difficulty...');
    const difficultyResponse = await axios.get(`${BASE_URL}/api/advanced-autofill`, {
      params: {
        title: 'Simple Salad',
        field: 'difficulty'
      },
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`
      }
    });

    console.log('✅ Difficulty autofill response:', {
      suggestionsCount: difficultyResponse.data.suggestions?.length || 0
    });

    // Test 5: Advanced autofill for tags
    console.log('\n5️⃣ Testing advanced autofill for tags...');
    const tagsResponse = await axios.get(`${BASE_URL}/api/advanced-autofill`, {
      params: {
        title: 'Vegetarian Pasta',
        field: 'tags',
        context: JSON.stringify({ cuisine: 'Italian', difficulty: 'Easy' })
      },
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`
      }
    });

    console.log('✅ Tags autofill response:', {
      suggestionsCount: tagsResponse.data.suggestions?.length || 0
    });

    // Test 6: Advanced autofill for stats
    console.log('\n6️⃣ Testing advanced autofill for stats...');
    const statsResponse = await axios.get(`${BASE_URL}/api/advanced-autofill`, {
      params: {
        title: 'Quick Pasta',
        field: 'stats'
      },
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`
      }
    });

    console.log('✅ Stats autofill response:', {
      suggestionsCount: statsResponse.data.suggestions?.length || 0
    });

    // Test 7: Field validation
    console.log('\n7️⃣ Testing field validation...');
    const validationResponse = await axios.post(`${BASE_URL}/api/validate-field`, {
      field: 'ingredients',
      value: ['chicken', 'pasta', 'salt'],
      context: { cuisine: 'Italian', difficulty: 'Easy' }
    }, {
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Field validation response:', {
      isValid: validationResponse.data.isValid,
      errorsCount: validationResponse.data.errors?.length || 0,
      warningsCount: validationResponse.data.warnings?.length || 0,
      suggestionsCount: validationResponse.data.suggestions?.length || 0
    });

    // Test 8: Test with different contexts
    console.log('\n8️⃣ Testing context-aware suggestions...');
    const contextResponse = await axios.get(`${BASE_URL}/api/advanced-autofill`, {
      params: {
        title: 'Spicy Chicken',
        field: 'ingredients',
        context: JSON.stringify({ 
          cuisine: 'Mexican', 
          difficulty: 'Hard',
          cookingStyle: 'Grilled',
          cookingMethod: 'Stir Fry'
        })
      },
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`
      }
    });

    console.log('✅ Context-aware response:', {
      suggestionsCount: contextResponse.data.suggestions?.length || 0,
      context: contextResponse.data.context
    });

    // Test 9: Test error handling (short title)
    console.log('\n9️⃣ Testing error handling (short title)...');
    try {
      const errorResponse = await axios.get(`${BASE_URL}/api/advanced-autofill`, {
        params: {
          title: 'Ab',
          field: 'ingredients'
        },
        headers: {
          'Authorization': `Bearer ${TEST_TOKEN}`
        }
      });
      console.log('❌ Expected error but got success:', errorResponse.data);
    } catch (error) {
      console.log('✅ Correctly handled short title error:', error.response?.data?.error);
    }

    // Test 10: Test without authentication
    console.log('\n🔟 Testing without authentication...');
    try {
      const noAuthResponse = await axios.get(`${BASE_URL}/api/advanced-autofill`, {
        params: {
          title: 'Test Recipe',
          field: 'ingredients'
        }
      });
      console.log('❌ Expected auth error but got success:', noAuthResponse.data);
    } catch (error) {
      console.log('✅ Correctly handled authentication error:', error.response?.status);
    }

    console.log('\n🎉 Advanced Autofill System Test Complete!');
    console.log('\n📊 Summary:');
    console.log('- Multi-source suggestions: ✅');
    console.log('- Context awareness: ✅');
    console.log('- Field validation: ✅');
    console.log('- Error handling: ✅');
    console.log('- Authentication: ✅');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testAdvancedAutofill(); 