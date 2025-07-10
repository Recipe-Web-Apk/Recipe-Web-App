require('dotenv').config();
const fetch = require('node-fetch');

async function testRegistration() {
  console.log('Testing registration endpoint...');
  
  try {
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'testpass123',
        username: 'testuser'
      })
    });

    const data = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response data:', data);
    
    if (response.ok) {
      console.log('✅ Registration successful!');
    } else {
      console.log('❌ Registration failed:', data.error);
    }
    
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
}

testRegistration(); 