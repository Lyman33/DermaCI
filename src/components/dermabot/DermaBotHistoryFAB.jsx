import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import DermaBotName from '@/components/dermabot/DermaBotName';

const LOGO_URL = "https://media.base44.com/images/public/6a0e53b978ea3d5f75666bd8/fd6f17ab5_LE_LOGO_OFFICIEL.png";

const MESSAGES = [
  { text: "Parler à ", highlight: true, suffix: " 🌿" },
  { text: "Des questions sur ta peau ? 💬", highlight: false },
  { text: "Conseils personnalisés ✨", highlight: false },
  { text: "Coach IA disponible 24h/24 🤖", highlight: false },
];

export default function DermaBotHistoryFAB() {
  const navigate = useNavigate();
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex(prev => (prev + 1) % MESSAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="fixed bottom-6 right-4 z-40 flex items-center"
      style={{ gap: '0.15cm' }}
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.6, type: 'spring', stiffness: 120 }}>

      {/* Bulle de message rotative — cliquable */}
      <AnimatePresence mode="wait">
        <motion.div
          key={msgIndex}
          onClick={() => navigate('/dermabot')}
          className="px-3 py-2 rounded-xl text-xs font-medium text-foreground bg-white border border-border cursor-pointer"
          style={{ boxShadow: '0 4px 16px rgba(0,168,120,0.15)' }}
          initial={{ opacity: 0, x: 8, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -8, scale: 0.95 }}
          transition={{ duration: 0.25 }}
          whileTap={{ scale: 0.97 }}>
          {MESSAGES[msgIndex].highlight
            ? <>{MESSAGES[msgIndex].text}<DermaBotName />{MESSAGES[msgIndex].suffix}</>
            : MESSAGES[msgIndex].text
          }
        </motion.div>
      </AnimatePresence>

      {/* Bouton FAB — logo seul sur fond transparent */}
      <motion.button
        onClick={() => navigate('/dermabot')}
        className="w-16 h-16 flex items-center justify-center relative flex-shrink-0"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}>
        <motion.img src={LOGO_URL} alt="DermaBot"
          className="w-16 h-16 object-contain"
          style={{ mixBlendMode: 'multiply' }}
          animate={{
            scale: [1, 1.12, 1.05, 1.1, 1, 1.08, 1],
            y: [0, -3, 0, -2, 0],
          }}
          transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 1.5, ease: 'easeInOut' }} />
      </motion.button>
    </motion.div>
  );
}