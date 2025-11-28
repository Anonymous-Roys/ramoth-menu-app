-- Add collected column to selections table
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