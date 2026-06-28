import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const LOGO_URL = "https://media.base44.com/images/public/6a0e53b978ea3d5f75666bd8/fd6f17ab5_LE_LOGO_OFFICIEL.png";

// ─────────────────────────────────────────────────────────────────────────────
//  PremiumSuccess — page de retour du FLUX 1 (paywall "limite atteinte").
//  Role : activer le premium A VIE, puis envoyer vers l'ACCUEIL animé (?premium=1).
//  (Le FLUX 2 garde sa propre page payment-success -> page resultats. Non touche.)
// ─────────────────────────────────────────────────────────────────────────────
export default function PremiumSuccess() {
  const navigate = useNavigate();
  const doneRef = useRef(false);

  // Pose TOUS les marqueurs premium -> le paywall ne reapparaitra plus jamais.
  const markDevicePremium = () => {
    try {
      localStorage.setItem('dermaci_dermabot_unlocked', '1');
      localStorage.setItem('dermaci_device_authorized', '1');
      const em = (localStorage.getItem('dermaci_device_email') || '').toLowerCase().trim();
      if (em) localStorage.setItem('dermaci_premium_' + em, '1');
    } catch {}
  };

  useEffect(() => {
    if (doneRef.current) return;
    doneRef.current = true;

    const run = async () => {
      // 1) Memoriser le premium localement tout de suite (instantane)
      markDevicePremium();

      // 2) Nettoyer les marqueurs de paiement
      try {
        localStorage.removeItem('dermaci_payment_started');
        localStorage.removeItem('dermaci_payment_origin');
        localStorage.removeItem('dermaci_pending_payment');
      } catch {}

      // 3) Activer le premium cote serveur (meme fonction que payment-success)
      try {
        await base44.functions.invoke('activatePremiumAndGetAnalysis', { analysis_id: null });
      } catch (err) {
        console.error('[PremiumSuccess] activation:', err?.message);
      }

      // 4) Aller a l'ACCUEIL avec l'animation premium (confettis)
      navigate('/?premium=1', { replace: true });
    };

    run();
  }, [navigate]);

  // Petit ecran de transition pendant l'activation (~1s)
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex justify-center mb-8">
          <img src={LOGO_URL} alt="DermaCI" className="object-contain" style={{ width: 128, height: 128 }} />
        </div>
        <div className="flex items-center justify-center gap-3 text-foreground">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#00C896' }} />
          <span className="text-lg font-semibold">Activation de ton accès premium…</span>
        </div>
        <p className="text-base text-muted-foreground mt-4">Un instant, on prépare tout 🌿</p>
      </motion.div>
    </div>
  );
}
