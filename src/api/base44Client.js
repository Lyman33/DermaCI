// ───────────────────────────────────────────────────────────────────────────
//  DermaCI — Pont de compatibilité Supabase
//  Remplace l'ancien SDK Base44. Garde EXACTEMENT la même interface `base44`
//  pour que tous les fichiers de l'app continuent de fonctionner sans changement.
// ───────────────────────────────────────────────────────────────────────────
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const STORAGE_BUCKET = 'photos';
const EMAIL_KEY = 'dermaci_device_email';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
});

// ── Helpers email local (remplace l'auth Base44) ────────────────────────────
function getEmail() {
  try { return localStorage.getItem(EMAIL_KEY) || ''; } catch { return ''; }
}
function setEmail(email) {
  try { if (email) localStorage.setItem(EMAIL_KEY, String(email).toLowerCase().trim()); } catch {}
}
function clearEmail() {
  try { localStorage.removeItem(EMAIL_KEY); } catch {}
}

// ── functions.invoke → Supabase Edge Functions ──────────────────────────────
async function invoke(name, payload = {}) {
  let res;
  try {
    res = await fetch(`${SUPABASE_URL}/functions/v1/${name}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(payload || {}),
    });
  } catch (networkErr) {
    const e = new Error('Network error');
    e.status = 0; e.data = { error: 'network' };
    throw e;
  }

  let body = null;
  try { body = await res.json(); } catch { body = null; }

  if (!res.ok) {
    const e = new Error((body && (body.error || body.message)) || `Request failed with status code ${res.status}`);
    e.status = res.status;
    e.data = body || { error: { code: String(res.status), message: 'error' } };
    throw e;
  }
  // L'ancien SDK renvoyait un objet axios-like { data: <corps> }
  return { data: body, status: res.status };
}

// ── entities.<Table>.<méthode> → Supabase Postgres ──────────────────────────
function makeEntity(table) {
  return {
    async filter(query = {}, sort) {
      let q = supabase.from(table).select('*');
      for (const [k, v] of Object.entries(query || {})) q = q.eq(k, v);
      if (typeof sort === 'string' && sort) {
        const desc = sort.startsWith('-');
        q = q.order(desc ? sort.slice(1) : sort, { ascending: !desc });
      }
      const { data, error } = await q;
      if (error) throw new Error(error.message);
      return data || [];
    },
    async list(sort, limit) {
      let q = supabase.from(table).select('*');
      if (typeof sort === 'string' && sort) {
        const desc = sort.startsWith('-');
        q = q.order(desc ? sort.slice(1) : sort, { ascending: !desc });
      }
      if (limit) q = q.limit(limit);
      const { data, error } = await q;
      if (error) throw new Error(error.message);
      return data || [];
    },
    async get(id) {
      const { data, error } = await supabase.from(table).select('*').eq('id', id).single();
      if (error) throw new Error(error.message);
      return data;
    },
    async create(obj) {
      const { data, error } = await supabase.from(table).insert(obj).select().single();
      if (error) throw new Error(error.message);
      return data;
    },
    async update(id, obj) {
      const { data, error } = await supabase.from(table).update(obj).eq('id', id).select().single();
      if (error) throw new Error(error.message);
      return data;
    },
    async delete(id) {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw new Error(error.message);
      return { id, deleted: true };
    },
  };
}

// ── auth → email local (plus de backend Base44) ─────────────────────────────
const auth = {
  async me() {
    const email = getEmail();
    if (!email) { const e = new Error('Not authenticated'); e.status = 401; throw e; }
    return { id: email, email, full_name: email.split('@')[0] };
  },
  async isAuthenticated() {
    return !!getEmail();
  },
  async loginViaEmailPassword(email /*, password */) {
    setEmail(email);
    return { id: email, email };
  },
  async register({ email /*, password */ } = {}) {
    setEmail(email);
    return { id: email, email };
  },
  async verifyOtp(email /*, otp */) {
    if (email) setEmail(email);
    return { id: getEmail(), email: getEmail() };
  },
  async resendOtp(/* email */) {
    return { sent: true };
  },
  async verifyMagicLink(/* { token } */) {
    return { ok: true };
  },
  logout(redirectUrl) {
    clearEmail();
    if (redirectUrl && typeof window !== 'undefined') {
      window.location.href = typeof redirectUrl === 'string' ? redirectUrl : '/';
    }
  },
};

// ── integrations.Core.UploadFile → Supabase Storage ─────────────────────────
const integrations = {
  Core: {
    async UploadFile({ file }) {
      const ext = (file?.name?.split('.').pop() || 'jpg').toLowerCase();
      const path = `uploads/${Date.now()}_${Math.random().toString(36).slice(2, 9)}.${ext}`;
      const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(path, file, { contentType: file?.type || 'image/jpeg', upsert: false });
      if (error) throw new Error(error.message);
      const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
      return { file_url: data.publicUrl, url: data.publicUrl, public_url: data.publicUrl };
    },
  },
};

// ── Objet base44 exporté (même forme que l'ancien SDK) ───────────────────────
export const base44 = {
  functions: { invoke },
  entities: {
    SkinAnalysis: makeEntity('SkinAnalysis'),
    UserProfile: makeEntity('UserProfile'),
    Payment: makeEntity('Payment'),
    WebhookLog: makeEntity('WebhookLog'),
  },
  auth,
  integrations,
};

export default base44;
