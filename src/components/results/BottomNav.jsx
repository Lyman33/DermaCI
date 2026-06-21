import { useState } from 'react';
import { BarChart3, Home, RefreshCw, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BottomNav({ isPremium, navigate }) {
  const [showToast, setShowToast] = useState(false);

  const handleLockedClick = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  return (
    <div className="px-4 pt-4 pb-8 mt-6 relative">
      {/* Toast premium */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            className="absolute left-4 right-4 bottom-full mb-3 z-50 px-4 py-3 rounded-2xl shadow-xl flex items-start gap-3"
            style={{
              background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
              border: '1px solid rgba(0,168,120,0.3)',
              boxShadow: '0 12px 32px rgba(0,0,0,0.25)',
            }}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.25 }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: 'rgba(0,168,120,0.2)' }}>
              <Lock className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold text-white mb-0.5">Accès restreint</p>
              <p className="text-xs text-white/60 leading-relaxed">
                Débloquez votre accès premium pour accéder à l'historique et lancer de nouvelles analyses.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl"
        style={{ background: 'rgba(255,255,255,0.80)', border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>

        {/* Historique */}
        {isPremium ? (
          <button onClick={() => navigate('/analyses')}
            className="flex flex-col items-center gap-1 py-3 rounded-xl transition-all"
            style={{ background: 'transparent' }}>
            <BarChart3 className="w-5 h-5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium">Historique</span>
          </button>
        ) : (
          <button onClick={handleLockedClick}
            className="flex flex-col items-center gap-1 py-3 rounded-xl transition-all cursor-not-allowed"
            style={{ background: 'transparent', opacity: 0.4 }}
            title="Débloquez votre accès premium">
            <Lock className="w-5 h-5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium">Historique</span>
          </button>
        )}

        {/* Accueil — toujours accessible */}
        <button onClick={() => navigate('/')}
          className="flex flex-col items-center gap-1 py-3 rounded-xl"
          style={{ background: 'linear-gradient(135deg, #00A878, #00C896)', boxShadow: '0 4px 12px rgba(0,168,120,0.30)' }}>
          <Home className="w-5 h-5 text-white" />
          <span className="text-xs text-white font-bold">Accueil</span>
        </button>

        {/* Nouvelle */}
        {isPremium ? (
          <button onClick={() => navigate('/analysis')}
            className="flex flex-col items-center gap-1 py-3 rounded-xl transition-all"
            style={{ background: 'transparent' }}>
            <RefreshCw className="w-5 h-5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium">Nouvelle</span>
          </button>
        ) : (
          <button onClick={handleLockedClick}
            className="flex flex-col items-center gap-1 py-3 rounded-xl transition-all cursor-not-allowed"
            style={{ background: 'transparent', opacity: 0.4 }}
            title="Débloquez votre accès premium">
            <Lock className="w-5 h-5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium">Nouvelle</span>
          </button>
        )}
      </div>
    </div>
  );
}