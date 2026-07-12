// ═══════════════════════════════════════════════════════════════════════════
//  DermaCI — activatePass  (v4 : VERIFICATION EXACTE PAR REFERENCE)
//  Appelée par premium-success après paiement d'un pass (essentiel/pro/premium).
//  v4 : verifie LE paiement precis (reference interne -> MTX -> GET /payments)
//  avant d'activer. Fallback heuristique (montant + 60 min + non consomme).
//  Idempotence : pass egal/superieur deja actif -> succes sans re-verification.
//  Interrupteur : GENIUSPAY_ENFORCE ('1' = bloque si non verifie, sinon observe).
//  API en panne -> on active quand meme (jamais bloquer sur une panne).
//  Body: { pass_type, device_id, user_email?, reference? }
// ═══════════════════════════════════════════════════════════════════════════
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const VALID_PASSES = ['essentiel', 'pro', 'premium'];
const PASS_AMOUNTS: Record<string, number> = { essentiel: 3000, pro: 5000, premium: 10000 };
const WINDOW_MS = 30 * 24 * 60 * 60 * 1000;
const PAYMENT_LOOKBACK_MS = 60 * 60 * 1000;

const gpHeaders = () => ({ 'X-API-Key': Deno.env.get('GENIUSPAY_API_KEY')!, 'X-API-Secret': Deno.env.get('GENIUSPAY_API_SECRET')! });

async function verifyPayment(supabase: any, reference: string | null, expectedAmount: number) {
  const pk = Deno.env.get('GENIUSPAY_API_KEY');
  const sk = Deno.env.get('GENIUSPAY_API_SECRET');
  const enforce = Deno.env.get('GENIUSPAY_ENFORCE') === '1';
  if (!pk || !sk) return { ok: true, ref: null, paymentRowId: null, mode: 'no-keys' };

  // 1) EXACTE par reference
  if (reference) {
    try {
      const { data: rows } = await supabase.from('Payment')
        .select('id, transaction_id, status')
        .eq('reference', reference).limit(1);
      const row = rows?.[0];
      if (row?.transaction_id) {
        for (let attempt = 0; attempt < 2; attempt++) {
          const r = await fetch(`https://geniuspay.ci/api/v1/merchant/payments/${encodeURIComponent(row.transaction_id)}`, { headers: gpHeaders() });
          if (!r.ok) { console.error('[verifyGP] GET paiement HTTP', r.status); return { ok: true, ref: null, paymentRowId: null, mode: 'api-http-' + r.status }; }
          const j = await r.json().catch(() => ({}));
          const d = j?.data || {};
          const st = String(d.status || '').toLowerCase();
          if (st === 'completed' && Number(d.amount) === expectedAmount) {
            console.log('[verifyGP] ✅ EXACT:', row.transaction_id, expectedAmount, 'FCFA');
            return { ok: true, ref: String(row.transaction_id), paymentRowId: row.id, mode: 'verified-exact' };
          }
          if (st === 'pending' || st === 'processing') {
            if (attempt === 0) { await new Promise(res => setTimeout(res, 3000)); continue; }
            console.warn('[verifyGP] paiement encore', st, enforce ? '-> refus' : '(observe)');
            return { ok: !enforce, ref: null, paymentRowId: null, mode: (enforce ? 'blocked-' : 'observe-') + st };
          }
          console.warn('[verifyGP] statut', st || 'inconnu', enforce ? '-> refus' : '(observe)');
          return { ok: !enforce, ref: null, paymentRowId: null, mode: (enforce ? 'blocked-' : 'observe-') + (st || 'unknown') };
        }
      }
    } catch (e) {
      console.error('[verifyGP] exception exacte:', (e as Error).message);
      return { ok: true, ref: null, paymentRowId: null, mode: 'api-exception' };
    }
  }

  // 2) HEURISTIQUE
  try {
    const res = await fetch('https://geniuspay.ci/api/v1/merchant/payments?status=completed&per_page=50', { headers: gpHeaders() });
    if (!res.ok) return { ok: true, ref: null, paymentRowId: null, mode: 'api-http-' + res.status };
    const body = await res.json().catch(() => ({}));
    const list = Array.isArray(body?.data) ? body.data : [];
    const now = Date.now();
    const candidates = list.filter((t: any) =>
      Number(t?.amount) === expectedAmount &&
      String(t?.status || '').toLowerCase() === 'completed' &&
      t?.created_at && (now - new Date(t.created_at).getTime()) < PAYMENT_LOOKBACK_MS
    );
    for (const t of candidates) {
      const ref = String(t?.reference || t?.id || '').trim();
      if (!ref) continue;
      const { data: used } = await supabase.from('Payment').select('id').eq('transaction_id', ref).limit(1);
      if (!used || used.length === 0) {
        console.log('[verifyGP] ✅ heuristique:', ref, expectedAmount, 'FCFA');
        return { ok: true, ref, paymentRowId: null, mode: 'verified-heuristic' };
      }
    }
    const enforceNow = Deno.env.get('GENIUSPAY_ENFORCE') === '1';
    console.warn('[verifyGP]', enforceNow ? '⛔ ENFORCE: aucun paiement dispo -> refus' : '⚠️ OBSERVATION: aucun paiement trouve (aurait bloque en enforce)');
    return { ok: !enforceNow, ref: null, paymentRowId: null, mode: enforceNow ? 'blocked-no-payment' : 'observe-no-payment' };
  } catch (e) {
    console.error('[verifyGP] exception heuristique:', (e as Error).message);
    return { ok: true, ref: null, paymentRowId: null, mode: 'api-exception' };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  let body: any = {};
  try { body = await req.json(); } catch { body = {}; }

  const passType = (typeof body.pass_type === 'string') ? body.pass_type.toLowerCase().trim() : '';
  const deviceId = (typeof body.device_id === 'string' && body.device_id.length > 5) ? body.device_id.slice(0, 100) : null;
  const userEmail = (typeof body.user_email === 'string') ? body.user_email.toLowerCase().trim() : '';
  const reference = (typeof body.reference === 'string' && body.reference.length > 5) ? body.reference.slice(0, 120) : '';

  if (!VALID_PASSES.includes(passType)) {
    return Response.json({ success: false, error: 'pass_type invalide' }, { status: 200, headers: corsHeaders });
  }

  // ── IDEMPOTENCE : pass egal/superieur deja actif sur ce device -> succes direct
  const rank: Record<string, number> = { essentiel: 1, pro: 2, premium: 3 };
  try {
    if (deviceId) {
      const { data: existingPass } = await supabase
        .from('Payment')
        .select('pass_type, created_date')
        .eq('device_id', deviceId).eq('status', 'confirmed')
        .not('pass_type', 'is', null)
        .order('created_date', { ascending: false }).limit(1);
      if (existingPass && existingPass[0] && existingPass[0].pass_type) {
        const stillActive = (new Date(existingPass[0].created_date).getTime() + WINDOW_MS) > Date.now();
        if (stillActive && (rank[existingPass[0].pass_type] || 0) >= (rank[passType] || 0)) {
          return Response.json({ success: true, pass_type: existingPass[0].pass_type, already_active: true }, { headers: corsHeaders });
        }
      }
    }
  } catch (_) {}

  // ── VERIFICATION (v4) : exacte par reference, sinon heuristique ──
  const expectedAmount = PASS_AMOUNTS[passType];
  const verif = await verifyPayment(supabase, reference || null, expectedAmount);
  if (!verif.ok) {
    return Response.json({
      success: false,
      error: 'payment_not_found',
      message: "Nous n'avons pas encore la confirmation de ton paiement. Reessaie dans un instant.",
    }, { status: 200, headers: corsHeaders });
  }

  const expiresAt = new Date(Date.now() + WINDOW_MS).toISOString();

  try {
    if (verif.mode === 'verified-exact' && verif.paymentRowId) {
      // Le Payment d'initPayment (pass_type + device_id deja dedans) passe confirmed
      await supabase.from('Payment').update({ status: 'confirmed', paid_at: new Date().toISOString() }).eq('id', verif.paymentRowId);
    } else {
      // Heuristique ou pas de verification possible : enregistrement historique
      await supabase.from('Payment').insert({
        email: userEmail || `anon_${Date.now()}@dermaci.app`,
        reference: reference || `pass_${passType}_${Date.now()}`,
        status: 'confirmed',
        amount: expectedAmount,
        pass_type: passType,
        provider: 'geniuspay',
        ...(verif.ref ? { transaction_id: verif.ref } : {}),
        ...(deviceId ? { device_id: deviceId } : {}),
      });
    }

    // Profil par email (si email connu et non anonyme)
    if (userEmail && !userEmail.startsWith('anon_')) {
      const { data: existing } = await supabase
        .from('UserProfile').select('email').eq('email', userEmail).limit(1);
      if (existing && existing[0]) {
        await supabase.from('UserProfile')
          .update({ has_global_access: true, pass_type: passType, pass_expires_at: expiresAt })
          .eq('email', userEmail);
      } else {
        await supabase.from('UserProfile')
          .insert({ email: userEmail, has_global_access: true, pass_type: passType, pass_expires_at: expiresAt });
      }
    }
  } catch (e) {
    console.error('[activatePass] erreur:', e?.message);
    // On renvoie quand meme success: le flag navigateur (cote front) prendra le relais
  }

  return Response.json({ success: true, pass_type: passType, expires_at: expiresAt, verified: verif.mode.startsWith('verified') }, { headers: corsHeaders });
});
