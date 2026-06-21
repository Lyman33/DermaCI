import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff } from 'lucide-react';

export default function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setVisible(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setVisible(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check initial status
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && !isOnline && (
        <motion.div
          className="fixed bottom-6 left-6 right-6 sm:bottom-8 sm:left-8 sm:right-auto sm:max-w-sm z-50 px-4 py-3 rounded-2xl flex items-center gap-3"
          style={{
            background: 'linear-gradient(135deg, #E74C3C, #C0392B)',
            boxShadow: '0 8px 32px rgba(231,76,60,0.4)',
            backdropFilter: 'blur(8px)',
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}>
          <WifiOff className="w-4 h-4 text-white flex-shrink-0 animate-pulse" />
          <p className="text-sm font-semibold text-white">Pas de connexion Internet</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}