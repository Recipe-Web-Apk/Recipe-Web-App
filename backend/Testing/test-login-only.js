const axios = require('axios');

async function testLogin() {
  console.log('🧪 Testing Login\n');
  
  try {
    console.log('1️⃣ Attempting login...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'vincent.animaddo@bulldogs.aamu.edu',
      password: '123456'
    });
    
    console.log('✅ Login response:', loginResponse.data);
    console.log('Token received:', loginResponse.data.token ? 'Yes' : 'No');
    
    if (loginResponse.data.token) {
      console.log('🎉 Login successful!');
      
      // Test the token with a simple request
      console.log('\n2️⃣ Testing token with /api/auth/me...');
      const meResponse = await axios.get('http://localhost:5000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${loginResponse.data.token}`
        }
      });
      
      console.log('✅ /me response:', meResponse.data);
    }
    
  } catch (error) {
    console.error('❌ Login failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testLogin(); 