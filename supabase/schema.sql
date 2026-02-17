-- Kanban board schema with Row Level Security
-- Run this in the Supabase SQL editor after creating your project

CREATE TABLE boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE columns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID REFERENCES boards(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  position INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  column_id UUID REFERENCES columns(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  position INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: admin-only access
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin only" ON boards FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admin only" ON columns FOR ALL USING (
  board_id IN (SELECT id FROM boards WHERE user_id = auth.uid())
);

CREATE POLICY "Admin only" ON cards FOR ALL USING (
  column_id IN (SELECT id FROM columns WHERE board_id IN (SELECT id FROM boards WHERE user_id = auth.uid()))
);

-- Seed default board (replace YOUR_USER_ID after creating admin user)
-- INSERT INTO boards (name, user_id) VALUES ('Personal', 'YOUR_USER_ID');
-- Then insert default columns:
-- INSERT INTO columns (board_id, title, position) VALUES ('<board_id>', 'To Do', 0);
-- INSERT INTO columns (board_id, title, position) VALUES ('<board_id>', 'In Progress', 1);
-- INSERT INTO columns (board_id, title, position) VALUES ('<board_id>', 'Done', 2);
