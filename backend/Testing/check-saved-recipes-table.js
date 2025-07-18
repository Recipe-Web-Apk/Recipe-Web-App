const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSavedRecipesTable() {
  console.log('🔍 Checking saved_recipes table structure...');
  
  try {
    // Test 1: Check if table exists and is accessible
    console.log('\n1. Checking table accessibility...');
    const { data: testData, error: testError } = await supabase
      .from('saved_recipes')
      .select('*')
      .limit(1);
    
    if (testError) {
      console.error('❌ Error accessing saved_recipes table:', testError);
      return;
    }
    
    console.log('✅ saved_recipes table is accessible');
    
    // Test 2: Check if recipe_data column exists
    console.log('\n2. Checking for recipe_data column...');
    const { data: columnData, error: columnError } = await supabase
      .from('saved_recipes')
      .select('recipe_data')
      .limit(1);
    
    if (columnError) {
      console.error('❌ recipe_data column does not exist:', columnError.message);
      console.log('\nYou need to add the recipe_data column. Run this SQL:');
      console.log('ALTER TABLE saved_recipes ADD COLUMN IF NOT EXISTS recipe_data JSONB;');
    } else {
      console.log('✅ recipe_data column exists');
    }
    
    // Test 3: Check if there are any saved recipes
    console.log('\n3. Checking for existing saved recipes...');
    const { data: savedRecipes, error: savedError } = await supabase
      .from('saved_recipes')
      .select('*');
    
    if (savedError) {
      console.error('❌ Error fetching saved recipes:', savedError);
    } else {
      console.log(`Found ${savedRecipes?.length || 0} saved recipes`);
      if (savedRecipes && savedRecipes.length > 0) {
        console.log('Sample saved recipe:', savedRecipes[0]);
      }
    }
    
    // Test 4: Test saving a recipe
    console.log('\n4. Testing recipe save functionality...');
    
    // First, get a user to test with
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (usersError || !users || users.length === 0) {
      console.log('❌ No users found to test with');
      return;
    }
    
    const testUser = users[0];
    console.log(`Testing with user: ${testUser.username} (${testUser.email})`);
    
    const testRecipe = {
      id: 999999,
      title: 'Test Recipe for Dashboard',
      image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=300&fit=crop',
      readyInMinutes: 30,
      servings: 4,
      calories: 350,
      diets: ['vegetarian'],
      missedIngredientCount: 0,
      usedIngredientCount: 5
    };
    
    // Try to save the recipe
    const { data: saveData, error: saveError } = await supabase
      .from('saved_recipes')
      .insert([{
        user_id: testUser.id,
        spoonacular_id: testRecipe.id,
        recipe_data: testRecipe
      }])
      .select();
    
    if (saveError) {
      console.error('❌ Error saving recipe:', saveError);
      console.log('This might be because:');
      console.log('- The recipe_data column doesn\'t exist');
      console.log('- RLS policies are blocking the insert');
      console.log('- The user_id doesn\'t exist');
    } else {
      console.log('✅ Recipe saved successfully');
      console.log('Saved recipe data:', saveData[0]);
      
      // Test 5: Test fetching saved recipes for the user
      console.log('\n5. Testing fetch saved recipes for user...');
      const { data: userSavedRecipes, error: fetchError } = await supabase
        .from('saved_recipes')
        .select('recipe_data')
        .eq('user_id', testUser.id);
      
      if (fetchError) {
        console.error('❌ Error fetching user saved recipes:', fetchError);
      } else {
        console.log(`✅ Found ${userSavedRecipes?.length || 0} saved recipes for user`);
        if (userSavedRecipes && userSavedRecipes.length > 0) {
          console.log('Sample recipe data:', userSavedRecipes[0].recipe_data);
        }
      }
      
      // Clean up - remove the test recipe
      console.log('\n6. Cleaning up test recipe...');
      const { error: cleanupError } = await supabase
        .from('saved_recipes')
        .delete()
        .eq('spoonacular_id', testRecipe.id);
      
      if (cleanupError) {
        console.log('⚠️  Could not clean up test recipe:', cleanupError);
      } else {
        console.log('✅ Test recipe cleaned up');
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

checkSavedRecipesTable(); 