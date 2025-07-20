const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function setupDatabase() {
  try {
    console.log('Setting up database tables...')
    
    // SQL commands to create the required tables
    const sqlCommands = [
      // Create users table
      `CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`,
      
      // Create recipes table if it doesn't exist
      `CREATE TABLE IF NOT EXISTS recipes (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        ingredients TEXT[],
        instructions TEXT,
        image TEXT,
        youtube_url TEXT,
        prep_time INTEGER,
        cook_time INTEGER,
        servings INTEGER,
        difficulty VARCHAR(50),
        cuisine VARCHAR(100),
        diet VARCHAR(100),
        tags TEXT[],
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`,
      
      // Create saved_recipes table for user's saved recipes
      `CREATE TABLE IF NOT EXISTS saved_recipes (
        id SERIAL PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        recipe_id INTEGER REFERENCES recipes(id) ON DELETE CASCADE,
        spoonacular_id INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, recipe_id),
        UNIQUE(user_id, spoonacular_id)
      );`,
      
      // Enable Row Level Security (RLS)
      `ALTER TABLE users ENABLE ROW LEVEL SECURITY;`,
      `ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;`,
      `ALTER TABLE saved_recipes ENABLE ROW LEVEL SECURITY;`,
      
      // Create RLS policies for users table
      `CREATE POLICY "Users can view their own profile" ON users
        FOR SELECT USING (auth.uid() = id);`,
      
      `CREATE POLICY "Users can update their own profile" ON users
        FOR UPDATE USING (auth.uid() = id);`,
      
      `CREATE POLICY "Users can insert their own profile" ON users
        FOR INSERT WITH CHECK (auth.uid() = id);`,
      
      // Create RLS policies for recipes table
      `CREATE POLICY "Users can view all recipes" ON recipes
        FOR SELECT USING (true);`,
      
      `CREATE POLICY "Users can create their own recipes" ON recipes
        FOR INSERT WITH CHECK (auth.uid() = user_id);`,
      
      `CREATE POLICY "Users can update their own recipes" ON recipes
        FOR UPDATE USING (auth.uid() = user_id);`,
      
      `CREATE POLICY "Users can delete their own recipes" ON recipes
        FOR DELETE USING (auth.uid() = user_id);`,
      
      // Create RLS policies for saved_recipes table
      `CREATE POLICY "Users can view their saved recipes" ON saved_recipes
        FOR SELECT USING (auth.uid() = user_id);`,
      
      `CREATE POLICY "Users can save recipes" ON saved_recipes
        FOR INSERT WITH CHECK (auth.uid() = user_id);`,
      
      `CREATE POLICY "Users can delete their saved recipes" ON saved_recipes
        FOR DELETE USING (auth.uid() = user_id);`
    ]
    
    console.log('\nPlease run these SQL commands in your Supabase dashboard:')
    console.log('====================================================')
    sqlCommands.forEach((sql, index) => {
      console.log(`-- Command ${index + 1}`)
      console.log(sql)
      console.log('')
    })
    console.log('====================================================')
    
    console.log('\nOr you can run them all at once:')
    console.log('====================================================')
    console.log(sqlCommands.join('\n'))
    console.log('====================================================')
    
    console.log('\nAfter running these commands, your database will be set up correctly!')
    
  } catch (error) {
    console.error('Error:', error)
  }
}

setupDatabase() 