import { motion } from 'framer-motion';
import { ScanFace, Leaf, FlaskConical, Droplets, MapPin, Apple, LineChart, MessageSquare } from 'lucide-react';

const FEATURES = [
  { icon: <ScanFace className="w-6 h-6" />, color: '#00A878', bg: 'rgba(0,168,120,0.12)',
    title: 'Diagnostic IA précis', desc: 'Analyse photo de votre peau avec détection des problèmes cutanés, type de peau et score de santé global.' },
  { icon: <Leaf className="w-6 h-6" />, color: '#2d7a4f', bg: 'rgba(45,122,79,0.12)',
    title: 'Routine sur-mesure', desc: 'Routine matin et soir personnalisée selon votre type de peau, votre âge et le temps que vous pouvez y consacrer.' },
  { icon: <FlaskConical className="w-6 h-6" />, color: '#00C896', bg: 'rgba(0,200,150,0.12)',
    title: 'Actifs expliqués', desc: 'Actifs cosmétiques recommandés avec mécanismes scientifiques détaillés et concentrations adaptées.' },
  { icon: <Apple className="w-6 h-6" />, color: '#F5A623', bg: 'rgba(245,166,35,0.12)',
    title: 'Nutrition ivoirienne', desc: 'Plan nutritionnel avec les aliments locaux de Côte d\'Ivoire les plus bénéfiques pour votre peau.' },
  { icon: <MapPin className="w-6 h-6" />, color: '#E74C3C', bg: 'rgba(231,76,60,0.12)',
    title: 'Pharmacies proches', desc: 'Localisation des pharmacies près de chez vous avec disponibilité des actifs recommandés.' },
  { icon: <Droplets className="w-6 h-6" />, color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)',
    title: 'Adapté au climat CI', desc: 'Conseils spécialement conçus pour la chaleur, l\'humidité et les UV intenses de la Côte d\'Ivoire.' },
  { icon: <LineChart className="w-6 h-6" />, color: '#06B6D4', bg: 'rgba(6,182,212,0.12)',
    title: 'Suivi & Coach', desc: 'Suivi de votre évolution cutanée et coaching personnalisé pour optimiser vos résultats au fil du temps.' },
  { icon: <MessageSquare className="w-6 h-6" />, color: '#EC4899', bg: 'rgba(236,72,153,0.12)',
    title: 'Chat avec DermaBot', desc: 'IA conversationnelle disponible 24/7 pour répondre à vos questions et affiner vos conseils skincare.' },
];

export default function FeaturesSection() {
  return (
    <section className="px-5 py-4">
      <motion.div className="text-center mb-4"
        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} transition={{ duration: 0.5 }}>
        <h2 className="font-inter text-2xl font-bold text-foreground mb-2">
          Tout ce dont votre peau a besoin
        </h2>
        <p className="text-sm text-muted-foreground">
          Une analyse complète en une seule photo
        </p>
      </motion.div>

      <div className="flex flex-col gap-2 max-w-lg mx-auto">
        {FEATURES.map((f, i) => (
          <motion.div key={i}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/70 border border-white/80 shadow-sm"
            initial={{ opacity: 0, x: -15 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.3, delay: i * 0.05 }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: f.bg, color: f.color }}>
              {f.icon}
            </div>
            <h3 className="font-inter font-bold text-sm text-foreground">{f.title}</h3>
          </motion.div>
        ))}
      </div>
    </section>
  );
}