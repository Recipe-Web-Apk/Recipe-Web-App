const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupLikesTable() {
  try {
    console.log('🔧 Setting up likes table...');
    
    const sqlCommands = [
      `CREATE TABLE IF NOT EXISTS likes (
        id SERIAL PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        recipe_id INTEGER REFERENCES recipes(id) ON DELETE CASCADE,
        liked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, recipe_id)
      );`,
      
      `ALTER TABLE likes ENABLE ROW LEVEL SECURITY;`,
      
      `DROP POLICY IF EXISTS "Users can view their own likes" ON likes;`,
      `DROP POLICY IF EXISTS "Users can like recipes" ON likes;`,
      `DROP POLICY IF EXISTS "Users can unlike recipes" ON likes;`,
      `DROP POLICY IF EXISTS "Allow service role to manage likes" ON likes;`,
      
      `CREATE POLICY "Allow service role to manage likes"
        ON likes
        FOR ALL
        TO service_role
        USING (true)
        WITH CHECK (true);`,
      
      `CREATE POLICY "Users can view their own likes"
        ON likes
        FOR SELECT
        USING (auth.uid() = user_id);`,
      
      `CREATE POLICY "Users can like recipes"
        ON likes
        FOR INSERT
        WITH CHECK (auth.uid() = user_id);`,
      
      `CREATE POLICY "Users can unlike recipes"
        ON likes
        FOR DELETE
        USING (auth.uid() = user_id);`,
      
      `CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);`,
      `CREATE INDEX IF NOT EXISTS idx_likes_recipe_id ON likes(recipe_id);`,
      `CREATE INDEX IF NOT EXISTS idx_likes_user_recipe ON likes(user_id, recipe_id);`
    ];
    
    console.log('\n📋 Please run these SQL commands in your Supabase dashboard:');
    console.log('====================================================');
    sqlCommands.forEach((sql, index) => {
      console.log(`-- Command ${index + 1}`);
      console.log(sql);
      console.log('');
    });
    console.log('====================================================');
    
    console.log('\n✅ After running these commands, the likes functionality will be ready!');
    console.log('\n🎯 Features that will be available:');
    console.log('- Like/unlike recipes');
    console.log('- View liked recipes in dashboard');
    console.log('- Like button on recipe cards');
    console.log('- Proper user authentication and authorization');
    
  } catch (error) {
    console.error('❌ Error setting up likes table:', error);
  }
}

setupLikesTable(); 