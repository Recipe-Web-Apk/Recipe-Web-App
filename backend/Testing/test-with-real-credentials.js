const axios = require('axios');

async function testWithRealCredentials() {
  const baseURL = 'http://localhost:5000';
  
  console.log('🧪 Testing with Real Credentials\n');
  
  try {
    // Test 1: Login with real credentials
    console.log('1️⃣ Logging in with real credentials...');
    const loginResponse = await axios.post(`${baseURL}/api/auth/login`, {
      email: 'vincent.animaddo@bulldogs.aamu.edu',
      password: '123456'
    });
    
    const token = loginResponse.data.session.access_token;
    console.log('✅ Login successful!');
    console.log('Token:', token.substring(0, 20) + '...');
    
    // Test 2: Test similarity endpoint with "pasta"
    console.log('\n2️⃣ Testing similarity for "pasta"...');
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
    
    // Test 3: Test similarity endpoint with "tacos"
    console.log('\n3️⃣ Testing similarity for "tacos"...');
    const similarityResponse2 = await axios.post(`${baseURL}/api/recipe/check-similarity`, {
      title: 'tacos',
      ingredients: ['beef', 'tortillas'],
      cuisine: 'Mexican',
      readyInMinutes: 30
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Similarity endpoint working for tacos!');
    console.log('Response:', similarityResponse2.data);
    
    if (similarityResponse2.data.hasSimilarRecipes) {
      console.log('🔍 Found similar recipes:');
      similarityResponse2.data.allMatches.forEach(match => {
        console.log(`  - ${match.recipe.title} (${match.scorePercentage}% similar)`);
      });
    } else {
      console.log('❌ No similar recipes found for tacos');
    }
    
    console.log('\n🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Error details:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testWithRealCredentials(); 