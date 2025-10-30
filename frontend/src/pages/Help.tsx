import { motion } from 'framer-motion';
import { useState } from 'react';
import { fadeInUp } from '../lib/animations';

type FAQItem = {
  question: string;
  answer: string;
};

const keyConcepts = [
  {
    icon: '🎨',
    term: 'Artwork Upload',
    definition: 'Submit your AI-generated art with metadata (title, description, prompt, AI model). Each upload is automatically hashed with SHA-256 for authenticity proof.',
  },
  {
    icon: '🔐',
    term: 'Authentication',
    definition: 'Sign in with your Web3 wallet or email. Wallet login uses signature verification for secure, decentralized identity.',
  },
  {
    icon: '🗳️',
    term: 'Community Voting',
    definition: 'Community members vote on artworks they love. One vote per wallet per artwork. Votes determine which pieces get minted as NFTs.',
  },
  {
    icon: '🪙',
    term: 'Minting Threshold',
    definition: 'Artworks need 10+ votes to become eligible for minting. The creator can then mint it as an on-chain NFT with full provenance.',
  },
  {
    icon: '📜',
    term: 'Provenance Timeline',
    definition: 'Each artwork has a complete history: upload timestamp, vote count progression, mint transaction hash, and on-chain token ID.',
  },
  {
    icon: '💎',
    term: 'NFT Creation',
    definition: 'Minted artworks become ERC-721 NFTs on the blockchain. Ownership, transaction history, and metadata are permanently recorded.',
  },
];

const typicalFlows = [
  {
    icon: '🔐',
    title: '1) Sign in & connect',
    description: 'Use wallet connection or email to authenticate. Wallet login requires signing a message to verify ownership.',
  },
  {
    icon: '📤',
    title: '2) Upload artwork',
    description: 'Drag & drop your image, fill in title, description, AI prompt (optional), and select AI model. SHA-256 hash is computed automatically.',
  },
  {
    icon: '👁️',
    title: '3) Community discovers',
    description: 'Your artwork appears in the gallery with "Pending Review" status. Other users can browse and vote on pieces they love.',
  },
  {
    icon: '✅',
    title: '4) Reach threshold',
    description: 'Once your artwork gets 10+ votes, it shows an "Eligible for Mint" badge. You (the creator) can then mint it as an NFT.',
  },
  {
    icon: '🪙',
    title: '5) Mint as NFT',
    description: 'Click "Mint as NFT" to create an on-chain record. The transaction creates a unique token ID and stores metadata permanently.',
  },
  {
    icon: '📊',
    title: '6) View provenance',
    description: 'Click any artwork to see its full history: upload date, votes received, mint status, transaction hash, and Etherscan link.',
  },
];

const faqs: FAQItem[] = [
  {
    question: 'Do I need a crypto wallet to use Aetheria?',
    answer: 'No! You can use email authentication for a simplified experience. However, wallet connection enables claiming your artworks and provides better anonymity.',
  },
  {
    question: 'How does voting work?',
    answer: 'Each wallet or email account can vote once per artwork. Votes are counted off-chain initially, with signatures for verification. Vote counts update in real-time.',
  },
  {
    question: 'What happens when I upload?',
    answer: 'Your image is uploaded to Supabase Storage, a SHA-256 hash is computed for authenticity proof, and metadata is stored in the database. The artwork appears in the gallery immediately.',
  },
  {
    question: 'Can I edit or delete my uploaded artwork?',
    answer: 'Currently, artworks cannot be edited or deleted after upload to maintain provenance integrity. This ensures the historical record remains accurate.',
  },
  {
    question: 'What blockchain does Aetheria use?',
    answer: 'Aetheria supports Ethereum Sepolia (testnet) and Polygon Amoy (testnet). NFTs are minted as ERC-721 tokens on your selected chain.',
  },
  {
    question: 'How much does it cost to mint?',
    answer: 'Minting fees depend on current gas prices on your selected blockchain. On testnets, these costs are minimal or covered by faucets.',
  },
  {
    question: 'What makes an artwork "Eligible for Mint"?',
    answer: 'An artwork becomes eligible when it receives 10 or more community votes. Only the creator (the wallet that uploaded it) can mint it.',
  },
  {
    question: 'Can I sell my minted NFT?',
    answer: 'Minted NFTs are standard ERC-721 tokens, so they can be transferred or sold on any compatible marketplace like OpenSea, Blur, or others.',
  },
  {
    question: 'What is SHA-256 hashing?',
    answer: 'SHA-256 creates a unique fingerprint of your artwork file. This proves authenticity and prevents duplicates. Even tiny changes to the image create a completely different hash.',
  },
  {
    question: 'How do I view my uploaded artworks?',
    answer: 'All your uploaded artworks appear in the Gallery. You can also use the Dashboard (coming soon) to see your collection and vote history.',
  },
];

function FAQAccordion({ faqs }: { faqs: FAQItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {faqs.map((faq, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
              className="border border-white/10 rounded-xl bg-card/30 backdrop-blur-sm overflow-hidden"
        >
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
          >
            <span className="font-semibold text-white pr-4">{faq.question}</span>
            <motion.span
              animate={{ rotate: openIndex === index ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="flex-shrink-0 text-2xl text-gray-400"
            >
              ▼
            </motion.span>
          </button>
          <motion.div
            initial={false}
            animate={{
              height: openIndex === index ? 'auto' : 0,
              opacity: openIndex === index ? 1 : 0,
            }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-6 py-4 text-gray-300 border-t border-white/10 leading-relaxed">
              {faq.answer}
            </div>
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}

export default function Help() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Welcome Section */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="p-6 rounded-xl bg-card/30 border border-white/10 backdrop-blur-sm"
      >
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">⚡</span>
          <h1 className="text-3xl font-bold">Welcome</h1>
        </div>
        <p className="text-gray-300 text-lg leading-relaxed">
          Curating AI-generated art with community validation — on-chain. This guide highlights the core concepts and shows where to click next.
        </p>
      </motion.div>

      {/* Key Concepts Section */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.1 }}
        className="p-6 rounded-xl bg-card/30 border border-white/10 backdrop-blur-sm"
      >
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">📖</span>
          <h2 className="text-3xl font-bold">Key Concepts</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {keyConcepts.map((concept, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="p-4 rounded-lg bg-card/20 border border-white/5 hover:border-accent/30 transition-all duration-300"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">{concept.icon}</span>
                <div>
                  <h3 className="font-semibold text-white mb-1">{concept.term}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{concept.definition}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Typical Flows Section */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.2 }}
        className="p-6 rounded-xl bg-card/30 border border-white/10 backdrop-blur-sm"
      >
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">⚙️</span>
          <h2 className="text-3xl font-bold">Typical Flows</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {typicalFlows.map((flow, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="p-4 rounded-lg bg-card/30 border border-white/5 hover:border-highlight/30 transition-all duration-300"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">{flow.icon}</span>
                <div>
                  <h3 className="font-semibold text-white mb-1">{flow.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{flow.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* FAQ Section */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.3 }}
        className="p-6 rounded-xl bg-card/30 border border-white/10 backdrop-blur-sm"
      >
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">❓</span>
          <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
        </div>
        <FAQAccordion faqs={faqs} />
      </motion.div>
    </div>
  );
}

