const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY

console.log('Checking auth.users table structure...')

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkAuthTable() {
  try {
    // Check if we can access auth.users
    console.log('\n1. Testing auth.users access...')
    const { data: authUsers, error: authError } = await supabase
      .from('auth.users')
      .select('*')
      .limit(1)
    
    if (authError) {
      console.error('❌ Cannot access auth.users:', authError)
    } else {
      console.log('✅ Can access auth.users')
      console.log('Sample auth user:', authUsers)
    }

    // Check your public.users table
    console.log('\n2. Testing public.users access...')
    const { data: publicUsers, error: publicError } = await supabase
      .from('users')
      .select('*')
      .limit(1)
    
    if (publicError) {
      console.error('❌ Cannot access public.users:', publicError)
    } else {
      console.log('✅ Can access public.users')
      console.log('Sample public user:', publicUsers)
    }

    // Check if the email already exists in auth.users
    console.log('\n3. Checking if email exists in auth.users...')
    const testEmail = 'sagyire83@gmail.com'
    const { data: existingUser, error: checkError } = await supabase
      .from('auth.users')
      .select('email')
      .eq('email', testEmail)
      .single()
    
    if (checkError && checkError.code === 'PGRST116') {
      console.log('✅ Email does not exist in auth.users')
    } else if (checkError) {
      console.error('❌ Error checking email:', checkError)
    } else {
      console.log('❌ Email already exists in auth.users:', existingUser)
    }

  } catch (error) {
    console.error('❌ Check failed:', error)
  }
}

checkAuthTable() 