import { motion } from 'framer-motion';
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

export default function Home() {
  return (
    <div className="relative min-h-screen bg-background">

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