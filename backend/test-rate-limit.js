const axios = require('axios');

async function testRateLimit() {
  console.log('Testing rate limiting...');
  
  try {
    for (let i = 1; i <= 15; i++) {
      const response = await axios.get('http://localhost:5000/api/spoonacular/test');
      console.log(`Request ${i}: ${response.status}`);
      
      if (response.status === 429) {
        console.log('Rate limit hit!');
        break;
      }
    }
  } catch (error) {
    if (error.response && error.response.status === 429) {
      console.log('Rate limit working correctly!');
    } else {
      console.log('Error:', error.message);
    }
  }
}

testRateLimit(); 