import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    let email = '';
    let body = null;
    try {
      const user = await base44.auth.me();
      email = user?.email || '';
    } catch (e) {}

    // Si pas d'auth, récupérer l'email depuis le body
    if (!email) {
      body = await req.json();
      email = body?.email || '';
    }

    if (!email) {
      return Response.json({ error: 'Email requis' }, { status: 400 });
    }

    // Normaliser email : lowercase + trim
    const normalizedEmail = email.toLowerCase().trim();

    // Check if already premium
    const profiles = await base44.asServiceRole.entities.UserProfile.filter({ email: normalizedEmail });
    if (profiles.length > 0 && profiles[0].has_global_access) {
      return Response.json({ already_premium: true });
    }

    // Create unique reference
    const emailClean = email.replace(/[^a-zA-Z0-9]/g, '').substring(0, 20);
    const timestamp = Date.now();
    const reference = `DERMA_${emailClean}_${timestamp}`;

    // Create payment record
    await base44.asServiceRole.entities.Payment.create({
      email: normalizedEmail,
      reference,
      status: 'pending',
      amount: 2000
    });

    const PAYMENT_URL = 'https://geniuspay.ci/product/dermaci-xMVqAU';
    const redirectUrl = 'https://derma-glow-ci.base44.app/payment-success';
    const paymentUrl = `${PAYMENT_URL}?email=${encodeURIComponent(normalizedEmail)}&ref=${encodeURIComponent(reference)}&redirect_url=${encodeURIComponent(redirectUrl)}`;

    return Response.json({
      success: true,
      payment_url: paymentUrl,
      reference,
      email: normalizedEmail
    });
  } catch (error) {
    console.error('initPayment error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});