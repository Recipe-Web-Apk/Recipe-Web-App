const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY

console.log('Testing Supabase Auth...')
console.log('URL:', supabaseUrl)
console.log('Key present:', !!supabaseKey)

const supabase = createClient(supabaseUrl, supabaseKey)

async function testAuth() {
  try {
    // Test 1: Basic signup without metadata
    console.log('\n=== Test 1: Basic signup ===')
    const testEmail1 = `basic${Date.now()}@test.com`
    
    const { data: data1, error: error1 } = await supabase.auth.signUp({
      email: testEmail1,
      password: 'TestPassword123!'
    })
    
    if (error1) {
      console.error('❌ Basic signup failed:', error1.message)
    } else {
      console.log('✅ Basic signup successful:', data1.user?.id)
    }

    // Test 2: Signup with metadata
    console.log('\n=== Test 2: Signup with metadata ===')
    const testEmail2 = `meta${Date.now()}@test.com`
    
    const { data: data2, error: error2 } = await supabase.auth.signUp({
      email: testEmail2,
      password: 'TestPassword123!',
      options: {
        data: {
          username: 'testuser'
        }
      }
    })
    
    if (error2) {
      console.error('❌ Metadata signup failed:', error2.message)
      console.error('Error details:', JSON.stringify(error2, null, 2))
    } else {
      console.log('✅ Metadata signup successful:', data2.user?.id)
      console.log('Username in metadata:', data2.user?.user_metadata?.username)
    }

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testAuth() 