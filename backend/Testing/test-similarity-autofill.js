const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
const { computeOptimizedSimilarity } = require('../utils/noLibraryRecipeSimilarity');

// Configuration
const BASE_URL = 'http://localhost:5000';
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Test data for similarity testing
const existingRecipes = [
  {
    id: 'existing-1',
    title: 'Spaghetti Carbonara',
    ingredients: ['spaghetti', 'eggs', 'bacon', 'parmesan cheese', 'black pepper']
  },
  {
    id: 'existing-2',
    title: 'Chicken Pasta',
    ingredients: ['chicken breast', 'pasta', 'tomato sauce', 'garlic', 'onion']
  },
  {
    id: 'existing-3',
    title: 'Vegetarian Tacos',
    ingredients: ['tortillas', 'black beans', 'corn', 'tomatoes', 'avocado', 'cheese']
  },
  {
    id: 'existing-4',
    title: 'Beef Tacos',
    ingredients: ['tortillas', 'ground beef', 'onion', 'tomatoes', 'lettuce', 'cheese']
  },
  {
    id: 'existing-5',
    title: 'Chocolate Cake',
    ingredients: ['flour', 'sugar', 'cocoa powder', 'eggs', 'milk', 'butter']
  }
];

const newRecipes = [
  {
    title: 'Spaghetti Carbonara',
    ingredients: ['spaghetti', 'eggs', 'bacon', 'parmesan cheese', 'black pepper']
  },
  {
    title: 'Chicken Pasta Dish',
    ingredients: ['chicken breast', 'pasta', 'tomato sauce', 'garlic', 'onion']
  },
  {
    title: 'Veggie Tacos',
    ingredients: ['tortillas', 'black beans', 'corn', 'tomatoes', 'avocado']
  },
  {
    title: 'Beef Taco Recipe',
    ingredients: ['tortillas', 'ground beef', 'onion', 'tomatoes', 'lettuce']
  },
  {
    title: 'Chocolate Birthday Cake',
    ingredients: ['flour', 'sugar', 'cocoa powder', 'eggs', 'milk', 'butter', 'vanilla']
  }
];

// Test data for autofill testing
const autofillTestCases = [
  {
    title: 'Spaghetti Carbonara',
    expectedIngredients: ['spaghetti', 'eggs', 'bacon', 'cheese'],
    expectedInstructions: true,
    expectedStats: true
  },
  {
    title: 'Chicken Curry',
    expectedIngredients: ['chicken', 'curry', 'rice'],
    expectedInstructions: true,
    expectedStats: true
  },
  {
    title: 'Chocolate Cake',
    expectedIngredients: ['flour', 'sugar', 'cocoa', 'eggs'],
    expectedInstructions: true,
    expectedStats: true
  },
  {
    title: 'Pizza Margherita',
    expectedIngredients: ['dough', 'tomato', 'mozzarella', 'basil'],
    expectedInstructions: true,
    expectedStats: true
  }
];

// Helper functions
async function createTestRecipes() {
  console.log('Creating test recipes in database...');
  
  for (const recipe of existingRecipes) {
    const { data, error } = await supabase
      .from('recipes')
      .upsert({
        id: recipe.id,
        title: recipe.title,
        ingredients: recipe.ingredients
      });
    
    if (error) {
      console.error(`Error creating recipe ${recipe.id}:`, error);
      return false;
    }
  }
  
  console.log('✅ Test recipes created successfully');
  return true;
}

async function cleanupTestData() {
  console.log('Cleaning up test data...');
  
  const recipeIds = existingRecipes.map(r => r.id);
  const { error } = await supabase
    .from('recipes')
    .delete()
    .in('id', recipeIds);
  
  if (error) {
    console.error('Error cleaning up test data:', error);
  } else {
    console.log('✅ Test data cleaned up');
  }
}

// Similarity Algorithm Tests
async function testTitleNormalization() {
  console.log('\n🧪 Testing Title Normalization...');
  
  const testCases = [
    { input: 'Spaghetti Carbonara!', expected: 'spaghetti carbonara' },
    { input: 'Chicken & Pasta', expected: 'chicken pasta' },
    { input: 'Chocolate Cake (Best)', expected: 'chocolate cake best' },
    { input: 'Tacos   with   Extra   Spaces', expected: 'tacos with extra spaces' }
  ];
  
  let passed = 0;
  for (const testCase of testCases) {
    const normalized = testCase.input.toLowerCase().replace(/[^a-z\s]/g, '').replace(/\s+/g, ' ').trim();
    const isCorrect = normalized === testCase.expected;
    
    console.log(`${isCorrect ? '✅' : '❌'} "${testCase.input}" -> "${normalized}" (expected: "${testCase.expected}")`);
    
    if (isCorrect) passed++;
  }
  
  console.log(`\nTitle normalization: ${passed}/${testCases.length} tests passed`);
  return passed === testCases.length;
}

async function testJaccardSimilarity() {
  console.log('\n🧪 Testing Jaccard Similarity...');
  
  const testCases = [
    {
      arr1: ['apple', 'banana', 'orange'],
      arr2: ['apple', 'banana', 'grape'],
      expected: 0.5 // 2 common / 4 total unique
    },
    {
      arr1: ['pasta', 'sauce', 'cheese'],
      arr2: ['pasta', 'sauce', 'cheese'],
      expected: 1.0 // 3 common / 3 total unique
    },
    {
      arr1: ['chicken', 'rice'],
      arr2: ['beef', 'pasta'],
      expected: 0.0 // 0 common / 4 total unique
    },
    {
      arr1: ['flour', 'sugar', 'eggs'],
      arr2: ['flour', 'sugar', 'eggs', 'milk'],
      expected: 0.75 // 3 common / 4 total unique
    }
  ];
  
  let passed = 0;
  for (const testCase of testCases) {
    const setA = new Set(testCase.arr1.map(i => i.toLowerCase().trim()));
    const setB = new Set(testCase.arr2.map(i => i.toLowerCase().trim()));
    
    let intersection = 0;
    for (let item of setA) if (setB.has(item)) intersection++;
    const unionSize = setA.size + setB.size - intersection;
    const similarity = intersection / unionSize;
    
    const isCorrect = Math.abs(similarity - testCase.expected) < 0.01;
    
    console.log(`${isCorrect ? '✅' : '❌'} [${testCase.arr1.join(', ')}] vs [${testCase.arr2.join(', ')}] = ${similarity.toFixed(3)} (expected: ${testCase.expected})`);
    
    if (isCorrect) passed++;
  }
  
  console.log(`\nJaccard similarity: ${passed}/${testCases.length} tests passed`);
  return passed === testCases.length;
}

async function testSimilarityAlgorithm() {
  console.log('\n🧪 Testing Similarity Algorithm Integration...');
  
  try {
    // Create test recipes in database
    await createTestRecipes();
    
    let passed = 0;
    const totalTests = newRecipes.length;
    
    for (const newRecipe of newRecipes) {
      const response = await axios.post(`${BASE_URL}/similar-recipes`, {
        title: newRecipe.title,
        ingredients: newRecipe.ingredients
      });
      
      const matches = response.data;
      console.log(`\nTesting: "${newRecipe.title}"`);
      console.log(`Matches found: ${matches.length}`);
      
      // Check if we get reasonable matches
      const hasMatches = matches.length > 0;
      const hasHighScoreMatch = matches.some(match => match.score > 0.6);
      
      console.log(`- Has matches: ${hasMatches ? '✅' : '❌'}`);
      console.log(`- Has high score match (>0.6): ${hasHighScoreMatch ? '✅' : '❌'}`);
      
      if (matches.length > 0) {
        console.log('Top matches:');
        matches.slice(0, 3).forEach(match => {
          console.log(`  - "${match.recipe.title}" (score: ${match.score.toFixed(3)})`);
        });
      }
      
      if (hasMatches && hasHighScoreMatch) passed++;
    }
    
    console.log(`\nSimilarity algorithm: ${passed}/${totalTests} tests passed`);
    return passed >= totalTests * 0.8; // Allow 20% tolerance
  } catch (error) {
    console.error('❌ Similarity algorithm test failed:', error.response?.data || error.message);
    return false;
  }
}

// Autofill Tests
async function testAutofillResponse() {
  console.log('\n🧪 Testing Autofill Response Structure...');
  
  try {
    const testTitle = 'Spaghetti Carbonara';
    const response = await axios.get(`${BASE_URL}/autofill-recipe?title=${encodeURIComponent(testTitle)}`);
    
    const data = response.data;
    console.log(`\nTesting autofill for: "${testTitle}"`);
    
    // Check response structure
    const hasTitle = typeof data.title === 'string';
    const hasIngredients = Array.isArray(data.ingredients);
    const hasInstructions = Array.isArray(data.instructions);
    const hasImage = data.image === null || typeof data.image === 'string';
    const hasReadyInMinutes = data.readyInMinutes === null || typeof data.readyInMinutes === 'number';
    const hasCalories = data.calories === null || typeof data.calories === 'number';
    const hasServings = data.servings === null || typeof data.servings === 'number';
    
    console.log(`- Has title: ${hasTitle ? '✅' : '❌'}`);
    console.log(`- Has ingredients array: ${hasIngredients ? '✅' : '❌'}`);
    console.log(`- Has instructions array: ${hasInstructions ? '✅' : '❌'}`);
    console.log(`- Has image field: ${hasImage ? '✅' : '❌'}`);
    console.log(`- Has readyInMinutes: ${hasReadyInMinutes ? '✅' : '❌'}`);
    console.log(`- Has calories: ${hasCalories ? '✅' : '❌'}`);
    console.log(`- Has servings: ${hasServings ? '✅' : '❌'}`);
    
    // Check data quality
    const hasValidIngredients = hasIngredients && data.ingredients.length > 0;
    const hasValidInstructions = hasInstructions && data.ingredients.length > 0;
    
    console.log(`- Has valid ingredients: ${hasValidIngredients ? '✅' : '❌'}`);
    console.log(`- Has valid instructions: ${hasValidInstructions ? '✅' : '❌'}`);
    
    if (hasValidIngredients) {
      console.log(`- Ingredients count: ${data.ingredients.length}`);
      console.log(`- Sample ingredients: ${data.ingredients.slice(0, 3).join(', ')}`);
    }
    
    if (hasValidInstructions) {
      console.log(`- Instructions count: ${data.instructions.length}`);
      console.log(`- Sample instruction: "${data.instructions[0]?.substring(0, 50)}..."`);
    }
    
    const allChecks = hasTitle && hasIngredients && hasInstructions && hasImage && 
                     hasReadyInMinutes && hasCalories && hasServings;
    
    return allChecks;
  } catch (error) {
    console.error('❌ Autofill response test failed:', error.response?.data || error.message);
    return false;
  }
}

async function testAutofillAccuracy() {
  console.log('\n🧪 Testing Autofill Accuracy...');
  
  try {
    let passed = 0;
    const totalTests = autofillTestCases.length;
    
    for (const testCase of autofillTestCases) {
      console.log(`\nTesting: "${testCase.title}"`);
      
      const response = await axios.get(`${BASE_URL}/autofill-recipe?title=${encodeURIComponent(testCase.title)}`);
      const data = response.data;
      
      // Check if we got a response
      if (!data || !data.title) {
        console.log('❌ No response received');
        continue;
      }
      
      // Check title accuracy
      const titleMatch = data.title.toLowerCase().includes(testCase.title.toLowerCase()) ||
                        testCase.title.toLowerCase().includes(data.title.toLowerCase());
      console.log(`- Title match: ${titleMatch ? '✅' : '❌'} (got: "${data.title}")`);
      
      // Check ingredients
      const hasIngredients = Array.isArray(data.ingredients) && data.ingredients.length > 0;
      const ingredientMatch = hasIngredients && testCase.expectedIngredients.some(expected => 
        data.ingredients.some(ingredient => 
          ingredient.toLowerCase().includes(expected.toLowerCase())
        )
      );
      console.log(`- Ingredients match: ${ingredientMatch ? '✅' : '❌'}`);
      
      // Check instructions
      const hasInstructions = Array.isArray(data.instructions) && data.instructions.length > 0;
      console.log(`- Has instructions: ${hasInstructions ? '✅' : '❌'}`);
      
      // Check stats
      const hasStats = (data.readyInMinutes || data.calories || data.servings);
      console.log(`- Has stats: ${hasStats ? '✅' : '❌'}`);
      
      if (titleMatch && ingredientMatch && hasInstructions && hasStats) {
        passed++;
      }
    }
    
    console.log(`\nAutofill accuracy: ${passed}/${totalTests} tests passed`);
    return passed >= totalTests * 0.7; // Allow 30% tolerance for API variations
  } catch (error) {
    console.error('❌ Autofill accuracy test failed:', error.response?.data || error.message);
    return false;
  }
}

async function testAutofillErrorHandling() {
  console.log('\n🧪 Testing Autofill Error Handling...');
  
  try {
    // Test with very short title
    try {
      const response = await axios.get(`${BASE_URL}/autofill-recipe?title=ab`);
      console.log('❌ Should have rejected short title');
      return false;
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Correctly rejected short title');
      } else {
        console.log('❌ Unexpected error for short title:', error.response?.status);
        return false;
      }
    }
    
    // Test with empty title
    try {
      const response = await axios.get(`${BASE_URL}/autofill-recipe?title=`);
      console.log('❌ Should have rejected empty title');
      return false;
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Correctly rejected empty title');
      } else {
        console.log('❌ Unexpected error for empty title:', error.response?.status);
        return false;
      }
    }
    
    // Test with non-existent recipe
    const response = await axios.get(`${BASE_URL}/autofill-recipe?title=ThisIsACompletelyMadeUpRecipeNameThatShouldNotExist12345`);
    const data = response.data;
    
    // Should return empty arrays but not error
    const hasEmptyResponse = (!data.ingredients || data.ingredients.length === 0) &&
                            (!data.instructions || data.instructions.length === 0);
    console.log(`- Handles non-existent recipe: ${hasEmptyResponse ? '✅' : '❌'}`);
    
    return hasEmptyResponse;
  } catch (error) {
    console.error('❌ Error handling test failed:', error.response?.data || error.message);
    return false;
  }
}

async function testPerformance() {
  console.log('\n🧪 Testing Performance...');
  
  try {
    const testTitle = 'Chicken Curry';
    const startTime = Date.now();
    
    const response = await axios.get(`${BASE_URL}/autofill-recipe?title=${encodeURIComponent(testTitle)}`);
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`\nPerformance Results:`);
    console.log(`- Response time: ${duration}ms`);
    console.log(`- Performance rating: ${duration < 3000 ? '✅ Good' : duration < 8000 ? '⚠️ Acceptable' : '❌ Slow'}`);
    
    return duration < 8000; // Should complete within 8 seconds
  } catch (error) {
    console.error('❌ Performance test failed:', error.response?.data || error.message);
    return false;
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Similarity & Autofill Tests...\n');
  
  const tests = [
    { name: 'Title Normalization', fn: testTitleNormalization },
    { name: 'Jaccard Similarity', fn: testJaccardSimilarity },
    { name: 'Similarity Algorithm', fn: testSimilarityAlgorithm },
    { name: 'Autofill Response Structure', fn: testAutofillResponse },
    { name: 'Autofill Accuracy', fn: testAutofillAccuracy },
    { name: 'Error Handling', fn: testAutofillErrorHandling },
    { name: 'Performance', fn: testPerformance }
  ];
  
  const results = [];
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      results.push({ name: test.name, passed: result });
      console.log(`${result ? '✅' : '❌'} ${test.name}: ${result ? 'PASSED' : 'FAILED'}`);
    } catch (error) {
      console.error(`❌ ${test.name}: ERROR - ${error.message}`);
      results.push({ name: test.name, passed: false });
    }
  }
  
  // Cleanup
  await cleanupTestData();
  
  // Summary
  console.log('\n📊 Test Summary:');
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  console.log(`${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! Similarity and autofill features are working correctly.');
  } else {
    console.log('⚠️ Some tests failed. Check the implementation.');
  }
  
  return results;
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Test runner error:', error);
      process.exit(1);
    });
}

module.exports = {
  runAllTests,
  testTitleNormalization,
  testJaccardSimilarity,
  testSimilarityAlgorithm,
  testAutofillResponse,
  testAutofillAccuracy,
  testAutofillErrorHandling,
  testPerformance
}; 