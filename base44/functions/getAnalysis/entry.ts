import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    let body;
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const { analysis_id } = body;
    if (!analysis_id || typeof analysis_id !== 'string') {
      return Response.json({ error: 'analysis_id is required and must be a string' }, { status: 400 });
    }

    // Retry logic avec timeout court
    let analysis = null;
    let lastError = null;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        analysis = await base44.asServiceRole.entities.SkinAnalysis.get(analysis_id);
        if (analysis) break;
      } catch (e) {
        lastError = e;
        if (attempt === 0) await new Promise(r => setTimeout(r, 200));
      }
    }

    if (!analysis) {
      console.error('Analysis not found:', analysis_id, lastError?.message);
      return Response.json({ error: 'Analysis not found' }, { status: 404 });
    }

    // Vérifier le premium côté backend
    let isPremium = false;
    try {
      let email = body?.email || '';
      if (email) {
        // Normaliser email
        email = email.toLowerCase().trim();
        
        // Un seul critère : has_global_access = true dans le UserProfile
        const profiles = await base44.asServiceRole.entities.UserProfile.filter({ email });
        isPremium = profiles.length > 0 && profiles[0].has_global_access === true;
        console.log(`Premium check for ${email}: isPremium=${isPremium}`);
      }
    } catch (e) {
      console.warn('Premium check failed:', e.message);
    }

    // Validation basique de la structure
    const validated = {
      ...analysis,
      score: Math.max(0, Math.min(100, Number(analysis.score) || 0)),
      analysis_complete: Boolean(analysis.analysis_complete)
    };

    // Toujours retourner toutes les données — le masquage se fait côté frontend
    return Response.json({ success: true, data: validated, is_premium: isPremium });
  } catch (error) {
    console.error('getAnalysis error:', error.message);
    return Response.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
});