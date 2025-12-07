-- Complete database setup for Ramoth Menu App with Profile functionality

-- 1. Create users table (if not exists)
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  generated_id VARCHAR(50) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  name VARCHAR(200) GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
  department VARCHAR(100),
  role VARCHAR(20) CHECK (role IN ('admin', 'worker', 'distributor')) NOT NULL,
  unique_number INTEGER,
  phone VARCHAR(20),
  email VARCHAR(255),
  profilePicture TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create meals table (if not exists)
CREATE TABLE IF NOT EXISTS meals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create meal_selections table (if not exists)
CREATE TABLE IF NOT EXISTS meal_selections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id VARCHAR(50) REFERENCES users(generated_id),
  meal_id UUID REFERENCES meals(id),
  date DATE NOT NULL,
  time TIME NOT NULL,
  collected BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- 4. Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_selections ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for users
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can manage all users" ON users;

CREATE POLICY "Users can read own data" ON users
FOR SELECT USING (true); -- Allow all authenticated users to read user data

CREATE POLICY "Users can update own profile" ON users
FOR UPDATE USING (generated_id = current_setting('app.current_user_id', true));

CREATE POLICY "Admins can manage all users" ON users
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE generated_id = current_setting('app.current_user_id', true) 
    AND role = 'admin'
  )
);

-- 6. Create RLS policies for meals
DROP POLICY IF EXISTS "Anyone can read meals" ON meals;
DROP POLICY IF EXISTS "Admins can manage meals" ON meals;

CREATE POLICY "Anyone can read meals" ON meals
FOR SELECT USING (true);

CREATE POLICY "Admins can manage meals" ON meals
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE generated_id = current_setting('app.current_user_id', true) 
    AND role = 'admin'
  )
);

-- 7. Create RLS policies for meal_selections
DROP POLICY IF EXISTS "Users can read own selections" ON meal_selections;
DROP POLICY IF EXISTS "Users can manage own selections" ON meal_selections;
DROP POLICY IF EXISTS "Distributors can manage collections" ON meal_selections;

CREATE POLICY "Users can read own selections" ON meal_selections
FOR SELECT USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can manage own selections" ON meal_selections
FOR ALL USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Distributors can manage collections" ON meal_selections
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE generated_id = current_setting('app.current_user_id', true) 
    AND role IN ('distributor', 'admin')
  )
);

-- 8. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_generated_id ON users(generated_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_meals_date ON meals(date);
CREATE INDEX IF NOT EXISTS idx_meal_selections_user_date ON meal_selections(user_id, date);
CREATE INDEX IF NOT EXISTS idx_meal_selections_date ON meal_selections(date);

-- 9. Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 10. Create triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();