const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'resolution=merge-duplicates,return=representation',
};

export async function sGet(key) {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/mc_state?key=eq.${encodeURIComponent(key)}&select=value`,
      { headers }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || data.length === 0) return null;
    return data[0].value;
  } catch (e) {
    console.warn('sGet error:', e);
    return null;
  }
}

export async function sSet(key, value) {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/mc_state`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({ key, value, updated_at: new Date().toISOString() }),
      }
    );
    if (!res.ok) {
      const err = await res.text();
      console.warn('sSet error:', err);
    }
    return res.ok;
  } catch (e) {
    console.warn('sSet error:', e);
    return false;
  }
}
