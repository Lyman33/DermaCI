import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const LOGO_URL = "https://media.base44.com/images/public/6a0e53b978ea3d5f75666bd8/fd6f17ab5_LE_LOGO_OFFICIEL.png";

export default function AuthModal({ isOpen, onClose, onSuccess }) {
  const [mode, setMode] = useState('login');
  const [step, setStep] = useState('form'); // form | otp
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClose = () => {
    setStep('form'); setEmail(''); setPassword(''); setOtp(''); setError('');
    onClose?.();
  };

  const handleSubmit = async () => {
    if (!email || !password) { setError('Veuillez remplir tous les champs.'); return; }
    setLoading(true); setError('');
    try {
      if (mode === 'login') {
        await base44.auth.loginViaEmailPassword(email, password);
        onSuccess?.();
      } else {
        await base44.auth.register({ email, password });
        setStep('otp');
      }
    } catch (err) {
      const raw = err?.message || err?.data?.detail || err?.data?.message || '';
      if (raw.includes('verify') || raw.includes('OTP') || raw.includes('code')) {
        setStep('otp');
      } else if (raw.includes('already exists')) {
        setError('Un compte existe déjà. Connectez-vous.');
        setMode('login');
      } else if (raw.includes('Invalid email or password')) {
        setError('Email ou mot de passe incorrect.');
      } else {
        setError(raw || 'Erreur. Réessayez.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 4) { setError('Entrez le code reçu par email.'); return; }
    setLoading(true); setError('');
    try {
      await base44.auth.verifyOtp(email, otp);
      onSuccess?.();
    } catch (err) {
      const raw = err?.message || err?.data?.detail || '';
      setError(raw || 'Code incorrect. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true); setError('');
    try {
      await base44.auth.resendOtp(email);
      setError('✅ Nouveau code envoyé !');
    } catch { setError('Erreur. Réessayez.'); }
    finally { setLoading(false); }
  };

  const isSuccess = error.startsWith('✅');

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8"
          style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

          <motion.div
            className="w-full max-w-sm bg-background rounded-3xl shadow-2xl border border-border overflow-hidden relative"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92 }}>

            <button onClick={handleClose}
              className="absolute top-4 right-4 p-1.5 hover:bg-muted rounded-lg transition-colors z-10">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>

            {/* Logo */}
            <div className="flex justify-center pt-6 pb-3 px-6 border-b border-border">
              <img src={LOGO_URL} alt="DermaCI"
                style={{ width: 160, height: 'auto', objectFit: 'contain', mixBlendMode: 'multiply' }} />
            </div>

            <div className="p-6">
              {step === 'otp' ? (
                /* ── Étape OTP ── */
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="text-center mb-6">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                      style={{ background: 'rgba(0,168,120,0.10)' }}>
                      <Mail className="w-7 h-7 text-primary" />
                    </div>
                    <h2 className="font-inter font-black text-lg text-foreground mb-1">Vérifiez votre email</h2>
                    <p className="text-xs text-muted-foreground">
                      Code envoyé à <strong>{email}</strong>
                    </p>
                  </div>

                  <input
                    type="text" inputMode="numeric" placeholder="_ _ _ _ _ _"
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    onKeyDown={e => e.key === 'Enter' && handleVerifyOtp()}
                    className="w-full py-4 px-4 rounded-xl text-center text-2xl font-black outline-none bg-muted border-2 mb-4 tracking-widest"
                    style={{ borderColor: 'rgba(0,0,0,0.10)', letterSpacing: '0.3em' }}
                  />

                  {error && (
                    <motion.p
                      className="text-xs text-center mb-3 font-medium p-3 rounded-xl"
                      style={{
                        color: isSuccess ? '#00A878' : '#E74C3C',
                        background: isSuccess ? 'rgba(0,168,120,0.08)' : 'rgba(231,76,60,0.08)'
                      }}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      {error}
                    </motion.p>
                  )}

                  <motion.button onClick={handleVerifyOtp} disabled={loading}
                    className="w-full py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 mb-3"
                    style={{
                      background: 'linear-gradient(135deg, #00A878, #00C896)',
                      boxShadow: '0 8px 24px rgba(0,168,120,0.30)',
                      opacity: loading ? 0.7 : 1,
                    }}
                    whileTap={{ scale: loading ? 1 : 0.97 }}>
                    {loading
                      ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <>Valider le code <ArrowRight className="w-4 h-4" /></>}
                  </motion.button>

                  <button onClick={handleResendOtp} disabled={loading}
                    className="w-full text-center text-xs text-primary font-medium py-2 disabled:opacity-50">
                    Renvoyer le code
                  </button>
                </motion.div>
              ) : (
                /* ── Étape formulaire ── */
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <p className="text-sm text-muted-foreground mb-4 text-center">
                    {mode === 'login' ? 'Connectez-vous à votre compte' : 'Créez votre compte gratuit'}
                  </p>

                  {/* Onglets */}
                  <div className="flex gap-2 p-1 rounded-2xl mb-5" style={{ background: 'rgba(0,0,0,0.05)' }}>
                    {[{ key: 'login', label: 'Se connecter' }, { key: 'register', label: "S'inscrire" }].map(t => (
                      <button key={t.key} onClick={() => { setMode(t.key); setError(''); }}
                        className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all"
                        style={mode === t.key
                          ? { background: '#fff', color: '#00A878', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }
                          : { color: 'rgba(0,0,0,0.4)' }}>
                        {t.label}
                      </button>
                    ))}
                  </div>

                  {/* Champs */}
                  <div className="space-y-3 mb-4">
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      <input type="email" placeholder="votre@email.com" value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full py-3 pl-11 pr-4 rounded-xl text-sm outline-none bg-muted border-2 transition-all"
                        style={{ borderColor: 'rgba(0,0,0,0.10)' }}
                        onFocus={e => e.target.style.borderColor = '#00A878'}
                        onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.10)'} />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      <input type={showPassword ? 'text' : 'password'} placeholder="Mot de passe"
                        value={password} onChange={e => setPassword(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && !loading && handleSubmit()}
                        className="w-full py-3 pl-11 pr-12 rounded-xl text-sm outline-none bg-muted border-2 transition-all"
                        style={{ borderColor: 'rgba(0,0,0,0.10)' }}
                        onFocus={e => e.target.style.borderColor = '#00A878'}
                        onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.10)'} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <motion.p
                      className="text-xs text-red-600 font-medium mb-4 p-3 rounded-xl"
                      style={{ background: 'rgba(231,76,60,0.08)', border: '1px solid rgba(231,76,60,0.2)' }}
                      initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>
                      {error}
                    </motion.p>
                  )}

                  <motion.button onClick={handleSubmit} disabled={loading}
                    className="w-full py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2"
                    style={{
                      background: 'linear-gradient(135deg, #00A878, #00C896)',
                      boxShadow: '0 8px 24px rgba(0,168,120,0.30)',
                      opacity: loading ? 0.7 : 1,
                      cursor: loading ? 'not-allowed' : 'pointer',
                    }}
                    whileTap={{ scale: loading ? 1 : 0.97 }}>
                    {loading
                      ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <>{mode === 'login' ? 'Se connecter' : 'Créer mon compte'}<ArrowRight className="w-4 h-4" /></>}
                  </motion.button>

                  <p className="text-xs text-muted-foreground/50 text-center mt-4">
                    En continuant, vous acceptez nos conditions d'utilisation.
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}