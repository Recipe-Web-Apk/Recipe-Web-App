const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = 'https://asbuckytummmrnikguoi.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzYnVja3l0dW1tbXJuaWtndW9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzMDY0MTcsImV4cCI6MjA2Njg4MjQxN30.I56VHXTl5ze5e6fdMsEc-kba_yWr7tTZKdhp4xYfYzs'

const supabase = createClient(supabaseUrl, supabaseKey)

async function addYouTubeColumn() {
  try {
    console.log('Adding youtube_url column to recipes table...')
    
    // Execute SQL to add the column
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE recipes ADD COLUMN IF NOT EXISTS youtube_url TEXT;'
    })
    
    if (error) {
      console.error('Error adding column:', error)
      console.log('\nPlease run this SQL manually in your Supabase dashboard:')
      console.log('ALTER TABLE recipes ADD COLUMN IF NOT EXISTS youtube_url TEXT;')
    } else {
      console.log('Successfully added youtube_url column to recipes table')
    }
  } catch (error) {
    console.error('Error:', error)
    console.log('\nPlease run this SQL manually in your Supabase dashboard:')
    console.log('ALTER TABLE recipes ADD COLUMN IF NOT EXISTS youtube_url TEXT;')
  }
}

addYouTubeColumn() 