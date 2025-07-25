-- Dynamic Similarity Tables Setup
-- Run this in your Supabase SQL editor

-- 1. Create similarity_interactions table
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

-- 2. Create similarity_feature_weights table
CREATE TABLE IF NOT EXISTS similarity_feature_weights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_name TEXT NOT NULL,
  weight FLOAT NOT NULL DEFAULT 0.1,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, feature_name)
);

-- 3. Create similarity_metrics table
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

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_similarity_interactions_user_id ON similarity_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_similarity_interactions_created_at ON similarity_interactions(created_at);

CREATE INDEX IF NOT EXISTS idx_similarity_feature_weights_user_id ON similarity_feature_weights(user_id);
CREATE INDEX IF NOT EXISTS idx_similarity_feature_weights_feature ON similarity_feature_weights(feature_name);

CREATE INDEX IF NOT EXISTS idx_similarity_metrics_user_id ON similarity_metrics(user_id);

-- 5. Enable Row Level Security
ALTER TABLE similarity_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE similarity_feature_weights ENABLE ROW LEVEL SECURITY;
ALTER TABLE similarity_metrics ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies for similarity_interactions
DROP POLICY IF EXISTS "Users can view their own similarity interactions" ON similarity_interactions;
CREATE POLICY "Users can view their own similarity interactions" ON similarity_interactions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own similarity interactions" ON similarity_interactions;
CREATE POLICY "Users can insert their own similarity interactions" ON similarity_interactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own similarity interactions" ON similarity_interactions;
CREATE POLICY "Users can update their own similarity interactions" ON similarity_interactions
  FOR UPDATE USING (auth.uid() = user_id);

-- 7. Create RLS policies for similarity_feature_weights
DROP POLICY IF EXISTS "Users can view their own similarity weights" ON similarity_feature_weights;
CREATE POLICY "Users can view their own similarity weights" ON similarity_feature_weights
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own similarity weights" ON similarity_feature_weights;
CREATE POLICY "Users can insert their own similarity weights" ON similarity_feature_weights
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own similarity weights" ON similarity_feature_weights;
CREATE POLICY "Users can update their own similarity weights" ON similarity_feature_weights
  FOR UPDATE USING (auth.uid() = user_id);

-- 8. Create RLS policies for similarity_metrics
DROP POLICY IF EXISTS "Users can view their own similarity metrics" ON similarity_metrics;
CREATE POLICY "Users can view their own similarity metrics" ON similarity_metrics
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own similarity metrics" ON similarity_metrics;
CREATE POLICY "Users can insert their own similarity metrics" ON similarity_metrics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own similarity metrics" ON similarity_metrics;
CREATE POLICY "Users can update their own similarity metrics" ON similarity_metrics
  FOR UPDATE USING (auth.uid() = user_id);

-- 9. Insert default feature weights for existing users
INSERT INTO similarity_feature_weights (user_id, feature_name, weight)
SELECT 
  u.id,
  feature_name,
  0.1 as weight
FROM auth.users u
CROSS JOIN (
  VALUES 
    ('titleJaccardSimilarity'),
    ('titleLevenshteinSimilarity'),
    ('ingredientJaccardSimilarity'),
    ('cuisineMatch'),
    ('cookingTimeMatch'),
    ('difficultyMatch'),
    ('dietaryMatch'),
    ('cookingStyleMatch'),
    ('cookingMethodMatch'),
    ('seasonMatch')
) AS features(feature_name)
ON CONFLICT (user_id, feature_name) DO NOTHING; 