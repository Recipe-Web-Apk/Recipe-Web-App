const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testSimpleRoute() {
  console.log('🧪 Testing Simple Route...\n');

  try {
    // Test the simple route
    console.log('1️⃣ Testing simple route...');
    const response = await axios.get(`${BASE_URL}/api/recipe/test`);
    console.log('✅ Simple route response:', response.data);

  } catch (error) {
    console.error('❌ Simple route test failed:', error.response?.status, error.response?.data || error.message);
  }
}

// Run the test
testSimpleRoute(); 