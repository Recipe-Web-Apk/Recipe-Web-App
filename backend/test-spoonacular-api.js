require('dotenv').config();
const axiosInstance = require('./axiosInstance');

const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;

async function testSpoonacularAPI() {
  console.log('Testing Spoonacular API...');
  console.log('API Key:', SPOONACULAR_API_KEY ? 'Present' : 'Missing');
  
  if (!SPOONACULAR_API_KEY) {
    console.error('❌ No API key found!');
    return;
  }

  try {
    // Test 1: Simple search
    console.log('\n1. Testing simple search...');
    const searchResponse = await axiosInstance.get('/recipes/complexSearch', {
      params: {
        query: 'pasta',
        apiKey: SPOONACULAR_API_KEY,
        number: 5,
        addRecipeInformation: true
      }
    });
    
    console.log('✅ Search successful');
    console.log('Results found:', searchResponse.data.results?.length || 0);
    console.log('Total results:', searchResponse.data.totalResults);
    
    if (searchResponse.data.results && searchResponse.data.results.length > 0) {
      console.log('Sample recipe:', searchResponse.data.results[0].title);
    }
    
  } catch (error) {
    console.error('❌ Search failed:', error.response?.data || error.message);
    
    if (error.response?.data?.code === 402) {
      console.log('This is an API limit error - you may have reached your daily limit');
    }
  }

  try {
    // Test 2: Recipe information
    console.log('\n2. Testing recipe information...');
    const infoResponse = await axiosInstance.get('/recipes/716429/information', {
      params: {
        apiKey: SPOONACULAR_API_KEY
      }
    });
    
    console.log('✅ Recipe info successful');
    console.log('Recipe title:', infoResponse.data.title);
    
  } catch (error) {
    console.error('❌ Recipe info failed:', error.response?.data || error.message);
  }

  try {
    // Test 3: Find by ingredients
    console.log('\n3. Testing find by ingredients...');
    const ingredientsResponse = await axiosInstance.get('/recipes/findByIngredients', {
      params: {
        ingredients: 'chicken,rice',
        apiKey: SPOONACULAR_API_KEY,
        number: 5
      }
    });
    
    console.log('✅ Find by ingredients successful');
    console.log('Results found:', ingredientsResponse.data?.length || 0);
    
  } catch (error) {
    console.error('❌ Find by ingredients failed:', error.response?.data || error.message);
  }
}

testSpoonacularAPI(); 