const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function setupSimilarityTables() {
  console.log('🚀 Setting up Dynamic Similarity Scoring System Tables...\n');

  try {
    // 1. SIMILARITY INTERACTIONS TABLE
    console.log('📊 Creating similarity_interactions table...');
    const { error: interactionsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS similarity_interactions (
          id SERIAL PRIMARY KEY,
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          new_recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
          existing_recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
          similarity_level TEXT NOT NULL,
          similarity_value NUMERIC NOT NULL,
          similarity_features JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (interactionsError) {
      console.error('❌ Error creating similarity_interactions table:', interactionsError);
      return false;
    }
    console.log('✅ similarity_interactions table created successfully');

    // 2. SIMILARITY FEATURE WEIGHTS TABLE
    console.log('⚖️ Creating similarity_feature_weights table...');
    const { error: weightsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS similarity_feature_weights (
          id SERIAL PRIMARY KEY,
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          feature_name TEXT NOT NULL,
          weight NUMERIC NOT NULL DEFAULT 0,
          last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, feature_name)
        );
      `
    });

    if (weightsError) {
      console.error('❌ Error creating similarity_feature_weights table:', weightsError);
      return false;
    }
    console.log('✅ similarity_feature_weights table created successfully');

    // 3. SIMILARITY METRICS TABLE
    console.log('📈 Creating similarity_metrics table...');
    const { error: metricsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS similarity_metrics (
          id SERIAL PRIMARY KEY,
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          mse NUMERIC,
          r_squared NUMERIC,
          feature_importance JSONB,
          training_samples INTEGER,
          last_trained TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (metricsError) {
      console.error('❌ Error creating similarity_metrics table:', metricsError);
      return false;
    }
    console.log('✅ similarity_metrics table created successfully');

    // 4. CREATE INDEXES FOR PERFORMANCE
    console.log('🔍 Creating indexes...');
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_similarity_interactions_user_id ON similarity_interactions(user_id);
        CREATE INDEX IF NOT EXISTS idx_similarity_interactions_created_at ON similarity_interactions(created_at);
        CREATE INDEX IF NOT EXISTS idx_similarity_weights_user_id ON similarity_feature_weights(user_id);
        CREATE INDEX IF NOT EXISTS idx_similarity_metrics_user_id ON similarity_metrics(user_id);
      `
    });

    if (indexError) {
      console.error('❌ Error creating indexes:', indexError);
      return false;
    }
    console.log('✅ Indexes created successfully');

    // 5. SET UP ROW LEVEL SECURITY (RLS)
    console.log('🔒 Setting up Row Level Security...');
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Enable RLS on all tables
        ALTER TABLE similarity_interactions ENABLE ROW LEVEL SECURITY;
        ALTER TABLE similarity_feature_weights ENABLE ROW LEVEL SECURITY;
        ALTER TABLE similarity_metrics ENABLE ROW LEVEL SECURITY;

        -- RLS Policies for similarity_interactions
        DROP POLICY IF EXISTS "Users can view their own similarity interactions" ON similarity_interactions;
        CREATE POLICY "Users can view their own similarity interactions" ON similarity_interactions
          FOR SELECT USING (auth.uid() = user_id);

        DROP POLICY IF EXISTS "Users can insert their own similarity interactions" ON similarity_interactions;
        CREATE POLICY "Users can insert their own similarity interactions" ON similarity_interactions
          FOR INSERT WITH CHECK (auth.uid() = user_id);

        -- RLS Policies for similarity_feature_weights
        DROP POLICY IF EXISTS "Users can view their own similarity weights" ON similarity_feature_weights;
        CREATE POLICY "Users can view their own similarity weights" ON similarity_feature_weights
          FOR SELECT USING (auth.uid() = user_id);

        DROP POLICY IF EXISTS "Users can update their own similarity weights" ON similarity_feature_weights;
        CREATE POLICY "Users can update their own similarity weights" ON similarity_feature_weights
          FOR UPDATE USING (auth.uid() = user_id);

        DROP POLICY IF EXISTS "Users can insert their own similarity weights" ON similarity_feature_weights;
        CREATE POLICY "Users can insert their own similarity weights" ON similarity_feature_weights
          FOR INSERT WITH CHECK (auth.uid() = user_id);

        -- RLS Policies for similarity_metrics
        DROP POLICY IF EXISTS "Users can view their own similarity metrics" ON similarity_metrics;
        CREATE POLICY "Users can view their own similarity metrics" ON similarity_metrics
          FOR SELECT USING (auth.uid() = user_id);

        DROP POLICY IF EXISTS "Users can update their own similarity metrics" ON similarity_metrics;
        CREATE POLICY "Users can update their own similarity metrics" ON similarity_metrics
          FOR UPDATE USING (auth.uid() = user_id);

        DROP POLICY IF EXISTS "Users can insert their own similarity metrics" ON similarity_metrics;
        CREATE POLICY "Users can insert their own similarity metrics" ON similarity_metrics
          FOR INSERT WITH CHECK (auth.uid() = user_id);
      `
    });

    if (rlsError) {
      console.error('❌ Error setting up RLS:', rlsError);
      return false;
    }
    console.log('✅ Row Level Security configured successfully');

    console.log('\n🎉 Dynamic Similarity Scoring System setup completed successfully!');
    console.log('\n📋 Tables created:');
    console.log('  - similarity_interactions: Tracks user similarity judgments');
    console.log('  - similarity_feature_weights: Stores personalized feature weights');
    console.log('  - similarity_metrics: Stores model performance metrics');
    console.log('\n🔧 Features:');
    console.log('  - 6 similarity dimensions (title, ingredients, cuisine, time, difficulty, dietary)');
    console.log('  - Dynamic weight learning via linear regression');
    console.log('  - User-specific similarity scoring');
    console.log('  - Performance monitoring and metrics');
    console.log('  - Row Level Security for data privacy');

    return true;

  } catch (error) {
    console.error('❌ Setup failed:', error);
    return false;
  }
}

// Run setup if called directly
if (require.main === module) {
  setupSimilarityTables()
    .then(success => {
      if (success) {
        console.log('\n✅ Setup completed successfully!');
        process.exit(0);
      } else {
        console.log('\n❌ Setup failed!');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('❌ Setup error:', error);
      process.exit(1);
    });
}

module.exports = { setupSimilarityTables }; 