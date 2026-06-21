import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  
  // Vérifier que c'est un admin
  const user = await base44.auth.me();
  if (user?.role !== 'admin') {
    return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }

  try {
    // Récupérer toutes les analyses avec payment_pending=true créées il y a plus de 24h
    const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const allPending = await base44.asServiceRole.entities.SkinAnalysis.filter({ payment_pending: true });
    
    const toDelete = allPending.filter(a => a.created_date && a.created_date < cutoffTime);
    
    let deletedCount = 0;
    for (const analysis of toDelete) {
      try {
        await base44.asServiceRole.entities.SkinAnalysis.delete(analysis.id);
        deletedCount++;
      } catch (e) {
        console.warn(`Failed to delete analysis ${analysis.id}:`, e.message);
      }
    }

    console.log(`Cleanup: Deleted ${deletedCount} unpaid analyses older than 24h`);
    return Response.json({ deleted: deletedCount, message: `${deletedCount} analyses temporaires supprimées` });
  } catch (error) {
    console.error('Cleanup error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});