const { generateSimilarityWarning } = require('../utils/similarityUtils');

// Test the similarity system integration
function testSimilarityIntegration() {
  console.log('🧪 Testing Frontend-Backend Similarity Integration\n');

  // Simulate user's existing recipes (from their dashboard)
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
    }
  ];

  // Test case 1: User tries to create "Carbonara Pasta" (similar to existing "Spaghetti Carbonara")
  const testRecipe1 = {
    title: 'Carbonara Pasta',
    ingredients: ['pasta', 'eggs', 'bacon', 'parmesan cheese'],
    cuisine: 'Italian',
    readyInMinutes: 25
  };

  console.log('Test 1: Similar title detection');
  console.log(`User creating: "${testRecipe1.title}"`);
  console.log(`User's existing: "Spaghetti Carbonara"`);
  
  const warning1 = generateSimilarityWarning(testRecipe1, userRecipes, undefined, 0.3);
  
  if (warning1) {
    console.log(`✅ WARNING: ${warning1.type.toUpperCase()}`);
    console.log(`Message: ${warning1.message}`);
    console.log(`Match: "${warning1.matches[0].recipe.title}" (${warning1.matches[0].scorePercentage}% similar)`);
  } else {
    console.log('❌ No warning detected');
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test case 2: User tries to create "Beef Tacos" (completely different)
  const testRecipe2 = {
    title: 'Beef Tacos',
    ingredients: ['beef', 'tortillas', 'lettuce', 'tomatoes'],
    cuisine: 'Mexican',
    readyInMinutes: 20
  };

  console.log('Test 2: Different recipe (should not warn)');
  console.log(`User creating: "${testRecipe2.title}"`);
  console.log(`User's existing: Italian pasta recipes`);
  
  const warning2 = generateSimilarityWarning(testRecipe2, userRecipes, undefined, 0.3);
  
  if (warning2) {
    console.log(`❌ UNEXPECTED WARNING: ${warning2.type.toUpperCase()}`);
  } else {
    console.log('✅ No warning (correct behavior)');
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test case 3: User tries to create "Pasta with Eggs" (similar ingredients)
  const testRecipe3 = {
    title: 'Pasta with Eggs',
    ingredients: ['pasta', 'eggs', 'bacon', 'parmesan cheese', 'black pepper'],
    cuisine: 'Italian',
    readyInMinutes: 30
  };

  console.log('Test 3: Similar ingredients detection');
  console.log(`User creating: "${testRecipe3.title}"`);
  console.log(`Ingredients: [${testRecipe3.ingredients.join(', ')}]`);
  
  const warning3 = generateSimilarityWarning(testRecipe3, userRecipes, undefined, 0.3);
  
  if (warning3) {
    console.log(`✅ WARNING: ${warning3.type.toUpperCase()}`);
    console.log(`Message: ${warning3.message}`);
    console.log(`Match: "${warning3.matches[0].recipe.title}" (${warning3.matches[0].scorePercentage}% similar)`);
    console.log(`Score breakdown:`);
    console.log(`  - Title: ${(warning3.matches[0].titleScore * 100).toFixed(1)}%`);
    console.log(`  - Ingredients: ${(warning3.matches[0].ingredientsScore * 100).toFixed(1)}%`);
  } else {
    console.log('❌ No warning detected');
  }

  console.log('\n✅ Integration test completed!');
}

testSimilarityIntegration(); 