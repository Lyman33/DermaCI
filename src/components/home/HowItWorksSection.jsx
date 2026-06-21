import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, ClipboardList, Sparkles, ArrowRight, Zap, Shield, Microscope } from 'lucide-react';

const STEPS = [
  { num: '01', icon: <Camera className="w-6 h-6" />, color: '#00A878',
    title: 'Prenez votre photo', desc: 'Selfie en pleine lumière naturelle, visage dégagé et sans maquillage pour une analyse précise.' },
  { num: '02', icon: <ClipboardList className="w-6 h-6" />, color: '#2d7a4f',
    title: 'Remplissez le formulaire', desc: 'Âge, genre et temps disponible pour vos soins. 30 secondes suffisent.' },
  { num: '03', icon: <Sparkles className="w-6 h-6" />, color: '#00C896',
    title: 'Recevez votre rapport', desc: 'Analyse complète avec diagnostic, routine, actifs et conseils nutritionnels ivoiriens.' },
];

export default function HowItWorksSection() {
  const navigate = useNavigate();
  return (
    <section className="px-5 py-4">
      <motion.div className="text-center mb-4"
        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} transition={{ duration: 0.5 }}>
        <h2 className="font-inter text-2xl font-bold text-foreground mb-2">
          Comment ça marche ?
        </h2>
        <p className="text-sm text-muted-foreground">3 étapes simples, des résultats précis</p>
      </motion.div>

      <div className="max-w-lg mx-auto space-y-2 mb-8">
        {STEPS.map((s, i) => (
          <motion.div key={i} id={i === 1 ? 'step-02' : undefined} className="flex items-center gap-3 p-3 rounded-2xl bg-white/70 border border-white/80 shadow-sm"
            initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.12 }}>
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${s.color}18`, color: s.color }}>
                {s.icon}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black" style={{ color: s.color }}>{s.num}</span>
              <h3 className="font-inter font-bold text-sm text-foreground">{s.title}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* CTA final */}
      <motion.div className="text-center"
        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} transition={{ duration: 0.5 }}>
        <button onClick={() => navigate('/analysis')}
          className="w-full max-w-xs mx-auto flex items-center justify-center gap-2 px-6 py-4 rounded-3xl font-bold text-white text-base mb-4"
          style={{ background: '#00A878' }}>
          <Zap className="w-5 h-5" />
          Analyser ma peau
          <ArrowRight className="w-5 h-5" />
        </button>
        <div className="flex items-center justify-center gap-4 text-xs text-primary/70">
          <div className="flex items-center gap-1">
            <Shield className="w-3.5 h-3.5" />
            <span>Données privées</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-3.5 h-3.5" />
            <span>Résultats en 2min</span>
          </div>
          <div className="flex items-center gap-1">
            <Microscope className="w-3.5 h-3.5" />
            <span>Analyse précise</span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}