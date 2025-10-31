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
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase configuration! SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.');
  process.exit(1);
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Test Supabase connection on startup
(async () => {
  try {
    const { error } = await supabase.from('artworks').select('id').limit(1);
    if (error) {
      console.error('❌ Failed to connect to Supabase:', error.message);
      console.error('   Make sure the artworks table exists and service role key has access');
    } else {
      console.log('✅ Connected to Supabase');
    }
  } catch (err: any) {
    console.error('❌ Supabase connection error:', err);
  }
})();

/**
 * GET /
 * Root endpoint with service information
 */
app.get('/', (_req: Request, res: Response) => {
  res.json({
    service: 'voting-service',
    status: 'running',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      featured: 'GET /featured?n=12',
      vote: 'POST /vote',
      artwork: 'GET /artwork/:id',
      hasVoted: 'GET /has-voted?artwork=:id&wallet=:wallet'
    },
    timestamp: new Date().toISOString()
  });
});

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

    // Check if Supabase is configured
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(500).json({ 
        error: 'Supabase not configured',
        details: 'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set',
        hint: 'Check environment variables on Render'
      });
    }

    const { data: artworks, error } = await supabase
      .from('artworks')
      .select('*')
      .order('vote_count', { ascending: false })
      .limit(n);

    if (error) {
      console.error('Error fetching featured artworks:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch featured artworks',
        details: error.message,
        hint: 'Check Supabase connection and table permissions. Verify SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set correctly.'
      });
    }

    // Always return success even if empty array
    res.json({
      count: artworks?.length || 0,
      artworks: artworks || []
    });
  } catch (error: any) {
    console.error('Error fetching featured:', error);
    const errorMessage = error?.message || 'Unknown error';
    const isNetworkError = errorMessage.includes('fetch failed') || errorMessage.includes('ECONNREFUSED');
    
    res.status(500).json({ 
      error: 'Internal server error',
      details: errorMessage,
      hint: isNetworkError 
        ? 'Cannot connect to Supabase. Check SUPABASE_URL and network connectivity.'
        : 'Check service logs for more details'
    });
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
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'Artwork ID is required' });
    }

    // Handle both UUID and numeric IDs
    const idValue = Number.isFinite(Number(id)) && !id.includes('-') ? Number(id) : id;
    
    const { data, error } = await supabase
      .from('artworks')
      .select('*')
      .eq('id', idValue)
      .single();

    if (error) {
      console.error('Error fetching artwork:', error);
      return res.status(404).json({ 
        error: 'Artwork not found',
        details: error.message
      });
    }

    if (!data) {
      return res.status(404).json({ error: 'Artwork not found' });
    }

    res.json({ artwork: data });
  } catch (error: any) {
    console.error('Error in /artwork/:id:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error?.message || 'Unknown error'
    });
  }
});

app.listen(PORT, () => {
  console.log(`🗳️  Voting service running on port ${PORT}`);
});

export default app;

