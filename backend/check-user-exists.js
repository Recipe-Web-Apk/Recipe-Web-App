const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUserExists() {
  console.log('🔍 Checking if user exists...');
  
  // Replace these with the actual email and username you're trying to login with
  const testEmail = 'test@example.com'; // CHANGE THIS TO YOUR ACTUAL EMAIL
  const testUsername = 'testuser'; // CHANGE THIS TO YOUR ACTUAL USERNAME
  
  console.log(`Looking for user with email: ${testEmail}`);
  console.log(`Looking for user with username: ${testUsername}`);
  
  try {
    // Check if user exists in auth.users (Supabase Auth)
    console.log('\n1. Checking auth.users table...');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.log('❌ Cannot access auth.users:', authError.message);
    } else {
      const user = authUsers.users.find(u => u.email === testEmail);
      if (user) {
        console.log('✅ User found in auth.users');
        console.log('User ID:', user.id);
        console.log('Email confirmed:', user.email_confirmed_at ? 'Yes' : 'No');
        console.log('Created at:', user.created_at);
      } else {
        console.log('❌ User NOT found in auth.users');
      }
    }
    
    // Check if user exists in our users table
    console.log('\n2. Checking users table...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .eq('email', testEmail);
    
    if (usersError) {
      console.log('❌ Error accessing users table:', usersError.message);
    } else {
      if (users && users.length > 0) {
        console.log('✅ User found in users table');
        console.log('User data:', users[0]);
      } else {
        console.log('❌ User NOT found in users table');
      }
    }
    
    // Check by username
    console.log('\n3. Checking by username...');
    const { data: usersByUsername, error: usernameError } = await supabase
      .from('users')
      .select('*')
      .eq('username', testUsername);
    
    if (usernameError) {
      console.log('❌ Error checking by username:', usernameError.message);
    } else {
      if (usersByUsername && usersByUsername.length > 0) {
        console.log('✅ User found by username');
        console.log('User data:', usersByUsername[0]);
      } else {
        console.log('❌ User NOT found by username');
      }
    }
    
    // List all users in our table
    console.log('\n4. All users in our table:');
    const { data: allUsers, error: allUsersError } = await supabase
      .from('users')
      .select('*');
    
    if (allUsersError) {
      console.log('❌ Error listing users:', allUsersError.message);
    } else {
      if (allUsers && allUsers.length > 0) {
        console.log(`Found ${allUsers.length} users:`);
        allUsers.forEach(user => {
          console.log(`- ${user.username} (${user.email})`);
        });
      } else {
        console.log('No users found in the table');
      }
    }
    
  } catch (error) {
    console.error('❌ Check failed:', error);
  }
}

checkUserExists(); 