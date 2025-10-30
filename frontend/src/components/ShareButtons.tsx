import { motion } from 'framer-motion';
import { useState } from 'react';
import { fadeInUp } from '../lib/animations';

type ShareButtonsProps = {
  title: string;
  imageUrl: string;
  artworkId: string | number;
  url?: string;
};

export default function ShareButtons({ title, imageUrl, artworkId, url }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = url || `${window.location.origin}/art/${artworkId}`;
  const shareText = `Check out "${title}" on Aetheria - The Decentralized Museum 🎨`;

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
    farcaster: `https://warpcast.com/~/compose?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`,
    lens: `https://hey.xyz/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`,
    // Note: Instagram and Threads require app-based sharing or manual copy
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      handleCopy();
    }
  };

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      <h3 className="text-lg font-semibold">Share Artwork</h3>
      
      <div className="flex flex-wrap gap-3">
        {/* Native Share */}
        {navigator.share && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNativeShare}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card/30 border border-white/10 hover:border-accent/50 transition-all"
          >
            <span>📤</span>
            <span>Share</span>
          </motion.button>
        )}

        {/* Twitter/X */}
        <motion.a
          href={shareLinks.twitter}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card/30 border border-white/10 hover:border-accent/50 transition-all"
        >
          <span>𝕏</span>
          <span>Twitter</span>
        </motion.a>

        {/* Farcaster */}
        <motion.a
          href={shareLinks.farcaster}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card/30 border border-white/10 hover:border-highlight/50 transition-all"
        >
          <span>🔵</span>
          <span>Farcaster</span>
        </motion.a>

        {/* Lens */}
        <motion.a
          href={shareLinks.lens}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card/30 border border-white/10 hover:border-accent/50 transition-all"
        >
          <span>🌿</span>
          <span>Lens</span>
        </motion.a>

        {/* Copy Link */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCopy}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
            copied
              ? 'bg-accent/20 border-accent text-accent'
              : 'bg-card/30 border-white/10 hover:border-accent/50'
          }`}
        >
          <span>{copied ? '✓' : '📋'}</span>
          <span>{copied ? 'Copied!' : 'Copy Link'}</span>
        </motion.button>
      </div>

      {/* URL Display */}
      <div className="p-3 rounded-lg bg-card/20 border border-white/10">
        <p className="text-xs text-gray-400 mb-1">Share URL:</p>
        <p className="text-sm font-mono text-gray-300 break-all">{shareUrl}</p>
      </div>
    </motion.div>
  );
}

