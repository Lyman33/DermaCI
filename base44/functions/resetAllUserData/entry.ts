import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  // Admin check
  const user = await base44.auth.me();
  if (user?.role !== 'admin') {
    return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }

  try {
    // 1. Supprimer TOUS les SkinAnalysis
    const allAnalyses = await base44.asServiceRole.entities.SkinAnalysis.list();
    console.log(`[RESET] Suppression de ${allAnalyses.length} analyses...`);
    
    for (const analysis of allAnalyses) {
      try {
        await base44.asServiceRole.entities.SkinAnalysis.delete(analysis.id);
      } catch (e) {
        console.warn(`Failed to delete analysis ${analysis.id}:`, e.message);
      }
    }

    // 2. Réinitialiser TOUS les UserProfile
    const allProfiles = await base44.asServiceRole.entities.UserProfile.list();
    console.log(`[RESET] Réinitialisation de ${allProfiles.length} profils...`);
    
    for (const profile of allProfiles) {
      try {
        await base44.asServiceRole.entities.UserProfile.update(profile.id, {
          has_global_access: false,
          paid_at: null,
          payment_ref: null,
          transaction_id: null,
          payment_method: null,
          provider: null,
          amount: null,
          total_analyses: 0
        });
      } catch (e) {
        console.warn(`Failed to reset profile ${profile.id}:`, e.message);
      }
    }

    // 3. Supprimer TOUS les Payment
    const allPayments = await base44.asServiceRole.entities.Payment.list();
    console.log(`[RESET] Suppression de ${allPayments.length} paiements...`);
    
    for (const payment of allPayments) {
      try {
        await base44.asServiceRole.entities.Payment.delete(payment.id);
      } catch (e) {
        console.warn(`Failed to delete payment ${payment.id}:`, e.message);
      }
    }

    return Response.json({
      success: true,
      message: `✅ Reset complet : ${allAnalyses.length} analyses supprimées, ${allProfiles.length} profils réinitialisés, ${allPayments.length} paiements supprimés. Tous les utilisateurs repartent de 0 !`,
      stats: {
        analyses_deleted: allAnalyses.length,
        profiles_reset: allProfiles.length,
        payments_deleted: allPayments.length
      }
    });

  } catch (err) {
    console.error('[RESET] Error:', err.message);
    return Response.json({ error: err.message }, { status: 500 });
  }
});