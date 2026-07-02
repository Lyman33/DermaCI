import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const LOGO_URL = "https://media.base44.com/images/public/6a0e53b978ea3d5f75666bd8/fd6f17ab5_LE_LOGO_OFFICIEL.png";
const VALID_PASSES = ['essentiel', 'pro', 'premium'];

// ─────────────────────────────────────────────────────────────────────────────
//  PremiumSuccess — page de retour des paiements FLUX 1.
//  - Sans ?pass  -> ancien comportement (pass Découverte 2000 FCFA).
//  - Avec ?pass= -> active le pass payant (essentiel/pro/premium) pour 30 jours.
//  Dans tous les cas : marque l'appareil premium localement + va à l'accueil animé.
// ─────────────────────────────────────────────────────────────────────────────
export default function PremiumSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const doneRef = useRef(false);

  const getDeviceId = () => {
    try {
      let d = localStorage.getItem('dermaci_device_id');
      if (!d) { d = `dev_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`; localStorage.setItem('dermaci_device_id', d); }
      return d;
    } catch { return `dev_${Date.now()}`; }
  };

  const markDevicePremium = (passType) => {
    try {
      localStorage.setItem('dermaci_dermabot_unlocked', '1');
      localStorage.setItem('dermaci_device_authorized', '1');
      if (passType) {
        localStorage.setItem('dermaci_pass_type', passType);
        localStorage.setItem('dermaci_pass_expires', String(Date.now() + 30 * 24 * 60 * 60 * 1000));
      }
      const em = (localStorage.getItem('dermaci_device_email') || '').toLowerCase().trim();
      if (em) localStorage.setItem('dermaci_premium_' + em, '1');
    } catch {}
  };

  useEffect(() => {
    if (doneRef.current) return;
    doneRef.current = true;

    const run = async () => {
      const passParam = (searchParams.get('pass') || '').toLowerCase().trim();
      const isPass = VALID_PASSES.includes(passParam);

      // Email connu ?
      let email = '';
      try {
        const isAuthed = await base44.auth.isAuthenticated();
        if (isAuthed) { const u = await base44.auth.me(); email = (u?.email || '').toLowerCase().trim(); }
      } catch {}
      if (!email) { try { email = (localStorage.getItem('dermaci_device_email') || '').toLowerCase().trim(); } catch {} }

      // Marquer premium localement (instantané)
      markDevicePremium(isPass ? passParam : null);

      // Nettoyer marqueurs de paiement
      try {
        localStorage.removeItem('dermaci_payment_started');
        localStorage.removeItem('dermaci_payment_origin');
      } catch {}

      // Activer côté serveur
      try {
        if (isPass) {
          await base44.functions.invoke('activatePass', { pass_type: passParam, device_id: getDeviceId(), user_email: email });
        } else {
          // Pass Découverte (2000 FCFA) : ancienne activation
          await base44.functions.invoke('activatePremiumAndGetAnalysis', { analysis_id: null });
        }
      } catch (err) {
        console.error('[PremiumSuccess] activation:', err?.message);
      }

      // ── Pré-génération : si la dernière analyse (faite en gratuit) n'a pas
      // encore ses rubriques complètes, on les génère MAINTENANT en arrière-plan.
      // Quand l'utilisateur l'ouvrira, tout sera déjà là (repairAnalysisC ne fait
      // rien si l'analyse est déjà complète — coût zéro dans ce cas).
      try {
        const lastId = localStorage.getItem('dermaci_last_analysis_id');
        if (lastId) {
          localStorage.setItem('dermaci_repair_fired_' + lastId, String(Date.now()));
          base44.functions.invoke('repairAnalysisC', { analysis_id: lastId }).catch(() => {});
        }
      } catch {}

      // Aller à l'accueil avec l'animation premium
      const dest = isPass ? `/?premium=1&pass=${passParam}` : '/?premium=1';
      navigate(dest, { replace: true });
    };

    run();
  }, [navigate, searchParams]);

  const passParam = (searchParams.get('pass') || '').toLowerCase().trim();
  const label = VALID_PASSES.includes(passParam)
    ? `Activation de ton pass ${passParam.charAt(0).toUpperCase() + passParam.slice(1)}…`
    : 'Activation de ton accès premium…';

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <motion.div className="text-center" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex justify-center mb-8">
          <img src={LOGO_URL} alt="DermaCI" className="object-contain" style={{ width: 128, height: 128 }} />
        </div>
        <div className="flex items-center justify-center gap-3 text-foreground">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#00C896' }} />
          <span className="text-lg font-semibold">{label}</span>
        </div>
        <p className="text-base text-muted-foreground mt-4">Un instant, on prépare tout 🌿</p>
      </motion.div>
    </div>
  );
}
