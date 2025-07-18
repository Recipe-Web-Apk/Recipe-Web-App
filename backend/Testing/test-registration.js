require('dotenv').config();
const axiosInstance = require('../axiosInstance');

const TEST_EMAIL = 'vincentburner01@gmail.com';
const TEST_PASSWORD = '999999';

async function testRegistration() {
  console.log('Testing registration endpoint...');
  
  try {
    const response = await axiosInstance.post('http://localhost:5000/api/auth/register', {
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      username: 'testuser'
    });

    const data = response.data;
    
    console.log('Response status:', response.status);
    console.log('Response data:', data);
    
    if (response.status === 201) { // Assuming 201 is the status for successful registration
      console.log('✅ Registration successful!');
    } else {
      console.log('❌ Registration failed:', data.error);
    }
    
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
}

testRegistration(); 