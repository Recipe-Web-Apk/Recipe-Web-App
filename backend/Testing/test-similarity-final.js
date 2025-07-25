const axios = require('axios');

async function testSimilarity() {
  console.log('🧪 Testing Similarity Check\n');
  
  try {
    // Step 1: Login with user credentials
    console.log('1️⃣ Logging in...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'vincent.animaddo@bulldogs.aamu.edu',
      password: '123456'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful, token received');
    
    // Step 2: Test similarity check for "pasta"
    console.log('\n2️⃣ Testing similarity for "pasta"...');
    const similarityResponse = await axios.post('http://localhost:5000/api/recipe/check-similarity', {
      title: 'pasta',
      ingredients: ['test'],
      cuisine: '',
      readyInMinutes: 30
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Similarity response:', similarityResponse.data);
    
    if (similarityResponse.data.hasSimilarRecipes) {
      console.log('🎉 SUCCESS: Similar recipes found!');
      console.log('Warning type:', similarityResponse.data.warning.type);
      console.log('Warning message:', similarityResponse.data.warning.message);
      console.log('Matches found:', similarityResponse.data.warning.matches.length);
      similarityResponse.data.warning.matches.forEach(match => {
        console.log(`  - ${match.recipe.title} (${match.scorePercentage}% similar)`);
      });
    } else {
      console.log('❌ No similar recipes found');
    }
    
    // Step 3: Test similarity check for "tacos"
    console.log('\n3️⃣ Testing similarity for "tacos"...');
    const tacosResponse = await axios.post('http://localhost:5000/api/recipe/check-similarity', {
      title: 'tacos',
      ingredients: ['test'],
      cuisine: '',
      readyInMinutes: 30
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Tacos similarity response:', tacosResponse.data);
    
    if (tacosResponse.data.hasSimilarRecipes) {
      console.log('🎉 SUCCESS: Similar tacos recipes found!');
      tacosResponse.data.warning.matches.forEach(match => {
        console.log(`  - ${match.recipe.title} (${match.scorePercentage}% similar)`);
      });
    } else {
      console.log('❌ No similar tacos recipes found');
    }
    
    console.log('\n🎉 Test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testSimilarity(); 