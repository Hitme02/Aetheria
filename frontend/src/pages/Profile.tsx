import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import { getLoggedInWallet, formatWallet, isLoggedIn } from '../lib/auth';
import { supabase } from '../lib/supabase';
import ArtworkCard from '../components/ArtworkCard';
import { fadeInUp } from '../lib/animations';

type Artwork = {
  id: number;
  title: string;
  image_url: string;
  vote_count: number;
  minted: boolean;
  token_id?: number;
  created_at: string;
};

export default function Profile() {
  const navigate = useNavigate();
  const { address } = useAccount();
  const wallet = getLoggedInWallet() || address;
  const [activeTab, setActiveTab] = useState<'artworks' | 'votes' | 'mints'>('artworks');

  // Redirect to login if not logged in
  // Note: wallet connection (address) is separate from Aetheria login (token in localStorage)
  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  // Show nothing while redirecting
  if (!isLoggedIn()) {
    return null;
  }

  // Fetch user's artworks
  const { data: artworks } = useQuery({
    queryKey: ['my-artworks', wallet],
    queryFn: async () => {
      if (!wallet) return [];
      const { data, error } = await supabase
        .from('artworks')
        .select('*')
        .eq('creator_wallet', wallet.toLowerCase())
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []) as Artwork[];
    },
    enabled: !!wallet,
  });

  // Fetch user's votes
  const { data: votedArtworks } = useQuery({
    queryKey: ['my-votes', wallet],
    queryFn: async () => {
      if (!wallet) return [];
      const { data: votes } = await supabase
        .from('votes')
        .select('artwork_id')
        .eq('user_wallet', wallet.toLowerCase());
      
      if (!votes || votes.length === 0) return [];
      
      const artworkIds = votes.map(v => v.artwork_id);
      const { data, error } = await supabase
        .from('artworks')
        .select('*')
        .in('id', artworkIds)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []) as Artwork[];
    },
    enabled: !!wallet,
  });

  // Fetch minted artworks
  const { data: mintedArtworks } = useQuery({
    queryKey: ['my-mints', wallet],
    queryFn: async () => {
      if (!wallet) return [];
      const { data, error } = await supabase
        .from('artworks')
        .select('*')
        .eq('creator_wallet', wallet.toLowerCase())
        .eq('minted', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []) as Artwork[];
    },
    enabled: !!wallet,
  });

  if (!wallet) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Not Signed In</h2>
        <p className="text-gray-400 mb-6">Connect your wallet or sign in to view your profile.</p>
        <Link to="/login" className="text-accent hover:underline">Go to Login</Link>
      </div>
    );
  }

  const stats = {
    artworks: artworks?.length || 0,
    votes: votedArtworks?.length || 0,
    mints: mintedArtworks?.length || 0,
  };

  const getActiveData = () => {
    switch (activeTab) {
      case 'artworks': return artworks || [];
      case 'votes': return votedArtworks || [];
      case 'mints': return mintedArtworks || [];
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Profile Header */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="text-center"
      >
        <h1 className="text-4xl font-bold mb-2">Your Profile</h1>
        <p className="text-gray-400 font-mono">{formatWallet(wallet)}</p>
      </motion.div>

      {/* Stats */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-4"
      >
        <div className="p-6 rounded-xl bg-card/30 border border-white/10 text-center">
          <div className="text-3xl font-bold text-accent mb-1">{stats.artworks}</div>
          <div className="text-sm text-gray-400">Artworks</div>
        </div>
        <div className="p-6 rounded-xl bg-card/30 border border-white/10 text-center">
          <div className="text-3xl font-bold text-highlight mb-1">{stats.votes}</div>
          <div className="text-sm text-gray-400">Votes</div>
        </div>
        <div className="p-6 rounded-xl bg-card/30 border border-white/10 text-center">
          <div className="text-3xl font-bold text-accent mb-1">{stats.mints}</div>
          <div className="text-sm text-gray-400">Minted</div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10">
        {(['artworks', 'votes', 'mints'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-medium transition-colors capitalize ${
              activeTab === tab
                ? 'text-accent border-b-2 border-accent'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            My {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
      >
        {getActiveData().length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-400">
            No {activeTab} yet
          </div>
        ) : (
          getActiveData().map(artwork => (
            <ArtworkCard
              key={artwork.id}
              id={artwork.id}
              title={artwork.title}
              imageUrl={artwork.image_url}
              votes={artwork.vote_count}
              creatorWallet={wallet}
              minted={artwork.minted}
              tokenId={artwork.token_id}
            />
          ))
        )}
      </motion.div>
    </div>
  );
}

