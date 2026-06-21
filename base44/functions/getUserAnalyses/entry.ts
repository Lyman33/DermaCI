import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const email = (user.email || '').toLowerCase().trim();
    if (!email) {
      return Response.json({ success: true, analyses: [] });
    }

    // Les analyses sont créées via asServiceRole.
    // L'email est stocké dans data.user_email (champ custom sans conflit avec created_by système)
    const allAnalyses = await base44.asServiceRole.entities.SkinAnalysis.list('-created_date', 200);

    const userAnalyses = (allAnalyses || []).filter(a => {
      const userEmailField = (a.user_email || '').toLowerCase().trim();
      // Fallback sur l'ancien champ created_by pour les anciennes analyses
      const createdByField = (a.created_by || '').toLowerCase().trim();
      return userEmailField === email || createdByField === email;
    });

    return Response.json({ success: true, analyses: userAnalyses });
  } catch (error) {
    console.error('getUserAnalyses error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});