const axios = require('axios');

async function createTestUser() {
  const baseURL = 'http://localhost:5000';
  
  console.log('🧪 Creating Test User\n');
  
  try {
    // Test 1: Register a new test user
    console.log('1️⃣ Registering test user...');
    try {
      const registerResponse = await axios.post(`${baseURL}/api/auth/register`, {
        email: 'test@recipebuddy.com',
        password: 'test123456',
        username: 'testuser'
      });
      
      console.log('✅ Registration successful!');
      console.log('Response:', registerResponse.data);
      
      // Test 2: Login with the new user
      console.log('\n2️⃣ Logging in with new user...');
      const loginResponse = await axios.post(`${baseURL}/api/auth/login`, {
        email: 'test@recipebuddy.com',
        password: 'test123456'
      });
      
      const token = loginResponse.data.session.access_token;
      console.log('✅ Login successful!');
      console.log('Token:', token.substring(0, 20) + '...');
      
      // Test 3: Test similarity endpoint
      console.log('\n3️⃣ Testing similarity endpoint...');
      const similarityResponse = await axios.post(`${baseURL}/api/recipe/check-similarity`, {
        title: 'pasta',
        ingredients: ['test'],
        cuisine: 'Italian',
        readyInMinutes: 30
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ Similarity endpoint working!');
      console.log('Response:', similarityResponse.data);
      
      console.log('\n🎉 Test user created successfully!');
      console.log('📝 Use these credentials to log in:');
      console.log('   Email: test@recipebuddy.com');
      console.log('   Password: test123456');
      
    } catch (registerError) {
      if (registerError.response?.status === 400 && registerError.response?.data?.error?.includes('already exists')) {
        console.log('ℹ️ User already exists, trying to login...');
        
        // Try to login with existing user
        const loginResponse = await axios.post(`${baseURL}/api/auth/login`, {
          email: 'test@recipebuddy.com',
          password: 'test123456'
        });
        
        const token = loginResponse.data.session.access_token;
        console.log('✅ Login successful!');
        console.log('Token:', token.substring(0, 20) + '...');
        
        console.log('\n🎉 Test user login successful!');
        console.log('📝 Use these credentials to log in:');
        console.log('   Email: test@recipebuddy.com');
        console.log('   Password: test123456');
        
      } else {
        console.log('❌ Registration failed:', registerError.response?.status, registerError.response?.data);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

createTestUser(); 