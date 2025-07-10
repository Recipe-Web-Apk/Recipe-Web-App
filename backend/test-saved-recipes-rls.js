const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Testing saved_recipes RLS policies...');

if (!supabaseUrl || !anonKey || !serviceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const anonSupabase = createClient(supabaseUrl, anonKey);
const serviceSupabase = createClient(supabaseUrl, serviceKey);

async function testRLS() {
  try {
    // 1. Get a user using service role
    console.log('\n1. Getting test user...');
    const { data: users } = await serviceSupabase.from('users').select('*').limit(1);
    if (!users || users.length === 0) {
      console.log('❌ No users found');
      return;
    }
    
    const testUser = users[0];
    console.log(`Using user: ${testUser.email} (${testUser.id})`);
    
    // 2. Save a test recipe using service role
    console.log('\n2. Saving test recipe...');
    const testRecipe = {
      id: 777777,
      title: 'RLS Test Recipe',
      image: 'https://example.com/image.jpg',
      readyInMinutes: 20,
      servings: 1,
      calories: 200
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
    
    // 3. Test anon key access (should fail)
    console.log('\n3. Testing anon key access (should fail)...');
    const { data: anonData, error: anonError } = await anonSupabase
      .from('saved_recipes')
      .select('*')
      .eq('user_id', testUser.id);
    
    if (anonError) {
      console.log('✅ Anon access correctly blocked:', anonError.message);
    } else {
      console.log('❌ Anon access allowed (unexpected)');
      console.log('Found recipes:', anonData?.length || 0);
    }
    
    // 4. Test service role access (should work)
    console.log('\n4. Testing service role access (should work)...');
    const { data: serviceData, error: serviceError } = await serviceSupabase
      .from('saved_recipes')
      .select('*')
      .eq('user_id', testUser.id);
    
    if (serviceError) {
      console.log('❌ Service role access failed:', serviceError);
    } else {
      console.log(`✅ Service role access works: ${serviceData?.length || 0} recipes found`);
    }
    
    // 5. Check current RLS policies
    console.log('\n5. Current RLS policies on saved_recipes:');
    console.log('You need to add this policy to allow authenticated users to read their own saved recipes:');
    console.log(`
-- Allow authenticated users to read their own saved recipes
CREATE POLICY "Users can read own saved recipes"
  ON saved_recipes
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow authenticated users to insert their own saved recipes  
CREATE POLICY "Users can insert own saved recipes"
  ON saved_recipes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to delete their own saved recipes
CREATE POLICY "Users can delete own saved recipes"
  ON saved_recipes
  FOR DELETE
  USING (auth.uid() = user_id);
    `);
    
    // 6. Clean up
    console.log('\n6. Cleaning up...');
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

testRLS(); 