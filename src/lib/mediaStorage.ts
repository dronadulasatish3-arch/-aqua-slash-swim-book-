import { CONFIG } from '../config';
import { DEFAULT_SWIM_VIDEOS } from '../data/swimVideoSeedData';
import type { MediaItem } from '../components/SwimVideoDashboard';

const DB_NAME = 'SwimLibraryCloudCache_v2';
const LOCAL_STORAGE_MEDIA_KEY = 'AQUA_SLASH_CUSTOM_MEDIA';
const DELETED_IDS_KEY = 'SWIM_LIB_DELETED_IDS';

/**
 * Open IndexedDB for offline video & photo caching
 */
export function openLocalDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      return reject(new Error('IndexedDB not supported in this environment'));
    }
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = (e: any) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('media')) {
        db.createObjectStore('media', { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Save single media item to IndexedDB
 */
export async function saveToLocalDB(item: MediaItem): Promise<void> {
  try {
    const db = await openLocalDB();
    return new Promise((resolve) => {
      const tx = db.transaction('media', 'readwrite');
      tx.objectStore('media').put(item);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch (e) {
    console.warn('IndexedDB write warning:', e);
  }
}

/**
 * Get all media items stored in IndexedDB
 */
export async function getAllFromLocalDB(): Promise<MediaItem[]> {
  try {
    const db = await openLocalDB();
    return new Promise((resolve) => {
      const tx = db.transaction('media', 'readonly');
      const req = tx.objectStore('media').getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  } catch (e) {
    console.warn('IndexedDB read warning:', e);
    return [];
  }
}

/**
 * Delete a media item from IndexedDB
 */
export async function deleteFromLocalDB(id: string): Promise<void> {
  try {
    const db = await openLocalDB();
    return new Promise((resolve) => {
      const tx = db.transaction('media', 'readwrite');
      tx.objectStore('media').delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch (e) {
    console.warn('IndexedDB delete warning:', e);
  }
}

/**
 * Read list of deleted media IDs
 */
export function getDeletedIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem(DELETED_IDS_KEY) || '[]');
  } catch {
    return [];
  }
}

/**
 * Mark a media ID as deleted permanently
 */
export function markDeletedId(id: string): void {
  try {
    const list = getDeletedIds();
    if (!list.includes(id)) {
      list.push(id);
      localStorage.setItem(DELETED_IDS_KEY, JSON.stringify(list));
    }
  } catch (e) {
    console.warn('Failed to save deleted ID:', e);
  }
}

/**
 * Clear a deleted ID when re-added or restored
 */
export function unmarkDeletedId(id: string): void {
  try {
    const list = getDeletedIds().filter((d) => d !== id);
    localStorage.setItem(DELETED_IDS_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn('Failed to unmark deleted ID:', e);
  }
}

/**
 * Read custom media items from localStorage
 */
export function getLocalStorageMedia(): MediaItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_MEDIA_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Write custom media items to localStorage
 */
export function saveLocalStorageMedia(items: MediaItem[]): void {
  try {
    // Only store metadata or lightweight data to prevent quota crashes
    const sanitized = items.map((it) => {
      if (it.localDataUrl && it.localDataUrl.length > 50000) {
        const { localDataUrl, ...rest } = it;
        return rest;
      }
      return it;
    });
    localStorage.setItem(LOCAL_STORAGE_MEDIA_KEY, JSON.stringify(sanitized));
  } catch (e) {
    console.warn('LocalStorage media quota warning:', e);
  }
}

/**
 * Notify all components in real-time that the media repository has been updated
 */
function emitMediaSyncEvent(item?: MediaItem) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('aquaslash:media-sync', { detail: item }));
  }
}

/**
 * Subscribe to real-time media updates across tabs and components
 */
export function subscribeMediaUpdates(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handler = () => callback();
  window.addEventListener('aquaslash:media-sync', handler);
  window.addEventListener('storage', (e) => {
    if (e.key === LOCAL_STORAGE_MEDIA_KEY || e.key === DELETED_IDS_KEY) {
      callback();
    }
  });

  return () => {
    window.removeEventListener('aquaslash:media-sync', handler);
  };
}

/**
 * Save or update a media item in all storage layers:
 * 1. IndexedDB (primary local storage for files, videos, data URLs)
 * 2. LocalStorage (instant synchronous cross-component mirror)
 * 3. Google Apps Script Backend (cloud sync with Google Drive upload)
 */
export async function saveMediaItem(item: MediaItem, appsScriptUrl?: string): Promise<void> {
  const urlToUse = appsScriptUrl || CONFIG.API_URL;

  // Unmark if previously deleted
  unmarkDeletedId(item.id);

  // 1. Save to local IndexedDB
  await saveToLocalDB(item);

  // 2. Save / update in localStorage
  const currentLocal = getLocalStorageMedia().filter((it) => it.id !== item.id);
  currentLocal.unshift(item);
  saveLocalStorageMedia(currentLocal);

  // 3. Emit real-time sync event so MyVideosSection and SwimVideoDashboard update immediately
  emitMediaSyncEvent(item);

  // 4. Dispatch cloud sync to Google Sheets backend (without blocking UI)
  if (urlToUse) {
    try {
      const payload: Record<string, unknown> = {
        action: 'SAVE_MEDIA',
        id: item.id,
        title: item.title,
        category: item.category,
        access: item.access || 'Public',
        type: item.type || 'video',
        driveViewUrl: item.driveViewUrl || item.directUrl || item.previewUrl || item.url || '',
        url: item.driveViewUrl || item.directUrl || item.previewUrl || item.url || '',
        description: item.description || '',
        swimmingLevel: item.swimmingLevel || 'All Levels',
        assignedStudentIds: item.assignedStudentIds || [],
        assignedTo: item.assignedTo || item.assignedStudentNames?.join(', ') || '',
        fileName: item.fileName || '',
        mimeType: item.mimeType || '',
      };

      // If file has base64 data under 15MB, upload directly to Google Drive via backend
      if (item.localDataUrl && item.localDataUrl.startsWith('data:') && item.localDataUrl.length < 15000000) {
        payload.base64Data = item.localDataUrl;
      }

      fetch(urlToUse, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
      })
        .then((r) => r.json())
        .then((res) => {
          if (res && res.item && res.item.driveViewUrl) {
            const updated: MediaItem = {
              ...item,
              driveViewUrl: res.item.driveViewUrl,
              url: res.item.driveViewUrl,
              previewUrl: res.item.driveViewUrl,
              directUrl: res.item.driveViewUrl,
            };
            saveToLocalDB(updated);
          }
        })
        .catch((err) => {
          console.warn('Backend SAVE_MEDIA fetch warning:', err);
        });
    } catch (e) {
      console.warn('Cloud sync error:', e);
    }
  }
}

/**
 * Delete a media item across all storage layers
 */
export async function deleteMediaItem(id: string, appsScriptUrl?: string): Promise<void> {
  const urlToUse = appsScriptUrl || CONFIG.API_URL;

  // 1. Remove from IndexedDB
  await deleteFromLocalDB(id);

  // 2. Remove from LocalStorage
  const remaining = getLocalStorageMedia().filter((it) => it.id !== id);
  saveLocalStorageMedia(remaining);

  // 3. Mark as deleted locally
  markDeletedId(id);

  // 4. Emit event
  emitMediaSyncEvent();

  // 5. Delete on backend
  if (urlToUse) {
    try {
      fetch(urlToUse, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'DELETE_MEDIA', id }),
      }).catch(() => {});
    } catch {
      /* silent */
    }
  }
}

/**
 * Filter out unwanted pure-number auto-sync items
 */
export function isUnwantedDuplicate(item: MediaItem): boolean {
  const titleTrimmed = item.title?.trim() || '';
  const isPureNumber = /^\d+$/.test(titleTrimmed);
  const isAutoSyncDesc = item.description === 'Synced from Google Drive folder';
  return isPureNumber || isAutoSyncDesc;
}

/**
 * Synchronize any locally created / cached items up to the Google Apps Script backend
 */
export async function syncLocalMediaToCloud(appsScriptUrl?: string): Promise<{ synced: number }> {
  const urlToUse = appsScriptUrl || CONFIG.API_URL;
  if (!urlToUse) return { synced: 0 };

  try {
    const localDbItems = await getAllFromLocalDB();
    const localStorageItems = getLocalStorageMedia();
    const map = new Map<string, MediaItem>();

    localDbItems.forEach((it) => {
      if (it.id && !isUnwantedDuplicate(it)) map.set(it.id, it);
    });
    localStorageItems.forEach((it) => {
      if (it.id && !isUnwantedDuplicate(it) && !map.has(it.id)) map.set(it.id, it);
    });

    const itemsToSync = Array.from(map.values()).map((it) => ({
      id: it.id,
      title: it.title,
      category: it.category,
      access: it.access || 'Public',
      type: it.type || 'video',
      driveViewUrl: it.driveViewUrl || it.directUrl || it.previewUrl || it.url || '',
      url: it.driveViewUrl || it.directUrl || it.previewUrl || it.url || '',
      description: it.description || '',
      swimmingLevel: it.swimmingLevel || 'All Levels',
      assignedStudentIds: it.assignedStudentIds || [],
      assignedTo: it.assignedTo || it.assignedStudentNames?.join(', ') || '',
    }));

    if (itemsToSync.length === 0) return { synced: 0 };

    await fetch(urlToUse, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'SYNC_MEDIA_BATCH',
        items: itemsToSync,
      }),
    });

    return { synced: itemsToSync.length };
  } catch (err) {
    console.warn('Sync local media to cloud warning:', err);
    return { synced: 0 };
  }
}

/**
 * Load all media from all sources:
 * - Google Apps Script / Google Sheets Cloud Backend (Authoritative Source of Truth)
 * - IndexedDB
 * - LocalStorage
 * - Curated Seed Videos (DEFAULT_SWIM_VIDEOS)
 */
export async function loadAllMedia(options?: {
  appsScriptUrl?: string;
  studentId?: string;
  role?: string;
  email?: string;
}): Promise<MediaItem[]> {
  const urlToUse = options?.appsScriptUrl || CONFIG.API_URL;
  const deletedSet = new Set(getDeletedIds());
  const map = new Map<string, MediaItem>();

  // 1. Seed videos (initial base)
  (DEFAULT_SWIM_VIDEOS as MediaItem[]).forEach((it) => {
    if (!deletedSet.has(it.id) && !isUnwantedDuplicate(it)) {
      map.set(it.id, it);
    }
  });

  // 2. LocalStorage items
  getLocalStorageMedia().forEach((it) => {
    if (!deletedSet.has(it.id) && !isUnwantedDuplicate(it)) {
      map.set(it.id, it);
    }
  });

  // 3. IndexedDB items (highest local priority for videos/photos with localDataUrl)
  try {
    const dbItems = await getAllFromLocalDB();
    dbItems.forEach((it) => {
      if (!deletedSet.has(it.id) && !isUnwantedDuplicate(it)) {
        map.set(it.id, it);
      }
    });
  } catch (e) {
    console.warn('Failed to load from IndexedDB', e);
  }

  // 4. Authoritative Cloud Backend (Google Apps Script Web App)
  if (urlToUse) {
    try {
      const payload: Record<string, unknown> = {
        action: 'LIST_MEDIA',
        studentId: options?.studentId || '',
        role: options?.role || 'STUDENT',
        email: options?.email || '',
      };

      const res = await fetch(urlToUse, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data && data.items && Array.isArray(data.items)) {
        data.items.forEach((it: MediaItem) => {
          if (!isUnwantedDuplicate(it)) {
            const existing = map.get(it.id);
            // Cloud items override local cache with authoritative server metadata
            const itemUrl = it.driveViewUrl || it.url || it.directUrl || it.previewUrl || '';
            map.set(it.id, {
              ...it,
              driveViewUrl: itemUrl,
              url: itemUrl,
              previewUrl: it.previewUrl || itemUrl,
              directUrl: it.directUrl || itemUrl,
              source: it.source || 'drive',
              localDataUrl: existing?.localDataUrl || it.localDataUrl,
            });
          }
        });
      }
    } catch (err) {
      console.warn('Cloud media sync offline; using cached & local videos:', err);
    }
  }

  return Array.from(map.values());
}
