const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY

console.log('Testing Supabase configuration...')
console.log('SUPABASE_URL:', supabaseUrl ? 'Present' : 'Missing')
console.log('SUPABASE_ANON_KEY:', supabaseKey ? 'Present' : 'Missing')

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testSupabase() {
  try {
    console.log('\n1. Testing basic connection...')
    
    // Test if we can access the users table
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('❌ Database connection error:', error)
    } else {
      console.log('✅ Database connection successful')
    }

    console.log('\n2. Testing auth signup with test email...')
    
    const testEmail = `test${Date.now()}@example.com`
    const testPassword = 'TestPassword123!'
    
    console.log(`Using test email: ${testEmail}`)
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          username: 'testuser'
        }
      }
    })

    if (authError) {
      console.error('❌ Auth signup error:', authError)
      console.error('Error details:', JSON.stringify(authError, null, 2))
    } else {
      console.log('✅ Auth signup successful!')
      console.log('User created:', authData.user?.id)
      
      // Clean up - delete the test user
      console.log('\n3. Cleaning up test user...')
      const { error: deleteError } = await supabase.auth.admin.deleteUser(authData.user.id)
      if (deleteError) {
        console.log('Note: Could not delete test user (this is normal for anon key)')
      } else {
        console.log('✅ Test user cleaned up')
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testSupabase() 