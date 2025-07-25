const axios = require('axios');

async function testServerHealth() {
  const baseURL = 'http://localhost:5000';
  
  console.log('🧪 Testing Server Health\n');
  
  try {
    // Test 1: Check if server is running
    console.log('1️⃣ Testing server health...');
    const healthResponse = await axios.get(`${baseURL}/api/health`);
    console.log('✅ Server is running!');
    console.log('Health response:', healthResponse.data);
    
    // Test 2: Test similarity endpoint without auth (should fail)
    console.log('\n2️⃣ Testing similarity endpoint without auth...');
    try {
      const similarityResponse = await axios.post(`${baseURL}/api/recipe/check-similarity`, {
        title: 'pasta',
        ingredients: ['test'],
        cuisine: 'Italian',
        readyInMinutes: 30
      });
      console.log('❌ Similarity endpoint should have failed without auth!');
    } catch (error) {
      console.log('✅ Similarity endpoint correctly requires auth:', error.response?.status);
    }
    
    console.log('\n🎉 Server health test completed!');
    
  } catch (error) {
    console.error('❌ Server health test failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ Server is not running on port 5000');
    }
  }
}

testServerHealth(); 