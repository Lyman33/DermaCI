// ⚠️ NOTE AUDIT 02/07/2026 — FAILLE DE SECURITE CONNUE ⚠️
// Ce endpoint accepte n'importe quel POST sans verification de signature :
// {"event":"payment.success","email":"x@x.com"} suffit a activer le premium.
// Pire : sans email, il active le premium du dernier paiement pending.
// SI GeniusPay n'appelle jamais ce webhook (verifier WebhookLog) -> LE SUPPRIMER.
// SI GeniusPay l'appelle -> ajouter une verification de secret avant tout traitement.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const raw = await req.text();
    let payload;
    try { payload = JSON.parse(raw); } catch { return Response.json({ status: 'ok' }, { headers: corsHeaders }); }

    const event = (payload.event || payload.type || '').toString();
    const data = payload.data || payload;
    const status = (data.status || event || '').toString();

    const isSuccess = ['payment.success','payment.completed','success','completed','paid'].some(
      s => event.toLowerCase().includes(s) || status.toLowerCase().includes(s)
    );
    if (!isSuccess) return Response.json({ status: 'ok' }, { headers: corsHeaders });

    const deliveryId = (payload.delivery_id || payload.id || `${Date.now()}_${Math.random()}`).toString();
    const { data: existing } = await supabase.from('WebhookLog').select('id').eq('delivery_id', deliveryId).limit(1);
    if (existing?.length > 0) return Response.json({ status: 'ok' }, { headers: corsHeaders });
    await supabase.from('WebhookLog').insert({ delivery_id: deliveryId, event: event || status, processed: false });

    let email = (data.email || data.customer_email || payload.email || '').toLowerCase().trim();
    const reference = data.reference || data.ref || payload.reference || '';

    if (!email && reference) {
      const { data: p } = await supabase.from('Payment').select('email').eq('reference', reference).limit(1);
      if (p?.[0]?.email) email = p[0].email.toLowerCase().trim();
    }
    if (!email) {
      const { data: pend } = await supabase.from('Payment').select('email').eq('status', 'pending').order('created_date', { ascending: false }).limit(1);
      if (pend?.[0]?.email) email = pend[0].email.toLowerCase().trim();
    }
    if (!email) return Response.json({ status: 'ok', warning: 'no email' }, { headers: corsHeaders });

    if (reference) {
      const { data: pay } = await supabase.from('Payment').select('id').eq('reference', reference).limit(1);
      if (pay?.[0]?.id) {
        await supabase.from('Payment').update({ status: 'confirmed', transaction_id: data.transaction_id || data.id || '', payment_method: data.payment_method || '', provider: 'geniuspay', paid_at: new Date().toISOString() }).eq('id', pay[0].id);
      }
    }

    const { data: profiles } = await supabase.from('UserProfile').select('id').eq('email', email).limit(1);
    if (profiles?.length > 0) {
      await supabase.from('UserProfile').update({ has_global_access: true, paid_at: new Date().toISOString(), payment_ref: reference, provider: 'geniuspay', amount: 2000 }).eq('id', profiles[0].id);
    } else {
      await supabase.from('UserProfile').insert({ email, has_global_access: true, paid_at: new Date().toISOString(), payment_ref: reference, provider: 'geniuspay', amount: 2000, total_analyses: 0 });
    }

    await supabase.from('SkinAnalysis').update({ payment_pending: false }).eq('user_email', email).eq('payment_pending', true);

    return Response.json({ status: 'ok', premium_activated: true }, { headers: corsHeaders });
  } catch (err) {
    return Response.json({ status: 'ok', error: err.message }, { headers: corsHeaders });
  }
});
