import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';

const LOGO_URL = "https://media.base44.com/images/public/6a0e53b978ea3d5f75666bd8/fd6f17ab5_LE_LOGO_OFFICIEL.png";

export default function MagicLink() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const verify = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        if (!token) throw new Error('Lien invalide ou expiré.');
        await base44.auth.verifyMagicLink({ token });
        setStatus('success');
        setTimeout(() => navigate('/'), 2000);
      } catch (err) {
        setErrorMsg(err?.message || 'Lien invalide ou expiré.');
        setStatus('error');
      }
    };
    verify();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-background">
      <motion.div className="w-full max-w-sm text-center"
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>

        <img src={LOGO_URL} alt="DermaCI" className="mx-auto mb-8"
          style={{ width: 140, mixBlendMode: 'multiply' }} />

        {status === 'loading' && (
          <>
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">Connexion en cours…</p>
          </>
        )}

        {status === 'success' && (
          <>
            <motion.div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ background: 'rgba(0,168,120,0.10)' }}
              animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}>
              <CheckCircle className="w-8 h-8 text-primary" />
            </motion.div>
            <h2 className="font-inter font-black text-xl mb-2">Connecté !</h2>
            <p className="text-sm text-muted-foreground">Redirection vers DermaCI…</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ background: 'rgba(231,76,60,0.08)' }}>
              <XCircle className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="font-inter font-black text-xl mb-2">Lien invalide</h2>
            <p className="text-sm text-muted-foreground mb-6">{errorMsg}</p>
            <button onClick={() => navigate('/')}
              className="px-6 py-3 rounded-2xl font-bold text-white text-sm"
              style={{ background: 'linear-gradient(135deg, #00A878, #00C896)' }}>
              Retour à l'accueil
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}