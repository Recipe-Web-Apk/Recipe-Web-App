const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTableStructure() {
  try {
    console.log('Checking users table structure...')
    
    // Try to get table info by attempting a select with limit 0
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(0)
    
    if (error) {
      console.error('Error accessing users table:', error)
      return
    }
    
    console.log('Users table exists and is accessible!')
    
    // Try to get one row to see the structure
    const { data: sampleData, error: sampleError } = await supabase
      .from('users')
      .select('*')
      .limit(1)
    
    if (sampleError) {
      console.error('Error getting sample data:', sampleError)
    } else if (sampleData && sampleData.length > 0) {
      console.log('\nSample user data structure:')
      console.log(JSON.stringify(sampleData[0], null, 2))
    } else {
      console.log('\nTable is empty, but accessible')
    }
    
    // Try to insert a test record to see what fields are required
    console.log('\nAttempting to insert a test record to check required fields...')
    const testRecord = {
      id: '00000000-0000-0000-0000-000000000000', // Test UUID
      username: 'test_user_' + Date.now(),
      email: 'test@example.com',
      created_at: new Date().toISOString()
    }
    
    const { error: insertError } = await supabase
      .from('users')
      .insert([testRecord])
    
    if (insertError) {
      console.log('\nInsert error (this helps us understand the table structure):')
      console.log(insertError)
    } else {
      console.log('\nTest insert successful!')
      // Clean up the test record
      await supabase
        .from('users')
        .delete()
        .eq('id', testRecord.id)
      console.log('Test record cleaned up')
    }
    
  } catch (error) {
    console.error('Error:', error)
  }
}

checkTableStructure() 