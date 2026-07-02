// ─────────────────────────────────────────────────────────────────────────────
//  DermaCI — checkDeviceLimit
//  Verification ULTRA-LEGERE : cet appareil a-t-il droit a une analyse gratuite ?
//  N'APPELLE JAMAIS Claude. Lit seulement la base. Cout en tokens = 0.
//  NOTE AUDIT 02/07/2026 : cette fonction n'est plus appelee par le frontend
//  (remplacee par checkAccess). Conservee en sauvegarde ; candidate a suppression.
// ─────────────────────────────────────────────────────────────────────────────
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  let body: any = {};
  try { body = await req.json(); } catch { body = {}; }

  const deviceId = (typeof body.device_id === 'string' && body.device_id.length > 5) ? body.device_id.slice(0, 100) : null;
  const userEmail = (typeof body.user_email === 'string') ? body.user_email.toLowerCase().trim() : '';
  const premiumHint = body.is_premium === true;

  // ── 1) Premium ? -> toujours autorise (illimite) ───────────────────────────
  let isPremium = false;
  try {
    if (userEmail && !userEmail.startsWith('anon_')) {
      const { data: profiles } = await supabase.from('UserProfile').select('has_global_access').eq('email', userEmail).limit(1);
      isPremium = profiles?.[0]?.has_global_access === true;
    }
    if (!isPremium && deviceId) {
      const { data: devPaid } = await supabase.from('Payment').select('id').eq('device_id', deviceId).eq('status', 'confirmed').limit(1);
      if (devPaid && devPaid.length > 0) isPremium = true;
    }
    if (!isPremium && deviceId) {
      const { data: paidAnalyses } = await supabase.from('SkinAnalysis').select('id').eq('device_id', deviceId).eq('payment_pending', false).eq('analysis_complete', true).limit(1);
      if (paidAnalyses && paidAnalyses.length > 0) isPremium = true;
    }
  } catch (_) {}
  if (!isPremium && premiumHint) isPremium = true;

  if (isPremium) {
    return Response.json({ allowed: true, premium: true }, { headers: corsHeaders });
  }

  // ── 2) Non-premium : 1 analyse gratuite par appareil ───────────────────────
  if (deviceId) {
    try {
      // a) Deja une analyse complete sur ce device ? -> bloque
      const { data: devAnalyses } = await supabase
        .from('SkinAnalysis')
        .select('id')
        .eq('device_id', deviceId)
        .eq('analysis_complete', true)
        .limit(1);
      if (devAnalyses && devAnalyses.length >= 1) {
        return Response.json({ allowed: false, reason: 'free_limit_reached' }, { headers: corsHeaders });
      }

      // b) Filet anti-contournement : >= 3 analyses / 24h -> bloque
      const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data: recent } = await supabase
        .from('SkinAnalysis')
        .select('id')
        .eq('device_id', deviceId)
        .gte('created_date', since24h);
      if (recent && recent.length >= 3) {
        return Response.json({ allowed: false, reason: 'rate_limited' }, { headers: corsHeaders });
      }
    } catch (_) {
      // En cas d'erreur de lecture : on autorise (ne jamais bloquer un vrai client par erreur technique)
      return Response.json({ allowed: true, soft: true }, { headers: corsHeaders });
    }
  }

  // Pas de device_id ou aucune analyse encore -> autorise
  return Response.json({ allowed: true }, { headers: corsHeaders });
});
