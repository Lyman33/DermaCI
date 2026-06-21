import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, MapPin, AlertTriangle, Eye, Shield, Stethoscope } from 'lucide-react';

// Thème rouge
const T = {
  primary:  '#E74C3C',
  light:    '#FF6B5B',
  bg:       'rgba(231,76,60,0.08)',
  bgDeep:   'rgba(231,76,60,0.14)',
  border:   'rgba(231,76,60,0.22)',
  headerBg: 'rgba(231,76,60,0.10)',
};

const SEVERITY = {
  'légère':  { color: '#00C896', bg: 'rgba(0,200,150,0.10)', label: 'Légère' },
  'modérée': { color: '#F5A623', bg: 'rgba(245,166,35,0.10)', label: 'Modérée' },
  'sévère':  { color: '#E74C3C', bg: 'rgba(231,76,60,0.12)', label: 'Sévère' },
};

const URGENCY = {
  'cosmétique':             { color: '#00C896', bg: 'rgba(0,200,150,0.10)',  label: 'Pas urgent',    Icon: Shield       },
  'surveillance':           { color: '#F5A623', bg: 'rgba(245,166,35,0.10)', label: 'Surveillance',         Icon: Eye          },
  'consulter_dermatologue': { color: '#E74C3C', bg: 'rgba(231,76,60,0.10)',  label: 'Consulter dermato',    Icon: Stethoscope  },
};

const ZONE_LABELS = {
  front: 'Front', nez: 'Nez', joues: 'Joues',
  menton: 'Menton', contour_yeux: 'Contour yeux', tempes: 'Tempes',
};

function ProblemCard({ p, index }) {
  const [open, setOpen] = useState(false);
  const sev = SEVERITY[p.severity] || { color: T.primary, bg: T.bg, label: p.severity };
  const urg = URGENCY[p.urgency] || null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="rounded-2xl overflow-hidden"
      style={{ border: `1.5px solid ${T.border}`, background: 'rgba(255,255,255,0.85)' }}>

      <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${T.primary}, ${T.light})` }} />

      <button className="w-full text-left p-4" onClick={() => setOpen(!open)}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ background: sev.bg, color: sev.color }}>{sev.label}</span>
              {urg && (
                <span className="text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1"
                  style={{ background: urg.bg, color: urg.color, display: 'inline-flex' }}>
                  <urg.Icon className="w-3 h-3 flex-shrink-0" strokeWidth={1.5} />{urg.label}
                </span>
              )}
            </div>
            <h4 className="font-inter font-bold text-sm text-foreground">{p.name}</h4>
            {p.visual_marker && (
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <Eye className="w-3 h-3 flex-shrink-0" />{p.visual_marker}
              </p>
            )}
          </div>
          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3 }}>
            <ChevronDown className="w-4 h-4 flex-shrink-0 mt-1" style={{ color: T.primary }} />
          </motion.div>
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div className="px-4 pb-4"
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
            <p className="text-xs leading-relaxed mb-3" style={{ color: 'rgba(0,0,0,0.65)' }}>{p.description}</p>
            {p.zones && p.zones.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {p.zones.map((z, j) => (
                  <span key={j} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium"
                    style={{ background: T.bg, color: T.primary }}>
                    <MapPin className="w-2.5 h-2.5" />{ZONE_LABELS[z] || z}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function ProblemsSection({ problems }) {
  if (!problems || problems.length === 0) return null;
  return (
    <motion.div className="mx-4 mb-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: T.headerBg }}>
          <AlertTriangle className="w-4 h-4" style={{ color: T.primary }} />
        </div>
        <div>
          <h3 className="font-inter font-bold text-base text-foreground">Problèmes détectés</h3>
          <p className="text-xs text-muted-foreground">{problems.length} problème{problems.length > 1 ? 's' : ''} identifié{problems.length > 1 ? 's' : ''}</p>
        </div>
        <div className="ml-auto w-7 h-7 rounded-full flex items-center justify-center font-black text-sm"
          style={{ background: T.bgDeep, color: T.primary }}>{problems.length}</div>
      </div>
      <div className="space-y-3">
        {problems.map((p, i) => <ProblemCard key={i} p={p} index={i} />)}
      </div>
    </motion.div>
  );
}