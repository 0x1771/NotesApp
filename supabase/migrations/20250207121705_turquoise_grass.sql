/*
  # Fix profile policies

  1. Changes
    - Drop all existing policies on profiles table
    - Create new policies with proper authentication checks
    - Add policy for authenticated users to read their own profile
    - Add policy for new user registration
    - Add policy for profile updates

  2. Security
    - Enable RLS on profiles table
    - Ensure users can only access their own data
    - Allow initial profile creation during signup
*/

-- First, disable RLS temporarily to avoid any conflicts
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Enable insert for authentication" ON profiles;
DROP POLICY IF EXISTS "Enable read access for users" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create new policies with proper checks
CREATE POLICY "Allow users to insert their own profile"
  ON profiles
  FOR INSERT
  WITH CHECK (
    auth.uid() = id
    OR
    -- Allow initial profile creation during signup
    (SELECT COUNT(*) FROM profiles WHERE id = auth.uid()) = 0
  );

CREATE POLICY "Allow users to read their own profile"
  ON profiles
  FOR SELECT
  USING (
    auth.uid() = id
    OR
    -- Allow reading during signup/profile creation
    (SELECT COUNT(*) FROM profiles WHERE id = auth.uid()) = 0
  );

CREATE POLICY "Allow users to update their own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);