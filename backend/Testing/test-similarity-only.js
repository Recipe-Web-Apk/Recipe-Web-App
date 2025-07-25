const { fetchRelevantRecipes } = require('../similarity/storage');

console.log('🧪 Testing Similarity - Title Only Matching\n');

async function testTitleOnlyMatching() {
  try {
    // Test 1: Search for "pasta" - should only return recipes with "pasta" in title
    console.log('1️⃣ Testing "pasta" search...');
    const pastaResults = await fetchRelevantRecipes('pasta', null, 'test-user-id');
    console.log(`Found ${pastaResults.length} recipes with "pasta" in title:`);
    pastaResults.forEach(recipe => {
      console.log(`  - ${recipe.title}`);
    });
    
    // Test 2: Search for "tacos" - should only return recipes with "tacos" in title
    console.log('\n2️⃣ Testing "tacos" search...');
    const tacosResults = await fetchRelevantRecipes('tacos', null, 'test-user-id');
    console.log(`Found ${tacosResults.length} recipes with "tacos" in title:`);
    tacosResults.forEach(recipe => {
      console.log(`  - ${recipe.title}`);
    });
    
    // Test 3: Search for "salad" - should return no results
    console.log('\n3️⃣ Testing "salad" search...');
    const saladResults = await fetchRelevantRecipes('salad', null, 'test-user-id');
    console.log(`Found ${saladResults.length} recipes with "salad" in title:`);
    if (saladResults.length === 0) {
      console.log('✅ Correctly found no recipes for "salad"');
    }
    
    // Test 4: Search for empty string - should return all user recipes
    console.log('\n4️⃣ Testing empty string search...');
    const emptyResults = await fetchRelevantRecipes('', null, 'test-user-id');
    console.log(`Found ${emptyResults.length} recipes with empty search:`);
    emptyResults.forEach(recipe => {
      console.log(`  - ${recipe.title}`);
    });
    
    console.log('\n✅ Title-only matching test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testTitleOnlyMatching(); 