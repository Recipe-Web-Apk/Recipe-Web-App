-- Enable RLS on saved_recipes table
ALTER TABLE saved_recipes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read own saved recipes" ON saved_recipes;
DROP POLICY IF EXISTS "Users can insert own saved recipes" ON saved_recipes;
DROP POLICY IF EXISTS "Users can delete own saved recipes" ON saved_recipes;
DROP POLICY IF EXISTS "Allow service role to read all saved recipes" ON saved_recipes;

-- Allow service role to read all saved recipes (for backend operations)
CREATE POLICY "Allow service role to read all saved recipes"
  ON saved_recipes
  FOR SELECT
  TO service_role
  USING (true);

-- Allow service role to insert saved recipes (for backend operations)
CREATE POLICY "Allow service role to insert saved recipes"
  ON saved_recipes
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Allow service role to delete saved recipes (for backend operations)
CREATE POLICY "Allow service role to delete saved recipes"
  ON saved_recipes
  FOR DELETE
  TO service_role
  USING (true);

-- Allow authenticated users to read their own saved recipes
CREATE POLICY "Users can read own saved recipes"
  ON saved_recipes
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow authenticated users to insert their own saved recipes  
CREATE POLICY "Users can insert own saved recipes"
  ON saved_recipes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to delete their own saved recipes
CREATE POLICY "Users can delete own saved recipes"
  ON saved_recipes
  FOR DELETE
  USING (auth.uid() = user_id);

-- Verify policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'saved_recipes'
ORDER BY policyname; 