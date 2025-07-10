const fetch = require('node-fetch');

async function testServer() {
  console.log('🧪 Testing backend server...');
  
  try {
    // Test 1: Check if server is running
    console.log('\n1. Testing server connectivity...');
    const response = await fetch('http://localhost:5000/');
    
    if (response.ok) {
      console.log('✅ Backend server is running');
    } else {
      console.log('❌ Backend server responded with status:', response.status);
    }
    
    // Test 2: Check if recipes endpoint exists
    console.log('\n2. Testing recipes endpoint...');
    const recipesResponse = await fetch('http://localhost:5000/api/recipes', {
      method: 'GET'
    });
    
    if (recipesResponse.status === 401) {
      console.log('✅ Recipes endpoint exists (401 Unauthorized is expected without auth)');
    } else if (recipesResponse.status === 404) {
      console.log('❌ Recipes endpoint not found (404)');
    } else {
      console.log('⚠️  Recipes endpoint responded with status:', recipesResponse.status);
    }
    
    // Test 3: Check if saved-recipes endpoint exists
    console.log('\n3. Testing saved-recipes endpoint...');
    const savedResponse = await fetch('http://localhost:5000/api/saved-recipes', {
      method: 'GET'
    });
    
    if (savedResponse.status === 401) {
      console.log('✅ Saved-recipes endpoint exists (401 Unauthorized is expected without auth)');
    } else if (savedResponse.status === 404) {
      console.log('❌ Saved-recipes endpoint not found (404)');
    } else {
      console.log('⚠️  Saved-recipes endpoint responded with status:', savedResponse.status);
    }
    
  } catch (error) {
    console.error('❌ Server test failed:', error.message);
    console.log('\nMake sure your backend server is running:');
    console.log('cd backend && node server.js');
  }
}

testServer(); 