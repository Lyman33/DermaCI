import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ premium: false }, { status: 200 });

    const email = user.email?.toLowerCase().trim();
    if (!email) return Response.json({ premium: false }, { status: 200 });

    // Unique source de vérité : UserProfile.has_global_access
    // Le webhook publique GeniusPay met à jour ce flag quand le paiement est confirmé
    const profiles = await base44.entities.UserProfile.filter({ email });
    const isPremium = profiles?.[0]?.has_global_access === true;

    return Response.json({ premium: isPremium }, { status: 200 });

  } catch (err) {
    console.error('[checkAndActivatePremium]', err.message);
    return Response.json({ premium: false }, { status: 200 });
  }
});