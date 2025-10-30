import { useEffect, useState } from 'react';

export default function Toasts() {
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => {
    const handler = (e: any) => setMsg(e.detail);
    window.addEventListener('aetheria:toast' as any, handler as any);
    return () => window.removeEventListener('aetheria:toast' as any, handler as any);
  }, []);
  if (!msg) return null;
  return (
    <div role="status" aria-live="polite" className="fixed bottom-4 right-4 px-4 py-2 rounded-md bg-card border border-white/10">
      {msg}
    </div>
  );
}
