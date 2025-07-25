const axios = require('axios');

async function testAuthStatus() {
  const baseURL = 'http://localhost:5000';
  
  console.log('🧪 Testing Authentication Status\n');
  
  try {
    // Test 1: Try to login with test credentials
    console.log('1️⃣ Attempting to login...');
    try {
      const loginResponse = await axios.post(`${baseURL}/api/auth/login`, {
        email: 'vincent.animaddo@bulldogs.aamu.edu',
        password: 'test123'
      });
      
      const token = loginResponse.data.session.access_token;
      console.log('✅ Login successful!');
      console.log('Token:', token.substring(0, 20) + '...');
      
      // Test 2: Test similarity endpoint with valid token
      console.log('\n2️⃣ Testing similarity endpoint with valid token...');
      try {
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
        
        console.log('✅ Similarity endpoint working!');
        console.log('Response:', similarityResponse.data);
        
        if (similarityResponse.data.hasSimilarRecipes) {
          console.log('🔍 Found similar recipes:');
          similarityResponse.data.allMatches.forEach(match => {
            console.log(`  - ${match.recipe.title} (${match.scorePercentage}% similar)`);
          });
        } else {
          console.log('❌ No similar recipes found');
        }
        
      } catch (error) {
        console.log('❌ Similarity endpoint failed:', error.response?.status, error.response?.data);
      }
      
    } catch (loginError) {
      console.log('❌ Login failed:', loginError.response?.status, loginError.response?.data);
      
      // Test 3: Try with different credentials
      console.log('\n3️⃣ Trying with different credentials...');
      try {
        const loginResponse2 = await axios.post(`${baseURL}/api/auth/login`, {
          email: 'test@example.com',
          password: 'password123'
        });
        
        console.log('✅ Alternative login successful!');
        const token2 = loginResponse2.data.session.access_token;
        
        // Test similarity with alternative token
        const similarityResponse2 = await axios.post(`${baseURL}/api/recipe/check-similarity`, {
          title: 'pasta',
          ingredients: ['test'],
          cuisine: 'Italian',
          readyInMinutes: 30
        }, {
          headers: {
            'Authorization': `Bearer ${token2}`
          }
        });
        
        console.log('✅ Similarity endpoint working with alternative account!');
        console.log('Response:', similarityResponse2.data);
        
      } catch (loginError2) {
        console.log('❌ Alternative login also failed:', loginError2.response?.status, loginError2.response?.data);
      }
    }
    
    console.log('\n✅ Authentication test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAuthStatus(); 