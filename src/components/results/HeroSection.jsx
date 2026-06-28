import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const SkinIcons = {
  grasse: (color) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>
    </svg>
  ),
  mixte: (color) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="2" x2="12" y2="22"/><path d="M12 2a10 10 0 0 1 0 20"/><path d="M12 2a10 10 0 0 0 0 20"/>
    </svg>
  ),
  seche: (color) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10"/><path d="M12 6v6l4 2"/><path d="M18 2l4 4-4 4"/>
    </svg>
  ),
  normale: (color) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22V12"/><path d="M12 12C12 7 7 4 7 4s-1 5 2 8"/><path d="M12 12c0-5 5-8 5-8s1 5-2 8"/>
    </svg>
  ),
  sensible: (color) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  ),
  mature: (color) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
    </svg>
  ),
  acne: (color) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  deshydratee: (color) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
    </svg>
  ),
  default: (color) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
    </svg>
  ),
};

function blendColors(hex1, hex2, ratio) {
  const r1=parseInt(hex1.slice(1,3),16),g1=parseInt(hex1.slice(3,5),16),b1=parseInt(hex1.slice(5,7),16);
  const r2=parseInt(hex2.slice(1,3),16),g2=parseInt(hex2.slice(3,5),16),b2=parseInt(hex2.slice(5,7),16);
  const r=Math.round(r1+(r2-r1)*ratio),g=Math.round(g1+(g2-g1)*ratio),b=Math.round(b1+(b2-b1)*ratio);
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
}

function getSkinTypeColor(skinType) {
  const full = (skinType || '').toLowerCase();
  // La couleur de base vient du TYPE PRINCIPAL (avant "a tendance"), pas de la tendance.
  // Ex: "Peau grasse a tendance acneique" -> principal = "peau grasse" -> JAUNE (pas rouge).
  const t = full.split(/\s*[aà]\s+tendance\s*/)[0];
  let base = '#00A878';
  let iconKey = 'default';

  // Ordre = du plus specifique au plus general sur le TYPE PRINCIPAL uniquement.
  if (t.includes('grasse')) {
    base = '#D4A017'; iconKey = 'grasse';
  } else if (t.includes('mixte')) {
    base = '#256D85'; iconKey = 'mixte';
  } else if (t.includes('sèche') || t.includes('seche')) {
    base = '#C68642'; iconKey = 'seche';
  } else if (t.includes('sensible')) {
    base = '#D977A8'; iconKey = 'sensible';
  } else if (t.includes('mature')) {
    base = '#6D214F'; iconKey = 'mature';
  } else if (t.includes('déshydrat') || t.includes('deshydrat')) {
    base = '#60A5FA'; iconKey = 'deshydratee';
  } else if (t.includes('normale')) {
    base = '#059669'; iconKey = 'normale';
  } else if (t.includes('acné') || t.includes('acne') || t.includes('acneique') || t.includes('acnéique')) {
    base = '#DC2626'; iconKey = 'acne';
  }

  // La tendance (le reste) ajuste la nuance via blendColors -> on garde 'full' pour ca.
  let color = base;
  if (full.includes('tendance acné') || full.includes('tendance acne') || full.includes('tendance acneique') || full.includes('tendance acnéique'))
    color = blendColors(base, '#DC2626', 0.60);
  else if (full.includes('tendance grasse') || full.includes('predominance grasse') || full.includes('prédominance grasse'))
    color = blendColors(base, '#D4A017', 0.60);
  else if (full.includes('tendance seche') || full.includes('tendance sèche') || full.includes('predominance seche') || full.includes('prédominance sèche'))
    color = blendColors(base, '#C68642', 0.60);
  else if (full.includes('tendance pigment') || full.includes('tendance terne'))
    color = blendColors(base, '#92400E', 0.60);
  else if (full.includes('tendance sensible') || full.includes('tendance reactive') || full.includes('tendance réactive'))
    color = blendColors(base, '#D977A8', 0.60);
  else if (full.includes('tendance mature'))
    color = blendColors(base, '#6D214F', 0.60);
  else if (full.includes('tendance deshydrat') || full.includes('tendance déshydrat'))
    color = blendColors(base, '#60A5FA', 0.60);
  else if (full.includes('tendance couperose') || full.includes('tendance couperosée'))
    color = blendColors(base, '#F87171', 0.60);
  else if (full.includes('tendance atopique'))
    color = blendColors(base, '#A78BFA', 0.60);
  else if (full.includes('tendance mixte'))
    color = blendColors(base, '#256D85', 0.60);
  else if (full.includes('tendance normale'))
    color = blendColors(base, '#059669', 0.60);

  const labelMap = {
    'acne': 'Peau Acnéique', 'grasse': 'Peau Grasse', 'mixte': 'Peau Mixte',
    'seche': 'Peau Sèche', 'sensible': 'Peau Sensible', 'mature': 'Peau Mature',
    'deshydratee': 'Peau Déshydratée', 'normale': 'Peau Normale',
  };

  return { primary: color, bg: `${color}18`, label: labelMap[iconKey] || 'Peau Analysée', iconKey };
}

function getScoreLabel(score) {
  if (score >= 85) return 'Excellente santé cutanée';
  if (score >= 70) return 'Très bonne santé cutanée';
  if (score >= 55) return 'Bonne santé cutanée';
  if (score >= 40) return 'Santé cutanée correcte';
  return 'Santé cutanée à améliorer';
}

export default function HeroSection({ analysis }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const score = analysis.score || 0;
  const theme = getSkinTypeColor(analysis.skin_type);

  useEffect(() => {
    if (score === 0) return;
    let startTime = null;
    const duration = 1800;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setAnimatedScore(Math.round(eased * score));
      if (progress < 1) requestAnimationFrame(animate);
    };
    const timer = setTimeout(() => requestAnimationFrame(animate), 300);
    return () => clearTimeout(timer);
  }, [score]);

  const R = 58;
  const circumference = 2 * Math.PI * R;
  const dashOffset = circumference * (1 - animatedScore / 100);

  return (
    <div className="relative rounded-3xl overflow-hidden mb-5" style={{ minHeight: 340 }}>
      {/* Photo fond */}
      {analysis.photo_url && (
        <img src={analysis.photo_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
      )}

      {/* Overlay dégradé sophistiqué */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.20) 40%, rgba(0,0,0,0.80) 100%)'
      }} />

      {/* Halo coloré en bas */}
      <div className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none" style={{
        background: `linear-gradient(0deg, ${theme.primary}30 0%, transparent 100%)`
      }} />

      {/* Contenu */}
      <div className="relative z-10 px-6 py-10 flex flex-col items-center text-center text-white">

        {/* Cercle score */}
        <motion.div className="relative mb-5"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 150 }}>

          <motion.div className="absolute inset-0 rounded-full"
            style={{ background: `${theme.primary}20`, transform: 'scale(1.3)' }}
            animate={{ scale: [1.3, 1.5, 1.3], opacity: [0.5, 0.2, 0.5] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} />

          <svg width="144" height="144" viewBox="0 0 144 144" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="72" cy="72" r={R} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="8" />
            <circle cx="72" cy="72" r={R - 12} fill="none" stroke={`${theme.primary}25`} strokeWidth="1" />
            <circle cx="72" cy="72" r={R} fill="none"
              stroke={theme.primary} strokeWidth="8" strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={dashOffset}
              style={{ transition: 'stroke-dashoffset 0.05s linear', filter: `drop-shadow(0 0 8px ${theme.primary}80)` }}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-inter font-black leading-none" style={{ fontSize: 48, color: animatedScore > 0 ? '#fff' : 'rgba(255,255,255,0.4)' }}>
              {animatedScore}
            </span>
            <span className="text-xs font-medium text-white/50 mt-0.5">/100</span>
          </div>
        </motion.div>

        {/* Label score */}
        <motion.p className="text-xs font-medium text-white/60 mb-4 tracking-wider uppercase"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
          {getScoreLabel(score)}
        </motion.p>

        {/* Badge type de peau — fond opaque pour lisibilité maximale */}
        <motion.div
          className="px-5 py-2.5 rounded-2xl mb-3"
          style={{
            background: `rgba(0,0,0,0.55)`,
            border: `2px solid ${theme.primary}`,
            backdropFilter: 'blur(12px)',
          }}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}>
          <div className="flex items-center gap-1.5">
            {SkinIcons[theme.iconKey]?.(theme.primary)}
            <p className="font-inter font-bold text-sm" style={{ color: theme.primary }}>
              {analysis.skin_type || 'Type en cours de détection…'}
            </p>
          </div>
        </motion.div>

        {/* Description — simplifiée et limitée */}
        {analysis.skin_type_description && (
          <motion.div
            className="px-4 py-3 rounded-2xl max-w-xs"
            style={{
              background: 'rgba(0,0,0,0.45)',
              backdropFilter: 'blur(8px)',
            }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
            <p className="text-xs text-white/90 leading-relaxed">
              {analysis.skin_type_description}
            </p>
          </motion.div>
        )}

        {/* Analyse en cours */}
        {(!analysis.analysis_complete && score === 0) && (
          <motion.div className="mt-4 px-4 py-2 rounded-xl flex items-center gap-2"
            style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)' }}
            animate={{ opacity: [0.7, 1, 0.7] }} transition={{ duration: 2, repeat: Infinity }}>
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs text-white/80 font-medium">Analyse en cours…</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}
