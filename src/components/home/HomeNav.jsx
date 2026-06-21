import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Info, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LOGO_URL = "https://media.base44.com/images/public/6a14a8290af9b7a6761f47b4/93361018d_LELOGOOFFICIEL.png";

export default function HomeNav() {
  const [canAccess, setCanAccess] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const check = () => setCanAccess(localStorage.getItem('dermaci_dermabot_unlocked') === '1');
    check();
    window.addEventListener('storage', check);
    window.addEventListener('focus', check);
    return () => {
      window.removeEventListener('storage', check);
      window.removeEventListener('focus', check);
    };
  }, []);

  const handleLockedClick = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  return (
    <motion.div className="flex items-center justify-between px-4 sm:px-6 pt-4 sm:pt-6 pb-2 relative z-20"
      initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}>
      <Link to="/" className="flex items-center gap-0 flex-shrink-0">
        <img src={LOGO_URL} alt="DermaCI" className="w-9 sm:w-12 h-9 sm:h-12 object-contain"
          style={{ mixBlendMode: 'multiply' }} />
        <span className="font-inter font-bold text-sm sm:text-lg tracking-tight hidden sm:inline">
          Derma<span className="text-primary">CI</span>
        </span>
      </Link>

      <div className="flex items-center gap-2 relative">
        {/* Bouton Mes analyses */}
        {canAccess ? (
          <Link to="/analyses" className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/90 border border-border text-xs font-medium text-foreground hover:bg-white transition-all shadow-sm whitespace-nowrap">
            <BarChart3 className="w-4 h-4 flex-shrink-0" />
            <span>Mes analyses</span>
          </Link>
        ) : (
          <button
            onClick={handleLockedClick}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/60 border border-border text-xs font-medium text-muted-foreground/60 shadow-sm whitespace-nowrap cursor-not-allowed select-none"
          >
            <Lock className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Mes analyses</span>
          </button>
        )}

        {/* Toast message */}
        <AnimatePresence>
          {showToast && (
            <motion.div
              className="absolute top-12 right-0 z-50 w-64 px-4 py-3 rounded-2xl shadow-xl"
              style={{
                background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
                border: '1px solid rgba(0,168,120,0.3)',
                boxShadow: '0 12px 32px rgba(0,0,0,0.25)',
              }}
              initial={{ opacity: 0, y: -8, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.92 }}
              transition={{ duration: 0.22 }}>
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: 'rgba(0,168,120,0.2)' }}>
                  <Lock className="w-3.5 h-3.5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white mb-0.5">Accès restreint</p>
                  <p className="text-xs text-white/60 leading-relaxed">
                    Débloquez votre accès premium pour consulter votre historique d'analyses.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Link to="/about" className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/90 border border-border text-xs font-medium text-foreground hover:bg-white transition-all shadow-sm">
          <Info className="w-4 h-4 flex-shrink-0" />
          <span>À propos</span>
        </Link>
      </div>
    </motion.div>
  );
}