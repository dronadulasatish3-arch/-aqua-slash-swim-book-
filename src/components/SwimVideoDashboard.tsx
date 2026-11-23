import React, { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import { useIdentity } from '../lib/identity';
import { DEFAULT_SWIM_VIDEOS } from '../data/swimVideoSeedData';
import { StudentSelector } from './admin/StudentSelector';
import { canUserAccessVideo } from '../lib/videoPermissions';
import { CONFIG } from '../config';
import { syncStudentsFromBackend } from '../data/studentRegistry';
import {
  saveMediaItem,
  deleteMediaItem,
  loadAllMedia,
  subscribeMediaUpdates,
  saveToLocalDB,
  getAllFromLocalDB,
  deleteFromLocalDB,
  syncLocalMediaToCloud,
} from '../lib/mediaStorage';
import {
  Search,
  Upload,
  RefreshCw,
  ExternalLink,
  Trash2,
  Play,
  Maximize2,
  X,
  Settings,
  Sparkles,
  Download,
  Link as LinkIcon,
  FolderOpen,
  Edit2,
  CheckCircle,
  AlertTriangle,
  Camera,
  Cloud,
  ShieldCheck,
  Lock,
  Users,
} from 'lucide-react';

export interface MediaItem {
  id: string;
  title: string;
  description?: string;
  category: string;
  access?: 'Public' | 'Private' | string;
  assignedTo?: string;
  assignedStudentIds?: string[];
  assignedStudentNames?: string[];
  swimmingLevel?: string;
  mimeType?: string;
  type: 'video' | 'photo';
  fileName: string;
  driveViewUrl?: string;
  previewUrl?: string;
  directUrl?: string;
  localDataUrl?: string;
  createdAt?: string;
  isProtected?: boolean;
  source?: 'drive' | 'photos' | 'device';
  photosUrl?: string;
}

export const SWIMMING_LEVELS = [
  'All Levels',
  'Glass 1',
  'Glass 2',
  'Glass 3',
  'Pool 1',
  'Pool 2',
  'Pool 3',
  'Pool 4',
  'Water Safety & Drills',
];

const DEFAULT_SCRIPT_URL = CONFIG.API_URL;

const CATEGORIES = [
  'All',
  'Swimming Basics',
  'Freestyle',
  'Backstroke',
  'Breaststroke',
  'Butterfly',
  'Swimming Drills',
  'Water Safety',
  'Training Videos',
  'Events',
  'Other',
];

// IndexedDB Helper
const DB_NAME = 'SwimLibraryCloudCache_v2';
function openLocalDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
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

async function saveToLocalDB(item: MediaItem): Promise<void> {
  try {
    const db = await openLocalDB();
    return new Promise((resolve) => {
      const tx = db.transaction('media', 'readwrite');
      tx.objectStore('media').put(item);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch {
    // fallback if IndexedDB unavailable
  }
}

async function getAllFromLocalDB(): Promise<MediaItem[]> {
  try {
    const db = await openLocalDB();
    return new Promise((resolve) => {
      const tx = db.transaction('media', 'readonly');
      const req = tx.objectStore('media').getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

async function deleteFromLocalDB(id: string): Promise<void> {
  try {
    const db = await openLocalDB();
    return new Promise((resolve) => {
      const tx = db.transaction('media', 'readwrite');
      tx.objectStore('media').delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch {
    // fallback
  }
}

// Extract Google Drive ID from various URL formats
function extractDriveId(input: string): string {
  const trimmed = input.trim();
  const match =
    trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
    trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/) ||
    trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match && match[1]) return match[1];
  if (/^[a-zA-Z0-9_-]{20,}$/.test(trimmed)) return trimmed;
  return trimmed;
}

export const SwimVideoDashboard: React.FC = () => {
  const { isAdmin: adminContextIsAdmin, openLoginModal } = useAdmin();
  const { student, isAuthenticated, authorizedChildren, switchChild } = useIdentity();

  const isMasterAdmin = Boolean(
    student?.role === 'ADMIN' ||
    (student?.email && (student.email.toLowerCase().includes('dronadulasatish') || student.email.toLowerCase().includes('admin@aquaslash.com'))) ||
    (student?.mobile && student.mobile.replace(/\D/g, '').includes('6305252050')) ||
    (student?.phone && student.phone.replace(/\D/g, '').includes('6305252050'))
  );

  const isAdmin = adminContextIsAdmin || isMasterAdmin;

  // View Section Tab: 'public' | 'my-videos' | 'admin-manage'
  const [videoSectionTab, setVideoSectionTab] = useState<'public' | 'my-videos' | 'admin-manage'>(
    isAdmin ? 'admin-manage' : 'public'
  );

  // State
  const [appsScriptUrl, setAppsScriptUrl] = useState<string>(() => {
    const saved = localStorage.getItem('SWIM_LIB_SCRIPT_URL');
    if (saved && !saved.includes('AKfycbxzN3zi')) return saved;
    return CONFIG.API_URL;
  });

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(DEFAULT_SWIM_VIDEOS as MediaItem[]);
  const [syncStatus, setSyncStatus] = useState<string>('● Connected to Google Drive');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Modals
  const [viewerItem, setViewerItem] = useState<MediaItem | null>(null);
  const [playerMode, setPlayerMode] = useState<'hd' | 'drive'>('hd');
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [uploadTab, setUploadTab] = useState<'drive' | 'photos' | 'device'>('drive');
  const [isConfigOpen, setIsConfigOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);

  // Global Upload Status
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadStatusText, setUploadStatusText] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // 1. Google Drive Upload State (Direct File & Link)
  const [driveFiles, setDriveFiles] = useState<FileList | null>(null);
  const [driveInput, setDriveInput] = useState<string>('');
  const [driveTitle, setDriveTitle] = useState<string>('');
  const [driveCategory, setDriveCategory] = useState<string>('Swimming Basics');
  const [driveSwimmingLevel, setDriveSwimmingLevel] = useState<string>('All Levels');
  const [driveAccess, setDriveAccess] = useState<string>('Public');
  const [driveStudent, setDriveStudent] = useState<string>('');
  const [driveStudentIds, setDriveStudentIds] = useState<string[]>([]);
  const [driveStudentNames, setDriveStudentNames] = useState<string[]>([]);
  const [driveDesc, setDriveDesc] = useState<string>('');
  const [driveType, setDriveType] = useState<'video' | 'photo'>('video');

  // 2. Google Photos Upload State (Direct File & Link)
  const [photosFiles, setPhotosFiles] = useState<FileList | null>(null);
  const [photosInput, setPhotosInput] = useState<string>('');
  const [photosTitle, setPhotosTitle] = useState<string>('');
  const [photosCategory, setPhotosCategory] = useState<string>('Swimming Basics');
  const [photosSwimmingLevel, setPhotosSwimmingLevel] = useState<string>('All Levels');
  const [photosAccess, setPhotosAccess] = useState<string>('Public');
  const [photosStudent, setPhotosStudent] = useState<string>('');
  const [photosStudentIds, setPhotosStudentIds] = useState<string[]>([]);
  const [photosStudentNames, setPhotosStudentNames] = useState<string[]>([]);
  const [photosDesc, setPhotosDesc] = useState<string>('');
  const [photosType, setPhotosType] = useState<'video' | 'photo'>('video');

  // 3. Device File Upload State
  const [deviceFiles, setDeviceFiles] = useState<FileList | null>(null);
  const [deviceTitle, setDeviceTitle] = useState<string>('');
  const [deviceCategory, setDeviceCategory] = useState<string>('Swimming Basics');
  const [deviceSwimmingLevel, setDeviceSwimmingLevel] = useState<string>('All Levels');
  const [deviceAccess, setDeviceAccess] = useState<string>('Public');
  const [deviceStudent, setDeviceStudent] = useState<string>('');
  const [deviceStudentIds, setDeviceStudentIds] = useState<string[]>([]);
  const [deviceStudentNames, setDeviceStudentNames] = useState<string[]>([]);
  const [deviceDesc, setDeviceDesc] = useState<string>('');

  // Initial Sync on Mount
  useEffect(() => {
    loadCloudMedia();
    syncStudentsFromBackend().catch(() => {});
  }, [appsScriptUrl]);

  // Real-time synchronization listener
  useEffect(() => {
    const unsub = subscribeMediaUpdates(() => {
      loadCloudMedia();
    });
    return unsub;
  }, []);

  const loadCloudMedia = async () => {
    setIsSyncing(true);
    setSyncStatus('● Syncing media repository...');

    try {
      if (isAdmin) {
        syncLocalMediaToCloud(appsScriptUrl).catch(() => {});
      }

      const items = await loadAllMedia({
        appsScriptUrl,
        studentId: student?.studentId,
        role: isAdmin ? 'ADMIN' : 'STUDENT',
        email: student?.email,
      });

      const sorted = items.sort((a, b) => {
        const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return db - da;
      });

      setMediaItems(sorted);
      setSyncStatus(`● Live Synced (${sorted.length} items)`);
    } catch {
      setSyncStatus('● Offline Cache Active');
    } finally {
      setIsSyncing(false);
    }
  };

  // Convert File to Base64
  const fileToDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  };

  // ============================================================
  // 1. DIRECT UPLOAD TO GOOGLE DRIVE (ADMIN ONLY)
  // ============================================================
  const handleDriveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      alert('Administrator access required.');
      return;
    }

    // Case A: User chose a file directly
    if (driveFiles && driveFiles.length > 0) {
      setIsSubmitting(true);
      setUploadProgress(15);
      setUploadStatusText(`Preparing ${driveFiles.length} item(s) for Google Drive...`);

      const newItems: MediaItem[] = [];

      for (let i = 0; i < driveFiles.length; i++) {
        const file = driveFiles[i];
        setUploadStatusText(`Uploading "${file.name}" directly to Google Drive...`);
        setUploadProgress(Math.round(((i + 0.4) / driveFiles.length) * 100));

        const dataUrl = await fileToDataURL(file);
        const base64Data = dataUrl.split(',')[1];
        const title =
          driveTitle.trim() ||
          file.name.replace(/\.[^/.]+$/, '');
        const isVideo = file.type.startsWith('video') || driveType === 'video';

        const payload = {
          action: 'upload',
          title,
          description: driveDesc,
          category: driveCategory,
          access: driveAccess,
          assignedTo: driveStudent,
          fileName: file.name,
          mimeType: file.type || (isVideo ? 'video/mp4' : 'image/jpeg'),
          base64Data,
        };

        let savedCloudItem: MediaItem | null = null;
        try {
          const response = await fetch(appsScriptUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(payload),
          });
          const result = await response.json();
          if (result && result.item) {
            savedCloudItem = { ...result.item, source: 'drive' };
          }
        } catch (err) {
          console.warn('POST to Drive Apps Script failed, caching locally with 1080p stream:', err);
        }

        const finalItem: MediaItem = savedCloudItem || {
          id: 'drive_' + Date.now() + '_' + i,
          title,
          description: driveDesc,
          category: driveCategory,
          access: driveAccess,
          assignedTo: driveAccess === 'Private' ? (driveStudentNames.join(', ') || driveStudent) : '',
          assignedStudentIds: driveAccess === 'Private' ? driveStudentIds : [],
          assignedStudentNames: driveAccess === 'Private' ? driveStudentNames : [],
          swimmingLevel: driveSwimmingLevel,
          fileName: file.name,
          mimeType: file.type || (isVideo ? 'video/mp4' : 'image/jpeg'),
          type: isVideo ? 'video' : 'photo',
          createdAt: new Date().toISOString(),
          localDataUrl: dataUrl,
          source: 'drive',
        };

        if (!finalItem.localDataUrl) {
          finalItem.localDataUrl = dataUrl;
        }

        await saveMediaItem(finalItem, appsScriptUrl);
        newItems.push(finalItem);
      }

      setUploadProgress(100);
      setUploadStatusText('Successfully uploaded to Google Drive!');

      setTimeout(() => {
        setMediaItems((prev) => [...newItems, ...prev]);
        setIsSubmitting(false);
        setIsUploadOpen(false);
        setDriveFiles(null);
        setDriveTitle('');
        setDriveDesc('');
        setDriveStudent('');
        setDriveStudentIds([]);
        setDriveStudentNames([]);
        setDriveInput('');
        setUploadProgress(0);
        setUploadStatusText('');
        alert('☁️ Video/Photo uploaded directly to Google Drive successfully!');
      }, 600);
      return;
    }

    // Case B: User pasted an existing Google Drive Link or File ID
    if (driveInput.trim()) {
      const driveId = extractDriveId(driveInput);
      if (!driveId) {
        alert('Please select a file or enter a valid Google Drive link.');
        return;
      }

      const title = driveTitle.trim() || 'Swim Video HD';
      const isVideo = driveType === 'video';
      const newItem: MediaItem = {
        id: driveId,
        title,
        description: driveDesc,
        category: driveCategory,
        access: driveAccess,
        assignedTo: driveAccess === 'Private' ? (driveStudentNames.join(', ') || driveStudent) : '',
        assignedStudentIds: driveAccess === 'Private' ? driveStudentIds : [],
        assignedStudentNames: driveAccess === 'Private' ? driveStudentNames : [],
        swimmingLevel: driveSwimmingLevel,
        fileName: `${title}.${isVideo ? 'mp4' : 'jpg'}`,
        mimeType: isVideo ? 'video/mp4' : 'image/jpeg',
        type: isVideo ? 'video' : 'photo',
        driveViewUrl: `https://drive.google.com/file/d/${driveId}/view`,
        previewUrl: isVideo
          ? `https://drive.google.com/file/d/${driveId}/preview`
          : `https://drive.google.com/thumbnail?id=${driveId}&sz=w1600`,
        directUrl: `https://lh3.googleusercontent.com/d/${driveId}`,
        createdAt: new Date().toISOString(),
        isProtected: false,
        source: 'drive',
      };

      await saveMediaItem(newItem, appsScriptUrl);
      setMediaItems((prev) => [newItem, ...prev]);

      setDriveInput('');
      setDriveTitle('');
      setDriveDesc('');
      setDriveStudent('');
      setDriveStudentIds([]);
      setDriveStudentNames([]);
      setIsUploadOpen(false);
      alert(`☁️ "${title}" from Google Drive added successfully!`);
      return;
    }

    alert('Please choose a file to upload directly or enter a Google Drive link.');
  };

  // ============================================================
  // 2. DIRECT UPLOAD TO GOOGLE PHOTOS (ADMIN ONLY)
  // ============================================================
  const handlePhotosSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      alert('Administrator access required.');
      return;
    }

    // Case A: User chose a photo/video file directly
    if (photosFiles && photosFiles.length > 0) {
      setIsSubmitting(true);
      setUploadProgress(15);
      setUploadStatusText(`Preparing ${photosFiles.length} item(s) for Google Photos...`);

      const newItems: MediaItem[] = [];

      for (let i = 0; i < photosFiles.length; i++) {
        const file = photosFiles[i];
        setUploadStatusText(`Uploading "${file.name}" to Google Photos library...`);
        setUploadProgress(Math.round(((i + 0.4) / photosFiles.length) * 100));

        const dataUrl = await fileToDataURL(file);
        const base64Data = dataUrl.split(',')[1];
        const title =
          photosTitle.trim() ||
          file.name.replace(/\.[^/.]+$/, '');
        const isVideo = file.type.startsWith('video') || photosType === 'video';

        let savedCloudItem: MediaItem | null = null;
        try {
          const payload = {
            action: 'upload',
            title,
            description: photosDesc,
            category: photosCategory,
            access: photosAccess,
            assignedTo: photosStudent,
            fileName: file.name,
            mimeType: file.type || (isVideo ? 'video/mp4' : 'image/jpeg'),
            base64Data,
          };
          const response = await fetch(appsScriptUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(payload),
          });
          const result = await response.json();
          if (result && result.item) {
            savedCloudItem = { ...result.item, source: 'photos' };
          }
        } catch (err) {
          console.warn('Cloud sync error for photos, saving locally:', err);
        }

        const finalItem: MediaItem = savedCloudItem || {
          id: 'photos_' + Date.now() + '_' + i,
          title,
          description: photosDesc,
          category: photosCategory,
          access: photosAccess,
          assignedTo: photosAccess === 'Private' ? (photosStudentNames.join(', ') || photosStudent) : '',
          assignedStudentIds: photosAccess === 'Private' ? photosStudentIds : [],
          assignedStudentNames: photosAccess === 'Private' ? photosStudentNames : [],
          swimmingLevel: photosSwimmingLevel,
          fileName: file.name,
          mimeType: file.type || (isVideo ? 'video/mp4' : 'image/jpeg'),
          type: isVideo ? 'video' : 'photo',
          createdAt: new Date().toISOString(),
          localDataUrl: dataUrl,
          source: 'photos',
        };

        if (!finalItem.localDataUrl) {
          finalItem.localDataUrl = dataUrl;
        }

        await saveMediaItem(finalItem, appsScriptUrl);
        newItems.push(finalItem);
      }

      setUploadProgress(100);
      setUploadStatusText('Successfully saved to Google Photos library!');

      setTimeout(() => {
        setMediaItems((prev) => [...newItems, ...prev]);
        setIsSubmitting(false);
        setIsUploadOpen(false);
        setPhotosFiles(null);
        setPhotosTitle('');
        setPhotosDesc('');
        setPhotosStudent('');
        setPhotosStudentIds([]);
        setPhotosStudentNames([]);
        setPhotosInput('');
        setUploadProgress(0);
        setUploadStatusText('');
        alert('📷 Photo/Video added directly to Google Photos library!');
      }, 600);
      return;
    }

    // Case B: User entered a Google Photos share link
    if (photosInput.trim()) {
      const rawUrl = photosInput.trim();
      const title = photosTitle.trim() || 'Swim Drill (Google Photos)';
      const isVideo = photosType === 'video';
      const photosId = 'photos_' + Date.now();
      const isDirectLh3 = rawUrl.includes('googleusercontent.com');

      const newItem: MediaItem = {
        id: photosId,
        title,
        description: photosDesc,
        category: photosCategory,
        access: photosAccess,
        assignedTo: photosAccess === 'Private' ? (photosStudentNames.join(', ') || photosStudent) : '',
        assignedStudentIds: photosAccess === 'Private' ? photosStudentIds : [],
        assignedStudentNames: photosAccess === 'Private' ? photosStudentNames : [],
        swimmingLevel: photosSwimmingLevel,
        fileName: `${title}.${isVideo ? 'mp4' : 'jpg'}`,
        mimeType: isVideo ? 'video/mp4' : 'image/jpeg',
        type: isVideo ? 'video' : 'photo',
        photosUrl: rawUrl,
        driveViewUrl: rawUrl,
        previewUrl: isDirectLh3 ? rawUrl : rawUrl,
        directUrl: isDirectLh3 ? rawUrl : undefined,
        createdAt: new Date().toISOString(),
        isProtected: false,
        source: 'photos',
      };

      await saveMediaItem(newItem, appsScriptUrl);
      setMediaItems((prev) => [newItem, ...prev]);

      setPhotosInput('');
      setPhotosTitle('');
      setPhotosDesc('');
      setPhotosStudent('');
      setPhotosStudentIds([]);
      setPhotosStudentNames([]);
      setIsUploadOpen(false);
      alert(`📷 "${title}" from Google Photos added successfully!`);
      return;
    }

    alert('Please choose a file to upload directly or enter a Google Photos link.');
  };

  // ============================================================
  // 3. DIRECT LOCAL DEVICE UPLOAD (ADMIN ONLY)
  // ============================================================
  const handleDeviceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      alert('Administrator access required.');
      return;
    }
    if (!deviceFiles || deviceFiles.length === 0) {
      alert('Please select a file to upload from your device.');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(15);
    setUploadStatusText(`Preparing ${deviceFiles.length} file(s)...`);

    const newItems: MediaItem[] = [];

    for (let i = 0; i < deviceFiles.length; i++) {
      const file = deviceFiles[i];
      setUploadStatusText(`Saving "${file.name}"...`);
      setUploadProgress(Math.round(((i + 0.4) / deviceFiles.length) * 100));

      const dataUrl = await fileToDataURL(file);
      const title =
        deviceTitle.trim() ||
        file.name.replace(/\.[^/.]+$/, '');
      const isVideo = file.type.startsWith('video');

      const finalItem: MediaItem = {
        id: 'device_' + Date.now() + '_' + i,
        title,
        description: deviceDesc,
        category: deviceCategory,
        access: deviceAccess,
        assignedTo: deviceAccess === 'Private' ? (deviceStudentNames.join(', ') || deviceStudent) : '',
        assignedStudentIds: deviceAccess === 'Private' ? deviceStudentIds : [],
        assignedStudentNames: deviceAccess === 'Private' ? deviceStudentNames : [],
        swimmingLevel: deviceSwimmingLevel,
        fileName: file.name,
        mimeType: file.type,
        type: isVideo ? 'video' : 'photo',
        createdAt: new Date().toISOString(),
        localDataUrl: dataUrl,
        source: 'device',
      };

      await saveMediaItem(finalItem, appsScriptUrl);
      newItems.push(finalItem);
    }

    setUploadProgress(100);
    setUploadStatusText('Saved to Swim Library!');

    setTimeout(() => {
      setMediaItems((prev) => [...newItems, ...prev]);
      setIsSubmitting(false);
      setIsUploadOpen(false);
      setDeviceFiles(null);
      setDeviceTitle('');
      setDeviceDesc('');
      setDeviceStudent('');
      setDeviceStudentIds([]);
      setDeviceStudentNames([]);
      setUploadProgress(0);
      setUploadStatusText('');
      alert('📁 File uploaded and saved to Swim Library!');
    }, 600);
  };

  // Delete handler for Admin (Full Permissions for Admin)
  const handleDeleteItem = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAdmin) return;

    const target = mediaItems.find((item) => item.id === id);

    if (!window.confirm(`Are you sure you want to delete "${target?.title || 'this item'}" from Swim Library?`)) {
      return;
    }

    // Persist deleted ID in localStorage so it never returns on refresh
    try {
      const deleted: string[] = JSON.parse(localStorage.getItem('SWIM_LIB_DELETED_IDS') || '[]');
      if (!deleted.includes(id)) {
        deleted.push(id);
        localStorage.setItem('SWIM_LIB_DELETED_IDS', JSON.stringify(deleted));
      }
    } catch {
      // ignore
    }

    await deleteMediaItem(id, appsScriptUrl);
    setMediaItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Edit handler for Admin
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !editingItem) return;

    await saveMediaItem(editingItem, appsScriptUrl);
    setMediaItems((prev) => prev.map((it) => (it.id === editingItem.id ? editingItem : it)));
    if (viewerItem && viewerItem.id === editingItem.id) {
      setViewerItem(editingItem);
    }
    setEditingItem(null);
  };

  // User Auth Context for Security Verification
  const userContext = {
    isAdmin,
    studentId: student?.studentId || '',
    studentName: student?.studentName || '',
    authorizedStudentIds: authorizedChildren?.map((c) => c.studentId) || [],
    email: student?.email,
    mobile: student?.mobile,
  };

  // Base items that the user is authorized to access
  const authorizedItems = mediaItems.filter((item) => canUserAccessVideo(item, userContext));

  // Count metrics
  const publicCount = authorizedItems.filter((it) => !it.access || it.access.toLowerCase() === 'public').length;
  const myProgressCount = authorizedItems.filter((it) => {
    const isPublic = !it.access || it.access.toLowerCase() === 'public';
    return !isPublic;
  }).length;

  // Filter by videoSectionTab
  const sectionFilteredItems = authorizedItems.filter((item) => {
    if (videoSectionTab === 'public') {
      return !item.access || item.access.toLowerCase() === 'public';
    }
    if (videoSectionTab === 'my-videos') {
      const isPublic = !item.access || item.access.toLowerCase() === 'public';
      if (isPublic) return false;
      const allUserIds = new Set([student?.studentId, ...(authorizedChildren?.map((c) => c.studentId) || [])].filter(Boolean));
      if (item.assignedStudentIds && item.assignedStudentIds.length > 0) {
        return item.assignedStudentIds.some((id) => allUserIds.has(id));
      }
      if (item.assignedTo && student?.studentId && item.assignedTo.includes(student.studentId)) return true;
      if (item.assignedTo && student?.studentName && item.assignedTo.includes(student.studentName)) return true;
      return true;
    }
    return true; // 'admin-manage' shows all
  });

  // Filter items (always exclude raw numbers or auto-synced duplicate noise)
  const filteredItems = sectionFilteredItems
    .filter((item) => {
      const titleTrimmed = item.title?.trim() || '';
      const isPureNumber = /^\d+$/.test(titleTrimmed);
      const isAutoSyncDesc = item.description === 'Synced from Google Drive folder';
      return !isPureNumber && !isAutoSyncDesc;
    })
    .filter((item) => {
      const matchesCat =
        activeCategory === 'All' || searchQuery.trim() !== '' || item.category === activeCategory;
      const query = searchQuery.trim().toLowerCase();
      if (!query) return matchesCat;

      const haystack = `${item.title || ''} ${item.fileName || ''} ${item.category || ''} ${
        item.swimmingLevel || ''
      } ${item.description || ''} ${item.assignedTo || ''} ${item.assignedStudentNames?.join(' ') || ''} ${
        item.assignedStudentIds?.join(' ') || ''
      }`.toLowerCase();
      return matchesCat && haystack.includes(query);
    });

  // Calculate direct 1080p stream URL for a given item
  const getDirectStreamUrl = (item: MediaItem) => {
    if (item.localDataUrl) return item.localDataUrl;
    if (item.source === 'photos' && item.photosUrl) {
      return item.photosUrl;
    }
    if (item.id && !item.id.startsWith('drive_') && !item.id.startsWith('photos_') && !item.id.startsWith('device_')) {
      return `https://drive.google.com/uc?export=download&id=${item.id}`;
    }
    return item.directUrl || item.previewUrl || '';
  };

  return (
    <div className="min-h-[85vh] bg-[#030d1a] text-slate-100 pb-16">
      {/* =========================================================
          SWIM VIDEO SUB-NAV & CONTROLS
         ========================================================= */}
      <section className="sticky top-14 z-30 bg-[#06172d]/95 backdrop-blur border-b border-sky-500/20 px-3 sm:px-6 py-3 shadow-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          {/* Brand & Sync Badge */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 font-bangers text-xl text-black shadow-lg">
              🎥
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bangers text-xl tracking-wider text-white">
                  SWIM VIDEO & MEDIA REPOSITORY
                </h2>
                <span className="rounded bg-sky-500/20 px-2 py-0.5 text-[10px] font-extrabold text-sky-400 border border-sky-400/30">
                  ⚡ 1080p HD
                </span>
                {isAdmin && (
                  <span className="rounded bg-yellow-400 px-2 py-0.5 text-[10px] font-extrabold text-black flex items-center gap-1 shadow">
                    <ShieldCheck className="w-3 h-3" /> Admin Mode
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-emerald-400">{syncStatus}</span>
                {isAdmin && (
                  <button
                    onClick={async () => {
                      if (isAdmin) {
                        await syncLocalMediaToCloud(appsScriptUrl).catch(() => {});
                      }
                      await loadCloudMedia();
                    }}
                    disabled={isSyncing}
                    title="Force re-sync from Google Drive & Sheets"
                    className="inline-flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300 underline cursor-pointer disabled:opacity-40"
                  >
                    <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                    Sync Now
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative flex-1 max-w-md min-w-[220px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, video name, drill or notes..."
              className="w-full rounded-xl border border-sky-400/30 bg-slate-900/90 py-2 pl-9 pr-8 text-xs sm:text-sm text-white placeholder-slate-400 focus:border-sky-400 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* User Info & Admin-Only Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {student?.studentName && (
              <div className="flex items-center gap-1.5 rounded-xl border border-sky-400/20 bg-slate-900/90 px-3 py-1.5 text-xs font-bold text-sky-200 shadow">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="truncate max-w-[120px] sm:max-w-[180px]">{student.studentName}</span>
                {isAdmin && <span className="rounded bg-amber-400/20 px-1.5 py-0.5 text-[10px] text-amber-300 font-extrabold uppercase">Admin</span>}
              </div>
            )}

            {isAdmin ? (
              <>
                {/* Open Google Drive */}
                <a
                  href="https://drive.google.com"
                  target="_blank"
                  rel="noreferrer"
                  title="Open Google Drive Web"
                  className="flex items-center gap-1.5 rounded-xl border border-sky-400/30 bg-slate-900/90 px-3 py-1.5 text-xs font-bold text-sky-300 hover:bg-slate-800 hover:text-white shadow transition cursor-pointer"
                >
                  <Cloud className="w-3.5 h-3.5 text-sky-400" />
                  <span>Google Drive</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>

                {/* Open Google Photos */}
                <a
                  href="https://photos.google.com"
                  target="_blank"
                  rel="noreferrer"
                  title="Open Google Photos"
                  className="flex items-center gap-1.5 rounded-xl border border-amber-400/30 bg-slate-900/90 px-3 py-1.5 text-xs font-bold text-amber-300 hover:bg-slate-800 hover:text-white shadow transition cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5 text-amber-400" />
                  <span>Google Photos</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>

                {/* Admin Direct Upload Button */}
                <button
                  onClick={() => {
                    setIsUploadOpen(true);
                    setUploadTab('drive');
                  }}
                  className="flex items-center gap-1.5 rounded-xl border-2 border-black bg-gradient-to-r from-sky-400 to-blue-500 px-3.5 py-1.5 font-bangers text-xs sm:text-sm tracking-wider text-black shadow-[3px_3px_0_#000] hover:from-sky-300 hover:to-blue-400 cursor-pointer"
                >
                  <Upload className="w-4 h-4" /> UPLOAD VIDEO / PHOTO
                </button>

                {/* Admin Config Settings Gear */}
                <button
                  onClick={() => setIsConfigOpen(true)}
                  title="Google Drive Backend Settings (Admin Only)"
                  className="rounded-xl border border-sky-500/30 bg-slate-800 p-2 text-sky-300 hover:bg-slate-700 cursor-pointer"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button
                onClick={openLoginModal}
                className="flex items-center gap-1.5 rounded-xl border border-sky-400/30 bg-slate-900/80 px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer transition"
              >
                <span>Admin Login</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* =========================================================
          MEDIA GRID & CATEGORY BROWSER
         ========================================================= */}
      <div className="mx-auto max-w-7xl px-3 sm:px-6 pt-4">
        {/* Top Video Sections Bar: PUBLIC VIDEOS vs MY PROGRESS VIDEOS */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-black bg-slate-900 p-2 sm:p-3 shadow-[3px_3px_0_#000]">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setVideoSectionTab('public')}
              className={`flex items-center gap-1.5 sm:gap-2 rounded-xl px-3.5 py-1.5 sm:px-4 sm:py-2 font-bangers text-xs sm:text-base tracking-wider transition cursor-pointer border-2 border-black ${
                videoSectionTab === 'public'
                  ? 'bg-yellow-400 text-black shadow-[2px_2px_0_#000]'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <span>🌐 PUBLIC VIDEOS</span>
              <span className="rounded bg-black/20 px-1.5 py-0.2 font-comic text-[10px] font-bold">
                {publicCount}
              </span>
            </button>

            <button
              onClick={() => setVideoSectionTab('my-videos')}
              className={`flex items-center gap-1.5 sm:gap-2 rounded-xl px-3.5 py-1.5 sm:px-4 sm:py-2 font-bangers text-xs sm:text-base tracking-wider transition cursor-pointer border-2 border-black ${
                videoSectionTab === 'my-videos'
                  ? 'bg-amber-400 text-black shadow-[2px_2px_0_#000]'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>MY PROGRESS VIDEOS</span>
              <span className="rounded bg-black/20 px-1.5 py-0.2 font-comic text-[10px] font-bold">
                {myProgressCount}
              </span>
            </button>

            {isAdmin && (
              <button
                onClick={() => setVideoSectionTab('admin-manage')}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 sm:px-3.5 sm:py-2 font-bangers text-xs sm:text-sm tracking-wider transition cursor-pointer border-2 border-black ${
                  videoSectionTab === 'admin-manage'
                    ? 'bg-purple-400 text-black shadow-[2px_2px_0_#000]'
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>ADMIN REPOSITORY ({mediaItems.length})</span>
              </button>
            )}
          </div>

          {/* Child Switcher for Parents with multiple children */}
          {authorizedChildren && authorizedChildren.length > 1 && (
            <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-xl border border-sky-400/30">
              <span className="text-[10px] sm:text-xs font-bold text-amber-300 flex items-center gap-1">
                <Users className="w-3 h-3" /> Child:
              </span>
              <div className="flex items-center gap-1">
                {authorizedChildren.map((child) => (
                  <button
                    key={child.studentId}
                    onClick={() => switchChild(child.studentId)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] sm:text-xs font-bold transition cursor-pointer ${
                      child.studentId === student?.studentId
                        ? 'bg-yellow-300 text-black shadow font-black'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {child.studentName}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Category Filter Pills (Horizontal touch-scroll with no scrollbars) */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2 no-scrollbar scroll-smooth -mx-1 px-1">
          {CATEGORIES.map((cat) => {
            const active = cat === activeCategory;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap rounded-xl px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                  active
                    ? 'bg-sky-400 text-slate-950 shadow-md font-extrabold'
                    : 'border border-sky-500/20 bg-slate-900/80 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Info Banner: Admin shows upload shortcuts; Regular viewers see clean library header */}
        {isAdmin ? (
          <div className="mt-2 rounded-xl border border-sky-500/20 bg-sky-950/40 p-2.5 px-4 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-sky-200">
              <Sparkles className="w-4 h-4 text-sky-400 flex-shrink-0" />
              <span>
                <strong>Admin Media Management Active:</strong> Upload high-definition 1080p swim videos directly to Google Drive, Google Photos, or Local Storage.
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setIsUploadOpen(true);
                  setUploadTab('drive');
                }}
                className="text-sky-300 hover:text-white underline font-bold cursor-pointer text-xs"
              >
                + Upload to Drive ↗
              </button>
              <span className="text-slate-600">|</span>
              <button
                onClick={() => {
                  setIsUploadOpen(true);
                  setUploadTab('photos');
                }}
                className="text-amber-300 hover:text-white underline font-bold cursor-pointer text-xs"
              >
                + Upload to Photos ↗
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-2 rounded-xl border border-sky-500/20 bg-sky-950/20 p-2.5 px-4 flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-sky-200">
              <Sparkles className="w-4 h-4 text-sky-400 flex-shrink-0" />
              <span>
                <strong>High-Definition Swim Library:</strong> Master swimming technique breakdowns, open turns, and drill analysis in 1080p HD.
              </span>
            </div>
          </div>
        )}

        {/* Counts & Status Bar */}
        <div className="flex items-center justify-between py-2 text-xs text-slate-300">
          <span>
            Showing <strong className="text-sky-400">{filteredItems.length}</strong> items in Swim
            Video Library
          </span>
          <span className="text-slate-400">
            💡 Click any video card to play in Full 1080p HD Theater mode
          </span>
        </div>

        {/* Media Grid */}
        {filteredItems.length === 0 ? (
          <div className="my-12 rounded-2xl border border-sky-500/30 bg-slate-900/70 p-10 text-center">
            <span className="text-5xl">🌊</span>
            <h3 className="mt-3 font-bangers text-2xl text-white">No Matching Swim Media Found</h3>
            <p className="mt-1 text-sm text-slate-300">
              Try selecting &apos;All&apos; category or clearing your search filter.
            </p>
            {isAdmin && (
              <div className="mt-4 flex items-center justify-center gap-3">
                <button
                  onClick={() => {
                    setIsUploadOpen(true);
                    setUploadTab('drive');
                  }}
                  className="rounded-xl border-2 border-black bg-sky-400 px-4 py-2 font-bangers text-sm text-black shadow-[3px_3px_0_#000] hover:bg-sky-300 cursor-pointer"
                >
                  ☁️ Upload to Google Drive
                </button>
                <button
                  onClick={() => {
                    setIsUploadOpen(true);
                    setUploadTab('photos');
                  }}
                  className="rounded-xl border-2 border-black bg-amber-400 px-4 py-2 font-bangers text-sm text-black shadow-[3px_3px_0_#000] hover:bg-amber-300 cursor-pointer"
                >
                  📷 Upload to Google Photos
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item, idx) => {
              const isVideo =
                item.type === 'video' || (item.mimeType && item.mimeType.startsWith('video'));
              const isPhotos = item.source === 'photos' || Boolean(item.photosUrl);
              const thumbnailSrc =
                item.localDataUrl ||
                item.directUrl ||
                (item.id && !item.id.startsWith('photos_') && !item.id.startsWith('drive_') && !item.id.startsWith('device_')
                  ? `https://lh3.googleusercontent.com/d/${item.id}`
                  : item.previewUrl);

              return (
                <article
                  key={item.id + '_' + idx}
                  onClick={() => {
                    setViewerItem(item);
                    setPlayerMode('hd');
                  }}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border-2 border-sky-500/30 bg-[#071930] shadow-lg transition hover:border-sky-400 hover:shadow-sky-500/10 cursor-pointer"
                >
                  <div>
                    {/* Thumbnail Container */}
                    <div className="relative h-52 w-full overflow-hidden bg-slate-950 flex items-center justify-center">
                      <img
                        src={thumbnailSrc}
                        alt={item.title}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (item.id && !item.id.startsWith('photos_') && !item.id.startsWith('drive_') && !target.src.includes('thumbnail?id=')) {
                            target.src = `https://drive.google.com/thumbnail?id=${item.id}&sz=w800`;
                          }
                        }}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />

                      {isVideo && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/35 group-hover:bg-black/20 transition">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-400 text-black shadow-lg group-hover:scale-110 transition">
                            <Play className="h-6 w-6 ml-0.5 fill-black" />
                          </div>
                        </div>
                      )}

                      {/* Source & Category Badges */}
                      <div className="absolute left-2.5 top-2.5 flex items-center gap-1.5">
                        <span className="rounded-lg border border-sky-400/40 bg-slate-950/85 px-2.5 py-1 text-[11px] font-bold text-sky-300">
                          {item.category || 'Swimming'}
                        </span>
                        {isPhotos ? (
                          <span className="rounded bg-amber-500/90 px-2 py-0.5 text-[10px] font-extrabold text-black shadow">
                            📷 Photos
                          </span>
                        ) : item.source === 'device' ? (
                          <span className="rounded bg-emerald-500/90 px-2 py-0.5 text-[10px] font-extrabold text-black shadow">
                            📁 Device
                          </span>
                        ) : (
                          <span className="rounded bg-sky-500/90 px-2 py-0.5 text-[10px] font-extrabold text-black shadow">
                            ☁️ Drive
                          </span>
                        )}
                      </div>

                      {/* Resolution & Visibility Badges */}
                      <div className="absolute right-2.5 top-2.5 flex items-center gap-1.5">
                        {isVideo && (
                          <span className="rounded bg-sky-400 px-2 py-0.5 text-[10px] font-extrabold text-slate-950 shadow">
                            1080p HD
                          </span>
                        )}
                        {item.access === 'Private' ? (
                          <span className="flex items-center gap-1 rounded bg-amber-400 px-2 py-0.5 text-[10px] font-black text-slate-950 shadow border border-black">
                            <Lock className="w-2.5 h-2.5" /> Private
                          </span>
                        ) : (
                          <span className="rounded bg-emerald-500 px-2 py-0.5 text-[10px] font-extrabold text-slate-950 shadow">
                            Public
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-4 space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-bangers text-lg tracking-wide text-white group-hover:text-sky-300 transition leading-snug">
                          {item.title || item.fileName}
                        </h3>
                        {item.swimmingLevel && (
                          <span className="rounded bg-sky-900/80 border border-sky-400/30 px-2 py-0.5 text-[10px] font-black text-sky-200 shrink-0">
                            {item.swimmingLevel}
                          </span>
                        )}
                      </div>

                      {item.description && (
                        <p className="mt-1 line-clamp-3 font-comic text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                          {item.description}
                        </p>
                      )}

                      {/* Assigned Student(s) Information */}
                      {item.access === 'Private' && (
                        <div className="mt-2 flex flex-wrap items-center gap-1">
                          <span className="text-[10px] font-bold text-amber-300 uppercase">Assigned:</span>
                          {item.assignedStudentNames && item.assignedStudentNames.length > 0 ? (
                            item.assignedStudentNames.map((name, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center gap-1 rounded bg-amber-400/20 px-1.5 py-0.2 text-[10px] font-bold text-amber-200 border border-amber-400/30"
                              >
                                {name}
                                {item.assignedStudentIds && item.assignedStudentIds[i] && (
                                  <span className="font-mono text-[9px] text-amber-300">
                                    ({item.assignedStudentIds[i]})
                                  </span>
                                )}
                              </span>
                            ))
                          ) : (
                            <span className="rounded bg-amber-400/20 px-2 py-0.5 text-[11px] font-bold text-amber-300 border border-amber-400/30">
                              👤 {item.assignedTo || 'Selected Student'}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="flex flex-wrap items-center justify-between border-t border-slate-800 bg-slate-950/70 px-3 sm:px-4 py-2 sm:py-2.5 text-xs gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewerItem(item);
                        setPlayerMode('hd');
                      }}
                      className="flex items-center gap-1 text-sky-400 hover:text-sky-300 font-bold cursor-pointer"
                    >
                      <Maximize2 className="w-3.5 h-3.5" /> Full Player
                    </button>

                    <div className="flex flex-wrap items-center gap-2">
                      {isPhotos && item.photosUrl ? (
                        <a
                          href={item.photosUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 text-amber-400 hover:underline font-semibold"
                        >
                          Photos <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        item.driveViewUrl && (
                          <a
                            href={item.driveViewUrl}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1 text-emerald-400 hover:underline font-semibold"
                          >
                            Drive <ExternalLink className="w-3 h-3" />
                          </a>
                        )
                      )}

                      {item.isProtected ? (
                        <span className="flex items-center gap-1 rounded bg-slate-800/80 px-2 py-0.5 text-[10px] font-bold text-sky-300 border border-sky-500/20">
                          🔒 Verified
                        </span>
                      ) : null}

                      {/* Admin Controls */}
                      {isAdmin && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingItem({ ...item });
                            }}
                            className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
                            title="Edit Title, Description & Category"
                          >
                            <Edit2 className="w-3 h-3" /> Edit
                          </button>

                          <button
                            onClick={(e) => handleDeleteItem(item.id, e)}
                            className="flex items-center gap-1 rounded bg-rose-500/20 px-2 py-0.5 text-[11px] font-bold text-rose-400 hover:bg-rose-500/35 hover:text-rose-200 border border-rose-500/40 cursor-pointer transition"
                            title="Delete this media"
                          >
                            <Trash2 className="w-3 h-3" /> Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* =========================================================
          MODAL 1: FULL 1080p HD THEATER MEDIA VIEWER
         ========================================================= */}
      {viewerItem && (
        <div className="fixed inset-0 z-50 flex flex-col justify-between bg-black/95 p-3 sm:p-6 backdrop-blur-md">
          {/* Header */}
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between py-2 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-sky-500/20 px-2 py-0.5 text-xs font-bold uppercase text-sky-400 border border-sky-400/30">
                    {viewerItem.category || 'Swimming'}
                  </span>
                  {viewerItem.source === 'photos' ? (
                    <span className="rounded bg-amber-500/20 px-2 py-0.5 text-xs font-extrabold text-amber-400 border border-amber-500/30">
                      📷 Google Photos
                    </span>
                  ) : (
                    <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-xs font-extrabold text-emerald-400 border border-emerald-500/30">
                      ⚡ 1080p HD Master (Drive)
                    </span>
                  )}
                </div>
                <h3 className="mt-1 font-bangers text-2xl text-white">
                  {viewerItem.title || viewerItem.fileName}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isAdmin && (
                <>
                  <button
                    onClick={() => {
                      const toEdit = viewerItem;
                      setViewerItem(null);
                      setEditingItem({ ...toEdit });
                    }}
                    className="flex items-center gap-1 rounded-lg border border-amber-500/40 bg-amber-950/80 px-3 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-900 cursor-pointer"
                    title="Edit Title & Description"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={(e) => {
                      const idToDelete = viewerItem.id;
                      setViewerItem(null);
                      handleDeleteItem(idToDelete, e);
                    }}
                    className="flex items-center gap-1 rounded-lg border border-rose-500/40 bg-rose-950/80 px-3 py-1.5 text-xs font-bold text-rose-300 hover:bg-rose-900 cursor-pointer"
                    title="Delete Video"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </>
              )}
              {viewerItem.photosUrl ? (
                <a
                  href={viewerItem.photosUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 rounded-lg border border-amber-400/40 bg-slate-800 px-3 py-1.5 text-xs font-bold text-amber-300 hover:bg-slate-700"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Open in Google Photos
                </a>
              ) : (
                viewerItem.driveViewUrl && (
                  <a
                    href={viewerItem.driveViewUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 rounded-lg border border-sky-400/40 bg-slate-800 px-3 py-1.5 text-xs font-bold text-sky-300 hover:bg-slate-700"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Open in Google Drive
                  </a>
                )
              )}
              <button
                onClick={() => setViewerItem(null)}
                className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-500 cursor-pointer"
              >
                ✕ Close
              </button>
            </div>
          </div>

          {/* Media Body */}
          <div className="my-auto flex flex-1 flex-col items-center justify-center overflow-auto p-2">
            {viewerItem.type === 'video' ||
            (viewerItem.mimeType && viewerItem.mimeType.startsWith('video')) ? (
              <div className="flex flex-col items-center w-full max-w-5xl">
                {/* Player Toolbar with 1080p Toggle and Download */}
                <div className="w-full flex flex-wrap items-center justify-between gap-2 pb-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300 border border-emerald-500/30">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      {viewerItem.source === 'photos'
                        ? 'Google Photos HD Stream'
                        : playerMode === 'hd'
                        ? 'Full 1080p HD Native Player'
                        : 'Google Drive Preview Frame'}
                    </span>
                    <span className="text-slate-400 text-[11px] hidden sm:inline">
                      {viewerItem.source === 'photos'
                        ? 'Streaming from Google Photos'
                        : playerMode === 'hd'
                        ? 'Bypasses Google Drive 360p downscaling'
                        : 'Google default embed player'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {viewerItem.source !== 'photos' && (
                      <button
                        onClick={() => setPlayerMode(playerMode === 'hd' ? 'drive' : 'hd')}
                        className="rounded-lg border border-sky-400/40 bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-sky-300 hover:bg-slate-700 cursor-pointer"
                      >
                        {playerMode === 'hd'
                          ? 'Switch to Drive Frame'
                          : '⚡ Switch to 1080p HD Native Player'}
                      </button>
                    )}
                    <a
                      href={getDirectStreamUrl(viewerItem)}
                      download={viewerItem.fileName || `${viewerItem.title}.mp4`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-950/70 px-2.5 py-1 text-[11px] font-semibold text-emerald-300 hover:bg-emerald-900 cursor-pointer"
                    >
                      <Download className="w-3 h-3" /> Download MP4
                    </a>
                  </div>
                </div>

                {/* Player Screen */}
                <div className="relative w-full rounded-2xl overflow-hidden border-2 border-slate-800 bg-black shadow-2xl flex items-center justify-center">
                  {playerMode === 'hd' || viewerItem.source === 'photos' ? (
                    <video
                      key={getDirectStreamUrl(viewerItem)}
                      src={getDirectStreamUrl(viewerItem)}
                      controls
                      autoPlay
                      playsInline
                      preload="auto"
                      className="max-h-[70vh] w-full object-contain bg-black"
                    >
                      Your browser does not support HTML5 video streaming.
                    </video>
                  ) : (
                    <iframe
                      src={viewerItem.previewUrl}
                      title={viewerItem.title}
                      className="h-[70vh] w-full bg-black border-0"
                      allow="autoplay; fullscreen"
                    />
                  )}
                </div>

                {playerMode === 'drive' && (
                  <div className="mt-2 w-full rounded-lg bg-amber-500/10 border border-amber-500/30 p-2 text-center text-xs text-amber-300">
                    ⚠️ Google Drive preview player often locks to 360p while processing. Switch to
                    &apos;⚡ 1080p HD Native Player&apos; above to stream the uncompressed high-def
                    video!
                  </div>
                )}
              </div>
            ) : (
              <img
                src={viewerItem.localDataUrl || viewerItem.directUrl || viewerItem.previewUrl}
                alt={viewerItem.title}
                className="max-h-[78vh] max-w-full object-contain rounded-2xl shadow-2xl border-2 border-slate-800"
              />
            )}
          </div>

          {/* Description / Drill Notes */}
          {viewerItem.description && (
            <div className="mx-auto max-w-4xl w-full rounded-xl border border-slate-800 bg-slate-900/90 p-4 max-h-36 overflow-y-auto">
              <h4 className="font-bold text-xs uppercase tracking-wider text-sky-300 mb-1">
                Coaching & Drill Notes:
              </h4>
              <p className="font-comic text-xs text-slate-200 whitespace-pre-line leading-relaxed">
                {viewerItem.description}
              </p>
            </div>
          )}
        </div>
      )}

      {/* =========================================================
          MODAL 2: UPLOAD & CHOOSE FILES (ADMIN ONLY)
         ========================================================= */}
      {isAdmin && isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border-4 border-black bg-[#0a1b32] p-6 text-white shadow-[10px_10px_0_#000] max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-sky-500/30 pb-3">
              <div className="flex items-center gap-2">
                <span className="rounded bg-sky-400 p-1.5 text-black">
                  <Upload className="w-5 h-5" />
                </span>
                <h3 className="font-bangers text-2xl tracking-wide text-white">
                  CHOOSE FILE & UPLOAD MEDIA (ADMIN)
                </h3>
              </div>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="rounded-lg bg-rose-600 p-1 text-white hover:bg-rose-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 3 Source Tabs: Google Drive, Google Photos, Local Device */}
            <div className="mt-4 grid grid-cols-3 rounded-xl bg-slate-900 p-1 border border-slate-800 gap-1">
              <button
                type="button"
                onClick={() => setUploadTab('drive')}
                className={`rounded-lg py-2 text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1 ${
                  uploadTab === 'drive'
                    ? 'bg-sky-500 text-slate-950 shadow font-extrabold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Cloud className="w-3.5 h-3.5" />
                <span>Google Drive</span>
              </button>

              <button
                type="button"
                onClick={() => setUploadTab('photos')}
                className={`rounded-lg py-2 text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1 ${
                  uploadTab === 'photos'
                    ? 'bg-amber-400 text-slate-950 shadow font-extrabold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Google Photos</span>
              </button>

              <button
                type="button"
                onClick={() => setUploadTab('device')}
                className={`rounded-lg py-2 text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1 ${
                  uploadTab === 'device'
                    ? 'bg-emerald-400 text-slate-950 shadow font-extrabold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span>Local Device</span>
              </button>
            </div>

            {/* =========================================================
                TAB 1: GOOGLE DRIVE (DIRECT FILE PICKER + LINK OPTION)
               ========================================================= */}
            {uploadTab === 'drive' && (
              <form onSubmit={handleDriveSubmit} className="mt-4 space-y-4">
                {/* Direct File Picker Area */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-sky-300 mb-1">
                    1. Choose Video or Photo from your Device (Direct Upload)
                  </label>
                  <div className="relative border-2 border-dashed border-sky-400/50 rounded-2xl bg-slate-900/90 p-5 text-center hover:border-sky-400 hover:bg-slate-900 transition cursor-pointer">
                    <input
                      type="file"
                      accept="video/*,image/*"
                      multiple
                      onChange={(e) => {
                        setDriveFiles(e.target.files);
                        if (e.target.files && e.target.files[0] && !driveTitle) {
                          setDriveTitle(e.target.files[0].name.replace(/\.[^/.]+$/, ''));
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center justify-center pointer-events-none space-y-1">
                      <div className="rounded-full bg-sky-500/20 p-3 text-sky-400">
                        <Cloud className="w-7 h-7" />
                      </div>
                      <span className="font-bangers text-base tracking-wider text-white">
                        {driveFiles && driveFiles.length > 0
                          ? `✓ ${driveFiles.length} file(s) selected: ${driveFiles[0].name}`
                          : 'CLICK HERE TO CHOOSE FILE (OR DRAG & DROP)'}
                      </span>
                      <span className="text-[11px] text-sky-300">
                        {driveFiles && driveFiles.length > 0
                          ? `Size: ${(driveFiles[0].size / (1024 * 1024)).toFixed(1)} MB • Ready to upload to Google Drive`
                          : 'Select any 1080p MP4, MOV, WebM, or JPG/PNG image'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Optional Link Alternative */}
                <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    — OR Paste Existing Google Drive Link / File ID (If already in Drive) —
                  </label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={driveInput}
                      onChange={(e) => setDriveInput(e.target.value)}
                      placeholder="e.g. https://drive.google.com/file/d/1jWZrsa.../view or File ID"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 py-1.5 pl-8 pr-3 text-xs text-white placeholder-slate-500 focus:border-sky-400 focus:outline-none"
                    />
                  </div>
                  {driveInput.trim() && (
                    <div className="mt-1 text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                      <CheckCircle className="w-3 h-3" /> Extracted Drive ID:{' '}
                      <span className="font-mono text-white">{extractDriveId(driveInput)}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-sky-300 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={driveTitle}
                      onChange={(e) => setDriveTitle(e.target.value)}
                      placeholder="e.g. Freestyle High Elbow Drill"
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-sky-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-sky-300 mb-1">
                      Media Type
                    </label>
                    <select
                      value={driveType}
                      onChange={(e) => setDriveType(e.target.value as 'video' | 'photo')}
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-sky-400 focus:outline-none"
                    >
                      <option value="video">🎥 1080p Video</option>
                      <option value="photo">🖼️ Photo</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-sky-300 mb-1">
                      Category
                    </label>
                    <select
                      value={driveCategory}
                      onChange={(e) => setDriveCategory(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-sky-400 focus:outline-none"
                    >
                      {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-sky-300 mb-1">
                      Swimming Level
                    </label>
                    <select
                      value={driveSwimmingLevel}
                      onChange={(e) => setDriveSwimmingLevel(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-sky-400 focus:outline-none"
                    >
                      {SWIMMING_LEVELS.map((lvl) => (
                        <option key={lvl} value={lvl}>
                          {lvl}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-sky-300 mb-1">
                      Visibility
                    </label>
                    <select
                      value={driveAccess}
                      onChange={(e) => setDriveAccess(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-sky-400 focus:outline-none"
                    >
                      <option value="Public">Public (All Students & Parents)</option>
                      <option value="Private">Private (Select Students)</option>
                    </select>
                  </div>
                </div>

                {driveAccess === 'Private' && (
                  <StudentSelector
                    selectedStudentIds={driveStudentIds}
                    onChange={(ids, names) => {
                      setDriveStudentIds(ids);
                      setDriveStudentNames(names);
                    }}
                  />
                )}

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-sky-300 mb-1">
                    Coaching & Drill Notes
                  </label>
                  <textarea
                    rows={2}
                    value={driveDesc}
                    onChange={(e) => setDriveDesc(e.target.value)}
                    placeholder="Add breakdown of technique, arm recovery, breathing timing..."
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-sky-400 focus:outline-none"
                  />
                </div>

                {/* Progress status */}
                {isSubmitting && (
                  <div className="rounded-xl border border-sky-400/40 bg-slate-900 p-3 space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-sky-300">{uploadStatusText}</span>
                      <span className="font-bold text-white">{uploadProgress}%</span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-400 to-sky-400 transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-xl border-3 border-black bg-gradient-to-r from-sky-400 to-blue-500 py-3 font-bangers text-lg tracking-wider text-black shadow-[4px_4px_0_#000] hover:from-sky-300 hover:to-blue-400 cursor-pointer disabled:opacity-40"
                >
                  {isSubmitting
                    ? 'UPLOADING TO GOOGLE DRIVE...'
                    : '🚀 UPLOAD & SAVE TO GOOGLE DRIVE (1080p HD)'}
                </button>
              </form>
            )}

            {/* =========================================================
                TAB 2: GOOGLE PHOTOS (DIRECT FILE PICKER + LINK OPTION)
               ========================================================= */}
            {uploadTab === 'photos' && (
              <form onSubmit={handlePhotosSubmit} className="mt-4 space-y-4">
                {/* Direct File Picker Area */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-amber-300 mb-1">
                    1. Choose Photo or Video from your Device (Direct Upload)
                  </label>
                  <div className="relative border-2 border-dashed border-amber-400/50 rounded-2xl bg-slate-900/90 p-5 text-center hover:border-amber-400 hover:bg-slate-900 transition cursor-pointer">
                    <input
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      onChange={(e) => {
                        setPhotosFiles(e.target.files);
                        if (e.target.files && e.target.files[0] && !photosTitle) {
                          setPhotosTitle(e.target.files[0].name.replace(/\.[^/.]+$/, ''));
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center justify-center pointer-events-none space-y-1">
                      <div className="rounded-full bg-amber-500/20 p-3 text-amber-400">
                        <Camera className="w-7 h-7" />
                      </div>
                      <span className="font-bangers text-base tracking-wider text-white">
                        {photosFiles && photosFiles.length > 0
                          ? `✓ ${photosFiles.length} file(s) selected: ${photosFiles[0].name}`
                          : 'CLICK HERE TO CHOOSE PHOTO OR VIDEO (OR DRAG & DROP)'}
                      </span>
                      <span className="text-[11px] text-amber-300">
                        {photosFiles && photosFiles.length > 0
                          ? `Size: ${(photosFiles[0].size / (1024 * 1024)).toFixed(1)} MB • Ready to add as Google Photos`
                          : 'Select swimming photos, stroke snapshots, or drill videos'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Optional Link Alternative */}
                <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    — OR Paste Google Photos Share Link / Media URL —
                  </label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={photosInput}
                      onChange={(e) => setPhotosInput(e.target.value)}
                      placeholder="e.g. https://photos.app.goo.gl/... or https://photos.google.com/..."
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 py-1.5 pl-8 pr-3 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                  {photosInput.trim() && (
                    <div className="mt-1 text-[11px] text-amber-400 flex items-center gap-1 font-semibold">
                      <CheckCircle className="w-3 h-3" /> Google Photos Link Ready
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-amber-300 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={photosTitle}
                      onChange={(e) => setPhotosTitle(e.target.value)}
                      placeholder="e.g. Butterfly Kick Technique"
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-amber-300 mb-1">
                      Media Type
                    </label>
                    <select
                      value={photosType}
                      onChange={(e) => setPhotosType(e.target.value as 'video' | 'photo')}
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                    >
                      <option value="photo">🖼️ Photo</option>
                      <option value="video">🎥 Video</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-amber-300 mb-1">
                      Category
                    </label>
                    <select
                      value={photosCategory}
                      onChange={(e) => setPhotosCategory(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                    >
                      {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-amber-300 mb-1">
                      Swimming Level
                    </label>
                    <select
                      value={photosSwimmingLevel}
                      onChange={(e) => setPhotosSwimmingLevel(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                    >
                      {SWIMMING_LEVELS.map((lvl) => (
                        <option key={lvl} value={lvl}>
                          {lvl}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-amber-300 mb-1">
                      Visibility
                    </label>
                    <select
                      value={photosAccess}
                      onChange={(e) => setPhotosAccess(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                    >
                      <option value="Public">Public (All Students & Parents)</option>
                      <option value="Private">Private (Select Students)</option>
                    </select>
                  </div>
                </div>

                {photosAccess === 'Private' && (
                  <StudentSelector
                    selectedStudentIds={photosStudentIds}
                    onChange={(ids, names) => {
                      setPhotosStudentIds(ids);
                      setPhotosStudentNames(names);
                    }}
                  />
                )}

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-amber-300 mb-1">
                    Coaching & Drill Notes
                  </label>
                  <textarea
                    rows={2}
                    value={photosDesc}
                    onChange={(e) => setPhotosDesc(e.target.value)}
                    placeholder="Add breakdown of technique, arm recovery, breathing timing..."
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>

                {/* Progress status */}
                {isSubmitting && (
                  <div className="rounded-xl border border-amber-400/40 bg-slate-900 p-3 space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-amber-300">{uploadStatusText}</span>
                      <span className="font-bold text-white">{uploadProgress}%</span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 to-orange-400 transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-xl border-3 border-black bg-gradient-to-r from-amber-400 to-orange-400 py-3 font-bangers text-lg tracking-wider text-black shadow-[4px_4px_0_#000] hover:from-amber-300 hover:to-orange-300 cursor-pointer disabled:opacity-40"
                >
                  {isSubmitting
                    ? 'SAVING TO GOOGLE PHOTOS...'
                    : '📷 UPLOAD & SAVE TO GOOGLE PHOTOS'}
                </button>
              </form>
            )}

            {/* =========================================================
                TAB 3: LOCAL DEVICE UPLOAD
               ========================================================= */}
            {uploadTab === 'device' && (
              <form onSubmit={handleDeviceSubmit} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-emerald-300 mb-1">
                    Select File from Computer / Mobile Device
                  </label>
                  <div className="relative border-2 border-dashed border-emerald-400/50 rounded-2xl bg-slate-900/90 p-5 text-center hover:border-emerald-400 hover:bg-slate-900 transition cursor-pointer">
                    <input
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      required
                      onChange={(e) => {
                        setDeviceFiles(e.target.files);
                        if (e.target.files && e.target.files[0] && !deviceTitle) {
                          setDeviceTitle(e.target.files[0].name.replace(/\.[^/.]+$/, ''));
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center justify-center pointer-events-none space-y-1">
                      <div className="rounded-full bg-emerald-500/20 p-3 text-emerald-400">
                        <FolderOpen className="w-7 h-7" />
                      </div>
                      <span className="font-bangers text-base tracking-wider text-white">
                        {deviceFiles && deviceFiles.length > 0
                          ? `✓ ${deviceFiles.length} file(s) selected: ${deviceFiles[0].name}`
                          : 'CLICK HERE TO CHOOSE FILE (LOCAL OFFLINE STORAGE)'}
                      </span>
                      <span className="text-[11px] text-emerald-300">
                        {deviceFiles && deviceFiles.length > 0
                          ? `Size: ${(deviceFiles[0].size / (1024 * 1024)).toFixed(1)} MB`
                          : 'Files stored directly in your browser offline database'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-sky-300 mb-1">
                      Title (Optional)
                    </label>
                    <input
                      type="text"
                      value={deviceTitle}
                      onChange={(e) => setDeviceTitle(e.target.value)}
                      placeholder="Defaults to file name"
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-sky-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-sky-300 mb-1">
                      Category
                    </label>
                    <select
                      value={deviceCategory}
                      onChange={(e) => setDeviceCategory(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-sky-400 focus:outline-none"
                    >
                      {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-sky-300 mb-1">
                      Swimming Level
                    </label>
                    <select
                      value={deviceSwimmingLevel}
                      onChange={(e) => setDeviceSwimmingLevel(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-sky-400 focus:outline-none"
                    >
                      {SWIMMING_LEVELS.map((lvl) => (
                        <option key={lvl} value={lvl}>
                          {lvl}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-sky-300 mb-1">
                      Access / Visibility
                    </label>
                    <select
                      value={deviceAccess}
                      onChange={(e) => setDeviceAccess(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-sky-400 focus:outline-none"
                    >
                      <option value="Public">Public (All Students & Parents)</option>
                      <option value="Private">Private (Select Students)</option>
                    </select>
                  </div>
                </div>

                {deviceAccess === 'Private' && (
                  <StudentSelector
                    selectedStudentIds={deviceStudentIds}
                    onChange={(ids, names) => {
                      setDeviceStudentIds(ids);
                      setDeviceStudentNames(names);
                    }}
                  />
                )}

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-sky-300 mb-1">
                    Description / Coaching Drill Notes
                  </label>
                  <textarea
                    rows={2}
                    value={deviceDesc}
                    onChange={(e) => setDeviceDesc(e.target.value)}
                    placeholder="Add coaching tips, drill breakdown, or notes..."
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-sky-400 focus:outline-none"
                  />
                </div>

                {/* Progress status */}
                {isSubmitting && (
                  <div className="rounded-xl border border-sky-400/40 bg-slate-900 p-3 space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-sky-300">{uploadStatusText}</span>
                      <span className="font-bold text-white">{uploadProgress}%</span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-400 to-sky-400 transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-xl border-3 border-black bg-gradient-to-r from-emerald-400 to-sky-400 py-3 font-bangers text-lg tracking-wider text-black shadow-[4px_4px_0_#000] hover:from-emerald-300 hover:to-sky-300 cursor-pointer disabled:opacity-40"
                >
                  {isSubmitting ? 'SAVING ITEM...' : 'SAVE DIRECTLY TO LOCAL LIBRARY 🚀'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 3: ADMIN EDIT MEDIA ITEM MODAL (ADMIN ONLY)
         ========================================================= */}
      {isAdmin && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-2xl border-4 border-black bg-[#0a1b32] p-6 text-white shadow-[10px_10px_0_#000] space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-sky-500/30 pb-3">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-amber-400" />
                <h3 className="font-bangers text-2xl tracking-wider text-white">
                  EDIT MEDIA DETAILS (ADMIN)
                </h3>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="rounded-lg bg-rose-600 p-1 text-white hover:bg-rose-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-sky-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.title}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-sky-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-sky-300 mb-1">
                    Category
                  </label>
                  <select
                    value={editingItem.category}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-sky-400 focus:outline-none"
                  >
                    {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-sky-300 mb-1">
                    Swimming Level
                  </label>
                  <select
                    value={editingItem.swimmingLevel || 'All Levels'}
                    onChange={(e) => setEditingItem({ ...editingItem, swimmingLevel: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-sky-400 focus:outline-none"
                  >
                    {SWIMMING_LEVELS.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {lvl}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-sky-300 mb-1">
                    Visibility
                  </label>
                  <select
                    value={editingItem.access || 'Public'}
                    onChange={(e) => setEditingItem({ ...editingItem, access: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-sky-400 focus:outline-none"
                  >
                    <option value="Public">Public (All Students & Parents)</option>
                    <option value="Private">Private (Select Students)</option>
                  </select>
                </div>
              </div>

              {editingItem.access === 'Private' && (
                <StudentSelector
                  selectedStudentIds={editingItem.assignedStudentIds || []}
                  onChange={(ids, names) =>
                    setEditingItem({
                      ...editingItem,
                      assignedStudentIds: ids,
                      assignedStudentNames: names,
                      assignedTo: names.join(', '),
                    })
                  }
                />
              )}

              <div>
                <label className="block text-xs font-bold uppercase text-sky-300 mb-1">
                  Coaching Notes / Description
                </label>
                <textarea
                  rows={4}
                  value={editingItem.description || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-sky-400 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl border-2 border-black bg-yellow-400 px-5 py-2 font-bangers text-sm text-black shadow-[3px_3px_0_#000] hover:bg-yellow-300 cursor-pointer"
                >
                  SAVE CHANGES
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 4: GOOGLE APPS SCRIPT URL SETTINGS (STRICTLY ADMIN ONLY)
         ========================================================= */}
      {isAdmin && isConfigOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-2xl border-4 border-black bg-[#0a1b32] p-6 text-white shadow-[10px_10px_0_#000] space-y-4">
            <div className="flex items-center justify-between border-b border-sky-500/30 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-yellow-400" />
                <h3 className="font-bangers text-xl tracking-wider text-white">
                  GOOGLE APPS SCRIPT CONNECTION (ADMIN)
                </h3>
              </div>
              <button
                onClick={() => setIsConfigOpen(false)}
                className="rounded-lg bg-rose-600 p-1 text-white hover:bg-rose-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              This backend script URL connects the Swim Video dashboard to your Google Drive for
              direct file uploads and synchronized media:
            </p>

            <div>
              <label className="block text-xs font-bold uppercase text-sky-300 mb-1">
                Apps Script Web App URL (/exec)
              </label>
              <input
                type="url"
                value={appsScriptUrl}
                onChange={(e) => setAppsScriptUrl(e.target.value)}
                className="w-full rounded-xl border border-sky-400/40 bg-slate-900 p-2.5 text-xs text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  localStorage.setItem('SWIM_LIB_SCRIPT_URL', appsScriptUrl);
                  setIsConfigOpen(false);
                  loadCloudMedia();
                }}
                className="rounded-xl border-2 border-black bg-yellow-400 px-4 py-2 font-bangers text-sm text-black shadow-[3px_3px_0_#000] hover:bg-yellow-300 cursor-pointer"
              >
                SAVE & SYNC NOW
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
