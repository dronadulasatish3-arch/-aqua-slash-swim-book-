import React, { useState, useEffect, useCallback } from 'react';
import type { Student } from '../lib/api';
import { useIdentity } from '../lib/identity';
import { useAdmin } from '../context/AdminContext';
import { filterVideosForUser, organizeVideosByLevelAndDate } from '../lib/videoPermissions';
import { loadAllMedia, subscribeMediaUpdates } from '../lib/mediaStorage';
import type { MediaItem } from './SwimVideoDashboard';
import {
  Play,
  Maximize2,
  Lock,
  Sparkles,
  Users,
  Film,
  Calendar,
  Layers,
  CheckCircle,
  ExternalLink,
  X,
  RefreshCw,
} from 'lucide-react';

export function MyVideosSection({
  student,
  onOpenPublicLibrary,
}: {
  student: Student;
  onOpenPublicLibrary?: () => void;
}) {
  const { isAdmin } = useAdmin();
  const { authorizedChildren, switchChild } = useIdentity();
  const [activeLevelFilter, setActiveLevelFilter] = useState<string>('All');
  const [activeMedia, setActiveMedia] = useState<MediaItem | null>(null);
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastSyncText, setLastSyncText] = useState<string>('');

  // Fetch unified media (IndexedDB + LocalStorage + Cloud)
  const refreshVideos = useCallback(async () => {
    setIsLoading(true);
    try {
      const items = await loadAllMedia({
        studentId: student.studentId,
        role: isAdmin ? 'ADMIN' : 'STUDENT',
        email: student.email,
      });
      setMediaList(items);
      setLastSyncText(`Live`);
    } catch (err) {
      console.warn('Failed to load videos for student journey:', err);
    } finally {
      setIsLoading(false);
    }
  }, [student.studentId, student.email, isAdmin]);

  // Initial load and real-time subscription
  useEffect(() => {
    refreshVideos();
    const unsub = subscribeMediaUpdates(() => {
      refreshVideos();
    });
    return unsub;
  }, [refreshVideos]);

  // Filter videos for the current active student / child
  const userContext = {
    isAdmin,
    studentId: student.studentId,
    studentName: student.studentName,
    authorizedStudentIds: authorizedChildren.map((c) => c.studentId),
    email: student.email,
    mobile: student.mobile,
  };

  const myPrivateVideos = filterVideosForUser(mediaList, userContext, 'my-videos');

  const filteredVideos =
    activeLevelFilter === 'All'
      ? myPrivateVideos
      : myPrivateVideos.filter((v) => (v.swimmingLevel || 'All Levels') === activeLevelFilter);

  const levelGroups = organizeVideosByLevelAndDate(myPrivateVideos);
  const availableLevels = ['All', ...new Set(myPrivateVideos.map((v) => v.swimmingLevel || 'All Levels'))];

  return (
    <div className="mx-auto max-w-6xl px-3 sm:px-6 py-6 space-y-6">
      {/* 1. Header Card */}
      <div className="rounded-3xl border-3 border-black bg-gradient-to-r from-sky-900 via-indigo-950 to-slate-900 p-5 sm:p-7 text-white shadow-[6px_6px_0_#000]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 px-3 py-1 text-xs font-black text-amber-300 border border-amber-400/30">
              <Lock className="w-3.5 h-3.5" />
              <span>PRIVATE & PERSONALIZED COACH VIDEOS</span>
            </div>
            <h1 className="font-bangers text-3xl sm:text-4xl tracking-wider text-white">
              MY SWIM VIDEOS & DRILLS
            </h1>
            <p className="font-comic text-xs sm:text-sm text-sky-200">
              Personalized technique analysis, stroke breakdowns, and private coach recordings for{' '}
              <strong>{student.studentName}</strong> ({student.studentId}).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={refreshVideos}
              disabled={isLoading}
              className="flex items-center gap-1.5 rounded-xl border-2 border-black bg-sky-400 px-3.5 py-2 font-bangers text-xs sm:text-sm tracking-wider text-black shadow-[2px_2px_0_#000] hover:bg-sky-300 cursor-pointer disabled:opacity-50 transition"
              title="Refresh assigned progress videos from coach"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'SYNCING...' : 'SYNC VIDEOS'}</span>
            </button>

            <div className="rounded-2xl border-2 border-amber-400/30 bg-black/40 px-4 py-2 text-right">
              <span className="block font-bangers text-3xl text-yellow-300 leading-none">
                {myPrivateVideos.length}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Assigned Videos
              </span>
            </div>
          </div>
        </div>

        {/* 2. Parent Multiple Children Switcher */}
        {authorizedChildren.length > 1 && (
          <div className="mt-5 pt-4 border-t border-sky-500/20">
            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
              <Users className="w-4 h-4" />
              <span>Parent Account: Select Child to View Their Private Videos</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {authorizedChildren.map((child) => {
                const isActive = child.studentId === student.studentId;
                return (
                  <button
                    key={child.studentId}
                    onClick={() => switchChild(child.studentId)}
                    className={`flex items-center gap-2 rounded-2xl px-3.5 py-2 font-bangers text-sm tracking-wider transition cursor-pointer border-2 border-black ${
                      isActive
                        ? 'bg-yellow-300 text-black shadow-[3px_3px_0_#000]'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    <span>{child.studentName}</span>
                    <span className="rounded bg-black/20 px-1.5 py-0.2 font-mono text-[10px] text-black">
                      {child.studentId}
                    </span>
                    {isActive && <CheckCircle className="w-3.5 h-3.5 text-black" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 3. Level Filter Pills */}
      {availableLevels.length > 1 && (
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 no-scrollbar">
          {availableLevels.map((lvl) => (
            <button
              key={lvl}
              onClick={() => setActiveLevelFilter(lvl)}
              className={`rounded-xl px-4 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap border ${
                activeLevelFilter === lvl
                  ? 'bg-yellow-400 text-black border-black shadow-[2px_2px_0_#000] font-black'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {lvl === 'All' ? 'All Assigned Videos' : lvl}
            </button>
          ))}
        </div>
      )}

      {/* 4. Video Grid or Empty State */}
      {filteredVideos.length === 0 ? (
        <div className="rounded-3xl border-3 border-dashed border-sky-400/40 bg-white p-8 sm:p-12 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-100 text-3xl">
            🏊‍♂️
          </div>
          <h3 className="mt-4 font-bangers text-2xl tracking-wide text-[#06214a]">
            No Private Videos Assigned Yet
          </h3>
          <p className="mt-2 max-w-md mx-auto font-comic text-xs sm:text-sm text-slate-600 leading-relaxed">
            Coach Satish uploads personalized stroke analysis and progress videos directly to your
            Student ID (<strong>{student.studentId}</strong>). As soon as a video is recorded during
            practice, it will appear here securely!
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={refreshVideos}
              disabled={isLoading}
              className="flex items-center gap-2 rounded-xl border-2 border-black bg-sky-400 px-5 py-2.5 font-bangers text-sm tracking-wider text-black shadow-[3px_3px_0_#000] hover:bg-sky-300 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'SYNCING...' : 'CHECK FOR NEW ASSIGNED VIDEOS'}</span>
            </button>

            {onOpenPublicLibrary && (
              <button
                onClick={onOpenPublicLibrary}
                className="rounded-xl border-2 border-black bg-yellow-300 px-5 py-2.5 font-bangers text-sm tracking-wider text-black shadow-[3px_3px_0_#000] hover:bg-yellow-400 cursor-pointer"
              >
                BROWSE 1080P PUBLIC SWIM LIBRARY →
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredVideos.map((item) => {
            const isVideo = item.type === 'video' || (item.mimeType && item.mimeType.startsWith('video'));
            const driveIdMatch = item.driveViewUrl ? item.driveViewUrl.match(/\/d\/([a-zA-Z0-9_-]+)/) : null;
            const driveFileId = driveIdMatch ? driveIdMatch[1] : null;
            const thumbnailSrc =
              item.localDataUrl ||
              item.directUrl ||
              (driveFileId ? `https://lh3.googleusercontent.com/d/${driveFileId}` : '') ||
              (item.id && !item.id.startsWith('drive_') && !item.id.startsWith('photos_') && !item.id.startsWith('device_') && !item.id.startsWith('pvt_')
                ? `https://lh3.googleusercontent.com/d/${item.id}`
                : item.previewUrl);

            return (
              <article
                key={item.id}
                onClick={() => setActiveMedia(item)}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border-3 border-black bg-white shadow-[4px_4px_0_#000] transition hover:-translate-y-1 cursor-pointer"
              >
                <div>
                  {/* Thumbnail */}
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-900 flex items-center justify-center">
                    <img
                      src={thumbnailSrc}
                      alt={item.title}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=800&q=80';
                      }}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />

                    {isVideo && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/35 group-hover:bg-black/20 transition">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-400 text-black shadow-lg group-hover:scale-110 transition border-2 border-black">
                          <Play className="h-6 w-6 ml-0.5 fill-black" />
                        </div>
                      </div>
                    )}

                    {/* Private Badge & Level Badge */}
                    <div className="absolute left-2.5 top-2.5 flex items-center gap-1.5">
                      <span className="flex items-center gap-1 rounded-lg border border-black bg-amber-400 px-2 py-0.5 text-[10px] font-black text-black shadow-[1px_1px_0_#000]">
                        <Lock className="w-2.5 h-2.5" /> PRIVATE
                      </span>
                      {item.swimmingLevel && (
                        <span className="rounded-lg border border-black bg-sky-300 px-2 py-0.5 text-[10px] font-black text-black shadow-[1px_1px_0_#000]">
                          {item.swimmingLevel}
                        </span>
                      )}
                    </div>

                    <div className="absolute right-2.5 top-2.5">
                      <span className="rounded bg-black/80 px-2 py-0.5 text-[10px] font-bold text-white">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-4 space-y-2">
                    <h3 className="font-bangers text-lg text-slate-900 group-hover:text-sky-600 transition leading-snug">
                      {item.title}
                    </h3>

                    {item.description && (
                      <p className="line-clamp-3 font-comic text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t-2 border-black/10 bg-slate-50 px-4 py-2.5 text-xs">
                  <span className="flex items-center gap-1 text-[11px] font-bold text-slate-500">
                    <Calendar className="w-3.5 h-3.5" />
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recent'}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMedia(item);
                    }}
                    className="flex items-center gap-1 font-bangers text-sm text-sky-600 hover:text-sky-800"
                  >
                    <Maximize2 className="w-3.5 h-3.5" /> WATCH 1080P
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* 5. Theater Video Viewer Modal */}
      {activeMedia && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-2 sm:p-4 backdrop-blur-md"
          onClick={() => setActiveMedia(null)}
        >
          <div
            className="relative w-full max-w-4xl overflow-hidden rounded-2xl border-4 border-black bg-[#050B14] text-white shadow-[10px_10px_0_#000]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b-2 border-black bg-yellow-300 px-4 py-3 text-black">
              <div className="flex items-center gap-2 min-w-0">
                <span className="flex items-center gap-1 rounded bg-black px-2 py-0.5 font-bangers text-xs text-yellow-300">
                  <Lock className="w-3 h-3" /> PRIVATE VIDEO
                </span>
                <h3 className="font-bangers text-base sm:text-xl truncate">{activeMedia.title}</h3>
              </div>
              <button
                onClick={() => setActiveMedia(null)}
                className="rounded-lg bg-rose-600 p-1 text-white hover:bg-rose-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Media Player / Image Viewer */}
            <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
              {activeMedia.type === 'photo' || (activeMedia.mimeType && activeMedia.mimeType.startsWith('image')) ? (
                <img
                  src={activeMedia.localDataUrl || activeMedia.directUrl || activeMedia.previewUrl || activeMedia.driveViewUrl}
                  alt={activeMedia.title}
                  className="max-h-[75vh] w-auto max-w-full object-contain"
                />
              ) : activeMedia.driveViewUrl ? (
                <iframe
                  src={
                    activeMedia.driveViewUrl.includes('/view')
                      ? activeMedia.driveViewUrl.replace('/view', '/preview')
                      : activeMedia.driveViewUrl
                  }
                  title={activeMedia.title}
                  allow="autoplay; encrypted-media; fullscreen"
                  className="h-full w-full border-0"
                />
              ) : activeMedia.localDataUrl ? (
                <video
                  src={activeMedia.localDataUrl}
                  controls
                  autoPlay
                  className="h-full w-full"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-slate-400 text-sm">
                  Video stream loading...
                </div>
              )}
            </div>

            {/* Details Footer */}
            <div className="p-4 sm:p-5 space-y-2 bg-[#091524]">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-sky-400 px-2 py-0.5 font-bold text-black text-[11px]">
                    {activeMedia.category}
                  </span>
                  {activeMedia.swimmingLevel && (
                    <span className="rounded bg-amber-400 px-2 py-0.5 font-bold text-black text-[11px]">
                      {activeMedia.swimmingLevel}
                    </span>
                  )}
                </div>
                {activeMedia.driveViewUrl && (
                  <a
                    href={activeMedia.driveViewUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-sky-300 hover:underline font-bold"
                  >
                    Open in Google Drive <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {activeMedia.description && (
                <div className="rounded-xl border border-sky-500/20 bg-slate-900/80 p-3">
                  <p className="font-comic text-xs sm:text-sm text-slate-200 whitespace-pre-line leading-relaxed">
                    {activeMedia.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
