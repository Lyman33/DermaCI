import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DermaLogo from '@/components/DermaLogo';

export default function AnalysisLoader() {
  const [progress, setProgress] = useState(5);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev < 90) return prev + Math.random() * 20;
        return prev;
      });
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      {/* Animations fond */}
      <motion.div className="absolute rounded-full pointer-events-none"
        style={{ width: 250, height: 250, background: 'radial-gradient(circle, rgba(0,168,120,0.08) 0%, transparent 70%)', top: '-5%', right: '-10%' }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }} />
      <motion.div className="absolute rounded-full pointer-events-none"
        style={{ width: 180, height: 180, background: 'radial-gradient(circle, rgba(0,200,150,0.07) 0%, transparent 70%)', bottom: '10%', left: '-8%' }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 3 }} />

      <div className="relative z-10 flex flex-col items-center">
        {/* Logo avec animation */}
        <motion.div className="mb-8"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 150 }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}>
            <DermaLogo size={56} />
          </motion.div>
        </motion.div>

        {/* Titre */}
        <motion.h2 className="font-inter font-black text-2xl text-foreground mb-2 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}>
          Analyse en cours…
        </motion.h2>

        {/* Sous-titre */}
        <motion.p className="text-sm text-muted-foreground mb-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}>
          Veuillez patienter
        </motion.p>

        {/* Barre de progression */}
        <motion.div className="w-56 h-2 bg-muted rounded-full overflow-hidden mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}>
          <motion.div
            className="h-full bg-primary rounded-full"
            animate={{ width: `${Math.min(progress, 95)}%` }}
            transition={{ ease: 'easeOut' }}
            style={{ boxShadow: '0 0 12px rgba(0,168,120,0.5)' }} />
        </motion.div>

        {/* Pourcentage */}
        <motion.p className="text-sm font-bold text-primary"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}>
          {Math.round(progress)}%
        </motion.p>
      </div>
    </div>
  );
}