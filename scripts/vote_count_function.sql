-- Create a database function to increment vote_count atomically
-- This is more reliable than fetching and updating

CREATE OR REPLACE FUNCTION increment_vote_count(artwork_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE artworks
  SET vote_count = vote_count + 1
  WHERE id = artwork_id;
END;
$$;

-- Grant execute permission to service role
GRANT EXECUTE ON FUNCTION increment_vote_count(uuid) TO service_role;


