const axios = require('axios');

async function checkRecipesInDB() {
  const baseURL = 'http://localhost:5000';
  
  console.log('🧪 Checking Recipes in Database\n');
  
  try {
    // Step 1: Login
    console.log('1️⃣ Logging in...');
    const loginResponse = await axios.post(`${baseURL}/api/auth/login`, {
      email: 'vincent.animaddo@bulldogs.aamu.edu',
      password: '123456'
    });
    
    const token = loginResponse.data.session.access_token;
    console.log('✅ Login successful!');
    
    // Step 2: Get user's recipes
    console.log('\n2️⃣ Fetching user recipes...');
    const recipesResponse = await axios.get(`${baseURL}/api/recipes`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ User recipes:');
    console.log('Response:', recipesResponse.data);
    if (Array.isArray(recipesResponse.data)) {
      recipesResponse.data.forEach(recipe => {
        console.log(`  - ${recipe.title} (ID: ${recipe.id})`);
      });
    } else {
      console.log('Response is not an array:', typeof recipesResponse.data);
    }
    
    // Step 3: Test similarity with exact title match
    console.log('\n3️⃣ Testing similarity with exact title "Chicken Pasta"...');
    const exactMatchResponse = await axios.post(`${baseURL}/api/recipe/check-similarity`, {
      title: 'Chicken Pasta',
      ingredients: ['test'],
      cuisine: 'Italian',
      readyInMinutes: 30
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Exact match response:', exactMatchResponse.data);
    
    // Step 4: Test similarity with partial title "pasta"
    console.log('\n4️⃣ Testing similarity with partial title "pasta"...');
    const partialMatchResponse = await axios.post(`${baseURL}/api/recipe/check-similarity`, {
      title: 'pasta',
      ingredients: ['test'],
      cuisine: 'Italian',
      readyInMinutes: 30
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Partial match response:', partialMatchResponse.data);
    
    // Step 5: Test similarity with "tacos"
    console.log('\n5️⃣ Testing similarity with "tacos"...');
    const tacosResponse = await axios.post(`${baseURL}/api/recipe/check-similarity`, {
      title: 'tacos',
      ingredients: ['test'],
      cuisine: 'Mexican',
      readyInMinutes: 30
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Tacos response:', tacosResponse.data);
    
    console.log('\n🎉 Database check completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

checkRecipesInDB(); 