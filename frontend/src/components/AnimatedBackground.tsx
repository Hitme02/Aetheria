import { memo } from 'react';

const AnimatedBackground = () => {
  return (
    <>
      {/* Background layer - visible atmospheric glow */}
      <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none" aria-hidden="true">
        {/* Large glowing orbs - MORE VISIBLE */}
        <div 
          className="absolute top-[5%] left-[10%] w-[1400px] h-[1400px] rounded-full animate-float-slow"
          style={{ 
            background: 'radial-gradient(circle, rgba(124, 247, 240, 0.25) 0%, rgba(124, 247, 240, 0.12) 50%, transparent 100%)',
            filter: 'blur(100px)'
          }} 
        />
        
        <div 
          className="absolute top-[40%] right-[10%] w-[1200px] h-[1200px] rounded-full animate-float-slower"
          style={{ 
            background: 'radial-gradient(circle, rgba(255, 200, 87, 0.2) 0%, rgba(255, 200, 87, 0.1) 50%, transparent 100%)',
            filter: 'blur(90px)'
          }} 
        />
        
        <div 
          className="absolute bottom-[5%] left-[35%] w-[1300px] h-[1300px] rounded-full animate-float-slowest"
          style={{ 
            background: 'radial-gradient(circle, rgba(124, 247, 240, 0.18) 0%, rgba(124, 247, 240, 0.08) 50%, transparent 100%)',
            filter: 'blur(110px)'
          }} 
        />
        
        {/* Visible center glow */}
        <div 
          className="absolute inset-0"
          style={{ background: 'radial-gradient(circle at 50% 50%, rgba(124, 247, 240, 0.12), transparent 70%)' }} 
        />
        
        {/* Corner glow effects - more visible */}
        <div 
          className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full"
          style={{ 
            background: 'radial-gradient(circle, rgba(124, 247, 240, 0.18), transparent 70%)',
            filter: 'blur(80px)'
          }} 
        />
        <div 
          className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full"
          style={{ 
            background: 'radial-gradient(circle, rgba(255, 200, 87, 0.15), transparent 70%)',
            filter: 'blur(80px)'
          }} 
        />
        
        {/* Additional mid-tones for depth */}
        <div 
          className="absolute top-[25%] right-[40%] w-[900px] h-[900px] rounded-full animate-float-slow"
          style={{ 
            background: 'radial-gradient(circle, rgba(124, 247, 240, 0.08), transparent 70%)',
            filter: 'blur(120px)'
          }} 
        />
      </div>

      {/* Visible particles */}
      <div className="fixed inset-0 -z-40 overflow-hidden pointer-events-none" aria-hidden="true">
        {/* Glowing dots - clearly visible */}
        <div className="absolute top-[15%] left-[8%] w-4 h-4 rounded-full animate-float-slow"
             style={{ background: '#7cf7f0', boxShadow: '0 0 20px rgba(124, 247, 240, 0.9), 0 0 40px rgba(124, 247, 240, 0.5)' }} />
        
        <div className="absolute top-[35%] right-[12%] w-3 h-3 rounded-full animate-float-slower"
             style={{ background: '#ffc857', boxShadow: '0 0 18px rgba(255, 200, 87, 0.9), 0 0 35px rgba(255, 200, 87, 0.5)' }} />
        
        <div className="absolute top-[55%] left-[18%] w-5 h-5 rounded-full animate-float-slowest"
             style={{ background: '#7cf7f0', boxShadow: '0 0 22px rgba(124, 247, 240, 0.9), 0 0 45px rgba(124, 247, 240, 0.5)' }} />
        
        <div className="absolute top-[25%] right-[25%] w-3 h-3 rounded-full animate-float-slow"
             style={{ background: '#ffc857', boxShadow: '0 0 16px rgba(255, 200, 87, 0.9), 0 0 32px rgba(255, 200, 87, 0.5)' }} />
        
        <div className="absolute top-[65%] left-[35%] w-4 h-4 rounded-full animate-float-slower"
             style={{ background: '#7cf7f0', boxShadow: '0 0 20px rgba(124, 247, 240, 0.9), 0 0 40px rgba(124, 247, 240, 0.5)' }} />
        
        <div className="absolute top-[75%] right-[35%] w-4 h-4 rounded-full animate-float-slowest"
             style={{ background: '#ffc857', boxShadow: '0 0 18px rgba(255, 200, 87, 0.9), 0 0 38px rgba(255, 200, 87, 0.5)' }} />
        
        {/* Additional smaller particles */}
        <div className="absolute top-[10%] left-[50%] w-2 h-2 rounded-full animate-float-slower"
             style={{ background: '#7cf7f0', boxShadow: '0 0 12px rgba(124, 247, 240, 0.8)' }} />
        
        <div className="absolute top-[45%] right-[45%] w-2 h-2 rounded-full animate-float-slow"
             style={{ background: '#ffc857', boxShadow: '0 0 12px rgba(255, 200, 87, 0.8)' }} />
        
        {/* Animated rings */}
        <div className="absolute top-[30%] right-[20%] w-20 h-20 rounded-full border-2 animate-pulse"
             style={{ borderColor: 'rgba(124, 247, 240, 0.4)', boxShadow: '0 0 12px rgba(124, 247, 240, 0.5)' }} />
        
        <div className="absolute top-[50%] left-[45%] w-16 h-16 rounded-full border-2 animate-pulse"
             style={{ borderColor: 'rgba(255, 200, 87, 0.35)', boxShadow: '0 0 10px rgba(255, 200, 87, 0.5)', animationDelay: '1s' }} />
      </div>
    </>
  );
};

export default memo(AnimatedBackground);
