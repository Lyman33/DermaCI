import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Droplets, Lightbulb } from 'lucide-react';

// Thème vert primaire (header), avec sous-thèmes matin/soir
const T = {
  primary:  '#00A878',
  bg:       'rgba(0,168,120,0.08)',
  border:   'rgba(0,168,120,0.20)',
  headerBg: 'rgba(0,168,120,0.10)',
};

const MATIN = {
  primary: '#F59E0B',
  light:   '#FCD34D',
  bg:      'rgba(245,158,11,0.10)',
  bgDeep:  'rgba(245,158,11,0.15)',
  border:  'rgba(245,158,11,0.22)',
  pill:    'rgba(245,158,11,0.12)',
};

const SOIR = {
  primary: '#6366F1',
  light:   '#818CF8',
  bg:      'rgba(99,102,241,0.10)',
  bgDeep:  'rgba(99,102,241,0.15)',
  border:  'rgba(99,102,241,0.22)',
  pill:    'rgba(99,102,241,0.12)',
};

export default function RoutineSection({ routineMatin, routineSoir }) {
  const [tab, setTab] = useState('matin');
  const hasMatin = routineMatin && routineMatin.length > 0;
  const hasSoir  = routineSoir  && routineSoir.length  > 0;
  if (!hasMatin && !hasSoir) return null;

  const routine = tab === 'matin' ? (routineMatin || []) : (routineSoir || []);
  const C = tab === 'matin' ? MATIN : SOIR;

  return (
    <motion.div className="mx-4 mb-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.15 }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: T.headerBg }}>
          <Droplets className="w-4 h-4" style={{ color: T.primary }} />
        </div>
        <div>
          <h3 className="font-inter font-bold text-base text-foreground">Routine personnalisée</h3>
          <p className="text-xs text-muted-foreground">Adaptée à votre profil et au climat ivoirien</p>
        </div>
      </div>

      {/* Onglets */}
      <div className="flex gap-2 mb-5 p-1 rounded-2xl" style={{ background: 'rgba(0,0,0,0.05)' }}>
        {[
          { key: 'matin', label: 'Matin', icon: <Sun className="w-3.5 h-3.5" />, C: MATIN, disabled: !hasMatin },
          { key: 'soir',  label: 'Soir',  icon: <Moon className="w-3.5 h-3.5" />, C: SOIR,  disabled: !hasSoir  },
        ].map(t => (
          <button key={t.key} onClick={() => !t.disabled && setTab(t.key)}
            disabled={t.disabled}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 transition-all"
            style={tab === t.key ? {
              background: '#fff',
              color: t.C.primary,
              boxShadow: `0 2px 12px ${t.C.bg}`,
              border: `1.5px solid ${t.C.border}`,
            } : {
              color: 'rgba(0,0,0,0.35)',
              background: 'transparent',
              border: '1.5px solid transparent',
            }}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* Étapes */}
      <AnimatePresence mode="wait">
        <motion.div key={tab} className="space-y-3"
          initial={{ opacity: 0, x: tab === 'matin' ? -10 : 10 }}
          animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}>
          {routine.map((step, i) => (
            <motion.div key={i} className="flex gap-3 p-4 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.90)', border: `1.5px solid ${C.border}` }}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-sm"
                style={{ background: C.bgDeep, color: C.primary }}>
                {step.step_number || i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-inter font-bold text-sm text-foreground mb-0.5">{step.step_name}</h4>
                <p className="text-xs text-muted-foreground mb-2">{step.product_type}</p>
                {(step.active_ingredients || step.actifs || []).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {(step.active_ingredients || step.actifs || []).map((a, j) => (
                      <span key={j} className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ background: C.pill, color: C.primary }}>{a}</span>
                    ))}
                  </div>
                )}
                {step.why_this_step && (
                  <p className="text-xs leading-relaxed mb-1" style={{ color: 'rgba(0,0,0,0.60)' }}>{step.why_this_step}</p>
                )}
                {step.application_tip && (
                  <p className="text-xs font-medium italic flex items-center gap-1.5" style={{ color: C.primary }}>
                    <Lightbulb className="w-3 h-3 flex-shrink-0" strokeWidth={1.5} />{step.application_tip}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}