-- Check if columns exist and add them
DO $$ 
BEGIN
    -- Add phone column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='phone') THEN
        ALTER TABLE users ADD COLUMN phone VARCHAR(20);
    END IF;
    
    -- Add profile_picture column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='profile_picture') THEN
        ALTER TABLE users ADD COLUMN profile_picture TEXT;
    END IF;
END $$;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';