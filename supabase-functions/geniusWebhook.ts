// ═══════════════════════════════════════════════════════════════════════════
//  DermaCI — geniusWebhook  (Phase C : activation garantie, même si le client
//  ne revient jamais sur le site après avoir payé)
//
//  ⚠️ CONTRAIREMENT à l'ancien publicGeniusWebhook (supprimé), celui-ci est
//  BLINDÉ : AUCUN traitement sans signature HMAC-SHA256 valide de GeniusPay.
//  Format officiel : signature = HMAC-SHA256(timestamp + "." + json_payload, secret)
//  En-têtes : X-Webhook-Signature, X-Webhook-Timestamp, X-Webhook-Event
//
//  Secret requis dans Supabase : GENIUSPAY_WEBHOOK_SECRET (fourni par GeniusPay
//  à la création du webhook — voir setupGeniusWebhook).
//  Sans ce secret : le webhook ne fait RIEN (fail-safe, jamais d'activation aveugle).
//
//  Ce qu'il fait sur un paiement confirmé :
//   1. Vérifie la signature + fraîcheur du timestamp (anti-rejeu ±5 min)
//   2. Retrouve le Payment créé par initPayment (via metadata.internal_ref ou MTX)
//   3. Le passe en 'confirmed' (idempotent : déjà confirmé -> on ne refait rien)
//   4. Active : pass (essentiel/pro/premium) ou découverte, par email ET device
//   5. Débloque l'analyse (payment_pending=false), y compris pour les ANONYMES
//      grâce à metadata.analysis_id
// ═══════════════════════════════════════════════════════════════════════════
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-signature, x-webhook-timestamp, x-webhook-event',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const VALID_PASSES = ['essentiel', 'pro', 'premium'];
const PASS_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;
const TIMESTAMP_TOLERANCE_MS = 5 * 60 * 1000; // ±5 min anti-rejeu

// ── HMAC-SHA256 hex (Web Crypto, natif Deno) ────────────────────────────────
async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ── Comparaison en temps constant (anti timing-attack) ──────────────────────
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// ── Fraîcheur du timestamp (accepte unix secondes, millisecondes, ou ISO) ────
function timestampIsFresh(ts: string): boolean {
  if (!ts) return false;
  let ms = 0;
  if (/^\d+$/.test(ts)) {
    const n = parseInt(ts, 10);
    ms = ts.length >= 13 ? n : n * 1000;
  } else {
    ms = new Date(ts).getTime() || 0;
  }
  if (!ms) return false;
  return Math.abs(Date.now() - ms) <= TIMESTAMP_TOLERANCE_MS;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return Response.json({ status: 'ok' }, { headers: corsHeaders });

  // 1) Lire le corps BRUT d'abord (la signature porte sur le texte exact)
  const rawBody = await req.text();

  const secret = Deno.env.get('GENIUSPAY_WEBHOOK_SECRET') || '';
  const signature = (req.headers.get('x-webhook-signature') || '').trim();
  const timestamp = (req.headers.get('x-webhook-timestamp') || '').trim();
  const eventHeader = (req.headers.get('x-webhook-event') || '').trim();

  // ── FAIL-SAFE : pas de secret configuré -> on ne traite RIEN ──────────────
  if (!secret) {
    console.warn('[geniusWebhook] ⚠️ GENIUSPAY_WEBHOOK_SECRET absent — webhook ignoré (fail-safe)');
    return Response.json({ status: 'ok', warning: 'no_secret_configured' }, { headers: corsHeaders });
  }

  // ── VERIFICATION DE SIGNATURE (obligatoire, aucune exception) ─────────────
  if (!signature || !timestamp) {
    console.warn('[geniusWebhook] ⛔ signature ou timestamp manquant — rejeté');
    return Response.json({ error: 'missing signature' }, { status: 401, headers: corsHeaders });
  }
  if (!timestampIsFresh(timestamp)) {
    console.warn('[geniusWebhook] ⛔ timestamp trop ancien/futur — rejeté (anti-rejeu)');
    return Response.json({ error: 'stale timestamp' }, { status: 401, headers: corsHeaders });
  }
  const expected = await hmacSha256Hex(secret, `${timestamp}.${rawBody}`);
  const provided = signature.toLowerCase().replace(/^sha256=/, '');
  if (!timingSafeEqual(expected, provided)) {
    console.warn('[geniusWebhook] ⛔ signature INVALIDE — rejeté');
    return Response.json({ error: 'invalid signature' }, { status: 401, headers: corsHeaders });
  }

  // ── Signature OK : à partir d'ici, l'appel vient bien de GeniusPay ─────────
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

  let payload: any = {};
  try { payload = JSON.parse(rawBody); } catch {
    return Response.json({ status: 'ok', warning: 'invalid json' }, { headers: corsHeaders });
  }

  const data = payload.data || payload;
  const event = (eventHeader || payload.event || payload.type || '').toString().toLowerCase();
  const status = (data.status || '').toString().toLowerCase();
  const isSuccess = event.includes('success') || event.includes('completed') || status === 'completed' || status === 'success';

  if (!isSuccess) {
    console.log('[geniusWebhook] événement non-succès ignoré:', event || status);
    return Response.json({ status: 'ok' }, { headers: corsHeaders });
  }

  const mtxRef = String(data.reference || payload.reference || '').trim();
  const amount = Number(data.amount) || 0;
  const meta = (data.metadata && typeof data.metadata === 'object') ? data.metadata : {};
  const internalRef = String(meta.internal_ref || '').trim();
  const deviceId = (typeof meta.device_id === 'string' && meta.device_id.length > 5) ? meta.device_id.slice(0, 100) : null;
  const passType = VALID_PASSES.includes(String(meta.pass_type || '').toLowerCase()) ? String(meta.pass_type).toLowerCase() : null;
  const analysisId = String(meta.analysis_id || '').trim();
  let email = String(data.customer?.email || meta.user_email || '').toLowerCase().trim();
  if (email.startsWith('anon_')) email = '';

  if (!mtxRef) {
    console.warn('[geniusWebhook] succès sans référence MTX — ignoré');
    return Response.json({ status: 'ok', warning: 'no reference' }, { headers: corsHeaders });
  }

  try {
    // ── IDEMPOTENCE : ce MTX a-t-il déjà été traité ? ────────────────────────
    const { data: already } = await supabase.from('Payment')
      .select('id, status').eq('transaction_id', mtxRef).eq('status', 'confirmed').limit(1);
    if (already && already.length > 0) {
      console.log('[geniusWebhook] déjà traité (idempotent):', mtxRef);
      return Response.json({ status: 'ok', duplicate: true }, { headers: corsHeaders });
    }

    // ── Retrouver le Payment créé par initPayment ───────────────────────────
    let paymentRow: any = null;
    if (internalRef) {
      const { data: p } = await supabase.from('Payment').select('id, email, device_id, pass_type').eq('reference', internalRef).limit(1);
      if (p && p[0]) paymentRow = p[0];
    }
    if (!paymentRow) {
      const { data: p } = await supabase.from('Payment').select('id, email, device_id, pass_type').eq('transaction_id', mtxRef).limit(1);
      if (p && p[0]) paymentRow = p[0];
    }

    if (!email && paymentRow?.email && !String(paymentRow.email).startsWith('anon_')) {
      email = String(paymentRow.email).toLowerCase().trim();
    }
    const effectiveDevice = deviceId || paymentRow?.device_id || null;
    const effectivePass = passType || paymentRow?.pass_type || null;

    // ── Confirmer (ou créer) la trace du paiement ────────────────────────────
    if (paymentRow) {
      await supabase.from('Payment').update({
        status: 'confirmed',
        transaction_id: mtxRef,
        provider: 'geniuspay',
        paid_at: new Date().toISOString(),
        ...(data.payment_method ? { payment_method: String(data.payment_method) } : {}),
      }).eq('id', paymentRow.id);
    } else {
      await supabase.from('Payment').insert({
        email: email || `anon_${Date.now()}@dermaci.app`,
        reference: internalRef || `wh_${mtxRef}`,
        status: 'confirmed',
        amount: amount || null,
        provider: 'geniuspay',
        transaction_id: mtxRef,
        paid_at: new Date().toISOString(),
        ...(effectivePass ? { pass_type: effectivePass } : {}),
        ...(effectiveDevice ? { device_id: effectiveDevice } : {}),
      });
    }

    // ── ACTIVATION ───────────────────────────────────────────────────────────
    if (effectivePass) {
      // Pass payant : le Payment confirmé (device_id + pass_type) suffit à
      // checkAccess. On complète le profil si l'email est connu.
      if (email) {
        const expiresAt = new Date(Date.now() + PASS_WINDOW_MS).toISOString();
        const { data: prof } = await supabase.from('UserProfile').select('id').eq('email', email).limit(1);
        if (prof && prof.length > 0) {
          await supabase.from('UserProfile').update({ has_global_access: true, pass_type: effectivePass, pass_expires_at: expiresAt }).eq('id', prof[0].id);
        } else {
          await supabase.from('UserProfile').insert({ email, has_global_access: true, pass_type: effectivePass, pass_expires_at: expiresAt });
        }
      }
      console.log('[geniusWebhook] ✅ PASS', effectivePass, 'activé | MTX:', mtxRef, '| device:', effectiveDevice ? 'oui' : 'non', '| email:', email ? 'oui' : 'anon');
    } else {
      // Découverte 2000 : profil si email connu
      if (email) {
        const { data: prof } = await supabase.from('UserProfile').select('id').eq('email', email).limit(1);
        if (prof && prof.length > 0) {
          await supabase.from('UserProfile').update({ has_global_access: true, paid_at: new Date().toISOString(), payment_ref: internalRef || mtxRef, provider: 'geniuspay', amount: amount || 2000 }).eq('id', prof[0].id);
        } else {
          await supabase.from('UserProfile').insert({ email, has_global_access: true, paid_at: new Date().toISOString(), payment_ref: internalRef || mtxRef, provider: 'geniuspay', amount: amount || 2000, total_analyses: 0 });
        }
        await supabase.from('SkinAnalysis').update({ payment_pending: false }).eq('user_email', email).eq('payment_pending', true);
      }
      // Couverture ANONYME : l'analyse précise portée par le paiement
      if (analysisId && analysisId.length > 10) {
        await supabase.from('SkinAnalysis').update({ payment_pending: false }).eq('id', analysisId);
      }
      console.log('[geniusWebhook] ✅ DÉCOUVERTE activée | MTX:', mtxRef, '| email:', email ? 'oui' : 'anon', '| analyse:', analysisId ? 'oui' : 'non');
    }

    return Response.json({ status: 'ok', processed: true }, { headers: corsHeaders });
  } catch (err) {
    console.error('[geniusWebhook] erreur:', (err as Error).message);
    // 200 quand même : GeniusPay n'a pas besoin de re-livrer si NOTRE base a hoqueté
    // (le retour navigateur du client reste le 2e chemin d'activation).
    return Response.json({ status: 'ok', error: (err as Error).message }, { headers: corsHeaders });
  }
});
