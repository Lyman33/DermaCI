import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import BackButton from '../components/shared/BackButton';
import PhotoUpload from '../components/analysis/PhotoUpload';
import UserContextForm from '../components/analysis/UserContextForm';
import { motion, AnimatePresence } from 'framer-motion';
import { ScanFace, FlaskConical, Droplets, BookOpen, Leaf, Sparkles, AlertCircle, CheckCircle, Lock, ArrowRight, Infinity as InfinityIcon, Microscope, Salad, MessageCircle, Users, Loader2 } from 'lucide-react';

const LOGO_URL = "https://media.base44.com/images/public/6a0e53b978ea3d5f75666bd8/fd6f17ab5_LE_LOGO_OFFICIEL.png";
const NOTIF_ICON = "https://media.base44.com/images/public/6a0e53b978ea3d5f75666bd8/fd6f17ab5_LE_LOGO_OFFICIEL.png";

const SAVIEZ_VOUS = [
  "La déshydratation peut toucher même une peau grasse. Le sébum n'est pas de l'eau.",
  "L'indice UV en Côte d'Ivoire atteint 8 à 12 toute l'année, même par temps nuageux.",
  "Le zinc réduit la production de sébum en inhibant directement les glandes sébacées.",
  "Le moringa ivoirien contient 7 fois plus de vitamine C que l'orange.",
  "Une peau noire produit plus de mélanine, mais reste sensible aux dommages UV.",
  "Le bissap est l'un des antioxydants les plus puissants disponibles en Côte d'Ivoire.",
  "La chaleur tropicale dilate les pores et stimule la production de sébum de 30%.",
  "La niacinamide agit en 2 semaines pour réduire visiblement les pores dilatés.",
  "L'hyperpigmentation post-inflammatoire est le problème n°1 des peaux africaines.",
  "Boire 2L d'eau par jour améliore visiblement l'éclat cutané en moins de 3 semaines.",
  "L'attiéké fermenté contient des probiotiques naturels bénéfiques pour la peau.",
  "La papaye contient de la papaïne, une enzyme qui exfolie naturellement les cellules mortes.",
  "Le SPF50+ doit être appliqué même par temps nuageux en Côte d'Ivoire.",
  "La vitamine C inhibe la tyrosinase, l'enzyme responsable des taches pigmentaires.",
  "Une routine de 3 étapes bien choisies vaut mieux que 10 étapes mal adaptées.",
  "Le karité ivoirien contient des insaponifiables qui réparent la barrière cutanée.",
  "Le gingembre frais possède des propriétés anti-inflammatoires bénéfiques pour la peau acnéique.",
  "L'acide hyaluronique peut retenir jusqu'à 1000 fois son poids en eau dans la peau.",
  "Le rétinol accélère le renouvellement cellulaire mais doit toujours être utilisé le soir.",
  "La pollution urbaine d'Abidjan génère des radicaux libres qui dégradent le collagène cutané.",
];

const MESSAGES_EMOTIONNELS = [
  "Votre peau raconte une histoire unique.",
  "Comprendre sa peau, c'est reprendre confiance en soi.",
  "DermaCI analyse votre peau avec la précision d'un dermatologue.",
  "Votre éclat naturel mérite d'être révélé, pas masqué.",
  "Votre peau mérite des conseils adaptés à votre réalité ivoirienne.",
  "La science au service de votre beauté naturelle.",
];

const QUIZ_QUESTIONS = [
  { question: "Quel actif réduit le plus efficacement les pores dilatés ?", choices: ["Vitamine C", "Niacinamide", "Rétinol", "Collagène"], correct: 1 },
  { question: "Quel fruit ivoirien est le plus riche en vitamine C ?", choices: ["Mangue", "Ananas", "Goyave", "Orange"], correct: 2 },
  { question: "En Côte d'Ivoire, l'indice UV moyen est de :", choices: ["2 à 4", "5 à 7", "8 à 12", "13 à 15"], correct: 2 },
  { question: "Le zinc est particulièrement utile pour :", choices: ["Hydrater la peau", "Réduire le sébum", "Éclaircir le teint", "Lisser les rides"], correct: 1 },
  { question: "Quel aliment ivoirien est très riche en antioxydants ?", choices: ["Attiéké", "Alloco", "Bissap", "Placali"], correct: 2 },
  { question: "Quel actif est indispensable le matin en Côte d'Ivoire ?", choices: ["Rétinol", "AHA", "SPF 50+", "Acide salicylique"], correct: 2 },
  { question: "La vitamine C agit sur la peau principalement en :", choices: ["Hydratant les cellules", "Inhibant la mélanine", "Dilatant les pores", "Augmentant le sébum"], correct: 1 },
  { question: "Quel oligo-élément est essentiel à la synthèse du collagène ?", choices: ["Fer", "Zinc", "Cuivre", "Magnésium"], correct: 2 },
  { question: "Le moringa contient combien de fois plus de vitamine C que l'orange ?", choices: ["2 fois", "4 fois", "7 fois", "10 fois"], correct: 2 },
  { question: "L'hyperpigmentation post-inflammatoire est causée par :", choices: ["Le froid", "Une réaction inflammatoire", "La déshydratation", "Le vent"], correct: 1 },
  { question: "Quel actif pénètre dans les pores gras pour les déboucher ?", choices: ["Acide hyaluronique", "Acide salicylique", "Niacinamide", "Vitamine E"], correct: 1 },
  { question: "L'acide hyaluronique peut retenir combien de fois son poids en eau ?", choices: ["10 fois", "100 fois", "500 fois", "1000 fois"], correct: 3 },
  { question: "À quelle heure la peau se régénère-t-elle principalement ?", choices: ["18h à 20h", "22h à 2h", "6h à 8h", "12h à 14h"], correct: 1 },
  { question: "Quel fruit ivoirien est riche en acides gras oméga-9 ?", choices: ["Mangue", "Ananas", "Avocat", "Papaye"], correct: 2 },
  { question: "Quel actif doit être utilisé le soir uniquement ?", choices: ["Niacinamide", "Vitamine C", "Rétinol", "SPF 50+"], correct: 2 },
  { question: "Quelle hormone provoque une augmentation du sébum sous stress ?", choices: ["Insuline", "Cortisol", "Mélatonine", "Adrénaline"], correct: 1 },
  { question: "Le gingembre frais est particulièrement utile pour :", choices: ["Hydrater la peau sèche", "Lutter contre l'acné inflammatoire", "Réduire les taches", "Fermer les pores"], correct: 1 },
  { question: "Quelle boisson naturelle ivoirienne hydrate la peau de l'intérieur ?", choices: ["Jus de mangue sucré", "Eau de coco", "Jus d'ananas industriel", "Café"], correct: 1 },
  { question: "La pollution urbaine agit sur la peau en :", choices: ["Hydratant les cellules", "Produisant des radicaux libres", "Réduisant le sébum", "Uniformisant le teint"], correct: 1 },
  { question: "Quel fruit contient de la papaïne, une enzyme exfoliante naturelle ?", choices: ["Mangue", "Goyave", "Papaye", "Ananas"], correct: 2 },
  { question: "Quelle est la principale cause d'hyperpigmentation en Côte d'Ivoire ?", choices: ["Le froid", "L'exposition aux UV intenses", "La pluie", "Le vent harmattan"], correct: 1 },
  { question: "Le centella asiatica est surtout connu pour :", choices: ["Réduire le sébum", "Stimuler le collagène", "Exfolier la peau", "Blanchir le teint"], correct: 1 },
  { question: "Quel minéral est particulièrement abondant dans la noix de cajou ivoirienne ?", choices: ["Fer", "Calcium", "Zinc", "Potassium"], correct: 2 },
  { question: "La peau grasse peut-elle être déshydratée ?", choices: ["Non, jamais", "Oui, c'est fréquent", "Seulement en hiver", "Seulement chez les hommes"], correct: 1 },
  { question: "Quel type de peau est le plus fréquent en Côte d'Ivoire ?", choices: ["Peau sèche", "Peau normale", "Peau grasse ou mixte", "Peau sensible"], correct: 2 },
  { question: "L'acide glycolique appartient à quelle famille d'actifs ?", choices: ["BHA", "AHA", "PHA", "Rétinol"], correct: 1 },
  { question: "Quel est le rôle principal de la mélanine dans la peau ?", choices: ["Hydrater", "Protéger des UV", "Réduire le sébum", "Stimuler le collagène"], correct: 1 },
  { question: "Le bissap (hibiscus) est riche en :", choices: ["Oméga-3", "Anthocyanines antioxydantes", "Acide salicylique", "Rétinol"], correct: 1 },
  { question: "À partir de quel âge le collagène commence-t-il à diminuer ?", choices: ["18 ans", "25 ans", "35 ans", "45 ans"], correct: 1 },
  { question: "Quel actif est le plus efficace contre les taches noires post-acné ?", choices: ["Acide salicylique", "Vitamine C", "Rétinol", "Niacinamide"], correct: 1 },
  { question: "La peau se renouvelle complètement en combien de jours environ ?", choices: ["7 jours", "14 jours", "28 jours", "60 jours"], correct: 2 },
  { question: "Quel oligo-élément combat particulièrement les radicaux libres ?", choices: ["Calcium", "Sélénium", "Sodium", "Phosphore"], correct: 1 },
  { question: "Le SPF signifie :", choices: ["Sun Protection Filter", "Sun Protection Factor", "Skin Protection Formula", "Solar Protection Fluid"], correct: 1 },
  { question: "Quelle vitamine est produite par la peau sous l'effet du soleil ?", choices: ["Vitamine A", "Vitamine C", "Vitamine D", "Vitamine E"], correct: 2 },
  { question: "Le microbiome cutané joue un rôle dans :", choices: ["La couleur de la peau", "La protection contre les bactéries de l'acné", "La production de sébum uniquement", "L'épaisseur de la peau"], correct: 1 },
  { question: "Quelle plante africaine est utilisée traditionnellement pour soigner les cicatrices ?", choices: ["Moringa", "Karité", "Baobab", "Centella asiatica"], correct: 1 },
  { question: "Le beurre de karité est particulièrement efficace pour :", choices: ["Exfolier la peau", "Réparer la barrière cutanée sèche", "Réduire l'acné", "Éclaircir le teint"], correct: 1 },
  { question: "Quel est le phototype majoritaire en Côte d'Ivoire ?", choices: ["Phototype I-II", "Phototype III-IV", "Phototype V-VI", "Phototype VII"], correct: 2 },
  { question: "La niacinamide et la vitamine C peuvent-elles être utilisées ensemble ?", choices: ["Non, jamais", "Oui, mais à des moments différents", "Oui, toujours ensemble", "Non, elles s'annulent totalement"], correct: 1 },
  { question: "Quel fruit ivoirien est particulièrement riche en bêta-carotène ?", choices: ["Goyave", "Ananas", "Mangue", "Citron"], correct: 2 },
  { question: "La sueur excessive en climat tropical peut aggraver l'acné si :", choices: ["On boit trop d'eau", "Le visage n'est pas nettoyé", "On utilise du SPF", "On mange des fruits"], correct: 1 },
];

const WAITING_MESSAGES = [
  "Notre IA examine chaque zone de votre visage...",
  "Analyse de la texture et du grain cutané...",
  "Détection des imperfections et taches...",
  "Évaluation de l'hydratation et de l'éclat...",
  "Identification de votre phototype exact...",
  "Calibration du score dermatologique...",
  "Analyse des pores et de la brillance...",
  "Évaluation du teint et de l'uniformité...",
];

function getDermaBotNarrative(age, genre) {
  const ageNum = parseInt(age) || 25;
  const isFemme = (genre || '').toLowerCase() === 'femme';

  const ageFacts = ageNum < 20
    ? [
        `À ${ageNum} ans, votre peau est en pleine effervescence hormonale... 🔬`,
        `Les peaux jeunes comme la vôtre produisent jusqu'à 3x plus de sébum... j'analyse ça de près.`,
        `À votre âge, l'acné post-inflammatoire est le défi n°1 des peaux africaines... je cherche des traces.`,
      ]
    : ageNum < 30
    ? [
        `À ${ageNum} ans, votre peau est à son pic d'équilibre... mais le stress laisse des marques 🔬`,
        `Votre collagène commence doucement à évoluer depuis vos 25 ans... j'évalue la fermeté.`,
        `Les UV d'Abidjan ont peut-être laissé des traces invisibles à l'œil nu... je les cherche.`,
      ]
    : ageNum < 40
    ? [
        `À ${ageNum} ans, le collagène diminue de 1% par an... je mesure l'impact sur votre teint.`,
        `Les premières dyschromies solaires apparaissent souvent à votre âge en CI... j'inspecte 🔬`,
        `Votre peau a une histoire riche à raconter... je suis en train de la lire.`,
      ]
    : ageNum < 50
    ? [
        `À ${ageNum} ans, la peau mature révèle des secrets fascinants... je les décode 🔬`,
        `Le relâchement cutané suit des patterns précis selon le phototype... j'analyse le vôtre.`,
        `Vos années sous le soleil ivoirien ont sculpté votre peau d'une façon unique... j'observe.`,
      ]
    : [
        `À ${ageNum} ans, votre peau porte la sagesse de décennies... je la lis avec respect 🔬`,
        `La xérose épidermique évolue différemment sur les phototypes IV-VI... j'évalue la vôtre.`,
        `Chaque ride raconte une histoire... je suis en train d'écouter la vôtre.`,
      ];

  const genreFacts = isFemme
    ? [
        `La peau féminine est 3x plus sujette au mélasma en Côte d'Ivoire... je cherche des signes.`,
        `Vos fluctuations hormonales dessinent des patterns cutanés uniques... je les identifie 🔬`,
        `Je regarde votre zone T... les glandes sébacées féminines ont leur propre langage.`,
        `Votre contour des yeux me révèle beaucoup sur votre hydratation... j'analyse.`,
      ]
    : [
        `La peau masculine produit 2x plus de sébum que la peau féminine... j'évalue le vôtre 🔬`,
        `Les pores masculins sont structurellement plus larges... je mesure leur état.`,
        `Je regarde votre zone T... c'est souvent là que se concentre l'activité sébacée.`,
        `Le rasage crée des micro-irritations chroniques... je cherche leurs traces.`,
      ];

  const universal = [
    `Je consulte mes 25 ans d'expérience clinique pour analyser CE visage... 🔬`,
    `Chaque pore, chaque nuance de teint me parle... j'écoute attentivement.`,
    `Votre phototype africain mérite une lecture clinique précise... c'est ce que je fais.`,
    `Le climat ivoirien laisse des empreintes spécifiques sur la peau... je les détecte.`,
    `Je scanne votre front, vos joues, votre nez, votre menton... zone par zone.`,
    `Votre peau raconte une histoire unique... je suis en train de la déchiffrer 🔬`,
  ];

  return shuffleArray([...ageFacts, ...genreFacts, ...universal]);
}

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function QuizBlock({ question }) {
  const [selected, setSelected] = useState(null);
  useEffect(() => { setSelected(null); }, [question]);
  const getStyle = (i) => {
    if (selected === null) return 'border border-foreground/30 bg-foreground/10 text-foreground';
    if (i === question.correct) return 'border-2 border-emerald-500 bg-emerald-500/25 text-emerald-700 font-semibold';
    if (i === selected) return 'border-2 border-red-500 bg-red-500/20 text-red-700';
    return 'border border-foreground/10 bg-foreground/5 text-foreground/30';
  };
  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <span className="text-primary text-xs font-bold uppercase tracking-wider">Quiz DermaCI</span>
      </div>
      <p className="text-foreground text-sm font-semibold leading-snug mb-4">{question.question}</p>
      <div className="grid grid-cols-2 gap-2">
        {question.choices.map((choice, i) => (
          <button key={i} onClick={() => { if (selected === null) setSelected(i); }} disabled={selected !== null}
            className={`text-xs px-3 py-3 rounded-xl text-left transition-all duration-300 ${getStyle(i)}`}>
            <span className="font-bold mr-1.5 opacity-60">{['A','B','C','D'][i]}.</span>{choice}
          </button>
        ))}
      </div>
      {selected !== null && (
        <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
          className={`text-xs mt-3 text-center font-semibold ${selected === question.correct ? 'text-emerald-600' : 'text-red-600'}`}>
          {selected === question.correct ? '✓ Excellent ! Bonne réponse.' : `✗ Bonne réponse : ${question.choices[question.correct]}`}
        </motion.p>
      )}
    </div>
  );
}

function LoaderScreen({ progress, currentStepText, age, genre }) {
  const circumference = 2 * Math.PI * 50;
  const [shuffledSaviez]   = useState(() => shuffleArray(SAVIEZ_VOUS));
  const [shuffledMessages] = useState(() => shuffleArray(MESSAGES_EMOTIONNELS));
  const [shuffledQuiz]     = useState(() => shuffleArray(QUIZ_QUESTIONS));
  const [contentType, setContentType] = useState(() => Math.floor(Math.random() * 4));
  const [contentTick, setContentTick] = useState(0);
  const [visible, setVisible] = useState(true);
  const [waitingTick, setWaitingTick] = useState(0);
  const [narrativeTick, setNarrativeTick] = useState(0);
  const [narrativeMessages] = useState(() => getDermaBotNarrative(age, genre));

  useEffect(() => {
    const interval = setInterval(() => {
      setWaitingTick(prev => prev + 1);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const waitingMsg = WAITING_MESSAGES[waitingTick % WAITING_MESSAGES.length];
  const showWaiting = progress >= 33 && progress < 99;

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setContentType(prev => (prev + 1) % 4);
        setNarrativeTick(prev => prev + 1);
        setContentTick(prev => prev + 1);
        setVisible(true);
      }, 400);
    }, 9000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* Contenu éducatif */}
      <div className="w-full max-w-sm mb-8" style={{ minHeight: 160 }}>
        <AnimatePresence mode="wait">
          {visible && (
            <motion.div key={`${contentType}-${contentTick}`}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.4 }} className="w-full">
              {contentType === 0 && (
                <div className="p-5 rounded-2xl bg-foreground/8 border border-foreground/15">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <p className="text-primary text-xs font-bold uppercase tracking-wider">Le saviez-vous ?</p>
                  </div>
                  <p className="text-foreground text-sm leading-relaxed font-medium">{shuffledSaviez[contentTick % shuffledSaviez.length]}</p>
                </div>
              )}
              {contentType === 1 && (
                <div className="p-5 rounded-2xl bg-foreground/8 border border-foreground/15 text-center">
                  <p className="text-foreground text-sm font-bold mb-3">Derma<span className="text-primary">CI</span></p>
                  <p className="text-foreground text-base font-semibold leading-relaxed">"{shuffledMessages[contentTick % shuffledMessages.length]}"</p>
                </div>
              )}
              {contentType === 2 && (
                <div className="p-5 rounded-2xl bg-foreground/8 border border-foreground/15">
                  <QuizBlock question={shuffledQuiz[contentTick % shuffledQuiz.length]} />
                </div>
              )}
              {contentType === 3 && (
                <div className="p-5 rounded-2xl border"
                  style={{ background: 'rgba(0,168,120,0.06)', borderColor: 'rgba(0,168,120,0.20)' }}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <p className="text-xs font-bold uppercase tracking-wider">
                      <span className="text-foreground">Derma</span>
                      <span className="text-primary">Bot</span>
                      <span className="text-foreground ml-1">analyse</span>
                    </p>
                  </div>
                  <p className="text-foreground text-sm leading-relaxed font-medium italic">
                    "{narrativeMessages[narrativeTick % narrativeMessages.length]}"
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Cercle de progression */}
      <div className="relative w-28 h-28 mb-4">
        <svg width="112" height="112" className="-rotate-90 w-full h-full">
          <circle cx="56" cy="56" r="50" fill="none" stroke="hsl(var(--border))" strokeWidth="6" />
          <motion.circle cx="56" cy="56" r="50" fill="none" stroke="hsl(var(--primary))" strokeWidth="6"
            strokeLinecap="round" strokeDasharray={circumference}
            animate={{ strokeDashoffset: circumference * (1 - progress / 100) }}
            transition={{ duration: 0.8, ease: 'easeOut' }} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}>
            <img src={LOGO_URL} alt="DermaCI" className="w-20 h-20 object-contain" style={{ mixBlendMode: 'multiply' }} loading="lazy" />
          </motion.div>
        </div>
      </div>

      {/* Pourcentage */}
      <motion.p className="font-inter text-4xl font-black text-primary mb-3"
        animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 0.3 }}>
        {Math.round(progress)}%
      </motion.p>

      {/* Étape actuelle */}
      <AnimatePresence mode="wait">
        <motion.p key={currentStepText}
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.35 }}
          className="text-sm text-foreground/70 text-center mb-4 font-medium px-4">
          {currentStepText}
        </motion.p>
      </AnimatePresence>

      {/* Barre de progression */}
      <div className="w-full max-w-xs h-2 rounded-full bg-foreground/10 overflow-hidden mb-3">
        <motion.div className="h-full rounded-full bg-primary"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ boxShadow: '0 0 8px rgba(0,168,120,0.5)' }} />
      </div>

      {showWaiting && (
        <motion.p key={waitingTick}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="text-xs text-primary/60 text-center mb-2 italic">
          {waitingMsg}
        </motion.p>
      )}

      <p className="text-xs text-foreground/60 text-center font-semibold">
        ⚠️ Ne quittez pas cette page — votre analyse nécessite jusqu'à 3 min pour être précise.
      </p>
    </div>
  );
}

function SunLineIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      className="text-primary flex-shrink-0 mt-0.5">
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2" x2="12" y2="5" /><line x1="12" y1="19" x2="12" y2="22" />
      <line x1="2" y1="12" x2="5" y2="12" /><line x1="19" y1="12" x2="22" y2="12" />
      <line x1="4.22" y1="4.22" x2="6.34" y2="6.34" /><line x1="17.66" y1="17.66" x2="19.78" y2="19.78" />
      <line x1="19.78" y1="4.22" x2="17.66" y2="6.34" /><line x1="6.34" y1="17.66" x2="4.22" y2="19.78" />
    </svg>
  );
}

function sendNotification(title, body, tag, analysisId, navigate, requireInteraction = false) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  if (document.visibilityState === 'visible') return;
  try {
    const notif = new Notification(title, { body, icon: NOTIF_ICON, badge: NOTIF_ICON, tag, requireInteraction });
    if (analysisId && navigate) {
      notif.onclick = () => { window.focus(); navigate(`/results/${analysisId}`); notif.close(); };
    }
  } catch (e) { console.warn('Notification failed:', e.message); }
}


// ── PAYWALL "limite gratuite atteinte" — version premium animee ─────────────
function PaywallLimitScreen({ onUnlock, loading }) {
  const benefits = [
    { icon: InfinityIcon, title: "Analyses illimitées", desc: "Analyse ta peau autant que tu veux" },
    { icon: Microscope,   title: "Diagnostic complet", desc: "Problèmes, causes, sévérité, zones" },
    { icon: Leaf,         title: "Routine + actifs sur-mesure", desc: "Matin et soir, adaptés à ta peau" },
    { icon: Salad,        title: "Nutrition ivoirienne", desc: "Aliments locaux pour ta peau" },
    { icon: MessageCircle,title: "DermaBot 24/7", desc: "Ton coach peau, à tout moment" },
  ];
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{ background: 'linear-gradient(160deg, #07140d 0%, #04130c 55%, #08180f 100%)' }}>
      <motion.div
        className="w-full max-w-sm rounded-3xl overflow-hidden"
        style={{ background: '#07140d', border: '1px solid rgba(0,200,150,0.18)' }}
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* Header avec logo */}
        <div className="px-6 pt-7 pb-5 text-center" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <motion.div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3"
            style={{ background: 'rgba(0,200,150,0.12)', border: '1px solid rgba(0,200,150,0.34)' }}
            animate={{ boxShadow: ['0 0 0px rgba(0,200,150,0)', '0 0 22px rgba(0,200,150,0.35)', '0 0 0px rgba(0,200,150,0)'] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <img src={LOGO_URL} alt="DermaCI" className="w-12 h-12 object-contain" loading="lazy" />
          </motion.div>
          <motion.p className="text-xs tracking-wider font-semibold mb-1.5" style={{ color: '#00C896' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            TON ANALYSE GRATUITE EST TERMINÉE
          </motion.p>
          <motion.h2 className="text-xl font-black text-white leading-snug"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}>
            Passe en illimité<br />et révèle toute ta peau
          </motion.h2>
        </div>

        {/* Benefices */}
        <div className="px-4 pt-4 pb-1">
          <p className="text-[11px] tracking-wide font-semibold mb-2.5 px-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
            CE QUI T'ATTEND, DÉBLOQUÉ À VIE
          </p>
          <div className="space-y-2">
            {benefits.map((b, i) => {
              const Icon = b.icon;
              return (
                <motion.div key={i}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.03)' }}
                  initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + i * 0.08 }}>
                  <Icon className="w-5 h-5 flex-shrink-0" style={{ color: '#00C896' }} />
                  <div>
                    <p className="text-sm text-white font-semibold leading-tight">{b.title}</p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{b.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="px-4 pt-4 pb-6">
          <motion.button
            onClick={onUnlock}
            disabled={loading}
            className="w-full rounded-2xl py-4 flex flex-col items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #00A878, #00C896)', boxShadow: '0 10px 30px rgba(0,168,120,0.4)' }}
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75 }}
            whileTap={{ scale: loading ? 1 : 0.97 }}>
            <div className="flex items-center gap-2">
              {loading ? <Loader2 className="w-5 h-5 text-white animate-spin" /> : <Lock className="w-5 h-5 text-white" />}
              <span className="text-white font-black text-base">{loading ? 'Préparation…' : 'Débloquer mon analyse'}</span>
              {!loading && <ArrowRight className="w-5 h-5 text-white" />}
            </div>
            <span className="text-white/90 text-xs font-semibold mt-1">2 000 FCFA · paiement unique · accès à vie</span>
          </motion.button>
          <motion.p className="text-center text-xs mt-3 flex items-center justify-center gap-1.5"
            style={{ color: 'rgba(255,255,255,0.45)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
            <Users className="w-3.5 h-3.5" />
            Rejoins déjà plus de 730 utilisateurs DermaCI
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}

export default function Analysis() {
  const navigate = useNavigate();

  const [step, setStep]                   = useState(1);
  const [photo, setPhoto]                 = useState(null);
  const [photoUrl, setPhotoUrl]           = useState('');
  const [isAnalyzing, setIsAnalyzing]     = useState(false);
  const [progress, setProgress]           = useState(0);
  const [currentStepText, setCurrentStepText] = useState("Initialisation...");
  const [error, setError]                 = useState(null);
  const [formData, setFormData]           = useState(null);
  const doneRef                           = useRef(false);
  const [showPaywall, setShowPaywall]     = useState(false);
  const [paywallLoading, setPaywallLoading] = useState(false);

  useEffect(() => {
    document.title = 'DermaCI — Analyse dermatologique IA';
    window.scrollTo(0, 0);
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    // Si on revient sur cette page, on repart a zero (analyse precedente abandonnee)
    localStorage.removeItem('dermaci_analysis_in_progress');
    localStorage.removeItem('dermaci_last_analysis_id');
  }, []);

  // Suit l'analyse en base : paliers 33 -> 66 -> 99 puis bascule resultats
  const resumePolling = async (analysisId) => {
    const MAX = 240000;
    const start = Date.now();

    while (Date.now() - start < MAX && !doneRef.current) {
      try {
        const res = await base44.functions.invoke('getAnalysis', { analysis_id: analysisId });
        const data = res?.data?.data || res?.data || null;
        const score = Number(data?.score || 0);
        const hasProblems = Array.isArray(data?.problems) && data.problems.length > 0;

        if (data && data.analysis_complete === true && score > 0 && hasProblems) {
          doneRef.current = true;
          localStorage.removeItem('dermaci_analysis_in_progress');
          setProgress(100);
          setCurrentStepText("Vos résultats sont prêts !");
          sendNotification('🌿 DermaCI — Vos résultats sont prêts !', 'Touchez pour découvrir votre analyse dermatologique personnalisée.', 'dermaci-ready', analysisId, navigate, true);
          await new Promise(r => setTimeout(r, 500));
          navigate(`/results/${analysisId}`);
          return;
        }
      } catch {}
      await new Promise(r => setTimeout(r, 2500));
    }

    // Timeout
    doneRef.current = true;
    localStorage.removeItem('dermaci_analysis_in_progress');
    setStep(2);
    setError("Votre analyse a pris trop de temps. Nos serveurs sont chargés, réessayez dans quelques instants 🙏");
  };

  // Paiement depuis le paywall "limite atteinte" -> GeniusPay -> payment-success -> accueil
  const handlePaywallUnlock = async () => {
    if (paywallLoading) return;
    setPaywallLoading(true);
    // Marqueur : ce paiement vient du paywall-limite -> retour ACCUEIL (pas resultats)
    try {
      localStorage.setItem('dermaci_payment_started', Date.now().toString());
      localStorage.setItem('dermaci_payment_origin', 'home');
    } catch {}

    let email = '';
    try {
      const isAuthed = await base44.auth.isAuthenticated();
      if (isAuthed) { const u = await base44.auth.me(); email = (u?.email || '').toLowerCase().trim(); }
    } catch {}
    if (!email) { try { email = (localStorage.getItem('dermaci_device_email') || '').toLowerCase().trim(); } catch {} }

    const FALLBACK = 'https://geniuspay.ci/product/dermaci-BI38zG';
    const redirect = 'https://dermaci.app/payment-success';
    try {
      if (email) {
        const res = await base44.functions.invoke('initPayment', { email, device_id: getDeviceId() });
        const data = res?.data || res || {};
        if (data?.already_premium) {
          try { localStorage.setItem('dermaci_dermabot_unlocked', '1'); } catch {}
          navigate('/?premium=1');
          return;
        }
        if (data?.payment_url) { window.location.href = data.payment_url; return; }
      }
    } catch (e) { console.warn('[paywall] initPayment indispo, lien direct:', e?.message); }

    const url = email
      ? `${FALLBACK}?email=${encodeURIComponent(email)}&redirect_url=${encodeURIComponent(redirect)}`
      : `${FALLBACK}?redirect_url=${encodeURIComponent(redirect)}`;
    window.location.href = url;
  };

  const handlePhotoChange = (file, url) => { setPhoto(file); setPhotoUrl(url); setError(null); };

  // Cet appareil a-t-il deja debloque le premium ? (flag pose apres paiement)
  const isDevicePremium = () => {
    try {
      if (localStorage.getItem('dermaci_dermabot_unlocked') === '1') return true;
      // Verifie aussi un eventuel cache premium par email
      const em = localStorage.getItem('dermaci_device_email') || '';
      if (em && localStorage.getItem('dermaci_premium_' + em.toLowerCase().trim()) === '1') return true;
    } catch {}
    return false;
  };

  // Identifiant d'appareil stable (anti-gaspillage). Reutilise celui qui existe deja.
  const getDeviceId = () => {
    try {
      let d = localStorage.getItem('dermaci_device_id');
      if (!d) {
        d = `dev_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
        localStorage.setItem('dermaci_device_id', d);
      }
      return d;
    } catch {
      return `dev_${Date.now()}`;
    }
  };

  const handleSubmit = async (formData) => {
    setFormData(formData);
    setStep(3);
    setProgress(0);
    setCurrentStepText("Initialisation de l'analyse...");
    setError(null);
    setIsAnalyzing(true);
    doneRef.current = false;

    try {
      if (!photoUrl || !formData.age || !formData.genre || !formData.temps_soins) {
        throw new Error('Données manquantes. Veuillez compléter tous les champs.');
      }

      let currentUser = null;
      try {
        const isAuthed = await base44.auth.isAuthenticated();
        if (isAuthed) currentUser = await base44.auth.me();
      } catch {}
      const userEmail = currentUser?.email || '';

      // ID généré côté client : résiste aux coupures réseau
      const analysisId = (window.crypto?.randomUUID && window.crypto.randomUUID())
        || `${Date.now()}-${Math.random().toString(36).slice(2)}`;

      try {
        const stored = JSON.parse(localStorage.getItem('dermaci_analyses') || '[]');
        if (!stored.includes(analysisId)) stored.unshift(analysisId);
        localStorage.setItem('dermaci_analyses', JSON.stringify(stored.slice(0, 50)));
        localStorage.setItem('dermaci_last_analysis_id', analysisId);
        localStorage.setItem('dermaci_analysis_in_progress', '1');
      } catch {}

      // Palier 33 %
      setProgress(33);
      setCurrentStepText("Photo reçue ✓ Analyse de votre peau...");
      sendNotification('🌿 DermaCI', 'Photo reçue ✓ Analyse de votre peau en cours...', 'dermaci-photo', null, null, false);

      // Barre continue : avance doucement de 33% vers ~95% sur ~2 min,
      // en ralentissant pres de la fin (ease-out). Saute a 100% quand Claude repond.
      const startTs = Date.now();
      const EST_MS = 120000; // duree estimee d'une analyse (~2 min)
      const STEP_TEXTS = [
        { at: 0,   text: "Photo reçue ✓ Analyse de votre peau..." },
        { at: 0.25,text: "Lecture de votre teint et de votre texture..." },
        { at: 0.45,text: "Détection des problèmes cutanés..." },
        { at: 0.65,text: "Élaboration de votre routine sur-mesure..." },
        { at: 0.82,text: "Sélection de vos actifs et nutrition ivoirienne..." },
        { at: 0.93,text: "Finalisation de votre bilan..." },
      ];
      const barTimer = setInterval(() => {
        if (doneRef.current) return;
        const elapsed = Date.now() - startTs;
        const t = Math.min(1, elapsed / EST_MS);          // 0 -> 1
        const eased = 1 - Math.pow(1 - t, 3);             // ease-out cubique
        const target = 33 + eased * 62;                   // 33% -> 95%
        setProgress((p) => (target > p ? Math.min(95, target) : p));
        let label = STEP_TEXTS[0].text;
        for (const st of STEP_TEXTS) { if (t >= st.at) label = st.text; }
        setCurrentStepText(label);
      }, 400);

      // IMPORTANT : on ATTEND la fonction (sinon Supabase coupe l'analyse en cours).
      let analyzeErr = null;
      try {
        const resp = await base44.functions.invoke('analyzeSkinnComplete', {
          analysis_id: analysisId,
          photo_url: photoUrl, age: formData.age, genre: formData.genre,
          temps_soins: formData.temps_soins, created_by: userEmail, user_email: userEmail,
          device_id: getDeviceId(), is_premium: isDevicePremium(),
        });
        const rd = resp?.data || resp || {};
        // Limite gratuite atteinte -> afficher le BEAU paywall (pas le message rouge)
        if (rd?.error === 'free_limit_reached' || rd?.error === 'rate_limited') {
          clearInterval(barTimer);
          doneRef.current = true;
          localStorage.removeItem('dermaci_analysis_in_progress');
          setIsAnalyzing(false);
          setShowPaywall(true);
          return;
        }
        if (rd?.success === false || rd?.error) analyzeErr = rd?.message || rd?.error;
      } catch (e) {
        // Coupure reseau possible : la fonction a peut-etre fini cote serveur.
        analyzeErr = e?.message || 'network';
        console.warn('[analyze] invoke error (on verifie via polling):', analyzeErr);
      }
      clearInterval(barTimer);

      // Verifier en base que tout est pret (et basculer). Resiste aux coupures.
      await resumePolling(analysisId);

    } catch (err) {
      doneRef.current = true;
      localStorage.removeItem('dermaci_analysis_in_progress');
      setStep(2);
      let errorMsg = "Une erreur est survenue. Veuillez réessayer.";
      if (err.message?.includes('limit_exceeded')) { errorMsg = err.message; }
      else if (err.message) { errorMsg = err.message; }
      setError(errorMsg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (showPaywall) return <PaywallLimitScreen onUnlock={handlePaywallUnlock} loading={paywallLoading} />;

  if (step === 3) return <LoaderScreen progress={progress} currentStepText={currentStepText} age={formData?.age} genre={formData?.genre} />;

  return (
    <div className="min-h-screen px-6 py-8">
      <div className="max-w-lg mx-auto">
        <div className="mb-8">
          <div className="mb-4"><BackButton fallback="/" /></div>
          <h1 className="text-xl font-inter font-bold">Analyse</h1>
          <p className="text-sm text-muted-foreground">Étape {step} sur 2</p>
        </div>

        <div className="w-full h-1 rounded-full bg-white/10 mb-8">
          <motion.div className="h-full rounded-full bg-primary"
            initial={{ width: '0%' }} animate={{ width: step === 1 ? '50%' : '100%' }}
            transition={{ duration: 0.4, ease: 'easeOut' }} />
        </div>

        {error && (
          <motion.div className="mb-6 p-5 rounded-2xl bg-red-50 border-2 border-red-500 flex items-start gap-3"
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-900 text-base mb-1">Attention</p>
              <p className="text-red-800 text-sm leading-relaxed">{error}</p>
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <>
            <div className="mb-5 p-4 rounded-2xl flex items-start gap-3"
              style={{ background: 'rgba(0,168,120,0.08)', border: '1px solid rgba(0,168,120,0.2)' }}>
              <SunLineIcon />
              <div>
                <p className="text-sm font-semibold text-foreground mb-1">Pour une analyse précise</p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Prenez votre photo en pleine lumière naturelle, visage dégagé et sans maquillage.
                  Une photo sombre ou floue peut fausser les résultats.
                </p>
              </div>
            </div>
            <PhotoUpload photo={photo} photoUrl={photoUrl} onPhotoChange={handlePhotoChange} onContinue={() => setStep(2)} />
          </>
        )}

        {step === 2 && (
          <UserContextForm onSubmit={handleSubmit} isLoading={isAnalyzing} />
        )}
      </div>
    </div>
  );
}
