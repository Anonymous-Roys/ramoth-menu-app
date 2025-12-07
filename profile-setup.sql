-- Add profile fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS email VARCHAR(255),
ADD COLUMN IF NOT EXISTS profilePicture TEXT;

-- Update RLS policies to allow users to update their own profile
CREATE POLICY "Users can update own profile" ON users
FOR UPDATE USING (auth.uid()::text = id OR auth.uid()::text = generated_id);

-- Allow users to read their own profile
CREATE POLICY "Users can read own profile" ON users
FOR SELECT USING (auth.uid()::text = id OR auth.uid()::text = generated_id);