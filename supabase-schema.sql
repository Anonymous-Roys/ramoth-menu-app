-- Users table with generated ID system
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  generated_id TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  date_of_birth DATE,
  department TEXT NOT NULL,
  role TEXT CHECK (role IN ('worker', 'admin')) NOT NULL DEFAULT 'worker',
  unique_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Menus table
CREATE TABLE menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  meals JSONB NOT NULL,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Selections table
CREATE TABLE selections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  menu_id UUID REFERENCES menus(id),
  meal_id TEXT NOT NULL,
  meal_name TEXT NOT NULL,
  date DATE NOT NULL,
  location JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_generated_id ON users(generated_id);
CREATE INDEX idx_users_name_search ON users(first_name, last_name, unique_number);
CREATE INDEX idx_menus_date ON menus(date);
CREATE INDEX idx_selections_date ON selections(date);
CREATE INDEX idx_selections_user_id ON selections(user_id);

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE selections ENABLE ROW LEVEL SECURITY;

-- Users can read their own data, admins can read all
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid()::text = id::text OR 
    EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'));

-- Only admins can insert/update users
CREATE POLICY "Admins can manage users" ON users
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin')
  );

-- Everyone can read menus
CREATE POLICY "Everyone can read menus" ON menus FOR SELECT USING (true);

-- Only admins can manage menus
CREATE POLICY "Admins can manage menus" ON menus
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin')
  );

-- Users can read all selections, but only insert their own
CREATE POLICY "Users can read selections" ON selections FOR SELECT USING (true);

CREATE POLICY "Users can insert own selections" ON selections
  FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

-- Sample admin user (update with your details)
INSERT INTO users (generated_id, first_name, last_name, name, email, department, role, unique_number)
VALUES ('admin1000', 'Admin', 'User', 'Admin User', 'admin@company.com', 'IT', 'admin', 1000);