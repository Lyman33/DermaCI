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
    const body = await req.json().catch(() => ({}));
    const email = (body?.email || '').toLowerCase().trim();
    const deviceId = (typeof body?.device_id === 'string' && body.device_id.length > 5) ? body.device_id.slice(0, 100) : null;

    if (!email) return Response.json({ error: 'Email requis' }, { status: 400, headers: corsHeaders });

    const { data: profiles } = await supabase.from('UserProfile').select('has_global_access').eq('email', email).limit(1);
    if (profiles?.[0]?.has_global_access) return Response.json({ already_premium: true }, { headers: corsHeaders });

    const emailClean = email.replace(/[^a-zA-Z0-9]/g, '').substring(0, 20);
    const reference = `DERMA_${emailClean}_${Date.now()}`;

    await supabase.from('Payment').insert({ email, reference, status: 'pending', amount: 2000, ...(deviceId ? { device_id: deviceId } : {}) });

    const PAYMENT_URL = 'https://geniuspay.ci/product/dermaci-BI38zG';
    // Lien NU (sans parametres) : les 'Link Pay' GeniusPay cassent si on ajoute ?email&ref&redirect_url.
    // Le redirect apres paiement est deja configure DANS GeniusPay (cote produit), donc inutile ici.
    const paymentUrl = PAYMENT_URL;

    return Response.json({ success: true, payment_url: paymentUrl, reference, email }, { headers: corsHeaders });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500, headers: corsHeaders });
  }
});
