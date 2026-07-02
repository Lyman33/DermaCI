// ═══════════════════════════════════════════════════════════════════════════
//  DermaCI — checkAccess  (BLOC B : le cœur du système de Pass)
//  Source de vérité UNIQUE pour : quel pass, combien d'analyses/messages restants,
//  quand la limite se débloque. N'appelle JAMAIS Claude. Lit seulement la base.
//
//  Body: { device_id, user_email?, is_premium?, kind: 'analysis' | 'dermabot' }
//  Renvoie:
//   { allowed:true, pass, used, limit, remaining, resets_at?, dermabot_* }
//   { allowed:false, reason:'free_limit_reached'|'pass_limit_reached', pass, resets_at, ... }
// ═══════════════════════════════════════════════════════════════════════════
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// ── Définition des PASS (analyses/mois + messages DermaBot/mois) ──────────────
// 'illimite' DermaBot Premium = plafond cache anti-ruine (affiche "illimite").
const PASS_RULES: Record<string, { analyses: number; dermabot: number }> = {
  gratuit:    { analyses: 1,  dermabot: 0   },   // n'a jamais paye (1 a vie, gere a part)
  decouverte: { analyses: 5,  dermabot: 5   },   // 2000 FCFA : 5 analyses/mois a vie
  essentiel:  { analyses: 25, dermabot: 30  },   // 3000 FCFA/mois (10 + 15)
  pro:        { analyses: 40, dermabot: 100 },   // 5000 FCFA/mois (10 + 30)
  premium:    { analyses: 70, dermabot: 150 },   // 10000 FCFA/mois (10 + 60), affiche "illimite"
};
const WINDOW_MS = 30 * 24 * 60 * 60 * 1000; // 30 jours glissants

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  let body: any = {};
  try { body = await req.json(); } catch { body = {}; }

  const deviceId = (typeof body.device_id === 'string' && body.device_id.length > 5) ? body.device_id.slice(0, 100) : null;
  const userEmail = (typeof body.user_email === 'string') ? body.user_email.toLowerCase().trim() : '';
  const premiumHint = body.is_premium === true;
  const localPass = (typeof body.local_pass === 'string' && ['essentiel','pro','premium'].includes(body.local_pass)) ? body.local_pass : null;
  const kind = body.kind === 'dermabot' ? 'dermabot' : 'analysis';
  const sinceISO = new Date(Date.now() - WINDOW_MS).toISOString();

  // ── 1) Déterminer le PASS effectif de l'utilisateur ────────────────────────
  // Priorité : pass payant non expiré > découverte (a paye 2000) > gratuit.
  let pass = 'gratuit';
  let hasPaid2000 = false;
  let passExpiresAt: string | null = null;

  try {
    // a) Profil par email (si connu et non anonyme)
    if (userEmail && !userEmail.startsWith('anon_')) {
      const { data: prof } = await supabase
        .from('UserProfile')
        .select('has_global_access, pass_type, pass_expires_at')
        .eq('email', userEmail).limit(1);
      if (prof && prof[0]) {
        if (prof[0].has_global_access === true) hasPaid2000 = true;
        if (prof[0].pass_type && prof[0].pass_type !== 'gratuit' && prof[0].pass_type !== 'decouverte') {
          // Pass payant : valide seulement si non expiré
          if (prof[0].pass_expires_at && new Date(prof[0].pass_expires_at).getTime() > Date.now()) {
            pass = prof[0].pass_type;
            passExpiresAt = prof[0].pass_expires_at;
          }
        }
      }
    }
    // b) Paiement 2000 confirmé rattaché au device (découverte à vie)
    if (!hasPaid2000 && deviceId) {
      const { data: paid } = await supabase
        .from('Payment')
        .select('id').eq('device_id', deviceId).eq('status', 'confirmed').limit(1);
      if (paid && paid.length > 0) hasPaid2000 = true;
    }
    // c) Pass payant rattaché au device (si pas déjà trouvé par email)
    if (pass === 'gratuit' && deviceId) {
      const { data: passPay } = await supabase
        .from('Payment')
        .select('pass_type, created_date')
        .eq('device_id', deviceId).eq('status', 'confirmed')
        .not('pass_type', 'is', null)
        .order('created_date', { ascending: false }).limit(1);
      if (passPay && passPay[0] && passPay[0].pass_type) {
        const expMs = new Date(passPay[0].created_date).getTime() + WINDOW_MS;
        if (expMs > Date.now() && PASS_RULES[passPay[0].pass_type]) {
          pass = passPay[0].pass_type;
          passExpiresAt = new Date(expMs).toISOString();
        }
      }
    }
  } catch (_) {}

  // Pass local (stocke par premium-success apres paiement) : source de confiance
  // car les liens GeniusPay n'ont pas de webhook -> la table Payment peut etre vide.
  // On prend le MEILLEUR pass entre celui trouve en base et celui du localStorage.
  if (localPass) {
    const rank = { gratuit: 0, decouverte: 1, essentiel: 2, pro: 3, premium: 4 };
    if ((rank[localPass] || 0) > (rank[pass] || 0)) {
      pass = localPass;
    }
  }

  // Si pas de pass payant mais a payé 2000 (ou hint) -> découverte
  if (pass === 'gratuit' && (hasPaid2000 || premiumHint)) pass = 'decouverte';

  const rules = PASS_RULES[pass] || PASS_RULES.gratuit;

  // ── 2) GRATUIT : 1 analyse à vie (logique simple, pas de fenêtre) ───────────
  if (pass === 'gratuit') {
    if (kind === 'dermabot') {
      return Response.json({ allowed: false, reason: 'free_limit_reached', pass, dermabot_limit: 0 }, { headers: corsHeaders });
    }
    // analyse : bloque si déjà 1 analyse complète sur ce device
    if (deviceId) {
      try {
        const { data: done } = await supabase
          .from('SkinAnalysis').select('id')
          .eq('device_id', deviceId).eq('analysis_complete', true).limit(1);
        if (done && done.length >= 1) {
          return Response.json({ allowed: false, reason: 'free_limit_reached', pass }, { headers: corsHeaders });
        }
      } catch (_) {}
    }
    return Response.json({ allowed: true, pass, limit: 1, remaining: 1 }, { headers: corsHeaders });
  }

  // ── 3) PASS payants + découverte : fenêtre glissante 30j ────────────────────
  if (kind === 'dermabot') {
    // Compter les messages DermaBot des 30 derniers jours
    let used = 0;
    try {
      const { data: msgs } = await supabase
        .from('DermaBotUsage').select('id', { count: 'exact' })
        .eq('device_id', deviceId).gte('created_date', sinceISO);
      used = msgs ? msgs.length : 0;
    } catch (_) {}
    const limit = rules.dermabot;
    if (used >= limit) {
      return Response.json({ allowed: false, reason: 'dermabot_limit_reached', pass, used, limit, dermabot_limit: limit }, { headers: corsHeaders });
    }
    return Response.json({ allowed: true, pass, used, limit, remaining: Math.max(0, limit - used), dermabot_limit: limit }, { headers: corsHeaders });
  }

  // kind === 'analysis' : compter les analyses des 30 derniers jours
  let used = 0;
  let oldestInWindow: string | null = null;
  try {
    const { data: analyses } = await supabase
      .from('SkinAnalysis').select('created_date')
      .eq('device_id', deviceId).eq('analysis_complete', true)
      .gte('created_date', sinceISO)
      .order('created_date', { ascending: true });
    if (analyses) {
      used = analyses.length;
      if (analyses[0]) oldestInWindow = analyses[0].created_date;
    }
  } catch (_) {}

  const limit = rules.analyses;
  if (used >= limit) {
    // resets_at = date de la plus ancienne analyse de la fenêtre + 30j
    const resetsAt = oldestInWindow ? new Date(new Date(oldestInWindow).getTime() + WINDOW_MS).toISOString() : null;
    return Response.json({
      allowed: false, reason: 'pass_limit_reached',
      pass, used, limit, resets_at: resetsAt, pass_expires_at: passExpiresAt,
    }, { headers: corsHeaders });
  }

  return Response.json({
    allowed: true, pass, used, limit, remaining: Math.max(0, limit - used), pass_expires_at: passExpiresAt,
  }, { headers: corsHeaders });
});
