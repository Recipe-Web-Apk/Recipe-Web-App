const axios = require('axios');
require('dotenv').config();

const BASE_URL = 'http://localhost:5000';

async function testBasicServer() {
  console.log('🧪 Testing Basic Server Connection...\n');

  try {
    // Test 1: Check if server is running
    console.log('1️⃣ Testing server connection...');
    const response = await axios.get(`${BASE_URL}/`);
    console.log('✅ Server is running:', response.data);

    // Test 2: Check if recipe routes are accessible
    console.log('\n2️⃣ Testing recipe routes...');
    try {
      const recipeResponse = await axios.post(`${BASE_URL}/api/recipe/check-similarity`, {
        title: 'Test Recipe'
      }, {
        headers: {
          'Authorization': 'Bearer test-token'
        }
      });
      console.log('✅ Recipe route is accessible');
    } catch (error) {
      console.log('❌ Recipe route error:', error.response?.status, error.response?.data?.error || error.message);
    }

    // Test 3: List all available routes
    console.log('\n3️⃣ Available routes:');
    console.log('   GET  /');
    console.log('   POST /api/recipe/check-similarity');
    console.log('   POST /api/recipe/similarity-decision');
    console.log('   POST /api/recipe/autofill-data');

  } catch (error) {
    console.error('❌ Server test failed:', error.message);
    console.log('\n💡 Make sure the server is running with: npm start');
  }
}

// Run the test
testBasicServer(); 