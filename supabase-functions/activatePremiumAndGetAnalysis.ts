// ═══════════════════════════════════════════════════════════════════════════
//  DermaCI — activatePremiumAndGetAnalysis  (v4 : VERIFICATION EXACTE PAR REFERENCE)
//  Appelée au retour du paiement Découverte 2000 FCFA (payment-success / premium-success).
//  v4 : verifie LE paiement precis aupres de GeniusPay (reference interne ->
//  transaction MTX -> GET /payments/{MTX} -> completed + montant exact).
//  Bonus structurel : la verification marque le Payment 'confirmed' AVEC device_id
//  -> les clients ANONYMES obtiennent un premium serveur (via checkAccess/device),
//  plus seulement des drapeaux navigateur.
//  Fallback : sans reference -> heuristique (montant 2000 + 60 min + non consomme).
//  Interrupteur : GENIUSPAY_ENFORCE ('1' = bloque si non verifie, sinon observe).
//  API en panne -> on active quand meme (jamais bloquer sur une panne).
// ═══════════════════════════════════════════════════════════════════════════
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const DISCOVERY_AMOUNT = 2000;
const PAYMENT_LOOKBACK_MS = 60 * 60 * 1000;

const gpHeaders = () => ({ 'X-API-Key': Deno.env.get('GENIUSPAY_API_KEY')!, 'X-API-Secret': Deno.env.get('GENIUSPAY_API_SECRET')! });

// ── Verification : exacte par reference si possible, sinon heuristique ──────
async function verifyPayment(supabase: any, reference: string | null, expectedAmount: number) {
  const pk = Deno.env.get('GENIUSPAY_API_KEY');
  const sk = Deno.env.get('GENIUSPAY_API_SECRET');
  const enforce = Deno.env.get('GENIUSPAY_ENFORCE') === '1';
  if (!pk || !sk) return { ok: true, ref: null, paymentRowId: null, mode: 'no-keys' };

  // 1) EXACTE : reference interne -> MTX -> statut GeniusPay
  if (reference) {
    try {
      const { data: rows } = await supabase.from('Payment')
        .select('id, transaction_id, status, device_id')
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
            if (attempt === 0) { await new Promise(res => setTimeout(res, 3000)); continue; } // le temps que GeniusPay finalise
            console.warn('[verifyGP] paiement encore', st, enforce ? '-> refus' : '(observe)');
            return { ok: !enforce, ref: null, paymentRowId: null, mode: (enforce ? 'blocked-' : 'observe-') + st };
          }
          console.warn('[verifyGP] statut', st || 'inconnu', enforce ? '-> refus' : '(observe)');
          return { ok: !enforce, ref: null, paymentRowId: null, mode: (enforce ? 'blocked-' : 'observe-') + (st || 'unknown') };
        }
      }
      // Pas de MTX (paiement passe par lien statique) -> heuristique ci-dessous
    } catch (e) {
      console.error('[verifyGP] exception exacte:', (e as Error).message);
      return { ok: true, ref: null, paymentRowId: null, mode: 'api-exception' };
    }
  }

  // 2) HEURISTIQUE : un paiement complete du bon montant, recent, non consomme
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
  try {
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const body = await req.json().catch(() => ({}));
    let email = (body?.email || '').toLowerCase().trim();
    const reference = (typeof body?.reference === 'string' && body.reference.length > 5) ? body.reference.slice(0, 120) : '';
    const analysisId = body?.analysis_id || body?.id || '';

    // Retrouver l'email via la reference (initPayment l'a stocke, meme pour les anonymes)
    if (!email && reference) {
      const { data: payments } = await supabase.from('Payment').select('email').eq('reference', reference).limit(1);
      if (payments?.[0]?.email) email = payments[0].email.toLowerCase().trim();
    }
    const isRealEmail = email && !email.startsWith('anon_');

    // Deja premium ? -> succes immediat (idempotence : re-visite, rechargement...)
    let alreadyPremium = false;
    if (isRealEmail) {
      const { data: profiles } = await supabase.from('UserProfile').select('has_global_access').eq('email', email).limit(1);
      alreadyPremium = profiles?.[0]?.has_global_access === true;
    }

    let verified = false;
    if (!alreadyPremium) {
      // ── VERIFICATION (v4) : exacte par reference, sinon heuristique ──
      const verif = await verifyPayment(supabase, reference || null, DISCOVERY_AMOUNT);
      if (!verif.ok) {
        // Refus (enforce) : rien n'est ecrit, mais on renvoie l'analyse pour la navigation
        let rid = analysisId;
        if (!rid && isRealEmail) {
          const { data: analyses } = await supabase.from('SkinAnalysis').select('id').eq('user_email', email).eq('analysis_complete', true).order('created_date', { ascending: false }).limit(1);
          if (analyses?.[0]?.id) rid = analyses[0].id;
        }
        return Response.json({
          success: false, premium: false, error: 'payment_not_found',
          message: "Nous n'avons pas encore la confirmation de ton paiement. Reessaie dans un instant.",
          analysis_id: rid, id: rid,
        }, { headers: corsHeaders });
      }
      verified = verif.mode.startsWith('verified');

      // Consommation / confirmation en base
      if (verif.mode === 'verified-exact' && verif.paymentRowId) {
        // Le Payment d'initPayment (avec device_id !) passe confirmed
        // -> premium serveur par device pour les anonymes via checkAccess.
        await supabase.from('Payment').update({ status: 'confirmed', paid_at: new Date().toISOString() }).eq('id', verif.paymentRowId);
      } else if (verif.mode === 'verified-heuristic' && verif.ref) {
        try {
          await supabase.from('Payment').insert({
            email: email || `anon_${Date.now()}@dermaci.app`,
            reference: reference || `discovery_${Date.now()}`,
            status: 'confirmed', amount: DISCOVERY_AMOUNT, provider: 'geniuspay',
            transaction_id: verif.ref,
          });
        } catch (_) {}
      }

      // Profil par email (si email reel)
      if (isRealEmail) {
        const { data: profiles } = await supabase.from('UserProfile').select('id').eq('email', email).limit(1);
        if (profiles?.length > 0) {
          await supabase.from('UserProfile').update({ has_global_access: true, paid_at: new Date().toISOString(), payment_ref: reference, provider: 'geniuspay', amount: DISCOVERY_AMOUNT }).eq('id', profiles[0].id);
        } else {
          await supabase.from('UserProfile').insert({ email, has_global_access: true, paid_at: new Date().toISOString(), payment_ref: reference, provider: 'geniuspay', amount: DISCOVERY_AMOUNT, total_analyses: 0 });
        }
      }
    }

    if (email) {
      await supabase.from('SkinAnalysis').update({ payment_pending: false }).eq('user_email', email).eq('payment_pending', true);
    }

    // Retrouver l'analyse a afficher
    let resultId = analysisId;
    if (!resultId && email) {
      const { data: analyses } = await supabase.from('SkinAnalysis').select('id').eq('user_email', email).eq('analysis_complete', true).order('created_date', { ascending: false }).limit(1);
      if (analyses?.[0]?.id) resultId = analyses[0].id;
    }

    return Response.json({ success: true, premium: true, verified, analysis_id: resultId, id: resultId }, { headers: corsHeaders });
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500, headers: corsHeaders });
  }
});
