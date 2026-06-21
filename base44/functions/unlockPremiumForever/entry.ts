import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const email = user.email?.toLowerCase().trim();
    if (!email) {
      return Response.json({ error: 'No email' }, { status: 400 });
    }

    // Chercher le profil utilisateur
    const profiles = await base44.asServiceRole.entities.UserProfile.filter({ email });
    
    if (profiles.length > 0) {
      // Mettre à jour le profil existant
      await base44.asServiceRole.entities.UserProfile.update(profiles[0].id, {
        has_global_access: true,
        paid_at: new Date().toISOString()
      });
    } else {
      // Créer un nouveau profil si n'existe pas
      await base44.asServiceRole.entities.UserProfile.create({
        email,
        has_global_access: true,
        paid_at: new Date().toISOString()
      });
    }

    return Response.json({ premium: true, message: 'Premium unlocked forever' }, { status: 200 });
  } catch (error) {
    console.error('[unlockPremiumForever]', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});