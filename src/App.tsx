import React, { useCallback, useEffect, useRef, useState } from "react";
import { AdminProvider, useAdmin } from "./context/AdminContext";
import { AdminTopBar } from "./components/admin/AdminTopBar";
import { AdminLoginModal } from "./components/admin/AdminLoginModal";
import { UniversalEditModal } from "./components/admin/UniversalEditModal";
import { AdminControlDrawer } from "./components/admin/AdminControlDrawer";

// Comic Story 1: Illustrated Edition (15 pages)
import { ComicPageSheet } from "./components/ComicPageSheet";
import { PanelZoomModal } from "./components/PanelZoomModal";
import { ComicPanelData } from "./data/comicStoryData";

// Comic Story 2: Vector Strip Edition (44 pages)
import { PageView, IMGS, VectorPanelZoomModal } from "./comic/Comic";
import type { Panel } from "./comic/types";
import { firstPageOfChapter } from "./comic/story";

// Dashboard 1: Aqua Slash Swim Book (Curriculum, 3D Pool & Glass)
import { SwimBookDashboard } from "./components/SwimBookDashboard";

// Dashboard 2: Swim Video & Media Library (Google Drive Integration)
import { SwimVideoDashboard } from "./components/SwimVideoDashboard";

// Dashboard 3: Swim Learning Resources & Technique Demonstrations
import { SwimLearningResources } from "./components/SwimLearningResources";
import { AppUpdateBanner } from "./components/AppUpdateBanner";
import { getSoundEnabled, setSoundEnabled, useSoundOn } from "./lib/sound";

// Audio & Utilities
import { comicAudio, speakText, stopSpeaking } from "./utils/comicAudio";
import {
  Volume2,
  VolumeX,
  BookOpen,
  Palette,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Plus,
  Lock,
  Film,
  Award,
  Sparkles,
  ShieldCheck,
  Maximize,
  Minimize,
} from "lucide-react";

type MainTab = "book" | "library";
type LibrarySubTab = "videos" | "comics" | "resources";
type StoryEdition = "illustrated" | "vector";

function VectorCover({
  onStart,
  onMenu,
}: {
  onStart: () => void;
  onMenu: () => void;
}) {
  const { vectorCover, isEditMode, openEditor } = useAdmin();

  return (
    <section className="page-in mx-auto w-full max-w-5xl overflow-hidden border-3 sm:border-[5px] border-black bg-black shadow-[4px_4px_0_rgba(0,0,0,.55)] sm:shadow-[10px_10px_0_rgba(0,0,0,.55)] rounded-2xl relative">
      {isEditMode && (
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30">
          <button
            onClick={() => openEditor({ type: "vector-cover" })}
            className="flex items-center gap-1.5 rounded-xl border-2 border-black bg-yellow-400 px-2.5 py-1 sm:px-3 sm:py-1.5 font-bangers text-xs sm:text-sm text-black shadow-[2px_2px_0_#000] hover:bg-yellow-300 cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" /> EDIT COVER
          </button>
        </div>
      )}

      <div className="relative min-h-[460px] h-[calc(100dvh-130px)] max-h-[640px] md:min-h-[720px] md:h-auto md:max-h-none">
        <img
          src={vectorCover.bgImage || IMGS.handwater}
          alt="A hand reaching into the river"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="halftone absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/25 to-black/90" />
        <div className="relative z-10 flex h-full flex-col items-center justify-between px-3 py-4 sm:px-4 sm:py-8 text-center">
          <div>
            <p className="inline-block -rotate-2 border-2 sm:border-[3px] border-black bg-yellow-300 px-3 py-0.5 sm:px-4 sm:py-1 font-bangers text-sm sm:text-lg tracking-widest text-black md:text-2xl shadow-[2px_2px_0_#000]">
              {vectorCover.badge}
            </p>
          </div>
          <div className="my-auto py-2">
            <h1 className="font-bangers text-4xl sm:text-6xl md:text-8xl uppercase leading-[0.92] tracking-wide text-white drop-shadow-[3px_3px_0_#111] [-webkit-text-stroke:2px_#111] [paint-order:stroke_fill]">
              {vectorCover.titleTop}
              <br />
              <span className="text-sky-300">{vectorCover.titleHighlight}</span>
            </h1>
            <p className="mx-auto mt-2 sm:mt-4 inline-block rotate-1 border-2 sm:border-[3px] border-black bg-white px-3 py-1 sm:px-4 sm:py-1.5 font-comic text-xs sm:text-base font-bold text-slate-900 md:text-xl shadow-[2px_2px_0_#000] max-w-sm sm:max-w-none">
              {vectorCover.subtitle}
            </p>
          </div>
          <div className="flex flex-col items-center gap-2 sm:gap-4 w-full">
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 w-full">
              <button
                onClick={onStart}
                className="float-y cursor-pointer border-3 sm:border-[4px] border-black bg-yellow-300 px-5 py-2.5 sm:px-8 sm:py-3.5 font-bangers text-lg sm:text-2xl md:text-3xl tracking-wider text-black shadow-[3px_3px_0_#111] transition active:translate-x-0.5 active:translate-y-0.5 hover:bg-yellow-400"
              >
                START READING STORY ▶
              </button>
              <button
                onClick={onMenu}
                className="cursor-pointer border-3 sm:border-[4px] border-black bg-white px-4 py-2.5 sm:px-6 sm:py-3.5 font-bangers text-base sm:text-xl md:text-2xl tracking-wider text-black shadow-[3px_3px_0_#111] transition active:translate-x-0.5 active:translate-y-0.5 hover:bg-slate-100"
              >
                CHAPTERS ☰
              </button>
            </div>

            <p className="font-bangers text-xs sm:text-lg tracking-widest text-sky-200 md:text-xl">
              14 CHAPTERS · 44 STORY PAGES
            </p>
            <p className="font-bangers text-[11px] sm:text-sm tracking-[0.15em] text-yellow-300 md:text-base hidden sm:block">
              {vectorCover.slogan}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function MainComicStoryApp() {
  const {
    illustratedPages,
    vectorPages,
    vectorChapters,
    isEditMode,
    addVectorPage,
    isAdmin,
    openLoginModal,
    logout,
  } = useAdmin();

  // Main Navigation: 1. 'book' (AQUA SLASH SWIM BOOK - Main App) | 2. 'library' (SWIM LIBRARY - Educational Resources)
  const [mainTab, setMainTab] = useState<MainTab>(() => {
    const h = (typeof window !== "undefined" ? window.location.hash : "").toLowerCase();
    if (h.includes("library") || h.includes("video") || h.includes("comic") || h.includes("resources")) return "library";
    return "book"; // SWIM BOOK is the main application and default active section!
  });

  // Educational Resources Sub-section inside SWIM LIBRARY
  const [librarySubTab, setLibrarySubTab] = useState<LibrarySubTab>(() => {
    const h = (typeof window !== "undefined" ? window.location.hash : "").toLowerCase();
    if (h.includes("comic")) return "comics";
    if (h.includes("resources") || h.includes("safety") || h.includes("technique")) return "resources";
    return "videos"; // Default resource tab inside Library is Videos
  });

  // Active Story Switcher: 'illustrated' (Comic 1) vs 'vector' (Comic 2)
  const [activeStory, setActiveStory] = useState<StoryEdition>(() => {
    const h = window.location.hash;
    if (h.includes("illustrated") || h.includes("comic1")) return "illustrated";
    return "vector";
  });

  // Story 1: Illustrated state
  const [illustratedIdx, setIllustratedIdx] = useState<number>(0);
  const [showVerbatimLines, setShowVerbatimLines] = useState<boolean>(true);
  const [inspectedPanel, setInspectedPanel] = useState<ComicPanelData | null>(null);
  const [isNarrating, setIsNarrating] = useState<boolean>(false);

  // Story 2: Vector state
  const [vectorView, setVectorView] = useState<number>(() => {
    const m = window.location.hash.match(/#p(\d+)/);
    if (!m) return 0;
    const n = parseInt(m[1], 10);
    return n >= 0 && n <= vectorPages.length ? n : 0;
  });
  const [vectorMenu, setVectorMenu] = useState<boolean>(false);
  const [inspectedVectorPanel, setInspectedVectorPanel] = useState<{
    panel: Panel;
    panelIndex: number;
  } | null>(null);

  // Comic Reading Experience: 'fit' (Single-screen responsive fit) vs 'scroll' (Vertical strip)
  const [viewMode, setViewMode] = useState<"fit" | "scroll">("fit");
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);

  // Sound (Single App-Wide Volume Toggle)
  const soundOn = useSoundOn();
  const [isMuted, setIsMuted] = useState<boolean>(() => !getSoundEnabled());

  useEffect(() => {
    setIsMuted(!soundOn);
    comicAudio.muted = !soundOn;
  }, [soundOn]);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const toggleFullScreen = () => {
    if (!isFullScreen) {
      setIsFullScreen(true);
      if (typeof document !== "undefined" && document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } else {
      setIsFullScreen(false);
      if (typeof document !== "undefined" && document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    touchStart.current = null;

    // Must be a definitive horizontal gesture (dx > 45px) and predominantly horizontal (dx > dy * 1.5)
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (activeStory === "illustrated") {
        if (dx < 0) handleNextIllustrated();
        else handlePrevIllustrated();
      } else {
        if (dx < 0) goVector(vectorView + 1);
        else goVector(vectorView - 1);
      }
    }
  };

  const switchStory = (edition: StoryEdition) => {
    comicAudio.playPageFlip();
    stopSpeaking();
    setIsNarrating(false);
    setActiveStory(edition);
    window.history.replaceState(
      null,
      "",
      edition === "illustrated" ? "#comic-illustrated" : "#comic-vector"
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleSound = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    comicAudio.muted = nextMuted;
    setSoundEnabled(!nextMuted);
    if (nextMuted) {
      stopSpeaking();
      setIsNarrating(false);
    } else {
      comicAudio.playWaterDrop();
    }
  };

  // Illustrated Navigation
  const handleNextIllustrated = () => {
    if (illustratedIdx < illustratedPages.length - 1) {
      comicAudio.playPageFlip();
      stopSpeaking();
      setIsNarrating(false);
      setIllustratedIdx((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevIllustrated = () => {
    if (illustratedIdx > 0) {
      comicAudio.playPageFlip();
      stopSpeaking();
      setIsNarrating(false);
      setIllustratedIdx((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleToggleNarrate = () => {
    if (isNarrating) {
      stopSpeaking();
      setIsNarrating(false);
      return;
    }
    const cur = illustratedPages[illustratedIdx];
    if (!cur) return;

    const fullScript = [
      `${cur.chapterCode}: ${cur.title}. ${cur.subtitle}.`,
      ...cur.panels.map(
        (p) => `Panel ${p.panelNumber}. ${p.narratorCaption}. ${p.storyLines.join(" ")}`
      ),
      `Key Takeaway: ${cur.summaryQuote}`,
    ].join(" ");

    setIsNarrating(true);
    speakText(fullScript, () => setIsNarrating(false));
  };

  // Vector Navigation
  const goVector = useCallback(
    (n: number) => {
      comicAudio.playPageFlip();
      const v = Math.max(0, Math.min(vectorPages.length, n));
      setVectorView(v);
      window.history.replaceState(null, "", v === 0 ? "#" : `#p${v}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [vectorPages.length]
  );

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (mainTab !== "library" || librarySubTab !== "comics") return;
      if (inspectedPanel || vectorMenu) return;
      if (activeStory === "illustrated") {
        if (e.key === "ArrowRight") handleNextIllustrated();
        if (e.key === "ArrowLeft") handlePrevIllustrated();
      } else {
        if (e.key === "ArrowRight" || e.key === "PageDown") goVector(vectorView + 1);
        if (e.key === "ArrowLeft" || e.key === "PageUp") goVector(vectorView - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mainTab, librarySubTab, activeStory, illustratedIdx, vectorView, inspectedPanel, vectorMenu, goVector]);

  const currentIllustrated = illustratedPages[illustratedIdx] || illustratedPages[0];
  const vectorPage = vectorView > 0 ? vectorPages[vectorView - 1] : null;
  const vectorTotal = vectorPages.length;
  const vectorPct = (vectorView / vectorTotal) * 100;
  const currentVectorChapter = vectorPage
    ? vectorChapters.find((c) => c.n === vectorPage.ch)
    : null;

  return (
    <div
      className="min-h-screen bg-[#071328] pb-28 text-slate-100 flex flex-col"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <AppUpdateBanner />

      {/* 1. Admin Master Top Bar */}
      <AdminTopBar />

      {/* 2. Top Navigation Bar: AQUA SLASH – SWIM BOOK with Section 2: SWIM LIBRARY */}
      <header className="relative md:sticky md:top-0 z-40 border-b-4 border-black bg-yellow-300 shadow-lg">
        <div className="mx-auto max-w-7xl px-2.5 sm:px-3 py-1.5 sm:py-2">
          {/* Top Row: Logo & Title (Left) + Sound & Lock Controls (Right) */}
          <div className="flex items-center justify-between gap-2">
            {/* Branding: AQUA SLASH – SWIM BOOK */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
              <span className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl border-2 sm:border-3 border-black bg-white shadow-[2px_2px_0_#000] text-base sm:text-xl">
                🏊
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bangers text-lg sm:text-2xl tracking-wider text-black">
                    AQUA SLASH
                  </span>
                  <span className="rounded bg-black px-1.5 sm:px-2 py-0.2 sm:py-0.5 font-bangers text-[11px] sm:text-sm tracking-wider text-yellow-300 shadow-[1px_1px_0_rgba(0,0,0,0.25)]">
                    SWIM BOOK
                  </span>
                </div>
                <p className="hidden md:block font-comic text-[11px] font-bold text-slate-800 leading-none mt-0.5">
                  Primary Swimming Platform & Journey
                </p>
              </div>
            </div>

            {/* Desktop Navigation (in center/right on md+) */}
            <div className="hidden md:flex items-center gap-2 rounded-2xl border-3 border-black bg-white p-1 shadow-[3px_3px_0_#000]">
              <button
                onClick={() => {
                  comicAudio.playPageFlip();
                  stopSpeaking();
                  setIsNarrating(false);
                  setMainTab("book");
                  window.history.replaceState(null, "", "#swim-book");
                }}
                className={`flex items-center gap-2 rounded-xl px-4 py-1.5 font-bangers text-sm lg:text-base tracking-wider transition cursor-pointer ${
                  mainTab === "book"
                    ? "bg-cyan-400 text-black border-2 border-black shadow-[2px_2px_0_#000]"
                    : "text-slate-700 hover:text-black hover:bg-slate-100"
                }`}
              >
                <span>🏊 1. SWIM BOOK</span>
                {mainTab === "book" && (
                  <span className="rounded bg-black px-1.5 py-0.2 text-[10px] font-comic font-black text-white">
                    MAIN
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  comicAudio.playPageFlip();
                  stopSpeaking();
                  setIsNarrating(false);
                  setMainTab("library");
                  window.history.replaceState(null, "", "#swim-library");
                }}
                className={`flex items-center gap-2 rounded-xl px-4 py-1.5 font-bangers text-sm lg:text-base tracking-wider transition cursor-pointer ${
                  mainTab === "library"
                    ? "bg-yellow-400 text-black border-2 border-black shadow-[2px_2px_0_#000]"
                    : "text-slate-700 hover:text-black hover:bg-slate-100"
                }`}
              >
                <span>📚 2. SWIM LIBRARY</span>
                <span className="rounded bg-sky-200 border border-black/40 px-1.5 py-0.2 text-[10px] font-comic font-bold text-slate-800">
                  RESOURCES
                </span>
              </button>
            </div>

            {/* Right Controls: Fullscreen (if on comic) + Sound + Lock */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {mainTab === "library" && librarySubTab === "comics" && (
                <button
                  onClick={toggleFullScreen}
                  title="Full-Screen Reading Mode"
                  className="rounded-xl border-2 border-black bg-black px-2 sm:px-2.5 py-1 sm:py-1.5 font-bangers text-xs sm:text-sm text-yellow-300 shadow-[2px_2px_0_#000] hover:bg-slate-800 cursor-pointer flex items-center gap-1"
                >
                  <Maximize className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">FULLSCREEN</span>
                </button>
              )}

              <button
                onClick={toggleSound}
                aria-label={isMuted ? "Unmute Audio" : "Mute Audio"}
                className="rounded-xl border-2 border-black bg-white p-1.5 sm:p-2 text-black shadow-[2px_2px_0_#000] hover:bg-slate-100 cursor-pointer"
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
              </button>

              {!isAdmin ? (
                <button
                  onClick={openLoginModal}
                  title="Admin Login"
                  className="rounded-xl border-2 border-black bg-white px-2 sm:px-2.5 py-1 sm:py-1.5 text-slate-800 shadow-[2px_2px_0_#000] hover:bg-yellow-200 cursor-pointer flex items-center gap-1 font-comic text-xs font-bold"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Admin</span>
                </button>
              ) : (
                <button
                  onClick={logout}
                  title="Lock & Exit Admin"
                  className="rounded-xl border-2 border-black bg-rose-500 px-2 sm:px-2.5 py-1 sm:py-1.5 text-white shadow-[2px_2px_0_#000] hover:bg-rose-600 cursor-pointer flex items-center gap-1 font-comic text-xs font-bold"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Lock</span>
                </button>
              )}
            </div>
          </div>

          {/* Mobile Main Tab Switcher (Visible only on < md) */}
          <div className="grid grid-cols-2 gap-1.5 pt-1.5 md:hidden">
            <button
              onClick={() => {
                comicAudio.playPageFlip();
                stopSpeaking();
                setIsNarrating(false);
                setMainTab("book");
                window.history.replaceState(null, "", "#swim-book");
              }}
              className={`flex items-center justify-center gap-1 rounded-xl py-1.5 px-2 font-bangers text-xs tracking-wider transition cursor-pointer border-2 border-black ${
                mainTab === "book"
                  ? "bg-cyan-400 text-black shadow-[2px_2px_0_#000]"
                  : "bg-white/80 text-slate-800"
              }`}
            >
              <span>🏊 1. SWIM BOOK</span>
              {mainTab === "book" && (
                <span className="rounded bg-black px-1 py-0.2 text-[9px] font-comic font-black text-white">
                  MAIN
                </span>
              )}
            </button>

            <button
              onClick={() => {
                comicAudio.playPageFlip();
                stopSpeaking();
                setIsNarrating(false);
                setMainTab("library");
                window.history.replaceState(null, "", "#swim-library");
              }}
              className={`flex items-center justify-center gap-1 rounded-xl py-1.5 px-2 font-bangers text-xs tracking-wider transition cursor-pointer border-2 border-black ${
                mainTab === "library"
                  ? "bg-yellow-400 text-black shadow-[2px_2px_0_#000]"
                  : "bg-white/80 text-slate-800"
              }`}
            >
              <span>📚 2. SWIM LIBRARY</span>
            </button>
          </div>
        </div>

        {/* Educational Resources Sub-Bar (Shown when on SWIM LIBRARY) */}
        {mainTab === "library" && (
          <div className="border-t-2 border-black/20 bg-slate-900 px-2 sm:px-3 py-1.5 sm:py-2 text-white shadow-inner">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-2">
              <div className="flex items-center gap-1 sm:gap-2 w-full md:w-auto">
                <span className="font-bangers text-xs sm:text-sm tracking-wider text-yellow-300 hidden md:inline">
                  📚 EDUCATIONAL RESOURCES:
                </span>
                <div className="grid grid-cols-3 gap-1 sm:flex sm:items-center sm:gap-1.5 w-full md:w-auto">
                  <button
                    onClick={() => {
                      comicAudio.playPageFlip();
                      setLibrarySubTab("videos");
                      window.history.replaceState(null, "", "#swim-videos");
                    }}
                    className={`flex items-center justify-center gap-1 rounded-lg border-2 border-black py-1 px-1.5 sm:px-3 font-bangers text-[11px] sm:text-sm tracking-wider transition cursor-pointer ${
                      librarySubTab === "videos"
                        ? "bg-sky-400 text-black shadow-[2px_2px_0_#000]"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                    }`}
                  >
                    <Film className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    <span>VIDEOS</span>
                  </button>

                  <button
                    onClick={() => {
                      comicAudio.playPageFlip();
                      setLibrarySubTab("comics");
                      window.history.replaceState(null, "", "#swim-comics");
                    }}
                    className={`flex items-center justify-center gap-1 rounded-lg border-2 border-black py-1 px-1.5 sm:px-3 font-bangers text-[11px] sm:text-sm tracking-wider transition cursor-pointer ${
                      librarySubTab === "comics"
                        ? "bg-yellow-400 text-black shadow-[2px_2px_0_#000]"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                    }`}
                  >
                    <BookOpen className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    <span>COMICS (59P)</span>
                  </button>

                  <button
                    onClick={() => {
                      comicAudio.playPageFlip();
                      setLibrarySubTab("resources");
                      window.history.replaceState(null, "", "#swim-resources");
                    }}
                    className={`flex items-center justify-center gap-1 rounded-lg border-2 border-black py-1 px-1.5 sm:px-3 font-bangers text-[11px] sm:text-sm tracking-wider transition cursor-pointer ${
                      librarySubTab === "resources"
                        ? "bg-emerald-400 text-black shadow-[2px_2px_0_#000]"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                    }`}
                  >
                    <Award className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    <span>TECHNIQUES</span>
                  </button>
                </div>
              </div>

              <div className="font-comic text-xs font-bold text-slate-300 hidden md:block">
                Aqua Slash Swim Book · Section 2: Educational Resources
              </div>
            </div>
          </div>
        )}

        {/* Comic Edition Sub-Bar (Shown when on SWIM LIBRARY -> COMICS) */}
        {mainTab === "library" && librarySubTab === "comics" && (
          <div className="border-t-2 border-black/20 bg-[#fde047] px-2 sm:px-3 py-1 sm:py-1.5">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-1.5">
              <div className="grid grid-cols-2 gap-1.5 sm:flex sm:items-center sm:gap-2 flex-1 sm:flex-initial">
                <button
                  onClick={() => switchStory("illustrated")}
                  className={`flex items-center justify-center gap-1 rounded-lg border-2 border-black px-2 py-1 font-bangers text-[11px] sm:text-sm tracking-wider transition cursor-pointer ${
                    activeStory === "illustrated"
                      ? "bg-black text-yellow-300 shadow-[2px_2px_0_#000]"
                      : "bg-white text-black hover:bg-slate-100"
                  }`}
                >
                  <BookOpen className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span>1. ILLUSTRATED ({illustratedPages.length}P)</span>
                </button>

                <button
                  onClick={() => switchStory("vector")}
                  className={`flex items-center justify-center gap-1 rounded-lg border-2 border-black px-2 py-1 font-bangers text-[11px] sm:text-sm tracking-wider transition cursor-pointer ${
                    activeStory === "vector"
                      ? "bg-black text-yellow-300 shadow-[2px_2px_0_#000]"
                      : "bg-white text-black hover:bg-slate-100"
                  }`}
                >
                  <Palette className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span>2. VECTOR ({vectorPages.length}P)</span>
                </button>
              </div>

              {/* View Mode Toggle: Fit Page vs Scroll */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => setViewMode(viewMode === 'fit' ? 'scroll' : 'fit')}
                  className="rounded-lg border-2 border-black bg-white px-2 py-1 font-bangers text-[11px] sm:text-xs text-black shadow-[1px_1px_0_#000] hover:bg-slate-100 cursor-pointer"
                  title="Toggle single screen fit vs continuous scroll"
                >
                  {viewMode === 'fit' ? '📱 FIT PAGE' : '📜 SCROLL'}
                </button>

                <div className="hidden sm:block font-comic text-xs font-bold text-slate-900">
                  {activeStory === "illustrated"
                    ? `Page ${illustratedIdx + 1} of ${illustratedPages.length}`
                    : vectorView === 0
                    ? "Cover"
                    : `Page ${vectorView} of ${vectorTotal}`}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Progress bar (when on comic) */}
        {mainTab === "library" && librarySubTab === "comics" && (
          <div className="h-1.5 bg-black/30">
            <div
              className="h-full bg-sky-500 transition-all duration-300"
              style={{
                width:
                  activeStory === "illustrated"
                    ? `${((illustratedIdx + 1) / illustratedPages.length) * 100}%`
                    : `${vectorPct}%`,
              }}
            />
          </div>
        )}
      </header>

      {/* ========================================================
          1. MAIN APPLICATION: AQUA SLASH SWIM BOOK
             Contains Student Dashboard, Progress, 3D Pool & Glass,
             108 Drops Curriculum, Programs & Feedback
         ======================================================== */}
      {mainTab === "book" && (
        <SwimBookDashboard onOpenLibrary={() => setMainTab("library")} />
      )}

      {/* ========================================================
          2. EDUCATIONAL RESOURCES: SWIM LIBRARY SECTION
         ======================================================== */}
      {/* 2a. Swim Videos (1080p Video Library & Google Drive sync) */}
      {mainTab === "library" && librarySubTab === "videos" && (
        <SwimVideoDashboard />
      )}

      {/* 2b. Technique Demonstrations & Water Safety Education */}
      {mainTab === "library" && librarySubTab === "resources" && (
        <SwimLearningResources
          onGoVideos={() => setLibrarySubTab("videos")}
          onGoComics={() => setLibrarySubTab("comics")}
        />
      )}

      {/* 2c. Swim Comics: Illustrated Edition */}
      {mainTab === "library" && librarySubTab === "comics" && activeStory === "illustrated" && (
        <main className="flex-1 mx-auto max-w-5xl w-full px-2 sm:px-3 py-3 sm:py-6">
          {/* Story 1 Controller Bar */}
          <div className="mb-3 sm:mb-4 flex flex-wrap items-center justify-between gap-2 sm:gap-3 rounded-xl border-2 sm:border-3 border-black bg-slate-900 p-2 sm:p-3 shadow-[3px_3px_0_#000]">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                disabled={illustratedIdx === 0}
                onClick={handlePrevIllustrated}
                className="flex items-center gap-1 rounded-lg border-2 border-black bg-sky-300 px-2.5 sm:px-3 py-1 font-bangers text-xs sm:text-sm text-black shadow-[2px_2px_0_#000] hover:bg-sky-400 disabled:opacity-40 cursor-pointer min-h-9"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> PREV
              </button>
              <span className="font-bangers text-xs sm:text-base tracking-wider text-yellow-300">
                PAGE {illustratedIdx + 1} / {illustratedPages.length}
              </span>
              <button
                disabled={illustratedIdx === illustratedPages.length - 1}
                onClick={handleNextIllustrated}
                className="flex items-center gap-1 rounded-lg border-2 border-black bg-yellow-300 px-2.5 sm:px-3 py-1 font-bangers text-xs sm:text-sm text-black shadow-[2px_2px_0_#000] hover:bg-yellow-400 disabled:opacity-40 cursor-pointer min-h-9"
              >
                NEXT <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <select
                value={illustratedIdx}
                onChange={(e) => {
                  comicAudio.playPageFlip();
                  stopSpeaking();
                  setIllustratedIdx(Number(e.target.value));
                }}
                className="rounded-lg border-2 border-black bg-slate-950 px-2 py-1 text-xs text-white font-bold focus:outline-none focus:border-yellow-300 max-w-[140px] sm:max-w-none truncate"
              >
                {illustratedPages.map((p, idx) => (
                  <option key={p.pageNumber} value={idx}>
                    P{p.pageNumber}: {p.title}
                  </option>
                ))}
              </select>

              <button
                onClick={toggleFullScreen}
                title="Full-Screen Reading"
                className="rounded-lg border-2 border-black bg-black px-2 py-1 font-bangers text-xs text-yellow-300 shadow-[1px_1px_0_#000] hover:bg-slate-800 cursor-pointer flex items-center gap-1"
              >
                <Maximize className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">FULLSCREEN</span>
              </button>
            </div>
          </div>

          {/* Illustrated Comic Sheet */}
          <ComicPageSheet
            page={currentIllustrated}
            showVerbatimLines={showVerbatimLines}
            onInspectPanel={(panel) => setInspectedPanel(panel)}
            isNarratingPage={isNarrating}
            onToggleNarratePage={handleToggleNarrate}
            viewMode={viewMode}
          />
        </main>
      )}

      {/* 5. STORY 2: VECTOR STRIP EDITION */}
      {mainTab === "library" && librarySubTab === "comics" && activeStory === "vector" && (
        <main className="flex-1 px-1.5 py-3 sm:px-4 sm:py-6">
          {/* Sub Header for Story 2 */}
          <div className="mx-auto max-w-5xl mb-3 flex flex-wrap items-center justify-between gap-2 sm:gap-3 rounded-xl border-2 sm:border-3 border-black bg-slate-900 p-2 sm:p-3 shadow-[3px_3px_0_#000]">
            <div className="flex items-center gap-2">
              <select
                value={vectorView}
                onChange={(e) => goVector(Number(e.target.value))}
                className="rounded-lg border-2 border-black bg-white px-2 py-1 font-bangers text-xs text-black shadow-[2px_2px_0_#000] focus:outline-none"
              >
                <option value={0}>★ Cover Page</option>
                {vectorPages.map((p, idx) => (
                  <option key={idx} value={idx + 1}>
                    Page {idx + 1}: Ch. {p.ch}
                  </option>
                ))}
              </select>

              {isEditMode && (
                <button
                  onClick={() => addVectorPage(vectorView > 0 ? vectorView - 1 : 0)}
                  className="flex items-center gap-1 rounded-lg border-2 border-black bg-emerald-400 px-2 py-1 font-bangers text-xs text-black shadow-[2px_2px_0_#000] hover:bg-emerald-300 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> ADD PAGE
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={toggleFullScreen}
                title="Full-Screen Reading"
                className="cursor-pointer rounded-lg border-2 border-black bg-black px-2.5 py-1 font-bangers text-xs text-yellow-300 shadow-[2px_2px_0_#000] hover:bg-slate-800 flex items-center gap-1"
              >
                <Maximize className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">FULLSCREEN</span>
              </button>

              <button
                onClick={() => setVectorMenu(true)}
                className="cursor-pointer rounded-lg border-2 border-black bg-white px-2.5 py-1 font-bangers text-xs tracking-wider text-black shadow-[2px_2px_0_#000] hover:bg-slate-100"
              >
                14 CHAPTERS ☰
              </button>
            </div>
          </div>

          {vectorPage ? (
            <PageView
              key={vectorView}
              page={vectorPage}
              index={vectorView - 1}
              total={vectorTotal}
              viewMode={viewMode}
              onInspectPanel={(panel, panelIndex) =>
                setInspectedVectorPanel({ panel, panelIndex })
              }
            />
          ) : (
            <VectorCover
              key="cover"
              onStart={() => goVector(1)}
              onMenu={() => setVectorMenu(true)}
            />
          )}

          {vectorView === vectorTotal && (
            <div className="mt-8 text-center space-y-3">
              <button
                onClick={() => goVector(0)}
                className="cursor-pointer border-[4px] border-black bg-yellow-300 px-8 py-3.5 font-bangers text-2xl tracking-wider text-black shadow-[5px_5px_0_#111] hover:bg-yellow-400 active:translate-x-1 active:translate-y-1"
              >
                ↺ READ STORY AGAIN
              </button>
            </div>
          )}
        </main>
      )}

      {/* 6. Fixed Bottom Navigation for Story 1 (Illustrated) */}
      {mainTab === "library" && librarySubTab === "comics" && activeStory === "illustrated" && !isFullScreen && (
        <nav className="fixed inset-x-0 bottom-0 z-40 border-t-3 sm:border-t-4 border-black bg-white/95 backdrop-blur shadow-[0_-4px_10px_rgba(0,0,0,0.15)]">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 sm:py-2.5">
            <button
              disabled={illustratedIdx === 0}
              onClick={handlePrevIllustrated}
              className="cursor-pointer border-2 sm:border-[3px] border-black bg-sky-300 px-3.5 sm:px-5 py-1.5 font-bangers text-base sm:text-lg tracking-wider text-black shadow-[2px_2px_0_#111] transition active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-35 hover:bg-sky-400 min-h-11 flex items-center"
            >
              ◀ PREV
            </button>

            <div className="min-w-0 text-center leading-tight">
              <div className="font-bangers text-sm sm:text-lg tracking-wider text-black">
                PAGE {illustratedIdx + 1} / {illustratedPages.length}
              </div>
              <div className="truncate font-comic text-[10px] sm:text-xs font-bold text-slate-700 max-w-[140px] sm:max-w-none">
                {currentIllustrated.title}
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={toggleFullScreen}
                title="Full-Screen Reading Mode"
                className="cursor-pointer border-2 sm:border-[3px] border-black bg-black px-2.5 py-1.5 font-bangers text-xs sm:text-sm text-yellow-300 shadow-[2px_2px_0_#111] hover:bg-slate-800 min-h-11 flex items-center gap-1"
              >
                <Maximize className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">FULLSCREEN</span>
              </button>

              <button
                disabled={illustratedIdx === illustratedPages.length - 1}
                onClick={handleNextIllustrated}
                className="cursor-pointer border-2 sm:border-[3px] border-black bg-yellow-300 px-3.5 sm:px-5 py-1.5 font-bangers text-base sm:text-lg tracking-wider text-black shadow-[2px_2px_0_#111] transition active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-35 hover:bg-yellow-400 min-h-11 flex items-center"
              >
                NEXT ▶
              </button>
            </div>
          </div>
        </nav>
      )}

      {/* 6. Fixed Bottom Nav for Story 2 (Vector) */}
      {mainTab === "library" && librarySubTab === "comics" && activeStory === "vector" && !isFullScreen && (
        <nav className="fixed inset-x-0 bottom-0 z-40 border-t-3 sm:border-t-4 border-black bg-white/95 backdrop-blur shadow-[0_-4px_10px_rgba(0,0,0,0.15)]">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 sm:py-2.5">
            <button
              disabled={vectorView === 0}
              onClick={() => goVector(vectorView - 1)}
              className="cursor-pointer border-2 sm:border-[3px] border-black bg-sky-300 px-3.5 sm:px-5 py-1.5 font-bangers text-base sm:text-lg tracking-wider text-black shadow-[2px_2px_0_#111] transition active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-35 hover:bg-sky-400 min-h-11 flex items-center"
            >
              ◀ PREV
            </button>

            <div className="min-w-0 text-center leading-tight">
              <div className="font-bangers text-sm sm:text-lg tracking-wider text-black">
                {vectorView === 0 ? "COVER PAGE" : `PAGE ${vectorView} / ${vectorTotal}`}
              </div>
              {vectorPage && currentVectorChapter && (
                <div className="truncate font-comic text-[10px] sm:text-xs font-bold text-slate-700 max-w-[140px] sm:max-w-none">
                  Ch. {vectorPage.ch} · {currentVectorChapter.title}
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={toggleFullScreen}
                title="Full-Screen Reading Mode"
                className="cursor-pointer border-2 sm:border-[3px] border-black bg-black px-2.5 py-1.5 font-bangers text-xs sm:text-sm text-yellow-300 shadow-[2px_2px_0_#111] hover:bg-slate-800 min-h-11 flex items-center gap-1"
              >
                <Maximize className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">FULLSCREEN</span>
              </button>

              <button
                disabled={vectorView === vectorTotal}
                onClick={() => goVector(vectorView + 1)}
                className="cursor-pointer border-2 sm:border-[3px] border-black bg-yellow-300 px-3.5 sm:px-5 py-1.5 font-bangers text-base sm:text-lg tracking-wider text-black shadow-[2px_2px_0_#111] transition active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-35 hover:bg-yellow-400 min-h-11 flex items-center"
              >
                {vectorView === 0 ? "START ▶" : "NEXT ▶"}
              </button>
            </div>
          </div>
        </nav>
      )}

      {/* ========================================================
          7. FULL-SCREEN DEDICATED COMIC READING MODE
         ======================================================== */}
      {isFullScreen && (
        <div className="fixed inset-0 z-50 bg-[#050B14] flex flex-col justify-between overflow-hidden select-none">
          {/* Top Floating Controls */}
          <div className="z-20 flex items-center justify-between border-b-2 border-black bg-yellow-300 px-3 py-2 text-black shadow-md">
            <div className="flex items-center gap-2">
              <button
                onClick={toggleFullScreen}
                className="flex items-center gap-1 rounded-lg border-2 border-black bg-rose-500 px-2.5 py-1 font-bangers text-xs sm:text-sm text-white shadow-[2px_2px_0_#000] hover:bg-rose-600 cursor-pointer"
              >
                ✕ EXIT FULLSCREEN
              </button>

              <span className="font-bangers text-xs sm:text-base tracking-wider text-black truncate max-w-[150px] sm:max-w-none">
                {activeStory === "illustrated"
                  ? `Illustrated • Page ${illustratedIdx + 1} / ${illustratedPages.length}`
                  : vectorView === 0
                  ? "Cover Page"
                  : `Ch. ${vectorPage?.ch} • Page ${vectorView} / ${vectorTotal}`}
              </span>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => setViewMode(viewMode === "fit" ? "scroll" : "fit")}
                className="flex items-center gap-1 rounded-lg border-2 border-black bg-white px-2 py-1 font-bangers text-xs text-black shadow-[1px_1px_0_#000] hover:bg-slate-100 cursor-pointer"
                title="Toggle between single-screen fit and scroll mode"
              >
                {viewMode === "fit" ? "📱 FIT PAGE" : "📜 SCROLL"}
              </button>

              <button
                onClick={toggleSound}
                className="rounded-lg border-2 border-black bg-white p-1 text-black shadow-[1px_1px_0_#000] hover:bg-slate-100 cursor-pointer"
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              {activeStory === "vector" && (
                <button
                  onClick={() => setVectorMenu(true)}
                  className="rounded-lg border-2 border-black bg-white px-2 py-1 font-bangers text-xs text-black shadow-[1px_1px_0_#000] hover:bg-slate-100 cursor-pointer"
                >
                  ☰
                </button>
              )}
            </div>
          </div>

          {/* Fullscreen Comic Viewport */}
          <div
            className="flex-1 overflow-auto flex items-center justify-center p-1 sm:p-3"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div className="w-full max-w-5xl my-auto">
              {activeStory === "illustrated" ? (
                <ComicPageSheet
                  page={currentIllustrated}
                  showVerbatimLines={showVerbatimLines}
                  onInspectPanel={(panel) => setInspectedPanel(panel)}
                  isNarratingPage={isNarrating}
                  onToggleNarratePage={handleToggleNarrate}
                  viewMode={viewMode}
                />
              ) : vectorPage ? (
                <PageView
                  key={vectorView}
                  page={vectorPage}
                  index={vectorView - 1}
                  total={vectorTotal}
                  viewMode={viewMode}
                  onInspectPanel={(panel, panelIndex) =>
                    setInspectedVectorPanel({ panel, panelIndex })
                  }
                />
              ) : (
                <VectorCover
                  key="cover"
                  onStart={() => goVector(1)}
                  onMenu={() => setVectorMenu(true)}
                />
              )}
            </div>
          </div>

          {/* Fullscreen Floating Bottom Bar */}
          <div className="z-20 border-t-3 border-black bg-white/95 px-3 py-2 backdrop-blur shadow-lg">
            <div className="mx-auto flex max-w-4xl items-center justify-between gap-2">
              <button
                disabled={activeStory === "illustrated" ? illustratedIdx === 0 : vectorView === 0}
                onClick={activeStory === "illustrated" ? handlePrevIllustrated : () => goVector(vectorView - 1)}
                className="flex items-center gap-1 rounded-xl border-2 border-black bg-sky-300 px-4 py-2 font-bangers text-base sm:text-lg text-black shadow-[2px_2px_0_#000] hover:bg-sky-400 disabled:opacity-35 cursor-pointer min-h-11"
              >
                ◀ PREV
              </button>

              <div className="text-center font-bangers text-sm sm:text-base text-black">
                {activeStory === "illustrated"
                  ? `PAGE ${illustratedIdx + 1} / ${illustratedPages.length}`
                  : vectorView === 0
                  ? "COVER"
                  : `PAGE ${vectorView} / ${vectorTotal}`}
              </div>

              <button
                disabled={
                  activeStory === "illustrated"
                    ? illustratedIdx === illustratedPages.length - 1
                    : vectorView === vectorTotal
                }
                onClick={activeStory === "illustrated" ? handleNextIllustrated : () => goVector(vectorView + 1)}
                className="flex items-center gap-1 rounded-xl border-2 border-black bg-yellow-300 px-4 py-2 font-bangers text-base sm:text-lg text-black shadow-[2px_2px_0_#000] hover:bg-yellow-400 disabled:opacity-35 cursor-pointer min-h-11"
              >
                {activeStory === "vector" && vectorView === 0 ? "START ▶" : "NEXT ▶"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Illustrated Panel Zoom Modal */}
      {inspectedPanel && (
        <PanelZoomModal
          page={currentIllustrated}
          panel={inspectedPanel}
          onClose={() => setInspectedPanel(null)}
          onSelectPanel={(pNum) => {
            const p = currentIllustrated.panels[pNum - 1];
            if (p) setInspectedPanel(p);
          }}
        />
      )}

      {/* 9. Vector Panel Zoom Modal */}
      {inspectedVectorPanel && vectorPage && (
        <VectorPanelZoomModal
          panel={inspectedVectorPanel.panel}
          panelIndex={inspectedVectorPanel.panelIndex}
          ch={vectorPage.ch}
          chTitle={currentVectorChapter?.title || `Chapter ${vectorPage.ch}`}
          pageIndex={vectorView - 1}
          onClose={() => setInspectedVectorPanel(null)}
        />
      )}

      {/* 7. Vector Chapter Menu Modal */}
      {vectorMenu && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-0 sm:items-center sm:p-4 backdrop-blur-sm"
          onClick={() => setVectorMenu(false)}
        >
          <div
            className="max-h-[85vh] w-full max-w-xl overflow-y-auto border-[5px] border-black bg-[#fffaf0] p-4 text-slate-900 shadow-[8px_8px_0_#000] rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between border-b-2 border-black pb-2">
              <h3 className="font-bangers text-3xl tracking-wide">
                STORY CHAPTERS (14)
              </h3>
              <button
                onClick={() => setVectorMenu(false)}
                className="cursor-pointer border-[3px] border-black bg-red-400 px-3 font-bangers text-xl text-black hover:bg-red-500 rounded"
              >
                ✕
              </button>
            </div>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => {
                    goVector(0);
                    setVectorMenu(false);
                  }}
                  className="flex w-full cursor-pointer items-center gap-3 border-[3px] border-black bg-white p-2.5 text-left hover:bg-sky-100 rounded-xl"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center bg-black font-bangers text-lg text-yellow-300 rounded">
                    ★
                  </span>
                  <span className="font-comic font-bold text-sm">Cover Page</span>
                </button>
              </li>
              {vectorChapters.map((c) => {
                const fp = firstPageOfChapter(c.n) + 1;
                const active = vectorPage?.ch === c.n;
                return (
                  <li key={c.n}>
                    <button
                      onClick={() => {
                        goVector(fp);
                        setVectorMenu(false);
                      }}
                      className={`flex w-full cursor-pointer items-center gap-3 border-[3px] border-black p-2.5 text-left transition hover:bg-yellow-100 rounded-xl ${
                        active ? "bg-yellow-200" : "bg-white"
                      }`}
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center bg-black font-bangers text-lg text-yellow-300 rounded">
                        {c.n}
                      </span>
                      <span className="flex-1 font-comic text-sm font-bold leading-tight">
                        {c.title}
                      </span>
                      <span className="font-bangers text-sm text-slate-500">
                        p.{fp}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}

      {/* 8. Admin Authentication & Edit Modals */}
      <AdminLoginModal />
      <UniversalEditModal />
      <AdminControlDrawer />
    </div>
  );
}

export default function App() {
  return (
    <AdminProvider>
      <MainComicStoryApp />
    </AdminProvider>
  );
}
