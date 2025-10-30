import { memo, Suspense } from 'react';
import { motion } from 'framer-motion';

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const titleVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.8,
      ease: [0.6, 0.05, 0.01, 0.9]
    }
  }
};

const subtitleVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.8,
      delay: 0.2,
      ease: [0.6, 0.05, 0.01, 0.9]
    }
  }
};

const Lottie = (props: any) => {
  const Comp = (window as any).__Lottie || null;
  if (!Comp) return null;
  return <Comp {...props} />;
};

function Hero() {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-card/60 to-card/20 hover:border-accent/30 transition-all duration-500">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="opacity-40 [mask-image:radial-gradient(50%_50%_at_50%_50%,black,transparent)]">
          <svg className="w-full h-64" preserveAspectRatio="none" viewBox="0 0 1200 400">
            <defs>
              <linearGradient id="g" x1="0" x2="1">
                <stop offset="0%" stopColor="#7cf7f0"/>
                <stop offset="100%" stopColor="#ffc857"/>
              </linearGradient>
            </defs>
            <path d="M0,300 C300,200 900,400 1200,250 L1200,400 L0,400 Z" fill="url(#g)" />
          </svg>
        </div>
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-transparent to-highlight/5 animate-pulse" />
      </div>
      <div className="px-6 py-20 text-center relative">
        <motion.h1 
          variants={titleVariants} 
          initial="hidden" 
          animate="visible" 
          className="text-5xl md:text-7xl font-black tracking-tight bg-gradient-to-r from-white via-accent to-white bg-clip-text text-transparent"
        >
          Curate the Infinite
        </motion.h1>
        <motion.p 
          variants={subtitleVariants} 
          initial="hidden" 
          animate="visible" 
          className="mt-6 text-xl text-gray-300 max-w-2xl mx-auto"
        >
          Aetheria brings artists and collectors together with a cinematic, on-chain experience.
        </motion.p>
        
        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-8"
        >
          <button className="group relative px-8 py-4 bg-accent/10 hover:bg-accent/20 border border-accent/50 hover:border-accent rounded-lg font-bold text-accent hover:text-white transition-all duration-300 hover:shadow-[0_0_30px_rgba(124,247,240,0.4)] hover:scale-105">
            <span className="relative z-10">Explore Gallery</span>
            <div className="absolute inset-0 rounded-lg bg-accent/20 opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
          </button>
        </motion.div>
      </div>
      <Suspense fallback={null}>
        <div className="absolute bottom-4 right-4 w-24 h-24 opacity-70" aria-hidden>
          <Lottie loop play src="/lottie/particles.json" />
        </div>
      </Suspense>
    </section>
  );
}

export default memo(Hero);
