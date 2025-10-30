import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function EmailLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          // Store email in localStorage for session management
          localStorage.setItem('aetheria_token', `email:${data.user.email}`);
          setMessage('Account created! Check your email to verify.');
          window.dispatchEvent(new CustomEvent('aetheria:toast', { detail: 'Sign up successful!' } as any));
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          localStorage.setItem('aetheria_token', `email:${data.user.email}`);
          setMessage('Login successful!');
          window.dispatchEvent(new CustomEvent('aetheria:toast', { detail: 'Login successful!' } as any));
          
          // Redirect to gallery after a brief delay
          setTimeout(() => {
            window.location.href = '/gallery';
          }, 1000);
        }
      }
    } catch (error: any) {
      setMessage(error.message || 'Authentication failed');
      window.dispatchEvent(new CustomEvent('aetheria:toast', { detail: error.message || 'Error' } as any));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 rounded-xl bg-card/30 border border-white/10 backdrop-blur-sm">
      <h2 className="text-xl font-semibold mb-2">Email Login</h2>
      <p className="text-sm text-gray-300 mb-4">
        {isSignUp ? 'Create an account with email' : 'Sign in with your email'}
      </p>

      <form onSubmit={handleEmailAuth} className="space-y-4">
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="w-full px-4 py-2 rounded-md bg-card/30 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent backdrop-blur-sm"
          />
        </div>
        <div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            minLength={6}
            className="w-full px-4 py-2 rounded-md bg-card/30 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent backdrop-blur-sm"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-highlight text-black rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-highlight/90 transition-colors"
        >
          {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Sign In'}
        </button>
      </form>

      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-sm text-accent hover:underline"
        >
          {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
        </button>
      </div>

      {message && (
        <div className={`mt-4 p-3 rounded-md text-sm ${
          message.includes('successful') || message.includes('created')
            ? 'bg-green-500/20 text-green-400'
            : 'bg-red-500/20 text-red-400'
        }`}>
          {message}
        </div>
      )}
    </div>
  );
}

