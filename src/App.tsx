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
import { PageView, IMGS } from "./comic/Comic";
import { firstPageOfChapter } from "./comic/story";

// Dashboard 1: Aqua Slash Swim Book (Curriculum, 3D Pool & Glass)
import { SwimBookDashboard } from "./components/SwimBookDashboard";

// Dashboard 2: Swim Video & Media Library (Google Drive Integration)
import { SwimVideoDashboard } from "./components/SwimVideoDashboard";

// Dashboard 3: Swim Learning Resources & Technique Demonstrations
import { SwimLearningResources } from "./components/SwimLearningResources";

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
    <section className="page-in mx-auto w-full max-w-5xl overflow-hidden border-[5px] border-black bg-black shadow-[10px_10px_0_rgba(0,0,0,.55)] rounded-2xl relative">
      {isEditMode && (
        <div className="absolute top-4 right-4 z-30">
          <button
            onClick={() => openEditor({ type: "vector-cover" })}
            className="flex items-center gap-1.5 rounded-xl border-2 border-black bg-yellow-400 px-3 py-1.5 font-bangers text-sm text-black shadow-[3px_3px_0_#000] hover:bg-yellow-300 cursor-pointer"
          >
            <Edit2 className="w-4 h-4" /> EDIT COVER HEADLINES & IMAGE
          </button>
        </div>
      )}

      <div className="relative min-h-[620px] md:min-h-[720px]">
        <img
          src={vectorCover.bgImage || IMGS.handwater}
          alt="A hand reaching into the river"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="halftone absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/20 to-black/90" />
        <div className="relative z-10 flex min-h-[620px] flex-col items-center justify-between px-4 py-8 text-center md:min-h-[720px]">
          <div>
            <p className="inline-block -rotate-2 border-[3px] border-black bg-yellow-300 px-4 py-1 font-bangers text-lg tracking-widest text-black md:text-2xl shadow-[3px_3px_0_#000]">
              {vectorCover.badge}
            </p>
          </div>
          <div>
            <h1 className="font-bangers text-6xl uppercase leading-[0.9] tracking-wide text-white drop-shadow-[5px_5px_0_#111] [-webkit-text-stroke:3px_#111] [paint-order:stroke_fill] sm:text-7xl md:text-8xl">
              {vectorCover.titleTop}
              <br />
              <span className="text-sky-300">{vectorCover.titleHighlight}</span>
            </h1>
            <p className="mx-auto mt-4 inline-block rotate-1 border-[3px] border-black bg-white px-4 py-1.5 font-comic text-base font-bold text-slate-900 md:text-xl shadow-[3px_3px_0_#000]">
              {vectorCover.subtitle}
            </p>
          </div>
          <div className="flex flex-col items-center gap-4">
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={onStart}
                className="float-y cursor-pointer border-[4px] border-black bg-yellow-300 px-8 py-3.5 font-bangers text-2xl tracking-wider text-black shadow-[5px_5px_0_#111] transition active:translate-x-1 active:translate-y-1 active:shadow-none md:text-3xl hover:bg-yellow-400"
              >
                START READING STORY ▶
              </button>
              <button
                onClick={onMenu}
                className="cursor-pointer border-[4px] border-black bg-white px-6 py-3.5 font-bangers text-xl tracking-wider text-black shadow-[5px_5px_0_#111] transition active:translate-x-1 active:translate-y-1 active:shadow-none md:text-2xl hover:bg-slate-100"
              >
                CHAPTERS ☰
              </button>
            </div>

            <p className="font-bangers text-lg tracking-widest text-sky-200 md:text-xl">
              14 CHAPTERS · 44 STORY PAGES
            </p>
            <p className="font-bangers text-sm tracking-[0.2em] text-yellow-300 md:text-base">
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

  // Sound
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const touch = useRef<number | null>(null);

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
    const next = !isMuted;
    setIsMuted(next);
    comicAudio.muted = next;
    if (next) {
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
      onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touch.current == null) return;
        const dx = e.changedTouches[0].clientX - touch.current;
        touch.current = null;
        if (Math.abs(dx) > 90) {
          if (activeStory === "illustrated") {
            if (dx < 0) handleNextIllustrated();
            else handlePrevIllustrated();
          } else {
            goVector(vectorView + (dx < 0 ? 1 : -1));
          }
        }
      }}
    >
      {/* 1. Admin Master Top Bar */}
      <AdminTopBar />

      {/* 2. Top Navigation Bar: AQUA SLASH – SWIM BOOK with Section 2: SWIM LIBRARY */}
      <header className="sticky top-0 z-40 border-b-4 border-black bg-yellow-300 shadow-lg">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-3 py-2">
          {/* Main Application Branding: AQUA SLASH – SWIM BOOK */}
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl border-3 border-black bg-white shadow-[2px_2px_0_#000] text-xl">
              🏊
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bangers text-2xl tracking-wider text-black">
                  AQUA SLASH
                </span>
                <span className="rounded-lg bg-black px-2.5 py-0.5 font-bangers text-base tracking-wider text-yellow-300 shadow-[2px_2px_0_rgba(0,0,0,0.25)]">
                  SWIM BOOK
                </span>
              </div>
              <p className="font-comic text-[11px] font-bold text-slate-800 leading-none mt-0.5">
                Primary Swimming Platform & Journey
              </p>
            </div>
          </div>

          {/* TWO MAIN NAVIGATION OPTIONS */}
          <div className="flex items-center gap-1.5 sm:gap-2 rounded-2xl border-3 border-black bg-white p-1 shadow-[3px_3px_0_#000]">
            {/* 1. SWIM BOOK (Main App & Primary Dashboard - Default Active) */}
            <button
              onClick={() => {
                comicAudio.playPageFlip();
                stopSpeaking();
                setIsNarrating(false);
                setMainTab("book");
                window.history.replaceState(null, "", "#swim-book");
              }}
              className={`flex items-center gap-1.5 sm:gap-2 rounded-xl px-3.5 sm:px-4 py-1.5 font-bangers text-xs sm:text-base tracking-wider transition cursor-pointer ${
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

            {/* 2. SWIM LIBRARY (Educational Resources Section) */}
            <button
              onClick={() => {
                comicAudio.playPageFlip();
                stopSpeaking();
                setIsNarrating(false);
                setMainTab("library");
                window.history.replaceState(null, "", "#swim-library");
              }}
              className={`flex items-center gap-1.5 sm:gap-2 rounded-xl px-3.5 sm:px-4 py-1.5 font-bangers text-xs sm:text-base tracking-wider transition cursor-pointer ${
                mainTab === "library"
                  ? "bg-yellow-400 text-black border-2 border-black shadow-[2px_2px_0_#000]"
                  : "text-slate-700 hover:text-black hover:bg-slate-100"
              }`}
            >
              <span>📚 2. SWIM LIBRARY</span>
              <span className="hidden sm:inline-block rounded bg-sky-200 border border-black/40 px-1.5 py-0.2 text-[10px] font-comic font-bold text-slate-800">
                RESOURCES
              </span>
            </button>
          </div>

          {/* Right Controls: Sound & Admin Lock */}
          <div className="flex items-center gap-2">
            {/* Audio Toggle (when on Comic) */}
            <button
              onClick={toggleSound}
              aria-label={isMuted ? "Unmute Audio" : "Mute Audio"}
              className="rounded-xl border-2 border-black bg-white p-2 text-black shadow-[2px_2px_0_#000] hover:bg-slate-100 cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Lock / Admin Login Button */}
            {!isAdmin ? (
              <button
                onClick={openLoginModal}
                title="Admin Login"
                className="rounded-xl border-2 border-black bg-white px-2.5 py-1.5 text-slate-800 shadow-[2px_2px_0_#000] hover:bg-yellow-200 cursor-pointer flex items-center gap-1 font-comic text-xs font-bold"
              >
                <Lock className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Admin</span>
              </button>
            ) : (
              <button
                onClick={logout}
                title="Lock & Exit Admin"
                className="rounded-xl border-2 border-black bg-rose-500 px-2.5 py-1.5 text-white shadow-[2px_2px_0_#000] hover:bg-rose-600 cursor-pointer flex items-center gap-1 font-comic text-xs font-bold"
              >
                <Lock className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Lock</span>
              </button>
            )}
          </div>
        </div>

        {/* Educational Resources Sub-Bar (Shown when on SWIM LIBRARY) */}
        {mainTab === "library" && (
          <div className="border-t-2 border-black/20 bg-slate-900 px-3 py-2 text-white shadow-inner">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-bangers text-xs sm:text-sm tracking-wider text-yellow-300 flex items-center gap-1">
                  <span>📚 EDUCATIONAL RESOURCES:</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      comicAudio.playPageFlip();
                      setLibrarySubTab("videos");
                      window.history.replaceState(null, "", "#swim-videos");
                    }}
                    className={`flex items-center gap-1 rounded-lg border-2 border-black px-3 py-1 font-bangers text-xs sm:text-sm tracking-wider transition cursor-pointer ${
                      librarySubTab === "videos"
                        ? "bg-sky-400 text-black shadow-[2px_2px_0_#000]"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                    }`}
                  >
                    <Film className="w-3.5 h-3.5" />
                    <span>VIDEOS (1080p HD)</span>
                  </button>

                  <button
                    onClick={() => {
                      comicAudio.playPageFlip();
                      setLibrarySubTab("comics");
                      window.history.replaceState(null, "", "#swim-comics");
                    }}
                    className={`flex items-center gap-1 rounded-lg border-2 border-black px-3 py-1 font-bangers text-xs sm:text-sm tracking-wider transition cursor-pointer ${
                      librarySubTab === "comics"
                        ? "bg-yellow-400 text-black shadow-[2px_2px_0_#000]"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>COMICS ({illustratedPages.length + vectorPages.length} PAGES)</span>
                  </button>

                  <button
                    onClick={() => {
                      comicAudio.playPageFlip();
                      setLibrarySubTab("resources");
                      window.history.replaceState(null, "", "#swim-resources");
                    }}
                    className={`flex items-center gap-1 rounded-lg border-2 border-black px-3 py-1 font-bangers text-xs sm:text-sm tracking-wider transition cursor-pointer ${
                      librarySubTab === "resources"
                        ? "bg-emerald-400 text-black shadow-[2px_2px_0_#000]"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                    }`}
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>TECHNIQUES & WATER SAFETY</span>
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
          <div className="border-t-2 border-black/20 bg-[#fde047] px-3 py-1.5">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-bangers text-xs tracking-wider text-slate-900 hidden sm:inline">
                  STORY EDITIONS:
                </span>
                <button
                  onClick={() => switchStory("illustrated")}
                  className={`flex items-center gap-1.5 rounded-lg border-2 border-black px-3 py-1 font-bangers text-xs sm:text-sm tracking-wider transition cursor-pointer ${
                    activeStory === "illustrated"
                      ? "bg-black text-yellow-300 shadow-[2px_2px_0_#000]"
                      : "bg-white text-black hover:bg-slate-100"
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>COMIC 1: ILLUSTRATED ({illustratedPages.length} PAGES)</span>
                </button>

                <button
                  onClick={() => switchStory("vector")}
                  className={`flex items-center gap-1.5 rounded-lg border-2 border-black px-3 py-1 font-bangers text-xs sm:text-sm tracking-wider transition cursor-pointer ${
                    activeStory === "vector"
                      ? "bg-black text-yellow-300 shadow-[2px_2px_0_#000]"
                      : "bg-white text-black hover:bg-slate-100"
                  }`}
                >
                  <Palette className="w-3.5 h-3.5" />
                  <span>COMIC 2: VECTOR STRIP ({vectorPages.length} PAGES)</span>
                </button>
              </div>

              {/* Chapter / Page Info Badge */}
              <div className="font-comic text-xs font-bold text-slate-900">
                {activeStory === "illustrated"
                  ? `Illustrated Chapter ${illustratedIdx + 1} of ${illustratedPages.length}`
                  : vectorView === 0
                  ? "Vector Comic Cover"
                  : `Vector Page ${vectorView} of ${vectorTotal}`}
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
        <main className="flex-1 mx-auto max-w-5xl w-full px-3 py-6">
          {/* Story 1 Controller Bar */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border-3 border-black bg-slate-900 p-3 shadow-[4px_4px_0_#000]">
            <div className="flex items-center gap-2">
              <button
                disabled={illustratedIdx === 0}
                onClick={handlePrevIllustrated}
                className="flex items-center gap-1 rounded-lg border-2 border-black bg-sky-300 px-3 py-1 font-bangers text-sm text-black shadow-[2px_2px_0_#000] hover:bg-sky-400 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> PREV
              </button>
              <span className="font-bangers text-base tracking-wider text-yellow-300">
                PAGE {illustratedIdx + 1} / {illustratedPages.length}
              </span>
              <button
                disabled={illustratedIdx === illustratedPages.length - 1}
                onClick={handleNextIllustrated}
                className="flex items-center gap-1 rounded-lg border-2 border-black bg-yellow-300 px-3 py-1 font-bangers text-sm text-black shadow-[2px_2px_0_#000] hover:bg-yellow-400 disabled:opacity-40 cursor-pointer"
              >
                NEXT <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={illustratedIdx}
                onChange={(e) => {
                  comicAudio.playPageFlip();
                  stopSpeaking();
                  setIllustratedIdx(Number(e.target.value));
                }}
                className="rounded-lg border-2 border-black bg-slate-950 px-3 py-1 text-xs text-white font-bold focus:outline-none focus:border-yellow-300"
              >
                {illustratedPages.map((p, idx) => (
                  <option key={p.pageNumber} value={idx}>
                    Page {p.pageNumber}: {p.title}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setShowVerbatimLines((prev) => !prev)}
                className="rounded-lg border-2 border-black bg-slate-800 px-3 py-1 text-xs font-bold text-slate-200 hover:bg-slate-700 cursor-pointer"
              >
                {showVerbatimLines ? "Hide Story Script" : "Show Story Script"}
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
          />

          {/* Bottom Navigation for Story 1 */}
          <div className="mt-6 flex items-center justify-between border-t-2 border-slate-800 pt-4">
            <button
              disabled={illustratedIdx === 0}
              onClick={handlePrevIllustrated}
              className="flex items-center gap-1.5 rounded-xl border-3 border-black bg-sky-300 px-5 py-2 font-bangers text-lg text-black shadow-[3px_3px_0_#000] hover:bg-sky-400 disabled:opacity-35 cursor-pointer"
            >
              ◀ PREV CHAPTER
            </button>
            <div className="text-center font-comic text-xs text-slate-400">
              Use Left / Right arrow keys to flip pages
            </div>
            <button
              disabled={illustratedIdx === illustratedPages.length - 1}
              onClick={handleNextIllustrated}
              className="flex items-center gap-1.5 rounded-xl border-3 border-black bg-yellow-300 px-5 py-2 font-bangers text-lg text-black shadow-[3px_3px_0_#000] hover:bg-yellow-400 disabled:opacity-35 cursor-pointer"
            >
              NEXT CHAPTER ▶
            </button>
          </div>
        </main>
      )}

      {/* 5. STORY 2: VECTOR STRIP EDITION */}
      {mainTab === "library" && librarySubTab === "comics" && activeStory === "vector" && (
        <main className="flex-1 px-2 py-5 md:px-4 md:py-8">
          {/* Sub Header for Story 2 */}
          <div className="mx-auto max-w-5xl mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border-3 border-black bg-slate-900 p-3 shadow-[4px_4px_0_#000]">
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
                  className="flex items-center gap-1 rounded-lg border-2 border-black bg-emerald-400 px-2.5 py-1 font-bangers text-xs text-black shadow-[2px_2px_0_#000] hover:bg-emerald-300 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> ADD PAGE
                </button>
              )}
            </div>

            <button
              onClick={() => setVectorMenu(true)}
              className="cursor-pointer rounded-lg border-2 border-black bg-white px-3 py-1 font-bangers text-xs tracking-wider text-black shadow-[2px_2px_0_#000] hover:bg-slate-100"
            >
              14 CHAPTERS ☰
            </button>
          </div>

          {vectorPage ? (
            <PageView
              key={vectorView}
              page={vectorPage}
              index={vectorView - 1}
              total={vectorTotal}
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

      {/* 6. Fixed Bottom Nav for Story 2 */}
      {mainTab === "library" && librarySubTab === "comics" && activeStory === "vector" && (
        <nav className="fixed inset-x-0 bottom-0 z-40 border-t-4 border-black bg-white/95 backdrop-blur shadow-[0_-4px_10px_rgba(0,0,0,0.15)]">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-3 py-2.5">
            <button
              disabled={vectorView === 0}
              onClick={() => goVector(vectorView - 1)}
              className="cursor-pointer border-[3px] border-black bg-sky-300 px-5 py-1.5 font-bangers text-lg tracking-wider text-black shadow-[3px_3px_0_#111] transition active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:cursor-not-allowed disabled:opacity-35 md:text-xl hover:bg-sky-400"
            >
              ◀ PREV
            </button>

            <div className="min-w-0 text-center leading-tight">
              <div className="font-bangers text-lg tracking-wider text-black md:text-xl">
                {vectorView === 0 ? "COVER PAGE" : `PAGE ${vectorView} / ${vectorTotal}`}
              </div>
              {vectorPage && currentVectorChapter && (
                <div className="truncate font-comic text-[11px] font-bold text-slate-700 md:text-xs">
                  Ch. {vectorPage.ch} · {currentVectorChapter.title}
                </div>
              )}
            </div>

            <button
              disabled={vectorView === vectorTotal}
              onClick={() => goVector(vectorView + 1)}
              className="cursor-pointer border-[3px] border-black bg-yellow-300 px-5 py-1.5 font-bangers text-lg tracking-wider text-black shadow-[3px_3px_0_#111] transition active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:cursor-not-allowed disabled:opacity-35 md:text-xl hover:bg-yellow-400"
            >
              {vectorView === 0 ? "START READING ▶" : "NEXT ▶"}
            </button>
          </div>
        </nav>
      )}

      {/* 6. Illustrated Panel Zoom Modal */}
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
