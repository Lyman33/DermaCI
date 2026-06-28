import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Circle, Layers, Sun, Droplets, Sparkles, Diamond, Leaf, BarChart3 } from 'lucide-react';

const ICON_MAP = { Circle, Layers, Sun, Droplets, Sparkles, Diamond, Leaf };

function blendColors(hex1, hex2, ratio) {
  const r1=parseInt(hex1.slice(1,3),16),g1=parseInt(hex1.slice(3,5),16),b1=parseInt(hex1.slice(5,7),16);
  const r2=parseInt(hex2.slice(1,3),16),g2=parseInt(hex2.slice(3,5),16),b2=parseInt(hex2.slice(5,7),16);
  const r=Math.round(r1+(r2-r1)*ratio),g=Math.round(g1+(g2-g1)*ratio),b=Math.round(b1+(b2-b1)*ratio);
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
}

function getSkinTypeColor(skinType) {
  const full = (skinType || '').toLowerCase();
  // Couleur de base = TYPE PRINCIPAL (avant "a tendance"), pas la tendance.
  const t = full.split(/\s*[aà]\s+tendance\s*/)[0];
  let base = '#00A878';
  if (t.includes('grasse'))                                             base = '#D4A017';
  else if (t.includes('mixte'))                                         base = '#256D85';
  else if (t.includes('sèche') || t.includes('seche'))                 base = '#C68642';
  else if (t.includes('sensible'))                                      base = '#D977A8';
  else if (t.includes('mature'))                                        base = '#6D214F';
  else if (t.includes('déshydrat') || t.includes('deshydrat'))         base = '#60A5FA';
  else if (t.includes('normale'))                                       base = '#059669';
  else if (t.includes('acné') || t.includes('acne') || t.includes('acneique') || t.includes('acnéique')) base = '#DC2626';

  // La tendance ajuste la nuance (on lit la chaine complete 'full').
  if (full.includes('tendance acné') || full.includes('tendance acne') || full.includes('tendance acneique') || full.includes('tendance acnéique'))
    return blendColors(base, '#DC2626', 0.60);
  if (full.includes('tendance grasse') || full.includes('predominance grasse') || full.includes('prédominance grasse'))
    return blendColors(base, '#D4A017', 0.60);
  if (full.includes('tendance seche') || full.includes('tendance sèche') || full.includes('predominance seche') || full.includes('prédominance sèche'))
    return blendColors(base, '#C68642', 0.60);
  if (full.includes('tendance pigment') || full.includes('tendance terne'))
    return blendColors(base, '#92400E', 0.60);
  if (full.includes('tendance sensible') || full.includes('tendance reactive') || full.includes('tendance réactive'))
    return blendColors(base, '#D977A8', 0.60);
  if (full.includes('tendance mature'))
    return blendColors(base, '#6D214F', 0.60);
  if (full.includes('tendance deshydrat') || full.includes('tendance déshydrat'))
    return blendColors(base, '#60A5FA', 0.60);
  if (full.includes('tendance couperose') || full.includes('tendance couperosée'))
    return blendColors(base, '#F87171', 0.60);
  if (full.includes('tendance atopique'))
    return blendColors(base, '#A78BFA', 0.60);
  if (full.includes('tendance mixte'))
    return blendColors(base, '#256D85', 0.60);
  if (full.includes('tendance normale'))
    return blendColors(base, '#059669', 0.60);

  return base;
}

// Génère des couleurs dérivées (variations teinte/saturation) depuis la couleur thème
function getDerivedColors(baseHex) {
  // 7 couleurs dérivées avec des niveaux d'opacité et de luminosité variés
  return [
    baseHex,
    adjustColor(baseHex, 15, 0),
    adjustColor(baseHex, -15, 0),
    adjustColor(baseHex, 30, 10),
    adjustColor(baseHex, -25, -10),
    adjustColor(baseHex, 20, 15),
    adjustColor(baseHex, -10, 20),
  ];
}

function adjustColor(hex, hShift, lShift) {
  // Simple hex → hsl shift → hex
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const max = Math.max(r, g, b) / 255;
  const min = Math.min(r, g, b) / 255;
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (Math.max(r, g, b) / 255) {
      case r / 255: h = ((g - b) / 255 / d + (g < b ? 6 : 0)) / 6; break;
      case g / 255: h = ((b - r) / 255 / d + 2) / 6; break;
      default:      h = ((r - g) / 255 / d + 4) / 6;
    }
  }
  h = ((h * 360 + hShift) % 360 + 360) % 360;
  l = Math.max(0.25, Math.min(0.75, l + lShift / 100));
  // hsl → rgb
  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const rr = Math.round(hue2rgb(p, q, h / 360 + 1/3) * 255);
  const gg = Math.round(hue2rgb(p, q, h / 360) * 255);
  const bb = Math.round(hue2rgb(p, q, h / 360 - 1/3) * 255);
  return `#${rr.toString(16).padStart(2, '0')}${gg.toString(16).padStart(2, '0')}${bb.toString(16).padStart(2, '0')}`;
}

const CRITERIA = [
  { key: 'uniformite_teint',      label: 'Uniformité du teint',     weight: '20%', icon: 'Circle'    },
  { key: 'texture_grain',         label: 'Texture & Grain',         weight: '18%', icon: 'Layers'    },
  { key: 'eclat_luminosite',      label: 'Éclat & Luminosité',      weight: '15%', icon: 'Sun'       },
  { key: 'hydratation',           label: 'Hydratation',             weight: '15%', icon: 'Droplets'  },
  { key: 'absence_imperfections', label: "Absence d'imperfections", weight: '14%', icon: 'Sparkles'  },
  { key: 'fermete_contours',      label: 'Fermeté & Contours',      weight: '10%', icon: 'Diamond'   },
  { key: 'sante_globale',         label: 'Santé Globale',           weight: '8%',  icon: 'Leaf'      },
];

function getScoreLabel(value) {
  if (value >= 75) return 'Excellent';
  if (value >= 60) return 'Bon';
  if (value >= 45) return 'Correct';
  if (value >= 30) return 'Faible';
  return 'Critique';
}



export default function ScoreBreakdown({ breakdown, skinType }) {
  const [animated, setAnimated] = useState(false);
  const themeColor = getSkinTypeColor(skinType);
  const colors = getDerivedColors(themeColor);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 400);
    return () => clearTimeout(timer);
  }, []);

  if (!breakdown || Object.keys(breakdown).length === 0) return null;

  return (
    <motion.div className="mx-4 rounded-3xl p-5 mb-4"
      style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>

      <div className="flex items-center gap-2 mb-5">
        <div className="w-7 h-7 rounded-xl flex items-center justify-center"
          style={{ background: `${themeColor}18` }}>
          <BarChart3 className="w-4 h-4" style={{ color: themeColor }} strokeWidth={1.5} />
        </div>
        <div>
          <h3 className="font-inter font-bold text-base text-foreground">Score détaillé</h3>
          <p className="text-xs text-muted-foreground">Analyse critère par critère</p>
        </div>
      </div>

      <div className="space-y-4">
        {CRITERIA.map((c, i) => {
          const val = breakdown[c.key] ?? 0;
          const barColor = colors[i % colors.length];
          const label = getScoreLabel(val);

          return (
            <motion.div key={c.key}
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.07 }}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  {(() => { const I = ICON_MAP[c.icon]; return I ? <I className="w-4 h-4 flex-shrink-0" style={{ color: barColor }} strokeWidth={1.5} /> : null; })()}
                  <span className="text-xs font-medium text-foreground/80">{c.label}</span>
                  <span className="text-xs text-muted-foreground/50">({c.weight})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: `${barColor}25`, color: barColor }}>
                    {label}
                  </span>
                  <span className="text-sm font-black" style={{ color: barColor }}>{val}</span>
                </div>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.06)' }}>
                <motion.div className="h-full rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: animated ? `${val}%` : '0%' }}
                  transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1], delay: 0.15 + i * 0.08 }}
                  style={{ background: `linear-gradient(90deg, ${barColor}cc, ${barColor})`, boxShadow: `0 0 8px ${barColor}50` }} />
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
