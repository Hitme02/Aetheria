import ArtworkCard from '../components/ArtworkCard';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { votingGet, votingPost } from '../lib/api';
import { getLoggedInWallet } from '../lib/auth';
import { useLocation, useNavigate } from 'react-router-dom';

type Artwork = { 
  id: number; 
  title: string; 
  image_url: string; 
  vote_count: number;
  creator_wallet?: string;
  minted?: boolean;
  token_id?: number;
};

export default function Featured() {
  const qc = useQueryClient();
  const { address } = useAccount();
  const loggedInWallet = getLoggedInWallet();
  const voterWallet = loggedInWallet?.startsWith('0x') ? loggedInWallet : address || '';
  const navigate = useNavigate();
  const location = useLocation();
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['featured'],
    queryFn: () => votingGet<{ count: number; artworks: Artwork[] }>(`/featured?n=20`).then(r => ({ artworks: r.artworks })),
    retry: 1,
    retryDelay: 2000,
    staleTime: 30000,
  });

  const vote = useMutation({
    mutationFn: (id: number) => {
      if (!voterWallet || voterWallet === '0x') {
        navigate('/login', { state: { from: location.pathname } });
        throw new Error('LOGIN_REDIRECT');
      }
      return votingPost('/vote', { artworkId: id, voterWallet });
    },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['featured'] });
      const prev = qc.getQueryData<{ artworks: Artwork[] }>(['featured']);
      if (prev) {
        // Optimistically update - we'll handle both increment and decrement
        // Actual update will come from the response
        qc.setQueryData(['featured'], prev);
      }
      return { prev };
    },
    onSuccess: (response, id) => {
      // Update based on action (added or removed)
      const prev = qc.getQueryData<{ artworks: Artwork[] }>(['featured']);
      if (prev && response.action) {
        qc.setQueryData(['featured'], {
          artworks: prev.artworks.map(a => 
            a.id === id 
              ? { ...a, vote_count: response.action === 'added' ? a.vote_count + 1 : Math.max(0, a.vote_count - 1) }
              : a
          ).sort((a, b) => b.vote_count - a.vote_count) // Re-sort by vote count
        });
      }
    },
    onError: (error: any, _id, ctx) => {
      ctx?.prev && qc.setQueryData(['featured'], ctx.prev);
      let msg: string;
      try { msg = error?.message || error?.error || String(error); } catch { msg = 'Unknown voting error'; }
      if (msg === 'LOGIN_REDIRECT') return;
      window.dispatchEvent(new CustomEvent('aetheria:toast', { detail: `Voting failed: ${msg}` } as any));
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['featured'] })
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-accent mb-4"></div>
          <p className="text-gray-400">Loading featured artworks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <p className="text-red-400 text-lg mb-2">Failed to load featured artworks</p>
          <p className="text-gray-400 text-sm mb-4">{errorMessage}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-accent text-black rounded-lg font-medium hover:bg-highlight transition-colors duration-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data?.artworks || data.artworks.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-400 text-xl mb-2">No featured artworks yet</p>
          <p className="text-gray-500 text-sm mb-4">Artworks will appear here once they receive votes!</p>
        </div>
      </div>
    );
  }

  const mintedArtworks = data.artworks.filter(a => a.minted);
  const otherArtworks = data.artworks.filter(a => !a.minted);

  return (
    <div className="space-y-8">
      {/* Minted Artworks Section */}
      {mintedArtworks.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span className="text-highlight">🪙</span>
            <span>Minted NFTs</span>
            <span className="text-sm text-gray-400 font-normal">({mintedArtworks.length})</span>
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {mintedArtworks.map(a => (
              <ArtworkCard 
                key={a.id} 
                id={a.id} 
                title={a.title} 
                imageUrl={a.image_url} 
                votes={a.vote_count}
                creatorWallet={a.creator_wallet}
                minted={a.minted}
                tokenId={a.token_id}
                onVote={() => vote.mutate(a.id)}
                onOpen={(id) => navigate(`/art/${id}`)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Other Featured Artworks */}
      {otherArtworks.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span className="text-accent">⭐</span>
            <span>Top Voted</span>
            <span className="text-sm text-gray-400 font-normal">({otherArtworks.length})</span>
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {otherArtworks.map(a => (
              <ArtworkCard 
                key={a.id} 
                id={a.id} 
                title={a.title} 
                imageUrl={a.image_url} 
                votes={a.vote_count}
                creatorWallet={a.creator_wallet}
                minted={a.minted}
                tokenId={a.token_id}
                onVote={() => vote.mutate(a.id)}
                onOpen={(id) => navigate(`/art/${id}`)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}