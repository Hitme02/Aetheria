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

export default function Gallery() {
  const qc = useQueryClient();
  const { address } = useAccount();
  const loggedInWallet = getLoggedInWallet();
  const voterWallet = loggedInWallet?.startsWith('0x') ? loggedInWallet : address || '';
  const navigate = useNavigate();
  const location = useLocation();
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['artworks'],
    queryFn: () => votingGet<{ count: number; artworks: Artwork[] }>(`/featured?n=12`).then(r => ({ artworks: r.artworks })),
    retry: 1,
    retryDelay: 2000,
    staleTime: 30000, // Consider data fresh for 30 seconds
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
      await qc.cancelQueries({ queryKey: ['artworks'] });
      const prev = qc.getQueryData<{ artworks: Artwork[] }>(['artworks']);
      if (prev) {
        qc.setQueryData(['artworks'], {
          artworks: prev.artworks.map(a => a.id === id ? { ...a, vote_count: a.vote_count + 1 } : a)
        });
      }
      return { prev };
    },
    onError: (error: any, _id, ctx) => {
      // Revert optimistic update
      ctx?.prev && qc.setQueryData(['artworks'], ctx.prev);
      let msg: string;
      try { msg = error?.message || error?.error || String(error); } catch { msg = 'Unknown voting error'; }
      if (msg === 'LOGIN_REDIRECT') return; // no toast; we already redirected
      window.dispatchEvent(new CustomEvent('aetheria:toast', { detail: `Voting failed: ${msg}` } as any));
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['artworks'] })
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-accent mb-4"></div>
          <p className="text-gray-400">Loading gallery...</p>
        </div>
      </div>
    );
  }

  if (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const isConnectionError = errorMessage.toLowerCase().includes('timeout') || 
                              errorMessage.toLowerCase().includes('network') ||
                              errorMessage.toLowerCase().includes('invalid api url');
    
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <p className="text-red-400 text-lg mb-2">Failed to load gallery</p>
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
          <p className="text-gray-400 text-xl mb-2">Gallery is empty</p>
          <p className="text-gray-500 text-sm mb-4">Be the first to upload artwork!</p>
          <button
            onClick={() => navigate('/upload')}
            className="px-6 py-3 bg-accent text-black rounded-lg font-medium hover:bg-highlight transition-colors duration-200"
          >
            Upload Artwork
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {data.artworks.map(a => (
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
  );
}
