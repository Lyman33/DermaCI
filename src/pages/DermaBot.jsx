import { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Send, Globe, ChevronDown, Copy, Check, RotateCcw } from 'lucide-react';
import DermaBotName from '@/components/dermabot/DermaBotName';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

const LOGO_URL = "https://media.base44.com/images/public/6a0e53b978ea3d5f75666bd8/fd6f17ab5_LE_LOGO_OFFICIEL.png";

const SUGGESTIONS = [
  { icon: "🔍", text: "Comment réduire mes taches noires post-acné ?" },
  { icon: "🌿", text: "Quelle routine pour peau grasse en climat tropical ?" },
  { icon: "🥭", text: "Quels aliments ivoiriens améliorent vraiment la peau ?" },
  { icon: "☀️", text: "Quel SPF choisir pour une peau noire à Abidjan ?" },
  { icon: "💊", text: "Niacinamide vs vitamine C : lequel choisir ?" },
  { icon: "🧴", text: "Comment utiliser le karité correctement ?" },
];

const WELCOME = {
  role: 'assistant',
  content: "Je suis **DermaBot** — coach dermatologique IA, spécialisé en peaux africaines et contexte ivoirien.\n\nRéponses précises, prouvées, actionnables. Quelle est votre préoccupation cutanée du moment ?",
  id: 'welcome',
};

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2.5">
      <div className="w-8 h-8 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center"
        style={{ background: 'rgba(0,168,120,0.08)' }}>
        <img src={LOGO_URL} alt="" className="w-7 h-7 object-contain" style={{ mixBlendMode: 'multiply' }} />
      </div>
      <div className="flex items-center gap-1.5 px-4 py-3 rounded-2xl rounded-bl-sm"
        style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(0,168,120,0.15)', backdropFilter: 'blur(12px)' }}>
        {[0, 1, 2].map(i => (
          <motion.div key={i}
            className="w-2 h-2 rounded-full"
            style={{ background: '#00A878' }}
            animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.18 }} />
        ))}
      </div>
    </div>
  );
}

function SourcesBlock({ sources }) {
  const [open, setOpen] = useState(false);
  if (!sources || sources.length === 0) return null;
  return (
    <motion.div className="mt-2" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
      <button onClick={() => setOpen(p => !p)}
        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all"
        style={{ background: open ? 'rgba(0,168,120,0.12)' : 'rgba(0,168,120,0.06)', color: '#00A878', border: '1px solid rgba(0,168,120,0.2)' }}>
        <Globe className="w-3 h-3" />
        {sources.length} source{sources.length > 1 ? 's' : ''} web
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-3 h-3" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div className="mt-2 space-y-1.5"
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            {sources.map((s, i) => (
              <div key={i} className="flex items-start gap-2 px-3 py-2 rounded-xl"
                style={{ background: 'rgba(0,168,120,0.04)', border: '1px solid rgba(0,168,120,0.1)' }}>
                <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: 'rgba(0,168,120,0.12)' }}>
                  <span className="text-xs font-bold" style={{ color: '#00A878' }}>{i + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  {s.url ? (
                    <a href={s.url} target="_blank" rel="noopener noreferrer"
                      className="text-xs font-semibold truncate block hover:underline"
                      style={{ color: '#00A878' }}>
                      {s.title || s.url}
                    </a>
                  ) : (
                    <p className="text-xs font-semibold" style={{ color: '#00A878' }}>{s.title}</p>
                  )}
                  {s.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{s.description}</p>
                  )}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy}
      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg"
      style={{ color: copied ? '#00A878' : '#94a3b8' }}>
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

const MD_COMPONENTS = {
  strong: ({ children }) => <strong className="font-bold" style={{ color: '#0d2818' }}>{children}</strong>,
  p: ({ children }) => <p className="my-1.5 text-slate-700 leading-relaxed">{children}</p>,
  ul: ({ children }) => <ul className="my-2 space-y-1 list-none">{children}</ul>,
  li: ({ children }) => (
    <li className="flex items-start gap-2 text-slate-600">
      <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#00A878' }} />
      <span>{children}</span>
    </li>
  ),
  ol: ({ children }) => <ol className="my-2 space-y-1 list-decimal list-inside">{children}</ol>,
  h1: ({ children }) => <h1 className="text-base font-black mt-3 mb-1.5" style={{ color: '#0d2818' }}>{children}</h1>,
  h2: ({ children }) => <h2 className="text-sm font-bold mt-2.5 mb-1" style={{ color: '#00A878' }}>{children}</h2>,
  h3: ({ children }) => <h3 className="text-sm font-semibold mt-2 mb-1 text-slate-700">{children}</h3>,
  code: ({ inline, children }) => inline
    ? <code className="px-1.5 py-0.5 rounded text-xs font-mono" style={{ background: 'rgba(0,168,120,0.08)', color: '#00A878' }}>{children}</code>
    : <pre className="p-3 rounded-xl text-xs overflow-x-auto my-2" style={{ background: '#0d2818', color: '#a3f0d0' }}><code>{children}</code></pre>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 pl-3 my-2 italic text-slate-500" style={{ borderColor: '#00A878' }}>{children}</blockquote>
  ),
  hr: () => <hr className="my-3 border-none h-px" style={{ background: 'rgba(0,168,120,0.15)' }} />,
};

function TypewriterContent({ content }) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const rafRef = useRef(null);

  useEffect(() => {
    setDisplayed('');
    setDone(false);
    const chars = content.split('');
    let i = 0;
    const SPEED = 2; // ms par frame

    const tick = () => {
      if (i >= chars.length) { setDone(true); return; }
      const batch = Math.min(16, chars.length - i); // 16 chars par frame
      i += batch;
      setDisplayed(chars.slice(0, i).join(''));
      rafRef.current = setTimeout(tick, SPEED);
    };
    rafRef.current = setTimeout(tick, 10);
    return () => clearTimeout(rafRef.current);
  }, [content]);

  return (
    <>
      <ReactMarkdown className="text-sm leading-relaxed prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0" components={MD_COMPONENTS}>
        {displayed}
      </ReactMarkdown>
      {!done && (
        <motion.span className="inline-block w-0.5 h-4 rounded-full ml-0.5 align-middle"
          style={{ background: '#00A878' }}
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.6, repeat: Infinity }} />
      )}
    </>
  );
}

function AssistantBubble({ msg }) {
  return (
    <div className="flex items-end gap-2.5 group">
      <motion.div
        className="w-8 h-8 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center"
        style={{ background: 'rgba(0,168,120,0.08)' }}
        animate={msg.thinking ? { scale: [1, 1.1, 1], y: [0, -3, 0] } : { scale: 1, y: 0 }}
        transition={{ duration: msg.thinking ? 1.2 : 0.3, repeat: msg.thinking ? Infinity : 0 }}>
        <img src={LOGO_URL} alt="" className="w-7 h-7 object-contain" style={{ mixBlendMode: 'multiply' }} />
      </motion.div>
      <div className="flex-1 max-w-[85%]">
        <div className="relative rounded-2xl rounded-bl-sm px-4 py-3"
          style={{ background: 'rgba(255,255,255,0.95)', border: '1px solid rgba(0,168,120,0.12)', backdropFilter: 'blur(16px)', boxShadow: '0 2px 16px rgba(0,168,120,0.06)', display: 'inline-block', minWidth: msg.thinking ? 'auto' : undefined, width: msg.thinking ? 'fit-content' : undefined }}>
          {!msg.thinking && <div className="absolute top-2 right-2">
            <CopyButton text={msg.content} />
          </div>}
          {msg.thinking ? (
            <div className="flex items-center gap-2 py-0.5 px-1">
              {[0, 1, 2].map(i => (
                <motion.div key={i} className="w-2 h-2 rounded-full" style={{ background: '#00A878' }}
                  animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.18 }} />
              ))}
            </div>
          ) : (
            <TypewriterContent content={msg.content} />
          )}
        </div>
        {msg.usedWebSearch && !msg.thinking && (
          <div className="mt-1 ml-1 flex items-center gap-1.5">
            <Globe className="w-3 h-3" style={{ color: '#00A878' }} />
            <span className="text-xs" style={{ color: '#00A878' }}>Enrichi par recherche web</span>
          </div>
        )}
        {msg.sources && msg.sources.length > 0 && <SourcesBlock sources={msg.sources} />}
      </div>
    </div>
  );
}

function UserBubble({ msg }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[78%] px-4 py-3 rounded-2xl rounded-br-sm text-sm text-white leading-relaxed"
        style={{ background: 'linear-gradient(135deg, #00A878, #00C896)', boxShadow: '0 4px 16px rgba(0,168,120,0.3)' }}>
        {msg.content}
      </div>
    </div>
  );
}

export default function DermaBot() {
  const [messages, setMessages] = useState([WELCOME]);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [userHasWritten, setUserHasWritten] = useState(false);
  const [rows, setRows] = useState(1);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => { document.title = 'DermaCI — DermaBot'; }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const adjustRows = (val) => {
    const lines = val.split('\n').length;
    setRows(Math.min(Math.max(lines, 1), 5));
  };

  const sendMessage = useCallback(async (text) => {
    const content = (text || input).trim();
    if (!content || sending) return;

    setInput('');
    setRows(1);
    setSending(true);
    setUserHasWritten(true);

    const newHistory = [...conversationHistory, { role: 'user', content }];
    const thinkingId = Date.now();

    setMessages(prev => [
      ...prev,
      { role: 'user', content, id: thinkingId - 1 },
      { role: 'assistant', thinking: true, content: '', id: thinkingId },
    ]);

    try {
      const res = await base44.functions.invoke('dermaBotChat', {
        message: content,
        history: newHistory.slice(-8),
      });
      const { response, sources, usedWebSearch } = res?.data || {};
      const botMsg = { role: 'assistant', content: response || "Pouvez-vous reformuler ? 🌿", sources: sources || [], usedWebSearch: !!usedWebSearch, id: thinkingId + 1 };
      setMessages(prev => [...prev.filter(m => m.id !== thinkingId), botMsg]);
      setConversationHistory([...newHistory, { role: 'assistant', content: botMsg.content }]);
    } catch {
      setMessages(prev => prev.filter(m => m.id !== thinkingId));
    } finally {
      setSending(false);
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [input, sending, conversationHistory]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleReset = () => {
    setMessages([WELCOME]);
    setConversationHistory([]);
    setUserHasWritten(false);
    setInput('');
    setRows(1);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #f0faf6 0%, #f8fffe 40%, #f0f7ff 100%)' }}>

      {/* ── HEADER ── */}
      <div className="flex-shrink-0 flex items-center gap-3 px-4 py-3 relative z-10"
        style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(0,168,120,0.1)', boxShadow: '0 1px 20px rgba(0,168,120,0.06)' }}>
        <Link to="/analyses"
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
          style={{ background: 'rgba(0,168,120,0.06)', border: '1px solid rgba(0,168,120,0.12)' }}>
          <ArrowLeft className="w-4 h-4" style={{ color: '#00A878' }} />
        </Link>

        <div className="flex items-center gap-3 flex-1">
          <motion.div
            className="relative"
            animate={sending ? { scale: [1, 1.1, 1], y: [0, -3, 0] } : { scale: 1, y: 0 }}
            transition={{ duration: sending ? 1.2 : 0.3, repeat: sending ? Infinity : 0, ease: 'easeInOut' }}>
            <img src={LOGO_URL} alt="DermaBot" className="w-11 h-11 object-contain" style={{ mixBlendMode: 'multiply' }} />
            <motion.div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white"
              style={{ background: '#00C896' }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }} />
          </motion.div>
          <div>
            <p className="font-inter font-black text-sm leading-tight"><DermaBotName /></p>
            <p className="text-xs font-medium" style={{ color: '#00A878' }}>
              {sending ? 'En train de réfléchir…' : 'Coach IA · Peau africaine'}
            </p>
          </div>
        </div>

        <button onClick={handleReset}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
          style={{ background: 'rgba(0,168,120,0.06)', border: '1px solid rgba(0,168,120,0.12)' }}
          title="Nouvelle conversation">
          <RotateCcw className="w-4 h-4" style={{ color: '#00A878' }} />
        </button>
      </div>

      {/* ── MESSAGES ── */}
      <div className="flex-1 overflow-y-auto px-4 py-5"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(0,168,120,0.2) transparent' }}>
        <div className="max-w-2xl mx-auto w-full space-y-5">

          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div key={msg.id || Math.random()}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}>
                {msg.role === 'assistant'
                  ? <AssistantBubble msg={msg} />
                  : <UserBubble msg={msg} />}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Suggestions */}
          <AnimatePresence>
            {!userHasWritten && (
              <motion.div
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={{ delay: 0.4 }}>
                <p className="text-xs font-semibold text-slate-400 text-center mb-4 uppercase tracking-wider">
                  Questions populaires
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {SUGGESTIONS.map((s, i) => (
                    <motion.button key={i}
                      onClick={() => sendMessage(s.text)}
                      disabled={sending}
                      className="text-left px-3 py-3 rounded-2xl text-xs text-slate-600 leading-relaxed transition-all disabled:opacity-50"
                      style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(0,168,120,0.1)', backdropFilter: 'blur(8px)', boxShadow: '0 2px 8px rgba(0,168,120,0.04)' }}
                      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.45 + i * 0.06 }}
                      whileHover={{ scale: 1.02, borderColor: 'rgba(0,168,120,0.3)' }}
                      whileTap={{ scale: 0.98 }}>
                      <span className="text-base mr-1.5">{s.icon}</span>
                      {s.text}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} className="h-2" />
        </div>
      </div>

      {/* ── INPUT ── */}
      <div className="flex-shrink-0 px-4 py-3"
        style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(0,168,120,0.08)' }}>
        <div className="max-w-2xl mx-auto">
          <div className="flex items-end gap-2.5 px-4 py-2.5 rounded-2xl transition-all"
            style={{ background: 'rgba(255,255,255,0.95)', border: '1.5px solid rgba(0,168,120,0.2)', boxShadow: '0 4px 20px rgba(0,168,120,0.08)' }}>
            <textarea
              ref={textareaRef}
              value={input}
              rows={rows}
              onChange={e => { setInput(e.target.value); adjustRows(e.target.value); }}
              onKeyDown={handleKeyDown}
              placeholder="Posez votre question dermatologique…"
              className="flex-1 bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-300 resize-none leading-relaxed"
              style={{ maxHeight: '120px', minHeight: '24px' }}
              disabled={sending}
            />
            <motion.button
              onClick={() => sendMessage()}
              disabled={!input.trim() || sending}
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-30 transition-all"
              style={{ background: input.trim() && !sending ? 'linear-gradient(135deg,#00A878,#00C896)' : 'rgba(0,168,120,0.2)', boxShadow: input.trim() && !sending ? '0 4px 12px rgba(0,168,120,0.4)' : 'none' }}
              whileTap={{ scale: 0.9 }}>
              {sending
                ? <motion.div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full"
                    animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
                : <Send className="w-4 h-4 text-white" />}
            </motion.button>
          </div>
          <p className="text-center text-xs text-slate-300 mt-2">
            Ne remplace pas un dermatologue
          </p>
        </div>
      </div>
    </div>
  );
}