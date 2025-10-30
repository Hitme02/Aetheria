import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4005;

// Middleware
app.use(cors());
app.use(express.json());

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /health
 * Health check endpoint
 */
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'voting-service',
    timestamp: new Date().toISOString()
  });
});

/**
 * POST /vote
 * Record a vote for an artwork
 */
app.post('/vote', async (req: Request, res: Response) => {
  try {
    const { artworkId, voterWallet } = req.body;

    if (!artworkId || !voterWallet) {
      return res.status(400).json({
        error: 'Missing artworkId or voterWallet'
      });
    }

    // Check if user already voted
    const { data: existingVote, error: checkError } = await supabase
      .from('votes')
      .select('*')
      .eq('artwork_id', artworkId)
      .eq('user_wallet', voterWallet.toLowerCase())
      .single();

    if (existingVote) {
      return res.status(400).json({
        error: 'Already voted for this artwork'
      });
    }

    // Insert vote
    const { data: vote, error: insertError } = await supabase
      .from('votes')
      .insert({
        artwork_id: artworkId,
        user_wallet: voterWallet.toLowerCase()
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting vote:', insertError);
      return res.status(500).json({ error: 'Failed to record vote' });
    }

    // Increment vote_count on artwork: only fallback fetch+update
    const { data: artwork, error: fetchError } = await supabase
      .from('artworks')
      .select('vote_count')
      .eq('id', artworkId)
      .single();

    if (fetchError || !artwork) {
      console.error('Failed to fetch artwork for vote count update', fetchError);
      return res.status(500).json({ error: 'Failed to fetch artwork for vote count update', detail: fetchError });
    }

    const { error: incrementError } = await supabase
      .from('artworks')
      .update({ vote_count: (artwork.vote_count || 0) + 1 })
      .eq('id', artworkId);

    if (incrementError) {
      console.error('Failed to increment vote count', incrementError);
      return res.status(500).json({ error: 'Failed to increment vote count', detail: incrementError });
    }

    console.info('Vote and increment successful for artwork:', artworkId);

    res.json({
      success: true,
      vote
    });
  } catch (error) {
    console.error('Error recording vote:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /featured?n=3
 * Get top N featured artworks by vote count
 */
app.get('/featured', async (req: Request, res: Response) => {
  try {
    const n = parseInt(req.query.n as string) || 3;

    const { data: artworks, error } = await supabase
      .from('artworks')
      .select('*')
      .order('vote_count', { ascending: false })
      .limit(n);

    if (error) {
      console.error('Error fetching featured artworks:', error);
      return res.status(500).json({ error: 'Failed to fetch featured artworks' });
    }

    res.json({
      count: artworks?.length || 0,
      artworks: artworks || []
    });
  } catch (error) {
    console.error('Error fetching featured:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /votes/:artworkId
 * Get vote count for an artwork
 */
app.get('/votes/:artworkId', async (req: Request, res: Response) => {
  try {
    const { artworkId } = req.params;

    const { data: artwork, error } = await supabase
      .from('artworks')
      .select('vote_count')
      .eq('id', artworkId)
      .single();

    if (error || !artwork) {
      return res.status(404).json({ error: 'Artwork not found' });
    }

    res.json({
      artwork_id: artworkId,
      vote_count: artwork.vote_count
    });
  } catch (error) {
    console.error('Error fetching vote count:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/artwork/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('artworks')
    .select('*')
    .eq('id', (Number.isFinite(Number(id)) ? Number(id) : id))
    .single();
  if (error || !data) return res.status(404).json({ error: 'Artwork not found' });
  res.json({ artwork: data });
});

app.listen(PORT, () => {
  console.log(`🗳️  Voting service running on port ${PORT}`);
});

export default app;

