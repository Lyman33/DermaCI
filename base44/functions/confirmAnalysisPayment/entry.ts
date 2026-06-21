import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { analysis_id } = await req.json();
    
    if (!analysis_id) {
      return Response.json({ error: 'Missing analysis_id' }, { status: 400 });
    }

    // Récupérer l'analyse
    const analysis = await base44.asServiceRole.entities.SkinAnalysis.get(analysis_id);
    
    if (!analysis) {
      return Response.json({ error: 'Analysis not found' }, { status: 404 });
    }

    // Marquer comme payée et complète
    await base44.asServiceRole.entities.SkinAnalysis.update(analysis_id, {
      payment_pending: false,
      analysis_complete: true
    });

    return Response.json({ success: true, message: 'Analysis payment confirmed' }, { status: 200 });
  } catch (error) {
    console.error('[confirmAnalysisPayment]', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});