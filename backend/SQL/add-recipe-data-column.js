const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function addRecipeDataColumn() {
  try {
    console.log('Adding recipe_data column to saved_recipes table...')
    
    // SQL command to add the recipe_data column
    const sqlCommand = `
      ALTER TABLE saved_recipes 
      ADD COLUMN IF NOT EXISTS recipe_data JSONB;
    `
    
    console.log('\nPlease run this SQL command in your Supabase dashboard:')
    console.log('====================================================')
    console.log(sqlCommand)
    console.log('====================================================')
    
    console.log('\nThis will allow the saved_recipes table to store the full recipe data.')
    console.log('After running this command, saved recipes should appear in the dashboard!')
    
  } catch (error) {
    console.error('Error:', error)
  }
}

addRecipeDataColumn() 