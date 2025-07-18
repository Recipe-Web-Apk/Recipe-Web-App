const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const axiosInstance = require('../axiosInstance');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const TEST_EMAIL = 'vincentburner01@gmail.com';
const TEST_PASSWORD = '999999';

async function testLogin() {
  console.log('🔍 Testing login functionality...');
  
  try {
    // Test 1: Check if we can connect to Supabase
    console.log('\n1. Testing Supabase connection...');
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Connection failed:', error.message);
      return;
    }
    
    console.log('✅ Connection successful');
    
    // Test 2: Try to create a test user
    console.log('\n2. Creating test user...');
    const testEmail = `testlogin${Date.now()}@example.com`;
    const testPassword = 'testpass123';
    const testUsername = `testloginuser${Date.now()}`;
    
    console.log(`Email: ${testEmail}`);
    console.log(`Username: ${testUsername}`);
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: { username: testUsername }
      }
    });
    
    if (authError) {
      console.log('❌ User creation failed:', authError.message);
      return;
    }
    
    console.log('✅ Test user created in auth');
    console.log('User ID:', authData.user.id);
    
    // Test 3: Create user profile
    console.log('\n3. Creating user profile...');
    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .insert([{
        id: authData.user.id,
        username: testUsername,
        email: testEmail
      }])
      .select();
    
    if (profileError) {
      console.log('❌ Profile creation failed:', profileError.message);
      return;
    }
    
    console.log('✅ User profile created');
    
    // Test 4: Try to login with the test user
    console.log('\n4. Testing login...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    if (loginError) {
      console.log('❌ Login failed:', loginError.message);
    } else {
      console.log('✅ Login successful');
      console.log('Session created:', !!loginData.session);
      console.log('User ID:', loginData.user.id);
    }
    
    // Test 5: Test the backend login endpoint
    console.log('\n5. Testing backend login endpoint...');
    
    const response = await axiosInstance.post('/auth/login', { email: testEmail, password: testPassword });
    
    const responseData = response.data;
    console.log('Backend response status:', response.status);
    console.log('Backend response data:', responseData);
    
    if (response.status === 200) {
      console.log('✅ Backend login successful');
    } else {
      console.log('❌ Backend login failed');
    }
    
    // Clean up
    console.log('\n6. Cleaning up test user...');
    const { error: cleanupError } = await supabase
      .from('users')
      .delete()
      .eq('id', authData.user.id);
    
    if (cleanupError) {
      console.log('⚠️  Could not clean up test user:', cleanupError.message);
    } else {
      console.log('✅ Test user cleaned up');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testLogin(); 