import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';

const LOGO_URL = "https://media.base44.com/images/public/6a14a8290af9b7a6761f47b4/93361018d_LELOGOOFFICIEL.png";

export default function HeroSection() {
  const navigate = useNavigate();
  return (
    <section className="px-6 pt-4 pb-6 relative overflow-hidden">

      {/* ── ANIMATION FOND SUBTLE ── */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 400, height: 400,
          background: 'radial-gradient(circle, rgba(0,168,120,0.04) 0%, transparent 70%)',
          top: '-10%', right: '-15%',
        }}
        animate={{ opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 300, height: 300,
          background: 'radial-gradient(circle, rgba(45,122,79,0.03) 0%, transparent 70%)',
          bottom: '-10%', left: '-10%',
        }}
        animate={{ opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />

      <div className="relative z-10 max-w-lg mx-auto text-center">

        {/* Badge */}
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-3 text-xs font-semibold"
          style={{ background: 'rgba(0,168,120,0.12)', border: '1px solid rgba(0,168,120,0.25)', color: '#00A878' }}
          initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}>
          <Sparkles className="w-3.5 h-3.5" />
          Intelligence Artificielle · Peaux Africaines
        </motion.div>

        {/* Logo */}
        <motion.div className="flex justify-center -mb-8 sm:-mb-6"
          initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2, type: 'spring', stiffness: 200 }}>
          <img src={LOGO_URL} alt="DermaCI"
            className="w-24 h-24 sm:w-32 sm:h-32 object-contain"
            style={{ mixBlendMode: 'multiply' }} />
        </motion.div>

        {/* Titre */}
        <motion.h1
          className="font-inter text-3xl sm:text-5xl font-black leading-tight sm:leading-none mb-3"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}>
          <span style={{ color: '#0d2818' }}>Derma</span>
          <span style={{ color: '#2d7a4f' }}>CI</span>
        </motion.h1>

        <motion.p className="text-xl font-semibold text-foreground mb-2 leading-snug"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}>
          Analysez votre peau,<br />révélez votre éclat.
        </motion.p>

        <motion.p className="text-sm text-muted-foreground mb-4 leading-relaxed"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}>
          Le premier dermatologue IA dédié aux peaux africaines.<br />
          Conseils scientifiques adaptés au climat ivoirien.
        </motion.p>

      </div>
    </section>
  );
}