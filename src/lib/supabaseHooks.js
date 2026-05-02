import { useState, useEffect, useCallback } from 'react';
import { supabase, rowToCamel, rowToSnake, rowsToCamel } from './supabase.js';

export function useAuth() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    if (error) {
      console.warn('Profile fetch error:', error);
      return null;
    }
    return data ? rowToCamel(data) : null;
  }, []);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      if (!mounted) return;
      setSession(s);
      if (s?.user) {
        const p = await fetchProfile(s.user.id);
        if (mounted) setProfile(p);
        // Marcar última conexión (best-effort, ignorar error si la columna no existe aún)
        supabase.from('profiles').update({ last_seen_at: new Date().toISOString() }).eq('id', s.user.id).then(() => {});
      }
      if (mounted) setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, s) => {
      if (!mounted) return;
      setSession(s);
      if (s?.user) {
        const p = await fetchProfile(s.user.id);
        if (mounted) setProfile(p);
      } else {
        setProfile(null);
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [fetchProfile]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!session?.user) return;
    const p = await fetchProfile(session.user.id);
    setProfile(p);
  }, [session, fetchProfile]);

  const updateProfile = useCallback(async (updates) => {
    if (!session?.user) return;
    const payload = rowToSnake({ ...updates, updatedAt: new Date().toISOString() });
    const { error } = await supabase
      .from('profiles')
      .update(payload)
      .eq('id', session.user.id);
    if (!error) {
      setProfile(prev => ({ ...(prev || {}), ...updates }));
    }
    return { error };
  }, [session]);

  return { session, profile, loading, signOut, refreshProfile, updateProfile };
}

export function useSupabaseTable(tableName, options = {}) {
  const { idField = 'id', orderBy = null, enabled = true } = options;
  const [items, setItemsLocal] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setLoaded(true);
      return;
    }
    let mounted = true;
    (async () => {
      let query = supabase.from(tableName).select('*');
      if (orderBy) query = query.order(orderBy.column, { ascending: orderBy.ascending !== false });
      const { data, error } = await query;
      if (!mounted) return;
      if (error) {
        console.warn(`Error loading ${tableName}:`, error);
      }
      setItemsLocal(rowsToCamel(data || []));
      setLoaded(true);
    })();
    return () => { mounted = false; };
  }, [tableName, enabled]);

  const setItems = useCallback(async (next) => {
    const newItems = typeof next === 'function' ? next(items) : next;
    const oldById = Object.fromEntries(items.map(i => [i[idField], i]));
    const newById = Object.fromEntries(newItems.map(i => [i[idField], i]));

    const toInsert = newItems.filter(i => !oldById[i[idField]]);
    const toUpdate = newItems.filter(i => {
      const old = oldById[i[idField]];
      return old && JSON.stringify(old) !== JSON.stringify(i);
    });
    const toDelete = items.filter(i => !newById[i[idField]]);

    setItemsLocal(newItems);

    try {
      if (toDelete.length > 0) {
        const ids = toDelete.map(i => i[idField]);
        await supabase.from(tableName).delete().in(idField, ids);
      }
      if (toInsert.length > 0) {
        const payload = toInsert.map(rowToSnake);
        await supabase.from(tableName).insert(payload);
      }
      for (const item of toUpdate) {
        const payload = rowToSnake(item);
        await supabase.from(tableName).update(payload).eq(idField, item[idField]);
      }
    } catch (e) {
      console.warn(`Error syncing ${tableName}:`, e);
    }
  }, [items, tableName, idField]);

  return [items, setItems, loaded];
}
