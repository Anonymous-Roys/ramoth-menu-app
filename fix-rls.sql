-- Temporarily disable RLS to allow direct table access
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE menus DISABLE ROW LEVEL SECURITY;
ALTER TABLE selections DISABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Admins can manage users" ON users;
DROP POLICY IF EXISTS "Everyone can read menus" ON menus;
DROP POLICY IF EXISTS "Admins can manage menus" ON menus;
DROP POLICY IF EXISTS "Users can read selections" ON selections;
DROP POLICY IF EXISTS "Users can insert own selections" ON selections;