-- Aetheria Database Schema
-- Run this script on your Supabase PostgreSQL database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text UNIQUE NOT NULL,
  username text,
  joined_at timestamptz DEFAULT now()
);

-- Artworks table
CREATE TABLE IF NOT EXISTS artworks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  description text,
  image_url text,
  metadata_uri text,
  metadata_hash text,
  token_id bigint,
  tx_hash text,
  creator_wallet text,
  vote_count int DEFAULT 0,
  minted boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Votes table
CREATE TABLE IF NOT EXISTS votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_wallet text NOT NULL,
  artwork_id uuid REFERENCES artworks(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_wallet, artwork_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_artworks_creator ON artworks(creator_wallet);
CREATE INDEX IF NOT EXISTS idx_artworks_minted ON artworks(minted);
CREATE INDEX IF NOT EXISTS idx_artworks_vote_count ON artworks(vote_count DESC);
CREATE INDEX IF NOT EXISTS idx_votes_artwork ON votes(artwork_id);
CREATE INDEX IF NOT EXISTS idx_votes_user ON votes(user_wallet);

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Allow public read access to artworks
CREATE POLICY "Public read access to artworks" ON artworks
  FOR SELECT
  USING (true);

-- Allow public read access to users
CREATE POLICY "Public read access to users" ON users
  FOR SELECT
  USING (true);

-- Allow public read access to votes
CREATE POLICY "Public read access to votes" ON votes
  FOR SELECT
  USING (true);

-- Allow service role to do everything
CREATE POLICY "Service role full access" ON artworks
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access" ON users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access" ON votes
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

