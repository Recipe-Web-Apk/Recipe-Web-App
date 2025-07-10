const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUsersTable() {
  console.log('Testing users table...');
  
  try {
    // Test 1: Check if table exists and is accessible
    console.log('\n1. Checking table accessibility...');
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (testError) {
      console.error('❌ Error accessing users table:', testError);
      return;
    }
    
    console.log('✅ users table is accessible');
    
    // Test 2: Check table structure by trying to insert with minimal data
    console.log('\n2. Testing insert with minimal data...');
    const testUser = {
      id: '00000000-0000-0000-0000-000000000000', // Test UUID
      username: 'test_user_' + Date.now(),
      email: 'test@example.com'
    };
    
    console.log('Attempting to insert:', testUser);
    
    const { data: insertData, error: insertError } = await supabase
      .from('users')
      .insert([testUser])
      .select();
    
    if (insertError) {
      console.error('❌ Insert error:', insertError);
      console.error('Error details:', JSON.stringify(insertError, null, 2));
      
      // Check if it's a unique constraint violation
      if (insertError.code === '23505') {
        console.log('This is a unique constraint violation - the user might already exist');
      }
      
      // Check if it's a foreign key constraint violation
      if (insertError.code === '23503') {
        console.log('This is a foreign key constraint violation - the auth.users table might not have this ID');
      }
      
    } else {
      console.log('✅ Insert successful:', insertData);
      
      // Clean up
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', testUser.id);
      
      if (deleteError) {
        console.log('⚠️  Warning: Could not clean up test user:', deleteError);
      } else {
        console.log('✅ Test user cleaned up successfully');
      }
    }
    
    // Test 3: Check if we can create a real auth user first
    console.log('\n3. Testing auth user creation...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: 'testauth@example.com',
      password: 'testpass123',
      options: {
        data: { username: 'testauthuser' }
      }
    });
    
    if (authError) {
      console.error('❌ Auth creation error:', authError);
    } else {
      console.log('✅ Auth user created successfully');
      console.log('Auth user ID:', authData.user.id);
      
      // Now try to insert this real auth user ID into users table
      console.log('\n4. Testing insert with real auth user ID...');
      const realUser = {
        id: authData.user.id,
        username: 'testauthuser',
        email: 'testauth@example.com'
      };
      
      const { data: realInsertData, error: realInsertError } = await supabase
        .from('users')
        .insert([realUser])
        .select();
      
      if (realInsertError) {
        console.error('❌ Real insert error:', realInsertError);
        console.error('Error details:', JSON.stringify(realInsertError, null, 2));
      } else {
        console.log('✅ Real user insert successful:', realInsertData);
        
        // Clean up
        const { error: realDeleteError } = await supabase
          .from('users')
          .delete()
          .eq('id', authData.user.id);
        
        if (realDeleteError) {
          console.log('⚠️  Warning: Could not clean up real test user:', realDeleteError);
        } else {
          console.log('✅ Real test user cleaned up successfully');
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testUsersTable(); 