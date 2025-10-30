import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { ethers } from 'ethers';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4004;

// Middleware
app.use(cors());
app.use(express.json());

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Initialize ethers provider and signer
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

// Contract ABI (minimal)
const CONTRACT_ABI = [
  'function mintArtwork(address creator, string calldata tokenURI) external returns (uint256)',
  'event Minted(address indexed creator, uint256 tokenId, string tokenURI)'
];

/**
 * GET /health
 * Health check endpoint
 */
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'mint-service',
    timestamp: new Date().toISOString()
  });
});

/**
 * POST /mint
 * Mint an NFT for an artwork
 */
app.post('/mint', async (req: Request, res: Response) => {
  try {
    // Authenticate request (simple token check)
    const authToken = req.headers.authorization;
    if (authToken !== `Bearer ${process.env.MINTER_AUTH_TOKEN}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { artworkId } = req.body;

    if (!artworkId) {
      return res.status(400).json({ error: 'Missing artworkId' });
    }

    if (!process.env.CONTRACT_ADDRESS) {
      return res.status(500).json({ error: 'Contract not deployed' });
    }

    // Fetch artwork
    const { data: artwork, error: fetchError } = await supabase
      .from('artworks')
      .select('*')
      .eq('id', artworkId)
      .single();

    if (fetchError || !artwork) {
      return res.status(404).json({ error: 'Artwork not found' });
    }

    if (artwork.minted) {
      return res.status(400).json({
        error: 'Artwork already minted',
        token_id: artwork.token_id,
        tx_hash: artwork.tx_hash
      });
    }

    if (!artwork.metadata_uri) {
      return res.status(400).json({ error: 'Artwork metadata not created' });
    }

    // Create contract instance
    const contract = new ethers.Contract(
      process.env.CONTRACT_ADDRESS,
      CONTRACT_ABI,
      wallet
    );

    // Mint NFT
    console.log(`Minting NFT for artwork ${artworkId}`);
    const tx = await contract.mintArtwork(artwork.creator_wallet, artwork.metadata_uri);

    console.log(`Transaction sent: ${tx.hash}`);
    const receipt = await tx.wait();

    // Extract token ID from events
    const mintEvent = receipt.logs.find(
      (log: any) => log.topics[0] === ethers.id('Minted(address,uint256,string)')
    );

    if (!mintEvent) {
      console.error('Mint event not found in receipt');
      return res.status(500).json({ error: 'Failed to extract token ID' });
    }

    const tokenId = BigInt(mintEvent.topics[2]);

    // Update artwork record
    const { error: updateError } = await supabase
      .from('artworks')
      .update({
        token_id: Number(tokenId),
        tx_hash: tx.hash,
        minted: true
      })
      .eq('id', artworkId);

    if (updateError) {
      console.error('Error updating artwork:', updateError);
      return res.status(500).json({ error: 'Failed to update artwork record' });
    }

    res.json({
      success: true,
      tx_hash: tx.hash,
      token_id: Number(tokenId),
      artwork_id: artworkId
    });
  } catch (error) {
    console.error('Error minting NFT:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`🎨 Mint service running on port ${PORT}`);
  console.log(`Connected wallet: ${wallet.address}`);
  console.log(`Contract: ${process.env.CONTRACT_ADDRESS || 'Not deployed'}`);
});

export default app;

