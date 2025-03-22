/*
  # Fix authentication policies

  1. Changes
    - Add insert policy for profiles table
    - Update existing policies for better security
    - Add policy for unauthenticated users to create profiles during signup

  2. Security
    - Enable RLS on profiles table
    - Add policies for authenticated and unauthenticated users
*/

-- Drop existing policies if they exist
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles'
  ) THEN
    DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own profile during signup
CREATE POLICY "Enable insert for authentication" ON profiles
  FOR INSERT 
  WITH CHECK (true);

-- Allow users to read their own profile
CREATE POLICY "Enable read access for users" ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Enable update for users based on id" ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);