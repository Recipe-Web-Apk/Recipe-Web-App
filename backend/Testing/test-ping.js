const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testPing() {
  console.log('🧪 Testing Ping Route...\n');

  try {
    // Test the ping route
    console.log('1️⃣ Testing ping route...');
    const response = await axios.get(`${BASE_URL}/api/recipe/ping`);
    console.log('✅ Ping response:', response.data);

  } catch (error) {
    console.error('❌ Ping test failed:', error.response?.data || error.message);
  }
}

// Run the test
testPing(); 