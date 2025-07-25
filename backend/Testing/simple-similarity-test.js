const { generateSimilarityWarning } = require('../utils/similarityUtils');

console.log('🧪 Simple Similarity Test\n');

// Test data
const userRecipes = [
  {
    id: 1,
    title: 'Spaghetti Carbonara',
    ingredients: ['pasta', 'eggs', 'bacon', 'parmesan cheese', 'black pepper'],
    cuisine: 'Italian'
  }
];

const newRecipe = {
  title: 'Carbonara Pasta',
  ingredients: ['pasta', 'eggs', 'bacon', 'parmesan cheese'],
  cuisine: 'Italian',
  readyInMinutes: 25
};

console.log('Testing similarity between:');
console.log(`- New: "${newRecipe.title}"`);
console.log(`- Existing: "${userRecipes[0].title}"`);

  const warning = generateSimilarityWarning(newRecipe, userRecipes, undefined, 0.3);

if (warning) {
  console.log('\n✅ WARNING DETECTED!');
  console.log(`Type: ${warning.type}`);
  console.log(`Message: ${warning.message}`);
  console.log(`Match: "${warning.matches[0].recipe.title}" (${warning.matches[0].scorePercentage}% similar)`);
} else {
  console.log('\n❌ No warning detected');
}

console.log('\n✅ Test completed!'); 