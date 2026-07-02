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
    const body = await req.json();
    const { analysis_id, email } = body;

    if (!analysis_id) return Response.json({ error: 'analysis_id requis' }, { status: 400, headers: corsHeaders });

    const { data: analysis, error } = await supabase.from('SkinAnalysis').select('*').eq('id', analysis_id).single();
    if (error || !analysis) return Response.json({ error: 'Analyse introuvable' }, { status: 404, headers: corsHeaders });

    let isPremium = false;
    if (email) {
      const { data: profiles } = await supabase.from('UserProfile').select('has_global_access').eq('email', String(email).toLowerCase().trim()).limit(1);
      isPremium = profiles?.[0]?.has_global_access === true;
    }

    return Response.json({ success: true, data: analysis, is_premium: isPremium }, { headers: corsHeaders });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500, headers: corsHeaders });
  }
});
