import React from 'react';
import { ComicPageData, ComicPanelData } from '../data/comicStoryData';
import { ComicSceneIllustration } from './ComicSceneIllustration';
import {
  Maximize2,
  Volume2,
  Droplets,
  Sparkles,
  BookOpen,
  Quote,
  Edit2,
  Image as ImageIcon,
} from 'lucide-react';
import { comicAudio, speakText } from '../utils/comicAudio';
import { useAdmin } from '../context/AdminContext';

interface ComicPageSheetProps {
  page: ComicPageData;
  showVerbatimLines: boolean;
  onInspectPanel: (panel: ComicPanelData) => void;
  isNarratingPage: boolean;
  onToggleNarratePage: () => void;
  viewMode?: 'fit' | 'scroll';
}

export const ComicPageSheet: React.FC<ComicPageSheetProps> = ({
  page,
  showVerbatimLines,
  onInspectPanel,
  isNarratingPage,
  onToggleNarratePage,
  viewMode = 'fit',
}) => {
  const { isEditMode, openEditor } = useAdmin();
  const isFitMode = viewMode === 'fit';

  return (
    <article className="comic-page-sheet rounded-2xl p-1.5 sm:p-4 md:p-6 text-[#050B14] transition-all bg-[#0d1e38] border-3 sm:border-4 border-black shadow-[4px_4px_0_#000] sm:shadow-[8px_8px_0_#000]">
      {/* =========================================================
          CHAPTER HEADER BANNER ON COMIC PAGE
         ========================================================= */}
      <header
        className={`relative rounded-xl border-2 sm:border-3 border-[#050B14] bg-gradient-to-r ${page.moodColor} text-white p-2.5 sm:p-5 mb-3 sm:mb-5 shadow-[3px_3px_0px_#050B14] sm:shadow-[5px_5px_0px_#050B14] overflow-hidden`}
      >
        {/* Background Key Art Preview */}
        <img
          src={page.actImage}
          alt={page.title}
          className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-luminosity pointer-events-none"
        />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-2 sm:gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="px-2 py-0.5 rounded bg-[#FDE047] text-[#050B14] font-comic text-xs sm:text-base tracking-wider border border-[#050B14] shadow-[1px_1px_0px_#050B14]">
                {page.chapterCode} • PAGE {page.pageNumber} / 15
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-[#050B14]/80 text-sky-300 font-mono-code text-[11px] font-bold border border-sky-400/40">
                {page.eraBadge}
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-emerald-400/20 text-emerald-300 font-mono-code text-[11px] font-bold border border-emerald-400/40">
                4 PANELS
              </span>

              {isEditMode && (
                <button
                  onClick={() => openEditor({ type: 'illustrated-page', pageNumber: page.pageNumber, page })}
                  className="flex items-center gap-1 px-2.5 py-0.5 rounded bg-rose-500 text-white font-bangers text-xs tracking-wider border-2 border-black shadow-[2px_2px_0_#000] hover:bg-rose-400 cursor-pointer animate-pulse"
                >
                  <Edit2 className="w-3 h-3" /> EDIT TITLE
                </button>
              )}
            </div>

            <h1 className="font-comic text-lg sm:text-3xl md:text-4xl tracking-wider text-white drop-shadow-[2px_2px_0px_#050B14]">
              {page.title}
            </h1>
            <p className="text-[11px] sm:text-sm text-sky-200 font-semibold truncate max-w-md">
              {page.subtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={onToggleNarratePage}
              className={`flex items-center gap-1.5 px-3 py-1 sm:px-3.5 sm:py-2 rounded-xl font-bold text-xs sm:text-sm border-2 border-[#050B14] shadow-[2px_2px_0px_#050B14] transition cursor-pointer ${
                isNarratingPage
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-[#FDE047] hover:bg-amber-300 text-[#050B14]'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{isNarratingPage ? 'Stop' : 'Read Page'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================
          THE 4-PANEL COMIC GRID: 2x2 ON MOBILE (FIT MODE) & DESKTOP
         ========================================================= */}
      <div className={`grid gap-2 sm:gap-4 md:grid-cols-2 md:gap-6 ${isFitMode ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {page.panels.map((panel) => {
          const customImg = (panel as any).customImage;

          return (
            <div
              key={panel.id}
              onClick={() => !isEditMode && onInspectPanel(panel)}
              className={`comic-panel-frame rounded-xl bg-[#FFFDF9] overflow-hidden flex flex-col justify-between group border-2 sm:border-3 border-black shadow-[2px_2px_0_#000] sm:shadow-[4px_4px_0_#000] relative cursor-pointer ${
                isEditMode ? 'ring-2 ring-yellow-400' : ''
              }`}
            >
              <div>
                {/* Panel Top Bar: Panel Number + Location Stamp + Actions */}
                <div className="bg-[#050B14] text-white px-2 py-1 sm:px-3.5 sm:py-2 flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className="px-1.5 py-0.2 sm:px-2 sm:py-0.5 rounded font-comic text-xs sm:text-sm tracking-wider text-[#050B14] shrink-0 font-bold"
                      style={{ backgroundColor: '#FDE047' }}
                    >
                      P0{panel.panelNumber}
                    </span>
                    <span className="font-mono-code text-[9px] sm:text-[11px] font-bold text-sky-300 truncate">
                      {panel.locationTag}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] text-slate-400 md:hidden">🔍</span>
                    {/* Admin Direct Edit Button */}
                    {isEditMode && (
                      <button
                        onClick={() =>
                          openEditor({
                            type: 'illustrated-panel',
                            pageNumber: page.pageNumber,
                            panel,
                          })
                        }
                        title="Edit text, speech, SFX and image"
                        className="flex items-center gap-1 px-2 py-0.5 rounded bg-yellow-400 text-slate-950 font-bangers text-xs tracking-wider border border-black hover:bg-yellow-300 cursor-pointer shadow-[1px_1px_0_#000]"
                      >
                        <Edit2 className="w-3 h-3" /> EDIT
                      </button>
                    )}

                    <button
                      onClick={() => {
                        speakText(
                          `Panel ${panel.panelNumber}. ${panel.narratorCaption}. ${panel.storyLines.join(' ')}`
                        );
                      }}
                      title="Listen to this panel"
                      className="p-1 rounded bg-slate-800 hover:bg-sky-500 hover:text-[#050B14] text-sky-300 transition cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        comicAudio.playWaterDrop();
                        onInspectPanel(panel);
                      }}
                      title="Inspect panel in full screen"
                      className="p-1 rounded bg-slate-800 hover:bg-amber-400 hover:text-[#050B14] text-amber-300 transition cursor-pointer"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Narrator Caption Box */}
                <div
                  onClick={() => {
                    if (isEditMode) {
                      openEditor({
                        type: 'illustrated-panel',
                        pageNumber: page.pageNumber,
                        panel,
                      });
                    }
                  }}
                  className={`narrator-box px-2 sm:px-3.5 py-1.5 sm:py-2 border-x-0 border-t-0 bg-yellow-100/90 border-b-2 border-black ${
                    isEditMode ? 'hover:bg-yellow-200 cursor-pointer' : ''
                  }`}
                >
                  <p className={`text-[10px] sm:text-sm font-extrabold text-[#050B14] leading-tight sm:leading-snug ${isFitMode ? 'line-clamp-2 md:line-clamp-none' : ''}`}>
                    {panel.narratorCaption}
                  </p>
                </div>

                {/* Illustrated Comic Scene + Custom Image Support */}
                <div
                  onClick={() => {
                    if (isEditMode) {
                      openEditor({
                        type: 'illustrated-panel',
                        pageNumber: page.pageNumber,
                        panel,
                      });
                    } else {
                      comicAudio.playWaterDrop();
                      onInspectPanel(panel);
                    }
                  }}
                  className={`relative border-b-2 sm:border-b-3 border-[#050B14] cursor-pointer overflow-hidden ${isFitMode ? 'min-h-[110px] sm:min-h-[180px]' : 'min-h-[180px]'} bg-slate-900`}
                >
                  {customImg ? (
                    <img
                      src={customImg}
                      alt={panel.locationTag}
                      className={`w-full ${isFitMode ? 'h-28 sm:h-52 md:h-64' : 'h-48 sm:h-64'} object-cover`}
                    />
                  ) : (
                    <div className={isFitMode ? 'scale-[0.8] sm:scale-100 origin-top' : ''}>
                      <ComicSceneIllustration
                        sceneId={panel.sceneId}
                        accentHex={page.accentHex}
                      />
                    </div>
                  )}

                  {/* Comic SFX Sticker */}
                  {panel.sfx && (
                    <div
                      className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-md bg-[#050B14]/90 border-2 border-white shadow-[3px_3px_0px_#050B14] -rotate-3 pointer-events-none"
                      style={{ color: panel.sfx.color }}
                    >
                      <span className="font-comic text-base sm:text-lg tracking-wider">
                        {panel.sfx.text}
                      </span>
                    </div>
                  )}

                  {/* Edit hint when edit mode is active */}
                  {isEditMode ? (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <span className="bg-yellow-400 text-black px-3 py-1.5 rounded-xl font-bangers text-sm tracking-wider border-2 border-black shadow-[3px_3px_0_#000]">
                        ✏️ CLICK TO EDIT PANEL & IMAGE
                      </span>
                    </div>
                  ) : (
                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition bg-[#050B14]/85 text-white text-[10px] font-mono-code px-2 py-1 rounded border border-sky-400/50 pointer-events-none">
                      Click to Zoom
                    </div>
                  )}
                </div>

                {/* Character Speech / Thought Bubble */}
                {panel.speechBubble && (
                  <div
                    onClick={() => {
                      if (isEditMode) {
                        openEditor({
                          type: 'illustrated-panel',
                          pageNumber: page.pageNumber,
                          panel,
                        });
                      }
                    }}
                    className={`px-2 sm:px-3.5 pt-2 pb-1.5 sm:pt-3 sm:pb-2 bg-[#F1F5F9] border-b-2 border-slate-300 ${
                      isEditMode ? 'hover:bg-sky-50 cursor-pointer' : ''
                    }`}
                  >
                    <div
                      className={
                        panel.speechBubble.type === 'thought'
                          ? 'thought-bubble px-2 sm:px-3.5 py-1 sm:py-2 border sm:border-2 border-slate-700 bg-white rounded-xl sm:rounded-2xl shadow-[1px_1px_0_#000] sm:shadow-[2px_2px_0_#000]'
                          : 'speech-bubble px-2 sm:px-3.5 py-1 sm:py-2 border sm:border-2 border-slate-700 bg-white rounded-xl sm:rounded-2xl shadow-[1px_1px_0_#000] sm:shadow-[2px_2px_0_#000]'
                      }
                    >
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="font-mono-code text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-sky-700 truncate">
                          {panel.speechBubble.speaker}
                        </span>
                        <span className="hidden sm:inline-block text-[9px] font-mono-code uppercase px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 font-bold">
                          {panel.speechBubble.type}
                        </span>
                      </div>
                      <p className={`text-[10px] sm:text-sm font-bold text-[#050B14] leading-tight ${isFitMode ? 'line-clamp-2 md:line-clamp-none' : ''}`}>
                        “{panel.speechBubble.text}”
                      </p>
                    </div>
                  </div>
                )}

                {/* Verbatim Step-by-Step Story Lines for this Panel (hidden in compact fit mode on mobile) */}
                {showVerbatimLines && !isFitMode && (
                  <div className="p-3.5 sm:p-4 bg-[#FFFDF9] space-y-2">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono-code font-bold uppercase tracking-wider text-slate-500">
                      <BookOpen className="w-3 h-3 text-sky-600" />
                      <span>Story Step Lines • Panel 0{panel.panelNumber}</span>
                    </div>
                    <div className="space-y-1.5">
                      {panel.storyLines.map((line, idx) => (
                        <p
                          key={idx}
                          className="text-xs sm:text-[13.5px] font-medium text-slate-900 leading-relaxed pl-2.5 border-l-2 border-sky-500/80"
                        >
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Panel Footer Strip */}
              <div className="px-3.5 py-1.5 bg-[#EFECE1] border-t-2 border-[#050B14]/20 flex items-center justify-between text-[10px] font-mono-code text-slate-600">
                <span>
                  {page.chapterCode} • STEP {panel.panelNumber} OF 4
                </span>
                <span className="font-bold text-sky-800">
                  {panel.storyLines.length} STORY LINES
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* =========================================================
          CHAPTER SUMMARY QUOTE
         ========================================================= */}
      <footer className="mt-6 pt-4 border-t-3 border-[#050B14] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-2.5 text-white">
          <div className="p-2 rounded-lg bg-yellow-400 text-black shrink-0 mt-0.5 border border-black shadow-[2px_2px_0_#000]">
            <Quote className="w-4 h-4" />
          </div>
          <div>
            <div className="font-mono-code text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {page.chapterCode} KEY TAKEAWAY
            </div>
            <p className="font-display font-bold text-sm sm:text-base text-white italic">
              “{page.summaryQuote}”
            </p>
          </div>
        </div>
      </footer>
    </article>
  );
};
