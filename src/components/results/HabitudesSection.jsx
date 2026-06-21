import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Calendar, Flag, TrendingUp, TrendingDown, Minus } from 'lucide-react';

// Thème rose/corail
const T = {
  primary:  '#EC4899',
  light:    '#F472B6',
  bg:       'rgba(236,72,153,0.08)',
  bgDeep:   'rgba(236,72,153,0.13)',
  border:   'rgba(236,72,153,0.20)',
  headerBg: 'rgba(236,72,153,0.10)',
  local:    '#00A878',
};

const IMPACT = {
  'élevé': { color: '#00C896', bg: 'rgba(0,200,150,0.10)',  label: 'Impact élevé', Icon: TrendingUp   },
  'moyen': { color: '#F5A623', bg: 'rgba(245,166,35,0.10)', label: 'Impact moyen', Icon: Minus        },
  'faible': { color: '#7F8C8D', bg: 'rgba(127,140,141,0.10)', label: 'Impact faible', Icon: TrendingDown },
};

export default function HabitudesSection({ habitudes }) {
  if (!habitudes || habitudes.length === 0) return (
    <motion.div className="mx-4 mb-4 p-4 rounded-2xl text-center"
      style={{ background: 'rgba(236,72,153,0.06)', border: '1.5px dashed rgba(236,72,153,0.25)' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Heart className="w-6 h-6 mx-auto mb-2" style={{ color: T.primary }} />
      <p className="text-xs text-muted-foreground">Les habitudes de vie adaptées seront disponibles lors de votre prochaine analyse.</p>
    </motion.div>
  );
  return (
    <motion.div className="mx-4 mb-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: T.headerBg }}>
          <Heart className="w-4 h-4" style={{ color: T.primary }} />
        </div>
        <div>
          <h3 className="font-inter font-bold text-base text-foreground">Habitudes de vie</h3>
          <p className="text-xs text-muted-foreground">Adaptées au quotidien ivoirien</p>
        </div>
      </div>
      <div className="space-y-3">
        {habitudes.map((h, i) => {
          const imp = IMPACT[h.impact_level] || { color: '#7F8C8D', bg: 'rgba(127,140,141,0.10)', label: h.impact_level, Icon: TrendingDown };
          const ImpactIcon = imp.Icon;
          return (
            <motion.div key={i} className="rounded-2xl overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.90)', border: `1.5px solid ${T.border}` }}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}>
              {/* Barre top */}
              <div className="h-0.5" style={{ background: `linear-gradient(90deg, ${T.primary}, ${T.light})` }} />
              <div className="p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h4 className="font-inter font-bold text-sm text-foreground">{h.title}</h4>
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 flex items-center gap-1"
                    style={{ background: imp.bg, color: imp.color }}>
                    <ImpactIcon className="w-3 h-3" strokeWidth={1.5} />{imp.label}
                  </span>
                </div>
                <p className="text-xs leading-relaxed mb-2" style={{ color: 'rgba(0,0,0,0.62)' }}>{h.description}</p>
                {h.frequency && (
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 flex-shrink-0" />{h.frequency}
                  </p>
                )}
                {h.why_ivory_coast && (
                  <p className="text-xs font-medium flex items-center gap-1.5" style={{ color: T.local }}>
                    <Flag className="w-3 h-3 flex-shrink-0" strokeWidth={1.5} />{h.why_ivory_coast}
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}