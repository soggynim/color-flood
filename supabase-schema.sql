-- supabase-schema.sql
-- Run this in your Supabase SQL Editor to set up the database

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  avatar      TEXT NOT NULL DEFAULT '🦁',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Progress table
CREATE TABLE IF NOT EXISTS progress (
  profile_id    TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  level_id      INTEGER NOT NULL,
  completed     BOOLEAN DEFAULT TRUE,
  moves_used    INTEGER,
  completed_at  TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (profile_id, level_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;

-- Allow public read/write (since this is a family game with no auth)
-- If you want to restrict access later, update these policies
CREATE POLICY "Public access profiles" ON profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access progress" ON progress FOR ALL USING (true) WITH CHECK (true);
