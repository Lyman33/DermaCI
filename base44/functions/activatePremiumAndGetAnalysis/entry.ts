import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ success: false, error: 'Non authentifié' }, { status: 401 });

    const email = user.email?.toLowerCase().trim();
    const body = await req.json().catch(() => ({}));
    const { analysis_id } = body;

    console.log('[activatePremium] Activation pour:', email);

    // 1. Récupérer ou créer UserProfile
    const profiles = await base44.asServiceRole.entities.UserProfile.filter({ email });
    
    if (profiles?.length > 0) {
      await base44.asServiceRole.entities.UserProfile.update(profiles[0].id, {
        has_global_access: true,
        paid_at: profiles[0].paid_at || new Date().toISOString(),
        provider: 'geniuspay',
      });
    } else {
      await base44.asServiceRole.entities.UserProfile.create({
        email,
        has_global_access: true,
        paid_at: new Date().toISOString(),
        provider: 'geniuspay',
        total_analyses: 0,
      });
    }

    console.log('[activatePremium] ✅ has_global_access = true pour:', email);

    // 2. Récupérer l'analyse demandée ou la dernière
    let analysis = null;
    if (analysis_id) {
      try {
        analysis = await base44.asServiceRole.entities.SkinAnalysis.get(analysis_id);
      } catch {}
    }
    if (!analysis) {
      // 1. Chercher par user_email
      let analyses = await base44.asServiceRole.entities.SkinAnalysis.filter(
        { user_email: email },
        '-created_date',
        5
      );
      // 2. Chercher par created_by_id (le vrai ID système de l'utilisateur)
      if (!analyses?.length) {
        analyses = await base44.asServiceRole.entities.SkinAnalysis.filter(
          { created_by_id: user.id },
          '-created_date',
          5
        );
      }
      // 3. Chercher toutes les analyses récentes et filtrer
      if (!analyses?.length) {
        const all = await base44.asServiceRole.entities.SkinAnalysis.list('-created_date', 20);
        analyses = (all || []).filter(a => a.user_email === email || a.created_by_id === user.id);
      }
      analysis = analyses?.[0] || null;
    }

    // 3. Marquer l'analyse comme débloquée + rattacher à l'utilisateur
    if (analysis?.id) {
      try {
        await base44.asServiceRole.entities.SkinAnalysis.update(analysis.id, {
          created_by: email,
          user_email: email,
          payment_pending: false,
        });
        console.log('[activatePremium] ✅ Analyse rattachée à:', email);
      } catch (e) {
        console.warn('[activatePremium] Erreur rattachement analyse:', e.message);
      }
    }

    // Rattacher toutes les analyses orphelines (sans created_by) à cet utilisateur
    try {
      const allAnalyses = await base44.asServiceRole.entities.SkinAnalysis.filter({
        user_email: email
      });
      for (const a of allAnalyses) {
        if (!a.created_by || a.created_by === '') {
          await base44.asServiceRole.entities.SkinAnalysis.update(a.id, {
            created_by: email,
            payment_pending: false,
          });
        }
      }
      console.log('[activatePremium] ✅ Orphelines rattachées pour:', email);
    } catch (e) {
      console.warn('[activatePremium] Erreur orphelins:', e.message);
    }

    return Response.json({
      success: true,
      premium: true,
      analysis_id: analysis?.id || null,
    }, { status: 200 });

  } catch (err) {
    console.error('[activatePremium] Fatal:', err.message);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
});