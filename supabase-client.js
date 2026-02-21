// supabase-client.js
// Wraps Supabase calls. Falls back gracefully to localStorage if Supabase not configured.
// Set SUPABASE_URL and SUPABASE_ANON_KEY in config.js (not committed to git)

// Load config — user creates this file from config.example.js
const SUPABASE_URL = window.SUPABASE_URL || null;
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || null;

let _supabase = null;

async function initSupabase() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.log('[DB] Supabase not configured — using localStorage fallback');
    return false;
  }
  try {
    // Dynamically load Supabase JS from CDN
    if (!window.supabase) {
      await loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js');
    }
    _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('[DB] Supabase connected');
    return true;
  } catch (e) {
    console.warn('[DB] Supabase init failed, using localStorage:', e);
    return false;
  }
}

function loadScript(src) {
  return new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = src; s.onload = res; s.onerror = rej;
    document.head.appendChild(s);
  });
}

// ── PROFILES ──────────────────────────────────────────────────────────────────

async function dbGetProfiles() {
  if (_supabase) {
    const { data, error } = await _supabase.from('profiles').select('*').order('created_at');
    if (!error) return data;
  }
  return lsGetProfiles();
}

async function dbSaveProfile(profile) {
  // profile: { id, name, avatar }
  if (_supabase) {
    const { data, error } = await _supabase.from('profiles').upsert(profile).select().single();
    if (!error) return data;
  }
  return lsSaveProfile(profile);
}

async function dbDeleteProfile(profileId) {
  if (_supabase) {
    await _supabase.from('profiles').delete().eq('id', profileId);
    await _supabase.from('progress').delete().eq('profile_id', profileId);
  }
  lsDeleteProfile(profileId);
}

// ── PROGRESS ──────────────────────────────────────────────────────────────────

async function dbGetProgress(profileId) {
  if (_supabase) {
    const { data, error } = await _supabase.from('progress').select('*').eq('profile_id', profileId);
    if (!error) return data; // array of { profile_id, level_id, completed, moves_used, completed_at }
  }
  return lsGetProgress(profileId);
}

async function dbSaveProgress(profileId, levelId, movesUsed) {
  const record = {
    profile_id: profileId,
    level_id: levelId,
    completed: true,
    moves_used: movesUsed,
    completed_at: new Date().toISOString(),
  };
  if (_supabase) {
    await _supabase.from('progress').upsert(record, { onConflict: 'profile_id,level_id' });
  }
  lsSaveProgress(profileId, levelId, movesUsed);
}

// ── LOCALSTORAGE FALLBACK ─────────────────────────────────────────────────────

const LS_PROFILES = 'flood_profiles';
const lsKey = (id) => `flood_progress_${id}`;

function lsGetProfiles() {
  try { return JSON.parse(localStorage.getItem(LS_PROFILES)) || []; }
  catch { return []; }
}

function lsSaveProfile(profile) {
  const profiles = lsGetProfiles();
  const idx = profiles.findIndex(p => p.id === profile.id);
  if (idx >= 0) profiles[idx] = profile; else profiles.push(profile);
  localStorage.setItem(LS_PROFILES, JSON.stringify(profiles));
  return profile;
}

function lsDeleteProfile(profileId) {
  const profiles = lsGetProfiles().filter(p => p.id !== profileId);
  localStorage.setItem(LS_PROFILES, JSON.stringify(profiles));
  localStorage.removeItem(lsKey(profileId));
}

function lsGetProgress(profileId) {
  try { return JSON.parse(localStorage.getItem(lsKey(profileId))) || []; }
  catch { return []; }
}

function lsSaveProgress(profileId, levelId, movesUsed) {
  const progress = lsGetProgress(profileId);
  const idx = progress.findIndex(p => p.level_id === levelId);
  const record = { profile_id: profileId, level_id: levelId, completed: true, moves_used: movesUsed };
  if (idx >= 0) progress[idx] = record; else progress.push(record);
  localStorage.setItem(lsKey(profileId), JSON.stringify(progress));
}
