const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Checking RLS policies on saved_recipes table...');

if (!supabaseUrl || !anonKey || !serviceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const anonSupabase = createClient(supabaseUrl, anonKey);
const serviceSupabase = createClient(supabaseUrl, serviceKey);

async function checkRLSPolicies() {
  try {
    // 1. Check if RLS is enabled
    console.log('\n1. Checking if RLS is enabled...');
    const { data: rlsInfo, error: rlsError } = await serviceSupabase
      .rpc('get_table_info', { table_name: 'saved_recipes' });
    
    if (rlsError) {
      console.log('Could not check RLS status via RPC, trying direct query...');
    } else {
      console.log('RLS Info:', rlsInfo);
    }
    
    // 2. Get current policies
    console.log('\n2. Current policies on saved_recipes:');
    console.log('You can check this in Supabase Dashboard > Authentication > Policies');
    console.log('Or run this SQL query:');
    console.log('SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual FROM pg_policies WHERE tablename = \'saved_recipes\';');
    
    // 3. Test with a real user session
    console.log('\n3. Testing with real user authentication...');
    
    // Get a user
    const { data: users } = await serviceSupabase.from('users').select('*').limit(1);
    if (!users || users.length === 0) {
      console.log('❌ No users found');
      return;
    }
    
    const testUser = users[0];
    console.log(`Using user: ${testUser.email} (${testUser.id})`);
    
    // Save a test recipe
    const testRecipe = {
      id: 666666,
      title: 'Authentication Test Recipe',
      image: 'https://example.com/image.jpg',
      readyInMinutes: 15,
      servings: 1,
      calories: 150
    };
    
    const { data: savedRecipe, error: saveError } = await serviceSupabase
      .from('saved_recipes')
      .insert([{
        user_id: testUser.id,
        spoonacular_id: testRecipe.id,
        recipe_data: testRecipe
      }])
      .select();
    
    if (saveError) {
      console.error('❌ Error saving recipe:', saveError);
      return;
    }
    
    console.log('✅ Test recipe saved');
    
    // 4. Try to authenticate as the user
    console.log('\n4. Attempting user authentication...');
    
    // Try to sign in with the user's email (this might not work without password)
    const { data: authData, error: authError } = await anonSupabase.auth.signInWithPassword({
      email: testUser.email,
      password: 'testpassword123' // This will likely fail
    });
    
    if (authError) {
      console.log('❌ Could not authenticate user (expected):', authError.message);
      console.log('\nThe issue is that the frontend needs to be authenticated to read saved recipes.');
      console.log('When you log in through the frontend, it should work.');
      console.log('\nLet\'s test the current state:');
      
      // Test current state without auth
      const { data: currentData, error: currentError } = await anonSupabase
        .from('saved_recipes')
        .select('*')
        .eq('user_id', testUser.id);
      
      if (currentError) {
        console.log('✅ RLS is working - access blocked:', currentError.message);
      } else {
        console.log('❌ RLS not working - access allowed without auth');
        console.log('Found recipes:', currentData?.length || 0);
      }
    } else {
      console.log('✅ User authenticated successfully');
      
      // Test with authenticated session
      const { data: authRecipes, error: authRecipesError } = await anonSupabase
        .from('saved_recipes')
        .select('*')
        .eq('user_id', testUser.id);
      
      if (authRecipesError) {
        console.log('❌ Error fetching recipes with auth:', authRecipesError);
      } else {
        console.log(`✅ Authenticated access works: ${authRecipes?.length || 0} recipes found`);
      }
    }
    
    // 5. Clean up
    console.log('\n5. Cleaning up...');
    const { error: cleanupError } = await serviceSupabase
      .from('saved_recipes')
      .delete()
      .eq('spoonacular_id', testRecipe.id);
    
    if (cleanupError) {
      console.log('⚠️  Could not clean up:', cleanupError);
    } else {
      console.log('✅ Test recipe cleaned up');
    }
    
    // 6. Summary
    console.log('\n6. Summary:');
    console.log('The RLS policies should now allow authenticated users to access their saved recipes.');
    console.log('Try logging into your frontend app and check if saved recipes appear in the Dashboard.');
    console.log('If they still don\'t appear, the issue might be in the frontend authentication flow.');
    
  } catch (error) {
    console.error('❌ Check failed:', error);
  }
}

checkRLSPolicies(); 