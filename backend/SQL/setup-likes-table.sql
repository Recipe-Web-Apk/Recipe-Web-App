CREATE TABLE IF NOT EXISTS likes (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  recipe_id INTEGER REFERENCES recipes(id) ON DELETE CASCADE,
  liked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, recipe_id)
);

ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own likes" ON likes;
DROP POLICY IF EXISTS "Users can like recipes" ON likes;
DROP POLICY IF EXISTS "Users can unlike recipes" ON likes;
DROP POLICY IF EXISTS "Allow service role to manage likes" ON likes;

CREATE POLICY "Allow service role to manage likes"
  ON likes
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view their own likes"
  ON likes
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can like recipes"
  ON likes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike recipes"
  ON likes
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_recipe_id ON likes(recipe_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_recipe ON likes(user_id, recipe_id);

-- Table to track recipe views
CREATE TABLE IF NOT EXISTS views (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  recipe_id INTEGER,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'likes' 
ORDER BY ordinal_position;

SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'likes'
ORDER BY policyname; 