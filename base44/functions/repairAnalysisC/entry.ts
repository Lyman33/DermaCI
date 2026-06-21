import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  let body;
  try { body = await req.json(); } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const { analysis_id } = body;
  if (!analysis_id) return Response.json({ error: 'analysis_id requis' }, { status: 400 });

  let analysis;
  try { analysis = await base44.asServiceRole.entities.SkinAnalysis.get(analysis_id); }
  catch { return Response.json({ error: 'Analyse introuvable' }, { status: 404 }); }

  const age = analysis.age || 25;
  const genre = analysis.genre || 'homme';
  const vk = Date.now() % 10000;
  const ageCtx = age < 20 ? `Ado(${age}ans):acne,PIH.` : age < 30 ? `Adulte(${age}ans):stress oxydatif.` : age < 40 ? `Adulte(${age}ans):collagene,dyschromies.` : age < 50 ? `Mature(${age}ans):relachement.` : `Senior(${age}ans):xerose.`;
  const genreCtx = genre === 'homme' ? `Homme:sebum2x,pores larges.` : `Femme:hormones,melasma.`;
  const env = `CI:UV8-12,humidite70-90%,Cote d Ivoire.PhototypeIV-VI:PIH,melasma.`;
  const problemsNames = (analysis.problems || []).map(p => p.name).join(', ');
  const skinType = analysis.skin_type || '';

  const FRUITS = ['Mangue 🥭','Papaye 🧡','Ananas 🍍','Goyave rose 🍈','Corossol 🌿','Citron vert 🍋','Carambole ⭐','Tamarin 🟤','Noix de coco fraîche 🥥','Fruit de la passion 💛','Banane douce 🍌','Avocat 🥑'];
  const PLATS = ['Garba (attiéké + thon frit)','Kedjenou de poulet fermier','Attiéké + poisson braisé + sauce tomate','Foutou igname + sauce arachide','Riz gras + poisson fumé + légumes','Sauce gombo + poisson + igname','Placali + sauce gombo + poisson fumé','Soupe de poisson + riz blanc','Foutou banane + sauce graine de palme','Poulet braisé + Alloco + sauce tomate fraîche','Riz attiéké + sauce claire akpi','Poisson braisé + attiéké + oignons frais'];
  const BOISSONS = ['Jus de bissap (hibiscus) 🌺','Gnamakoudji (gingembre + citron + ananas) 🫚','Eau de coco fraîche 🥥','Jus de corossol maison 🌿','Infusion de citronnelle + gingembre 🍵','Jus de goyave frais 🍈','Jus de tamarin dilué 🟤','Jus de fruit de la passion frais 💛','Jus de papaye fraîche 🧡','Infusion de moringa 🌱'];
  const COLLATIONS = ['Noix de cajou nature 🥜','Arachides grillées à sec 🥜','Noix de coco fraîche râpée 🥥','Graines de courge grillées 🌰','Maïs grillé en épi 🌽','Niébé bouilli (haricots noirs) 🫘','Pistaches de brousse 🌰','Alloco nature (banane plantain frite) 🍌','Gaou (beignets de haricot) 🫘','Noix de karité grillées 🌰'];
  const DESSERTS = ['Dégué (mil fermenté + lait caillé) 🥛','Dokounou (pâte de banane cuite en feuille de bananier) 🍌','Salade de mangue au miel + citron vert 🥭','Ananas caramélisé au gingembre 🍍','Crème de coco aux fruits locaux 🥥','Tapioca sucré au lait de coco 🥥','Yaourt de lait de coco + papaye + miel local 🧡','Gbofloto au miel + gingembre 🍯','Gnomi (beignets de farine de mil sucrés) 🍪','Salade de fruits tropicaux (mangue + ananas + papaye) 🥭'];

  const bi = vk + (age % 7) + (genre === 'homme' ? 0 : 5);
  const pick  = (arr, o) => arr[(bi + o) % arr.length];
  const pick2 = (arr, o) => arr[(bi + o + Math.floor(arr.length / 2)) % arr.length];

  const prompt = `Dermatologue-nutritionniste CI. PATIENT:${age}ans,${genre},peau:"${skinType}",problemes:${problemsNames},cle:${vk}. ${ageCtx} ${genreCtx} ${env}
JSON UNIQUEMENT sans backticks.

ACTIFS:4 INCI cibles problemes detectes. name,emoji,targets[],mechanism(1ph),why_adapted(1ph),results{court_terme,moyen_terme,long_terme},concentration,application,precautions,synergies[],antagonismes[].

ALIMENTS:6 ivoiriens ordre strict(1fruit+1plat+1plat+1boisson+1collation+1dessert).
Fruit:${pick(FRUITS,0)}|${pick(FRUITS,1)}|${pick(FRUITS,2)}.
Plat1:${pick(PLATS,0)}|${pick(PLATS,1)}.
Plat2:${pick2(PLATS,3)}|${pick2(PLATS,4)}.
Boisson:${pick(BOISSONS,0)}|${pick(BOISSONS,1)}.
Collation:${pick(COLLATIONS,0)}|${pick(COLLATIONS,1)}.
Dessert:${pick(DESSERTS,0)}|${pick(DESSERTS,1)}.
Pour chaque aliment: name(emoji+orthographe parfaite),category(fruit|plat|boisson|collation|dessert),skin_targets[],composition{vitamines[],mineraux[],antioxydants[]},skin_benefits(2ph),consommation{frequence,quantite,moment,preparation},disponibilite.

HABITUDES:3 specifiques CI liees problemes. title,description(1ph),frequency,impact_level(eleve|moyen|faible),why_ivory_coast(1ph).

TRACKING:next_analysis_delay,expected_improvements[3],comparison_message(1ph).

{"actifs":[{"name":"","emoji":"","targets":[],"mechanism":"","why_adapted":"","results":{"court_terme":"","moyen_terme":"","long_terme":""},"concentration":"","application":"","precautions":"","synergies":[],"antagonismes":[]}],"aliments":[{"name":"","category":"","skin_targets":[],"composition":{"vitamines":[],"mineraux":[],"antioxydants":[]},"skin_benefits":"","consommation":{"frequence":"","quantite":"","moment":"","preparation":""},"disponibilite":""}],"habitudes":[{"title":"","description":"","frequency":"","impact_level":"","why_ivory_coast":""}],"tracking":{"next_analysis_delay":"","expected_improvements":[],"comparison_message":""}}`;

  const immediateResponse = Response.json({ success: true, analysis_id });

  Promise.resolve().then(async () => {
    try {
      let raw = '';
      try {
        const r = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt, model: 'gpt_5_mini', add_context_from_previous_messages: false
        });
        raw = typeof r==='string'?r:(r?.text||r?.content||r?.result||JSON.stringify(r));
        console.log('[repairC] gpt_5_mini OK:', raw?.substring(0, 60));
      } catch (e) {
        console.error('[repairC] LLM failed:', e.message);
        try { await base44.asServiceRole.entities.SkinAnalysis.update(analysis_id, { analysis_complete: true }); } catch (_) {}
        return;
      }

      const c = (raw||'').trim().replace(/^```json\s*/i,'').replace(/^```\s*/i,'').replace(/\s*```$/i,'').trim();
      let result = null;
      try { result = JSON.parse(c); } catch {
        const m = c.match(/\{[\s\S]*\}/);
        if (m) { try { result = JSON.parse(m[0]); } catch (_) {} }
      }

      if (!result) {
        console.error('[repairC] JSON parse failed');
        try { await base44.asServiceRole.entities.SkinAnalysis.update(analysis_id, { analysis_complete: true }); } catch (_) {}
        return;
      }

      const CATEGORIES = ['fruit', 'plat', 'plat', 'boisson', 'collation', 'dessert'];
      const alimentsFixed = (Array.isArray(result.aliments) ? result.aliments : [])
        .slice(0, 6)
        .map((a, i) => ({ ...a, category: CATEGORIES[i] || a.category }));

      await base44.asServiceRole.entities.SkinAnalysis.update(analysis_id, {
        actifs:    (Array.isArray(result.actifs)    ? result.actifs    : []).slice(0, 6),
        aliments:  alimentsFixed,
        habitudes: (Array.isArray(result.habitudes) ? result.habitudes : []).slice(0, 6),
        tracking:  (result.tracking && typeof result.tracking === 'object') ? result.tracking : {},
        analysis_complete: true,
      });
      console.log('[repairC] OK — actifs:', result.actifs?.length, 'aliments:', alimentsFixed.length);

    } catch (err) {
      console.error('[repairC] Error:', err.message);
      try { await base44.asServiceRole.entities.SkinAnalysis.update(analysis_id, { analysis_complete: true }); } catch (_) {}
    }
  });

  return immediateResponse;
});