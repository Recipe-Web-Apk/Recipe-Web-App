const { generateSimilarityWarning } = require('../utils/computeSimilarity');

// Test data - simulate user's existing recipes
const userRecipes = [
  {
    id: 1,
    title: 'Spaghetti Carbonara',
    ingredients: ['pasta', 'eggs', 'bacon', 'parmesan cheese', 'black pepper'],
    cuisine: 'Italian',
    user_id: 'test-user-123'
  },
  {
    id: 2,
    title: 'Chicken Pasta',
    ingredients: ['chicken', 'pasta', 'tomato sauce', 'onions', 'garlic'],
    cuisine: 'Italian',
    user_id: 'test-user-123'
  },
  {
    id: 3,
    title: 'Beef Tacos',
    ingredients: ['beef', 'tortillas', 'lettuce', 'tomatoes', 'cheese'],
    cuisine: 'Mexican',
    user_id: 'test-user-123'
  }
];

// Test cases
const testCases = [
  {
    name: 'Exact title match',
    newRecipe: {
      title: 'Spaghetti Carbonara',
      ingredients: ['pasta', 'eggs', 'bacon', 'parmesan cheese', 'black pepper']
    }
  },
  {
    name: 'Similar title (substring)',
    newRecipe: {
      title: 'Carbonara Pasta',
      ingredients: ['pasta', 'eggs', 'bacon', 'parmesan cheese']
    }
  },
  {
    name: 'Different title but similar ingredients',
    newRecipe: {
      title: 'Pasta with Eggs and Bacon',
      ingredients: ['pasta', 'eggs', 'bacon', 'parmesan cheese', 'black pepper']
    }
  },
  {
    name: 'Completely different recipe',
    newRecipe: {
      title: 'Chocolate Cake',
      ingredients: ['flour', 'sugar', 'chocolate', 'eggs', 'milk']
    }
  }
];

console.log('🧪 Testing User Recipe Similarity System\n');

testCases.forEach((testCase, index) => {
  console.log(`\n--- Test ${index + 1}: ${testCase.name} ---`);
  console.log(`New Recipe: "${testCase.newRecipe.title}"`);
  console.log(`Ingredients: [${testCase.newRecipe.ingredients.join(', ')}]`);
  
  const warning = generateSimilarityWarning(testCase.newRecipe, userRecipes);
  
  if (warning) {
    console.log(`✅ WARNING DETECTED: ${warning.type.toUpperCase()}`);
    console.log(`Message: ${warning.message}`);
    console.log(`Top match: "${warning.matches[0].recipe.title}" (${warning.matches[0].scorePercentage}% similar)`);
    console.log(`Score breakdown:`);
    console.log(`  - Title: ${(warning.matches[0].titleScore * 100).toFixed(1)}%`);
    console.log(`  - Ingredients: ${(warning.matches[0].ingredientsScore * 100).toFixed(1)}%`);
  } else {
    console.log(`❌ No warning - recipe appears to be unique`);
  }
});

console.log('\n✅ User similarity test completed!'); 