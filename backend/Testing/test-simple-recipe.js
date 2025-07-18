const axiosInstance = require('../axiosInstance');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🧪 Testing simple recipe creation...');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSimpleRecipe() {
  try {
    // Test with minimal data first
    console.log('\n1. Testing minimal recipe creation...');
    const minimalRecipe = {
      title: 'Simple Test Recipe',
      description: 'A simple test',
      ingredients: '{"ingredient 1", "ingredient 2"}',
      instructions: 'Simple instructions',
      user_id: 'test-user-id'
    };
    
    const { data: minimalData, error: minimalError } = await supabase
      .from('recipes')
      .insert([minimalRecipe])
      .select();
    
    if (minimalError) {
      console.error('❌ Minimal recipe failed:', minimalError);
      return;
    }
    
    console.log('✅ Minimal recipe created successfully');
    console.log('Recipe ID:', minimalData[0].id);
    
    // Test with optional columns
    console.log('\n2. Testing recipe with optional columns...');
    const fullRecipe = {
      title: 'Full Test Recipe',
      description: 'A full test with all columns',
      ingredients: '{"chicken", "rice", "vegetables"}',
      instructions: 'Cook everything together',
      user_id: 'test-user-id',
      cookTime: 30,
      calories: 350,
      prepTime: 15,
      servings: 4,
      difficulty: 'Easy',
      category: 'Main Course',
      tags: 'healthy, quick'
    };
    
    const { data: fullData, error: fullError } = await supabase
      .from('recipes')
      .insert([fullRecipe])
      .select();
    
    if (fullError) {
      console.error('❌ Full recipe failed:', fullError);
    } else {
      console.log('✅ Full recipe created successfully');
      console.log('Full recipe:', fullData[0]);
    }
    
    // Clean up
    console.log('\n3. Cleaning up test recipes...');
    const { error: deleteError } = await supabase
      .from('recipes')
      .delete()
      .in('title', ['Simple Test Recipe', 'Full Test Recipe']);
    
    if (deleteError) {
      console.log('⚠️  Could not clean up test recipes:', deleteError);
    } else {
      console.log('✅ Test recipes cleaned up');
    }
    
    console.log('\n🎉 Recipe creation test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testSimpleRecipe(); 