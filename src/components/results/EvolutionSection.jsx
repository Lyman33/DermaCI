import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, CheckCircle, CalendarDays } from 'lucide-react';

// Thème bleu ciel / turquoise
const T = {
  primary:  '#0EA5E9',
  light:    '#38BDF8',
  bg:       'rgba(14,165,233,0.08)',
  bgDeep:   'rgba(14,165,233,0.13)',
  border:   'rgba(14,165,233,0.22)',
  headerBg: 'rgba(14,165,233,0.10)',
  check:    '#00C896',
};

export default function EvolutionSection({ tracking }) {
  if (!tracking || Object.keys(tracking).length === 0) return (
    <motion.div className="mx-4 mb-4 p-4 rounded-2xl text-center"
      style={{ background: 'rgba(14,165,233,0.06)', border: '1.5px dashed rgba(14,165,233,0.25)' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <TrendingUp className="w-6 h-6 mx-auto mb-2" style={{ color: T.primary }} />
      <p className="text-xs text-muted-foreground">Le suivi d'évolution sera disponible lors de votre prochaine analyse.</p>
    </motion.div>
  );

  return (
    <motion.div className="mx-4 mb-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: T.headerBg }}>
          <TrendingUp className="w-4 h-4" style={{ color: T.primary }} />
        </div>
        <div>
          <h3 className="font-inter font-bold text-base text-foreground">Évolution attendue</h3>
          <p className="text-xs text-muted-foreground">Vos progrès estimés semaine par semaine</p>
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.90)', border: `1.5px solid ${T.border}` }}>
        <div className="h-1" style={{ background: `linear-gradient(90deg, ${T.primary}, ${T.light})` }} />
        <div className="p-4">
          {tracking.next_analysis_delay && (
            <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-xl"
              style={{ background: T.bg }}>
              <CalendarDays className="w-4 h-4 flex-shrink-0" style={{ color: T.primary }} />
              <p className="text-xs font-semibold" style={{ color: T.primary }}>
                Prochaine analyse : {tracking.next_analysis_delay}
              </p>
            </div>
          )}

          {tracking.expected_improvements && tracking.expected_improvements.length > 0 && (
            <div className="space-y-2 mb-3">
              {tracking.expected_improvements.map((imp, i) => {
                const text = typeof imp === 'string' ? imp : (imp?.metric || imp?.objectif || JSON.stringify(imp));
                return (
                  <motion.div key={i} className="flex items-center gap-2"
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}>
                    <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: T.check }} />
                    <span className="text-xs" style={{ color: 'rgba(0,0,0,0.68)' }}>{text}</span>
                  </motion.div>
                );
              })}
            </div>
          )}

          {tracking.comparison_message && (
            <p className="text-xs font-semibold" style={{ color: T.primary }}>
              {tracking.comparison_message}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}