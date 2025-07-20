const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Missing Supabase environment variables!');
  console.log('\nPlease create a .env file in the backend directory with:');
  console.log('====================================================');
  console.log(`
SUPABASE_URL=your_new_supabase_project_url_here
SUPABASE_ANON_KEY=your_new_supabase_anon_key_here
SPOONACULAR_API_KEY=your_spoonacular_api_key_here
PORT=5000
NODE_ENV=development
  `);
  console.log('====================================================');
  console.log('\nReplace the placeholder values with your actual Supabase credentials.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupNewProject() {
  console.log('🚀 Setting up new Supabase project...');
  console.log('Project URL:', supabaseUrl);
  
  try {
    // Test connection
    console.log('\n1. Testing Supabase connection...');
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(0);
    
    if (error) {
      console.log('❌ Connection failed:', error.message);
      console.log('\nThis might be because:');
      console.log('- The tables don\'t exist yet');
      console.log('- The credentials are incorrect');
      console.log('- The project is still initializing');
      return;
    }
    
    console.log('✅ Connection successful!');
    
    // Set up database schema
    console.log('\n2. Setting up database schema...');
    console.log('\nPlease run these SQL commands in your Supabase dashboard:');
    console.log('====================================================');
    
    const schemaSQL = `
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create recipes table
CREATE TABLE IF NOT EXISTS recipes (
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
);

-- Create saved_recipes table
CREATE TABLE IF NOT EXISTS saved_recipes (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  recipe_id INTEGER REFERENCES recipes(id) ON DELETE CASCADE,
  spoonacular_id INTEGER,
  recipe_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, recipe_id),
  UNIQUE(user_id, spoonacular_id)
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_recipes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Allow user registration" ON users
  FOR INSERT 
  WITH CHECK (
    (auth.uid() = id) OR (auth.uid() IS NULL)
  );

-- Create RLS policies for recipes table
CREATE POLICY "Users can view all recipes" ON recipes
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own recipes" ON recipes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recipes" ON recipes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recipes" ON recipes
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for saved_recipes table
CREATE POLICY "Users can view their saved recipes" ON saved_recipes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can save recipes" ON saved_recipes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their saved recipes" ON saved_recipes
  FOR DELETE USING (auth.uid() = user_id);
    `;
    
    console.log(schemaSQL);
    console.log('====================================================');
    
    console.log('\n3. After running the SQL commands, test the setup:');
    console.log('   npm run test-setup');
    
  } catch (error) {
    console.error('❌ Setup error:', error);
  }
}

setupNewProject(); 