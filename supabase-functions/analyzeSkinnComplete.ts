import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

async function callClaude(prompt: string, imageUrl?: string, maxTokens = 8000) {
  const content: any[] = [];
  if (imageUrl) content.push({ type: 'image', source: { type: 'url', url: imageUrl } });
  content.push({ type: 'text', text: prompt });
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': Deno.env.get('ANTHROPIC_API_KEY')!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5',
      max_tokens: maxTokens,
      temperature: 0,
      system: 'Tu es un dermatologue expert des peaux noires africaines (phototypes IV-VI) exerçant à Abidjan. Tu analyses des photos de visage avec rigueur clinique et SANS complaisance: tu notes ce que tu OBSERVES reellement, chaque visage est unique. Tu reponds UNIQUEMENT avec un objet JSON valide, commencant par { et finissant par }, sans aucun texte ni balise autour.',
      messages: [{ role: 'user', content }],
    }),
  });
  const data = await res.json();
  if (data?.error) { console.error('[BG] Anthropic error:', JSON.stringify(data.error)); return null; }
  return data?.content?.[0]?.text || '';
}

function parseJSON(input: string) {
  if (!input) return null;
  // 1) Nettoyer les balises de bloc de code (```json ... ```) ou qu'elles soient
  let c = String(input).trim();
  c = c.replace(/```json/gi, '').replace(/```/g, '').trim();
  // 2) EXTRACTION STRICTE : tout entre le premier { et le dernier } (couvre tout enrobage)
  const first = c.indexOf('{');
  const last = c.lastIndexOf('}');
  if (first !== -1 && last !== -1 && last > first) {
    const core = c.slice(first, last + 1);
    try { return JSON.parse(core); } catch {}
    // 2b) JSON tronque -> on repare
    try { return JSON.parse(repairTruncated(core)); } catch {}
  }
  // 3) Derniers recours
  try { return JSON.parse(c); } catch {}
  if (first !== -1) { try { return JSON.parse(repairTruncated(c.slice(first))); } catch {} }
  return null;
}

function repairTruncated(input: string): string {
  let str = input;
  let inString = false, escape = false;
  let lastSafe = -1;
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (escape) { escape = false; continue; }
    if (ch === '\\') { escape = true; continue; }
    if (ch === '"') { inString = !inString; if (!inString) lastSafe = i; continue; }
    if (inString) continue;
    if (ch === '}' || ch === ']') lastSafe = i;
    else if (ch === ',' || /[0-9a-z.]/i.test(ch)) lastSafe = i;
  }
  if (lastSafe !== -1 && lastSafe < str.length - 1) str = str.slice(0, lastSafe + 1);
  str = str.replace(/,\s*$/, '');
  inString = false; escape = false;
  const open: string[] = [];
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (escape) { escape = false; continue; }
    if (ch === '\\') { escape = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === '{' || ch === '[') open.push(ch);
    else if (ch === '}') { if (open[open.length - 1] === '{') open.pop(); }
    else if (ch === ']') { if (open[open.length - 1] === '[') open.pop(); }
  }
  if (inString) str += '"';
  for (let i = open.length - 1; i >= 0; i--) str += open[i] === '{' ? '}' : ']';
  return str;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  let body;
  try { body = await req.json(); } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400, headers: corsHeaders }); }

  const { photo_url, age, genre, temps_soins, user_email } = body;
  const userEmail = user_email || `anon_${Date.now()}@dermaci.app`;
  const providedId = (typeof body.analysis_id === 'string' && body.analysis_id.length > 10) ? body.analysis_id : null;
  const deviceId = (typeof body.device_id === 'string' && body.device_id.length > 5) ? body.device_id.slice(0, 100) : null;
  const premiumHint = body.is_premium === true; // indice envoye par le frontend (flag local 'deja paye')
  const localPass = (typeof body.local_pass === 'string' && ['essentiel','pro','premium'].includes(body.local_pass)) ? body.local_pass : null;

  if (!age || age < 1 || age > 150) return Response.json({ error: 'Age invalide' }, { status: 400, headers: corsHeaders });
  if (!genre || !['homme', 'femme'].includes(genre)) return Response.json({ error: 'Genre invalide' }, { status: 400, headers: corsHeaders });
  if (!photo_url) return Response.json({ error: 'Photo URL manquante' }, { status: 400, headers: corsHeaders });

  // ── BARRIERE UNIQUE : on appelle checkAccess (MEME source de verite que le frontend) ──
  // Cela garantit que la limite (ex: Decouverte = 5/mois) est appliquee STRICTEMENT et
  // de maniere COHERENTE cote serveur, avant toute consommation de credits Claude.
  let userIsPremium = false; // conserve pour payment_pending plus bas
  try {
    const accessRes = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/checkAccess`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      },
      body: JSON.stringify({
        device_id: deviceId,
        user_email: userEmail,
        is_premium: premiumHint,
        local_pass: localPass,
        kind: 'analysis',
      }),
    });
    const access = await accessRes.json().catch(() => ({}));
    // Si checkAccess refuse -> on BLOQUE ici, AVANT d'appeler Claude (0 credit consomme).
    if (access && access.allowed === false) {
      const reason = access.reason === 'pass_limit_reached' ? 'pass_limit_reached' : 'free_limit_reached';
      return Response.json({
        success: false,
        error: reason,
        pass: access.pass || 'gratuit',
        resets_at: access.resets_at || null,
        message: reason === 'pass_limit_reached'
          ? "Tu as atteint ta limite d'analyses pour cette periode. Elle se reinitialise bientot, ou passe a un forfait superieur."
          : "Tu as deja utilise ton analyse gratuite. Debloque l'acces premium pour analyser ta peau."
      }, { status: 200, headers: corsHeaders });
    }
    // checkAccess autorise : on retient si l'utilisateur est payant (pass != gratuit) pour payment_pending.
    if (access && access.pass && access.pass !== 'gratuit') userIsPremium = true;
  } catch (e) {
    // Si checkAccess est injoignable, on NE bloque PAS (eviter de casser le service),
    // mais on log. Le frontend a deja fait sa propre verification.
    console.error('[analyze] checkAccess injoignable, on laisse passer:', (e as Error).message);
    if (premiumHint) userIsPremium = true;
  }

  // (La barriere de limite est entierement geree ci-dessus par checkAccess — source unique.)

  const { data: record, error: createError } = await supabase.from('SkinAnalysis').insert({
    ...(providedId ? { id: providedId } : {}),
    ...(deviceId ? { device_id: deviceId } : {}),
    user_email: userEmail, photo_url, age, genre, temps_soins: temps_soins || 'modere',
    score: 0, skin_type: 'Analyse en cours', skin_type_description: '',
    score_breakdown: {}, problems: [], causes: [], routine_matin: [], routine_soir: [],
    actifs: [], aliments: [], habitudes: [], tracking: {},
    analysis_complete: false, payment_pending: !userIsPremium,
  }).select('id').single();

  if (createError || !record) return Response.json({ error: 'Impossible de creer l analyse' }, { status: 500, headers: corsHeaders });
  const analysisId = record.id;

  try {
    const stepsLabel = temps_soins === 'peu' ? '3 etapes' : temps_soins === 'beaucoup' ? '7 etapes' : '5 etapes';
    const ageCtx = age < 20 ? `Adolescent/jeune adulte (${age} ans): pic d'activite sebacee, acne hormonale et PIH frequentes.` : age < 30 ? `Adulte jeune (${age} ans): equilibre, debut d'impact du stress oxydatif et des UV.` : age < 40 ? `Adulte (${age} ans): collagene en baisse (~1%/an), premieres dyschromies solaires.` : age < 50 ? `Peau mature (${age} ans): relachement debutant, texture qui evolue.` : `Peau senior (${age} ans): xerose, perte de fermete, taches de maturite.`;
    const genreCtx = genre === 'homme' ? `Homme: sebum ~2x superieur, pores plus larges, irritations liees au rasage possibles.` : `Femme: influence hormonale, melasma plus frequent, zone peri-buccale sensible.`;

    const FRUITS = ['Mangue 🥭','Papaye 🧡','Ananas 🍍','Goyave rose 🍈','Corossol 🌿','Citron vert 🍋','Avocat 🥑','Fruit de la passion 💛'];
    const PLATS = ['Garba (attiéké + thon frit)','Kedjenou de poulet fermier','Attiéké + poisson braisé + sauce tomate','Foutou igname + sauce arachide','Sauce gombo + poisson + igname','Placali + sauce gombo + poisson fumé','Foutou banane + sauce graine de palme','Poulet braisé + Alloco + sauce tomate'];
    const BOISSONS = ['Jus de bissap (hibiscus) 🌺','Gnamakoudji (gingembre+citron+ananas) 🫚','Eau de coco fraîche 🥥','Jus de goyave frais 🍈','Infusion de moringa 🌱','Jus de papaye fraîche 🧡'];
    const COLLATIONS = ['Noix de cajou nature 🥜','Arachides grillées à sec 🥜','Graines de courge grillées 🌰','Niébé bouilli (haricots) 🫘','Maïs grillé en épi 🌽','Alloco nature 🍌'];
    const DESSERTS = ['Dégué (mil + lait caillé) 🥛','Dokounou (pâte de banane) 🍌','Salade de mangue au miel + citron 🥭','Tapioca sucré au lait de coco 🥥','Yaourt coco + papaye + miel 🧡','Ananas caramélisé au gingembre 🍍'];
    const seed = (parseInt(String(age)) || 25) + (genre === 'homme' ? 1 : 2);
    const p = (a: string[], o: number) => `${a[(seed+o)%a.length]} | ${a[(seed+o+3)%a.length]}`;

    // ── SOCLE COMMUN (identique pour tous) : toute la partie DETECTION.
    // C'est le coeur de la valeur produit — il ne change JAMAIS selon le pass.
    const DETECTION_CORE = `MISSION: analyse dermatologique de CE visage precis. Observe attentivement l'image avant de noter. Deux personnes differentes NE doivent PAS avoir le meme resultat: tes notes refletent ce que TU vois sur cette peau.

PATIENT: ${age} ans, ${genre}, dispose pour sa routine de ${stepsLabel}.
${ageCtx}
${genreCtx}
ENVIRONNEMENT: Abidjan, Cote d'Ivoire. UV index 8-12 toute l'annee, humidite 70-90%, pollution urbaine. Phototype IV-VI (peau noire): l'hyperpigmentation post-inflammatoire (PIH) et le melasma sont les enjeux majeurs; les rougeurs sont plus difficiles a voir, cherche plutot les zones plus sombres, les taches, le relief.

METHODE D'OBSERVATION (zone par zone): front, glabelle, nez, joues, peri-buccal, menton, machoire. Pour CHAQUE zone, evalue: brillance/sebum, taille des pores, comedons (points noirs/blancs), papules/pustules actives, taches/PIH, cicatrices, texture/grain, uniformite du teint, signes de deshydratation, fermete.

CRITERES DISTINCTIFS DU TYPE PRINCIPAL (tranche avec rigueur, c'est le point le plus important):
- GRASSE: brillance GLOBALE (front+joues+menton), pores dilates visibles partout, peau epaisse. Le sebum domine sur TOUT le visage.
- MIXTE: brillance UNIQUEMENT sur la zone T (front+nez+menton), joues normales ou seches. C'est le contraste zone T / joues qui signe la peau mixte.
- SECHE: AUCUNE brillance, aspect mat, fines squames possibles, pores serres, teint qui peut tirailler. Manque de sebum.
- NORMALE: equilibre, ni brillance excessive ni tiraillement, pores fins, grain regulier, peu d'imperfections.
- DESHYDRATEE: manque d'EAU (pas de sebum), teint terne/fatigue, ridules de deshydratation, peut coexister avec grasse (grasse ET deshydratee = possible).
- MATURE: relachement, perte de fermete, ridules installees, taches de maturite (lie a l'age).
- SENSIBLE: reactivite, zones plus sombres d'irritation, sur peau noire cherche les plaques/inflammation plutot que la rougeur.

REGLE ANTI-BIAIS (cruciale): l'acne est une TENDANCE ou une condition, rarement le type principal. Ne mets "acneique" comme type principal QUE si l'acne inflammatoire active (papules/pustules/kystes nombreux) DOMINE reellement tout le visage. Si tu vois surtout de la brillance + quelques boutons -> type principal = GRASSE a tendance acneique. Si zone T grasse + boutons -> MIXTE a tendance acneique. Le type principal decrit la NATURE de la peau (production de sebum, hydratation), la tendance decrit son probleme actuel.

QUALITE PHOTO: si la photo est de profil, sombre, floue ou partielle, reste prudent et base-toi uniquement sur les zones visibles (ne sur-diagnostique pas l'invisible), mais analyse precisement ce qui est visible.

RAISONNEMENT PREALABLE (obligatoire, AVANT de noter): dans ta tete, identifie d'abord les 3-4 indices visuels les plus marquants de CE visage (ex: "brillance forte zone T", "PIH joues gauche", "pores dilates ailes du nez"). Deduis-en le type principal via les CRITERES DISTINCTIFS ci-dessus. Puis seulement, note. Ne mets PAS ce raisonnement dans la reponse JSON (il reste interne) — mais il doit guider des notes coherentes et un type juste.

NOTATION — score_breakdown: note CHAQUE critere de 0 a 100 (echelle sur 100, JAMAIS sur 10). Sois discriminant, honnete et REPRODUCTIBLE (les memes observations donnent les memes notes). Bareme d'ancrage a respecter:
- 85-100: excellent, critere quasi parfait, aucun defaut visible.
- 70-84: bon, defauts mineurs.
- 55-69: moyen, defauts nets mais limites.
- 40-54: faible, probleme marque et etendu.
- 20-39: tres atteint, probleme severe dominant.
N'utilise PAS systematiquement 50: place chaque note dans la bonne tranche selon ce que tu vois. Criteres:
- uniformite_teint (taches, PIH, melasma, regularite couleur)
- texture_grain (lisse vs rugueux, relief, cicatrices)
- eclat_luminosite (peau terne vs lumineuse)
- hydratation (tiraillement, deshydratation, souplesse)
- absence_imperfections (moins il y a d'acne/comedons, plus c'est haut)
- fermete_contours (tonicite, en lien avec l'age)
- sante_globale (impression clinique d'ensemble)

SCORE GLOBAL: nombre 0-100 = somme ponderee: uniformite_teint*0.20 + texture_grain*0.18 + eclat_luminosite*0.15 + hydratation*0.15 + absence_imperfections*0.14 + fermete_contours*0.10 + sante_globale*0.08. Calcule-le vraiment a partir de tes notes.`;

    // ── PROMPT COMPLET (utilisateurs PAYANTS — identique a la version validee) ──
    const promptFull = `PRIORITE ABSOLUE: ta tache la PLUS importante est (1) identifier le TYPE DE PEAU exact et (2) noter precisement les 7 criteres (score_breakdown). Mets-y toute ton attention et ta rigueur. Les rubriques de conseils (routine, actifs, aliments) sont SECONDAIRES: garde-les justes mais CONCISES, ne t'y attarde pas. L'essentiel est la PRECISION de la detection et des notes.

${DETECTION_CORE}

CONTENU (precis, clinique, mais CONCIS pour tenir dans la reponse; oriente peaux noires + Cote d'Ivoire):
- skin_type: DOIT commencer par le mot "Peau". Format EXACT: "Peau [type] a tendance [tendance] avec [condition1] et [condition2]". Exemples: "Peau mixte a tendance grasse avec hyperpigmentation post-inflammatoire et pores dilates", "Peau grasse a tendance acneique avec deshydratation et teint terne". Types: normale, grasse, seche, mixte, sensible, deshydratee, acneique, mature. Sois specifique a CE visage.
- skin_type_description: 2 phrases simples, accessibles, sans jargon.
- COHERENCE OBLIGATOIRE: le skin_type doit etre coherent avec les problems et le score. Ex: si acne active visible -> type 'acneique'; si brillance + pores -> 'grasse'; si tiraillements/desquamation -> 'seche' ou 'deshydratee'. Ne donne pas un type generique si les signes montrent autre chose.
- problems: 3 a 5 problemes REELLEMENT visibles (si peau saine, en mettre moins). CONCIS: name, severity(legere|moderee|severe), visual_marker(1 phrase courte), prevalence_ci(1 phrase courte), description(1 phrase), zones(liste), urgency(cosmetique|surveillance|consulter_dermatologue), urgency_reason(1 phrase courte). Mets "consulter_dermatologue" si acne inflammatoire etendue, kystes, ou lesion suspecte.
- causes: 3. icon_keyword(sun|moon|droplet|shield|leaf|zap|heart|wind), title, description(2 phrases), category.
- routine_matin et routine_soir: ${stepsLabel} chacune, adaptees au type et aux problemes. step_number, step_name, product_type, actifs(liste INCI), why_this_step(1 phrase), application_tip(1 phrase).
- actifs: 4 actifs INCI cibles sur SES problemes. CONCIS: name, emoji, targets(liste courte), mechanism(1 phrase courte), why_adapted(1 phrase courte), concentration, application(1 phrase courte), precautions(1 phrase courte).
- aliments: EXACTEMENT 6 plats/aliments ivoiriens, dans CET ordre de category: fruit, plat, plat, boisson, collation, dessert. Choisis les plus adaptes a SES problemes parmi: Fruit:[${p(FRUITS,0)}] Plat1:[${p(PLATS,0)}] Plat2:[${p(PLATS,1)}] Boisson:[${p(BOISSONS,0)}] Collation:[${p(COLLATIONS,0)}] Dessert:[${p(DESSERTS,0)}]. Orthographe exacte (Alloco, Attiéké, Dégué). Chaque (CONCIS): name, category, skin_targets(liste courte), composition{vitamines:[],mineraux:[],antioxydants:[]}(2-3 items max chacun), skin_benefits(1 phrase courte), consommation{frequence,quantite,moment,preparation}, disponibilite.
- habitudes: 3 conseils concrets adaptes au climat ivoirien. title, description(1 phrase), frequency, impact_level(eleve|moyen|faible), why_ivory_coast(1 phrase).
- tracking: next_analysis_delay, expected_improvements(liste de 3), comparison_message(1 phrase).

REPONDS AVEC CETTE STRUCTURE EXACTE (et rien d'autre):
{"score":0,"skin_type":"","skin_type_description":"","score_breakdown":{"uniformite_teint":0,"texture_grain":0,"eclat_luminosite":0,"hydratation":0,"absence_imperfections":0,"fermete_contours":0,"sante_globale":0},"problems":[],"causes":[],"routine_matin":[],"routine_soir":[],"actifs":[],"aliments":[],"habitudes":[],"tracking":{"next_analysis_delay":"","expected_improvements":[],"comparison_message":""}}`;

    // ── PROMPT COURT (utilisateurs GRATUITS) ──
    // MEME detection, MEMES criteres, MEME rigueur — mais SANS les rubriques de conseils
    // (routine/actifs/aliments/habitudes/tracking) que le paywall floute de toute facon.
    // Ces rubriques seront generees par repairAnalysisC AU MOMENT du paiement.
    // Economie: ~60-70% des tokens de sortie sur chaque analyse gratuite.
    const promptFree = `PRIORITE ABSOLUE: ta tache la PLUS importante est (1) identifier le TYPE DE PEAU exact et (2) noter precisement les 7 criteres (score_breakdown). Mets-y toute ton attention et ta rigueur.

${DETECTION_CORE}

CONTENU (precis, clinique, CONCIS; oriente peaux noires + Cote d'Ivoire):
- skin_type: DOIT commencer par le mot "Peau". Format EXACT: "Peau [type] a tendance [tendance] avec [condition1] et [condition2]". Exemples: "Peau mixte a tendance grasse avec hyperpigmentation post-inflammatoire et pores dilates", "Peau grasse a tendance acneique avec deshydratation et teint terne". Types: normale, grasse, seche, mixte, sensible, deshydratee, acneique, mature. Sois specifique a CE visage.
- skin_type_description: 2 phrases simples, accessibles, sans jargon.
- COHERENCE OBLIGATOIRE: le skin_type doit etre coherent avec les problems et le score. Ex: si acne active visible -> type 'acneique'; si brillance + pores -> 'grasse'; si tiraillements/desquamation -> 'seche' ou 'deshydratee'. Ne donne pas un type generique si les signes montrent autre chose.
- problems: 3 a 5 problemes REELLEMENT visibles (si peau saine, en mettre moins). CONCIS: name, severity(legere|moderee|severe), visual_marker(1 phrase courte), prevalence_ci(1 phrase courte), description(1 phrase), zones(liste), urgency(cosmetique|surveillance|consulter_dermatologue), urgency_reason(1 phrase courte). Mets "consulter_dermatologue" si acne inflammatoire etendue, kystes, ou lesion suspecte.
- causes: 3. icon_keyword(sun|moon|droplet|shield|leaf|zap|heart|wind), title, description(2 phrases), category.

REPONDS AVEC CETTE STRUCTURE EXACTE (et rien d'autre):
{"score":0,"skin_type":"","skin_type_description":"","score_breakdown":{"uniformite_teint":0,"texture_grain":0,"eclat_luminosite":0,"hydratation":0,"absence_imperfections":0,"fermete_contours":0,"sante_globale":0},"problems":[],"causes":[]}`;

    const prompt = userIsPremium ? promptFull : promptFree;
    const maxTokens = userIsPremium ? 8000 : 3000;

    const raw = await callClaude(prompt, photo_url, maxTokens);
    const result = parseJSON(raw || '');
    if (!result) {
      console.error('[BG] JSON parse failed. Apercu:', (raw || '').slice(0, 300));
      return Response.json({ success: false, error: 'parse_failed', analysis_id: analysisId }, { status: 200, headers: corsHeaders });
    }

    // Normaliser le breakdown sur 100 (garde-fou si l'IA repond sur 10)
    const rawBreak = (result.score_breakdown && typeof result.score_breakdown === 'object') ? result.score_breakdown : {};
    const breakdown = {};
    for (const k of Object.keys(rawBreak)) {
      let v = Number(rawBreak[k]) || 0;
      if (v > 0 && v <= 10) v = v * 10;
      breakdown[k] = Math.max(0, Math.min(100, Math.round(v)));
    }
    const W = { uniformite_teint:0.20, texture_grain:0.18, eclat_luminosite:0.15, hydratation:0.15, absence_imperfections:0.14, fermete_contours:0.10, sante_globale:0.08 };
    let weighted = 0, wsum = 0;
    for (const k of Object.keys(W)) { if (breakdown[k] != null) { weighted += breakdown[k] * W[k]; wsum += W[k]; } }
    let rawScore = Number(result.score) || 0;
    if (rawScore > 0 && rawScore <= 10) rawScore = rawScore * 10;
    const computed = wsum > 0 ? Math.round(weighted / wsum) : rawScore;
    const score = Math.max(15, Math.min(95, computed || rawScore || 55));

    // ── Champs communs (detection) : identiques quel que soit le pass ──
    const baseUpdate: Record<string, unknown> = {
      score,
      skin_type: (() => {
        let t = String(result.skin_type || 'Peau a analyser').trim();
        if (!/^peau\b/i.test(t)) t = 'Peau ' + t.charAt(0).toLowerCase() + t.slice(1);
        return t.substring(0, 250);
      })(),
      skin_type_description: (result.skin_type_description || '').substring(0, 800),
      score_breakdown: breakdown,
      problems: (result.problems || []).slice(0, 8),
      causes: (result.causes || []).slice(0, 6),
      analysis_complete: true,
    };

    if (userIsPremium) {
      // ── PAYANT : rubriques completes (comportement identique a la version validee) ──
      const CATEGORIES = ['fruit', 'plat', 'plat', 'boisson', 'collation', 'dessert'];
      const aliments = (Array.isArray(result.aliments) ? result.aliments : []).slice(0, 6).map((a: any, i: number) => ({ ...a, category: CATEGORIES[i] || a?.category }));

      await supabase.from('SkinAnalysis').update({
        ...baseUpdate,
        routine_matin: (result.routine_matin || []).slice(0, 7),
        routine_soir: (result.routine_soir || []).slice(0, 7),
        actifs: (result.actifs || []).slice(0, 6),
        aliments,
        habitudes: (Array.isArray(result.habitudes) && result.habitudes.length) ? result.habitudes.slice(0, 6) : [{ title: 'Protection solaire quotidienne', description: 'Appliquez un SPF50+ chaque matin, soleil ivoirien intense toute l annee.', frequency: 'Tous les jours', impact_level: 'eleve', why_ivory_coast: 'UV index 8-12 en Cote d Ivoire.' }],
        tracking: (result.tracking && Object.keys(result.tracking).length) ? result.tracking : { next_analysis_delay: '4 semaines', expected_improvements: ['Teint plus uniforme', 'Reduction des imperfections', 'Meilleure hydratation'], comparison_message: 'Refaites une analyse dans 4 semaines pour mesurer vos progres.' },
      }).eq('id', analysisId);

      console.log('[BG] Analyse COMPLETE (payant) OK score:', score, '| type:', (result.skin_type||'').slice(0,40), '| aliments:', aliments.length);
    } else {
      // ── GRATUIT : detection seule. Les rubriques (floutees par le paywall) ne sont
      // PAS generees -> economie de credits. Elles seront creees par repairAnalysisC
      // apres paiement (Results.jsx v2 declenche le repair uniquement pour les payants).
      await supabase.from('SkinAnalysis').update(baseUpdate).eq('id', analysisId);

      console.log('[BG] Analyse GRATUITE (courte) OK score:', score, '| type:', (result.skin_type||'').slice(0,40));
    }
  } catch (err) {
    console.error('[BG] Error:', err.message);
  }

  return Response.json({ success: true, analysis_id: analysisId }, { headers: corsHeaders });
});
