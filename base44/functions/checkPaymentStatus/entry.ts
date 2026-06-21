import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || !user.email) {
      return Response.json({ has_global_access: false });
    }

    const profiles = await base44.asServiceRole.entities.UserProfile.filter({ email: user.email });

    if (profiles.length > 0 && profiles[0].has_global_access) {
      return Response.json({ has_global_access: true });
    }

    return Response.json({ has_global_access: false });
  } catch (error) {
    console.error('checkPaymentStatus error:', error.message);
    return Response.json({ has_global_access: false });
  }
});