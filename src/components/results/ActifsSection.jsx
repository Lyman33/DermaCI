import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, FlaskConical, Target, Zap, Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const INDIGO = '#6366F1';
const INDIGO_BG = 'rgba(99,102,241,0.08)';
const INDIGO_BORDER = 'rgba(99,102,241,0.20)';

const LABEL_TRANSLATIONS = {
  'exceso de sebum': 'excès de sébum',
  'poros dilatados': 'pores dilatés',
  'acné': 'acné',
  'hiperpigmentación': 'hyperpigmentation',
  'post-inflamatorios': 'post-inflammatoires',
  'manchas solares': 'taches solaires',
};

function translateLabel(label) {
  if (!label) return label;
  const lower = label.toLowerCase();
  return LABEL_TRANSLATIONS[lower] || label;
}

function ActifIcon({ name }) {
  const n = (name || '').toLowerCase();
  if (n.includes('azelaic') || n.includes('kojic'))
    return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={INDIGO} strokeWidth="1.5" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
  if (n.includes('salicyl'))
    return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={INDIGO} strokeWidth="1.5" strokeLinecap="round"><path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2v-4M9 21H5a2 2 0 01-2-2v-4m0 0h18"/></svg>;
  if (n.includes('niacin') || n.includes('vitamin b'))
    return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={INDIGO} strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>;
  if (n.includes('retinol') || n.includes('retin'))
    return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={INDIGO} strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 11l3 3 5-5"/></svg>;
  if (n.includes('hyalur'))
    return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={INDIGO} strokeWidth="1.5" strokeLinecap="round"><path d="M12 2v6m0 4v6M6 12h6m4 0h6"/></svg>;
  if (n.includes('vitamin c') || n.includes('ascorb'))
    return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={INDIGO} strokeWidth="1.5" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
  if (n.includes('zinc'))
    return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={INDIGO} strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>;
  if (n.includes('peptid'))
    return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={INDIGO} strokeWidth="1.5" strokeLinecap="round"><path d="M2 12h4l3-9 4 18 3-9h6"/></svg>;
  if (n.includes('glycol'))
    return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={INDIGO} strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>;
  if (n.includes('lactic') || n.includes('acide lactique'))
    return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={INDIGO} strokeWidth="1.5" strokeLinecap="round"><path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>;
  if (n.includes('neem'))
    return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={INDIGO} strokeWidth="1.5" strokeLinecap="round"><path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 6c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 6c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z"/></svg>;
  // Défaut
  return <FlaskConical size={20} color={INDIGO} strokeWidth={1.5} />;
}

function ActifCard({ a, index }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div className="rounded-2xl overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.90)', border: `1.5px solid ${INDIGO_BORDER}` }}
      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}>

      {/* Barre indigo en haut */}
      <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, ${INDIGO}, ${INDIGO}50)` }} />

      <button className="w-full text-left p-4" onClick={() => setOpen(!open)}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: INDIGO_BG }}>
              <ActifIcon name={a.name} />
            </div>
            <div>
              <h4 className="font-inter font-bold text-sm text-foreground">{a.name}</h4>
              <div className="flex flex-wrap gap-1 mt-1">
                {(a.targets || []).slice(0, 2).map((t, j) => (
                  <span key={j} className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ background: INDIGO_BG, color: INDIGO }}>{translateLabel(t)}</span>
                ))}
              </div>
            </div>
          </div>
          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3 }}>
            <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: INDIGO }} />
          </motion.div>
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div className="px-4 pb-4 space-y-3"
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
            <div className="h-px" style={{ background: `${INDIGO}20` }} />

            {/* Mécanisme */}
            {a.mechanism && (
              <div className="flex items-start gap-2">
                <Zap className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: INDIGO }} />
                <div>
                  <p className="text-xs font-bold mb-0.5" style={{ color: INDIGO }}>Mécanisme d'action</p>
                  <p className="text-xs text-foreground/75 leading-relaxed">{a.mechanism}</p>
                </div>
              </div>
            )}

            {/* Pourquoi adapté */}
            {a.why_adapted && (
              <div className="flex items-start gap-2">
                <Target className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: INDIGO }} />
                <div>
                  <p className="text-xs font-bold mb-0.5" style={{ color: INDIGO }}>Adapté à votre peau car</p>
                  <p className="text-xs text-foreground/75 leading-relaxed">{a.why_adapted}</p>
                </div>
              </div>
            )}

            {/* Résultats */}
            {a.visible_results && (
              <div className="rounded-xl p-3" style={{ background: INDIGO_BG }}>
                <div className="flex items-center gap-1.5 mb-2">
                  <Clock className="w-3.5 h-3.5" style={{ color: INDIGO }} />
                  <p className="text-xs font-bold" style={{ color: INDIGO }}>Résultats attendus</p>
                </div>
                <div className="space-y-1">
                  {a.visible_results.short_term  && <p className="text-xs text-foreground/70"><span className="font-semibold">2-4 sem :</span> {a.visible_results.short_term}</p>}
                  {a.visible_results.medium_term && <p className="text-xs text-foreground/70"><span className="font-semibold">1-3 mois :</span> {a.visible_results.medium_term}</p>}
                  {a.visible_results.long_term   && <p className="text-xs text-foreground/70"><span className="font-semibold">3-6 mois :</span> {a.visible_results.long_term}</p>}
                </div>
              </div>
            )}

            {/* Concentration + Application */}
            <div className="grid grid-cols-2 gap-2">
              {a.concentration_guide && (
                <div className="p-2.5 rounded-xl" style={{ background: 'rgba(0,0,0,0.04)' }}>
                  <p className="text-xs font-bold text-foreground/50 mb-0.5">Concentration</p>
                  <p className="text-xs text-foreground/80">{a.concentration_guide}</p>
                </div>
              )}
              {a.application_guide && (
                <div className="p-2.5 rounded-xl" style={{ background: 'rgba(0,0,0,0.04)' }}>
                  <p className="text-xs font-bold text-foreground/50 mb-0.5">Application</p>
                  <p className="text-xs text-foreground/80">{a.application_guide}</p>
                </div>
              )}
            </div>

            {/* Précautions */}
            {a.precautions && (
              <div className="flex items-start gap-2 p-2.5 rounded-xl"
                style={{ background: 'rgba(231,76,60,0.06)', border: '1px solid rgba(231,76,60,0.15)' }}>
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-red-500" />
                <p className="text-xs text-red-600 leading-relaxed">{a.precautions}</p>
              </div>
            )}

            {/* Synergies + Antagonismes */}
            <div className="flex flex-wrap gap-1.5">
              {(a.synergies || []).map((s, j) => (
                <span key={j} className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ background: 'rgba(5,150,105,0.10)', color: '#059669' }}>
                  <CheckCircle className="w-2.5 h-2.5" /> {s.actif || s}
                </span>
              ))}
              {(a.antagonisms || []).map((s, j) => (
                <span key={j} className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ background: 'rgba(245,166,35,0.10)', color: '#F5A623' }}>
                  <XCircle className="w-2.5 h-2.5" /> {s}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function ActifsSection({ actifs }) {
  if (!actifs || actifs.length === 0) return null;
  return (
    <motion.div className="mx-4 mb-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: INDIGO_BG }}>
          <FlaskConical className="w-4 h-4" style={{ color: INDIGO }} strokeWidth={1.5} />
        </div>
        <div>
          <h3 className="font-inter font-bold text-base text-foreground">Actifs recommandés</h3>
          <p className="text-xs text-muted-foreground">Mécanismes scientifiques détaillés</p>
        </div>
      </div>
      <div className="space-y-3">
        {actifs.map((a, i) => <ActifCard key={i} a={a} index={i} />)}
      </div>
    </motion.div>
  );
}