import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { ScanFace, FlaskConical, Droplets, BookOpen, Leaf, Sparkles, CheckCircle, X } from 'lucide-react';

const LOGO_URL = "https://media.base44.com/images/public/6a0e53b978ea3d5f75666bd8/fd6f17ab5_LE_LOGO_OFFICIEL.png";

const LOADER_MESSAGES = [
  { Icon: ScanFace,     text: "Analyse de votre type de peau..." },
  { Icon: FlaskConical, text: "Détection des problèmes cutanés..." },
  { Icon: Droplets,     text: "Étude de la texture et du teint..." },
  { Icon: BookOpen,     text: "Génération de votre routine..." },
  { Icon: Leaf,         text: "Recommandations ivoiriennes..." },
  { Icon: Sparkles,     text: "Finalisation de votre rapport..." },
];

const NOTIF_ICON = "https://media.base44.com/images/public/6a0e53b978ea3d5f75666bd8/fd6f17ab5_LE_LOGO_OFFICIEL.png";

function sendPushNotification(title, body, tag, analysisId, navigate) {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  if (document.visibilityState === 'visible') return; // page active, pas besoin
  try {
    const n = new Notification(title, { body, icon: NOTIF_ICON, tag, requireInteraction: tag === 'dermaci-complete' });
    if (navigate && analysisId) {
      n.onclick = () => { window.focus(); navigate(`/results/${analysisId}`); n.close(); };
    }
  } catch (e) { console.warn('Notification error:', e); }
}

export default function AnalysisLoading() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const [error, setError] = useState(null);
  const [isComplete, setIsComplete] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const doneRef = useRef(false);
  const intervalRef = useRef(null);
  const pollRef = useRef(null);
  const visibilityRef = useRef(null);

  // Demander la permission dès l'arrivée sur cette page
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Message rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % LOADER_MESSAGES.length);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  // Vérifier la visibilité de la page
  useEffect(() => {
    const handleVisibilityChange = () => {
      visibilityRef.current = document.visibilityState === 'visible';
      // Si l'utilisateur revient et l'analyse est complète, afficher la notification
      if (visibilityRef.current && isComplete) {
        setShowNotification(true);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isComplete]);

  // Main effect
  useEffect(() => {
    const MAX_WAIT_MS = 120000; // 2 minutes max
    const startTime = Date.now();
    let analysisComplete = false;

    // Progression linéaire
    const progressInterval = setInterval(() => {
      if (doneRef.current) return;
      const elapsed = Date.now() - startTime;
      const percent = Math.min(99, (elapsed / MAX_WAIT_MS) * 100);
      setProgress(percent);
    }, 100);

    // Polling backend
    const pollAnalysis = async () => {
      try {
        const res = await base44.functions.invoke('getAnalysis', { analysis_id: id });
        const data = res?.data?.data || res?.data || null;

        if (data && typeof data === 'object' && data.analysis_complete === true) {
          analysisComplete = true;
          doneRef.current = true;
          clearInterval(progressInterval);
          setProgress(100);
          setIsComplete(true);

          // Notification push système (même si la page est visible)
          sendPushNotification(
            '🌿 DermaCI — Analyse complète !',
            'Votre rapport dermatologique personnalisé est prêt. Cliquez pour découvrir !',
            'dermaci-complete',
            id,
            navigate
          );

          if (document.visibilityState === 'visible') {
            await new Promise(r => setTimeout(r, 300));
            navigate(`/results/${id}`);
          } else {
            setShowNotification(true);
          }
          return;
        }
      } catch (err) {
        console.warn('Poll error:', err);
      }
    };

    // Commencer à pôler
    pollRef.current = setInterval(pollAnalysis, 1500);

    // Timeout fallback
    const timeoutId = setTimeout(() => {
      if (!analysisComplete && !doneRef.current) {
        doneRef.current = true;
        clearInterval(progressInterval);
        clearInterval(pollRef.current);
        setProgress(100);
        setTimeout(() => navigate(`/results/${id}`), 500);
      }
    }, MAX_WAIT_MS);

    return () => {
      clearInterval(progressInterval);
      clearInterval(pollRef.current);
      clearTimeout(timeoutId);
    };
  }, [id, navigate]);

  const { text } = LOADER_MESSAGES[messageIndex % LOADER_MESSAGES.length];
  const circumference = 2 * Math.PI * 50;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 font-dm-sans">
      {/* Cercle progression */}
      <div className="relative w-28 h-28 mb-6">
        <svg width="112" height="112" className="-rotate-90 w-full h-full">
          <circle cx="56" cy="56" r="50" fill="none" stroke="hsl(var(--border))" strokeWidth="6" />
          <circle cx="56" cy="56" r="50" fill="none" stroke="hsl(var(--primary))" strokeWidth="6"
            strokeLinecap="round" strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress / 100)}
            style={{ transition: 'stroke-dashoffset 0.1s linear' }} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}>
            <img src={LOGO_URL} alt="DermaCI" className="w-20 h-20 object-contain" style={{ mixBlendMode: 'multiply' }} />
          </motion.div>
        </div>
      </div>

      <p className="font-inter text-4xl font-black text-primary mb-2">{Math.round(progress)}%</p>
      <motion.p key={messageIndex} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }} className="text-sm text-foreground/60 text-center mb-6">
        {text}
      </motion.p>
      
      <div className="w-full max-w-xs h-1.5 rounded-full bg-foreground/10 overflow-hidden">
        <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%`, transition: 'width 0.1s linear' }} />
      </div>
      
      <p className="text-xs text-foreground/35 mt-4 text-center">Finalisation de votre rapport · Veuillez patienter</p>

      {/* Notification quand résultats sont prêts */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-6 right-6 max-w-sm mx-auto z-50"
          >
            <div
              className="p-4 rounded-2xl flex items-center gap-3 shadow-lg border"
              style={{
                background: 'rgba(0, 200, 150, 0.95)',
                backdropFilter: 'blur(12px)',
                borderColor: 'rgba(0, 200, 150, 0.3)'
              }}
            >
              <CheckCircle className="w-5 h-5 text-white flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">Votre analyse est prête ! ✨</p>
                <p className="text-xs text-white/80">Cliquez pour voir vos résultats</p>
              </div>
              <button
                onClick={() => navigate(`/results/${id}`)}
                className="px-4 py-2 rounded-lg font-semibold text-xs whitespace-nowrap"
                style={{ background: 'rgba(255, 255, 255, 0.2)', color: '#fff' }}
              >
                Voir résultats
              </button>
              <button
                onClick={() => setShowNotification(false)}
                className="p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}