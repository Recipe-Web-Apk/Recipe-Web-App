const axiosInstance = require('../axiosInstance');
require('dotenv').config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY

console.log('Testing simple Supabase Auth signup...')

const supabase = createClient(supabaseUrl, supabaseKey)

async function testSimpleAuth() {
  try {
    const testEmail = `simple${Date.now()}@test.com`
    const testPassword = 'TestPassword123!'
    
    console.log(`Testing with email: ${testEmail}`)
    
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword
    })
    
    if (error) {
      console.error('❌ Simple auth failed:', error.message)
      console.error('Error details:', JSON.stringify(error, null, 2))
    } else {
      console.log('✅ Simple auth successful!')
      console.log('User ID:', data.user?.id)
      console.log('Email:', data.user?.email)
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testSimpleAuth() 