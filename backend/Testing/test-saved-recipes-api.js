const axiosInstance = require('../axiosInstance');

const BASE_URL = 'http://localhost:5000/api';
const TEST_EMAIL = 'vincentburner01@gmail.com';
const TEST_PASSWORD = '999999';

async function testSavedRecipesAPI() {
  console.log('🔍 Testing Saved Recipes API endpoints...');
  
  try {
    // 1. Test login to get a token
    console.log('\n1. Testing login to get token...');
    const loginResponse = await axiosInstance.post(`${BASE_URL}/auth/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });

    if (loginResponse.status !== 200) {
      console.log('❌ Login failed:', loginResponse.status, loginResponse.data.error);
      console.log('Please update the password in this script to test with a real user');
      return;
    }

    const loginData = loginResponse.data;
    const token = loginData.session.access_token;
    console.log('✅ Login successful, got token');

    // 2. Test GET /api/saved-recipes
    console.log('\n2. Testing GET /api/saved-recipes...');
    const getResponse = await axiosInstance.get(`${BASE_URL}/saved-recipes`, { headers: { Authorization: `Bearer ${token}` } });

    if (getResponse.status === 200) {
      const data = getResponse.data;
      console.log(`✅ GET saved recipes successful: ${data.recipes?.length || 0} recipes found`);
      if (data.recipes && data.recipes.length > 0) {
        data.recipes.forEach((recipe, index) => {
          console.log(`  ${index + 1}. ${recipe.title} (ID: ${recipe.id})`);
        });
      }
    } else {
      console.log('❌ GET saved recipes failed:', getResponse.status, getResponse.data.error);
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

    const saveResponse = await axiosInstance.post(`${BASE_URL}/saved-recipes`, { recipe: testRecipe }, { headers: { Authorization: `Bearer ${token}` } });

    if (saveResponse.status === 200) {
      const saveData = saveResponse.data;
      console.log('✅ POST save recipe successful:', saveData.message);
    } else {
      const errorData = saveResponse.data;
      console.log('❌ POST save recipe failed:', saveResponse.status, errorData.error);
    }

    // 4. Test GET again to verify the recipe was saved
    console.log('\n4. Testing GET /api/saved-recipes again...');
    const getResponse2 = await axiosInstance.get(`${BASE_URL}/saved-recipes`, { headers: { Authorization: `Bearer ${token}` } });

    if (getResponse2.status === 200) {
      const data = getResponse2.data;
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
    const deleteResponse = await axiosInstance.delete(`${BASE_URL}/saved-recipes/${testRecipe.id}`, { headers: { Authorization: `Bearer ${token}` } });

    if (deleteResponse.status === 200) {
      console.log('✅ DELETE recipe successful');
    } else {
      console.log('❌ DELETE recipe failed:', deleteResponse.status, deleteResponse.data.error);
    }

    // 6. Test GET one more time to verify deletion
    console.log('\n6. Testing GET /api/saved-recipes after deletion...');
    const getResponse3 = await axiosInstance.get(`${BASE_URL}/saved-recipes`, { headers: { Authorization: `Bearer ${token}` } });

    if (getResponse3.status === 200) {
      const data = getResponse3.data;
      console.log(`✅ GET saved recipes successful: ${data.recipes?.length || 0} recipes found`);
      const newRecipe = data.recipes.find(r => r.id === testRecipe.id);
      if (newRecipe) {
        console.log('✅ New recipe found in saved recipes:', newRecipe.title);
      } else {
        console.log('❌ New recipe not found in saved recipes');
      }
    }
  } catch (error) {
    console.error('❌ An error occurred during testing:', error);
  }
}

testSavedRecipesAPI();