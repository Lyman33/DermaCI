import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export default function CollapsibleSection({ label, icon, children, defaultOpen = false, color = '#00A878' }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="mx-4 mb-3 rounded-2xl overflow-hidden"
      style={{ border: '1px solid rgba(0,0,0,0.07)', background: 'rgba(255,255,255,0.85)' }}>
      
      <button
        className="w-full flex items-center justify-between px-4 py-3.5 text-left"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-3">
          {icon && (
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${color}18`, color }}>
              {icon}
            </div>
          )}
          <span className="font-inter font-bold text-sm text-foreground">{label}</span>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }}>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div className="pb-2">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}