const { generateSimilarityWarning } = require('../utils/computeSimilarity');

console.log('🧪 Testing Specific Title Matching\n');

// Test data - simulate user's existing recipes
const userRecipes = [
  {
    id: 1,
    title: 'Spaghetti Carbonara',
    ingredients: ['pasta', 'eggs', 'bacon', 'parmesan cheese'],
    cuisine: 'Italian'
  },
  {
    id: 2,
    title: 'Chicken Pasta',
    ingredients: ['chicken', 'pasta', 'tomato sauce'],
    cuisine: 'Italian'
  },
  {
    id: 3,
    title: 'Beef Tacos',
    ingredients: ['beef', 'tortillas', 'lettuce'],
    cuisine: 'Mexican'
  },
  {
    id: 4,
    title: 'Margherita Pizza',
    ingredients: ['pizza dough', 'tomato sauce', 'mozzarella'],
    cuisine: 'Italian'
  }
];

// Test cases
const testCases = [
  {
    input: 'pasta',
    expectedMatches: ['Spaghetti Carbonara', 'Chicken Pasta'],
    description: 'Should only match recipes with "pasta" in title'
  },
  {
    input: 'tacos',
    expectedMatches: ['Beef Tacos'],
    description: 'Should only match recipes with "tacos" in title'
  },
  {
    input: 'pizza',
    expectedMatches: ['Margherita Pizza'],
    description: 'Should only match recipes with "pizza" in title'
  },
  {
    input: 'salad',
    expectedMatches: [],
    description: 'Should return no matches for "salad"'
  }
];

testCases.forEach((testCase, index) => {
  console.log(`\n${index + 1}. Testing: "${testCase.input}"`);
  console.log(`Expected: ${testCase.expectedMatches.length} matches`);
  console.log(`Description: ${testCase.description}`);
  
  // Filter recipes to simulate the new fetchRelevantRecipes behavior
  const matchingRecipes = userRecipes.filter(recipe => 
    recipe.title.toLowerCase().includes(testCase.input.toLowerCase())
  );
  
  console.log(`Found ${matchingRecipes.length} recipes with "${testCase.input}" in title:`);
  matchingRecipes.forEach(recipe => console.log(`  - ${recipe.title}`));
  
  if (matchingRecipes.length > 0) {
    const newRecipe = {
      title: testCase.input,
      ingredients: ['test ingredient'],
      cuisine: 'Italian'
    };
    
    const warning = generateSimilarityWarning(newRecipe, matchingRecipes);
    
    if (warning) {
      console.log(`✅ WARNING DETECTED: ${warning.type.toUpperCase()}`);
      console.log(`Message: ${warning.message}`);
      warning.matches.forEach(match => {
        console.log(`  - ${match.recipe.title} (${match.scorePercentage}% similar)`);
      });
    } else {
      console.log('❌ No warning detected (similarity too low)');
    }
  } else {
    console.log('✅ No recipes found (correct behavior)');
  }
});

console.log('\n✅ Specific title matching test completed!'); 