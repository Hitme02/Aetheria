import { useState } from 'react';
import { motion } from 'framer-motion';
import LoginCard from '../components/LoginCard';
import EmailLogin from '../components/EmailLogin';
import { fadeInUp } from '../lib/animations';

export default function Login() {
  const [authMethod, setAuthMethod] = useState<'wallet' | 'email'>('wallet');

  return (
    <div className="max-w-2xl mx-auto grid gap-8">
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="text-center"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-3">
          Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-highlight">Aetheria</span>
        </h1>
        <p className="text-gray-400 text-lg">
          Enter the decentralized museum
        </p>
      </motion.div>

      {/* Auth Method Toggle */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="flex gap-2 p-1 bg-card/30 rounded-xl border border-white/10 backdrop-blur-sm"
      >
        <button
          onClick={() => setAuthMethod('wallet')}
          className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
            authMethod === 'wallet'
              ? 'bg-accent text-black shadow-lg'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          🔐 Connect Wallet
        </button>
        <button
          onClick={() => setAuthMethod('email')}
          className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
            authMethod === 'email'
              ? 'bg-highlight text-black shadow-lg'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          📧 Email Login
        </button>
      </motion.div>

      {/* Auth Forms */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        key={authMethod}
      >
        {authMethod === 'wallet' ? (
          <div>
            <p className="text-sm text-gray-400 mb-4 text-center">
              Connect your Web3 wallet to authenticate and claim your artworks
            </p>
            <LoginCard />
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-400 mb-4 text-center">
              Sign in with email for a simplified experience (no crypto required)
            </p>
            <EmailLogin />
          </div>
        )}
      </motion.div>
    </div>
  );
}

