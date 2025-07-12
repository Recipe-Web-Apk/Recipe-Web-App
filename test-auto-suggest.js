const axios = require('axios');

// Test the auto-suggest endpoint
async function testAutoSuggest() {
  try {
    console.log('Testing auto-suggest endpoint...\n');
    
    // Test with "pasta" query
    console.log('Testing with query: "pasta"');
    const pastaResponse = await axios.get('http://localhost:5000/api/spoonacular/suggest?query=pasta');
    console.log('Response status:', pastaResponse.status);
    console.log('Number of results:', pastaResponse.data.results?.length || 0);
    
    if (pastaResponse.data.results && pastaResponse.data.results.length > 0) {
      console.log('Sample results:');
      pastaResponse.data.results.slice(0, 3).forEach((recipe, index) => {
        console.log(`${index + 1}. ${recipe.title} (ID: ${recipe.id})`);
      });
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Test with "chicken" query
    console.log('Testing with query: "chicken"');
    const chickenResponse = await axios.get('http://localhost:5000/api/spoonacular/suggest?query=chicken');
    console.log('Response status:', chickenResponse.status);
    console.log('Number of results:', chickenResponse.data.results?.length || 0);
    
    if (chickenResponse.data.results && chickenResponse.data.results.length > 0) {
      console.log('Sample results:');
      chickenResponse.data.results.slice(0, 3).forEach((recipe, index) => {
        console.log(`${index + 1}. ${recipe.title} (ID: ${recipe.id})`);
      });
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Test with short query (should return empty)
    console.log('Testing with short query: "a"');
    const shortResponse = await axios.get('http://localhost:5000/api/spoonacular/suggest?query=a');
    console.log('Response status:', shortResponse.status);
    console.log('Number of results:', shortResponse.data.results?.length || 0);
    
  } catch (error) {
    console.error('Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testAutoSuggest(); 