const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function setupRegressionTables() {
  console.log('🚀 Setting up Regression Recommendation System Tables...\n');

  try {
    // 1. USER INTERACTIONS TABLE
    console.log('📊 Creating user_interactions table...');
    const { error: interactionsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS user_interactions (
          id SERIAL PRIMARY KEY,
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
          spoonacular_id INTEGER,
          interaction_type TEXT NOT NULL,
          interaction_value NUMERIC NOT NULL,
          recipe_features JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (interactionsError) {
      console.error('❌ Error creating user_interactions table:', interactionsError);
      return false;
    }
    console.log('✅ user_interactions table created successfully');

    // 2. USER FEATURE WEIGHTS TABLE
    console.log('⚖️ Creating user_feature_weights table...');
    const { error: weightsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS user_feature_weights (
          id SERIAL PRIMARY KEY,
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          interaction_type TEXT NOT NULL,
          feature_name TEXT NOT NULL,
          weight NUMERIC NOT NULL DEFAULT 0,
          last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, interaction_type, feature_name)
        );
      `
    });

    if (weightsError) {
      console.error('❌ Error creating user_feature_weights table:', weightsError);
      return false;
    }
    console.log('✅ user_feature_weights table created successfully');

    // 3. RECIPE FEATURE CACHE TABLE
    console.log('🍳 Creating recipe_features table...');
    const { error: featuresError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS recipe_features (
          id SERIAL PRIMARY KEY,
          recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
          spoonacular_id INTEGER,
          feature_vector JSONB NOT NULL,
          popularity_score NUMERIC DEFAULT 0,
          relevance_score NUMERIC DEFAULT 0,
          last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(recipe_id),
          UNIQUE(spoonacular_id)
        );
      `
    });

    if (featuresError) {
      console.error('❌ Error creating recipe_features table:', featuresError);
      return false;
    }
    console.log('✅ recipe_features table created successfully');

    // 4. REGRESSION MODEL METRICS TABLE
    console.log('📈 Creating regression_metrics table...');
    const { error: metricsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS regression_metrics (
          id SERIAL PRIMARY KEY,
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          model_version TEXT NOT NULL,
          interaction_type TEXT NOT NULL,
          mse NUMERIC,
          r_squared NUMERIC,
          feature_importance JSONB,
          training_samples INTEGER,
          last_trained TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (metricsError) {
      console.error('❌ Error creating regression_metrics table:', metricsError);
      return false;
    }
    console.log('✅ regression_metrics table created successfully');

    // 5. Create indexes for better performance
    console.log('🔍 Creating indexes...');
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id ON user_interactions(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_user_interactions_type ON user_interactions(interaction_type);',
      'CREATE INDEX IF NOT EXISTS idx_user_interactions_created_at ON user_interactions(created_at);',
      'CREATE INDEX IF NOT EXISTS idx_user_feature_weights_user_id ON user_feature_weights(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_user_feature_weights_type ON user_feature_weights(interaction_type);',
      'CREATE INDEX IF NOT EXISTS idx_recipe_features_recipe_id ON recipe_features(recipe_id);',
      'CREATE INDEX IF NOT EXISTS idx_recipe_features_spoonacular_id ON recipe_features(spoonacular_id);',
      'CREATE INDEX IF NOT EXISTS idx_regression_metrics_user_id ON regression_metrics(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_regression_metrics_type ON regression_metrics(interaction_type);'
    ];

    for (const indexSql of indexes) {
      const { error: indexError } = await supabase.rpc('exec_sql', { sql: indexSql });
      if (indexError) {
        console.error('❌ Error creating index:', indexError);
        return false;
      }
    }
    console.log('✅ Indexes created successfully');

    // 6. Insert default feature weights for new users
    console.log('🎯 Setting up default feature weights...');
    const defaultFeatures = [
      'relevance', 'cuisine_type', 'popularity', 'season',
      'calories', 'protein', 'fat', 'carbohydrates', 'fiber', 'sugar', 'sodium',
      'difficulty', 'cook_time', 'prep_time'
    ];

    const interactionTypes = ['view', 'like', 'save'];
    const defaultWeights = {
      'view': {
        'relevance': 0.3, 'cuisine_type': 0.2, 'popularity': 0.2, 'season': 0.1,
        'calories': 0.05, 'protein': 0.05, 'fat': 0.05, 'carbohydrates': 0.05
      },
      'like': {
        'relevance': 0.4, 'cuisine_type': 0.25, 'popularity': 0.15, 'season': 0.1,
        'calories': 0.03, 'protein': 0.03, 'fat': 0.02, 'carbohydrates': 0.02
      },
      'save': {
        'relevance': 0.35, 'cuisine_type': 0.2, 'popularity': 0.15, 'season': 0.1,
        'calories': 0.05, 'protein': 0.05, 'fat': 0.05, 'carbohydrates': 0.05
      }
    };

    // Note: These will be inserted when users first interact with the system
    console.log('✅ Default feature weights configured (focus on like and save)');

    // 7. Verify table creation
    console.log('🔍 Verifying table creation...');
    const tables = ['user_interactions', 'user_feature_weights', 'recipe_features', 'regression_metrics'];
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.error(`❌ Error verifying ${table} table:`, error);
        return false;
      }
      console.log(`✅ ${table} table verified`);
    }

    console.log('\n🎉 Regression Recommendation System setup completed successfully!');
    console.log('\n📋 Summary of created tables:');
    console.log('- user_interactions: Tracks user interactions with recipes');
    console.log('- user_feature_weights: Stores personalized feature weights per user');
    console.log('- recipe_features: Caches pre-computed recipe feature vectors');
    console.log('- regression_metrics: Stores model performance metrics');
    
    console.log('\n🚀 The system is ready to use!');
    console.log('Users will automatically get personalized weights as they interact with recipes.');
    
    return true;

  } catch (error) {
    console.error('❌ Setup failed:', error);
    return false;
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  setupRegressionTables()
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

module.exports = { setupRegressionTables }; 