import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Check, Sparkles, ArrowLeft, Loader2, Crown, Zap, Star } from 'lucide-react';

const LOGO_URL = "https://media.base44.com/images/public/6a0e53b978ea3d5f75666bd8/fd6f17ab5_LE_LOGO_OFFICIEL.png";

const getDeviceId = () => {
  try {
    let d = localStorage.getItem('dermaci_device_id');
    if (!d) { d = `dev_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`; localStorage.setItem('dermaci_device_id', d); }
    return d;
  } catch { return `dev_${Date.now()}`; }
};

// ── Les 3 forfaits ───────────────────────────────────────────────────────────
const PLANS = [
  {
    id: 'essentiel',
    name: 'Essentiel',
    price: '3 000',
    icon: Zap,
    accent: '#00C896',
    popular: false,
    link: 'https://geniuspay.ci/product/dermaci-pass-essentiel-WUFAuw',
    tagline: 'Pour suivre ta peau régulièrement',
    features: [
      '25 analyses par mois',
      '30 messages DermaBot par mois',
      'Diagnostic complet à chaque analyse',
      'Suivi de l\'évolution de ta peau',
      'Routine + actifs personnalisés',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '5 000',
    icon: Star,
    accent: '#00E0A8',
    popular: true,
    link: 'https://geniuspay.ci/product/dermaci-pass-pro-8EXutm',
    tagline: 'Le choix de ceux qui veulent des résultats',
    features: [
      '40 analyses par mois',
      '100 messages DermaBot par mois',
      'Tout l\'Essentiel inclus',
      'DermaBot prioritaire 24/7',
      'Idéal pour une routine intensive',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '10 000',
    icon: Crown,
    accent: '#FFD580',
    popular: false,
    link: 'https://geniuspay.ci/product/dermaci-pass-premium-Iw3Lq3',
    tagline: 'L\'expérience DermaCI sans limites',
    features: [
      '70 analyses par mois',
      'DermaBot illimité',
      'Tout le Pro inclus',
      'Accès prioritaire absolu',
      'Pour les passionnés de skincare',
    ],
  },
];

export default function Forfaits() {
  const navigate = useNavigate();
  const [loadingId, setLoadingId] = useState(null);

  const handleChoose = async (plan) => {
    if (loadingId) return;
    setLoadingId(plan.id);
    try { localStorage.setItem('dermaci_payment_started', Date.now().toString()); } catch {}

    let email = '';
    try {
      const isAuthed = await base44.auth.isAuthenticated();
      if (isAuthed) { const u = await base44.auth.me(); email = (u?.email || '').toLowerCase().trim(); }
    } catch {}
    if (!email) { try { email = (localStorage.getItem('dermaci_device_email') || '').toLowerCase().trim(); } catch {} }

    // Enregistrer l'intention de paiement (email + device) côté serveur — sans bloquer
    try {
      await base44.functions.invoke('initPayment', { email, device_id: getDeviceId(), pass_type: plan.id });
    } catch (e) { /* on continue vers le lien quoi qu'il arrive */ }

    // Rediriger vers le lien GeniusPay du forfait (redirect_url déjà configuré côté produit)
    // Lien NU : les Link Pay GeniusPay cassent avec ?email&redirect_url. Le redirect est configure cote produit.
    window.location.href = plan.link;
  };

  return (
    <div className="min-h-screen px-4 py-6" style={{ background: 'linear-gradient(160deg, #07140d 0%, #04130c 55%, #08180f 100%)' }}>
      <div className="max-w-md mx-auto">

        {/* Header */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/60 text-sm mb-4" style={{ background: 'none', border: 'none' }}>
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>

        <motion.div className="text-center mb-7" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <img src={LOGO_URL} alt="DermaCI" className="object-contain mx-auto mb-4" style={{ width: 72, height: 72 }} />
          <h1 className="text-2xl font-black text-white leading-tight">Passe à la vitesse supérieure</h1>
          <p className="text-sm mt-2" style={{ color: 'rgba(255,255,255,0.55)' }}>
            Choisis le forfait qui correspond à ton rythme. Accès renouvelable chaque mois.
          </p>
        </motion.div>

        {/* Les 3 cartes */}
        <div className="space-y-4">
          {PLANS.map((plan, i) => {
            const Icon = plan.icon;
            const isPopular = plan.popular;
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.12, duration: 0.4 }}
                className="relative rounded-3xl overflow-hidden"
                style={{
                  background: isPopular ? 'linear-gradient(160deg, rgba(0,224,168,0.12), rgba(0,200,150,0.04))' : 'rgba(255,255,255,0.03)',
                  border: isPopular ? '1.5px solid rgba(0,224,168,0.5)' : '1px solid rgba(255,255,255,0.1)',
                  boxShadow: isPopular ? '0 10px 40px rgba(0,200,150,0.18)' : 'none',
                }}
              >
                {isPopular && (
                  <div className="absolute top-0 right-0 px-3 py-1 rounded-bl-xl text-xs font-black"
                    style={{ background: 'linear-gradient(135deg, #00A878, #00E0A8)', color: '#04130c' }}>
                    ⭐ LE PLUS POPULAIRE
                  </div>
                )}

                <div className="p-5">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-5 h-5" style={{ color: plan.accent }} />
                    <h2 className="text-xl font-black text-white">{plan.name}</h2>
                  </div>
                  <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.5)' }}>{plan.tagline}</p>

                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-3xl font-black text-white">{plan.price}</span>
                    <span className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>FCFA / mois</span>
                  </div>

                  <div className="space-y-2 mb-5">
                    {plan.features.map((f, j) => (
                      <div key={j} className="flex items-start gap-2.5">
                        <div className="mt-0.5 rounded-full p-0.5 flex-shrink-0" style={{ background: `${plan.accent}22` }}>
                          <Check className="w-3.5 h-3.5" style={{ color: plan.accent }} />
                        </div>
                        <span className="text-sm" style={{ color: 'rgba(255,255,255,0.85)' }}>{f}</span>
                      </div>
                    ))}
                  </div>

                  <motion.button
                    onClick={() => handleChoose(plan)}
                    disabled={loadingId !== null}
                    whileTap={{ scale: loadingId ? 1 : 0.97 }}
                    className="w-full rounded-2xl py-3.5 flex items-center justify-center gap-2 font-black text-base"
                    style={{
                      background: isPopular ? 'linear-gradient(135deg, #00A878, #00E0A8)' : 'rgba(255,255,255,0.08)',
                      color: isPopular ? '#04130c' : '#fff',
                      border: isPopular ? 'none' : '1px solid rgba(255,255,255,0.15)',
                    }}
                  >
                    {loadingId === plan.id
                      ? <><Loader2 className="w-5 h-5 animate-spin" /> Préparation…</>
                      : <>Choisir {plan.name} <Sparkles className="w-4 h-4" /></>}
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.p className="text-center text-xs mt-6" style={{ color: 'rgba(255,255,255,0.4)' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
          Paiement unique · valable 30 jours · sans renouvellement automatique
        </motion.p>
      </div>
    </div>
  );
}
