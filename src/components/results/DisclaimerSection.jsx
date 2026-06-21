import React from 'react';
import { motion } from 'framer-motion';
import { Info } from 'lucide-react';

// Thème neutre gris-bleu
const T = {
  primary:  '#64748B',
  bg:       'rgba(100,116,139,0.07)',
  border:   'rgba(100,116,139,0.18)',
  headerBg: 'rgba(100,116,139,0.10)',
};

export default function DisclaimerSection() {
  return (
    <motion.div className="mx-4 mb-6"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <div className="rounded-2xl overflow-hidden"
        style={{ background: T.bg, border: `1.5px solid ${T.border}` }}>
        <div className="p-4 flex items-start gap-3">
          <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: T.headerBg }}>
            <Info className="w-3.5 h-3.5" style={{ color: T.primary }} />
          </div>
          <p className="text-xs leading-relaxed" style={{ color: 'rgba(0,0,0,0.55)' }}>
            DermaCI est un outil d'aide dermatologique basé sur l'intelligence artificielle. Il ne remplace pas l'avis d'un dermatologue professionnel. En cas de problème cutané persistant ou sévère, consultez un médecin.
          </p>
        </div>
      </div>
    </motion.div>
  );
}