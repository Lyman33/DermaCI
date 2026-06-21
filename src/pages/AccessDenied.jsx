import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import AuthModal from '@/components/AuthModal';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';

const LOGO_URL = "https://media.base44.com/images/public/6a0e53b978ea3d5f75666bd8/fd6f17ab5_LE_LOGO_OFFICIEL.png";

export default function AccessDenied() {
  const navigate = useNavigate();
  const { checkAppState, isAuthenticated } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleAuthSuccess = async () => {
    await checkAppState();
    setShowAuthModal(false);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-8 relative overflow-hidden"
      style={{ background: 'hsl(150,30%,97%)' }}>

      {/* Fond animé */}
      <motion.div className="absolute rounded-full pointer-events-none"
        style={{ width: 300, height: 300, background: 'radial-gradient(circle, rgba(0,168,120,0.08) 0%, transparent 70%)', top: '-10%', right: '-15%' }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }} />

      <motion.div className="w-full max-w-sm relative z-10 text-center"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>

        {/* Logo */}
        <motion.img src={LOGO_URL} alt="DermaCI" className="w-20 h-20 object-contain mx-auto mb-6"
          style={{ mixBlendMode: 'multiply' }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} />

        <h1 className="font-inter font-black text-2xl text-foreground mb-8">
          Derma<span style={{ color: '#00A878' }}>CI</span>
        </h1>

        <motion.div className="bg-white rounded-3xl p-8 border-2" style={{ borderColor: 'rgba(0,168,120,0.15)' }}
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
          
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(0,168,120,0.1)' }}>
            <Lock className="w-6 h-6" style={{ color: '#00A878' }} />
          </div>

          <h2 className="font-bold text-lg text-foreground mb-2">Connexion requise</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            Connectez-vous ou créez un compte pour accéder à votre analyse dermatologique personnalisée.
          </p>

          <motion.button onClick={() => setShowAuthModal(true)}
            className="w-full py-4 rounded-2xl font-bold text-white text-base"
            style={{
              background: 'linear-gradient(135deg, #00A878, #00C896)',
              boxShadow: '0 8px 24px rgba(0,168,120,0.30)',
            }}
            whileTap={{ scale: 0.97 }}>
            Se connecter
          </motion.button>
        </motion.div>

        <motion.button onClick={() => navigate('/')}
          className="w-full mt-4 py-3 rounded-2xl font-semibold text-foreground border-2 border-foreground/20"
          whileTap={{ scale: 0.97 }}>
          Retour à l'accueil
        </motion.button>
      </motion.div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onSuccess={handleAuthSuccess} />
    </div>
  );
}