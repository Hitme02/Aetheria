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
      return res.status(400).json({ error: 'Missing artworkId or voterWallet' });
    }

    // Basic auth check: require Authorization header token
    const authHeader = req.headers['authorization'] || '';
    const token = Array.isArray(authHeader) ? authHeader[0] : authHeader;
    const bearer = token.startsWith('Bearer ') ? token.slice(7) : '';
    if (!bearer) {
      return res.status(401).json({ error: 'Unauthorized: missing auth token' });
    }
    // MVP validation: if wallet vote, token must match wallet (case-insensitive)
    if (String(voterWallet).toLowerCase().startsWith('0x') && bearer.toLowerCase() !== String(voterWallet).toLowerCase()) {
      return res.status(401).json({ error: 'Unauthorized: token does not match wallet' });
    }

    // Check if user already voted
    const { data: existingVote } = await supabase
      .from('votes')
      .select('*')
      .eq('artwork_id', artworkId)
      .eq('user_wallet', voterWallet.toLowerCase())
      .single();
    let action;
    if (!existingVote) {
      // Add vote
      await supabase.from('votes').insert({
        artwork_id: artworkId,
        user_wallet: voterWallet.toLowerCase()
      });
      // Increment vote_count
      const { data: artwork } = await supabase
        .from('artworks')
        .select('vote_count')
        .eq('id', artworkId)
        .single();
      await supabase
        .from('artworks')
        .update({ vote_count: (artwork?.vote_count || 0) + 1 })
        .eq('id', artworkId);
      action = 'added';
      console.info('Vote added for artwork:', artworkId, 'by', voterWallet);
    } else {
      // Remove vote
      await supabase
        .from('votes')
        .delete()
        .eq('artwork_id', artworkId)
        .eq('user_wallet', voterWallet.toLowerCase());
      const { data: artwork } = await supabase
        .from('artworks')
        .select('vote_count')
        .eq('id', artworkId)
        .single();
      await supabase
        .from('artworks')
        .update({ vote_count: Math.max((artwork?.vote_count || 1) - 1, 0) })
        .eq('id', artworkId);
      action = 'removed';
      console.info('Vote removed for artwork:', artworkId, 'by', voterWallet);
    }
    res.json({ success: true, action });
  } catch (error) {
    console.error('Error toggling vote:', error);
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

app.get('/has-voted', async (req: Request, res: Response) => {
  const artworkId = (req.query.artwork as string) || '';
  const wallet = (req.query.wallet as string) || '';
  if (!artworkId || !wallet) return res.json({ hasVoted: false });
  const { data } = await supabase
    .from('votes')
    .select('id')
    .eq('artwork_id', artworkId)
    .eq('user_wallet', wallet.toLowerCase())
    .maybeSingle();
  res.json({ hasVoted: !!data });
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

