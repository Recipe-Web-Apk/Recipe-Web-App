const axios = require('axios');

async function testServer() {
  console.log('🧪 Simple Server Test\n');
  
  try {
    console.log('Testing server connection...');
    const response = await axios.get('http://localhost:5000/');
    console.log('✅ Server is responding!');
    console.log('Response:', response.data);
  } catch (error) {
    console.error('❌ Server connection failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('Server is not running on port 5000');
    }
  }
}

testServer(); 