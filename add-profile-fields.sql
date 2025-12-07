-- Add profile photo and phone fields to existing users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS profile_picture TEXT;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';