const axiosInstance = require('../axiosInstance');
require('dotenv').config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY

console.log('Testing signup with existing email...')

const supabase = createClient(supabaseUrl, supabaseKey)

async function testSignup() {
  try {
    const testEmail = 'sagyire83@gmail.com'
    const testPassword = 'TestPassword123!'
    const testUsername = 'testuser'
    
    console.log(`Attempting to sign up with: ${testEmail}`)
    
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: { username: testUsername }
      }
    })
    
    if (error) {
      console.error('❌ Signup error:', error.message)
      console.error('Error details:', JSON.stringify(error, null, 2))
      
      // Check if it's a duplicate email error
      if (error.message.includes('already registered') || 
          error.message.includes('already exists') ||
          error.message.includes('duplicate')) {
        console.log('✅ This confirms the email already exists in auth.users')
      }
    } else {
      console.log('✅ Signup successful!')
      console.log('User created:', data.user?.id)
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testSignup() 