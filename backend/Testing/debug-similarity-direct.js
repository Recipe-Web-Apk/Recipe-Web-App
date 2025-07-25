const { fetchRelevantRecipes } = require('../similarity/storage');
const { generateSimilarityWarning } = require('../utils/similarityUtils');

async function debugSimilarityDirect() {
  console.log('🧪 Debugging Similarity Logic Directly\n');
  
  try {
    // Test 1: Search for "pasta" with user ID
    console.log('1️⃣ Testing "pasta" search with user ID...');
    const pastaResults = await fetchRelevantRecipes('pasta', null, '4d163845-f7a3-4da5-8d03-50940f1ff4f6');
    console.log(`Found ${pastaResults.length} recipes with "pasta" in title:`);
    pastaResults.forEach(recipe => {
      console.log(`  - ${recipe.title} (ID: ${recipe.id})`);
    });
    
    // Test 2: Test similarity computation directly
    if (pastaResults.length > 0) {
      console.log('\n2️⃣ Testing similarity computation...');
      const newRecipe = {
        title: 'pasta',
        ingredients: ['test']
      };
      
      const warning = generateSimilarityWarning(newRecipe, pastaResults, undefined, 0.3);
      console.log('Similarity warning result:', warning);
      
      if (warning) {
        console.log('✅ Similarity warning generated!');
        console.log('Type:', warning.type);
        console.log('Message:', warning.message);
        console.log('Matches:', warning.matches.length);
        warning.matches.forEach(match => {
          console.log(`  - ${match.recipe.title} (${match.scorePercentage}% similar)`);
        });
      } else {
        console.log('❌ No similarity warning generated');
      }
    }
    
    // Test 3: Search for "tacos" with user ID
    console.log('\n3️⃣ Testing "tacos" search with user ID...');
    const tacosResults = await fetchRelevantRecipes('tacos', null, '4d163845-f7a3-4da5-8d03-50940f1ff4f6');
    console.log(`Found ${tacosResults.length} recipes with "tacos" in title:`);
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
    console.error('Error details:', error);
  }
}

debugSimilarityDirect(); 