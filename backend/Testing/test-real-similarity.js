const axios = require('axios');

async function testRealSimilarity() {
  const baseURL = 'http://localhost:5000';
  
  console.log('🧪 Testing Real Similarity Endpoint\n');
  
  try {
    // Test 1: Check what happens when we search for "pasta"
    console.log('1️⃣ Testing similarity for "pasta"...');
    
    // First, let's check if we can get a valid token by logging in
    console.log('Attempting to get auth token...');
    
    try {
      const loginResponse = await axios.post(`${baseURL}/api/auth/login`, {
        email: 'vincent.animaddo@bulldogs.aamu.edu',
        password: 'test123'
      });
      
      const token = loginResponse.data.token;
      console.log('✅ Got auth token');
      
      // Now test similarity with the token
      const similarityResponse = await axios.post(`${baseURL}/api/recipe/check-similarity`, {
        title: 'pasta',
        ingredients: ['test'],
        cuisine: 'Italian',
        readyInMinutes: 30
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ Similarity response:', similarityResponse.data);
      
      if (similarityResponse.data.hasSimilarRecipes) {
        console.log('🔍 Found similar recipes:');
        similarityResponse.data.allMatches.forEach(match => {
          console.log(`  - ${match.recipe.title} (${match.scorePercentage}% similar)`);
        });
      } else {
        console.log('❌ No similar recipes found');
      }
      
    } catch (loginError) {
      console.log('❌ Login failed, testing without auth...');
      
      // Test without auth (should fail)
      try {
        const response = await axios.post(`${baseURL}/api/recipe/check-similarity`, {
          title: 'pasta',
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
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testRealSimilarity(); 