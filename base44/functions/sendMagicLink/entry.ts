import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { email } = await req.json();

    if (!email || !email.includes('@')) {
      return Response.json({ error: 'Email invalide' }, { status: 400 });
    }

    // Générer un token magique (JWT-like, 6 heures de validité)
    const magicToken = crypto.randomUUID();
    const expiresAt = Date.now() + 6 * 60 * 60 * 1000;

    // Stocker le token en cache côté serveur (utiliser une entity MagicLink ou localStorage côté client)
    // Pour simplicité: on renvoie le token et l'expiration au client
    // (En prod, stocker dans une DB : MagicLinkToken entity)

    const signupUrl = `${Deno.env.get('APP_URL') || 'https://dermaci.app'}/magic?token=${magicToken}&email=${encodeURIComponent(email)}`;

    // Envoyer l'email avec le lien magique
    await base44.integrations.Core.SendEmail({
      to: email,
      subject: '🌿 Votre lien de connexion DermaCI',
      body: `Bonjour,\n\nCliquez sur ce lien pour vous connecter automatiquement :\n${signupUrl}\n\nLe lien expire dans 6 heures.\n\nDermaCI`,
      from_name: 'DermaCI'
    });

    return Response.json({
      success: true,
      message: 'Lien de connexion envoyé à ' + email,
      token: magicToken,
      expiresAt
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});