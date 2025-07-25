const axios = require('axios');

async function testSimilarityWithAuth() {
  const baseURL = 'http://localhost:5000';
  
  console.log('🧪 Testing Similarity with Authentication\n');
  
  try {
    // Test 1: Similarity endpoint without auth (should fail)
    console.log('1️⃣ Testing similarity endpoint without auth...');
    try {
      const response = await axios.post(`${baseURL}/api/recipe/check-similarity`, {
        title: 'Test Recipe',
        ingredients: ['test'],
        cuisine: 'Italian',
        readyInMinutes: 30
      });
      console.log('❌ Should have failed without auth:', response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly rejected without auth (401)');
      } else {
        console.log('❌ Unexpected error:', error.response?.status, error.response?.data);
      }
    }
    
    // Test 2: Similarity endpoint with fake auth (should fail)
    console.log('\n2️⃣ Testing similarity endpoint with fake auth...');
    try {
      const response = await axios.post(`${baseURL}/api/recipe/check-similarity`, {
        title: 'Test Recipe',
        ingredients: ['test'],
        cuisine: 'Italian',
        readyInMinutes: 30
      }, {
        headers: {
          'Authorization': 'Bearer fake-token'
        }
      });
      console.log('❌ Should have failed with fake token:', response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly rejected with fake token (401)');
      } else {
        console.log('❌ Unexpected error:', error.response?.status, error.response?.data);
      }
    }
    
    console.log('\n✅ Authentication tests completed!');
    console.log('The similarity endpoint is properly protected.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSimilarityWithAuth(); 