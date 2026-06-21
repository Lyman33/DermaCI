import { motion } from 'framer-motion';

const LOGO_URL = "https://media.base44.com/images/public/6a14a8290af9b7a6761f47b4/93361018d_LELOGOOFFICIEL.png";

export default function FooterSection() {
  return (
    <motion.footer className="px-6 py-4 border-t border-border/40 text-center"
      initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
      viewport={{ once: true }} transition={{ duration: 0.5 }}>
      <div className="flex items-center justify-center gap-0 mb-3">
        <img src={LOGO_URL} alt="DermaCI" className="w-10 h-10 object-contain"
          style={{ mixBlendMode: 'multiply' }} />
        <span className="font-inter font-bold text-base">
          Derma<span className="text-primary">CI</span>
        </span>
      </div>
      <p className="text-xs text-muted-foreground mb-2">
        Le premier dermatologue IA dédié aux peaux africaines
      </p>
      <p className="text-xs text-muted-foreground/60">
        Made with ❤️ in Côte d'Ivoire · © 2026 DermaCI
      </p>
      <p className="text-xs text-muted-foreground/40 mt-2 leading-relaxed">
        DermaCI est un outil d'aide à la compréhension de la peau.<br />
        Il ne remplace pas l'avis d'un dermatologue professionnel.
      </p>
    </motion.footer>
  );
}