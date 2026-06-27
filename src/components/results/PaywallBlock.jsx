import React, { useState } from 'react';
import { Lock, Zap, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';

const FEATURES = [
  { icon: '🔬', title: 'Problèmes cutanés', desc: 'Détectés avec sévérité et zones exactes' },
  { icon: '🧬', title: 'Causes identifiées', desc: 'Hormones, alimentation, soleil, stress…' },
  { icon: '🌿', title: 'Routine sur-mesure', desc: 'Matin et soir, sans marques commerciales' },
  { icon: '⚗️', title: 'Actifs cosmétiques', desc: 'Mécanismes scientifiques détaillés' },
  { icon: '🥭', title: 'Nutrition ivoirienne', desc: 'Aliments locaux et leurs compositions' },
  { icon: '🏥', title: 'Pharmacies proches', desc: 'Disponibilité des actifs recommandés' },
  { icon: '📈', title: 'Suivi & Coaching', desc: 'Evolution cutanée et conseils personnalisés' },
  { icon: '💬', title: 'DermaBot 24/7', desc: 'Chat IA pour vos questions skincare' },
  { icon: '♾️', title: 'Accès à vie', desc: 'Analyses illimitées sur tous vos appareils' },
];

// Lien direct de secours (si initPayment est indisponible)
const FALLBACK_PAYMENT_URL = 'https://geniuspay.ci/product/dermaci-BI38zG';

export default function PaywallBlock({ onUnlock, paymentPending, user }) {
  const [loading, setLoading] = useState(false);

  const getEmail = () => {
    // 1) email de l'utilisateur connecte
    if (user?.email) return user.email.toLowerCase().trim();
    // 2) email capture localement
    try {
      const stored = localStorage.getItem('dermaci_device_email')
        || localStorage.getItem('dermaci_user_email')
        || localStorage.getItem('user_email');
      if (stored) return stored.toLowerCase().trim();
    } catch {}
    return '';
  };

  const handleUnlock = async () => {
    if (loading) return;
    setLoading(true);
    localStorage.setItem('dermaci_payment_started', Date.now().toString());

    const email = getEmail();

    // On passe par initPayment : il enregistre le paiement (email + reference)
    // et renvoie un lien GeniusPay personnalise -> permet de debloquer le bon compte.
    try {
      if (email) {
        const res = await base44.functions.invoke('initPayment', { email });
        const data = res?.data || res || {};
        if (data?.already_premium) {
          // Deja premium : on debloque directement
          onUnlock?.();
          setLoading(false);
          return;
        }
        const url = data?.payment_url;
        if (url && typeof url === 'string') {
          onUnlock?.();
          window.location.href = url;
          return;
        }
      }
    } catch (e) {
      console.warn('[Paywall] initPayment indisponible, lien direct:', e?.message);
    }

    // Secours : lien direct (avec email en parametre si dispo)
    onUnlock?.();
    const fallback = email
      ? `${FALLBACK_PAYMENT_URL}?email=${encodeURIComponent(email)}&redirect_url=${encodeURIComponent('https://dermaci.app/payment-success')}`
      : `${FALLBACK_PAYMENT_URL}?redirect_url=${encodeURIComponent('https://dermaci.app/payment-success')}`;
    window.location.href = fallback;
  };

  return (
    <>
      <motion.div className="rounded-3xl overflow-hidden mb-4"
        style={{ background: 'linear-gradient(160deg, #0a1a12 0%, #001a0f 50%, #0d2818 100%)', border: '1px solid rgba(0,200,150,0.15)' }}
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

        {/* Header */}
        <div className="px-6 pt-7 pb-5 text-center border-b border-white/8">
          <motion.div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(0,168,120,0.15)', border: '1px solid rgba(0,168,120,0.30)' }}
            animate={{ boxShadow: ['0 0 0px rgba(0,168,120,0)', '0 0 24px rgba(0,168,120,0.3)', '0 0 0px rgba(0,168,120,0)'] }}
            transition={{ duration: 3, repeat: Infinity }}>
            <Lock className="w-7 h-7" style={{ color: '#00C896' }} />
          </motion.div>
          <h3 className="font-inter font-black text-xl text-white mb-2">Débloquez votre analyse complète</h3>
          <p className="text-sm text-white/50">Votre score est prêt. Découvrez ce que votre peau a à vous dire.</p>
        </div>

        {/* Features */}
        <div className="px-5 py-5 space-y-3">
          {FEATURES.map((f, i) => (
            <motion.div key={i} className="flex items-center gap-3"
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.07 }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-base"
                style={{ background: 'rgba(255,255,255,0.05)' }}>{f.icon}</div>
              <div>
                <p className="text-xs font-bold text-white">{f.title}</p>
                <p className="text-xs text-white/55">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div className="px-5 pb-6">
          <button
            onClick={handleUnlock}
            disabled={loading}
            className="w-full py-4 rounded-2xl font-bold text-base flex flex-col items-center justify-center gap-0.5 disabled:opacity-70"
            style={{
              background: 'linear-gradient(135deg, #00A878, #00C896)',
              color: '#fff',
              boxShadow: '0 8px 28px rgba(0,168,120,0.45)',
            }}>
            <div className="flex items-center gap-2">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
              {loading ? 'Préparation du paiement...' : 'Débloquer mon analyse'}
              {!loading && <ArrowRight className="w-5 h-5" />}
            </div>
            <span style={{ fontSize: '13px', fontWeight: 700, opacity: 0.85 }}>2 000 FCFA · Paiement unique · Accès à vie</span>
          </button>
        </div>
      </motion.div>
    </>
  );
}
