const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = 'https://asbuckytummmrnikguoi.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzYnVja3l0dW1tbXJuaWtndW9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzMDY0MTcsImV4cCI6MjA2Njg4MjQxN30.I56VHXTl5ze5e6fdMsEc-kba_yWr7tTZKdhp4xYfYzs'

const supabase = createClient(supabaseUrl, supabaseKey)

async function addRecipeDetailColumns() {
  try {
    console.log('Adding recipe detail columns to recipes table...')
    
    // List of columns to add
    const columns = [
      'ALTER TABLE recipes ADD COLUMN IF NOT EXISTS prepTime INTEGER;',
      'ALTER TABLE recipes ADD COLUMN IF NOT EXISTS cookTime INTEGER;',
      'ALTER TABLE recipes ADD COLUMN IF NOT EXISTS servings INTEGER;',
      'ALTER TABLE recipes ADD COLUMN IF NOT EXISTS calories INTEGER;',
      'ALTER TABLE recipes ADD COLUMN IF NOT EXISTS difficulty TEXT;',
      'ALTER TABLE recipes ADD COLUMN IF NOT EXISTS category TEXT;',
      'ALTER TABLE recipes ADD COLUMN IF NOT EXISTS tags TEXT;',
      'ALTER TABLE recipes ADD COLUMN IF NOT EXISTS cuisine TEXT;',
      'ALTER TABLE recipes ADD COLUMN IF NOT EXISTS diet TEXT;'
    ]
    
    console.log('\nPlease run these SQL commands in your Supabase dashboard:')
    console.log('====================================================')
    columns.forEach(sql => {
      console.log(sql)
    })
    console.log('====================================================')
    
    console.log('\nOr you can run them all at once:')
    console.log('====================================================')
    console.log(columns.join('\n'))
    console.log('====================================================')
    
  } catch (error) {
    console.error('Error:', error)
  }
}

addRecipeDetailColumns() 