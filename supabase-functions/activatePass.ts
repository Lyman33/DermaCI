// ═══════════════════════════════════════════════════════════════════════════
//  DermaCI — activatePass  (BLOC C : activation d'un pass payant)
//  Appelée par la page premium-success après paiement GeniusPay.
//  Enregistre le pass (essentiel/pro/premium) pour 30 jours, par email ET device.
//  Body: { pass_type, device_id, user_email? }
//  ⚠️ NOTE AUDIT 02/07/2026 : endpoint ouvert — active un pass sans preuve de
//  paiement (pas de webhook GeniusPay). A durcir si verification API possible.
// ═══════════════════════════════════════════════════════════════════════════
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const VALID_PASSES = ['essentiel', 'pro', 'premium'];
const WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

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

  if (!VALID_PASSES.includes(passType)) {
    return Response.json({ success: false, error: 'pass_type invalide' }, { status: 200, headers: corsHeaders });
  }

  const expiresAt = new Date(Date.now() + WINDOW_MS).toISOString();

  try {
    // 1) Enregistrer un Payment confirmé avec le pass + device_id (source de verite device)
    await supabase.from('Payment').insert({
      email: userEmail || `anon_${Date.now()}@dermaci.app`,
      reference: `pass_${passType}_${Date.now()}`,
      status: 'confirmed',
      amount: passType === 'essentiel' ? 3000 : passType === 'pro' ? 5000 : 10000,
      pass_type: passType,
      ...(deviceId ? { device_id: deviceId } : {}),
    });

    // 2) Mettre a jour / creer le profil par email (si email connu et non anonyme)
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

  return Response.json({ success: true, pass_type: passType, expires_at: expiresAt }, { headers: corsHeaders });
});
