// ⚠️ NOTE AUDIT 02/07/2026 : endpoint ouvert — un POST avec un simple email active
// le premium sans preuve de paiement (consequence structurelle : pas de webhook
// GeniusPay). A durcir si une verification API GeniusPay devient possible.
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
    let email = (body?.email || '').toLowerCase().trim();
    const reference = body?.reference || '';
    const analysisId = body?.analysis_id || body?.id || '';

    // Retrouver l'email via la référence si besoin
    if (!email && reference) {
      const { data: payments } = await supabase.from('Payment').select('email').eq('reference', reference).limit(1);
      if (payments?.[0]?.email) email = payments[0].email.toLowerCase().trim();
    }

    // Activer le premium pour cet email
    if (email) {
      const { data: profiles } = await supabase.from('UserProfile').select('id').eq('email', email).limit(1);
      if (profiles?.length > 0) {
        await supabase.from('UserProfile').update({ has_global_access: true, paid_at: new Date().toISOString(), payment_ref: reference, provider: 'geniuspay', amount: 2000 }).eq('id', profiles[0].id);
      } else {
        await supabase.from('UserProfile').insert({ email, has_global_access: true, paid_at: new Date().toISOString(), payment_ref: reference, provider: 'geniuspay', amount: 2000, total_analyses: 0 });
      }
      await supabase.from('SkinAnalysis').update({ payment_pending: false }).eq('user_email', email).eq('payment_pending', true);
    }

    // Retrouver l'analyse à afficher
    let resultId = analysisId;
    if (!resultId && email) {
      const { data: analyses } = await supabase.from('SkinAnalysis').select('id').eq('user_email', email).eq('analysis_complete', true).order('created_date', { ascending: false }).limit(1);
      if (analyses?.[0]?.id) resultId = analyses[0].id;
    }

    return Response.json({ success: true, premium: true, analysis_id: resultId, id: resultId }, { headers: corsHeaders });
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500, headers: corsHeaders });
  }
});
