import { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Camera, Image, X, ArrowRight, AlertCircle, CheckCircle, Sparkles, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TIPS = [
  '☀️ Pleine lumière naturelle',
  '🚿 Visage propre, sans maquillage',
  '📱 Photo nette, pas floue',
  '🤳 Visage de FACE (pas de profil)',
];

// ── COMPRESSION IMAGE → base64 ─────────────────────────────────────────────
async function compressToBase64(file, maxSize = 800, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Lecture fichier échouée'));
    reader.onload = (e) => {
      const img = new window.Image();
      img.onerror = () => reject(new Error('Image invalide'));
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let { width, height } = img;

          // Redimensionner si > maxSize
          if (width > maxSize || height > maxSize) {
            const ratio = Math.min(maxSize / width, maxSize / height);
            width  = Math.round(width  * ratio);
            height = Math.round(height * ratio);
          }

          canvas.width  = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          const base64 = canvas.toDataURL('image/jpeg', quality);
          resolve(base64); // data:image/jpeg;base64,...
        } catch (err) {
          reject(err);
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}


// ── ANALYSE QUALITE DE LA PHOTO (luminosite, nettete, taille) ──────────────
// Retourne { ok: true } ou { ok:false, reason:'dark'|'blurry'|'small', message }
async function checkPhotoQuality(file) {
  return new Promise((resolve) => {
    try {
      const reader = new FileReader();
      reader.onerror = () => resolve({ ok: true }); // en cas de doute, on laisse passer
      reader.onload = (e) => {
        const img = new window.Image();
        img.onerror = () => resolve({ ok: true });
        img.onload = () => {
          try {
            const W = img.width, H = img.height;
            // a) Resolution minimale
            if (W < 300 || H < 300) {
              return resolve({ ok: false, reason: 'small', message: "Photo trop petite ou de mauvaise qualité. Prends une photo plus nette et plus grande." });
            }
            // Echantillonnage sur une version reduite (rapide)
            const S = 200;
            const ratio = Math.min(S / W, S / H);
            const w = Math.max(1, Math.round(W * ratio));
            const h = Math.max(1, Math.round(H * ratio));
            const canvas = document.createElement('canvas');
            canvas.width = w; canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, w, h);
            const data = ctx.getImageData(0, 0, w, h).data;

            // Luminosite moyenne (0-255) + variance (nettete approx via Laplacien simplifie)
            let sum = 0;
            const lum = new Float32Array(w * h);
            for (let i = 0, p = 0; i < data.length; i += 4, p++) {
              const l = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
              lum[p] = l; sum += l;
            }
            const mean = sum / (w * h);

            // b) Trop sombre
            if (mean < 55) {
              return resolve({ ok: false, reason: 'dark', message: "Photo trop sombre. Reprends-la en pleine lumière naturelle (près d'une fenêtre ou dehors)." });
            }
            // c) Trop claire / surexposee (rare mais fausse l'analyse)
            if (mean > 235) {
              return resolve({ ok: false, reason: 'bright', message: "Photo surexposée (trop de lumière directe). Évite le flash et la lumière en face." });
            }

            // d) Nettete : variance du Laplacien (faible = flou)
            let lapSum = 0, lapSqSum = 0, count = 0;
            for (let y = 1; y < h - 1; y++) {
              for (let x = 1; x < w - 1; x++) {
                const idx = y * w + x;
                const lap = (4 * lum[idx]) - lum[idx - 1] - lum[idx + 1] - lum[idx - w] - lum[idx + w];
                lapSum += lap; lapSqSum += lap * lap; count++;
              }
            }
            const lapMean = lapSum / count;
            const lapVar = (lapSqSum / count) - (lapMean * lapMean);
            // Seuil prudent : en dessous = clairement flou (evite les faux positifs)
            if (lapVar < 60) {
              return resolve({ ok: false, reason: 'blurry', message: "Photo floue. Tiens le téléphone bien stable et fais la mise au point sur ton visage." });
            }

            resolve({ ok: true });
          } catch { resolve({ ok: true }); }
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    } catch { resolve({ ok: true }); }
  });
}

// ── UPLOAD VIA BASE44 UploadFile avec retry ────────────────────────────────
async function uploadWithRetry(file, maxRetries = 3) {
  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 30000); // 30s timeout

      const response = await base44.integrations.Core.UploadFile({ file });
      clearTimeout(timer);

      const url = response?.file_url || response?.url || response?.public_url;
      if (!url) throw new Error('URL manquante dans la réponse');
      return url;

    } catch (err) {
      lastError = err;
      console.error(`[PhotoUpload] Upload tentative ${attempt} échouée:`, JSON.stringify({ message: err?.message, status: err?.status, data: err?.data }));
      if (attempt < maxRetries) {
        // Attendre avant de réessayer (backoff exponentiel)
        await new Promise(r => setTimeout(r, attempt * 1000));
      }
    }
  }
  throw lastError;
}

export default function PhotoUpload({ photo, photoUrl, onPhotoChange, onContinue }) {
  const [uploading, setUploading]           = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError]                   = useState(null);
  const [localPreview, setLocalPreview]     = useState('');
  const cameraInputRef  = useRef(null);
  const galleryInputRef = useRef(null);
  const continueButtonRef = useRef(null);

  const handleFileSelect = async (file) => {
    if (!file) return;

    // Validation de base
    if (!file.type.startsWith('image/')) {
      setError('Fichier invalide. Choisissez une image.');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setError('Image trop lourde (max 15 Mo). Choisissez une photo plus légère.');
      return;
    }

    setError(null);
    setUploadProgress(0);

    // ── CONTROLE QUALITE avant tout (sombre / floue / trop petite) ──────────
    const quality = await checkPhotoQuality(file);
    if (!quality.ok) {
      setError(quality.message);
      onPhotoChange(null, '');
      return;
    }

    setUploading(true);

    // Aperçu immédiat local — pas d'attente
    const preview = URL.createObjectURL(file);
    setLocalPreview(preview);
    onPhotoChange(file, ''); // photo locale, url vide pour l'instant

    let progressTimer = null;

    try {
      // ── ÉTAPE 1 : Compression (0 → 30%) ────────────────────────────────
      setUploadProgress(5);
      const base64 = await compressToBase64(file, 900, 0.82);
      setUploadProgress(30);

      // Convertir base64 → Blob → File pour l'upload
      const base64Data = base64.split(',')[1];
      const byteChars  = atob(base64Data);
      const byteArr    = new Uint8Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++) {
        byteArr[i] = byteChars.charCodeAt(i);
      }
      const compressedBlob = new Blob([byteArr], { type: 'image/jpeg' });
      const compressedFile = new File([compressedBlob], 'photo.jpg', { type: 'image/jpeg' });

      console.log(`[PhotoUpload] Taille originale: ${(file.size / 1024).toFixed(0)}KB → compressée: ${(compressedFile.size / 1024).toFixed(0)}KB`);

      // ── ÉTAPE 2 : Upload avec progression simulée (30 → 90%) ───────────
      progressTimer = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 88) return prev;
          return prev + (88 - prev) * 0.08;
        });
      }, 200);

      const fileUrl = await uploadWithRetry(compressedFile, 3);

      // ── ÉTAPE 3 : Succès (90 → 100%) ───────────────────────────────────
      clearInterval(progressTimer);
      setUploadProgress(100);

      // Nettoyer l'URL locale
      URL.revokeObjectURL(preview);
      setLocalPreview('');

      // Notifier le parent avec l'URL CDN
      onPhotoChange(file, fileUrl);
      console.log('[PhotoUpload] ✅ Upload réussi:', fileUrl);

    } catch (err) {
      if (progressTimer) clearInterval(progressTimer);
      console.warn('[PhotoUpload] Upload CDN échoué, fallback base64:', err.message);

      // Fallback base64 — le backend se chargera de l'uploader
      try {
        const base64Fallback = await compressToBase64(file, 700, 0.75);
        URL.revokeObjectURL(preview);
        setLocalPreview('');
        setUploadProgress(100);
        onPhotoChange(file, base64Fallback);
      } catch (fallbackErr) {
        URL.revokeObjectURL(preview);
        setLocalPreview('');
        setUploadProgress(0);
        onPhotoChange(null, '');
        setError('Chargement échoué. Réessayez ou choisissez une autre photo.');
      }

    } finally {
      if (progressTimer) clearInterval(progressTimer);
      setUploading(false);
    }
  };

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
    e.target.value = ''; // reset pour permettre re-sélection même fichier
  };

  const handleRemovePhoto = () => {
    if (localPreview) URL.revokeObjectURL(localPreview);
    setLocalPreview('');
    setUploadProgress(0);
    setError(null);
    onPhotoChange(null, '');
  };

  const displayUrl = localPreview || photoUrl;
  const hasPhoto   = !!displayUrl;

  return (
    <div className="space-y-4 mb-6">

      {/* ── ERREUR ── */}
      <AnimatePresence>
        {error && (
          <motion.div
            className="p-3 rounded-2xl flex items-start gap-2"
            style={{ background: 'rgba(231,76,60,0.08)', border: '1px solid rgba(231,76,60,0.2)' }}
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-500 text-sm">{error}</p>
              <button
                onClick={() => { setError(null); galleryInputRef.current?.click(); }}
                className="text-xs text-red-400 underline mt-1">
                Réessayer avec une autre photo
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── ZONE PHOTO ── */}
      <AnimatePresence mode="wait">
        {!hasPhoto ? (

          /* Zone vide */
          <motion.div key="empty"
            className="w-full rounded-3xl overflow-hidden relative"
            style={{
              border: '2px dashed rgba(0,168,120,0.25)',
              background: 'linear-gradient(135deg, rgba(0,168,120,0.04), rgba(0,200,150,0.08))'
            }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}>

            {window.innerWidth > 640 && (
              <motion.div className="absolute top-4 right-4 w-16 h-16 rounded-full pointer-events-none"
                style={{ background: 'rgba(0,168,120,0.06)' }}
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 4, repeat: Infinity }} />
            )}

            <div className="relative z-10 flex flex-col items-center justify-center py-10 px-6">
              <h3 className="font-inter font-black text-lg text-foreground mb-1">Prenez votre photo</h3>
              <p className="text-xs text-muted-foreground text-center mb-5">
                Pour une analyse dermatologique précise
              </p>

              <div className="grid grid-cols-2 gap-2 w-full max-w-xs">
                {TIPS.map((tip, i) => (
                  <motion.div key={i}
                    className="px-3 py-2 rounded-xl text-center"
                    style={{ background: 'rgba(255,255,255,0.60)', border: '1px solid rgba(0,168,120,0.12)' }}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.08 }}>
                    <span className="text-xs text-foreground/75 font-medium">{tip}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

        ) : (

          /* Aperçu photo */
          <motion.div key="preview" className="relative"
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, type: 'spring', stiffness: 200 }}>

            <div className="relative rounded-3xl overflow-hidden shadow-xl"
              style={{ height: 280, border: '3px solid rgba(0,168,120,0.25)' }}>
              <img src={displayUrl} alt="Aperçu" className="w-full h-full object-cover" />

              <div className="absolute bottom-0 left-0 right-0 h-20"
                style={{ background: 'linear-gradient(0deg, rgba(0,0,0,0.4), transparent)' }} />

              {/* Overlay upload */}
              {uploading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4"
                  style={{ background: 'rgba(0,0,0,0.50)', backdropFilter: 'blur(6px)' }}>

                  {/* Cercle de progression */}
                  <div className="relative w-16 h-16">
                    <svg width="64" height="64" className="-rotate-90 absolute inset-0">
                      <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="4" />
                      <motion.circle cx="32" cy="32" r="28" fill="none"
                        stroke="white" strokeWidth="4" strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 28}
                        strokeDashoffset={2 * Math.PI * 28 * (1 - uploadProgress / 100)}
                        style={{ transition: 'stroke-dashoffset 0.3s ease' }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{Math.round(uploadProgress)}%</span>
                    </div>
                  </div>

                  <p className="text-white text-sm font-semibold">
                    {uploadProgress < 30 ? 'Compression…' :
                     uploadProgress < 90 ? 'Envoi en cours…' :
                     'Finalisation…'}
                  </p>
                </div>
              )}

              {/* Bouton supprimer */}
              {!uploading && (
                <button onClick={handleRemovePhoto}
                  className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center shadow-lg"
                  style={{ background: 'rgba(231,76,60,0.90)', backdropFilter: 'blur(8px)' }}>
                  <X className="w-4 h-4 text-white" />
                </button>
              )}

              {/* Statut prête */}
              {!uploading && photoUrl && (
                <motion.div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                  style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <CheckCircle className="w-3.5 h-3.5 text-primary" />
                  <p className="text-xs text-white font-semibold">Photo prête</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── BOUTONS CAMÉRA / GALERIE ── */}
      <div className="flex justify-center gap-20 py-4">
        <motion.button
          onClick={() => cameraInputRef.current?.click()}
          disabled={uploading}
          className="flex flex-col items-center gap-3"
          style={{ opacity: uploading ? 0.4 : 1 }}
          whileTap={{ scale: 0.90 }}>
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(0,168,120,0.08)', border: '1.5px solid rgba(0,168,120,0.15)' }}>
              <Camera className="w-12 h-12" style={{ color: '#00A878' }} strokeWidth={1.5} />
            </div>
            <motion.div className="absolute -top-1 -right-1 px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1"
              style={{ background: '#00A878', color: 'white' }}
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity }}>
              <span>●</span> LIVE
            </motion.div>
          </div>
          <span className="text-xs font-bold" style={{ color: '#00A878' }}>Caméra</span>
        </motion.button>

        <motion.button
          onClick={() => galleryInputRef.current?.click()}
          disabled={uploading}
          className="flex flex-col items-center gap-3"
          style={{ opacity: uploading ? 0.4 : 1 }}
          whileTap={{ scale: 0.90 }}>
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(45,122,79,0.08)', border: '1.5px solid rgba(45,122,79,0.15)' }}>
            <Image className="w-12 h-12" style={{ color: '#2d7a4f' }} strokeWidth={1.5} />
          </div>
          <span className="text-xs font-bold" style={{ color: '#2d7a4f' }}>Galerie</span>
        </motion.button>
      </div>

      {/* Inputs cachés */}
      <input ref={cameraInputRef}  type="file" accept="image/*" capture="user" className="hidden" onChange={handleInputChange} />
      <input ref={galleryInputRef} type="file" accept="image/*"               className="hidden" onChange={handleInputChange} />

      {/* ── BOUTON CONTINUER ── */}
      <AnimatePresence>
        {photoUrl && !uploading && (
          <motion.button ref={continueButtonRef} onClick={onContinue}
            className="w-full py-4 rounded-2xl font-bold text-white text-base flex items-center justify-center gap-2"
            style={{
              background: 'linear-gradient(135deg, #00A878, #00C896)',
              boxShadow: '0 8px 24px rgba(0,168,120,0.35)'
            }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.35 }}
            whileTap={{ scale: 0.97 }}>
            <Zap className="w-5 h-5" />
            Continuer l'analyse
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
