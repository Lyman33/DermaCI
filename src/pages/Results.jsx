import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { BarChart3, Home, AlertCircle, RefreshCw, Clock, Zap, AlertTriangle, TrendingDown, Sun, Moon, FlaskConical, Apple, Heart, LineChart, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

// ── Imports adaptés au nouveau projet ──────────────────────────────────────
import HeroSection from '@/components/results/HeroSection';

import ScoreBreakdown from '@/components/results/ScoreBreakdown';
import PaywallBlock from '@/components/results/PaywallBlock';
import ProblemsSection from '@/components/results/ProblemsSection';
import CausesSection from '@/components/results/CausesSection';
import RoutineSection from '@/components/results/RoutineSection';
import ActifsSection from '@/components/results/ActifsSection';
import NutritionSection from '@/components/results/NutritionSection';
import HabitudesSection from '@/components/results/HabitudesSection';
import EvolutionSection from '@/components/results/EvolutionSection';
import DisclaimerSection from '@/components/results/DisclaimerSection';
import PharmacySection from '@/components/results/PharmacySection';
import PharmacyDisclaimer from '@/components/results/PharmacyDisclaimer';
import CollapsibleSection from '@/components/results/CollapsibleSection';
import BottomNav from '@/components/results/BottomNav';

const arr = (v) => (Array.isArray(v) ? v : []);
const obj = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? v : {});

function getPremiumCacheKey(email) {
  return `dermaci_premium_${(email || '').toLowerCase().trim()}`;
}
function getCachedPremium(email) {
  try { return localStorage.getItem(getPremiumCacheKey(email)) === '1'; } catch { return false; }
}
function setCachedPremium(email) {
  try { localStorage.setItem(getPremiumCacheKey(email), '1'); } catch {}
}

function AnalysisLoader({ progress = 0 }) {
  const LOGO_URL = "https://media.base44.com/images/public/6a14a8290af9b7a6761f47b4/93361018d_LELOGOOFFICIEL.png";
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 relative overflow-hidden">

      {/* Animations fond */}
      <motion.div className="absolute rounded-full pointer-events-none"
        style={{ width: 250, height: 250, background: 'radial-gradient(circle, rgba(0,168,120,0.08) 0%, transparent 70%)', top: '-5%', right: '-10%' }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }} />
      <motion.div className="absolute rounded-full pointer-events-none"
        style={{ width: 180, height: 180, background: 'radial-gradient(circle, rgba(0,200,150,0.07) 0%, transparent 70%)', bottom: '10%', left: '-8%' }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 3 }} />

      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Logo avec halo pulsant */}
        <motion.div className="relative"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, type: 'spring', stiffness: 120 }}>
          <motion.div className="absolute inset-0 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(0,168,120,0.2), transparent 70%)', transform: 'scale(1.5)' }}
            animate={{ scale: [1.5, 1.8, 1.5], opacity: [0.6, 0.3, 0.6] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }} />
          <img src={LOGO_URL} alt="DermaCI" className="w-28 h-28 object-contain relative z-10"
            style={{ mixBlendMode: 'multiply' }} />
        </motion.div>

        {/* Texte */}
        <div className="text-center">
          <motion.h2 className="font-inter font-black text-2xl text-foreground mb-1"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            Analyse en cours…
          </motion.h2>
          <motion.p className="text-sm text-muted-foreground"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            Veuillez patienter
          </motion.p>
        </div>

        {/* Barre de progression */}
        <motion.div className="w-56 h-2 bg-muted rounded-full overflow-hidden"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <motion.div className="h-full bg-primary rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{ boxShadow: '0 0 12px rgba(0,168,120,0.5)' }} />
        </motion.div>

        {/* Pourcentage */}
        <motion.p className="text-sm font-bold text-primary -mt-3"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          {Math.round(progress)}%
        </motion.p>
      </div>
    </div>
  );
}

function SectionDivider({ label }) {
  return (
    <div className="flex items-center gap-3 mx-4 my-2">
      <div className="flex-1 h-px" style={{ background: 'rgba(0,0,0,0.06)' }} />
      <span className="text-xs text-muted-foreground/50 font-medium px-2">{label}</span>
      <div className="flex-1 h-px" style={{ background: 'rgba(0,0,0,0.06)' }} />
    </div>
  );
}

function IncompleteAnalysisBanner() {
  return (
    <div className="mx-4 mb-4 p-3 rounded-2xl flex items-start gap-3"
      style={{ background: 'rgba(245,200,66,0.12)', border: '1px solid rgba(245,200,66,0.25)' }}>
      <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-yellow-400 text-xs font-semibold mb-0.5">Analyse partiellement générée</p>
        <p className="text-yellow-400/70 text-xs leading-relaxed">
          Certaines sections n'ont pas pu être générées. Faites une nouvelle analyse pour un rapport complet.
        </p>
      </div>
    </div>
  );
}

export default function Results() {
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'DermaCI — Analyse dermatologique IA';
  }, []);
  const { isAuthenticated, navigateToLogin } = useAuth();
  const [analysis, setAnalysis]             = useState(null);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState(null);
  // Si l'utilisateur a déjà cliqué "Voir mon analyse =>" après paiement, il est premium pour toujours
  const isForeverUnlocked = () => localStorage.getItem('dermaci_dermabot_unlocked') === '1';
  const [isPremium, setIsPremium]           = useState(isForeverUnlocked);
  const [paymentPending, setPaymentPending] = useState(false);
  const [justUnlocked, setJustUnlocked]     = useState(false); // eslint-disable-line no-unused-vars
  const [userClickedUnlock, setUserClickedUnlock] = useState(false); // nouveau flag
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const topRef     = useRef(null);
  const pollRef    = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  // Fetch analysis depuis le serveur — is_premium est la seule source de vérité
  const fetchAnalysisFromServer = useCallback(async (email) => {
   const normalizedEmail = (email || '').toLowerCase().trim();
   const res  = await base44.functions.invoke('getAnalysis', { analysis_id: id, email: normalizedEmail });
   const body = res?.data || {};
   return { data: body.data || null, isPremium: body.is_premium === true };
  }, [id]);

  const checkPremiumFromDB = async () => {
    try {
      const user = await base44.auth.me();
      if (!user?.email) return false;

      const email = user.email.toLowerCase().trim();

      // Check 1 : UserProfile direct
      const profiles = await base44.entities.UserProfile.filter({ email });
      if (profiles?.[0]?.has_global_access === true) {
        setCachedPremium(email);
        return true;
      }

      // Check 2 : Payment confirmé (filet de sécurité)
      const payments = await base44.entities.Payment.filter({
        email,
        status: 'confirmed'
      });
      if (payments?.length > 0) {
        if (profiles?.length > 0) {
          await base44.entities.UserProfile.update(profiles[0].id, {
            has_global_access: true,
          });
        } else {
          await base44.entities.UserProfile.create({
            email,
            has_global_access: true,
            paid_at: new Date().toISOString(),
            provider: 'geniuspay',
            total_analyses: 0,
          });
        }
        setCachedPremium(email);
        return true;
      }

      return false;
    } catch (err) {
      console.error('[checkPremium] Erreur:', err.message);
      return false;
    }
  };

  const activatePremium = useCallback((email) => {
    localStorage.removeItem('dermaci_payment_started');
    if (!mountedRef.current) return;
    if (pollRef.current) clearInterval(pollRef.current);
    setPaymentPending(false);
    setIsPremium(true);
    setCachedPremium(email || currentUserEmail);
  }, [currentUserEmail]);

  const startPolling = useCallback((email) => {
    if (pollRef.current) clearInterval(pollRef.current);
    setPaymentPending(true);
    let attempts = 0;
    const check = async () => {
      if (!mountedRef.current) return;
      attempts++;
      try {
        let reference = null;
        try {
          const stored = JSON.parse(localStorage.getItem('dermaci_pending_payment') || '{}');
          reference = stored.reference || null;
        } catch {}

        const result = await base44.functions.invoke('checkAndActivatePremium', { reference });
        const premium = result?.data?.premium === true || result?.premium === true;
        if (premium && mountedRef.current) { activatePremium(email || currentUserEmail); return; }
      } catch {}
      if (attempts < 150) {
        setTimeout(check, 4000);
      } else {
        setPaymentPending(false);
      }
    };
    check();
  }, [currentUserEmail, activatePremium]);

  useEffect(() => {
    const handleVisibility = async () => {
      if (isForeverUnlocked()) return; // déjà premium pour toujours
      if (document.visibilityState === 'visible' && !isPremium && mountedRef.current) {
        const { isPremium: premium } = await fetchAnalysisFromServer(currentUserEmail);
        if (premium && mountedRef.current) activatePremium(currentUserEmail);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [isPremium, currentUserEmail, fetchAnalysisFromServer, activatePremium]);

  // Vérifier immédiatement si on revient d'un paiement (localStorage)
  useEffect(() => {
    const checkAfterPayment = async () => {
      const paymentStarted = localStorage.getItem('dermaci_payment_started');
      if (!paymentStarted || isPremium || !currentUserEmail) return;
      
      const elapsed = Date.now() - parseInt(paymentStarted);
      // Si paiement initié il y a moins de 30 minutes
      if (elapsed < 30 * 60 * 1000) {
        try {
          const { isPremium: premium } = await fetchAnalysisFromServer(currentUserEmail);
          if (premium && mountedRef.current) {
            activatePremium(currentUserEmail);
          }
        } catch {}
      }
    };
    checkAfterPayment();
  }, [currentUserEmail, isPremium, fetchAnalysisFromServer, activatePremium]);

  const handleUnlockClick = useCallback(() => {
    // Marquer que l'utilisateur a cliqué
    setUserClickedUnlock(true);
    // Ne pas activer le premium ici — juste démarrer le polling en attente du webhook
    startPolling(currentUserEmail);
  }, [startPolling, currentUserEmail]);

  const [loaderProgress, setLoaderProgress] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        // ── PRIORITÉ ABSOLUE : ?unlocked=1 depuis PaymentSuccess ──
        // Ce flag est immuable — rien ne peut l'écraser, ni le serveur ni le cache
        const urlParams = new URLSearchParams(window.location.search);
        const justUnlockedParam = urlParams.get('unlocked') === '1' || localStorage.getItem('dermaci_just_unlocked') === '1';
        if (justUnlockedParam) {
          localStorage.removeItem('dermaci_just_unlocked');
          localStorage.setItem('dermaci_dermabot_unlocked', '1');
          setIsPremium(true);
          setPaymentPending(false);
        }

        let userEmail = '';
        try {
          const isAuthed = await base44.auth.isAuthenticated();
          if (isAuthed) {
            const user = await base44.auth.me();
            userEmail = (user?.email || '').toLowerCase().trim();
            setCurrentUserEmail(userEmail);
            if (justUnlockedParam && userEmail) setCachedPremium(userEmail);
          }
        } catch {}

        let fetchedAnalysis = null;
        let serverIsPremium = false;
        if (mountedRef.current) setLoaderProgress(60);

        // Sauvegarder l'ID courant pour PaymentSuccess
        try { localStorage.setItem('dermaci_last_analysis_id', id); } catch {}

        try {
          const { data, isPremium: premiumFromServer } = await fetchAnalysisFromServer(userEmail);
          if (data && typeof data === 'object') { fetchedAnalysis = data; serverIsPremium = premiumFromServer; }
        } catch (fetchErr) {
          await new Promise(r => setTimeout(r, 1500));
          try {
            const { data, isPremium: premiumFromServer } = await fetchAnalysisFromServer(userEmail);
            if (data && typeof data === 'object') { fetchedAnalysis = data; serverIsPremium = premiumFromServer; }
          } catch {}
        }

        if (mountedRef.current) setLoaderProgress(100);
        await new Promise(r => setTimeout(r, 300));

        if (!fetchedAnalysis) {
          if (!mountedRef.current) return;
          throw new Error('Analyse introuvable. Veuillez refaire une analyse.');
        }

        setAnalysis(fetchedAnalysis);

        // ── AUTO-REPAIR : déclencher repairAnalysisC si actifs/aliments vides ──
        const needsRepair = (
          fetchedAnalysis.analysis_complete === true &&
          (!Array.isArray(fetchedAnalysis.actifs) || fetchedAnalysis.actifs.length === 0)
        );
        if (needsRepair) {
          base44.functions.invoke('repairAnalysisC', { analysis_id: id })
            .then(() => {
              const start = Date.now();
              const poll = async () => {
                if (Date.now() - start > 120000) return;
                await new Promise(r => setTimeout(r, 4000));
                try {
                  const res = await base44.functions.invoke('getAnalysis', { analysis_id: id });
                  const updated = res?.data?.data || res?.data || null;
                  if (updated && Array.isArray(updated.actifs) && updated.actifs.length > 0) {
                    setAnalysis(updated);
                    return;
                  }
                } catch {}
                poll();
              };
              poll();
            })
            .catch(err => console.warn('[autoRepair] failed:', err.message));
        }
        // ── FIN AUTO-REPAIR ──

        // Sauvegarder l'ID localement pour l'historique
        try {
          const stored = JSON.parse(localStorage.getItem('dermaci_analyses') || '[]');
          if (!stored.includes(id)) {
            stored.unshift(id);
            localStorage.setItem('dermaci_analyses', JSON.stringify(stored.slice(0, 50)));
          }
        } catch {}

        // ── APPLIQUER STATUT PREMIUM — jamais écraser si déjà unlocked ──
        if (justUnlockedParam || isForeverUnlocked()) {
          // Vient de payer OU a déjà payé → premium garanti, fin
          if (mountedRef.current) {
            setIsPremium(true);
            if (userEmail) setCachedPremium(userEmail);
          }
          return;
        }

        if (mountedRef.current) {
          if (serverIsPremium) {
            setIsPremium(true);
            if (userEmail) setCachedPremium(userEmail);
          } else {
            const cachedPrem = getCachedPremium(userEmail);
            if (!cachedPrem) {
              setIsPremium(false);
              // Démarrer polling si paiement en cours
              const paymentStarted = localStorage.getItem('dermaci_payment_started');
              const pendingPayment = localStorage.getItem('dermaci_pending_payment');
              if ((paymentStarted || pendingPayment) && userEmail) {
                startPolling(userEmail);
              }
            } else {
              setIsPremium(true);
            }
          }
        }
      } catch (err) {
        if (mountedRef.current) setError(err.message || 'Erreur de chargement.');
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    };
    load();
  }, [id, fetchAnalysisFromServer]);



  if (loading) return <AnalysisLoader progress={loaderProgress} />;

  // 🔴 GATE CRITIQUE : Si l'analyse n'est PAS complète, rediriger vers AnalysisLoading
  if (!error && analysis && analysis.analysis_complete !== true) {
    return <AnalysisLoader progress={0} />;
  }

  if (error || !analysis) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-background">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <p className="text-lg text-muted-foreground mb-6">{error || 'Analyse introuvable'}</p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Button className="rounded-full bg-primary text-primary-foreground"
            onClick={() => window.location.reload()}>Réessayer</Button>
          <Button variant="outline" className="rounded-full"
            onClick={() => navigate('/analysis')}>Nouvelle analyse</Button>
          <Button variant="ghost" className="rounded-full"
            onClick={() => navigate('/analyses')}>Mes analyses</Button>
        </div>
      </div>
    );
  }

  const score_breakdown = obj(analysis?.score_breakdown);
  const problems        = arr(analysis?.problems);
  const causes          = arr(analysis?.causes);
  const routine_matin   = arr(analysis?.routine_matin);
  const routine_soir    = arr(analysis?.routine_soir);
  const actifs          = arr(analysis?.actifs);
  const aliments        = arr(analysis?.aliments);
  const habitudes       = arr(analysis?.habitudes);
  const tracking        = obj(analysis?.tracking);
  const photo_url       = analysis?.photo_url;



  return (
    <div className="bg-background">
      <div ref={topRef} />

      {/* Bannière attente paiement */}
      <AnimatePresence>
        {paymentPending && !isPremium && userClickedUnlock && (
          <motion.div
            className="fixed top-0 left-0 right-0 z-50 px-4 py-3 flex items-center justify-center gap-3"
            style={{ background: 'rgba(245,200,66,0.97)', backdropFilter: 'blur(8px)' }}
            initial={{ y: -60 }} animate={{ y: 0 }} exit={{ y: -60 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
            <Clock className="w-4 h-4 text-black flex-shrink-0 animate-pulse" />
            <p className="text-sm font-semibold text-black text-center">
              En attente de confirmation — votre accès se débloquera automatiquement ✨
            </p>
            <div className="w-3.5 h-3.5 border-2 border-black/20 border-t-black rounded-full animate-spin flex-shrink-0" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero + Score */}
      <HeroSection analysis={analysis} />

      <ScoreBreakdown breakdown={score_breakdown} skinType={analysis?.skin_type} />

      {/* Contenu selon statut premium */}
      {!isPremium ? (
        <>
          <PaywallBlock onUnlock={handleUnlockClick} paymentPending={paymentPending} user={{ email: currentUserEmail }} startPolling={startPolling} />
          <div style={{ 
            opacity: 0.15, 
            filter: 'blur(6px)', 
            pointerEvents: 'none',
            userSelect: 'none',
            overflow: 'hidden'
          }}>
            <ProblemsSection problems={analysis?.problems || []} />
            <CausesSection causes={analysis?.causes || []} />
            <RoutineSection 
              routineMatin={analysis?.routine_matin || []} 
              routineSoir={analysis?.routine_soir || []} 
            />
            <ActifsSection actifs={analysis?.actifs || []} />
            <NutritionSection aliments={analysis?.aliments || []} />
            <HabitudesSection habitudes={analysis?.habitudes || []} />
            <EvolutionSection tracking={analysis?.tracking || {}} />
          </div>
        </>
      ) : (
        <div className="pt-2">
          <CollapsibleSection label="Problèmes détectés" icon={<AlertTriangle className="w-4 h-4" />} color="#E74C3C" defaultOpen={true}>
            <ProblemsSection problems={problems} />
          </CollapsibleSection>

          <CollapsibleSection label="Causes identifiées" icon={<TrendingDown className="w-4 h-4" />} color="#8B5CF6">
            <CausesSection causes={causes} />
          </CollapsibleSection>

          <CollapsibleSection label="Routine matin & soir" icon={<Sun className="w-4 h-4" />} color="#F5A623">
            <RoutineSection routineMatin={routine_matin} routineSoir={routine_soir} photoUrl={photo_url} />
          </CollapsibleSection>

          <CollapsibleSection label="Actifs scientifiques" icon={<FlaskConical className="w-4 h-4" />} color="#00C896">
            <ActifsSection actifs={actifs} />
          </CollapsibleSection>

          <CollapsibleSection label="Pharmacies proches" icon={<MapPin className="w-4 h-4" />} color="#E74C3C">
            <PharmacySection actifs={actifs} />
            <PharmacyDisclaimer />
          </CollapsibleSection>

          <CollapsibleSection label="Nutrition ivoirienne" icon={<Apple className="w-4 h-4" />} color="#F5A623">
            <NutritionSection aliments={aliments} />
          </CollapsibleSection>

          <CollapsibleSection label="Habitudes de vie" icon={<Heart className="w-4 h-4" />} color="#EC4899">
            <HabitudesSection habitudes={habitudes} />
          </CollapsibleSection>

          <CollapsibleSection label="Évolution & Suivi" icon={<LineChart className="w-4 h-4" />} color="#06B6D4">
            <EvolutionSection tracking={tracking} />
          </CollapsibleSection>

          <DisclaimerSection />
        </div>
      )}

      {/* Navigation bas */}
      <BottomNav isPremium={isPremium} navigate={navigate} />
    </div>
  );
}