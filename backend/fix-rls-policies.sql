-- Fix RLS policies for users table
-- Run this in your Supabase SQL editor

-- First, let's see what policies exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'users';

-- Drop existing policies if they're causing issues
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;

-- Create new policies that allow profile creation during registration
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Alternative: If you want to allow profile creation without RLS during registration
-- You can temporarily disable RLS for the users table:
-- ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Or create a more permissive policy for registration:
-- CREATE POLICY "Allow profile creation during registration" ON users
--     FOR INSERT WITH CHECK (true);

-- Check the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position; 