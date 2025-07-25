const axios = require('axios');

// Test the similarity endpoint
async function testSimilarityEndpoint() {
  try {
    console.log('🧪 Testing Similarity Endpoint\n');
    
    // First, let's test with a simple request
    const testData = {
      title: 'Spaghetti Carbonara',
      ingredients: ['pasta', 'eggs', 'bacon', 'parmesan cheese', 'black pepper'],
      cuisine: 'Italian',
      readyInMinutes: 30
    };

    console.log('Testing with recipe:', testData.title);
    console.log('Ingredients:', testData.ingredients.join(', '));
    
    const response = await axios.post('http://localhost:5000/api/recipe/check-similarity', testData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token' // This will be handled by auth middleware
      }
    });

    console.log('✅ Response received:');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error testing similarity endpoint:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testSimilarityEndpoint(); 