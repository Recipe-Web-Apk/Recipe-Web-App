const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000/api';

async function testSavedRecipesAPI() {
  console.log('🔍 Testing Saved Recipes API endpoints...');
  
  try {
    // 1. Test login to get a token
    console.log('\n1. Testing login to get token...');
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'vincentaddo2023@gmail.com',
        password: 'your-password-here' // Replace with actual password
      })
    });

    if (!loginResponse.ok) {
      console.log('❌ Login failed:', loginResponse.status, loginResponse.statusText);
      console.log('Please update the password in this script to test with a real user');
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.session.access_token;
    console.log('✅ Login successful, got token');

    // 2. Test GET /api/saved-recipes
    console.log('\n2. Testing GET /api/saved-recipes...');
    const getResponse = await fetch(`${BASE_URL}/saved-recipes`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (getResponse.ok) {
      const data = await getResponse.json();
      console.log(`✅ GET saved recipes successful: ${data.recipes?.length || 0} recipes found`);
      if (data.recipes && data.recipes.length > 0) {
        data.recipes.forEach((recipe, index) => {
          console.log(`  ${index + 1}. ${recipe.title} (ID: ${recipe.id})`);
        });
      }
    } else {
      console.log('❌ GET saved recipes failed:', getResponse.status, getResponse.statusText);
    }

    // 3. Test POST /api/saved-recipes (save a recipe)
    console.log('\n3. Testing POST /api/saved-recipes...');
    const testRecipe = {
      id: 444444,
      title: 'API Test Recipe - Chicken Curry',
      image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=300&fit=crop',
      readyInMinutes: 35,
      servings: 6,
      calories: 380,
      diets: ['gluten-free'],
      missedIngredientCount: 0,
      usedIngredientCount: 7
    };

    const saveResponse = await fetch(`${BASE_URL}/saved-recipes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ recipe: testRecipe })
    });

    if (saveResponse.ok) {
      const saveData = await saveResponse.json();
      console.log('✅ POST save recipe successful:', saveData.message);
    } else {
      const errorData = await saveResponse.json();
      console.log('❌ POST save recipe failed:', saveResponse.status, errorData.error);
    }

    // 4. Test GET again to verify the recipe was saved
    console.log('\n4. Testing GET /api/saved-recipes again...');
    const getResponse2 = await fetch(`${BASE_URL}/saved-recipes`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (getResponse2.ok) {
      const data = await getResponse2.json();
      console.log(`✅ GET saved recipes successful: ${data.recipes?.length || 0} recipes found`);
      const newRecipe = data.recipes.find(r => r.id === testRecipe.id);
      if (newRecipe) {
        console.log('✅ New recipe found in saved recipes:', newRecipe.title);
      } else {
        console.log('❌ New recipe not found in saved recipes');
      }
    }

    // 5. Test DELETE /api/saved-recipes/:id
    console.log('\n5. Testing DELETE /api/saved-recipes/:id...');
    const deleteResponse = await fetch(`${BASE_URL}/saved-recipes/${testRecipe.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (deleteResponse.ok) {
      console.log('✅ DELETE recipe successful');
    } else {
      console.log('❌ DELETE recipe failed:', deleteResponse.status, deleteResponse.statusText);
    }

    // 6. Test GET one more time to verify deletion
    console.log('\n6. Testing GET /api/saved-recipes after deletion...');
    const getResponse3 = await fetch(`${BASE_URL}/saved-recipes`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (getResponse3.ok) {
      const data = await getResponse3.json();
      console.log(`✅ GET saved recipes successful: ${data.recipes?.length || 0} recipes found`);
      const deletedRecipe = data.recipes.find(r => r.id === testRecipe.id);
      if (!deletedRecipe) {
        console.log('✅ Recipe successfully deleted');
      } else {
        console.log('❌ Recipe still exists after deletion');
      }
    }

    console.log('\n🎉 API testing completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testSavedRecipesAPI(); 