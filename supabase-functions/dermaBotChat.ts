import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const SYSTEM = `Tu es DermaBot, coach dermatologique IA de DermaCI, expert en peaux africaines et contexte ivoirien. Tu parles uniquement en francais. Tu es chaleureux et professionnel. Tu donnes des conseils personnalises sur les soins de peau adaptes au climat tropical ivoirien (UV 8-12, humidite 70-90%), aux phototypes IV-VI, aux produits et aliments locaux ivoiriens. Tu ne remplaces jamais un dermatologue et tu ne prescris pas de medicaments. Tes reponses sont concises et essentielles, 2 paragraphes max, avec des emojis avec moderation, idéalement pas d'emojis si ce n'est pas nécessaire. Tu termines souvent par une question et tu reponds surtout en fonction du message qui t'est envoyé, pas de réponses génériques.`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const body = await req.json().catch(() => ({}));
    const { message, history, analysis_id } = body;
    if (!message) return Response.json({ error: 'message requis' }, { status: 400, headers: corsHeaders });

    const deviceId = (typeof body.device_id === 'string' && body.device_id.length > 5) ? body.device_id.slice(0, 100) : null;
    const userEmail = (typeof body.user_email === 'string') ? body.user_email.toLowerCase().trim() : '';
    const isPremiumHint = body.is_premium === true;
    const localPass = (typeof body.local_pass === 'string' && ['essentiel','pro','premium'].includes(body.local_pass)) ? body.local_pass : null;

    // ── LIMITE DERMABOT : verifier le quota selon le pass (AVANT d'appeler Claude) ──
    // Regles (messages/30j) : gratuit 0, decouverte 5, essentiel 30, pro 100, premium 150.
    const PASS_BOT: Record<string, number> = { gratuit: 0, decouverte: 5, essentiel: 30, pro: 100, premium: 150 };
    const WINDOW_MS = 30 * 24 * 60 * 60 * 1000;
    const sinceISO = new Date(Date.now() - WINDOW_MS).toISOString();

    // Determiner le pass
    let pass = 'gratuit';
    try {
      if (userEmail && !userEmail.startsWith('anon_')) {
        const { data: prof } = await supabase.from('UserProfile').select('has_global_access, pass_type, pass_expires_at').eq('email', userEmail).limit(1);
        if (prof && prof[0]) {
          if (prof[0].pass_type && prof[0].pass_type !== 'gratuit' && prof[0].pass_type !== 'decouverte' && prof[0].pass_expires_at && new Date(prof[0].pass_expires_at).getTime() > Date.now()) {
            pass = prof[0].pass_type;
          } else if (prof[0].has_global_access === true) {
            pass = 'decouverte';
          }
        }
      }
      if (pass === 'gratuit' && deviceId) {
        const { data: passPay } = await supabase.from('Payment').select('pass_type, created_date').eq('device_id', deviceId).eq('status', 'confirmed').not('pass_type', 'is', null).order('created_date', { ascending: false }).limit(1);
        if (passPay && passPay[0] && passPay[0].pass_type && (new Date(passPay[0].created_date).getTime() + WINDOW_MS) > Date.now()) {
          pass = passPay[0].pass_type;
        } else {
          const { data: paid } = await supabase.from('Payment').select('id').eq('device_id', deviceId).eq('status', 'confirmed').limit(1);
          if (paid && paid.length > 0) pass = 'decouverte';
        }
      }
    } catch {}
    // Pass local (apres paiement, sans webhook) : on prend le meilleur
    if (localPass) {
      const rank: Record<string, number> = { gratuit: 0, decouverte: 1, essentiel: 2, pro: 3, premium: 4 };
      if ((rank[localPass] || 0) > (rank[pass] || 0)) pass = localPass;
    }
    if (pass === 'gratuit' && isPremiumHint) pass = 'decouverte';

    const botLimit = PASS_BOT[pass] ?? 0;

    // Compter les messages des 30 derniers jours pour ce device
    let used = 0;
    if (deviceId) {
      try {
        const { data: usage } = await supabase.from('DermaBotUsage').select('id').eq('device_id', deviceId).gte('created_date', sinceISO);
        used = usage ? usage.length : 0;
      } catch {}
    }

    if (used >= botLimit) {
      return Response.json({
        response: null,
        limit_reached: true,
        pass,
        message: pass === 'gratuit'
          ? "Le DermaBot fait partie de l'offre premium. Débloque ton accès pour discuter avec ton coach peau. 🌿"
          : "Tu as utilisé tous tes messages DermaBot ce mois-ci. Passe à un forfait supérieur pour continuer. 🌿"
      }, { headers: corsHeaders });
    }
    // Enregistrer ce message (pour le comptage)
    if (deviceId) {
      try { await supabase.from('DermaBotUsage').insert({ device_id: deviceId, user_email: userEmail || null }); } catch {}
    }

    // Contexte de la derniere analyse si disponible
    let context = '';
    if (analysis_id) {
      try {
        const { data: a } = await supabase.from('SkinAnalysis').select('*').eq('id', analysis_id).single();
        if (a) {
          context = `\n=== DONNEES REELLES DU PATIENT ===\nScore:${a.score}/100. Type:${a.skin_type}. Problemes:${(a.problems||[]).map((p:any)=>p.name).join(', ')}. Actifs recommandes:${(a.actifs||[]).map((x:any)=>x.name).join(', ')}.\nUtilise EXCLUSIVEMENT ces donnees pour personnaliser.`;
        }
      } catch {}
    }

    const msgs = [];
    const hist = Array.isArray(history) ? history.slice(-6) : [];
    for (const h of hist) {
      if (h && h.role && h.content) msgs.push({ role: h.role === 'assistant' ? 'assistant' : 'user', content: String(h.content) });
    }
    msgs.push({ role: 'user', content: String(message) });

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': Deno.env.get('ANTHROPIC_API_KEY')!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 1024,
        system: SYSTEM + context,
        messages: msgs,
      }),
    });
    const data = await res.json();
    const response = data?.content?.[0]?.text || "Pouvez-vous reformuler ? 🌿";

    return Response.json({ response, sources: [], usedWebSearch: false }, { headers: corsHeaders });
  } catch (err) {
    return Response.json({ response: "Je rencontre une difficulte technique. Reessayez dans un instant. 🌿", error: err.message }, { headers: corsHeaders });
  }
});
