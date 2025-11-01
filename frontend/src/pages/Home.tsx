import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { staggerContainer, fadeInUp } from '../lib/animations';

const stepIcons = [
  { icon: '🔐', gradient: 'from-accent to-accent/80' },
  { icon: '📤', gradient: 'from-accent to-highlight' },
  { icon: '👁️', gradient: 'from-highlight to-highlight/80' },
  { icon: '🗳️', gradient: 'from-highlight to-accent' },
  { icon: '🪙', gradient: 'from-accent to-highlight' },
  { icon: '📜', gradient: 'from-highlight to-accent' },
];

const steps = [
  {
    title: 'Connect & Authenticate',
    description: 'Sign in with your Web3 wallet or email to start your artistic journey.',
  },
  {
    title: 'Upload Artwork',
    description: 'Submit your AI-generated art with title, description, prompt, and AI model used.',
  },
  {
    title: 'Prove Authenticity',
    description: 'SHA-256 hash is computed automatically, creating cryptographic proof of your artwork.',
  },
  {
    title: 'Community Votes',
    description: 'The community discovers and votes on artworks they love, curating the gallery.',
  },
  {
    title: 'Mint as NFT',
    description: 'Top-voted artworks (3+ votes) can be minted on-chain with full provenance.',
  },
  {
    title: 'View Provenance',
    description: 'See the complete timeline: upload → votes → mint → on-chain record.',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen pb-20">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-sm text-gray-400 mb-6 tracking-wide uppercase"
          >
            A simple path from AI art to on-chain NFTs. Transparent. Verifiable. Decentralized.
          </motion.p>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tight"
          >
            <span className="bg-gradient-to-r from-accent via-white to-highlight bg-clip-text text-transparent">
              Aetheria
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-xl md:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto font-light leading-relaxed"
          >
            The Decentralized Museum
            <br />
            <span className="text-lg text-gray-400">
              Community-curated digital art with authentic provenance
            </span>
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link
              to="/login"
              className="group relative px-8 py-4 bg-gradient-to-r from-accent to-highlight rounded-lg font-semibold text-black text-lg transition-all duration-300 hover:shadow-[0_0_30px_rgba(124,247,240,0.4)] hover:scale-105"
            >
              <span className="relative z-10 flex items-center gap-2">
                Get Started
              </span>
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 bg-card/30 border border-white/20 rounded-lg font-medium text-white hover:bg-card/50 transition-all duration-300"
            >
              Go to Login
            </Link>
          </motion.div>
        </div>
      </section>

      {/* How it works Section */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            How it works
          </h2>
          <p className="text-xl text-gray-400 font-light">
            Six simple steps from upload to on-chain NFT.
          </p>
        </motion.div>

        {/* Steps Grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {steps.map((step, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ duration: 0.2 }}
              className="group relative p-6 rounded-xl bg-card/30 border border-white/10 hover:border-accent/50 transition-all duration-300 cursor-pointer backdrop-blur-sm"
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`flex-shrink-0 w-14 h-14 rounded-lg bg-gradient-to-br ${stepIcons[index].gradient} flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {stepIcons[index].icon}
                </div>
                
                {/* Content */}
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2 text-white group-hover:text-accent transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
              
              {/* Step Number */}
              <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-card border border-white/20 flex items-center justify-center text-xs font-bold text-gray-400">
                {index + 1}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Bottom CTA & Quick Facts */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Ready to start */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h3 className="text-3xl font-bold">Ready to contribute?</h3>
            <p className="text-gray-300 text-lg font-light leading-relaxed">
              Log in and start sharing your artwork. When it gets 3+ votes, mint it as an NFT with full provenance.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-accent to-highlight rounded-lg font-semibold text-black hover:shadow-[0_0_20px_rgba(124,247,240,0.3)] transition-all duration-300 hover:scale-105"
            >
              Go to Login
            </Link>
          </motion.div>

          {/* Quick facts */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h3 className="text-3xl font-bold">Quick facts</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="text-accent mt-1">✓</span>
                <span className="text-gray-300 font-light">
                  <strong className="text-white font-medium">SHA-256 proof</strong> of artwork authenticity
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-accent mt-1">✓</span>
                <span className="text-gray-300 font-light">
                  <strong className="text-white font-medium">Community curation</strong> through decentralized voting
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-accent mt-1">✓</span>
                <span className="text-gray-300 font-light">
                  <strong className="text-white font-medium">On-chain NFTs</strong> with full provenance timeline
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-accent mt-1">✓</span>
                <span className="text-gray-300 font-light">
                  <strong className="text-white font-medium">Wallet or email</strong> authentication options
                </span>
              </li>
            </ul>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
