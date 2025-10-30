#!/usr/bin/env node

/**
 * Seed script for Aetheria database
 * Populates the database with sample data for development
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const sampleArtworks = [
  {
    title: 'Digital Dreams',
    description: 'A vibrant exploration of digital consciousness',
    image_url: 'https://picsum.photos/800/600?random=1',
    metadata_uri: 'ipfs://QmSample1',
    metadata_hash: 'hash1',
    creator_wallet: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    vote_count: 15,
    minted: true,
    token_id: 1,
    tx_hash: '0x1234abcd'
  },
  {
    title: 'Neon Nights',
    description: 'Cyberpunk aesthetics meet abstract art',
    image_url: 'https://picsum.photos/800/600?random=2',
    metadata_uri: 'ipfs://QmSample2',
    metadata_hash: 'hash2',
    creator_wallet: '0x1234567890123456789012345678901234567890',
    vote_count: 8,
    minted: true,
    token_id: 2,
    tx_hash: '0x5678efgh'
  },
  {
    title: 'Quantum Landscape',
    description: 'Visualizing quantum uncertainty',
    image_url: 'https://picsum.photos/800/600?random=3',
    metadata_uri: 'ipfs://QmSample3',
    metadata_hash: 'hash3',
    creator_wallet: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
    vote_count: 20,
    minted: true,
    token_id: 3,
    tx_hash: '0x9abc1234'
  }
];

async function seed() {
  console.log('🌱 Seeding Aetheria database...');

  try {
    // Insert sample artworks
    const { data: artworks, error: artworksError } = await supabase
      .from('artworks')
      .upsert(sampleArtworks, { onConflict: 'id' })
      .select();

    if (artworksError) {
      console.error('Error inserting artworks:', artworksError);
    } else {
      console.log(`✅ Inserted ${artworks?.length || 0} artworks`);
    }

    // Insert sample users
    const sampleUsers = [
      {
        wallet_address: sampleArtworks[0].creator_wallet,
        username: 'DigitalArtist',
        joined_at: new Date().toISOString()
      },
      {
        wallet_address: sampleArtworks[1].creator_wallet,
        username: 'NeonPainter',
        joined_at: new Date().toISOString()
      },
      {
        wallet_address: sampleArtworks[2].creator_wallet,
        username: 'QuantumCreator',
        joined_at: new Date().toISOString()
      }
    ];

    const { data: users, error: usersError } = await supabase
      .from('users')
      .upsert(sampleUsers, { onConflict: 'wallet_address' })
      .select();

    if (usersError) {
      console.error('Error inserting users:', usersError);
    } else {
      console.log(`✅ Inserted ${users?.length || 0} users`);
    }

    console.log('✨ Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();

