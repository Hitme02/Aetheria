import { useAccount, useSignMessage } from 'wagmi';
import { authGet, authPost } from '../lib/api';
import { useState } from 'react';

export default function LoginCard() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [status, setStatus] = useState<string>('');

  const login = async () => {
    if (!address) return;
    
    try {
      setStatus('Requesting nonce...');
      const { nonce } = await authGet<{ nonce: string }>(`/nonce?wallet=${address}`);
      
      if (!nonce) {
        setStatus('Error: No nonce received');
        window.dispatchEvent(new CustomEvent('aetheria:toast', { detail: 'Failed to get nonce' } as any));
        return;
      }
      
      const message = `Sign this message to authenticate with Aetheria:\nNonce: ${nonce}`;
      setStatus('Awaiting signature...');
      const signature = await signMessageAsync({ message });
      
      setStatus('Verifying...');
      const res = await authPost<{ success: boolean; user: any }>(`/verify`, { wallet: address, signature });
      
      if ((res as any).success !== false) {
        localStorage.setItem('aetheria_token', address);
        setStatus('Logged in');
        window.dispatchEvent(new CustomEvent('aetheria:toast', { detail: 'Login success' } as any));
        // Redirect to gallery after successful login
        setTimeout(() => {
          window.location.href = '/gallery';
        }, 1000);
      } else {
        setStatus('Verification failed');
        window.dispatchEvent(new CustomEvent('aetheria:toast', { detail: 'Login failed' } as any));
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMsg = error?.message || 'Login failed. Check console for details.';
      setStatus(`Error: ${errorMsg}`);
      window.dispatchEvent(new CustomEvent('aetheria:toast', { detail: errorMsg } as any));
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 rounded-xl bg-card/30 border border-white/10 backdrop-blur-sm">
      <h2 className="text-xl font-semibold mb-2">Wallet Login</h2>
      <p className="text-sm text-gray-300 mb-4">Authenticate with your connected wallet.</p>
      <button className="px-4 py-2 bg-accent text-black rounded-md disabled:opacity-50" onClick={login} disabled={!isConnected}>
        {isConnected ? 'Sign to login' : 'Connect wallet above'}
      </button>
      <div className="mt-3 text-sm text-gray-400" aria-live="polite">{status}</div>
    </div>
  );
}

