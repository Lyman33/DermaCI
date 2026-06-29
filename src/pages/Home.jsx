import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Sparkles } from 'lucide-react';
import HomeNav from '../components/home/HomeNav';
import HeroSection from '../components/home/HeroSection';
import FeaturesSection from '../components/home/FeaturesSection';
import HowItWorksSection from '../components/home/HowItWorksSection';
import FooterSection from '../components/home/FooterSection';


// ── PARTICULES ─────────────────────────────────────────────────────────────
const PARTICLES = Array.from({ length: 35 }, (_, i) => ({
  id: i,
  x:        Math.random() * 100,
  y:        Math.random() * 100,
  size:     1.5 + Math.random() * 3,
  duration: 7 + Math.random() * 9,
  delay:    Math.random() * 7,
}));

function BackgroundAnimation() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">

      {/* ── Orbe haut droite ── */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 420, height: 420,
          top: '-90px', right: '-90px',
          background: 'radial-gradient(circle, rgba(0,168,120,0.10) 0%, transparent 70%)',
        }}
        animate={{ scale: [1, 1.10, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* ── Orbe bas gauche ── */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 340, height: 340,
          bottom: '-70px', left: '-70px',
          background: 'radial-gradient(circle, rgba(0,168,120,0.08) 0%, transparent 70%)',
        }}
        animate={{ scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
      />

      {/* ── Orbe centre discret ── */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 250, height: 250,
          top: '40%', left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(0,168,120,0.04) 0%, transparent 70%)',
        }}
        animate={{ scale: [1, 1.12, 1], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut', delay: 6 }}
      />

      {/* ── Particules flottantes ── */}
      {PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left:       `${p.x}%`,
            top:        `${p.y}%`,
            width:      p.size,
            height:     p.size,
            background: 'hsl(var(--primary))',
          }}
          animate={{
            y:       [0, -22, 0],
            opacity: [0.25, 0.55, 0.25],
          }}
          transition={{
            duration: p.duration,
            repeat:   Infinity,
            delay:    p.delay,
            ease:     'easeInOut',
          }}
        />
      ))}
    </div>
  );
}


// ── OVERLAY "Premium debloque" — celebration a l'arrivee ────────────────────
const CONFETTI = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  delay: Math.random() * 0.5,
  duration: 1.8 + Math.random() * 1.4,
  size: 6 + Math.random() * 8,
  color: ['#00C896', '#00A878', '#ffffff', '#7CE0C0'][i % 4],
  rotate: Math.random() * 360,
}));

const PASS_LABELS = {
  essentiel: { titre: 'Pass Essentiel activé !', detail: '25 analyses par mois, diagnostic complet et DermaBot.' },
  pro:       { titre: 'Pass Pro activé !',       detail: '40 analyses par mois, DermaBot prioritaire et diagnostic complet.' },
  premium:   { titre: 'Pass Premium activé !',   detail: 'des analyses illimitées, un DermaBot illimité et un accès prioritaire.' },
};

function PremiumUnlockedOverlay({ onDone, pass }) {
  useEffect(() => {
    const t = setTimeout(() => onDone?.(), 3600);
    return () => clearTimeout(t);
  }, [onDone]);

  const info = PASS_LABELS[pass] || null;
  const titre = info ? info.titre : 'Premium débloqué !';

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center px-6"
      style={{ background: 'rgba(4,15,10,0.92)', backdropFilter: 'blur(6px)' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={() => onDone?.()}
    >
      {/* Confettis */}
      {CONFETTI.map((c) => (
        <motion.div key={c.id} className="absolute rounded-sm"
          style={{ left: `${c.x}%`, top: '-20px', width: c.size, height: c.size, background: c.color }}
          initial={{ y: -20, opacity: 0, rotate: 0 }}
          animate={{ y: ['-20px', '110vh'], opacity: [0, 1, 1, 0], rotate: c.rotate }}
          transition={{ duration: c.duration, delay: c.delay, ease: 'easeIn' }}
        />
      ))}

      <motion.div className="text-center relative z-10"
        initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 16 }}>
        <motion.div
          className="w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: 'rgba(0,200,150,0.15)', border: '2px solid rgba(0,200,150,0.5)' }}
          animate={{ boxShadow: ['0 0 0px rgba(0,200,150,0.3)', '0 0 40px rgba(0,200,150,0.6)', '0 0 0px rgba(0,200,150,0.3)'] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}>
          <motion.div
            initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.25, type: 'spring', stiffness: 260 }}>
            <CheckCircle className="w-16 h-16" style={{ color: '#00C896' }} />
          </motion.div>
        </motion.div>

        <motion.div className="flex items-center justify-center gap-2 mb-2"
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Sparkles className="w-6 h-6" style={{ color: '#00C896' }} />
          <h2 className="text-3xl font-black text-white">{titre}</h2>
          <Sparkles className="w-6 h-6" style={{ color: '#00C896' }} />
        </motion.div>

        <motion.p className="text-base text-white/70 max-w-xs mx-auto leading-relaxed"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}>
          {info ? (
            <>Tu as maintenant accès à <span className="font-bold" style={{ color: '#00C896' }}>{info.detail.split(',')[0]}</span>{info.detail.includes(',') ? ', ' + info.detail.split(',').slice(1).join(',').trim() : '.'}</>
          ) : (
            <>Tu as maintenant accès à <span className="font-bold" style={{ color: '#00C896' }}>tout</span> : analyses illimitées, diagnostic complet et DermaBot 24/7.</>
          )}
        </motion.p>

        <motion.p className="text-xs text-white/40 mt-6"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
          Touchez pour continuer
        </motion.p>
      </motion.div>
    </motion.div>
  );
}

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showPremium, setShowPremium] = useState(false);
  const [unlockedPass, setUnlockedPass] = useState(null);

  useEffect(() => {
    if (searchParams.get('premium') === '1') {
      // Recuperer le pass (URL ?pass= en priorite, sinon localStorage)
      let p = (searchParams.get('pass') || '').toLowerCase().trim();
      if (!['essentiel','pro','premium'].includes(p)) {
        try { p = (localStorage.getItem('dermaci_pass_type') || '').toLowerCase().trim(); } catch { p = ''; }
      }
      if (['essentiel','pro','premium'].includes(p)) setUnlockedPass(p);
      setShowPremium(true);
      // Nettoyer l'URL pour que l'animation ne se rejoue pas au refresh
      const sp = new URLSearchParams(searchParams);
      sp.delete('premium');
      sp.delete('pass');
      setSearchParams(sp, { replace: true });
    }
  }, []);

  return (
    <div className="relative min-h-screen bg-background">

      <AnimatePresence>
        {showPremium && <PremiumUnlockedOverlay onDone={() => setShowPremium(false)} pass={unlockedPass} />}
      </AnimatePresence>

      <BackgroundAnimation />

      <div className="relative z-10">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <HomeNav />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}>
            <HeroSection />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
            <FeaturesSection />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}>
            <HowItWorksSection />
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.2 }}>
            <FooterSection />
          </motion.div>
      </div>
    </div>
  );
}
