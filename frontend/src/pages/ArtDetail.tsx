import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { votingGet, mintPost, votingPost } from '../lib/api';
import { formatWallet, getLoggedInWallet, isLoggedIn } from '../lib/auth';
import { useState, useEffect } from 'react';
import { fadeInUp } from '../lib/animations';
import Comments from '../components/Comments';
import ShareButtons from '../components/ShareButtons';

type Artwork = {
  id: number;
  title: string;
  description: string;
  image_url: string;
  creator_wallet: string;
  vote_count: number;
  minted: boolean;
  token_id?: number;
  tx_hash?: string;
  metadata_hash: string;
  created_at: string;
};

export default function ArtDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [minting, setMinting] = useState(false);
  const qc = useQueryClient();
  const [voteLoading, setVoteLoading] = useState(false);
  const [voteCount, setVoteCount] = useState<number | null>(null);
  const [hasVoted, setHasVoted] = useState(false);

  const creatorWallet = getLoggedInWallet();

  const { data: artwork, isLoading, error } = useQuery({
    queryKey: ['artwork', id],
    queryFn: async () => {
      const response = await votingGet<{ artwork: Artwork }>(`/artwork/${id}`);
      if (!response.artwork) throw new Error('Artwork not found');
      return response.artwork;
    },
    enabled: !!id,
    retry: 1,
    retryDelay: 2000,
    staleTime: 30000,
  });

  useEffect(() => {
    if (!artwork) return;
    setVoteCount(artwork.vote_count);
    if (!creatorWallet) { setHasVoted(false); return; }
    (async () => {
      try {
        const params = new URLSearchParams({
          artwork: String(artwork.id),
          wallet: creatorWallet
        });
        const response = await votingGet<{ hasVoted: boolean }>(`/has-voted?${params.toString()}`);
        setHasVoted(!!response.hasVoted);
      } catch {
        setHasVoted(false);
      }
    })();
  }, [artwork?.id, creatorWallet]);

  const isEligibleForMint = artwork && artwork.vote_count >= 3 && !artwork.minted;
  const canMint = creatorWallet && creatorWallet.toLowerCase() === artwork?.creator_wallet?.toLowerCase();

  const vote = useMutation({
    mutationFn: async () => {
      if (!creatorWallet || creatorWallet === '0x') throw new Error('Please log in or connect your wallet');
      setVoteLoading(true);
      const response = await votingPost('/vote', { artworkId: artwork.id, voterWallet: creatorWallet });
      setVoteLoading(false);
      return response;
    },
    onError: (error: any) => {
      setVoteLoading(false);
      let msg: string;
      try { msg = error?.message || error?.error || String(error); } catch { msg = 'Unknown voting error'; }
      
      // If user already voted, update hasVoted state
      if (msg.includes('already voted') || error?.hasVoted) {
        setHasVoted(true);
      }
      
      window.dispatchEvent(new CustomEvent('aetheria:toast', { detail: `Voting failed: ${msg}` } as any));
    },
    onSuccess: (response) => {
      // Handle both vote addition and removal
      if (response.action === 'added') {
        setHasVoted(true);
        setVoteCount(c => (typeof c === 'number' ? c+1 : 1));
      } else if (response.action === 'removed') {
        setHasVoted(false);
        setVoteCount(c => Math.max(0, (typeof c === 'number' ? c-1 : 0)));
      }
      qc.invalidateQueries(['artwork', id]);
    },
  });

  const handleMint = async () => {
    if (!artwork || !canMint) return;
    
    setMinting(true);
    try {
      // Note: This requires MINTER_AUTH_TOKEN - for MVP, this could be a user-initiated action
      // For production, backend should handle auth check
      const response = await mintPost<{ success: boolean; tx_hash: string; token_id: number }>('/mint', {
        artworkId: artwork.id
      });
      
      if (response.success) {
        window.dispatchEvent(new CustomEvent('aetheria:toast', { 
          detail: `NFT minted! Token ID: ${response.token_id}` 
        } as any));
        // Refresh artwork data
        window.location.reload();
      }
    } catch (error: any) {
      window.dispatchEvent(new CustomEvent('aetheria:toast', { 
        detail: `Minting failed: ${error.message || 'Unknown error'}` 
      } as any));
    } finally {
      setMinting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-accent mb-4"></div>
          <p className="text-gray-400">Loading artwork...</p>
        </div>
      </div>
    );
  }

  if (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isConnectionError = errorMessage.toLowerCase().includes('timeout') || 
                              errorMessage.toLowerCase().includes('network') ||
                              errorMessage.toLowerCase().includes('invalid api url');
    
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <p className="text-red-400 text-lg mb-2">Failed to load artwork</p>
          <p className="text-gray-400 text-sm mb-4">{errorMessage}</p>
          {isConnectionError && (
            <div className="bg-white/5 rounded-lg p-4 mb-4 text-left">
              <p className="text-yellow-400 text-sm font-semibold mb-2">Possible issues:</p>
              <ul className="text-gray-400 text-xs space-y-1 list-disc list-inside">
                <li>Voting service is not running</li>
                <li>Check VITE_API_VOTING_BASE environment variable</li>
                <li>Verify service is accessible at the configured URL</li>
              </ul>
            </div>
          )}
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-accent text-black rounded-lg font-medium hover:bg-highlight transition-colors duration-200"
            >
              Retry
            </button>
            <Link
              to="/gallery"
              className="px-4 py-2 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-colors duration-200"
            >
              Back to Gallery
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!artwork) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold mb-4">Artwork Not Found</h1>
        <Link to="/gallery" className="text-accent hover:underline">
          Return to Gallery
        </Link>
      </div>
    );
  }

  const etherscanUrl = artwork.tx_hash 
    ? `https://sepolia.etherscan.io/tx/${artwork.tx_hash}`
    : null;

  return (
    <div className="max-w-6xl mx-auto grid gap-8 md:grid-cols-2">
      {/* Artwork Image */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="relative"
      >
        <img
          src={artwork.image_url}
          alt={artwork.title}
          className="w-full rounded-xl border border-white/10 object-contain bg-card/30"
        />
        {(artwork.minted || isEligibleForMint) && (
          <div className="absolute top-4 right-4">
            {artwork.minted && (
              <div className="px-4 py-2 bg-gradient-to-r from-accent to-highlight text-black font-bold rounded-full shadow-lg">
                🪙 Minted NFT
              </div>
            )}
            {isEligibleForMint && (
              <div className="px-4 py-2 bg-highlight text-black font-bold rounded-full shadow-lg mt-2">
                ✅ Eligible for Mint
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Artwork Details */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="grid gap-6"
      >
        <div>
          <h1 className="text-4xl font-bold mb-4">{artwork.title}</h1>
          <p className="text-gray-300 leading-relaxed mb-4">{artwork.description}</p>
          
          <div className="flex items-center gap-2 text-gray-400 mb-6">
            <span>by</span>
            <span className="font-mono text-accent">
              {artwork.creator_wallet === '0x' 
                ? 'Anonymous' 
                : formatWallet(artwork.creator_wallet)}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-card/30 rounded-xl border border-white/10 backdrop-blur-sm">
          <div>
            <div className="text-sm text-gray-400 mb-1">Votes</div>
            <div className="text-2xl font-bold text-accent">{voteCount ?? artwork.vote_count}</div>
          </div>
          <div>
            <div className="text-sm text-gray-400 mb-1">Status</div>
            <div className="text-lg font-semibold">
              {artwork.minted ? (
                <span className="text-highlight">Minted</span>
              ) : artwork.vote_count >= 3 ? (
                <span className="text-accent">Eligible</span>
              ) : (
                <span className="text-gray-400">Pending Review</span>
              )}
            </div>
          </div>
        </div>

        {creatorWallet && (
          <motion.button
            whileTap={{ scale: 0.93 }}
            className="w-full px-4 py-2 mt-4 bg-accent text-black rounded-lg font-bold disabled:opacity-70 disabled:cursor-not-allowed"
            disabled={voteLoading}
            onClick={() => {
              if (!isLoggedIn()) {
                navigate('/login', { state: { from: location.pathname } });
                return;
              }
              vote.mutate();
            }}
          >
            {voteLoading
              ? (hasVoted ? 'Unvoting...' : 'Voting...')
              : (!isLoggedIn())
                ? 'Login to Vote'
                : hasVoted ? 'Unvote' : 'Vote for this Artwork'}
          </motion.button>
        )}

        {/* Mint Button */}
        {isEligibleForMint && canMint && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleMint}
            disabled={minting}
            className="w-full px-6 py-4 bg-gradient-to-r from-accent to-highlight text-black font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_30px_rgba(124,247,240,0.5)] transition-all"
          >
            {minting ? 'Minting...' : 'Mint as NFT'}
          </motion.button>
        )}

        {/* Share Section */}
        <ShareButtons 
          title={artwork.title}
          imageUrl={artwork.image_url}
          artworkId={artwork.id}
        />

        {/* Provenance Timeline */}
        <div className="p-6 bg-card/30 rounded-xl border border-white/10 backdrop-blur-sm">
          <h2 className="text-xl font-bold mb-4">Provenance Timeline</h2>
          <div className="space-y-4 relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-accent/20" />
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="flex gap-4 relative z-10"
            >
              <div className="flex flex-col items-center">
                <div className="w-4 h-4 rounded-full bg-accent shadow-lg shadow-accent/50" />
                <div className="w-0.5 h-full bg-accent/30 mt-2" />
              </div>
              <div className="flex-1 pb-6">
                <div className="font-semibold text-accent mb-1 flex items-center gap-2">
                  <span>📤</span>
                  <span>Uploaded</span>
                </div>
                <div className="text-sm text-gray-400">
                  {new Date(artwork.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
                <div className="text-xs text-gray-500 mt-1 font-mono">
                  Hash: {artwork.metadata_hash.slice(0, 16)}...
                </div>
              </div>
            </motion.div>

            {/* Vote milestones */}
            {artwork.vote_count >= 1 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex gap-4 relative z-10"
              >
                <div className="flex flex-col items-center">
                  <div className={`w-4 h-4 rounded-full ${artwork.vote_count >= 3 ? 'bg-highlight shadow-lg shadow-highlight/50' : 'bg-highlight/50'}`} />
                  <div className={`w-0.5 h-full ${artwork.minted ? 'bg-highlight/30' : 'bg-gray-700'} mt-2`} />
                </div>
                <div className="flex-1 pb-6">
                  <div className="font-semibold text-highlight mb-1 flex items-center gap-2">
                    <span>🗳️</span>
                    <span>Community Votes</span>
                  </div>
                  <div className="text-sm text-gray-400">
                    {artwork.vote_count} {artwork.vote_count === 1 ? 'vote' : 'votes'} received
                  </div>
                  {artwork.vote_count >= 1 && artwork.vote_count < 3 && (
                    <div className="text-xs text-highlight mt-1">→ {3 - artwork.vote_count} more needed for mint</div>
                  )}
                  {isEligibleForMint && (
                    <div className="text-xs text-accent mt-1">✓ Eligible for minting (3+ votes)</div>
                  )}
                </div>
              </motion.div>
            )}

            {artwork.minted ? (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex gap-4 relative z-10"
              >
                <div className="flex flex-col items-center">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-r from-accent to-highlight shadow-lg" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gradient bg-gradient-to-r from-accent to-highlight bg-clip-text text-transparent mb-1 flex items-center gap-2">
                    <span>🪙</span>
                    <span>Minted as NFT</span>
                  </div>
                  <div className="text-sm text-gray-400 mb-2">
                    Token ID: #{artwork.token_id}
                  </div>
                  {etherscanUrl && (
                    <a
                      href={etherscanUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-accent hover:underline inline-flex items-center gap-1"
                    >
                      View on Etherscan ↗
                    </a>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex gap-4 opacity-50 relative z-10"
              >
                <div className="flex flex-col items-center">
                  <div className="w-4 h-4 rounded-full bg-gray-600" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-500 mb-1">Not Minted</div>
                  <div className="text-sm text-gray-600">
                    Requires 3+ votes to mint
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Back Button */}
        <Link
          to="/gallery"
          className="text-center px-4 py-2 text-accent hover:underline"
        >
          ← Back to Gallery
        </Link>
      </motion.div>

      {/* Comments Section */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.2 }}
        className="md:col-span-2 mt-8"
      >
        <Comments artworkId={id!} />
      </motion.div>
    </div>
  );
}
