-- Add cooking style and cooking method columns to recipes table
-- These columns will help categorize recipes by cooking technique

-- Add cookingStyle column for general cooking style (e.g., 'quick', 'traditional', 'modern')
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS "cookingStyle" TEXT;

-- Add cookingMethod column for specific cooking techniques (e.g., 'baking', 'grilling', 'frying')
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS "cookingMethod" TEXT;

-- Add totalTime column to store the sum of prep and cook time
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS "totalTime" INTEGER;

-- Create an index on cookingStyle for better query performance
CREATE INDEX IF NOT EXISTS idx_recipes_cooking_style ON recipes("cookingStyle");

-- Create an index on cookingMethod for better query performance
CREATE INDEX IF NOT EXISTS idx_recipes_cooking_method ON recipes("cookingMethod");

-- Update existing recipes to calculate totalTime
UPDATE recipes 
SET "totalTime" = COALESCE("prepTime", 0) + COALESCE("cookTime", 0)
WHERE "totalTime" IS NULL;

-- Verify the table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'recipes' 
AND column_name IN ('cookingStyle', 'cookingMethod', 'totalTime', 'prepTime', 'cookTime')
ORDER BY ordinal_position; 