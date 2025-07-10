const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role key for admin operations

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Make sure you have SUPABASE_SERVICE_ROLE_KEY in your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixUserTable() {
  console.log('🔍 Checking user tables...');
  
  try {
    // Check auth.users table
    console.log('\n1. Checking auth.users table...');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error accessing auth.users:', authError);
      return;
    }
    
    console.log(`Found ${authUsers.users.length} users in auth.users`);
    authUsers.users.forEach(user => {
      console.log(`- ${user.email} (${user.id}) - Created: ${user.created_at}`);
    });
    
    // Check custom users table
    console.log('\n2. Checking custom users table...');
    const { data: customUsers, error: customError } = await supabase
      .from('users')
      .select('*');
    
    if (customError) {
      console.error('❌ Error accessing users table:', customError);
      return;
    }
    
    console.log(`Found ${customUsers?.length || 0} users in custom users table`);
    if (customUsers && customUsers.length > 0) {
      customUsers.forEach(user => {
        console.log(`- ${user.email} (${user.id}) - Username: ${user.username}`);
      });
    }
    
    // Find users that exist in auth.users but not in custom users table
    console.log('\n3. Finding missing users...');
    const authUserIds = authUsers.users.map(u => u.id);
    const customUserIds = customUsers?.map(u => u.id) || [];
    const missingUserIds = authUserIds.filter(id => !customUserIds.includes(id));
    
    if (missingUserIds.length === 0) {
      console.log('✅ All auth users exist in custom users table');
      return;
    }
    
    console.log(`Found ${missingUserIds.length} users missing from custom table:`);
    missingUserIds.forEach(id => {
      const authUser = authUsers.users.find(u => u.id === id);
      console.log(`- ${authUser.email} (${id})`);
    });
    
    // Add missing users to custom table
    console.log('\n4. Adding missing users to custom table...');
    for (const userId of missingUserIds) {
      const authUser = authUsers.users.find(u => u.id === userId);
      
      const { data: insertData, error: insertError } = await supabase
        .from('users')
        .insert([{
          id: authUser.id,
          email: authUser.email,
          username: authUser.email.split('@')[0], // Use email prefix as username
          created_at: authUser.created_at,
          updated_at: authUser.updated_at
        }])
        .select();
      
      if (insertError) {
        console.error(`❌ Error adding user ${authUser.email}:`, insertError);
      } else {
        console.log(`✅ Added user ${authUser.email} to custom table`);
      }
    }
    
    // Verify the fix
    console.log('\n5. Verifying fix...');
    const { data: finalUsers, error: finalError } = await supabase
      .from('users')
      .select('*');
    
    if (finalError) {
      console.error('❌ Error verifying:', finalError);
    } else {
      console.log(`✅ Custom users table now has ${finalUsers?.length || 0} users`);
      if (finalUsers && finalUsers.length > 0) {
        finalUsers.forEach(user => {
          console.log(`- ${user.email} (${user.id}) - Username: ${user.username}`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Script failed:', error);
  }
}

fixUserTable(); 