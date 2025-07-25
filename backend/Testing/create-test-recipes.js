const axios = require('axios');

async function createTestRecipes() {
  const baseURL = 'http://localhost:5000';
  
  console.log('🧪 Creating Test Recipes\n');
  
  try {
    // Step 1: Login
    console.log('1️⃣ Logging in...');
    const loginResponse = await axios.post(`${baseURL}/api/auth/login`, {
      email: 'vincent.animaddo@bulldogs.aamu.edu',
      password: '123456'
    });
    
    const token = loginResponse.data.session.access_token;
    console.log('✅ Login successful!');
    
    // Step 2: Create test recipes
    const testRecipes = [
      {
        title: 'Chicken Pasta',
        description: 'A delicious chicken pasta recipe',
        ingredients: ['chicken', 'pasta', 'tomato sauce', 'garlic'],
        instructions: ['Cook pasta', 'Cook chicken', 'Combine ingredients'],
        difficulty: 'Easy',
        category: 'Dinner',
        servings: 4,
        calories: 400,
        cookTime: 30,
        prepTime: 15,
        cuisine: 'Italian'
      },
      {
        title: 'Spaghetti Carbonara',
        description: 'Classic Italian carbonara',
        ingredients: ['spaghetti', 'eggs', 'bacon', 'parmesan cheese'],
        instructions: ['Boil pasta', 'Cook bacon', 'Mix with eggs'],
        difficulty: 'Medium',
        category: 'Dinner',
        servings: 2,
        calories: 500,
        cookTime: 25,
        prepTime: 10,
        cuisine: 'Italian'
      },
      {
        title: 'Beef Tacos',
        description: 'Mexican beef tacos',
        ingredients: ['beef', 'tortillas', 'lettuce', 'tomatoes'],
        instructions: ['Cook beef', 'Warm tortillas', 'Assemble tacos'],
        difficulty: 'Easy',
        category: 'Dinner',
        servings: 4,
        calories: 350,
        cookTime: 20,
        prepTime: 10,
        cuisine: 'Mexican'
      },
      {
        title: 'Margherita Pizza',
        description: 'Classic margherita pizza',
        ingredients: ['pizza dough', 'tomato sauce', 'mozzarella', 'basil'],
        instructions: ['Roll dough', 'Add toppings', 'Bake'],
        difficulty: 'Medium',
        category: 'Dinner',
        servings: 4,
        calories: 300,
        cookTime: 15,
        prepTime: 20,
        cuisine: 'Italian'
      }
    ];
    
    console.log('2️⃣ Creating test recipes...');
    const createdRecipes = [];
    
    for (const recipe of testRecipes) {
      try {
        const response = await axios.post(`${baseURL}/api/recipes`, recipe, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log(`✅ Created: ${recipe.title}`);
        createdRecipes.push(response.data);
      } catch (error) {
        console.log(`❌ Failed to create ${recipe.title}:`, error.response?.data);
      }
    }
    
    console.log(`\n🎉 Created ${createdRecipes.length} test recipes!`);
    
    // Step 3: Test similarity with the new recipes
    console.log('\n3️⃣ Testing similarity with new recipes...');
    
    // Test pasta similarity
    const pastaResponse = await axios.post(`${baseURL}/api/recipe/check-similarity`, {
      title: 'pasta',
      ingredients: ['test'],
      cuisine: 'Italian',
      readyInMinutes: 30
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('🔍 Pasta similarity test:');
    console.log('Response:', pastaResponse.data);
    
    if (pastaResponse.data.hasSimilarRecipes) {
      console.log('✅ Found similar pasta recipes:');
      pastaResponse.data.allMatches.forEach(match => {
        console.log(`  - ${match.recipe.title} (${match.scorePercentage}% similar)`);
      });
    } else {
      console.log('❌ No similar pasta recipes found');
    }
    
    // Test tacos similarity
    const tacosResponse = await axios.post(`${baseURL}/api/recipe/check-similarity`, {
      title: 'tacos',
      ingredients: ['beef', 'tortillas'],
      cuisine: 'Mexican',
      readyInMinutes: 30
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('\n🔍 Tacos similarity test:');
    console.log('Response:', tacosResponse.data);
    
    if (tacosResponse.data.hasSimilarRecipes) {
      console.log('✅ Found similar taco recipes:');
      tacosResponse.data.allMatches.forEach(match => {
        console.log(`  - ${match.recipe.title} (${match.scorePercentage}% similar)`);
      });
    } else {
      console.log('❌ No similar taco recipes found');
    }
    
    console.log('\n🎉 Test recipes created and similarity tested!');
    console.log('Now try creating a recipe with "pasta" in the frontend - you should see similarity warnings!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

createTestRecipes(); 