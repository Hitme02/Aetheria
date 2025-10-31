import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { ethers } from 'ethers';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4001;

// Middleware
app.use(cors());
app.use(express.json());

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Store nonces (in production, use Redis or database)
const nonceStore = new Map<string, { nonce: string; expires: number }>();
const NONCE_EXPIRY = 5 * 60 * 1000; // 5 minutes

/**
 * GET /
 * Root endpoint with service information
 */
app.get('/', (_req: Request, res: Response) => {
  res.json({
    service: 'auth-service',
    status: 'running',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      nonce: 'GET /nonce?wallet=0x...',
      verify: 'POST /verify'
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
    service: 'auth-service',
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /nonce?wallet=0x...
 * Generate a nonce for wallet authentication
 */
app.get('/nonce', async (req: Request, res: Response) => {
  try {
    const wallet = req.query.wallet as string;

    if (!wallet || !ethers.isAddress(wallet)) {
      return res.status(400).json({
        error: 'Invalid wallet address'
      });
    }

    // Generate random nonce
    const nonce = ethers.hexlify(ethers.randomBytes(32));
    const expires = Date.now() + NONCE_EXPIRY;

    nonceStore.set(wallet.toLowerCase(), { nonce, expires });

    res.json({ nonce });
  } catch (error) {
    console.error('Error generating nonce:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /verify
 * Verify wallet signature and authenticate user
 */
app.post('/verify', async (req: Request, res: Response) => {
  try {
    const { wallet, signature } = req.body;

    if (!wallet || !signature) {
      return res.status(400).json({
        error: 'Missing wallet or signature'
      });
    }

    if (!ethers.isAddress(wallet)) {
      return res.status(400).json({
        error: 'Invalid wallet address'
      });
    }

    // Get stored nonce
    const stored = nonceStore.get(wallet.toLowerCase());

    if (!stored) {
      return res.status(400).json({
        error: 'Nonce not found or expired'
      });
    }

    // Check expiration
    if (Date.now() > stored.expires) {
      nonceStore.delete(wallet.toLowerCase());
      return res.status(400).json({
        error: 'Nonce expired'
      });
    }

    // Recover address from signature
    const message = `Sign this message to authenticate with Aetheria:\nNonce: ${stored.nonce}`;
    const recoveredAddress = ethers.verifyMessage(message, signature);

    if (recoveredAddress.toLowerCase() !== wallet.toLowerCase()) {
      return res.status(401).json({
        error: 'Signature verification failed'
      });
    }

    // Remove used nonce
    nonceStore.delete(wallet.toLowerCase());

    // Upsert user in Supabase
    const { data: user, error } = await supabase
      .from('users')
      .upsert(
        {
          wallet_address: wallet.toLowerCase(),
          username: null
        },
        { onConflict: 'wallet_address' }
      )
      .select()
      .single();

    if (error) {
      console.error('Error upserting user:', error);
      return res.status(500).json({ error: 'Failed to create user' });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        wallet_address: user.wallet_address,
        username: user.username,
        joined_at: user.joined_at
      }
    });
  } catch (error) {
    console.error('Error verifying signature:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`🔐 Auth service running on port ${PORT}`);
});

export default app;

