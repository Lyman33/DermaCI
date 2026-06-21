import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user?.role || user.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    // Récupérer les clés depuis l'env (à configurer dans Base44 Settings)
    const apiKeyPublic = Deno.env.get('GENIUSPAY_API_KEY_PUBLIC');  // pk_live_...
    const apiKeySecret = Deno.env.get('GENIUSPAY_API_KEY_SECRET');  // sk_live_...

    if (!apiKeyPublic || !apiKeySecret) {
      return Response.json(
        { error: 'Les variables GENIUSPAY_API_KEY_PUBLIC et GENIUSPAY_API_KEY_SECRET ne sont pas configurées' },
        { status: 500 }
      );
    }

    // Référence de test (à adapter si tu as une vraie référence)
    const reference = 'MTX-A1B2C3D4E5'; // Exemple - remplace par une vraie si possible

    const results = {
      test_date: new Date().toISOString(),
      reference: reference,
      test_1: null,
      test_2: null,
      conclusion: null
    };

    // ========================================
    // TEST 1 : Avec X-API-Key uniquement
    // ========================================
    console.log('[Test 1] GET avec X-API-Key uniquement...');
    try {
      const res1 = await fetch(
        `https://pay.genius.ci/api/v1/merchant/payments/${reference}`,
        {
          method: 'GET',
          headers: {
            'X-API-Key': apiKeySecret,
            'Content-Type': 'application/json'
          }
        }
      );

      const data1 = await res1.text();
      const parsed1 = (() => {
        try { return JSON.parse(data1); } catch { return data1; }
      })();

      results.test_1 = {
        status: res1.status,
        statusText: res1.statusText,
        headers: Object.fromEntries(res1.headers.entries()),
        body: parsed1
      };
      console.log('[Test 1] Status:', res1.status, '→', JSON.stringify(parsed1).slice(0, 200));
    } catch (e) {
      results.test_1 = { error: e.message };
      console.error('[Test 1] Error:', e.message);
    }

    // ========================================
    // TEST 2 : Avec X-API-Key + X-API-Secret
    // ========================================
    console.log('[Test 2] GET avec X-API-Key + X-API-Secret...');
    try {
      const res2 = await fetch(
        `https://pay.genius.ci/api/v1/merchant/payments/${reference}`,
        {
          method: 'GET',
          headers: {
            'X-API-Key': apiKeySecret,
            'X-API-Secret': apiKeySecret,
            'Content-Type': 'application/json'
          }
        }
      );

      const data2 = await res2.text();
      const parsed2 = (() => {
        try { return JSON.parse(data2); } catch { return data2; }
      })();

      results.test_2 = {
        status: res2.status,
        statusText: res2.statusText,
        headers: Object.fromEntries(res2.headers.entries()),
        body: parsed2
      };
      console.log('[Test 2] Status:', res2.status, '→', JSON.stringify(parsed2).slice(0, 200));
    } catch (e) {
      results.test_2 = { error: e.message };
      console.error('[Test 2] Error:', e.message);
    }

    // Conclusion
    const test1_success = results.test_1?.status === 200;
    const test2_success = results.test_2?.status === 200;

    if (test1_success && !test2_success) {
      results.conclusion = 'Format 1 FONCTIONNE : X-API-Key uniquement (sk_live_...)';
    } else if (test2_success && !test1_success) {
      results.conclusion = 'Format 2 FONCTIONNE : X-API-Key + X-API-Secret (tous deux sk_live_...)';
    } else if (test1_success && test2_success) {
      results.conclusion = 'Les deux formats marchent. Recommandation : utiliser Test 1 (plus simple)';
    } else {
      results.conclusion = 'Aucun format n\'a fonctionné. Vérifier les clés et la référence.';
    }

    console.log('[Conclusion]', results.conclusion);
    return Response.json(results);

  } catch (err) {
    console.error('[testGeniusPayAuth] Fatal:', err.message);
    return Response.json({ error: err.message }, { status: 500 });
  }
});