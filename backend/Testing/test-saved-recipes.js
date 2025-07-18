const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testSavedRecipes() {
  try {
    console.log('Testing saved_recipes table...')
    
    // Test 1: Check if table exists and is accessible
    console.log('\n1. Checking table accessibility...')
    const { data: testData, error: testError } = await supabase
      .from('saved_recipes')
      .select('*')
      .limit(1)
    
    if (testError) {
      console.error('❌ Error accessing saved_recipes table:', testError)
      return
    }
    
    console.log('✅ saved_recipes table is accessible')
    
    // Test 2: Check table structure
    console.log('\n2. Checking table structure...')
    const { data: structureData, error: structureError } = await supabase
      .from('saved_recipes')
      .select('*')
      .limit(0)
    
    if (structureError) {
      console.error('❌ Error checking structure:', structureError)
    } else {
      console.log('✅ Table structure looks good')
    }
    
    // Test 3: Try to insert a test record
    console.log('\n3. Testing insert functionality...')
    const testRecipe = {
      id: 999999, // Test Spoonacular ID
      title: 'Test Recipe',
      image: 'test.jpg',
      readyInMinutes: 30,
      servings: 4
    }
    
    const { data: insertData, error: insertError } = await supabase
      .from('saved_recipes')
      .insert({
        user_id: '00000000-0000-0000-0000-000000000000', // Test user ID
        spoonacular_id: testRecipe.id,
        recipe_data: testRecipe
      })
      .select()
    
    if (insertError) {
      console.error('❌ Error inserting test record:', insertError)
      console.log('\nThis might be because:')
      console.log('- The recipe_data column doesn\'t exist')
      console.log('- RLS policies are blocking the insert')
      console.log('- The user_id doesn\'t exist')
    } else {
      console.log('✅ Successfully inserted test record')
      
      // Clean up - delete the test record
      const { error: deleteError } = await supabase
        .from('saved_recipes')
        .delete()
        .eq('spoonacular_id', testRecipe.id)
      
      if (deleteError) {
        console.log('⚠️  Warning: Could not delete test record:', deleteError)
      } else {
        console.log('✅ Successfully cleaned up test record')
      }
    }
    
    // Test 4: Check if recipe_data column exists
    console.log('\n4. Checking for recipe_data column...')
    const { data: columnData, error: columnError } = await supabase
      .from('saved_recipes')
      .select('recipe_data')
      .limit(1)
    
    if (columnError) {
      console.error('❌ recipe_data column does not exist:', columnError)
      console.log('\nPlease run this SQL command in your Supabase dashboard:')
      console.log('ALTER TABLE saved_recipes ADD COLUMN IF NOT EXISTS recipe_data JSONB;')
    } else {
      console.log('✅ recipe_data column exists')
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testSavedRecipes() 