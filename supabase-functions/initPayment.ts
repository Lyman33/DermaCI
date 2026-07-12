// ═══════════════════════════════════════════════════════════════════════════
//  DermaCI — initPayment  (v3 : CHECKOUT API GENIUSPAY + FALLBACK STATIQUE)
//  Crée un paiement via l'API GeniusPay -> lien de checkout FRAIS a chaque fois
//  (fini les liens statiques qui meurent). Attache le contexte (device, analyse,
//  pass) en metadata + stocke la reference MTX pour verification exacte au retour.
//  FILET DE SECURITE : si l'API echoue (panne, cles absentes, lenteur > 6s),
//  on renvoie le lien statique historique -> les paiements ne cassent JAMAIS.
//
//  Body: { email?, device_id?, flow?: 'analysis'|'results'|'pass',
//          pass_type?: 'essentiel'|'pro'|'premium', analysis_id? }
//  Retour: { success, payment_url, reference, mode: 'api'|'static', already_premium? }
//  Retro-compatible avec l'ancien frontend (email seul, pass_type seul).
// ═══════════════════════════════════════════════════════════════════════════
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const APP_URL = (Deno.env.get('APP_URL') || 'https://dermaci.app').replace(/\/$/, '');

// Liens statiques historiques = FALLBACK si l'API est indisponible
const STATIC_LINKS: Record<string, string> = {
  analysis: 'https://geniuspay.ci/product/dermaci-evWAOJ',      // FLUX 1 -> premium-success
  results:  'https://geniuspay.ci/product/dermaci-BI38zG',      // Paywall -> payment-success
  essentiel:'https://geniuspay.ci/product/dermaci-pass-essentiel-WUFAuw',
  pro:      'https://geniuspay.ci/product/dermaci-pass-pro-8EXutm',
  premium:  'https://geniuspay.ci/product/dermaci-pass-premium-Iw3Lq3',
};
const PASS_AMOUNTS: Record<string, number> = { essentiel: 3000, pro: 5000, premium: 10000 };
const VALID_PASSES = ['essentiel', 'pro', 'premium'];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const body = await req.json().catch(() => ({}));

    const email = (typeof body?.email === 'string') ? body.email.toLowerCase().trim() : '';
    const deviceId = (typeof body?.device_id === 'string' && body.device_id.length > 5) ? body.device_id.slice(0, 100) : null;
    const passType = (typeof body?.pass_type === 'string' && VALID_PASSES.includes(body.pass_type.toLowerCase().trim()))
      ? body.pass_type.toLowerCase().trim() : null;
    const analysisId = (typeof body?.analysis_id === 'string' && body.analysis_id.length > 10) ? body.analysis_id : null;
    // flow : 'pass' si pass_type present ; sinon 'analysis' ou 'results' (defaut = results, comportement historique du paywall)
    let flow = (typeof body?.flow === 'string') ? body.flow.toLowerCase().trim() : '';
    if (passType) flow = 'pass';
    if (!['analysis', 'results', 'pass'].includes(flow)) flow = 'results';

    // Deja premium (email connu) ? -> pas de paiement a initier
    if (email && !email.startsWith('anon_')) {
      const { data: profiles } = await supabase.from('UserProfile').select('has_global_access').eq('email', email).limit(1);
      if (profiles?.[0]?.has_global_access) return Response.json({ already_premium: true }, { headers: corsHeaders });
    }

    const amount = flow === 'pass' ? PASS_AMOUNTS[passType!] : 2000;
    const staticLink = flow === 'pass' ? STATIC_LINKS[passType!] : STATIC_LINKS[flow];

    // Reference interne (voyage dans success_url + metadata + table Payment)
    const rand = Math.random().toString(36).slice(2, 6);
    const reference = `DERMA_${flow}${passType ? '_' + passType : ''}_${Date.now()}_${rand}`;

    const successUrl = flow === 'pass'
      ? `${APP_URL}/premium-success?pass=${passType}&ref=${reference}`
      : flow === 'analysis'
        ? `${APP_URL}/premium-success?ref=${reference}`
        : `${APP_URL}/payment-success?ref=${reference}${analysisId ? `&analysis_id=${analysisId}` : ''}`;
    const errorUrl = flow === 'pass' ? `${APP_URL}/forfaits` : `${APP_URL}/`;

    // ── Tentative API : checkout frais ──────────────────────────────────────
    const pk = Deno.env.get('GENIUSPAY_API_KEY');
    const sk = Deno.env.get('GENIUSPAY_API_SECRET');
    let apiPayment: { checkout_url: string; mtx: string } | null = null;

    if (pk && sk) {
      try {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 6000); // fluidite : jamais > 6s d'attente
        const res = await fetch('https://geniuspay.ci/api/v1/merchant/payments', {
          method: 'POST',
          headers: { 'X-API-Key': pk, 'X-API-Secret': sk, 'Content-Type': 'application/json' },
          signal: ctrl.signal,
          body: JSON.stringify({
            amount,
            description: flow === 'pass'
              ? `DermaCI — Pass ${passType!.charAt(0).toUpperCase() + passType!.slice(1)}`
              : 'DermaCI — Accès Premium (Découverte)',
            ...(email && !email.startsWith('anon_') ? { customer: { email } } : {}),
            success_url: successUrl,
            error_url: errorUrl,
            metadata: {
              internal_ref: reference,
              flow,
              ...(passType ? { pass_type: passType } : {}),
              ...(deviceId ? { device_id: deviceId } : {}),
              ...(analysisId ? { analysis_id: analysisId } : {}),
            },
          }),
        });
        clearTimeout(timer);
        if (res.ok) {
          const j = await res.json().catch(() => ({}));
          const d = j?.data || {};
          const url = d.checkout_url || d.payment_url;
          const mtx = d.reference;
          if (url && mtx) apiPayment = { checkout_url: url, mtx: String(mtx) };
          else console.warn('[initPayment] reponse API sans url/reference, fallback statique');
        } else {
          console.warn('[initPayment] API GeniusPay HTTP', res.status, '-> fallback statique');
        }
      } catch (e) {
        console.warn('[initPayment] API GeniusPay injoignable/lente -> fallback statique:', (e as Error).message);
      }
    } else {
      console.warn('[initPayment] cles API absentes -> mode statique (historique)');
    }

    // ── Enregistrer l'intention de paiement (les deux modes) ────────────────
    try {
      await supabase.from('Payment').insert({
        email: email || `anon_${Date.now()}@dermaci.app`,
        reference,
        status: 'pending',
        amount,
        provider: 'geniuspay',
        ...(passType ? { pass_type: passType } : {}),
        ...(deviceId ? { device_id: deviceId } : {}),
        ...(apiPayment ? { transaction_id: apiPayment.mtx } : {}),
      });
    } catch (e) {
      console.error('[initPayment] insert Payment:', (e as Error).message);
    }

    if (apiPayment) {
      console.log('[initPayment] ✅ checkout API cree:', apiPayment.mtx, '|', flow, amount, 'FCFA');
      return Response.json({ success: true, payment_url: apiPayment.checkout_url, reference, email, mode: 'api' }, { headers: corsHeaders });
    }
    return Response.json({ success: true, payment_url: staticLink, reference, email, mode: 'static' }, { headers: corsHeaders });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500, headers: corsHeaders });
  }
});
