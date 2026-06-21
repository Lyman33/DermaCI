import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Apple, Calendar, Ruler, ChefHat, MapPin, ChevronDown, Coffee, UtensilsCrossed, Cake, Droplets, Nut } from 'lucide-react';

// Categories strictes — 1 fruit, 2 plats, 1 boisson, 1 collation, 1 dessert
const CATEGORIES_ORDER = ['fruit', 'plat', 'plat', 'boisson', 'collation', 'dessert'];

const CATEGORY_THEME = {
  fruit:     { color: '#F97316', bg: 'rgba(249,115,22,0.10)',  gradient: 'linear-gradient(135deg,#F97316,#FBBF24)', emoji: '🍊' },
  plat:      { color: '#8B5CF6', bg: 'rgba(139,92,246,0.10)',  gradient: 'linear-gradient(135deg,#8B5CF6,#C4B5FD)', emoji: '🍛' },
  boisson:   { color: '#06B6D4', bg: 'rgba(6,182,212,0.10)',   gradient: 'linear-gradient(135deg,#06B6D4,#67E8F9)', emoji: '🥤' },
  collation: { color: '#EC4899', bg: 'rgba(236,72,153,0.10)',  gradient: 'linear-gradient(135deg,#EC4899,#F9A8D4)', emoji: '🌰' },
  dessert:   { color: '#F59E0B', bg: 'rgba(245,158,11,0.10)',  gradient: 'linear-gradient(135deg,#F59E0B,#FDE68A)', emoji: '🍮' },
  default:   { color: '#00A878', bg: 'rgba(0,168,120,0.10)',   gradient: 'linear-gradient(135deg,#00A878,#34D399)', emoji: '🌿' },
};

const CATEGORY_ICONS = {
  fruit:     Apple,
  plat:      UtensilsCrossed,
  boisson:   Coffee,
  collation: Nut,
  dessert:   Cake,
  default:   Droplets,
};

const CATEGORY_LABELS = {
  fruit:     'Fruit local',
  plat:      'Plat ivoirien',
  boisson:   'Boisson naturelle',
  collation: 'Collation',
  dessert:   'Dessert',
};

function AlimentCard({ a, index }) {
  const [open, setOpen] = useState(false);

  // Categorie forcee par position — idem backend
  const catKey  = CATEGORIES_ORDER[index] || 'default';
  const theme   = CATEGORY_THEME[catKey] || CATEGORY_THEME.default;
  const Icon    = CATEGORY_ICONS[catKey] || CATEGORY_ICONS.default;
  const catLabel = CATEGORY_LABELS[catKey] || catKey;

  const conso = a.optimal_consumption || a.consommation || {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.08, type: 'spring', stiffness: 200, damping: 20 }}
      className="rounded-2xl overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.92)', border: `1.5px solid ${theme.color}30`, boxShadow: `0 4px 16px ${theme.color}12` }}
    >
      <div className="h-1.5" style={{ background: theme.gradient }} />

      <button className="w-full text-left p-4" onClick={() => setOpen(!open)}>
        <div className="flex items-center gap-3">
          <motion.div
            className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: theme.bg }}
            whileTap={{ scale: 0.9 }}
            animate={open ? { rotate: [0, -5, 5, 0] } : {}}
          >
            <Icon className="w-5 h-5" style={{ color: theme.color }} strokeWidth={1.5} />
          </motion.div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <h4 className="font-inter font-bold text-sm text-foreground">{a.name}</h4>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{ background: theme.bg, color: theme.color }}>{catLabel}</span>
          </div>

          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }}>
            <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: theme.color }} />
          </motion.div>
        </div>

        {a.skin_targets && a.skin_targets.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {a.skin_targets.map((t, j) => (
              <span key={j} className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(0,168,120,0.08)', color: '#00A878' }}>{t}</span>
            ))}
          </div>
        )}

        {a.skin_benefits && !open && (
          <p className="text-xs leading-relaxed mt-2 line-clamp-2" style={{ color: 'rgba(0,0,0,0.55)' }}>
            {a.skin_benefits}
          </p>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">
              {a.skin_benefits && (
                <div className="p-3 rounded-xl" style={{ background: theme.bg }}>
                  <p className="text-xs font-semibold mb-1" style={{ color: theme.color }}>✨ Bienfaits pour la peau</p>
                  <p className="text-xs leading-relaxed" style={{ color: 'rgba(0,0,0,0.65)' }}>{a.skin_benefits}</p>
                </div>
              )}

              {a.composition && (
                <div className="space-y-1.5">
                  {a.composition.vitamines?.length > 0 && (
                    <div className="flex flex-wrap gap-1 items-center">
                      <span className="text-xs font-semibold text-muted-foreground w-16">Vitamines</span>
                      {a.composition.vitamines.map((v, k) => (
                        <span key={k} className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ background: 'rgba(245,158,11,0.10)', color: '#D97706' }}>{v}</span>
                      ))}
                    </div>
                  )}
                  {a.composition.mineraux?.length > 0 && (
                    <div className="flex flex-wrap gap-1 items-center">
                      <span className="text-xs font-semibold text-muted-foreground w-16">Minéraux</span>
                      {a.composition.mineraux.map((m, k) => (
                        <span key={k} className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ background: 'rgba(59,130,246,0.08)', color: '#2563EB' }}>{m}</span>
                      ))}
                    </div>
                  )}
                  {a.composition.antioxydants?.length > 0 && (
                    <div className="flex flex-wrap gap-1 items-center">
                      <span className="text-xs font-semibold text-muted-foreground w-16">Antioxyd.</span>
                      {a.composition.antioxydants.map((o, k) => (
                        <span key={k} className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ background: 'rgba(139,92,246,0.08)', color: '#7C3AED' }}>{o}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {(conso.frequence || conso.quantite || conso.preparation_tip || conso.preparation || conso.moment) && (
                <div className="rounded-xl p-3 space-y-1.5 border" style={{ borderColor: `${theme.color}20`, background: 'rgba(255,255,255,0.6)' }}>
                  <p className="text-xs font-semibold" style={{ color: theme.color }}>📋 Comment consommer</p>
                  {conso.frequence && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 flex-shrink-0" />{conso.frequence}
                    </p>
                  )}
                  {conso.quantite && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Ruler className="w-3 h-3 flex-shrink-0" />{conso.quantite}
                    </p>
                  )}
                  {conso.moment && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Coffee className="w-3 h-3 flex-shrink-0" />{conso.moment}
                    </p>
                  )}
                  {(conso.preparation_tip || conso.preparation) && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <ChefHat className="w-3 h-3 flex-shrink-0" />{conso.preparation_tip || conso.preparation}
                    </p>
                  )}
                </div>
              )}

              {(a.local_availability || a.disponibilite) && (
                <p className="text-xs font-semibold flex items-center gap-1.5" style={{ color: '#00A878' }}>
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  {a.local_availability || a.disponibilite}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function NutritionSection({ aliments }) {
  if (!aliments || aliments.length === 0) return (
    <motion.div className="mx-4 mb-4 p-4 rounded-2xl text-center"
      style={{ background: 'rgba(249,115,22,0.06)', border: '1.5px dashed rgba(249,115,22,0.25)' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Apple className="w-6 h-6 text-orange-400 mx-auto mb-2" />
      <p className="text-xs text-muted-foreground">Les recommandations nutritionnelles seront disponibles lors de votre prochaine analyse.</p>
    </motion.div>
  );

  const displayed = aliments.slice(0, 6);

  return (
    <motion.div className="mx-4 mb-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>

      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <motion.div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(249,115,22,0.10)' }}
          animate={{ rotate: [0, -8, 8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Apple className="w-4 h-4 text-orange-500" />
        </motion.div>
        <div>
          <h3 className="font-inter font-bold text-base text-foreground">Nutrition</h3>
          <p className="text-xs text-muted-foreground">1 fruit · 2 plats · 1 boisson · 1 collation · 1 dessert</p>
        </div>
        <div className="ml-auto">
          <span className="text-xs px-2.5 py-1 rounded-full font-bold"
            style={{ background: 'rgba(0,168,120,0.08)', color: '#00A878' }}>
            6 aliments
          </span>
        </div>
      </div>

      {/* Légende catégories */}
      <motion.div
        className="flex gap-2 overflow-x-auto pb-2 mb-4"
        style={{ scrollbarWidth: 'none' }}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.15 }}
      >
        {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
          const theme = CATEGORY_THEME[key];
          return (
            <span key={key}
              className="flex-shrink-0 text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1"
              style={{ background: theme.bg, color: theme.color }}>
              <span>{theme.emoji}</span> {label}
            </span>
          );
        })}
      </motion.div>

      {/* Liste */}
      <div className="space-y-3">
        {displayed.map((a, i) => (
          <AlimentCard key={i} a={a} index={i} />
        ))}
      </div>
    </motion.div>
  );
}