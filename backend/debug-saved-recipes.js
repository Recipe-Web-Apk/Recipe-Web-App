const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugSavedRecipes() {
  console.log('🔍 Debugging saved_recipes table...');
  
  try {
    // Get all saved recipes
    const { data: allRecipes, error: allError } = await supabase
      .from('saved_recipes')
      .select('*');
    
    if (allError) {
      console.error('❌ Error fetching all recipes:', allError);
      return;
    }
    
    console.log(`📊 Total saved recipes in database: ${allRecipes?.length || 0}`);
    
    if (allRecipes && allRecipes.length > 0) {
      console.log('\n📋 All saved recipes:');
      allRecipes.forEach((recipe, index) => {
        console.log(`\n${index + 1}. Recipe ID: ${recipe.id}`);
        console.log(`   User ID: ${recipe.user_id}`);
        console.log(`   Spoonacular ID: ${recipe.spoonacular_id}`);
        console.log(`   Recipe ID: ${recipe.recipe_id}`);
        console.log(`   Has recipe_data: ${!!recipe.recipe_data}`);
        console.log(`   Created at: ${recipe.created_at}`);
        if (recipe.recipe_data) {
          console.log(`   Recipe title: ${recipe.recipe_data.title}`);
        }
      });
      
      // Group by user ID
      const userGroups = {};
      allRecipes.forEach(recipe => {
        if (!userGroups[recipe.user_id]) {
          userGroups[recipe.user_id] = [];
        }
        userGroups[recipe.user_id].push(recipe);
      });
      
      console.log('\n👥 Recipes grouped by user:');
      Object.entries(userGroups).forEach(([userId, recipes]) => {
        console.log(`\nUser ${userId}: ${recipes.length} recipes`);
        recipes.forEach(recipe => {
          console.log(`  - ${recipe.recipe_data?.title || 'No title'} (ID: ${recipe.id})`);
        });
      });
    } else {
      console.log('❌ No saved recipes found in database');
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

debugSavedRecipes(); 