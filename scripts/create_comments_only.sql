-- Quick fix: Create comments table only
-- Run this in Supabase SQL Editor if full migration hasn't been run

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artwork_id uuid REFERENCES artworks(id) ON DELETE CASCADE,
  user_wallet text NOT NULL,
  text text NOT NULL,
  created_at timestamptz DEFAULT now(),
  parent_id uuid REFERENCES comments(id) ON DELETE CASCADE,
  edited_at timestamptz
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_comments_artwork ON comments(artwork_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON comments(user_wallet);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_id);

-- RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public read access to comments" ON comments;
DROP POLICY IF EXISTS "Public insert access to comments" ON comments;
DROP POLICY IF EXISTS "Service role full access comments" ON comments;

-- Public read access
CREATE POLICY "Public read access to comments" ON comments
  FOR SELECT
  USING (true);

-- Allow anyone to insert comments (for MVP)
CREATE POLICY "Public insert access to comments" ON comments
  FOR INSERT
  WITH CHECK (true);

-- Allow service role full access
CREATE POLICY "Service role full access comments" ON comments
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

