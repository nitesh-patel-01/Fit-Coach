// modules/storage.js
// LocalStorage wrapper with JSON serialization, namespace prefix, and import/export support.

const PREFIX = 'fitcoach_';

export const Store = {
  get(key, fallback = null) {
    try {
      const v = localStorage.getItem(PREFIX + key);
      return v === null ? fallback : JSON.parse(v);
    } catch (e) {
      console.warn('[Store.get]', key, e);
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.warn('[Store.set]', key, e);
      return false;
    }
  },
  remove(key) {
    localStorage.removeItem(PREFIX + key);
  },
  clearAll() {
    Object.keys(localStorage)
      .filter(k => k.startsWith(PREFIX))
      .forEach(k => localStorage.removeItem(k));
  },
  // Export ALL fitcoach_* keys to a plain object (for backup)
  exportAll() {
    const data = {};
    Object.keys(localStorage)
      .filter(k => k.startsWith(PREFIX))
      .forEach(k => {
        try { data[k.slice(PREFIX.length)] = JSON.parse(localStorage.getItem(k)); }
        catch { data[k.slice(PREFIX.length)] = localStorage.getItem(k); }
      });
    return data;
  },
  // Restore from a plain object
  importAll(data) {
    if (!data || typeof data !== 'object') return false;
    Object.entries(data).forEach(([k, v]) => {
      try { localStorage.setItem(PREFIX + k, JSON.stringify(v)); }
      catch (e) { console.warn('[Store.importAll]', k, e); }
    });
    return true;
  },
};
