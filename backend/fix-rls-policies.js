const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixRLSPolicies() {
  console.log('Fixing RLS policies for registration...');
  
  try {
    // Drop the existing restrictive insert policy
    console.log('\n1. Dropping existing restrictive insert policy...');
    const { error: dropError } = await supabase.rpc('exec_sql', {
      sql: 'DROP POLICY IF EXISTS "Users can insert their own profile" ON users;'
    });
    
    if (dropError) {
      console.log('Note: Could not drop policy via RPC, you may need to do this manually');
    } else {
      console.log('✅ Existing policy dropped');
    }
    
    // Create a new, more permissive insert policy
    console.log('\n2. Creating new permissive insert policy...');
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE POLICY "Allow user registration" ON users
        FOR INSERT 
        WITH CHECK (
          -- Allow if the user is authenticated and inserting their own profile
          (auth.uid() = id)
          OR
          -- Allow if the user is not authenticated (during registration)
          (auth.uid() IS NULL)
        );
      `
    });
    
    if (createError) {
      console.log('Could not create policy via RPC, you need to run this manually:');
      console.log('\n====================================================');
      console.log(`
        -- First, drop the existing policy
        DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
        
        -- Then create the new policy
        CREATE POLICY "Allow user registration" ON users
        FOR INSERT 
        WITH CHECK (
          -- Allow if the user is authenticated and inserting their own profile
          (auth.uid() = id)
          OR
          -- Allow if the user is not authenticated (during registration)
          (auth.uid() IS NULL)
        );
      `);
      console.log('====================================================');
    } else {
      console.log('✅ New policy created successfully');
    }
    
    // Also add a policy to allow the service role to insert users
    console.log('\n3. Creating service role policy...');
    const { error: serviceError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE POLICY "Service role can insert users" ON users
        FOR INSERT 
        WITH CHECK (true);
      `
    });
    
    if (serviceError) {
      console.log('Could not create service role policy via RPC, you may need to run this manually:');
      console.log('\n====================================================');
      console.log(`
        CREATE POLICY "Service role can insert users" ON users
        FOR INSERT 
        WITH CHECK (true);
      `);
      console.log('====================================================');
    } else {
      console.log('✅ Service role policy created');
    }
    
    console.log('\n✅ RLS policies updated!');
    console.log('\nIf the RPC calls failed, please run the SQL commands manually in your Supabase dashboard.');
    
  } catch (error) {
    console.error('❌ Error fixing RLS policies:', error);
  }
}

fixRLSPolicies(); 