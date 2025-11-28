-- Update the role constraint to include distributor
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('worker', 'admin', 'distributor'));

-- Add collected column to selections table if not exists
ALTER TABLE selections ADD COLUMN IF NOT EXISTS collected BOOLEAN DEFAULT FALSE;

-- Create food_status table for tracking when food is ready
CREATE TABLE IF NOT EXISTS food_status (
  id SERIAL PRIMARY KEY,
  date DATE UNIQUE NOT NULL,
  ready BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on food_status table
ALTER TABLE food_status ENABLE ROW LEVEL SECURITY;

-- Create policy for food_status table (drop first if exists)
DROP POLICY IF EXISTS "Allow all operations on food_status" ON food_status;
CREATE POLICY "Allow all operations on food_status" ON food_status FOR ALL USING (true);

-- Update RLS policies to handle distributors
DROP POLICY IF EXISTS "Users can read own data" ON users;
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid()::text = id::text OR 
    EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role IN ('admin', 'distributor')));

DROP POLICY IF EXISTS "Admins can manage users" ON users;
CREATE POLICY "Admins can manage users" ON users
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin')
  );