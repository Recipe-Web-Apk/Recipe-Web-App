const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Checking recipes table structure...');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRecipesTable() {
  try {
    // Try to get table info
    console.log('\n1. Checking recipes table columns...');
    
    // Try a simple select to see what columns exist
    const { data: sampleData, error: selectError } = await supabase
      .from('recipes')
      .select('*')
      .limit(1);
    
    if (selectError) {
      console.error('❌ Error accessing recipes table:', selectError);
      return;
    }
    
    console.log('✅ recipes table is accessible');
    
    if (sampleData && sampleData.length > 0) {
      console.log('Sample recipe columns:', Object.keys(sampleData[0]));
    } else {
      console.log('No recipes in table, checking schema...');
    }
    
    // Try to insert a test recipe to see what columns are expected
    console.log('\n2. Testing recipe insertion...');
    const testRecipe = {
      title: 'Test Recipe',
      description: 'Test description',
      ingredients: ['ingredient 1', 'ingredient 2'],
      instructions: 'Test instructions',
      user_id: 'test-user-id',
      prepTime: 15,
      servings: 4,
      calories: 300,
      difficulty: 'Easy',
      category: 'Main Course',
      tags: 'test, recipe'
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('recipes')
      .insert([testRecipe])
      .select();
    
    if (insertError) {
      console.error('❌ Error inserting test recipe:', insertError);
      console.log('This shows what columns are missing or incorrect');
    } else {
      console.log('✅ Test recipe inserted successfully');
      console.log('Inserted recipe:', insertData[0]);
      
      // Clean up
      const { error: deleteError } = await supabase
        .from('recipes')
        .delete()
        .eq('title', 'Test Recipe');
      
      if (deleteError) {
        console.log('⚠️  Could not clean up test recipe:', deleteError);
      } else {
        console.log('✅ Test recipe cleaned up');
      }
    }
    
  } catch (error) {
    console.error('❌ Check failed:', error);
  }
}

checkRecipesTable(); 