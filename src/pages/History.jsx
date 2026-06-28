import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import {
  Plus, TrendingUp, TrendingDown, ArrowLeft, Sparkles,
  BarChart3, Award, Target, Trash2, AlertTriangle,
  Droplets, Sun, Shield, ChevronRight, Inbox, MessageCircle
} from 'lucide-react';
import DermaBotHistoryFAB from '../components/dermabot/DermaBotHistoryFAB';
import DermaBotName from '../components/dermabot/DermaBotName';
import { motion, AnimatePresence } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';



const LOGO_URL = "https://media.base44.com/images/public/6a0e53b978ea3d5f75666bd8/fd6f17ab5_LE_LOGO_OFFICIEL.png";

// ── HELPERS ────────────────────────────────────────────────────────────────
function blendColors(hex1, hex2, ratio) {
  const r1=parseInt(hex1.slice(1,3),16),g1=parseInt(hex1.slice(3,5),16),b1=parseInt(hex1.slice(5,7),16);
  const r2=parseInt(hex2.slice(1,3),16),g2=parseInt(hex2.slice(3,5),16),b2=parseInt(hex2.slice(5,7),16);
  const r=Math.round(r1+(r2-r1)*ratio),g=Math.round(g1+(g2-g1)*ratio),b=Math.round(b1+(b2-b1)*ratio);
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
}

function getSkinTypeColor(skinType) {
  const full = (skinType || '').toLowerCase();
  // Couleur de base = TYPE PRINCIPAL (avant "a tendance"), pas la tendance.
  const t = full.split(/\s*[aà]\s+tendance\s*/)[0];
  let base = '#00A878';
  if (t.includes('grasse'))                                             base = '#D4A017';
  else if (t.includes('mixte'))                                         base = '#256D85';
  else if (t.includes('sèche') || t.includes('seche'))                 base = '#C68642';
  else if (t.includes('sensible'))                                      base = '#D977A8';
  else if (t.includes('mature'))                                        base = '#6D214F';
  else if (t.includes('déshydrat') || t.includes('deshydrat'))         base = '#60A5FA';
  else if (t.includes('normale'))                                       base = '#059669';
  else if (t.includes('acné') || t.includes('acne') || t.includes('acneique') || t.includes('acnéique')) base = '#DC2626';

  // La tendance ajuste la nuance a 60% (on lit la chaine complete 'full').
  if (full.includes('tendance acné') || full.includes('tendance acne') || full.includes('tendance acneique') || full.includes('tendance acnéique'))
    return blendColors(base, '#DC2626', 0.60);
  if (full.includes('tendance grasse') || full.includes('predominance grasse') || full.includes('prédominance grasse'))
    return blendColors(base, '#D4A017', 0.60);
  if (full.includes('tendance seche') || full.includes('tendance sèche') || full.includes('predominance seche') || full.includes('prédominance sèche'))
    return blendColors(base, '#C68642', 0.60);
  if (full.includes('tendance pigment') || full.includes('tendance terne'))
    return blendColors(base, '#92400E', 0.60);
  if (full.includes('tendance sensible') || full.includes('tendance reactive') || full.includes('tendance réactive'))
    return blendColors(base, '#D977A8', 0.60);
  if (full.includes('tendance mature'))
    return blendColors(base, '#6D214F', 0.60);
  if (full.includes('tendance deshydrat') || full.includes('tendance déshydrat'))
    return blendColors(base, '#60A5FA', 0.60);
  if (full.includes('tendance couperose') || full.includes('tendance couperosée'))
    return blendColors(base, '#F87171', 0.60);
  if (full.includes('tendance atopique'))
    return blendColors(base, '#A78BFA', 0.60);
  if (full.includes('tendance mixte'))
    return blendColors(base, '#256D85', 0.60);
  if (full.includes('tendance normale'))
    return blendColors(base, '#059669', 0.60);

  return base;
}

function getScoreColor(score) {
  if (score >= 75) return '#00C896';
  if (score >= 50) return '#F5A623';
  return '#E74C3C';
}

function getScoreLabel(score) {
  if (score >= 85) return 'Excellente';
  if (score >= 70) return 'Très bonne';
  if (score >= 60) return 'Bonne';
  if (score >= 50) return 'Correcte';
  return 'À améliorer';
}

function getScoreEmoji(score) {
  if (score >= 85) return '✨';
  if (score >= 70) return '💚';
  if (score >= 60) return '🌿';
  if (score >= 50) return '💛';
  return '🌱';
}

// ── SKELETON LOADER ─────────────────────────────────────────────────────────
function SkeletonLoader() {
  const LOGO_URL = "https://media.base44.com/images/public/6a0e53b978ea3d5f75666bd8/fd6f17ab5_LE_LOGO_OFFICIEL.png";
  
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Fond animé */}
      <motion.div className="absolute rounded-full pointer-events-none"
        style={{ width: 250, height: 250, background: 'radial-gradient(circle, rgba(0,168,120,0.08) 0%, transparent 70%)', top: '-5%', right: '-10%' }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }} />
      <motion.div className="absolute rounded-full pointer-events-none"
        style={{ width: 180, height: 180, background: 'radial-gradient(circle, rgba(0,200,150,0.07) 0%, transparent 70%)', bottom: '10%', left: '-8%' }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 3 }} />

      {/* Logo avec halo pulsant */}
      <motion.div className="relative z-10"
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
      <motion.div className="text-center mt-8"
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h2 className="font-inter font-black text-2xl text-foreground mb-2">
          Chargement de vos analyses…
        </h2>
        <p className="text-sm text-muted-foreground">
          Accès à votre historique dermatologique
        </p>
      </motion.div>

      {/* Points animés */}
      <div className="flex gap-2 mt-8">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-primary"
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
    </div>
  );
}

// ── GRAPHIQUE D'ÉVOLUTION ─────────────────────────────────────────────────
function EvolutionChart({ analyses }) {
  if (analyses.length < 2) return null;

  const scores  = analyses.slice(0, 8).reverse().map(a => a.score || 0);
  const dates   = analyses.slice(0, 8).reverse().map(a =>
    a.created_date ? format(new Date(a.created_date), 'd MMM', { locale: fr }) : ''
  );
  const minScore = Math.max(0,  Math.min(...scores) - 10);
  const maxScore = Math.min(100, Math.max(...scores) + 10);
  const range    = maxScore - minScore || 1;

  const W = 320, H = 120, PAD = 16;
  const xStep = (W - PAD * 2) / (scores.length - 1);

  const points = scores.map((s, i) => ({
    x: PAD + i * xStep,
    y: H - PAD - ((s - minScore) / range) * (H - PAD * 2),
    score: s,
    date: dates[i],
  }));

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  // Zone remplie sous la courbe
  const areaD = `${pathD} L ${points[points.length-1].x} ${H} L ${points[0].x} ${H} Z`;

  const latest = scores[scores.length - 1];
  const prev   = scores[scores.length - 2];
  const diff   = latest - prev;

  return (
    <motion.div
      className="mb-5 rounded-2xl overflow-hidden border border-border"
      style={{ background: 'rgba(0,168,120,0.04)' }}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      {/* En-tête du graphique */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-foreground/60 uppercase tracking-wider">
            Évolution de votre santé cutanée
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl font-black" style={{ color: getScoreColor(latest) }}>
              {latest}
            </span>
            <span className="text-xs text-muted-foreground">/100</span>
            {diff !== 0 && (
              <div className={`flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full ${
                diff > 0 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-500'
              }`}>
                {diff > 0
                  ? <TrendingUp className="w-3 h-3" />
                  : <TrendingDown className="w-3 h-3" />}
                {diff > 0 ? '+' : ''}{Math.round(diff * 10) / 10} pts
              </div>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Dernière analyse</p>
          <p className="text-xs font-semibold text-foreground/70">
            {analyses[0]?.created_date
              ? formatDistanceToNow(new Date(analyses[0].created_date), { locale: fr, addSuffix: true })
              : '—'}
          </p>
        </div>
      </div>

      {/* SVG Graphique */}
      <div className="px-2 pb-3">
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
          {/* Ligne de référence 75 */}
          <line
            x1={PAD} y1={H - PAD - ((75 - minScore) / range) * (H - PAD * 2)}
            x2={W - PAD} y2={H - PAD - ((75 - minScore) / range) * (H - PAD * 2)}
            stroke="rgba(0,200,150,0.2)" strokeWidth="1" strokeDasharray="4,4"
          />
          <text
            x={W - PAD - 4}
            y={H - PAD - ((75 - minScore) / range) * (H - PAD * 2) - 4}
            fontSize="8" fill="rgba(0,200,150,0.5)" textAnchor="end">
            Objectif 75
          </text>

          {/* Zone remplie */}
          <motion.path
            d={areaD}
            fill="url(#areaGradient)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          />

          {/* Gradient pour la zone */}
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00C896" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#00C896" stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {/* Ligne de courbe */}
          <motion.path
            d={pathD}
            fill="none"
            stroke="#00C896"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 1, ease: 'easeOut' }}
          />

          {/* Points */}
          {points.map((p, i) => (
            <motion.circle
              key={i}
              cx={p.x} cy={p.y} r={i === points.length - 1 ? 5 : 3.5}
              fill={i === points.length - 1 ? getScoreColor(p.score) : '#fff'}
              stroke={getScoreColor(p.score)}
              strokeWidth={i === points.length - 1 ? 0 : 2}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5 + i * 0.08 }}
            />
          ))}

          {/* Labels dates */}
          {points.map((p, i) => (
            (i === 0 || i === points.length - 1 || i === Math.floor(points.length / 2)) && (
              <text key={i} x={p.x} y={H - 2} fontSize="7"
                fill="rgba(0,0,0,0.35)" textAnchor="middle">
                {p.date}
              </text>
            )
          ))}
        </svg>
      </div>
    </motion.div>
  );
}

// ── COMPOSANT PRINCIPAL ─────────────────────────────────────────────────────
export default function History() {
  const navigate = useNavigate();
  const { isAuthenticated, navigateToLogin } = useAuth();

  useEffect(() => {
    document.title = 'DermaCI — Mes Analyses';
    // Bloquer l'indexation Google de cette page
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => { document.head.removeChild(meta); };
  }, []);
  const [analyses, setAnalyses]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    const fetchAnalyses = async () => {
      try {
        // Charger les IDs depuis le localStorage (fonctionne connecté ou non)
        const localIds = JSON.parse(localStorage.getItem('dermaci_analyses') || '[]');

        // Si connecté, essayer aussi de récupérer depuis le serveur
        let allIds = [...localIds];
        try {
          const isAuthed = await base44.auth.isAuthenticated();
          if (isAuthed) {
            const serverRes = await base44.functions.invoke('getUserAnalyses', {});
            const serverAnalyses = serverRes?.data?.analyses || [];
            const serverIds = serverAnalyses.map(a => a.id).filter(Boolean);
            // Fusionner les IDs serveur + local sans doublons
            for (const id of serverIds) {
              if (!allIds.includes(id)) allIds.push(id);
            }
            // Mettre à jour le localStorage avec la liste fusionnée
            if (allIds.length > localIds.length) {
              localStorage.setItem('dermaci_analyses', JSON.stringify(allIds.slice(0, 50)));
            }
          }
        } catch (_) {}

        if (allIds.length === 0) {
          setAnalyses([]);
          setLoading(false);
          return;
        }

        // Charger les détails de chaque analyse via getAnalysis (pas d'auth requise)
        const results = await Promise.allSettled(
          allIds.slice(0, 20).map(id =>
            base44.functions.invoke('getAnalysis', { analysis_id: id })
              .then(r => r?.data?.data || r?.data)
          )
        );

        const valid = results
          .filter(r => r.status === 'fulfilled' && r.value?.id)
          .map(r => r.value)
          .sort((a, b) => new Date(b.created_date || 0) - new Date(a.created_date || 0));

        setAnalyses(valid);
        setLoading(false);

      } catch (err) {
        console.error('Error loading analyses:', err);
        setAnalyses([]);
        setLoading(false);
      }
    };

    fetchAnalyses();
  }, []);

  const handleDelete = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    setDeletingId(id);
    try {
      await base44.entities.SkinAnalysis.delete(id);
      setAnalyses(prev => prev.filter(a => a.id !== id));
    } catch {}
    setDeletingId(null);
  };

  const handleResetAll = async () => {
    setResetting(true);
    try {
      await Promise.all(analyses.map(a => base44.entities.SkinAnalysis.delete(a.id)));
      setAnalyses([]);
    } catch {}
    setResetting(false);
    setConfirmReset(false);
  };

  if (loading) return <SkeletonLoader />;

  const scores       = analyses.filter(a => a.score > 0).map(a => a.score);
  const currentScore = scores[0] || 0;
  const avgScore     = scores.length > 0
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const bestScore    = scores.length > 0 ? Math.max(...scores) : 0;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden pb-24">

      {/* ── FOND ANIMÉ ── */}
      <motion.div className="absolute rounded-full pointer-events-none"
        style={{ width: 280, height: 280, background: 'radial-gradient(circle, rgba(0,168,120,0.07) 0%, transparent 70%)', top: '-5%', right: '-10%' }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} />
      <motion.div className="absolute rounded-full pointer-events-none"
        style={{ width: 200, height: 200, background: 'radial-gradient(circle, rgba(0,200,150,0.06) 0%, transparent 70%)', bottom: '15%', left: '-8%' }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 3 }} />

      <div className="relative z-10 max-w-md mx-auto px-4 pt-6">

        {/* ── EN-TÊTE ── */}
        <motion.div className="flex items-center gap-3 mb-6"
          initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }}>
          <button onClick={() => navigate('/')}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-card border border-border shadow-sm">
            <ArrowLeft className="w-4 h-4 text-foreground/70" />
          </button>
          <div className="flex-1">
            <h1 className="font-inter font-black text-xl">Mes Analyses</h1>
            <p className="text-xs text-muted-foreground">
              {analyses.length > 0
                ? `${analyses.length} analyse${analyses.length > 1 ? 's' : ''} · Suivi dermatologique`
                : 'Votre historique dermatologique'}
            </p>
          </div>
          {analyses.length > 0 && (
            <button onClick={() => setConfirmReset(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-destructive border border-destructive/20 bg-destructive/5">
              <Trash2 className="w-3 h-3" /> Tout effacer
            </button>
          )}
        </motion.div>

        {/* ── MODAL RESET ── */}
        <AnimatePresence>
          {confirmReset && (
            <motion.div className="fixed inset-0 z-50 flex items-center justify-center px-6"
              style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div className="bg-card rounded-3xl p-6 w-full max-w-sm border border-border shadow-2xl"
                initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-destructive/10 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground">Tout réinitialiser ?</p>
                    <p className="text-xs text-muted-foreground">Action irréversible</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                  Toutes vos analyses ({analyses.length}) seront définitivement supprimées.
                </p>
                <div className="flex gap-3">
                  <button onClick={() => setConfirmReset(false)}
                    className="flex-1 py-3 rounded-2xl border border-border text-sm font-semibold text-foreground/70">
                    Annuler
                  </button>
                  <button onClick={handleResetAll} disabled={resetting}
                    className="flex-1 py-3 rounded-2xl text-sm font-bold text-white bg-destructive disabled:opacity-60">
                    {resetting ? 'Suppression…' : 'Confirmer'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {analyses.length === 0 ? (
          /* ── ÉTAT VIDE ── */
          <motion.div className="flex flex-col items-center py-16 text-center"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <motion.div className="w-32 h-32 rounded-full flex items-center justify-center mb-8"
              style={{ background: 'rgba(0,168,120,0.08)', border: '2px dashed rgba(0,168,120,0.25)' }}
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
              <Inbox className="w-12 h-12 text-primary/40" strokeWidth={1.5} />
            </motion.div>
            <h2 className="font-bold text-lg mb-2">Aucune analyse pour le moment</h2>
            <p className="text-sm text-muted-foreground mb-8 max-w-xs leading-relaxed">
              Lancez votre première analyse pour découvrir votre peau et recevoir des conseils personnalisés adaptés au climat ivoirien.
            </p>
            <div className="w-full max-w-xs mb-8 p-4 rounded-2xl text-left"
              style={{ background: 'rgba(0,168,120,0.06)', border: '1px solid rgba(0,168,120,0.15)' }}>
              <p className="text-xs font-semibold text-primary mb-3">Ce que vous allez découvrir :</p>
              {[
                '🔬 Votre type de peau exact',
                '📊 Score de santé cutanée',
                '🌿 Routine sur-mesure',
                '🥭 Nutrition ivoirienne',
                '📈 Suivi & Coaching',
              ].concat([null]).map((item, i) => (
                <motion.p key={i} className="text-sm py-1"
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.08 }}>
                  {item === null ? <>💬 Chat <DermaBotName /></> : item}
                </motion.p>
              ))}
            </div>
            <motion.button onClick={() => navigate('/analysis')}
              className="flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-white text-base"
              style={{ background: 'linear-gradient(135deg,#00A878,#00C896)', boxShadow: '0 8px 24px rgba(0,168,120,0.3)' }}
              whileTap={{ scale: 0.97 }}>
              <Plus className="w-5 h-5" /> Faire ma première analyse
            </motion.button>
          </motion.div>

        ) : (
          <>
            {/* ── STATS 3 CARTES ── */}
            <motion.div className="grid grid-cols-3 gap-2.5 mb-5"
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              {[
                { label: 'Score actuel', value: currentScore, icon: Target },
                { label: 'Moyenne',      value: avgScore,     icon: BarChart3 },
                { label: 'Record',       value: bestScore,    icon: Award },
              ].map((s, i) => (
                <motion.div key={i}
                  className="rounded-2xl p-3 text-center bg-card border border-border"
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 + i * 0.07 }}>
                  <s.icon className="w-4 h-4 mx-auto mb-1 text-muted-foreground/50" />
                  <p className="text-2xl font-black font-inter" style={{ color: getScoreColor(s.value) }}>
                    {s.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* ── BADGE ÉTAT SANTÉ ── */}
            {currentScore > 0 && (
              <motion.div className="mb-5 px-4 py-3 rounded-2xl flex items-center gap-3 border"
                style={{
                  background: `${getScoreColor(currentScore)}08`,
                  borderColor: `${getScoreColor(currentScore)}25`
                }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
                <span className="text-xl">{getScoreEmoji(currentScore)}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold" style={{ color: getScoreColor(currentScore) }}>
                    Santé cutanée {getScoreLabel(currentScore)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Basé sur votre dernière analyse
                  </p>
                </div>
              </motion.div>
            )}

            {/* ── COURBE D'ÉVOLUTION ── */}
            <EvolutionChart analyses={analyses} />

            {/* ── LISTE ANALYSES ── */}
            <motion.p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
              Historique complet
            </motion.p>

            <div className="space-y-2.5 mb-8">
              <AnimatePresence>
                {analyses.map((a, i) => {
                   const skinColor  = getSkinTypeColor(a.skin_type);
                   return (
                     <motion.div key={a.id}
                       layout
                       initial={{ opacity: 0, y: 16 }}
                       animate={{ opacity: 1, y: 0 }}
                       exit={{ opacity: 0, x: -40, transition: { duration: 0.2 } }}
                       transition={{ delay: i * 0.05 }}>

                       <div className="bg-card rounded-2xl border border-border overflow-hidden hover:border-primary/25 transition-all hover:shadow-sm">
                         {/* Barre score en haut */}
                         <div className="h-0.5" style={{ background: skinColor, opacity: 0.7 }} />

                        <div className="p-3.5 flex items-center gap-3">
                          {/* Photo */}
                          <Link to={`/results/${a.id}`}
                            className="w-14 h-14 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                            {a.photo_url
                              ? <img src={a.photo_url} alt="" className="w-full h-full object-cover" />
                              : <div className="w-full h-full flex items-center justify-center bg-primary/8">
                                  <img src={LOGO_URL} alt="" className="w-8 h-8 object-contain opacity-30" />
                                </div>
                            }
                          </Link>

                          {/* Infos */}
                          <Link to={`/results/${a.id}`} className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                              <span className="text-xl font-black" style={{ color: skinColor }}>
                                {a.score || 0}
                                <span className="text-xs font-normal text-muted-foreground">/100</span>
                              </span>
                              <span className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                                style={{ background: skinColor + '18', color: skinColor }}>
                                {a.skin_type || 'Analyse'}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {a.created_date
                                ? format(new Date(a.created_date), "d MMM yyyy 'à' HH'h'mm", { locale: fr })
                                : '—'}
                            </p>
                            {Array.isArray(a.problems) && a.problems.length > 0 && (
                              <p className="text-xs text-muted-foreground/55 mt-0.5 truncate">
                                {a.problems.slice(0, 2).map(p => p.name).join(' · ')}
                                {a.problems.length > 2 ? ` · +${a.problems.length - 2}` : ''}
                              </p>
                            )}
                          </Link>

                          {/* Actions */}
                          <div className="flex flex-col items-center gap-2 flex-shrink-0">
                            <Link to={`/results/${a.id}`}
                              className="w-8 h-8 rounded-full flex items-center justify-center"
                              style={{ background: 'rgba(0,168,120,0.1)' }}>
                              <ChevronRight className="w-4 h-4 text-primary" />
                            </Link>
                            <button
                              onClick={(e) => handleDelete(e, a.id)}
                              disabled={deletingId === a.id}
                              className="w-8 h-8 rounded-full flex items-center justify-center bg-destructive/8 hover:bg-destructive/15 transition-colors disabled:opacity-40">
                              {deletingId === a.id
                                ? <div className="w-3 h-3 border-2 border-destructive/40 border-t-destructive rounded-full animate-spin" />
                                : <Trash2 className="w-3.5 h-3.5 text-destructive/60" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* ── FAB DermaBot ── */}
            {analyses.length > 0 && <DermaBotHistoryFAB />}

            {/* ── BOUTON NOUVELLE ANALYSE ── */}
            <motion.button onClick={() => navigate('/analysis')}
              className="w-full py-4 rounded-2xl font-bold text-white text-base flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg,#00A878,#00C896)', boxShadow: '0 8px 24px rgba(0,168,120,0.28)' }}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              whileTap={{ scale: 0.98 }}>
              <Plus className="w-5 h-5" /> Nouvelle analyse
            </motion.button>
          </>
        )}


      </div>


    </div>
  );
}
