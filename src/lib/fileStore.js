// ── File storage seam ────────────────────────────────────────────────
// Binary files (progress photos, document/receipt files) don't belong in the
// data repository or in localStorage — base64 in localStorage overflows the
// ~5 MB quota and silently drops images. This module stores blobs properly:
//
//   local mode    → IndexedDB (hundreds of MB, stores Blobs directly)
//   Supabase mode → the private 'files' bucket, served via signed URLs
//
// Same selection pattern as backend.js. Paths must start with the project id
// (`<projectId>/...`) so Supabase RLS can scope files to the project's owner.
//
// Interface (all async):
//   put(path, file)  → store/overwrite
//   getUrl(path)     → a displayable URL, or null if absent
//   remove(path)     → delete

import { supabase } from './supabaseClient.js';
import { usingSupabase } from './backend.js';

// ── local backend: IndexedDB ─────────────────────────────────────────
const DB_NAME = 'realtrack-files';
const STORE = 'files';
let dbPromise;

function openDb() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  return dbPromise;
}

// Run a write and resolve when the transaction commits.
function idbWrite(run) {
  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, 'readwrite');
        run(tx.objectStore(STORE));
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
      })
  );
}

const localFileStore = {
  put: (path, file) => idbWrite((s) => s.put(file, path)),
  remove: (path) => idbWrite((s) => s.delete(path)),
  async getUrl(path) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const req = db.transaction(STORE, 'readonly').objectStore(STORE).get(path);
      req.onsuccess = () => resolve(req.result ? URL.createObjectURL(req.result) : null);
      req.onerror = () => reject(req.error);
    });
  },
};

// ── Supabase backend: private Storage bucket ─────────────────────────
const supabaseFileStore = {
  async put(path, file) {
    const { error } = await supabase.storage.from('files').upload(path, file, { upsert: true });
    if (error) throw error;
  },
  async getUrl(path) {
    const { data, error } = await supabase.storage.from('files').createSignedUrl(path, 3600);
    if (error) return null; // not found / no access
    return data?.signedUrl || null;
  },
  async remove(path) {
    await supabase.storage.from('files').remove([path]);
  },
};

const impl = usingSupabase ? supabaseFileStore : localFileStore;

export const put = (path, file) => impl.put(path, file);
export const getUrl = (path) => impl.getUrl(path);
export const remove = (path) => impl.remove(path);

// Turn an arbitrary filename into a safe path segment.
export const safeName = (name) => (name || 'file').replace(/[^\w.\-]+/g, '_');
