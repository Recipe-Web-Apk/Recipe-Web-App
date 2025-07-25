const axios = require('axios');

async function testEndpoints() {
  const baseURL = 'http://localhost:5000';
  
  console.log('🧪 Testing Server Endpoints\n');
  
  try {
    // Test 1: Health check
    console.log('1️⃣ Testing health check...');
    const healthResponse = await axios.get(`${baseURL}/`);
    console.log('✅ Health check:', healthResponse.data);
    
    // Test 2: Similarity endpoint (without auth)
    console.log('\n2️⃣ Testing similarity endpoint (should fail without auth)...');
    try {
      const similarityResponse = await axios.post(`${baseURL}/api/recipe/check-similarity`, {
        title: 'Test Recipe',
        ingredients: ['test']
      });
      console.log('❌ Should have failed without auth:', similarityResponse.data);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly rejected without auth (401)');
      } else {
        console.log('❌ Unexpected error:', error.response?.status, error.response?.data);
      }
    }
    
    // Test 3: Check if advanced autofill endpoint exists
    console.log('\n3️⃣ Testing advanced autofill endpoint...');
    try {
      const autofillResponse = await axios.get(`${baseURL}/api/advanced-autofill`);
      console.log('✅ Advanced autofill endpoint exists:', autofillResponse.data);
    } catch (error) {
      console.log('❌ Advanced autofill endpoint not found:', error.response?.status, error.response?.data);
    }
    
  } catch (error) {
    console.error('❌ Server connection failed:', error.message);
  }
}

testEndpoints(); 