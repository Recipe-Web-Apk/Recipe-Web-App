const { createClient } = require('@supabase/supabase-js');

async function checkExistingUsers() {
  console.log('🧪 Checking Existing Users\n');
  
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.log('❌ Missing Supabase environment variables');
      console.log('Please check your .env file');
      return;
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Check users table
    console.log('1️⃣ Checking users table...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(10);
    
    if (usersError) {
      console.log('❌ Error fetching users:', usersError);
    } else {
      console.log(`✅ Found ${users.length} users:`);
      users.forEach(user => {
        console.log(`   - ID: ${user.id}`);
        console.log(`     Email: ${user.email}`);
        console.log(`     Username: ${user.username}`);
        console.log(`     Created: ${user.created_at}`);
        console.log('');
      });
    }
    
    // Check auth.users (Supabase auth)
    console.log('2️⃣ Checking auth.users...');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.log('❌ Error fetching auth users:', authError);
    } else {
      console.log(`✅ Found ${authUsers.users.length} auth users:`);
      authUsers.users.forEach(user => {
        console.log(`   - ID: ${user.id}`);
        console.log(`     Email: ${user.email}`);
        console.log(`     Confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'}`);
        console.log(`     Created: ${user.created_at}`);
        console.log('');
      });
    }
    
    // Check recipes table
    console.log('3️⃣ Checking recipes table...');
    const { data: recipes, error: recipesError } = await supabase
      .from('recipes')
      .select('*')
      .limit(5);
    
    if (recipesError) {
      console.log('❌ Error fetching recipes:', recipesError);
    } else {
      console.log(`✅ Found ${recipes.length} recipes:`);
      recipes.forEach(recipe => {
        console.log(`   - ID: ${recipe.id}`);
        console.log(`     Title: ${recipe.title}`);
        console.log(`     User ID: ${recipe.user_id}`);
        console.log(`     Created: ${recipe.created_at}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkExistingUsers(); 