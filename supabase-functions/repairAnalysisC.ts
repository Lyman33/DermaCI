import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

async function callClaude(prompt: string) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': Deno.env.get('ANTHROPIC_API_KEY')!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({ model: 'claude-haiku-4-5', max_tokens: 5000, messages: [{ role: 'user', content: prompt }] }),
  });
  const data = await res.json();
  return data?.content?.[0]?.text || '';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  let body;
  try { body = await req.json(); } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400, headers: corsHeaders }); }

  const { analysis_id } = body;
  if (!analysis_id) return Response.json({ error: 'analysis_id requis' }, { status: 400, headers: corsHeaders });

  const { data: analysis } = await supabase.from('SkinAnalysis').select('*').eq('id', analysis_id).single();
  if (!analysis) return Response.json({ error: 'Analyse introuvable' }, { status: 404, headers: corsHeaders });

  // ── Detecter ce qui MANQUE reellement (v2 : ne jamais regenerer l'existant) ──
  const isEmpty = (x: any) => !Array.isArray(x) || x.length === 0;
  const needRoutines  = isEmpty(analysis.routine_matin) || isEmpty(analysis.routine_soir);
  const needActifs    = isEmpty(analysis.actifs);
  const needAliments  = isEmpty(analysis.aliments);
  const needHabitudes = isEmpty(analysis.habitudes);
  const needTracking  = !analysis.tracking || typeof analysis.tracking !== 'object' || Object.keys(analysis.tracking).length === 0;

  // Rien a reparer -> aucun appel Claude (0 credit), on sort proprement.
  if (!needRoutines && !needActifs && !needAliments && !needHabitudes && !needTracking) {
    if (analysis.analysis_complete !== true) {
      await supabase.from('SkinAnalysis').update({ analysis_complete: true }).eq('id', analysis_id);
    }
    return Response.json({ success: true, analysis_id, nothing_to_repair: true }, { headers: corsHeaders });
  }

  const immediateResponse = Response.json({ success: true, analysis_id }, { headers: corsHeaders });

  Promise.resolve().then(async () => {
    try {
      const age = analysis.age || 25;
      const genre = analysis.genre || 'homme';
      const vk = Date.now() % 10000;
      const problemsNames = (analysis.problems || []).map((p: any) => p.name).join(', ');
      const tempsSoins = analysis.temps_soins || 'modere';
      const stepsLabel = tempsSoins === 'peu' ? '3 etapes' : tempsSoins === 'beaucoup' ? '7 etapes' : '5 etapes';

      const FRUITS = ['Mangue 🥭','Papaye 🧡','Ananas 🍍','Goyave rose 🍈','Corossol 🌿','Citron vert 🍋','Carambole ⭐','Tamarin 🟤','Noix de coco fraîche 🥥','Fruit de la passion 💛','Banane douce 🍌','Avocat 🥑'];
      const PLATS = ['Garba (attiéké + thon frit)','Kedjenou de poulet fermier','Attiéké + poisson braisé + sauce tomate','Foutou igname + sauce arachide','Riz gras + poisson fumé + légumes','Sauce gombo + poisson + igname','Placali + sauce gombo + poisson fumé','Soupe de poisson + riz blanc','Foutou banane + sauce graine de palme','Poulet braisé + Alloco + sauce tomate fraîche','Riz + sauce claire akpi','Poisson braisé + attiéké + oignons'];
      const BOISSONS = ['Jus de bissap (hibiscus) 🌺','Gnamakoudji (gingembre+citron+ananas) 🫚','Eau de coco fraîche 🥥','Jus de corossol maison 🌿','Infusion de citronnelle + gingembre 🍵','Jus de goyave frais 🍈','Jus de tamarin dilué 🟤','Jus de fruit de la passion 💛','Jus de papaye fraîche 🧡','Infusion de moringa 🌱'];
      const COLLATIONS = ['Noix de cajou nature 🥜','Arachides grillées à sec 🥜','Noix de coco râpée 🥥','Graines de courge grillées 🌰','Maïs grillé en épi 🌽','Niébé bouilli (haricots) 🫘','Pistaches de brousse 🌰','Alloco nature 🍌','Gaou (beignets de haricot) 🟤','Noix de karité grillées 🌰'];
      const DESSERTS = ['Dégué (mil + lait caillé) 🥛','Dokounou (pâte de banane) 🍌','Salade de mangue au miel + citron 🥭','Ananas caramélisé au gingembre 🍍','Crème de coco aux fruits locaux 🥥','Tapioca sucré au lait de coco 🥥','Yaourt coco + papaye + miel 🧡','Gbofloto au miel + gingembre 🍯','Gnomi (beignets de mil) 🟤','Salade de fruits tropicaux 🍍'];

      const bi = vk + (age % 7) + (genre === 'homme' ? 0 : 5);
      const pick = (arr: string[], o: number) => arr[(bi+o) % arr.length];
      const pick2 = (arr: string[], o: number) => arr[(bi+o+Math.floor(arr.length/2)) % arr.length];

      // ── Prompt modulaire : on ne demande QUE les blocs manquants ──
      const sections: string[] = [];
      const jsonParts: string[] = [];

      if (needRoutines) {
        sections.push(`ROUTINES: routine_matin ET routine_soir, ${stepsLabel} chacune, adaptees au type de peau et aux problemes. Chaque etape: step_number, step_name, product_type, actifs(liste INCI), why_this_step(1 phrase), application_tip(1 phrase).`);
        jsonParts.push('"routine_matin":[],"routine_soir":[]');
      }
      if (needActifs) {
        sections.push(`ACTIFS:4 INCI cibles sur les problemes. name,emoji,targets[],mechanism(1ph),why_adapted,results{court_terme,moyen_terme,long_terme},concentration,application,precautions,synergies[],antagonismes[].`);
        jsonParts.push('"actifs":[]');
      }
      if (needAliments) {
        sections.push(`ALIMENTS:choisis 6 ivoiriens, 1 par categorie dans l ordre (1 fruit,1 plat,1 plat,1 boisson,1 collation,1 dessert). Choisis le plus adapte aux problemes parmi:
Fruit:${pick(FRUITS,0)}|${pick(FRUITS,1)}. Plat1:${pick(PLATS,0)}|${pick(PLATS,1)}. Plat2:${pick2(PLATS,3)}|${pick2(PLATS,4)}. Boisson:${pick(BOISSONS,0)}|${pick(BOISSONS,1)}. Collation:${pick(COLLATIONS,0)}|${pick(COLLATIONS,1)}. Dessert:${pick(DESSERTS,0)}|${pick(DESSERTS,1)}.
Pour chaque: name,category(fruit|plat|boisson|collation|dessert),skin_targets[],composition{vitamines[],mineraux[],antioxydants[]},skin_benefits(2ph),consommation{frequence,quantite,moment,preparation},disponibilite.`);
        jsonParts.push('"aliments":[]');
      }
      if (needHabitudes) {
        sections.push(`HABITUDES:3 adaptees CI. title,description(1ph),frequency,impact_level(eleve|moyen|faible),why_ivory_coast(donnee chiffree).`);
        jsonParts.push('"habitudes":[]');
      }
      if (needTracking) {
        sections.push(`TRACKING:next_analysis_delay,expected_improvements[3],comparison_message.`);
        jsonParts.push('"tracking":{"next_analysis_delay":"","expected_improvements":[],"comparison_message":""}');
      }

      const prompt = `Dermatologue-nutritionniste ivoirien. PATIENT:${age}ans,${genre},peau:"${analysis.skin_type||''}",problemes:${problemsNames}.
JSON UNIQUEMENT sans backticks. Orthographe stricte (Alloco, Attiéké, Dégué).
${sections.join('\n')}
{${jsonParts.join(',')}}`;

      const raw = await callClaude(prompt);
      const c = raw.trim().replace(/^```json\s*/i,'').replace(/^```\s*/i,'').replace(/\s*```$/i,'').trim();
      let result = null;
      try { result = JSON.parse(c); } catch {
        const m = c.match(/\{[\s\S]*\}/);
        if (m) { try { result = JSON.parse(m[0]); } catch {} }
      }
      if (!result) { await supabase.from('SkinAnalysis').update({ analysis_complete: true }).eq('id', analysis_id); return; }

      // ── Update : UNIQUEMENT les blocs qui manquaient (jamais d'ecrasement) ──
      const upd: Record<string, unknown> = { analysis_complete: true };

      if (needRoutines) {
        if (Array.isArray(result.routine_matin) && result.routine_matin.length) upd.routine_matin = result.routine_matin.slice(0, 7);
        if (Array.isArray(result.routine_soir) && result.routine_soir.length) upd.routine_soir = result.routine_soir.slice(0, 7);
      }
      if (needActifs && Array.isArray(result.actifs) && result.actifs.length) {
        upd.actifs = result.actifs.slice(0, 6);
      }
      if (needAliments && Array.isArray(result.aliments) && result.aliments.length) {
        const CATEGORIES = ['fruit','plat','plat','boisson','collation','dessert'];
        upd.aliments = result.aliments.slice(0, 6).map((a: any, i: number) => ({ ...a, category: CATEGORIES[i] || a.category }));
      }
      if (needHabitudes && Array.isArray(result.habitudes) && result.habitudes.length) {
        upd.habitudes = result.habitudes.slice(0, 6);
      }
      if (needTracking && result.tracking && Object.keys(result.tracking).length) {
        upd.tracking = result.tracking;
      }

      await supabase.from('SkinAnalysis').update(upd).eq('id', analysis_id);
      console.log('[repairC] OK blocs repares:', Object.keys(upd).filter(k => k !== 'analysis_complete').join(', ') || 'aucun');
    } catch (err) {
      console.error('[repairC] Error:', err.message);
      await supabase.from('SkinAnalysis').update({ analysis_complete: true }).eq('id', analysis_id);
    }
  });

  return immediateResponse;
});
