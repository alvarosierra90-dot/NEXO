import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY en el entorno.');
}

// Limpia cualquier auth lock huérfano (StrictMode o tab cerrado en mal momento)
if (typeof window !== 'undefined') {
  try {
    Object.keys(window.localStorage)
      .filter(k => k.startsWith('lock:sb-'))
      .forEach(k => window.localStorage.removeItem(k));
  } catch (e) { /* ignore */ }
}

// Lock no-op para evitar que el cliente Supabase se cuelgue 5s buscando un lock
const noopLock = async (_name, _acquireTimeout, fn) => fn();

export const supabase = createClient(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    lock: noopLock,
  },
});

const snakeToCamel = (s) => s.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
const camelToSnake = (s) => s.replace(/([A-Z])/g, '_$1').toLowerCase();

export function rowToCamel(row) {
  if (!row || typeof row !== 'object' || Array.isArray(row)) return row;
  const out = {};
  for (const [k, v] of Object.entries(row)) {
    out[snakeToCamel(k)] = v;
  }
  return out;
}

export function rowToSnake(row) {
  if (!row || typeof row !== 'object' || Array.isArray(row)) return row;
  const out = {};
  for (const [k, v] of Object.entries(row)) {
    out[camelToSnake(k)] = v;
  }
  return out;
}

export function rowsToCamel(rows) {
  return (rows || []).map(rowToCamel);
}
