import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, ArrowRight } from 'lucide-react';
function IconFemme() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M12 12v8M9 17h6" />
    </svg>
  );
}

function IconHomme() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="4" />
      <path d="M21 3l-6 6M15 3h6v6" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}

function IconAge() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

const TEMPS_OPTIONS = [
  {
    value: 'peu',
    label: '5 min',
    sublabel: 'Routine express',
    desc: '3 étapes essentielles',
    detail: 'Nettoyage · Hydratation · SPF',
    icon: <IconClock />,
    color: '#00A878',
  },
  {
    value: 'modéré',
    label: '15 min',
    sublabel: 'Routine complète',
    desc: '5 étapes efficaces',
    detail: 'Nettoyage · Tonique · Sérum · Hydratation · SPF',
    icon: <IconClock />,
    color: '#2d7a4f',
  },
  {
    value: 'beaucoup',
    label: '30 min',
    sublabel: 'Routine premium',
    desc: '7 étapes expertes',
    detail: 'Protocole dermatologue complet',
    icon: <IconClock />,
    color: '#0d2818',
  },
];

export default function UserContextForm({ onSubmit, isLoading }) {
  const [ageCustom, setAgeCustom]   = useState('');
  const [genre, setGenre]           = useState(null);
  const [tempssoins, setTempssoins] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const finalAge = parseInt(ageCustom);
  const isComplete = ageCustom && finalAge >= 13 && finalAge <= 80 && genre && tempssoins;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isComplete) return;
    onSubmit({ age: finalAge, genre, temps_soins: tempssoins });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-7 pb-8">

      {/* ── SECTION ÂGE ──────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-2 mb-1">
          <div style={{ color: '#00A878' }}><IconAge /></div>
          <p className="font-inter font-bold text-sm text-foreground">Votre âge</p>
        </div>
        <p className="text-xs text-muted-foreground mb-4 ml-6">
          L'âge influence directement le type de soins adaptés à votre peau
        </p>

        <div className="relative">
          <input
            type="number" min="13" max="80"
            placeholder="Ex : 28"
            value={ageCustom}
            onChange={(e) => setAgeCustom(e.target.value)}
            onWheel={(e) => e.target.blur()}
            inputMode="numeric"
            className="w-full py-4 px-5 rounded-2xl text-left font-bold text-xl bg-white/80 outline-none transition-all"
            style={{
              border: ageCustom && parseInt(ageCustom) >= 13 && parseInt(ageCustom) <= 80
                ? '2px solid #00A878'
                : '1.5px solid rgba(0,0,0,0.10)',
              color: '#00A878',
            }}
          />

          <AnimatePresence>
            {ageCustom && parseInt(ageCustom) >= 13 && parseInt(ageCustom) <= 80 && (
              <motion.div
                className="mt-2 px-4 py-3 rounded-xl"
                style={{ background: 'rgba(0,168,120,0.07)', border: '1px solid rgba(0,168,120,0.15)' }}
                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <p className="text-xs font-bold text-primary mb-1">🔬 Type de peau probable à {ageCustom} ans</p>
                <p className="text-xs text-primary/80 font-medium leading-relaxed">
                  {(() => {
                    const a = parseInt(ageCustom);
                    if (a < 18) return 'À cet âge, la peau est souvent grasse à mixte avec une tendance acnéique marquée. Les fluctuations hormonales stimulent le sébum et favorisent les comédons, surtout sur le front, le nez et le menton.';
                    if (a < 25) return 'Votre peau est probablement mixte à tendance grasse. Le sébum reste actif, les pores peuvent être dilatés et les premières hyperpigmentations post-inflammatoires peuvent apparaître, surtout en climat tropical.';
                    if (a < 30) return 'À cet âge, la peau est généralement mixte équilibrée. Les premiers signes de déshydratation peuvent apparaître malgré un teint encore lumineux. Les taches liées au soleil commencent parfois à se révéler.';
                    if (a < 40) return 'La peau devient souvent normale à mixte avec un début de perte d\'éclat. Le renouvellement cellulaire ralentit, les pores s\'élargissent et les premières rides d\'expression peuvent apparaître.';
                    if (a < 50) return 'La peau tend vers le sec à normal avec une perte de fermeté progressive. Les dyschromies et taches pigmentaires sont fréquentes sur les peaux africaines à cet âge, accentuées par l\'exposition UV.';
                    if (a < 60) return 'La peau est généralement sèche à mature avec un relâchement visible. L\'hyperpigmentation, les rides établies et la perte de densité cutanée sont les préoccupations principales à cette période.';
                    return 'La peau est mature avec une sécheresse marquée et une perte de tonicité. Les taches, les rides profondes et la fragilité cutanée nécessitent des soins nutritifs et réparateurs intensifs.';
                  })()}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ── SECTION GENRE ─────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
        <div className="flex items-center gap-2 mb-1">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00A878" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="9" /><path d="M12 8v8M8 12h8" /></svg>
          <p className="font-inter font-bold text-sm text-foreground">Profil biologique</p>
        </div>
        <p className="text-xs text-muted-foreground mb-4 ml-6">
          La physiologie cutanée diffère significativement selon le sexe
        </p>

        <div className="grid grid-cols-2 gap-3">
          {[
            {
              value: 'femme',
              label: 'Femme',
              icon: <IconFemme />,
              desc: 'Peau influencée par les hormones',
              detail: 'Fluctuations hormonales · Mélasma · Sensibilité',
              color: '#8B5CF6',
            },
            {
              value: 'homme',
              label: 'Homme',
              icon: <IconHomme />,
              desc: 'Peau plus épaisse et sébacée',
              detail: 'Sébum élevé · Pores larges · Poils incarnés',
              color: '#00A878',
            },
          ].map((opt) => {
            const selected = genre === opt.value;
            return (
              <motion.button key={opt.value} type="button"
                onClick={() => setGenre(opt.value)}
                className="text-left p-4 rounded-2xl transition-all"
                style={{
                  background: selected ? `${opt.color}12` : 'rgba(255,255,255,0.7)',
                  border: selected ? `2px solid ${opt.color}` : '1.5px solid rgba(0,0,0,0.07)',
                  boxShadow: selected ? `0 4px 16px ${opt.color}18` : 'none',
                }}
                whileTap={{ scale: 0.97 }}>
                <div className="flex items-center gap-2 mb-2" style={{ color: selected ? opt.color : 'hsl(var(--muted-foreground))' }}>
                  {opt.icon}
                  <span className="font-inter font-bold text-sm" style={{ color: selected ? opt.color : 'hsl(var(--foreground))' }}>
                    {opt.label}
                  </span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: selected ? opt.color + 'cc' : 'hsl(var(--muted-foreground))' }}>
                  {opt.desc}
                </p>
                <p className="text-xs mt-1.5 leading-relaxed opacity-70" style={{ color: selected ? opt.color : 'hsl(var(--muted-foreground))' }}>
                  {opt.detail}
                </p>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* ── SECTION TEMPS ─────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
        <div className="flex items-center gap-2 mb-1">
          <div style={{ color: '#00A878' }}><IconClock /></div>
          <p className="font-inter font-bold text-sm text-foreground">Temps dédié aux soins</p>
        </div>
        <p className="text-xs text-muted-foreground mb-4 ml-6">
          Nous adaptons votre routine à votre rythme de vie quotidien
        </p>

        <div className="space-y-2.5">
          {TEMPS_OPTIONS.map((opt) => {
            const selected = tempssoins === opt.value;
            return (
              <motion.button key={opt.value} type="button"
                onClick={() => setTempssoins(opt.value)}
                className="w-full text-left p-4 rounded-2xl transition-all flex items-center gap-4"
                style={{
                  background: selected ? `${opt.color}10` : 'rgba(255,255,255,0.7)',
                  border: selected ? `2px solid ${opt.color}` : '1.5px solid rgba(0,0,0,0.07)',
                  boxShadow: selected ? `0 4px 16px ${opt.color}15` : 'none',
                }}
                whileTap={{ scale: 0.98 }}>
                {/* Durée */}
                <div className="flex-shrink-0 w-14 h-14 rounded-2xl flex flex-col items-center justify-center"
                  style={{ background: selected ? `${opt.color}18` : 'rgba(0,0,0,0.04)' }}>
                  <span className="font-inter font-black text-lg leading-none" style={{ color: selected ? opt.color : 'hsl(var(--muted-foreground))' }}>
                    {opt.label.split(' ')[0]}
                  </span>
                  <span className="text-xs" style={{ color: selected ? opt.color : 'hsl(var(--muted-foreground))' }}>
                    min
                  </span>
                </div>
                {/* Infos */}
                <div className="flex-1">
                  <p className="font-inter font-bold text-sm mb-0.5" style={{ color: selected ? opt.color : 'hsl(var(--foreground))' }}>
                    {opt.sublabel}
                  </p>
                  <p className="text-xs font-medium" style={{ color: selected ? opt.color + 'cc' : 'hsl(var(--muted-foreground))' }}>
                    {opt.desc}
                  </p>
                  <p className="text-xs mt-1 opacity-60" style={{ color: selected ? opt.color : 'hsl(var(--muted-foreground))' }}>
                    {opt.detail}
                  </p>
                </div>
                {/* Indicateur sélection */}
                {selected && (
                  <motion.div className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: opt.color }}
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300 }}>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="white">
                      <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* ── BOUTON ANALYSER ───────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}>
        {/* Résumé sélection */}
        <AnimatePresence>
          {isComplete && (
            <motion.div className="mb-4 p-3 rounded-2xl flex items-center gap-3"
              style={{ background: 'rgba(0,168,120,0.06)', border: '1px solid rgba(0,168,120,0.15)' }}
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse flex-shrink-0" />
              <p className="text-xs text-primary font-medium">
                Profil prêt · {finalAge} ans · {genre === 'femme' ? 'Femme' : 'Homme'} · Routine {tempssoins === 'peu' ? '5 min' : tempssoins === 'modéré' ? '15 min' : '30 min'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button type="submit"
          disabled={!isComplete || isLoading}
          className="w-full py-4 rounded-2xl font-bold text-white text-base flex items-center justify-center gap-2 transition-all"
          style={{
            background: isComplete && !isLoading
              ? 'linear-gradient(135deg, #00A878, #00C896)'
              : 'rgba(0,168,120,0.25)',
            boxShadow: isComplete && !isLoading ? '0 8px 24px rgba(0,168,120,0.30)' : 'none',
            color: isComplete && !isLoading ? '#fff' : 'rgba(255,255,255,0.5)',
            cursor: isComplete && !isLoading ? 'pointer' : 'not-allowed',
          }}
          whileTap={isComplete && !isLoading ? { scale: 0.97 } : {}}>
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Analyse en cours…
            </>
          ) : (
            <>
              <Zap className="w-5 h-5" />
              Analyser ma peau
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </motion.button>

        {!isComplete && (
          <p className="text-xs text-muted-foreground text-center mt-2">
            Complétez tous les champs pour continuer
          </p>
        )}
      </motion.div>

    </form>
  );
}