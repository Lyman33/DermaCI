import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, MapPin, Package } from 'lucide-react';

const T = {
  primary: '#E74C3C',
  light:   '#FF6B5B',
  bg:      'rgba(231,76,60,0.07)',
  border:  'rgba(231,76,60,0.18)',
};

export default function PharmacyDisclaimer() {
  return (
    <motion.div className="mx-4 mb-6 rounded-2xl overflow-hidden"
      style={{ border: `1.5px solid ${T.border}`, background: T.bg }}
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}>

      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-center gap-2.5" style={{ borderBottom: `1px solid ${T.border}` }}>
        <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: T.primary }} />
        <h4 className="font-inter font-bold text-sm" style={{ color: T.primary }}>À propos de cette sélection</h4>
      </div>

      {/* Contenu */}
      <div className="px-4 py-4 space-y-3">
        <p className="text-xs leading-relaxed text-muted-foreground">
          Les pharmacies listées ont été <span className="font-semibold text-foreground">sélectionnées selon des critères spécifiques</span> :
        </p>

        {/* Critères */}
        <div className="space-y-2">
          <div className="flex items-start gap-2.5">
            <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: '#00A878' }} />
            <div>
              <p className="text-xs font-semibold text-foreground">Disponibilité vérifiée des actifs dermatologiques</p>
              <p className="text-xs text-muted-foreground">Sélection basée sur la probabilité que ces pharmacies stock les actifs recommandés pour votre profil cutané.</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: '#00A878' }} />
            <div>
              <p className="text-xs font-semibold text-foreground">Couverture géographique stratégique</p>
              <p className="text-xs text-muted-foreground">Priorisation des grandes villes (Abidjan, Bouaké, Yamoussoukro, etc.) et quartiers à forte densité dermatologique.</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: '#00A878' }} />
            <div>
              <p className="text-xs font-semibold text-foreground">Accessibilité et horaires étendus</p>
              <p className="text-xs text-muted-foreground">Priorisation des pharmacies 24h/24, situations centrales, et horaires pratiques pour la majorité des utilisateurs.</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: '#00A878' }} />
            <div>
              <p className="text-xs font-semibold text-foreground">Notations de confiance</p>
              <p className="text-xs text-muted-foreground">Sélection favorisant les établissements avec les meilleures évaluations locales et réputations vérifiées.</p>
            </div>
          </div>
        </div>

        {/* Avertissement */}
        <div className="mt-4 pt-3" style={{ borderTop: `1px solid ${T.border}` }}>
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Autres pharmacies :</span> Il existe d'autres excellentes pharmacies en Côte d'Ivoire qui ne figurent pas dans cette liste. Les recommendations de DermaCI ne constituent pas une exclusion — nous vous encourageons à explorer d'autres options selon votre proximité et préférences personnelles.
          </p>
        </div>

        {/* Call-to-action */}
        <p className="text-xs text-muted-foreground flex items-start gap-1.5">
          <span className="flex-shrink-0">💡</span>
          <span><span className="font-semibold text-foreground">Conseil :</span> Appelez toujours la pharmacie avant de vous déplacer pour confirmer la disponibilité des produits spécifiques.</span>
        </p>
      </div>
    </motion.div>
  );
}