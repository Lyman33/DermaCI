import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Brain, Leaf, MapPin, BookOpen, AlertTriangle, Check, Heart, Zap, ScanFace, FlaskConical, Droplets, Apple, LineChart, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

const LOGO_URL = "https://media.base44.com/images/public/6a0e53b978ea3d5f75666bd8/fd6f17ab5_LE_LOGO_OFFICIEL.png";

const FEATURES = [
  { icon: ScanFace, color: '#00A878', title: 'Diagnostic IA précis', desc: 'Analyse photo de votre peau avec détection des problèmes cutanés, type de peau et score de santé global.' },
  { icon: Leaf, color: '#2d7a4f', title: 'Routine sur-mesure', desc: 'Routine matin et soir personnalisée selon votre type de peau, votre âge et le temps que vous pouvez y consacrer.' },
  { icon: FlaskConical, color: '#00C896', title: 'Actifs expliqués', desc: 'Actifs cosmétiques recommandés avec mécanismes scientifiques détaillés et concentrations adaptées.' },
  { icon: Apple, color: '#F5A623', title: 'Nutrition ivoirienne', desc: 'Plan nutritionnel avec les aliments locaux de Côte d\'Ivoire les plus bénéfiques pour votre peau.' },
  { icon: MapPin, color: '#E74C3C', title: 'Pharmacies proches', desc: 'Localisation des pharmacies près de chez vous avec disponibilité des actifs recommandés.' },
  { icon: Droplets, color: '#8B5CF6', title: 'Adapté au climat CI', desc: 'Conseils spécialement conçus pour la chaleur, l\'humidité et les UV intenses de la Côte d\'Ivoire.' },
  { icon: LineChart, color: '#06B6D4', title: 'Suivi & Coach', desc: 'Suivi de votre évolution cutanée et coaching personnalisé pour optimiser vos résultats au fil du temps.' },
  { icon: MessageSquare, color: '#EC4899', title: 'Chat avec DermaBot', desc: 'IA conversationnelle disponible 24/7 pour répondre à vos questions et affiner vos conseils skincare.' },
];

const BENEFITS = [
  'Analyse instantanée de votre peau',
  'Plan de traitement étape par étape',
  'Ingrédients actifs expliqués',
  'Suggestions nutritionnelles locales',
  'Habitudes de vie recommandées',
  'Suivi de votre évolution',
  'Coaching personnalisé continu',
  'Chat avec IA 24/7 · DermaBot',
];

const DISCLAIMERS = [
  'DermaCI est un outil éducatif et informatif',
  'Les analyses ne remplacent pas un diagnostic médical',
  'Consultez un dermatologue pour les problèmes persistants',
  'En cas de réaction allergique, arrêtez et consultez',
];

export default function About() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'DermaCI — À Propos';
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* ── BACKGROUND ANIMATION ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 400, height: 400,
            top: '-100px', right: '-100px',
            background: 'radial-gradient(circle, rgba(0,168,120,0.08) 0%, transparent 70%)',
          }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 300, height: 300,
            bottom: '-50px', left: '-50px',
            background: 'radial-gradient(circle, rgba(0,168,120,0.06) 0%, transparent 70%)',
          }}
          animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 12, repeat: Infinity, delay: 2 }}
        />
      </div>

      <div className="relative z-10 pb-24">
        <div className="max-w-md mx-auto px-4 pt-6">

          {/* ── BACK BUTTON ── */}
          <motion.button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground mb-6 hover:text-foreground transition-colors"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}>
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Retour</span>
          </motion.button>

          {/* ── HERO SECTION ── */}
          <motion.div className="text-center mb-10"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            
            {/* Badge */}
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5 text-xs font-semibold"
              style={{ background: 'rgba(0,168,120,0.12)', border: '1px solid rgba(0,168,120,0.25)', color: '#00A878' }}
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}>
              <Sparkles className="w-3.5 h-3.5" />
              À propos de DermaCI
            </motion.div>

            {/* Logo */}
            <motion.div className="flex justify-center mb-4"
              initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.15, type: 'spring', stiffness: 200 }}>
              <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center">
                <img src={LOGO_URL} alt="DermaCI" className="w-16 h-16 object-contain" />
              </div>
            </motion.div>

            {/* Title */}
            <motion.h1
              className="text-4xl font-black mb-2 leading-tight"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}>
              <span style={{ color: '#0d2818' }}>Derma</span>
              <span style={{ color: '#00A878' }}>CI</span>
            </motion.h1>

            <motion.p className="text-base text-muted-foreground leading-relaxed max-w-sm mx-auto"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}>
              L'intelligence artificielle au service de votre peau, pensée pour la Côte d'Ivoire.
            </motion.p>
          </motion.div>

          {/* ── NOTRE MISSION ── */}
          <motion.div className="mb-8 p-6 rounded-3xl border border-border bg-card/80 backdrop-blur-sm"
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className="flex items-start gap-3 mb-3">
              <Heart className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <h2 className="text-lg font-bold">Notre mission</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Chaque personne mérite d'avoir accès à des conseils skincare personnalisés et adaptés à son contexte de vie.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              DermaCI utilise l'intelligence artificielle de pointe pour analyser votre peau et fournir des recommandations 100% adaptées au contexte ivoirien : climat chaud et humide, produits locaux disponibles, et habitudes culturelles.
            </p>
          </motion.div>

          {/* ── CE QUE NOUS OFFRONS ── */}
          <motion.div className="mb-8"
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Ce que nous offrons
            </h2>
            <div className="space-y-3">
              {FEATURES.map((f, i) => (
                <motion.div key={i}
                  className="flex items-start gap-4 p-4 rounded-2xl border border-border bg-card/50 hover:border-primary/30 transition-all"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.38 + i * 0.06 }}>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: f.color + '15', borderColor: f.color + '30', border: '1px solid' }}>
                    <f.icon className="w-5 h-5" style={{ color: f.color }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold mb-1 text-foreground">{f.title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ── BÉNÉFICES ── */}
          <motion.div className="mb-8 p-6 rounded-3xl border border-primary/20 bg-primary/5"
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
            <h2 className="text-lg font-bold mb-4 text-foreground">Vous obtenez</h2>
            <div className="grid grid-cols-2 gap-3">
              {BENEFITS.map((item, i) => (
                <motion.div key={i}
                  className="flex items-start gap-2 p-3 rounded-xl bg-white/40"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.58 + i * 0.05 }}>
                  <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-xs text-foreground font-medium leading-tight">{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ── AVERTISSEMENT IMPORTANT ── */}
          <motion.div className="mb-6 p-5 rounded-2xl border border-red-500/20 bg-red-500/5"
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}>
            <h2 className="text-sm font-bold mb-3 flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-4 h-4" /> Avertissement important
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">
              DermaCI est un <strong>outil éducatif et informatif</strong>, pas un dispositif médical homologué.
            </p>
            <ul className="space-y-2">
              {DISCLAIMERS.map((item, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                  <span className="text-red-400 flex-shrink-0 mt-0.5">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* ── FOOTER ── */}
          <motion.div className="text-center"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75 }}>
            <p className="text-xs text-muted-foreground/50 mb-1">
              Créé avec passion pour les peaux africaines
            </p>
            <p className="text-xs text-muted-foreground/30">
              © 2026 DermaCI · Côte d'Ivoire
            </p>
          </motion.div>

        </div>
      </div>
    </div>
  );
}