import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { CheckCircle, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const LOGO_URL = "https://media.base44.com/images/public/6a0e53b978ea3d5f75666bd8/fd6f17ab5_LE_LOGO_OFFICIEL.png";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [ready, setReady] = useState(false);
  const [analysisId, setAnalysisId] = useState(null);
  // ── Perfection de timing : le contenu complet (routines, actifs, aliments…)
  // est généré PENDANT que l'utilisateur lit cette page. On ne l'envoie vers
  // ses résultats que lorsque tout est écrit en base → jamais de section vide.
  const [waitingContent, setWaitingContent] = useState(false);
  const contentReadyRef = useRef(false);
  const wantsResultsRef = useRef(false);
  const analysisIdRef = useRef(null);

  // Dès l'arrivée sur la page → activer premium immédiatement, sans condition
  useEffect(() => {
    const activate = async () => {
      const fromUrl = searchParams.get('analysis_id') || searchParams.get('aid');
      let aid = fromUrl;
      if (!aid) {
        try {
          const stored = JSON.parse(localStorage.getItem('dermaci_pending_payment') || '{}');
          aid = stored.analysis_id || null;
        } catch { aid = null; }
      }

      // Si pas d'aid dans URL/pending, chercher dans dermaci_last_analysis_id
      if (!aid) {
        aid = localStorage.getItem('dermaci_last_analysis_id') || null;
      }

      setAnalysisId(aid);

      // Nettoyer SEULEMENT les clés de paiement — NE PAS effacer dermaci_analyses
      localStorage.removeItem('dermaci_payment_started');
      localStorage.removeItem('dermaci_pending_payment');
      // ⚠️ NE PAS faire localStorage.removeItem('dermaci_analyses') ici

      // Activer le premium ET récupérer l'analysis_id depuis le serveur
      try {
        const result = await base44.functions.invoke('activatePremiumAndGetAnalysis', {
          analysis_id: aid || null,
        });

        // Récupérer l'analysis_id retourné par le serveur
        const serverAnalysisId = result?.data?.analysis_id || result?.data?.id || result?.analysis_id || aid;

        if (serverAnalysisId) {
          // Ajouter l'analyse au localStorage (sans effacer les existantes)
          try {
            const existing = JSON.parse(localStorage.getItem('dermaci_analyses') || '[]');
            if (!existing.includes(serverAnalysisId)) {
              existing.unshift(serverAnalysisId);
              localStorage.setItem('dermaci_analyses', JSON.stringify(existing.slice(0, 50)));
            }
            localStorage.setItem('dermaci_last_analysis_id', serverAnalysisId);
          } catch {}

          setAnalysisId(serverAnalysisId);
        }

        // ── PRÉ-GÉNÉRATION (démarre PENDANT la lecture de cette page) ──
        // L'analyse gratuite n'a pas les rubriques payantes : on demande à
        // repairAnalysisC de les générer MAINTENANT, puis on surveille la base.
        // Quand l'utilisateur cliquera, tout sera (presque toujours) déjà prêt.
        const finalAid = serverAnalysisId || aid || null;
        analysisIdRef.current = finalAid;
        if (finalAid) {
          try { base44.functions.invoke('repairAnalysisC', { analysis_id: finalAid }).catch(() => {}); } catch {}
          const pollStart = Date.now();
          const pollContent = async () => {
            if (contentReadyRef.current) return;
            // Cap de sécurité 90s : au-delà on laisse partir (Results a son propre filet)
            if (Date.now() - pollStart > 90000) {
              contentReadyRef.current = true;
              if (wantsResultsRef.current) goToResults();
              return;
            }
            try {
              const res = await base44.functions.invoke('getAnalysis', { analysis_id: finalAid });
              const a = res?.data?.data || res?.data || null;
              if (a && Array.isArray(a.actifs) && a.actifs.length > 0
                    && Array.isArray(a.routine_matin) && a.routine_matin.length > 0) {
                contentReadyRef.current = true;
                // Si l'utilisateur a déjà cliqué et attend → départ immédiat
                if (wantsResultsRef.current) goToResults();
                return;
              }
            } catch {}
            setTimeout(pollContent, 3000);
          };
          setTimeout(pollContent, 2500);
        } else {
          // Pas d'analyse à compléter → rien à attendre
          contentReadyRef.current = true;
        }
      } catch (err) {
        console.error('[PaymentSuccess] activation:', err.message);
        // En cas d'échec d'activation, ne jamais bloquer le bouton
        contentReadyRef.current = true;
      }

      setReady(true);
    };

    activate();
  }, []);

  // Départ vers les résultats (utilisé au clic ET par le poll quand le contenu arrive)
  const goToResults = () => {
    const aid = analysisIdRef.current || localStorage.getItem('dermaci_last_analysis_id');
    if (aid) {
      navigate(`/results/${aid}?unlocked=1`);
      return;
    }
    // Dernier recours : chercher dans la liste d'analyses
    try {
      const stored = JSON.parse(localStorage.getItem('dermaci_analyses') || '[]');
      if (stored.length > 0) {
        navigate(`/results/${stored[0]}?unlocked=1`);
        return;
      }
    } catch {}
    navigate('/analyses');
  };

  const handleViewAnalysis = () => {
    // Activer DermaBot uniquement au clic sur ce bouton
    localStorage.setItem('dermaci_dermabot_unlocked', '1');

    // Si le paiement vient du paywall "limite atteinte" -> retour ACCUEIL avec animation premium
    // Securite : on ne fait confiance au marqueur 'home' que s'il est RECENT (< 30 min),
    // pour qu'un vieux marqueur oublie ne detourne jamais le retour.
    let origin = '';
    let startedAt = 0;
    try {
      origin = localStorage.getItem('dermaci_payment_origin') || '';
      startedAt = parseInt(localStorage.getItem('dermaci_payment_started') || '0', 10) || 0;
    } catch {}
    const recent = startedAt > 0 && (Date.now() - startedAt) < 30 * 60 * 1000;
    // On nettoie TOUJOURS le marqueur, quelle que soit la decision (pas de residu).
    try { localStorage.removeItem('dermaci_payment_origin'); } catch {}
    if (origin === 'home' && recent) {
      navigate('/?premium=1');
      return;
    }

    // ── Perfection de timing : on ne part vers les résultats QUE si le contenu
    // complet est écrit en base. Sinon, le bouton passe en mode préparation et
    // le départ se fait automatiquement dès que c'est prêt (voir pollContent).
    if (contentReadyRef.current) {
      goToResults();
    } else {
      wantsResultsRef.current = true;
      setWaitingContent(true);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-8">
      <motion.div
        className="w-full max-w-sm text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src={LOGO_URL} alt="DermaCI" className="w-16 h-16 object-contain" />
        </div>

        {/* Icône succès */}
        <motion.div
          className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: 'rgba(0,200,150,0.15)', border: '2px solid rgba(0,200,150,0.4)' }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 250 }}
        >
          <CheckCircle className="w-12 h-12" style={{ color: '#00C896' }} />
        </motion.div>

        {/* Titre */}
        <motion.h2
          className="text-2xl font-black text-foreground mb-2"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        >
          🎉 Paiement confirmé !
        </motion.h2>

        <motion.p
          className="text-sm text-muted-foreground mb-8 leading-relaxed"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
        >
          Votre accès premium est activé à vie. Cliquez ci-dessous pour continuer.
        </motion.p>

        {/* Ce qui est débloqué */}
        <motion.div
          className="p-4 rounded-2xl mb-8 text-left space-y-2"
          style={{ background: 'rgba(0,200,150,0.08)', border: '1px solid rgba(0,200,150,0.2)' }}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        >
          {[
            '✅ Analyse complète débloquée instantanément',
            '✅ Toutes vos futures analyses automatiquement débloquées',
            '✅ Historique complet sur "Mes analyses"',
            '✅ Accès à vie · Sans abonnement',
          ].map((item, i) => (
            <motion.p
              key={i}
              className="text-sm text-foreground/80 font-medium"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.55 + i * 0.08 }}
            >
              {item}
            </motion.p>
          ))}
        </motion.div>

        {/* BOUTON — redirige directement */}
        <motion.button
          onClick={handleViewAnalysis}
          disabled={!ready || waitingContent}
          className="w-full py-5 rounded-2xl font-black text-white text-lg flex items-center justify-center gap-3"
          style={{
            background: ready
              ? 'linear-gradient(135deg, #00A878, #00C896)'
              : 'rgba(0,200,150,0.4)',
            boxShadow: ready ? '0 10px 32px rgba(0,168,120,0.45)' : 'none',
            transition: 'all 0.3s ease',
          }}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          whileTap={{ scale: ready && !waitingContent ? 0.97 : 1 }}
        >
          {!ready ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              Activation en cours…
            </>
          ) : waitingContent ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              Préparation de ton analyse complète…
            </>
          ) : (
            <>
              <Sparkles className="w-6 h-6" />
              Continuer
              <ArrowRight className="w-6 h-6" />
            </>
          )}
        </motion.button>

        <motion.p
          className="text-xs text-muted-foreground/50 mt-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
        >
          DermaCI · Accès à vie activé
        </motion.p>
      </motion.div>
    </div>
  );
}
