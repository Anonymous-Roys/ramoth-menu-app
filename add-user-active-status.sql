-- Add is_active column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Update existing users to be active by default
UPDATE users SET is_active = TRUE WHERE is_active IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN users.is_active IS 'Indicates if the user is active and can log in to the system';