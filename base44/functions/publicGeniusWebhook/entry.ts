import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    let payload;
    try {
      const body = await req.text();
      payload = JSON.parse(body);
    } catch (e) {
      console.log('Webhook: invalid body');
      return Response.json({ status: 'ok' }, { status: 200 });
    }

    console.log('Webhook received:', JSON.stringify(payload).substring(0, 500));

    const event = payload.event || payload.type || '';
    const data = payload.data || payload;
    const status = data.status || event || '';

    // Check if it's a success event
    const isSuccess = ['payment.success', 'payment.completed', 'success', 'completed', 'paid'].some(
      s => event.toLowerCase().includes(s) || status.toLowerCase().includes(s)
    );

    if (!isSuccess) {
      console.log('Webhook: not a success event, ignoring');
      return Response.json({ status: 'ok' }, { status: 200 });
    }

    // Anti-duplication
    const deliveryId = payload.delivery_id || payload.id || `${Date.now()}_${Math.random()}`;
    const existingLogs = await base44.asServiceRole.entities.WebhookLog.filter({ delivery_id: deliveryId });
    if (existingLogs.length > 0) {
      console.log('Webhook: duplicate delivery_id, ignoring');
      return Response.json({ status: 'ok' }, { status: 200 });
    }

    await base44.asServiceRole.entities.WebhookLog.create({
      delivery_id: deliveryId,
      event: event || status,
      processed: false
    });

    // Find email - cascade search
    let email = data.email || data.customer_email || data.client_email ||
                (data.metadata && data.metadata.email) ||
                (data.customer && data.customer.email) ||
                payload.email || '';

    // Normaliser email
    email = (email || '').toLowerCase().trim();

    const reference = data.reference || data.ref || data.payment_reference ||
                      (data.metadata && data.metadata.ref) || payload.reference || '';

    console.log('Webhook: extracted email:', email, 'reference:', reference);

    // If no email, search by reference
    if (!email && reference) {
      const payments = await base44.asServiceRole.entities.Payment.filter({ reference });
      if (payments.length > 0) {
        email = (payments[0].email || '').toLowerCase().trim();
        console.log('Webhook: found email from payment reference:', email);
      }
    }

    // If still no email, take most recent pending payment
    if (!email) {
      const pendingPayments = await base44.asServiceRole.entities.Payment.filter({ status: 'pending' });
      if (pendingPayments.length > 0) {
        // Sort by created_date desc
        pendingPayments.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
        email = (pendingPayments[0].email || '').toLowerCase().trim();
        console.log('Webhook: found email from most recent pending payment:', email);
      }
    }

    if (!email) {
      console.error('Webhook: could not find email');
      await base44.asServiceRole.entities.WebhookLog.update(existingLogs.length > 0 ? existingLogs[0].id : deliveryId, { processed: true });
      return Response.json({ status: 'ok', warning: 'no email found' }, { status: 200 });
    }

    // Update payment status
    if (reference) {
      const payments = await base44.asServiceRole.entities.Payment.filter({ reference });
      if (payments.length > 0) {
        await base44.asServiceRole.entities.Payment.update(payments[0].id, {
          status: 'confirmed',
          transaction_id: data.transaction_id || data.id || '',
          payment_method: data.payment_method || data.method || '',
          provider: data.provider || 'geniuspay',
          paid_at: new Date().toISOString()
        });
      }
    }

    // Set premium access
    const profiles = await base44.asServiceRole.entities.UserProfile.filter({ email });
    if (profiles.length > 0) {
      await base44.asServiceRole.entities.UserProfile.update(profiles[0].id, {
        has_global_access: true,
        paid_at: new Date().toISOString(),
        payment_ref: reference,
        transaction_id: data.transaction_id || data.id || '',
        payment_method: data.payment_method || data.method || '',
        provider: data.provider || 'geniuspay',
        amount: 2000
      });
    } else {
      await base44.asServiceRole.entities.UserProfile.create({
        email,
        has_global_access: true,
        paid_at: new Date().toISOString(),
        payment_ref: reference,
        transaction_id: data.transaction_id || data.id || '',
        payment_method: data.payment_method || data.method || '',
        provider: data.provider || 'geniuspay',
        amount: 2000,
        total_analyses: 0
      });
    }

    // Créer aussi un Payment confirmé si il n'existe pas
    try {
      const existingPayments = await base44.asServiceRole.entities.Payment.filter({ 
        email: email,
        status: 'confirmed'
      });

      if (existingPayments?.length === 0) {
        await base44.asServiceRole.entities.Payment.create({
          email: email,
          reference: reference,
          status: 'confirmed',
          transaction_id: data.transaction_id || data.id || '',
          payment_method: data.payment_method || '',
          provider: 'geniuspay',
          amount: 2000,
          paid_at: new Date().toISOString(),
        });
        console.log('[webhook] ✅ Payment record créé pour:', email);
      }
    } catch (err) {
      console.error('[webhook] Erreur création Payment:', err.message);
    }

    // ✅ Marquer les analyses temporaires de cet utilisateur comme PAYÉES
    try {
      const pendingAnalyses = await base44.asServiceRole.entities.SkinAnalysis.filter({ 
        user_email: email,
        payment_pending: true,
        analysis_complete: true
      });
      
      for (const analysis of pendingAnalyses) {
        await base44.asServiceRole.entities.SkinAnalysis.update(analysis.id, {
          payment_pending: false
        });
      }
      
      if (pendingAnalyses.length > 0) {
        console.log(`Webhook: ${pendingAnalyses.length} analyses marquées comme payées pour ${email}`);
      }
    } catch (err) {
      console.error('[webhook] Erreur update analyses:', err.message);
    }

    console.log('Webhook: premium activated for', email);
    return Response.json({ status: 'ok', premium_activated: true }, { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error.message);
    return Response.json({ status: 'ok', error: error.message }, { status: 200 });
  }
});