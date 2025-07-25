const { fetchRelevantRecipes } = require('../similarity/storage');

async function debugSimilarity() {
  console.log('🧪 Debugging Similarity Logic\n');
  
  try {
    // Test 1: Search for "pasta" without user ID
    console.log('1️⃣ Testing "pasta" search without user ID...');
    const pastaResults = await fetchRelevantRecipes('pasta', null, null);
    console.log(`Found ${pastaResults.length} recipes with "pasta" in title:`);
    pastaResults.forEach(recipe => {
      console.log(`  - ${recipe.title} (ID: ${recipe.id})`);
    });
    
    // Test 2: Search for "pasta" with user ID
    console.log('\n2️⃣ Testing "pasta" search with user ID...');
    const pastaResultsWithUser = await fetchRelevantRecipes('pasta', null, '4d163845-f7a3-4da5-8d03-50940f1ff4f6');
    console.log(`Found ${pastaResultsWithUser.length} recipes with "pasta" in title for user:`);
    pastaResultsWithUser.forEach(recipe => {
      console.log(`  - ${recipe.title} (ID: ${recipe.id})`);
    });
    
    // Test 3: Search for "tacos" with user ID
    console.log('\n3️⃣ Testing "tacos" search with user ID...');
    const tacosResults = await fetchRelevantRecipes('tacos', null, '4d163845-f7a3-4da5-8d03-50940f1ff4f6');
    console.log(`Found ${tacosResults.length} recipes with "tacos" in title for user:`);
    tacosResults.forEach(recipe => {
      console.log(`  - ${recipe.title} (ID: ${recipe.id})`);
    });
    
    // Test 4: Search for empty string (should return all user recipes)
    console.log('\n4️⃣ Testing empty string search...');
    const allRecipes = await fetchRelevantRecipes('', null, '4d163845-f7a3-4da5-8d03-50940f1ff4f6');
    console.log(`Found ${allRecipes.length} total recipes for user:`);
    allRecipes.forEach(recipe => {
      console.log(`  - ${recipe.title} (ID: ${recipe.id})`);
    });
    
    console.log('\n🎉 Debug completed!');
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugSimilarity(); 