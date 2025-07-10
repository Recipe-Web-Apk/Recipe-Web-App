const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;

console.log('🔍 Testing frontend access to saved recipes...');
console.log('SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
console.log('SUPABASE_ANON_KEY:', anonKey ? '✅ Set' : '❌ Missing');

if (!supabaseUrl || !anonKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, anonKey);

async function testFrontendAccess() {
  try {
    // First, let's save a test recipe using service role (backend)
    console.log('\n1. Saving test recipe using service role...');
    const serviceSupabase = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY);
    
    // Get a user
    const { data: users } = await serviceSupabase.from('users').select('*').limit(1);
    if (!users || users.length === 0) {
      console.log('❌ No users found');
      return;
    }
    
    const testUser = users[0];
    const testRecipe = {
      id: 888888,
      title: 'Frontend Test Recipe',
      image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=300&fit=crop',
      readyInMinutes: 25,
      servings: 2,
      calories: 280
    };
    
    // Save recipe
    const { data: savedRecipe, error: saveError } = await serviceSupabase
      .from('saved_recipes')
      .insert([{
        user_id: testUser.id,
        spoonacular_id: testRecipe.id,
        recipe_data: testRecipe
      }])
      .select();
    
    if (saveError) {
      console.error('❌ Error saving test recipe:', saveError);
      return;
    }
    
    console.log('✅ Test recipe saved');
    
    // Now test if frontend (anon key) can read it
    console.log('\n2. Testing frontend access to saved recipes...');
    
    // Test without authentication (should fail)
    console.log('\n   Testing without authentication...');
    const { data: noAuthData, error: noAuthError } = await supabase
      .from('saved_recipes')
      .select('recipe_data')
      .eq('user_id', testUser.id);
    
    if (noAuthError) {
      console.log('   ❌ No auth access blocked (expected):', noAuthError.message);
    } else {
      console.log('   ⚠️  No auth access allowed (unexpected)');
    }
    
    // Test with authentication (simulate frontend with user session)
    console.log('\n   Testing with authentication...');
    
    // Create a session for the test user
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.createSession({
      user_id: testUser.id,
      access_token: 'test-token',
      refresh_token: 'test-refresh'
    });
    
    if (sessionError) {
      console.log('   ⚠️  Could not create test session:', sessionError.message);
      console.log('   Testing with direct user_id query...');
      
      // Try direct query with user_id
      const { data: directData, error: directError } = await supabase
        .from('saved_recipes')
        .select('recipe_data')
        .eq('user_id', testUser.id);
      
      if (directError) {
        console.log('   ❌ Direct query failed:', directError.message);
      } else {
        console.log(`   ✅ Direct query found ${directData?.length || 0} recipes`);
        if (directData && directData.length > 0) {
          console.log('   Sample recipe:', directData[0].recipe_data.title);
        }
      }
    } else {
      console.log('   ✅ Test session created');
      
      // Test with session
      const { data: authData, error: authError } = await supabase
        .from('saved_recipes')
        .select('recipe_data')
        .eq('user_id', testUser.id);
      
      if (authError) {
        console.log('   ❌ Auth access failed:', authError.message);
      } else {
        console.log(`   ✅ Auth access found ${authData?.length || 0} recipes`);
        if (authData && authData.length > 0) {
          console.log('   Sample recipe:', authData[0].recipe_data.title);
        }
      }
    }
    
    // Clean up
    console.log('\n3. Cleaning up test recipe...');
    const { error: cleanupError } = await serviceSupabase
      .from('saved_recipes')
      .delete()
      .eq('spoonacular_id', testRecipe.id);
    
    if (cleanupError) {
      console.log('⚠️  Could not clean up:', cleanupError);
    } else {
      console.log('✅ Test recipe cleaned up');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testFrontendAccess(); 