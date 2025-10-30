-- Aetheria Enhancements Migration
-- Run this after init_supabase.sql

-- Tags table
CREATE TABLE IF NOT EXISTS tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Artwork-Tags junction table
CREATE TABLE IF NOT EXISTS artwork_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artwork_id uuid REFERENCES artworks(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES tags(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE (artwork_id, tag_id)
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artwork_id uuid REFERENCES artworks(id) ON DELETE CASCADE,
  user_wallet text NOT NULL,
  text text NOT NULL,
  created_at timestamptz DEFAULT now(),
  parent_id uuid REFERENCES comments(id) ON DELETE CASCADE, -- For replies
  edited_at timestamptz
);

-- Prompt hashes table (for verification)
CREATE TABLE IF NOT EXISTS prompt_hashes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_hash text UNIQUE NOT NULL,
  artwork_id uuid REFERENCES artworks(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Add prompt and ai_model columns to artworks (if not already present)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='artworks' AND column_name='prompt') THEN
    ALTER TABLE artworks ADD COLUMN prompt text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='artworks' AND column_name='ai_model') THEN
    ALTER TABLE artworks ADD COLUMN ai_model text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='artworks' AND column_name='featured') THEN
    ALTER TABLE artworks ADD COLUMN featured boolean DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='artworks' AND column_name='hidden') THEN
    ALTER TABLE artworks ADD COLUMN hidden boolean DEFAULT false;
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_artwork_tags_artwork ON artwork_tags(artwork_id);
CREATE INDEX IF NOT EXISTS idx_artwork_tags_tag ON artwork_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_comments_artwork ON comments(artwork_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON comments(user_wallet);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_prompt_hashes_hash ON prompt_hashes(prompt_hash);
CREATE INDEX IF NOT EXISTS idx_artworks_featured ON artworks(featured);
CREATE INDEX IF NOT EXISTS idx_artworks_hidden ON artworks(hidden);

-- RLS Policies
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE artwork_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_hashes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to allow re-running migration)
DROP POLICY IF EXISTS "Public read access to tags" ON tags;
DROP POLICY IF EXISTS "Public read access to artwork_tags" ON artwork_tags;
DROP POLICY IF EXISTS "Public read access to comments" ON comments;
DROP POLICY IF EXISTS "Public insert access to comments" ON comments;
DROP POLICY IF EXISTS "Public read access to prompt_hashes" ON prompt_hashes;

DROP POLICY IF EXISTS "Service role full access tags" ON tags;
DROP POLICY IF EXISTS "Service role full access artwork_tags" ON artwork_tags;
DROP POLICY IF EXISTS "Service role full access comments" ON comments;
DROP POLICY IF EXISTS "Service role full access prompt_hashes" ON prompt_hashes;

-- Public read access
CREATE POLICY "Public read access to tags" ON tags FOR SELECT USING (true);
CREATE POLICY "Public read access to artwork_tags" ON artwork_tags FOR SELECT USING (true);
CREATE POLICY "Public read access to comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Public insert access to comments" ON comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read access to prompt_hashes" ON prompt_hashes FOR SELECT USING (true);

-- Allow service role full access
CREATE POLICY "Service role full access tags" ON tags FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access artwork_tags" ON artwork_tags FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access comments" ON comments FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access prompt_hashes" ON prompt_hashes FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Sample tags
INSERT INTO tags (name) VALUES 
  ('abstract'), ('digital'), ('surreal'), ('portrait'), ('landscape'),
  ('minimalist'), ('futuristic'), ('nature'), ('fantasy'), ('cyberpunk')
ON CONFLICT (name) DO NOTHING;

