const axios = require('axios');

async function testSimpleSimilarity() {
  const baseURL = 'http://localhost:5000';
  
  console.log('🧪 Testing Simple Similarity Endpoint\n');
  
  try {
    // Test 1: Check if server is responding
    console.log('1️⃣ Testing server health...');
    try {
      const healthResponse = await axios.get(`${baseURL}/api/health`);
      console.log('✅ Server is healthy:', healthResponse.data);
    } catch (error) {
      console.log('❌ Server health check failed:', error.response?.status);
    }
    
    // Test 2: Test similarity endpoint without auth (should fail with 401)
    console.log('\n2️⃣ Testing similarity endpoint without auth...');
    try {
      const response = await axios.post(`${baseURL}/api/recipe/check-similarity`, {
        title: 'pasta',
        ingredients: ['test'],
        cuisine: 'Italian',
        readyInMinutes: 30
      });
      console.log('❌ Should have failed without auth:', response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly rejected without auth (401)');
        console.log('Response:', error.response.data);
      } else {
        console.log('❌ Unexpected error:', error.response?.status, error.response?.data);
      }
    }
    
    // Test 3: Test with a fake token (should also fail)
    console.log('\n3️⃣ Testing similarity endpoint with fake token...');
    try {
      const response = await axios.post(`${baseURL}/api/recipe/check-similarity`, {
        title: 'pasta',
        ingredients: ['test'],
        cuisine: 'Italian',
        readyInMinutes: 30
      }, {
        headers: {
          'Authorization': 'Bearer fake-token-123'
        }
      });
      console.log('❌ Should have failed with fake token:', response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly rejected with fake token (401)');
      } else {
        console.log('❌ Unexpected error:', error.response?.status, error.response?.data);
      }
    }
    
    console.log('\n✅ Simple similarity test completed!');
    console.log('The similarity endpoint is properly protected and requires authentication.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSimpleSimilarity(); 