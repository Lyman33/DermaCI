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
    const reference = body?.reference || '';
    let email = (body?.email || '').toLowerCase().trim();

    // 1) Si on a une référence, retrouver l'email + confirmer le paiement
    if (reference) {
      const { data: payments } = await supabase.from('Payment').select('email,status').eq('reference', reference).limit(1);
      if (payments?.[0]) {
        if (!email) email = (payments[0].email || '').toLowerCase().trim();
        if (payments[0].status === 'confirmed' && email) {
          await activate(supabase, email, reference);
          return Response.json({ premium: true }, { headers: corsHeaders });
        }
      }
    }

    // 2) Vérifier le profil par email
    if (email) {
      const { data: profiles } = await supabase.from('UserProfile').select('has_global_access').eq('email', email).limit(1);
      if (profiles?.[0]?.has_global_access === true) {
        return Response.json({ premium: true }, { headers: corsHeaders });
      }
    }

    return Response.json({ premium: false }, { headers: corsHeaders });
  } catch (err) {
    return Response.json({ premium: false, error: err.message }, { headers: corsHeaders });
  }
});

async function activate(supabase: any, email: string, reference: string) {
  const { data: profiles } = await supabase.from('UserProfile').select('id').eq('email', email).limit(1);
  if (profiles?.length > 0) {
    await supabase.from('UserProfile').update({ has_global_access: true, paid_at: new Date().toISOString(), payment_ref: reference, provider: 'geniuspay', amount: 2000 }).eq('id', profiles[0].id);
  } else {
    await supabase.from('UserProfile').insert({ email, has_global_access: true, paid_at: new Date().toISOString(), payment_ref: reference, provider: 'geniuspay', amount: 2000, total_analyses: 0 });
  }
  await supabase.from('SkinAnalysis').update({ payment_pending: false }).eq('user_email', email).eq('payment_pending', true);
}
