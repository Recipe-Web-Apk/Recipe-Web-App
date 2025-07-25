const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDynamicSimilarityTables() {
  console.log('🔧 Setting up Dynamic Similarity Tables...\n');

  try {
    // 1. Create similarity_interactions table
    console.log('1️⃣ Creating similarity_interactions table...');
    const { error: interactionsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS similarity_interactions (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          recipe1_id TEXT NOT NULL,
          recipe2_id TEXT NOT NULL,
          features JSONB NOT NULL,
          target_value FLOAT NOT NULL,
          judgment TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (interactionsError) {
      console.error('❌ Error creating similarity_interactions table:', interactionsError);
    } else {
      console.log('✅ similarity_interactions table created');
    }

    // 2. Create similarity_feature_weights table
    console.log('\n2️⃣ Creating similarity_feature_weights table...');
    const { error: weightsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS similarity_feature_weights (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          feature_name TEXT NOT NULL,
          weight FLOAT NOT NULL DEFAULT 0.1,
          last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, feature_name)
        );
      `
    });

    if (weightsError) {
      console.error('❌ Error creating similarity_feature_weights table:', weightsError);
    } else {
      console.log('✅ similarity_feature_weights table created');
    }

    // 3. Create similarity_metrics table
    console.log('\n3️⃣ Creating similarity_metrics table...');
    const { error: metricsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS similarity_metrics (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          total_interactions INTEGER DEFAULT 0,
          average_target_value FLOAT DEFAULT 0,
          feature_usage JSONB DEFAULT '{}',
          recent_accuracy FLOAT DEFAULT 0,
          last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id)
        );
      `
    });

    if (metricsError) {
      console.error('❌ Error creating similarity_metrics table:', metricsError);
    } else {
      console.log('✅ similarity_metrics table created');
    }

    // 4. Create indexes for performance
    console.log('\n4️⃣ Creating indexes...');
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Index for similarity_interactions
        CREATE INDEX IF NOT EXISTS idx_similarity_interactions_user_id ON similarity_interactions(user_id);
        CREATE INDEX IF NOT EXISTS idx_similarity_interactions_created_at ON similarity_interactions(created_at);
        
        -- Index for similarity_feature_weights
        CREATE INDEX IF NOT EXISTS idx_similarity_feature_weights_user_id ON similarity_feature_weights(user_id);
        CREATE INDEX IF NOT EXISTS idx_similarity_feature_weights_feature ON similarity_feature_weights(feature_name);
        
        -- Index for similarity_metrics
        CREATE INDEX IF NOT EXISTS idx_similarity_metrics_user_id ON similarity_metrics(user_id);
      `
    });

    if (indexError) {
      console.error('❌ Error creating indexes:', indexError);
    } else {
      console.log('✅ Indexes created');
    }

    // 5. Set up Row Level Security (RLS)
    console.log('\n5️⃣ Setting up Row Level Security...');
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Enable RLS on all tables
        ALTER TABLE similarity_interactions ENABLE ROW LEVEL SECURITY;
        ALTER TABLE similarity_feature_weights ENABLE ROW LEVEL SECURITY;
        ALTER TABLE similarity_metrics ENABLE ROW LEVEL SECURITY;
        
        -- RLS policies for similarity_interactions
        DROP POLICY IF EXISTS "Users can view their own similarity interactions" ON similarity_interactions;
        CREATE POLICY "Users can view their own similarity interactions" ON similarity_interactions
          FOR SELECT USING (auth.uid() = user_id);
        
        DROP POLICY IF EXISTS "Users can insert their own similarity interactions" ON similarity_interactions;
        CREATE POLICY "Users can insert their own similarity interactions" ON similarity_interactions
          FOR INSERT WITH CHECK (auth.uid() = user_id);
        
        DROP POLICY IF EXISTS "Users can update their own similarity interactions" ON similarity_interactions;
        CREATE POLICY "Users can update their own similarity interactions" ON similarity_interactions
          FOR UPDATE USING (auth.uid() = user_id);
        
        -- RLS policies for similarity_feature_weights
        DROP POLICY IF EXISTS "Users can view their own similarity weights" ON similarity_feature_weights;
        CREATE POLICY "Users can view their own similarity weights" ON similarity_feature_weights
          FOR SELECT USING (auth.uid() = user_id);
        
        DROP POLICY IF EXISTS "Users can insert their own similarity weights" ON similarity_feature_weights;
        CREATE POLICY "Users can insert their own similarity weights" ON similarity_feature_weights
          FOR INSERT WITH CHECK (auth.uid() = user_id);
        
        DROP POLICY IF EXISTS "Users can update their own similarity weights" ON similarity_feature_weights;
        CREATE POLICY "Users can update their own similarity weights" ON similarity_feature_weights
          FOR UPDATE USING (auth.uid() = user_id);
        
        -- RLS policies for similarity_metrics
        DROP POLICY IF EXISTS "Users can view their own similarity metrics" ON similarity_metrics;
        CREATE POLICY "Users can view their own similarity metrics" ON similarity_metrics
          FOR SELECT USING (auth.uid() = user_id);
        
        DROP POLICY IF EXISTS "Users can insert their own similarity metrics" ON similarity_metrics;
        CREATE POLICY "Users can insert their own similarity metrics" ON similarity_metrics
          FOR INSERT WITH CHECK (auth.uid() = user_id);
        
        DROP POLICY IF EXISTS "Users can update their own similarity metrics" ON similarity_metrics;
        CREATE POLICY "Users can update their own similarity metrics" ON similarity_metrics
          FOR UPDATE USING (auth.uid() = user_id);
      `
    });

    if (rlsError) {
      console.error('❌ Error setting up RLS:', rlsError);
    } else {
      console.log('✅ Row Level Security configured');
    }

    // 6. Insert default feature weights for existing users
    console.log('\n6️⃣ Setting up default feature weights...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id');

    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
    } else if (users && users.length > 0) {
      const defaultFeatures = [
        'titleJaccardSimilarity',
        'titleLevenshteinSimilarity',
        'ingredientJaccardSimilarity',
        'cuisineMatch',
        'cookingTimeMatch',
        'difficultyMatch',
        'dietaryMatch',
        'cookingStyleMatch',
        'cookingMethodMatch',
        'seasonMatch'
      ];

      const defaultWeight = 1.0 / defaultFeatures.length;
      const weightInserts = [];

      users.forEach(user => {
        defaultFeatures.forEach(feature => {
          weightInserts.push({
            user_id: user.id,
            feature_name: feature,
            weight: defaultWeight
          });
        });
      });

      const { error: insertError } = await supabase
        .from('similarity_feature_weights')
        .upsert(weightInserts, { onConflict: 'user_id,feature_name' });

      if (insertError) {
        console.error('❌ Error inserting default weights:', insertError);
      } else {
        console.log(`✅ Default weights set for ${users.length} users`);
      }
    }

    console.log('\n🎉 Dynamic Similarity Tables Setup Complete!');
    console.log('\n📊 Tables created:');
    console.log('   • similarity_interactions - Stores user similarity judgments');
    console.log('   • similarity_feature_weights - Stores learned feature weights per user');
    console.log('   • similarity_metrics - Stores similarity model performance metrics');
    console.log('\n🔒 Security: Row Level Security enabled for all tables');
    console.log('⚡ Performance: Indexes created for optimal query performance');

  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

// Run the setup
setupDynamicSimilarityTables(); 