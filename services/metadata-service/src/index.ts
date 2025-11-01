import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
// IPFS pinning can be added later - for now using mock URIs
// import { NFTStorage, File } from 'nft.storage';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4003;

// Middleware
app.use(cors());
app.use(express.json());

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// IPFS pinning disabled for now - using mock URIs
// Can be enabled later by adding NFT_STORAGE_TOKEN and uncommenting the import above

/**
 * GET /
 * Root endpoint with service information
 */
app.get('/', (_req: Request, res: Response) => {
  res.json({
    service: 'metadata-service',
    status: 'running',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      createMetadata: 'POST /metadata',
      getMetadata: 'GET /metadata/:artworkId'
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
    service: 'metadata-service',
    timestamp: new Date().toISOString()
  });
});

/**
 * POST /metadata
 * Create metadata and pin to IPFS
 */
app.post('/metadata', async (req: Request, res: Response) => {
  try {
    const { artworkId } = req.body;

    if (!artworkId) {
      return res.status(400).json({ error: 'Missing artworkId' });
    }

    // Fetch artwork from database
    const { data: artwork, error: fetchError } = await supabase
      .from('artworks')
      .select('*')
      .eq('id', artworkId)
      .single();

    if (fetchError || !artwork) {
      return res.status(404).json({ error: 'Artwork not found' });
    }

    if (artwork.metadata_uri) {
      // Metadata already exists
      return res.json({
        metadata_uri: artwork.metadata_uri
      });
    }

    // Build metadata JSON
    const metadata = {
      name: artwork.title,
      description: artwork.description,
      image: artwork.image_url,
      hash: artwork.metadata_hash,
      creator: artwork.creator_wallet,
      createdAt: artwork.created_at
    };

    // Generate mock IPFS URI (IPFS pinning can be added later)
    const metadata_uri = `ipfs://QmMock${artworkId}`;
    console.log(`✅ Metadata URI created: ${metadata_uri}`);

    // Update artwork record with metadata URI
    const { error: updateError } = await supabase
      .from('artworks')
      .update({ metadata_uri })
      .eq('id', artworkId);

    if (updateError) {
      console.error('Error updating metadata URI:', updateError);
      return res.status(500).json({ error: 'Failed to update metadata' });
    }

    res.json({
      metadata_uri,
      metadata
    });
  } catch (error) {
    console.error('Error creating metadata:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /metadata/:artworkId
 * Get metadata for an artwork
 */
app.get('/metadata/:artworkId', async (req: Request, res: Response) => {
  try {
    const { artworkId } = req.params;

    const { data: artwork, error } = await supabase
      .from('artworks')
      .select('*')
      .eq('id', artworkId)
      .single();

    if (error || !artwork) {
      return res.status(404).json({ error: 'Artwork not found' });
    }

    res.json({
      artworkId,
      metadata_uri: artwork.metadata_uri,
      metadata: {
        name: artwork.title,
        description: artwork.description,
        image: artwork.image_url,
        hash: artwork.metadata_hash
      }
    });
  } catch (error) {
    console.error('Error fetching metadata:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`📝 Metadata service running on port ${PORT}`);
});

export default app;

