const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔄 Refreshing Supabase schema cache...');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function refreshSchemaCache() {
  try {
    // Method 1: Try to refresh the schema cache by making a query
    console.log('\n1. Attempting to refresh schema cache...');
    
    // Make a simple query to trigger schema refresh
    const { data, error } = await supabase
      .from('recipes')
      .select('cookTime, calories, prepTime, servings, difficulty, category, tags, youtube_url')
      .limit(1);
    
    if (error) {
      console.error('❌ Schema cache refresh failed:', error);
      console.log('\nThe schema cache might need manual refresh.');
      console.log('Try these steps:');
      console.log('1. Go to your Supabase dashboard');
      console.log('2. Go to Settings > API');
      console.log('3. Click "Regenerate" next to your API keys');
      console.log('4. Or wait a few minutes for the cache to refresh automatically');
    } else {
      console.log('✅ Schema cache appears to be working');
      console.log('Available columns:', Object.keys(data[0] || {}));
    }
    
    // Method 2: Test inserting a recipe with the new columns
    console.log('\n2. Testing recipe insertion with new columns...');
    const testRecipe = {
      title: 'Schema Test Recipe',
      description: 'Testing new columns',
      ingredients: ['test ingredient'],
      instructions: 'Test instructions',
      user_id: 'test-user-id',
      cookTime: 30,
      calories: 250,
      prepTime: 15,
      servings: 4,
      difficulty: 'Easy',
      category: 'Test',
      tags: 'test',
      youtube_url: null
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('recipes')
      .insert([testRecipe])
      .select();
    
    if (insertError) {
      console.error('❌ Insert test failed:', insertError);
      console.log('\nThe schema cache definitely needs to be refreshed.');
      console.log('Please try the manual refresh steps above.');
    } else {
      console.log('✅ Insert test successful!');
      console.log('New recipe created:', insertData[0]);
      
      // Clean up
      const { error: deleteError } = await supabase
        .from('recipes')
        .delete()
        .eq('title', 'Schema Test Recipe');
      
      if (deleteError) {
        console.log('⚠️  Could not clean up test recipe:', deleteError);
      } else {
        console.log('✅ Test recipe cleaned up');
      }
    }
    
  } catch (error) {
    console.error('❌ Refresh failed:', error);
  }
}

refreshSchemaCache(); 