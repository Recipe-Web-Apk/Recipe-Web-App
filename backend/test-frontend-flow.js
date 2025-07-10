const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Testing frontend saved recipes flow...');

if (!supabaseUrl || !serviceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const serviceSupabase = createClient(supabaseUrl, serviceKey);

async function testFrontendFlow() {
  try {
    // 1. Get a user
    console.log('\n1. Getting test user...');
    const { data: users } = await serviceSupabase.from('users').select('*').limit(1);
    if (!users || users.length === 0) {
      console.log('❌ No users found');
      return;
    }
    
    const testUser = users[0];
    console.log(`Using user: ${testUser.email} (${testUser.id})`);
    
    // 2. Check if user has any existing saved recipes
    console.log('\n2. Checking existing saved recipes...');
    const { data: existingRecipes, error: existingError } = await serviceSupabase
      .from('saved_recipes')
      .select('*')
      .eq('user_id', testUser.id);
    
    if (existingError) {
      console.error('❌ Error checking existing recipes:', existingError);
      return;
    }
    
    console.log(`Found ${existingRecipes?.length || 0} existing saved recipes`);
    if (existingRecipes && existingRecipes.length > 0) {
      existingRecipes.forEach((recipe, index) => {
        console.log(`  ${index + 1}. ${recipe.recipe_data?.title || 'Unknown'} (ID: ${recipe.spoonacular_id || recipe.recipe_id})`);
      });
    }
    
    // 3. Save a new test recipe (simulating user saving from recipe detail page)
    console.log('\n3. Saving a new test recipe...');
    const newRecipe = {
      id: 555555,
      title: 'Frontend Test Recipe - Pasta Carbonara',
      image: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=300&fit=crop',
      readyInMinutes: 25,
      servings: 4,
      calories: 450,
      diets: ['vegetarian'],
      missedIngredientCount: 0,
      usedIngredientCount: 8
    };
    
    const { data: savedRecipe, error: saveError } = await serviceSupabase
      .from('saved_recipes')
      .insert([{
        user_id: testUser.id,
        spoonacular_id: newRecipe.id,
        recipe_data: newRecipe
      }])
      .select();
    
    if (saveError) {
      console.error('❌ Error saving recipe:', saveError);
      return;
    }
    
    console.log('✅ New recipe saved successfully');
    console.log('Saved recipe data:', savedRecipe[0]);
    
    // 4. Check if the recipe is now in the user's saved recipes
    console.log('\n4. Verifying recipe appears in user\'s saved recipes...');
    const { data: updatedRecipes, error: updatedError } = await serviceSupabase
      .from('saved_recipes')
      .select('*')
      .eq('user_id', testUser.id)
      .order('created_at', { ascending: false });
    
    if (updatedError) {
      console.error('❌ Error fetching updated recipes:', updatedError);
    } else {
      console.log(`✅ User now has ${updatedRecipes?.length || 0} saved recipes`);
      updatedRecipes.forEach((recipe, index) => {
        console.log(`  ${index + 1}. ${recipe.recipe_data?.title || 'Unknown'} (ID: ${recipe.spoonacular_id || recipe.recipe_id})`);
      });
    }
    
    // 5. Test the exact query that the Dashboard component uses
    console.log('\n5. Testing Dashboard component query...');
    const { data: dashboardRecipes, error: dashboardError } = await serviceSupabase
      .from('saved_recipes')
      .select('recipe_data')
      .eq('user_id', testUser.id)
      .order('created_at', { ascending: false });
    
    if (dashboardError) {
      console.error('❌ Dashboard query failed:', dashboardError);
    } else {
      console.log(`✅ Dashboard query found ${dashboardRecipes?.length || 0} recipes`);
      if (dashboardRecipes && dashboardRecipes.length > 0) {
        console.log('Sample recipe for dashboard:', {
          title: dashboardRecipes[0].recipe_data.title,
          id: dashboardRecipes[0].recipe_data.id,
          readyInMinutes: dashboardRecipes[0].recipe_data.readyInMinutes
        });
      }
    }
    
    // 6. Summary and next steps
    console.log('\n6. Summary:');
    if (dashboardRecipes && dashboardRecipes.length > 0) {
      console.log('✅ Backend is working correctly - recipes are being saved and retrieved');
      console.log('✅ The issue is likely in the frontend Dashboard component');
      console.log('\nNext steps:');
      console.log('1. Log into your frontend app');
      console.log('2. Go to the Dashboard page');
      console.log('3. Check if saved recipes appear');
      console.log('4. If they don\'t appear, check the browser console for errors');
    } else {
      console.log('❌ Backend issue - recipes are not being retrieved correctly');
    }
    
    // 7. Clean up the test recipe
    console.log('\n7. Cleaning up test recipe...');
    const { error: cleanupError } = await serviceSupabase
      .from('saved_recipes')
      .delete()
      .eq('spoonacular_id', newRecipe.id);
    
    if (cleanupError) {
      console.log('⚠️  Could not clean up test recipe:', cleanupError);
    } else {
      console.log('✅ Test recipe cleaned up');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testFrontendFlow(); 