import React, { useState, useEffect, useRef } from 'react';
import DermaLogo from '@/components/DermaLogo';
import { facts, citations, quizQuestions, progressMessages } from './loaderData';

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function FactCard({ text }) {
  return (
    <div className="rounded-2xl p-5 border text-center"
      style={{ background: 'rgba(0,168,120,0.06)', border: '1px solid rgba(0,168,120,0.20)' }}>
      <div className="flex items-center justify-center gap-2 mb-3">
        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <span className="text-xs font-bold text-primary tracking-wider uppercase">Le saviez-vous ?</span>
      </div>
      <p className="text-sm text-foreground/80 leading-relaxed font-medium">{text}</p>
    </div>
  );
}

function CitationCard({ text }) {
  return (
    <div className="rounded-2xl p-5 border text-center"
      style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.08)' }}>
      <p className="font-inter font-bold text-primary text-sm mb-3">
        Derma<span style={{ color: '#2d7a4f' }}>CI</span>
      </p>
      <p className="text-sm text-foreground/80 leading-relaxed font-semibold">« {text} »</p>
      <div className="flex justify-center gap-1.5 mt-4">
        <span className="w-1.5 h-1.5 rounded-full bg-primary/30" />
        <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
        <span className="w-1.5 h-1.5 rounded-full bg-primary/30" />
      </div>
    </div>
  );
}

function QuizCard({ question }) {
  const [selected, setSelected] = useState(null);
  const labels = ['A', 'B', 'C', 'D'];

  const handleSelect = (idx) => {
    if (selected !== null) return;
    setSelected(idx);
  };

  return (
    <div className="rounded-2xl p-5 border"
      style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.08)' }}>
      <div className="flex items-center gap-2 mb-3">
        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <span className="text-xs font-bold text-primary tracking-wider uppercase">Quiz DermaCI</span>
      </div>
      <p className="text-sm font-semibold text-foreground leading-snug mb-4">{question.q}</p>
      <div className="grid grid-cols-2 gap-2">
        {question.o.map((opt, idx) => {
          let style = {};
          let cls = 'text-xs font-medium p-3 rounded-xl border-2 text-left transition-all duration-200';
          if (selected === null) {
            style = { borderColor: 'rgba(0,0,0,0.12)', background: 'rgba(255,255,255,0.6)', color: 'hsl(var(--foreground))' };
          } else if (idx === question.a) {
            style = { borderColor: '#00C896', background: 'rgba(0,200,150,0.12)', color: '#00A878' };
          } else if (idx === selected) {
            style = { borderColor: '#E74C3C', background: 'rgba(231,76,60,0.08)', color: '#E74C3C' };
          } else {
            style = { borderColor: 'rgba(0,0,0,0.06)', background: 'transparent', color: 'rgba(0,0,0,0.30)' };
          }
          return (
            <button key={idx} onClick={() => handleSelect(idx)} disabled={selected !== null}
              className={cls} style={style}>
              <span className="font-bold mr-1.5 opacity-60">{labels[idx]}.</span>{opt}
            </button>
          );
        })}
      </div>
      {selected !== null && (
        <p className={`text-xs mt-3 font-semibold text-center ${selected === question.a ? 'text-emerald-600' : 'text-red-500'}`}>
          {selected === question.a ? '✓ Excellent ! Bonne réponse.' : `✗ Bonne réponse : ${question.o[question.a]}`}
        </p>
      )}
    </div>
  );
}

export default function LoaderScreen() {
  const [progress, setProgress]       = useState(0);
  const [contentIndex, setContentIndex] = useState(0);
  const [msgIndex, setMsgIndex]       = useState(0);
  const [fade, setFade]               = useState(true);
  const progressRef = useRef(0);

  const shuffledFacts     = useRef(shuffleArray(facts));
  const shuffledCitations = useRef(shuffleArray(citations));
  const shuffledQuiz      = useRef(shuffleArray(quizQuestions));
  const contentPool       = useRef([]);

  useEffect(() => {
    const pool = [];
    const f = shuffledFacts.current;
    const c = shuffledCitations.current;
    const q = shuffledQuiz.current;
    let fi = 0, ci = 0, qi = 0;
    for (let i = 0; i < 30; i++) {
      const type = i % 3;
      if (type === 0 && fi < f.length) pool.push({ type: 'fact', data: f[fi++] });
      else if (type === 1 && ci < c.length) pool.push({ type: 'citation', data: c[ci++] });
      else if (type === 2 && qi < q.length) pool.push({ type: 'quiz', data: q[qi++] });
      else pool.push({ type: 'fact', data: f[fi % f.length] });
    }
    contentPool.current = pool;
  }, []);

  // Progression continue
  useEffect(() => {
    const interval = setInterval(() => {
      const p = progressRef.current;
      let increment;
      if (p < 40) increment = 0.8;
      else if (p < 70) increment = 0.5;
      else if (p < 90) increment = 0.2;
      else increment = 0.05;
      const next = Math.min(p + increment, 99);
      progressRef.current = next;
      setProgress(next);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Rotation contenu toutes les 7s
  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => { setContentIndex(prev => prev + 1); setFade(true); }, 350);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  // Rotation messages
  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex(prev => (prev + 1) % progressMessages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const currentContent = contentPool.current[contentIndex % (contentPool.current.length || 1)];
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center px-5"
      style={{ background: 'hsl(150, 30%, 97%)' }}>

      {/* Contenu rotatif */}
      <div className="w-full max-w-sm mb-8"
        style={{ minHeight: 160, opacity: fade ? 1 : 0, transition: 'opacity 0.35s ease' }}>
        {currentContent?.type === 'fact'     && <FactCard text={currentContent.data} />}
        {currentContent?.type === 'citation' && <CitationCard text={currentContent.data} />}
        {currentContent?.type === 'quiz'     && <QuizCard question={currentContent.data} />}
      </div>

      {/* Cercle SVG + Logo */}
      <div className="relative mb-5" style={{ width: 136, height: 136 }}>
        {/* Halo externe pulsant */}
        <div className="absolute rounded-full animate-pulse"
          style={{
            inset: -8,
            background: 'rgba(0,168,120,0.06)',
            borderRadius: '50%',
            animation: 'pulse 3s ease-in-out infinite',
          }} />
        <svg width="136" height="136" viewBox="0 0 136 136"
          style={{ transform: 'rotate(-90deg)', position: 'absolute', inset: 0 }}>
          {/* Piste fond */}
          <circle cx="68" cy="68" r="54" fill="none"
            stroke="rgba(0,168,120,0.12)" strokeWidth="6" />
          {/* Arc progression */}
          <circle cx="68" cy="68" r="54" fill="none"
            stroke="#00A878" strokeWidth="6" strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 0.1s linear', filter: 'drop-shadow(0 0 4px rgba(0,168,120,0.4))' }}
          />
          {/* Cercle intérieur décoratif */}
          <circle cx="68" cy="68" r="44" fill="none"
            stroke="rgba(0,168,120,0.08)" strokeWidth="1" />
        </svg>
        {/* Logo centré — 2.5x plus grand (36 → 90) */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div style={{ animation: 'spin 2s linear infinite' }}>
            <DermaLogo size={90} />
          </div>
        </div>
      </div>

      {/* Pourcentage */}
      <p className="font-inter font-black text-4xl text-primary mb-1">
        {Math.round(progress)}%
      </p>

      {/* Message */}
      <p className="text-sm text-muted-foreground text-center mb-6"
        style={{ transition: 'opacity 0.3s' }}>
        {progressMessages[msgIndex]}
      </p>

      {/* Barre linéaire */}
      <div className="w-full max-w-xs h-1.5 rounded-full overflow-hidden"
        style={{ background: 'rgba(0,168,120,0.10)' }}>
        <div className="h-full rounded-full bg-primary"
          style={{ width: `${progress}%`, transition: 'width 0.1s linear' }} />
      </div>

      <p className="text-xs text-muted-foreground/50 mt-4 text-center max-w-xs leading-relaxed">
        L'analyse IA prend 1 à 2 minutes — c'est normal et gage de précision ✨
      </p>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}