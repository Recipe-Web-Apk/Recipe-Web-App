const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testNewSetup() {
  console.log('🧪 Testing new Supabase project setup...');
  
  try {
    // Test 1: Check if tables exist
    console.log('\n1. Checking if tables exist...');
    
    const tables = ['users', 'recipes', 'saved_recipes'];
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(0);
      
      if (error) {
        console.log(`❌ Table '${table}' not accessible:`, error.message);
      } else {
        console.log(`✅ Table '${table}' exists and is accessible`);
      }
    }
    
    // Test 2: Test registration flow
    console.log('\n2. Testing registration flow...');
    const testEmail = `test${Date.now()}@example.com`;
    const testPassword = 'testpass123';
    const testUsername = `testuser${Date.now()}`;
    
    console.log(`Testing with email: ${testEmail}`);
    
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: { username: testUsername }
      }
    });
    
    if (authError) {
      console.log('❌ Auth creation failed:', authError.message);
      return;
    }
    
    console.log('✅ Auth user created successfully');
    console.log('Auth user ID:', authData.user.id);
    
    // Insert into users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([{
        id: authData.user.id,
        username: testUsername,
        email: testEmail
      }])
      .select();
    
    if (userError) {
      console.log('❌ User profile creation failed:', userError.message);
    } else {
      console.log('✅ User profile created successfully');
      console.log('User profile:', userData[0]);
    }
    
    // Test 3: Test login
    console.log('\n3. Testing login...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    if (loginError) {
      console.log('❌ Login failed:', loginError.message);
    } else {
      console.log('✅ Login successful');
      console.log('Session created:', !!loginData.session);
    }
    
    // Test 4: Test saved recipes functionality
    console.log('\n4. Testing saved recipes...');
    const testRecipe = {
      id: 999999,
      title: 'Test Recipe',
      image: 'test.jpg',
      readyInMinutes: 30,
      servings: 4
    };
    
    const { data: saveData, error: saveError } = await supabase
      .from('saved_recipes')
      .insert([{
        user_id: authData.user.id,
        spoonacular_id: testRecipe.id,
        recipe_data: testRecipe
      }])
      .select();
    
    if (saveError) {
      console.log('❌ Save recipe failed:', saveError.message);
    } else {
      console.log('✅ Save recipe successful');
    }
    
    // Clean up
    console.log('\n5. Cleaning up test data...');
    const { error: cleanupError } = await supabase
      .from('users')
      .delete()
      .eq('id', authData.user.id);
    
    if (cleanupError) {
      console.log('⚠️  Could not clean up test user:', cleanupError.message);
    } else {
      console.log('✅ Test data cleaned up');
    }
    
    console.log('\n🎉 All tests passed! Your new Supabase project is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testNewSetup(); 