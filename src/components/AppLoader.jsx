import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const LOGO_URL = "https://media.base44.com/images/public/6a14a8290af9b7a6761f47b4/93361018d_LELOGOOFFICIEL.png";

export default function AppLoader() {
  const [elapsed, setElapsed] = useState(0);
  const [showRefresh, setShowRefresh] = useState(false);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const refreshTimer = setTimeout(() => setShowRefresh(true), 10000);
    return () => clearTimeout(refreshTimer);
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background overflow-hidden">
      {/* Gradients animés en background */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 300, height: 300,
          background: 'radial-gradient(circle, rgba(0,168,120,0.12) 0%, transparent 70%)',
          top: '-50px', right: '-100px',
        }}
        animate={{ opacity: [0.5, 0.8, 0.5], scale: [1, 1.15, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 250, height: 250,
          background: 'radial-gradient(circle, rgba(0,200,150,0.08) 0%, transparent 70%)',
          bottom: '-80px', left: '-50px',
        }}
        animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.1, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />

      {/* Logo container */}
      <motion.div
        className="relative z-10 mb-8"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, type: 'spring', stiffness: 120 }}>
        
        {/* Halo pulsant */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(0,168,120,0.2), transparent 70%)',
            transform: 'scale(1.3)',
          }}
          animate={{ scale: [1.3, 1.5, 1.3], opacity: [0.6, 0.3, 0.6] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Logo */}
        <img
          src={LOGO_URL}
          alt="DermaCI"
          className="w-40 h-40 object-contain relative z-10"
          style={{ mixBlendMode: 'multiply' }}
        />
      </motion.div>

      {/* Texte */}
      <motion.div
        className="text-center mt-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}>
        <h2 className="font-inter font-bold text-xl text-foreground mb-2">
          <span style={{ color: '#0d2818' }}>Derma</span>
          <span style={{ color: '#00A878' }}>CI</span>
        </h2>
        <p className="text-sm text-muted-foreground mb-4">Chargement en cours…</p>
        {showRefresh && (
          <button onClick={() => window.location.reload()}
            className="mb-4 px-5 py-2.5 rounded-xl font-bold text-white text-sm"
            style={{ background: 'linear-gradient(135deg,#00A878,#00C896)' }}>
            Rafraîchir la page
          </button>
        )}

        {/* Loader bars animés */}
        <div className="flex items-center justify-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-8 rounded-full"
              style={{ background: '#00A878' }}
              animate={{ scaleY: [0.4, 1, 0.4] }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.15,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}