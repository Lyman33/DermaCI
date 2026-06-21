import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  let userEmail = `anon_${Date.now()}@dermaci.app`;
  try {
    const isAuthed = await base44.auth.isAuthenticated();
    if (isAuthed) {
      const user = await base44.auth.me();
      if (user?.email) userEmail = user.email;
    }
  } catch (_) {}

  let body;
  try { body = await req.json(); }
  catch (e) { return Response.json({ error: 'Invalid JSON body' }, { status: 400 }); }

  const { photo_url, age, genre, temps_soins } = body;

  if (!age || age < 1 || age > 150) return Response.json({ error: 'Age invalide' }, { status: 400 });
  if (!genre || !['homme', 'femme'].includes(genre)) return Response.json({ error: 'Genre invalide' }, { status: 400 });
  if (!temps_soins || !['peu', 'modéré', 'modere', 'beaucoup'].includes(temps_soins)) return Response.json({ error: 'Temps de soins invalide' }, { status: 400 });
  if (!photo_url || typeof photo_url !== 'string') return Response.json({ error: 'Photo URL manquante ou invalide' }, { status: 400 });

  // Rate limit
  try {
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const all = await base44.asServiceRole.entities.SkinAnalysis.filter({ user_email: userEmail });
    const last24h = all.filter(a => a.created_date && a.created_date >= since24h && a.analysis_complete === true);
    if (last24h.length >= 5) {
      const oldest = last24h[last24h.length - 1];
      const reset = new Date(oldest.created_date);
      reset.setHours(reset.getHours() + 24);
      const hours = Math.ceil((reset.getTime() - Date.now()) / 3600000);
      return Response.json({ error: 'limit_exceeded', message: `Limite atteinte. Reessayez dans ${Math.max(1,hours)}h.`, hours_remaining: Math.max(1,hours) }, { status: 429 });
    }
  } catch (e) { console.warn('Rate limit failed:', e.message); }

  // Upload photo
  let finalPhotoUrl = photo_url;
  if (photo_url.startsWith('data:')) {
    try {
      const b64 = photo_url.split(',')[1];
      const chars = atob(b64);
      const arr = new Uint8Array(chars.length);
      for (let i = 0; i < chars.length; i++) arr[i] = chars.charCodeAt(i);
      const uploaded = await base44.asServiceRole.integrations.Core.UploadFile({
        file: new File([new Blob([arr], {type:'image/jpeg'})], 'photo.jpg', {type:'image/jpeg'})
      });
      finalPhotoUrl = uploaded?.file_url || uploaded?.url || photo_url;
    } catch (e) { finalPhotoUrl = ''; }
  }

  // Premium
  let userIsPremium = false;
  try {
    if (!userEmail.startsWith('anon_')) {
      const profiles = await base44.asServiceRole.entities.UserProfile.filter({ email: userEmail });
      userIsPremium = profiles.length > 0 && profiles[0].has_global_access === true;
    }
  } catch (_) {}

  // Enregistrement initial
  let analysisId;
  try {
    const record = await base44.asServiceRole.entities.SkinAnalysis.create({
      user_email: userEmail, photo_url: finalPhotoUrl || '', age: age || 0,
      genre: genre || '', temps_soins: temps_soins || '', score: 0,
      skin_type: 'Analyse en cours', skin_type_description: '',
      score_breakdown: {}, problems: [], causes: [], routine_matin: [],
      routine_soir: [], actifs: [], aliments: [], habitudes: [], tracking: {},
      analysis_complete: false, payment_pending: !userIsPremium,
    });
    analysisId = record.id;
  } catch (e) {
    return Response.json({ error: 'Failed to create analysis record' }, { status: 500 });
  }

  // Retourner immédiatement au frontend
  const immediateResponse = Response.json({ success: true, analysis_id: analysisId });

  // Call LLM en arrière-plan
  Promise.resolve().then(async () => {
    try {
      const stepsLabel = temps_soins === 'peu' ? '3 etapes' : (temps_soins === 'modere' || temps_soins === 'modéré') ? '5 etapes' : '7 etapes';
      const vk = Date.now() % 10000;
      const ageCtx = age < 20
        ? `Ado(${age}ans):sebum eleve,acne comedonnienne/inflammatoire frequente,PIH post-lesionnelle,pores dilates zone T.`
        : age < 30
        ? `Adulte(${age}ans):equilibre relatif,stress oxydatif,PIH residuelle possible,debut hyperpigmentation solaire.`
        : age < 40
        ? `Adulte(${age}ans):declin collagene -1pct/an depuis 25ans,rides expression naissantes,dyschromies solaires,relachement oval debutant.`
        : age < 50
        ? `Mature(${age}ans):relachement marque,rides profondes,lentigos solaires,xerose croissante,perte fermete.`
        : `Senior(${age}ans):xerose severe,peau fine et fragile,taches pigmentaires multiples,rides profondes,barriere cutanee alteree.`;
      const genreCtx = genre === 'homme'
        ? `Homme:sebum 2x superieur femme,pores structurellement plus larges,vieillissement tardif mais marque,rasage=micro-irritations chroniques.`
        : `Femme:fluctuations hormonales,melasma 3x plus frequent,peau plus fine,sensibilite accrue pre-menstruelle.`;
      const env = `CI:UV index 8-12 toute annee,humidite 70-90%,pollution Abidjan,harmattan nov-fev. PhototypeIV-VI:melanogenese active,PIH systematique post-inflammation,melasma frequent.`;

      const prompt = `Tu es le Pr. KOFFI-DERMA, dermatologue de renommee mondiale specialise peaux africaines, Chef de service Dermatologie CHU Abidjan, 25 ans de pratique clinique.
PATIENT: ${age}ans, ${genre}, routine ${stepsLabel}, cle ${vk}.
${ageCtx}
${genreCtx}
${env}

Analyse ce visage avec la precision d'un bilan dermatologique clinique. JSON UNIQUEMENT sans texte ni backticks.

SCORE 22-92: (uniformite_teint*0.20)+(texture_grain*0.18)+(eclat_luminosite*0.15)+(hydratation*0.15)+(absence_imperfections*0.14)+(fermete_contours*0.10)+(sante_globale*0.08). Calibration: 85-92=excellente, 70-84=tres bonne, 55-69=bonne, 40-54=correcte, 22-39=a ameliorer. Majorite=40-72. Ne JAMAIS sur-noter.

SKIN_TYPE — FORMAT OBLIGATOIRE: "[Type principal] a [tendance] avec [condition1] et [condition2]"
Types principaux UNIQUEMENT: Peau normale | Peau grasse | Peau seche | Peau mixte | Peau sensible | Peau mature | Peau acneique | Peau deshydratee
Tendances UNIQUEMENT: a tendance grasse | a tendance seche | a tendance normale | a tendance acneique | a tendance sensible | a tendance mixte | a predominance grasse (zone T) | a predominance seche (joues) | a tendance reactive | a tendance couperosee | a tendance terne | a tendance pigmentee | a tendance atopique | a tendance deshydratee | a tendance mature
Conditions UNIQUEMENT parmi: hyperpigmentation post-inflammatoire (PIH) residuelle | hyperpigmentation post-inflammatoire active | melasma centrofacial | melasma diffus | deshydratation epidermique legere | deshydratation epidermique moderee | deshydratation epidermique severe | hyperseborrhee folliculaire active | hyperseborrhee folliculaire moderee | pores dilates grade I | pores dilates grade II | pores dilates grade III | acne inflammatoire active (grade I) | acne inflammatoire active (grade II) | acne inflammatoire active (grade III) | acne microkystique sous-jacente | comedons ouverts (points noirs) | comedons fermes (points blancs) | cicatrices post-acneiques hypertrophiques | cicatrices post-acneiques atrophiques | debut de photovieillissement | photovieillissement modere | photovieillissement avance | fines lignes d expression | rides d expression marquees | relachement cutane leger | relachement cutane modere | perte d eclat et teint terne | irregularite de teint localisee | irregularite de teint diffuse | sensibilite accrue aux agents exterieurs | barriere cutanee fragilisee | xerose epidermique legere | xerose epidermique severe | couperose legere centrofaciale | erytheme diffus | taches solaires lentigines | dyschromies multiples | texture irreguliere de surface | grain cutane grossier | folliculite chronique sub-clinique | exces de keratine hyperkeratose
INTERDIT: reponse vague, invention hors listes.

SKIN_TYPE_DESCRIPTION: 2 phrases SIMPLES, CLAIRES et ACCESSIBLES a tous sur CE visage.
(1) Ce qu on voit sur la peau: utilise uniquement des mots du quotidien — taches, pores visibles, peau brillante, peau seche, imperfections, rides, teint inegale, manque d eclat. Precise les zones (front, joues, nez, menton). Jamais de termes medicaux.
(2) Pourquoi cette peau est ainsi: explique en langage simple — a cause de l age, des hormones, du soleil intense en Cote d Ivoire, de l humidite, du stress. Comme si tu expliquais a quelqu un qui ne connait rien a la dermatologie.
STRICTEMENT INTERDIT — ces mots ne doivent JAMAIS apparaitre: hyperoestrogenie, seborrhee, comedons, dyschromie, melanogenese, photovieillissement, xerose, atopique, erytheme, lentigines, hyperpigmentation, post-inflammatoire, epidermique, folliculaire, couperose, anatomopathologique, physiologie, keratinocytes. Remplace-les par: taches brunes, pores, imperfections, vieillissement, secheresse, rougeurs, brillance.
Maximum 2 phrases courtes. Ton chaleureux et bienveillant.

PROBLEMS: 3-5 VISIBLES uniquement. name(clinique precis),severity(legere|moderee|severe),visual_marker(exact),prevalence_ci,description(4ph:mecanisme+observation+CI+evolution),zones(precises),urgency(cosmetique|surveillance|consulter_dermatologue),urgency_reason.

CAUSES: 3-4 specifiques CE patient. icon_keyword(sun|moon|droplet|shield|leaf|zap|heart|wind),title(precis),description(4ph:mecanisme+patient+CI+consequence),category(environnement|hormonal|genetique|hygiene|alimentation|stress|solaire).

ROUTINE: ${stepsLabel} max. step_number,step_name,product_type,actifs(INCI+conc),why_this_step(lien direct probleme detecte),application_tip(geste+quantite+timing). Textures legeres CI, SPF50+ mineral matin obligatoire.

{"score":0,"skin_type":"","skin_type_description":"","score_breakdown":{"uniformite_teint":0,"texture_grain":0,"eclat_luminosite":0,"hydratation":0,"absence_imperfections":0,"fermete_contours":0,"sante_globale":0},"problems":[{"name":"","severity":"","visual_marker":"","prevalence_ci":"","description":"","zones":[],"urgency":"","urgency_reason":""}],"causes":[{"icon_keyword":"","title":"","description":"","category":""}],"routine_matin":[{"step_number":1,"step_name":"","product_type":"","actifs":[],"why_this_step":"","application_tip":""}],"routine_soir":[{"step_number":1,"step_name":"","product_type":"","actifs":[],"why_this_step":"","application_tip":""}]}`;

      let raw = '';
      try {
        const r = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt, model: 'gpt_5_4',
          file_urls: finalPhotoUrl ? [finalPhotoUrl] : undefined,
          add_context_from_previous_messages: false
        });
        raw = typeof r==='string'?r:(r?.text||r?.content||r?.result||JSON.stringify(r));
        console.log('[BG] gpt_5_4 OK:', raw?.substring(0, 60));
      } catch (e1) {
        console.warn('[BG] gpt_5_4 failed, fallback:', e1.message);
        const r2 = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt, model: 'gpt_5_mini',
          file_urls: finalPhotoUrl ? [finalPhotoUrl] : undefined,
          add_context_from_previous_messages: false
        });
        raw = typeof r2==='string'?r2:(r2?.text||r2?.content||r2?.result||JSON.stringify(r2));
        console.log('[BG] gpt_5_mini OK:', raw?.substring(0, 60));
      }

      const c = (raw||'').trim().replace(/^```json\s*/i,'').replace(/^```\s*/i,'').replace(/\s*```$/i,'').trim();
      let result = null;
      try { result = JSON.parse(c); } catch {
        const m = c.match(/\{[\s\S]*\}/);
        if (m) { try { result = JSON.parse(m[0]); } catch (_) {} }
      }

      if (!result) {
        console.error('[BG] JSON parse failed');
        await base44.asServiceRole.entities.SkinAnalysis.update(analysisId, {
          skin_type: 'Erreur — veuillez reessayer', analysis_complete: false,
        });
        return;
      }

      const score = (!isNaN(Number(result.score)) && Number(result.score)>=1)
        ? Math.max(22, Math.min(92, Number(result.score))) : 55;
      const breakdown = (result.score_breakdown && typeof result.score_breakdown==='object' && !Array.isArray(result.score_breakdown))
        ? result.score_breakdown : {};
      const skinType = (result.skin_type || '').trim();
      const skinTypeClean = skinType && skinType !== 'Analyse en cours' && skinType.length > 5
        ? skinType.substring(0, 250)
        : 'Type non determine';

      await base44.asServiceRole.entities.SkinAnalysis.update(analysisId, {
        score,
        skin_type: skinTypeClean,
        skin_type_description: (result.skin_type_description || '').substring(0, 800),
        score_breakdown: breakdown,
        problems:     (Array.isArray(result.problems)     ? result.problems     : []).slice(0,8),
        causes:       (Array.isArray(result.causes)       ? result.causes       : []).slice(0,6),
        routine_matin:(Array.isArray(result.routine_matin)? result.routine_matin: []).slice(0,7),
        routine_soir: (Array.isArray(result.routine_soir) ? result.routine_soir : []).slice(0,7),
        actifs: [], aliments: [], habitudes: [], tracking: {},
        analysis_complete: false,
        payment_pending: !userIsPremium,
      });
      console.log('[BG] Save OK — score:', score, '| skin_type:', skinTypeClean.substring(0,50));

    } catch (err) {
      console.error('[BG] Fatal error:', err.message);
      try {
        await base44.asServiceRole.entities.SkinAnalysis.update(analysisId, {
          skin_type: 'Erreur — veuillez reessayer', analysis_complete: false,
        });
      } catch (_) {}
    }
  });

  return immediateResponse;
});