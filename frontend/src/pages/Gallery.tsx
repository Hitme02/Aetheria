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
  
  const { data } = useQuery({
    queryKey: ['artworks'],
    queryFn: () => votingGet<{ count: number; artworks: Artwork[] }>(`/featured?n=12`).then(r => ({ artworks: r.artworks }))
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

  return (
    <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {data?.artworks?.map(a => (
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
          onOpen={(id) => window.location.href = `/art/${id}`}
        />
      ))}
    </div>
  );
}
