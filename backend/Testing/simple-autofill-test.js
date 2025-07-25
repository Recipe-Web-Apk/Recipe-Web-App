const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function simpleTest() {
  console.log('🧪 Simple Advanced Autofill Test\n');

  try {
    // Test 1: Basic request without auth
    console.log('1️⃣ Testing basic request...');
    const response = await axios.get(`${BASE_URL}/api/advanced-autofill`, {
      params: {
        title: 'Chicken Pasta',
        field: 'ingredients'
      }
    });

    console.log('✅ Response received:', {
      status: response.status,
      suggestionsCount: response.data.suggestions?.length || 0,
      totalSources: response.data.totalSources
    });

    if (response.data.suggestions?.length > 0) {
      console.log('📋 Sample suggestion:', response.data.suggestions[0]);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.error('❌ Status:', error.response?.status);
  }
}

simpleTest(); 