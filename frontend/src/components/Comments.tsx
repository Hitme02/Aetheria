import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAccount } from 'wagmi';
import { Link } from 'react-router-dom';
import { getLoggedInWallet, formatWallet } from '../lib/auth';
import { fadeInUp } from '../lib/animations';

type Comment = {
  id: string;
  artwork_id: string;
  user_wallet: string;
  text: string;
  created_at: string;
  parent_id: string | null;
};

type CommentsProps = {
  artworkId: string;
};

export default function Comments({ artworkId }: CommentsProps) {
  const { address } = useAccount();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const wallet = getLoggedInWallet() || address;

  useEffect(() => {
    // Fetch initial comments
    loadComments();

    // Subscribe to new comments
    const channel = supabase
      .channel(`comments:${artworkId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'comments',
        filter: `artwork_id=eq.${artworkId}`
      }, () => {
        loadComments();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [artworkId]);

  const loadComments = async () => {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('artwork_id', artworkId)
      .is('parent_id', null) // Only top-level comments for now
      .order('created_at', { ascending: false });

    if (!error && data) {
      setComments(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !wallet) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          artwork_id: artworkId,
          user_wallet: wallet.toLowerCase(),
          text: newComment.trim()
        });

      if (!error) {
        setNewComment('');
        loadComments();
      } else {
        // Check if table doesn't exist
        if (error.message.includes('could not find') || error.message.includes('does not exist')) {
          window.dispatchEvent(new CustomEvent('aetheria:toast', {
            detail: 'Comments feature requires database setup. Please run migrations.sql in Supabase.'
          } as any));
        } else {
          window.dispatchEvent(new CustomEvent('aetheria:toast', {
            detail: `Failed to post comment: ${error.message}`
          } as any));
        }
      }
    } catch (err: any) {
      window.dispatchEvent(new CustomEvent('aetheria:toast', {
        detail: `Error: ${err.message || 'Please run database migrations'}` 
      } as any));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">Comments</h3>

      {/* Comment Form */}
      {wallet ? (
        <form onSubmit={handleSubmit} className="space-y-2">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            rows={3}
            className="w-full px-4 py-2 rounded-lg bg-card/30 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent resize-none"
            required
          />
          <div className="flex justify-end">
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading || !newComment.trim()}
              className="px-4 py-2 bg-accent text-black rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent/90 transition-colors"
            >
              {loading ? 'Posting...' : 'Post Comment'}
            </motion.button>
          </div>
        </form>
      ) : (
        <div className="p-4 rounded-lg bg-card/30 border border-white/10 text-center text-gray-400">
          <Link to="/login" className="text-accent hover:underline">
            Sign in
          </Link>
          {' '}to comment
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        <AnimatePresence>
          {comments.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No comments yet. Be the first!</p>
          ) : (
            comments.map((comment) => (
              <motion.div
                key={comment.id}
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="p-4 rounded-lg bg-card/30 border border-white/10"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-accent font-mono text-sm">
                      {formatWallet(comment.user_wallet)}
                    </span>
                    <span className="text-gray-500 text-xs">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <p className="text-gray-300 whitespace-pre-wrap">{comment.text}</p>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

