-- Add missing columns to recipes table
-- These columns are expected by the RecipeForm component

-- Add cookTime column
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS "cookTime" INTEGER;

-- Add calories column  
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS "calories" INTEGER;

-- Add prepTime column (if not exists)
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS "prepTime" INTEGER;

-- Add servings column (if not exists)
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS "servings" INTEGER;

-- Add difficulty column (if not exists)
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS "difficulty" TEXT;

-- Add category column (if not exists)
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS "category" TEXT;

-- Add tags column (if not exists)
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS "tags" TEXT;

-- Add youtube_url column (if not exists)
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS "youtube_url" TEXT;

-- Verify the table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'recipes' 
ORDER BY ordinal_position; 