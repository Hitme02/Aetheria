import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { votingGet } from '../lib/api';
import { supabase } from '../lib/supabase';
import { getLoggedInWallet } from '../lib/auth';
import { fadeInUp } from '../lib/animations';

type Artwork = {
  id: number;
  title: string;
  image_url: string;
  vote_count: number;
  featured: boolean;
  hidden: boolean;
  creator_wallet: string;
};

// Admin wallet addresses (for MVP - in production, use role-based auth)
const ADMIN_WALLETS = [
  import.meta.env.VITE_ADMIN_WALLET_1?.toLowerCase(),
  import.meta.env.VITE_ADMIN_WALLET_2?.toLowerCase(),
].filter(Boolean);

export default function Admin() {
  const wallet = getLoggedInWallet();
  const queryClient = useQueryClient();
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);

  const isAdmin = wallet && ADMIN_WALLETS.includes(wallet.toLowerCase());

  // Fetch all artworks
  const { data: artworks, isLoading } = useQuery({
    queryKey: ['admin-artworks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('artworks')
        .select('*')
        .eq('hidden', false)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return (data || []) as Artwork[];
    },
  });

  const featureMutation = useMutation({
    mutationFn: async ({ id, featured }: { id: number; featured: boolean }) => {
      const { error } = await supabase
        .from('artworks')
        .update({ featured })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-artworks'] });
      window.dispatchEvent(new CustomEvent('aetheria:toast', {
        detail: 'Artwork updated'
      } as any));
    },
  });

  const hideMutation = useMutation({
    mutationFn: async ({ id, hidden }: { id: number; hidden: boolean }) => {
      const { error } = await supabase
        .from('artworks')
        .update({ hidden })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-artworks'] });
      window.dispatchEvent(new CustomEvent('aetheria:toast', {
        detail: 'Artwork hidden'
      } as any));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('artworks')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-artworks'] });
      window.dispatchEvent(new CustomEvent('aetheria:toast', {
        detail: 'Artwork deleted'
      } as any));
    },
  });

  if (!isAdmin) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
        <p className="text-gray-400">Admin access required.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
      >
        <h1 className="text-4xl font-bold mb-2">Admin Control Panel</h1>
        <p className="text-gray-400">Manage artworks and curation</p>
      </motion.div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : (
        <div className="grid gap-4">
          {artworks?.map(artwork => (
            <motion.div
              key={artwork.id}
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="p-4 rounded-xl bg-card/30 border border-white/10 flex items-center gap-4"
            >
              <img
                src={artwork.image_url}
                alt={artwork.title}
                className="w-20 h-20 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h3 className="font-semibold">{artwork.title}</h3>
                <p className="text-sm text-gray-400">
                  {artwork.vote_count} votes • {artwork.featured && '⭐ Featured'} {artwork.hidden && '🚫 Hidden'}
                </p>
              </div>
              <div className="flex gap-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => featureMutation.mutate({ id: artwork.id, featured: !artwork.featured })}
                  className={`px-3 py-1 rounded-lg text-sm font-medium ${
                    artwork.featured
                      ? 'bg-highlight text-black'
                      : 'bg-card/50 text-white hover:bg-card/70'
                  }`}
                >
                  {artwork.featured ? '⭐ Featured' : 'Feature'}
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => hideMutation.mutate({ id: artwork.id, hidden: !artwork.hidden })}
                  className="px-3 py-1 rounded-lg text-sm font-medium bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
                >
                  {artwork.hidden ? 'Unhide' : 'Hide'}
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (confirm('Delete this artwork permanently?')) {
                      deleteMutation.mutate(artwork.id);
                    }
                  }}
                  className="px-3 py-1 rounded-lg text-sm font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30"
                >
                  Delete
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

