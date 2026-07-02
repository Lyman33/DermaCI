// ⚠️ NOTE AUDIT 02/07/2026 : endpoint ouvert — n'importe qui connaissant un email
// peut recuperer l'historique complet (photos, diagnostic). A proteger AVANT
// d'activer la capture d'emails (lier au device_id, ou magic link).
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

    if (!email) return Response.json({ success: true, analyses: [] }, { headers: corsHeaders });

    const { data: analyses } = await supabase
      .from('SkinAnalysis')
      .select('id, score, skin_type, skin_type_description, created_date, analysis_complete, payment_pending, photo_url, problems, score_breakdown')
      .eq('user_email', email)
      .eq('analysis_complete', true)
      .order('created_date', { ascending: false })
      .limit(50);

    return Response.json({ success: true, analyses: analyses || [] }, { headers: corsHeaders });
  } catch (err) {
    return Response.json({ error: err.message, analyses: [] }, { status: 500, headers: corsHeaders });
  }
});
