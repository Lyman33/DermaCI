import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Droplets, Wind, Zap, Apple, Activity, Dna, AlertCircle, Leaf } from 'lucide-react';

// Thème violet
const T = {
  primary:  '#8B5CF6',
  light:    '#A78BFA',
  bg:       'rgba(139,92,246,0.08)',
  bgDeep:   'rgba(139,92,246,0.14)',
  border:   'rgba(139,92,246,0.20)',
  headerBg: 'rgba(139,92,246,0.10)',
};

const CATEGORY_ICON = {
  soleil:          Sun,
  exposition:      Sun,
  deshydratation:  Droplets,
  pollution:       Wind,
  stress:          Zap,
  alimentation:    Apple,
  hormones:        Activity,
  genetique:       Dna,
  soins_inadaptes: AlertCircle,
  soins:           AlertCircle,
  environnement:   Leaf,
  physiologique:   Activity,
};

function CategoryIcon({ category, color }) {
  const Icon = CATEGORY_ICON[category] || Zap;
  return <Icon width={20} height={20} color={color} strokeWidth={1.5} />;
}

const CATEGORY_THEME = {
  alimentation:    { color: '#E67E22', bg: 'rgba(230,126,34,0.10)' },
  hormones:        { color: '#8B5CF6', bg: 'rgba(139,92,246,0.10)' },
  environnement:   { color: '#2d7a4f', bg: 'rgba(45,122,79,0.10)' },
  stress:          { color: '#E74C3C', bg: 'rgba(231,76,60,0.10)' },
  soleil:          { color: '#F5A623', bg: 'rgba(245,166,35,0.10)' },
  exposition:      { color: '#F5A623', bg: 'rgba(245,166,35,0.10)' },
  deshydratation:  { color: '#3B82F6', bg: 'rgba(59,130,246,0.10)' },
  soins_inadaptes: { color: '#EC4899', bg: 'rgba(236,72,153,0.10)' },
  soins:           { color: '#EC4899', bg: 'rgba(236,72,153,0.10)' },
  genetique:       { color: '#7F8C8D', bg: 'rgba(127,140,141,0.10)' },
  pollution:       { color: '#64748B', bg: 'rgba(100,116,139,0.10)' },
  physiologique:   { color: '#8B5CF6', bg: 'rgba(139,92,246,0.10)' },
};

export default function CausesSection({ causes }) {
  if (!causes || causes.length === 0) return null;
  return (
    <motion.div className="mx-4 mb-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.1 }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: T.headerBg }}>
          <Zap className="w-4 h-4" style={{ color: T.primary }} />
        </div>
        <div>
          <h3 className="font-inter font-bold text-base text-foreground">Causes identifiées</h3>
          <p className="text-xs text-muted-foreground">Facteurs déclencheurs de vos problèmes cutanés</p>
        </div>
      </div>
      <div className="space-y-3">
        {causes.map((c, i) => {
           const theme = CATEGORY_THEME[c.category] || { color: T.primary, bg: T.bg };
           return (
             <motion.div key={i} className="rounded-2xl p-4"
               style={{ background: 'rgba(255,255,255,0.85)', border: `1.5px solid ${T.border}` }}
               initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
               transition={{ delay: i * 0.09 }}>
               {/* Barre colorée catégorie */}
               <div className="flex items-start gap-3">
                 <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                   style={{ background: theme.bg }}>
                   <CategoryIcon category={c.category} color={theme.color} />
                 </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-inter font-bold text-sm text-foreground">{c.title}</h4>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: T.bg, color: T.primary }}>
                      {(c.category || '').replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: 'rgba(0,0,0,0.60)' }}>{c.description}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}