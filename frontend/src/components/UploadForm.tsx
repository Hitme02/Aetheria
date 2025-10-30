import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { apiUpload } from '../lib/api';
import { useAccount } from 'wagmi';
import { isLoggedIn, getLoggedInWallet, getArtistName } from '../lib/auth';
import TagInput from './TagInput';
import { hashPrompt, checkPromptDuplicate } from '../lib/promptVerification';

type UploadResult = { artworkId: string | number; hash: string; image_url: string; title: string; description: string };

async function sha256(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const digest = await crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export default function UploadForm() {
  const { address, isConnected } = useAccount();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [prompt, setPrompt] = useState('');
  const [aiModel, setAiModel] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [hashPreview, setHashPreview] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [promptWarning, setPromptWarning] = useState<string | null>(null);
  const [duplicateArtworkId, setDuplicateArtworkId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const aiModels = ['DALL·E', 'Midjourney', 'Stable Diffusion', 'Other'];

  // Check login status
  useEffect(() => {
    setLoggedIn(isLoggedIn());
  }, []);

  // Get creator wallet: logged in user > connected wallet > anonymous
  const creatorWallet = loggedIn ? (getLoggedInWallet() || address || '0x') : (address || '0x');
  const artistName = getArtistName(creatorWallet);

  const onDrop = async (f: File) => {
    setFile(f);
    setProgress(0);
    const hash = await sha256(f);
    setHashPreview(hash);
  };

  const onSubmit = async () => {
    if (!file || !title.trim() || !description.trim()) return;
    
    setProgress(10);
    const form = new FormData();
    form.append('file', file);
    form.append('title', title.trim());
    form.append('description', description.trim());
    if (prompt.trim()) form.append('prompt', prompt.trim());
    if (aiModel.trim()) form.append('ai_model', aiModel.trim());
    if (tags.length > 0) form.append('tags', JSON.stringify(tags));
    form.append('creator_wallet', creatorWallet.toLowerCase());
    setProgress(35);
    
    try {
      const res = await apiUpload<UploadResult>('/upload', form);
      setProgress(90);
      setResult(res);
      setProgress(100);
      window.dispatchEvent(new CustomEvent('aetheria:toast', { 
        detail: `Upload complete! Artwork ID: ${res.artworkId}` 
      } as any));
      
      // Reset form
      setFile(null);
      setTitle('');
      setDescription('');
      setPrompt('');
      setAiModel('');
      setTags([]);
      setHashPreview(null);
      setProgress(0);
      setDuplicateArtworkId(null);
    } catch (error: any) {
      setProgress(0);
      // Special handling for duplicate
      let parsed;
      try { parsed = JSON.parse(error.message); } catch {}
      if ((parsed && parsed.duplicate && parsed.existingArtworkId) || (error?.duplicate && error?.existingArtworkId)) {
        const artworkId = parsed?.existingArtworkId || error?.existingArtworkId;
        setDuplicateArtworkId(artworkId);
        window.dispatchEvent(new CustomEvent('aetheria:toast', { detail: `Duplicate artwork found. View it instead.` } as any));
        return;
      }
      window.dispatchEvent(new CustomEvent('aetheria:toast', { 
        detail: `Upload failed: ${error.message || 'Unknown error'}` 
      } as any));
    }
  };

  return (
    <div className="grid gap-6">
      {/* Artist Info Banner */}
      <div className="rounded-xl p-4 border border-white/10 bg-card/30 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400 mb-1">Uploading as:</p>
            <p className="text-lg font-semibold text-accent">
              {loggedIn ? (
                <span className="flex items-center gap-2">
                  <span>✓</span>
                  <span>{artistName}</span>
                  <span className="text-xs text-gray-400 font-normal">(Logged in)</span>
                </span>
              ) : isConnected ? (
                <span className="flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{artistName}</span>
                  <span className="text-xs text-yellow-400 font-normal">(Wallet only)</span>
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span>👤</span>
                  <span className="text-gray-400">Anonymous Artist</span>
                  <span className="text-xs text-yellow-400 font-normal">(Not logged in)</span>
                </span>
              )}
            </p>
          </div>
          {!loggedIn && (
            <Link
              to="/login"
              className="px-4 py-2 bg-accent hover:bg-accent/90 text-black rounded-md text-sm font-medium transition-colors"
            >
              Login as Artist
            </Link>
          )}
        </div>
        
        {!loggedIn && !isConnected && (
          <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-md">
            <p className="text-xs text-yellow-400">
              ⚠️ You're uploading anonymously. <Link to="/login" className="underline">Login</Link> to claim your artwork and build your artist profile.
            </p>
          </div>
        )}
      </div>

      <div
        className="rounded-xl p-6 text-center border-dashed border-2 border-white/10 bg-card/30 backdrop-blur-sm"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const f = e.dataTransfer.files?.[0];
          if (f) onDrop(f);
        }}
      >
        <p className="text-gray-300">Drag & drop your artwork here, or</p>
        <button className="mt-2 px-4 py-2 bg-accent text-black rounded-md" onClick={() => inputRef.current?.click()}>
          Browse files
        </button>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onDrop(e.target.files[0])} />
      </div>

      {file && (
        <div className="grid gap-4">
          <img src={URL.createObjectURL(file)} alt="Preview" className="max-h-96 w-full object-contain rounded-lg bg-card/30" />
          <div className="grid gap-3">
            <input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Title *" 
              required
              className="px-3 py-2 rounded-md bg-card/30 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent backdrop-blur-sm" 
            />
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Description *" 
              required
              rows={3}
              className="px-3 py-2 rounded-md bg-card border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent resize-none" 
            />
            <div>
              <input 
                value={prompt} 
                onChange={(e) => setPrompt(e.target.value)}
                onBlur={async () => {
                  if (prompt.trim()) {
                    try {
                      const hash = await hashPrompt(prompt.trim());
                      const check = await checkPromptDuplicate(hash);
                      if (check.isDuplicate) {
                        setPromptWarning('⚠️ This prompt has been used before. Original artwork may exist.');
                      } else {
                        setPromptWarning(null);
                      }
                    } catch (error) {
                      // Silently fail - don't break the form
                      console.error('Prompt check error:', error);
                    }
                  }
                }}
                placeholder="AI Prompt (optional)" 
                className="px-3 py-2 rounded-md bg-card/30 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent backdrop-blur-sm w-full" 
              />
              {promptWarning && (
                <p className="mt-2 text-xs text-yellow-400 flex items-center gap-1">
                  {promptWarning}
                </p>
              )}
            </div>
            <select
              value={aiModel}
              onChange={(e) => setAiModel(e.target.value)}
              className="px-3 py-2 rounded-md bg-card/30 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-accent backdrop-blur-sm"
            >
              <option value="">AI Model (optional)</option>
              {aiModels.map(model => (
                <option key={model} value={model} className="bg-card/30">{model}</option>
              ))}
            </select>
            <TagInput selectedTags={tags} onChange={setTags} />
          </div>
          {hashPreview && (
            <div className="p-3 bg-card/30 rounded-md border border-white/10">
              <p className="text-xs text-gray-400 mb-1">File Hash:</p>
              <p className="text-xs font-mono text-accent break-all">{hashPreview}</p>
            </div>
          )}
          
          <div aria-live="polite" className="text-sm text-gray-300">
            {progress > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-card/30 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-accent h-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span>{progress}%</span>
              </div>
            )}
          </div>
          
          <motion.button 
            whileTap={{ scale: 0.98 }} 
            className={`px-6 py-3 bg-highlight text-black rounded-md font-semibold transition-all ${
              !file || !title.trim() || !description.trim() 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-highlight/90 hover:shadow-[0_0_20px_rgba(255,200,87,0.3)]'
            }`}
            onClick={onSubmit}
            disabled={!file || !title.trim() || !description.trim()}
          >
            Upload Artwork
          </motion.button>
          
          {!loggedIn && (
            <p className="text-xs text-gray-500 text-center">
              Artwork will be attributed to: <span className="font-mono">{creatorWallet}</span>
            </p>
          )}
        </div>
      )}

      {result && (
        <div className="p-4 rounded-lg bg-card/30 border border-white/10 backdrop-blur-sm">
          <p className="text-sm">Uploaded: {result.title}</p>
        </div>
      )}
      {duplicateArtworkId && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-rose-900/70 p-6 rounded-xl border border-rose-500/40 shadow-glow text-center my-4"
        >
          <div className="text-lg font-bold text-rose-300 mb-2">
            Duplicate artwork detected
          </div>
          <div className="mb-4 text-gray-300">
            This image already exists in the database.
          </div>
          <a
            href={`/art/${duplicateArtworkId}`}
            className="text-accent font-medium underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            View existing artwork
          </a>
          <button className="ml-4 px-3 py-1 rounded bg-highlight text-black font-semibold" onClick={() => setDuplicateArtworkId(null)}>
            Dismiss
          </button>
        </motion.div>
      )}
    </div>
  );
}
