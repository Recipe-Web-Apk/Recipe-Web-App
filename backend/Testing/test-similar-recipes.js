const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testSimilarRecipes() {
  const testPayload = {
    title: 'Pizza',
    ingredients: ['dough', 'cheese', 'tomato sauce', 'olive oil', 'basil']
  };
  try {
    const res = await axios.post(`${BASE_URL}/similar-recipes`, testPayload);
    console.log('Similar Recipes Response:');
    console.dir(res.data, { depth: null });
  } catch (err) {
    console.error('Error testing /similar-recipes:', err.response?.data || err.message);
  }
}

async function testAutofillRecipe() {
  const title = 'Pizza';
  try {
    const res = await axios.get(`${BASE_URL}/autofill-recipe`, { params: { title } });
    console.log('Autofill Recipe Response:');
    console.dir(res.data, { depth: null });
  } catch (err) {
    console.error('Error testing /autofill-recipe:', err.response?.data || err.message);
  }
}

(async () => {
  await testSimilarRecipes();
  await testAutofillRecipe();
})(); 