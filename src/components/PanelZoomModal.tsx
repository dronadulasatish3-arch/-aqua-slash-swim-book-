import React from 'react';
import { ComicPageData, ComicPanelData } from '../data/comicStoryData';
import { ComicSceneIllustration } from './ComicSceneIllustration';
import { X, Volume2, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { speakText } from '../utils/comicAudio';

interface PanelZoomModalProps {
  page: ComicPageData;
  panel: ComicPanelData | null;
  onClose: () => void;
  onSelectPanel: (panelNumber: 1 | 2 | 3 | 4) => void;
}

export const PanelZoomModal: React.FC<PanelZoomModalProps> = ({
  page,
  panel,
  onClose,
  onSelectPanel,
}) => {
  if (!panel) return null;

  const handleReadPanel = () => {
    const fullText = `${page.chapterCode}. Panel ${panel.panelNumber}. ${panel.narratorCaption}. ${panel.storyLines.join(' ')}`;
    speakText(fullText);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-[#F4EFE6] text-[#050B14] border-4 border-[#050B14] rounded-2xl shadow-[12px_12px_0px_#0EA5E9] overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="bg-[#050B14] text-white px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="px-2.5 py-1 rounded bg-[#FDE047] text-[#050B14] font-comic text-lg tracking-wider shrink-0">
              {page.chapterCode} • PANEL 0{panel.panelNumber} / 04
            </span>
            <span className="font-mono-code text-xs text-sky-300 truncate">
              {panel.locationTag}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleReadPanel}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0EA5E9] hover:bg-sky-400 text-[#050B14] font-bold text-xs cursor-pointer transition"
            >
              <Volume2 className="w-4 h-4" />
              <span>Listen</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 text-white cursor-pointer transition"
              aria-label="Close panel inspector"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Top Narrator Strip */}
        <div className="narrator-box px-4 py-2.5 border-x-0 border-t-0">
          <p className="font-bold text-sm sm:text-base text-[#050B14]">
            {panel.narratorCaption}
          </p>
        </div>

        {/* Enlarged Comic Scene */}
        <div className="relative border-b-4 border-[#050B14]">
          <div className="scale-100">
            <ComicSceneIllustration sceneId={panel.sceneId} accentHex={page.accentHex} />
          </div>

          {/* Floating SFX Badge */}
          {panel.sfx && (
            <div
              className="absolute top-3 right-3 px-3 py-1 rounded-lg bg-[#050B14]/90 border-2 border-white shadow-[3px_3px_0px_#050B14] -rotate-3"
              style={{ color: panel.sfx.color }}
            >
              <span className="font-comic text-xl tracking-wider">{panel.sfx.text}</span>
            </div>
          )}

          {/* Speech / Thought Bubble Overlay */}
          {panel.speechBubble && (
            <div className="p-3 bg-[#091528] border-t-3 border-[#050B14]">
              <div
                className={
                  panel.speechBubble.type === 'thought'
                    ? 'thought-bubble px-4 py-2.5'
                    : 'speech-bubble px-4 py-2.5'
                }
              >
                <div className="font-mono-code text-[10px] font-extrabold uppercase tracking-wider text-sky-700 mb-0.5">
                  {panel.speechBubble.speaker}
                </div>
                <p className="text-xs sm:text-sm font-bold text-[#050B14]">
                  “{panel.speechBubble.text}”
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Complete Step-by-Step Story Lines */}
        <div className="p-5 bg-[#FFFDF9] space-y-2.5 max-h-64 overflow-y-auto">
          <div className="flex items-center gap-1.5 text-xs font-mono-code font-bold uppercase tracking-wider text-sky-800">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Exact Story Step Lines (Panel 0{panel.panelNumber})</span>
          </div>
          {panel.storyLines.map((line, i) => (
            <p
              key={i}
              className="text-sm sm:text-base font-medium text-slate-900 leading-relaxed pl-3 border-l-3 border-sky-500"
            >
              {line}
            </p>
          ))}
        </div>

        {/* Footer Panel Switcher (Panel 1, 2, 3, 4) */}
        <div className="bg-[#E5DEC9] px-4 py-3 border-t-3 border-[#050B14] flex items-center justify-between">
          <button
            disabled={panel.panelNumber === 1}
            onClick={() =>
              panel.panelNumber > 1 &&
              onSelectPanel((panel.panelNumber - 1) as 1 | 2 | 3 | 4)
            }
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#050B14] text-white disabled:opacity-40 text-xs font-bold cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Prev Panel</span>
          </button>

          <div className="flex items-center gap-1.5">
            {([1, 2, 3, 4] as const).map((num) => (
              <button
                key={num}
                onClick={() => onSelectPanel(num)}
                className={`w-8 h-8 rounded-lg font-comic text-base border-2 border-[#050B14] transition cursor-pointer ${
                  panel.panelNumber === num
                    ? 'bg-[#0EA5E9] text-[#050B14] shadow-[2px_2px_0px_#050B14]'
                    : 'bg-white text-[#050B14] hover:bg-amber-100'
                }`}
              >
                {num}
              </button>
            ))}
          </div>

          <button
            disabled={panel.panelNumber === 4}
            onClick={() =>
              panel.panelNumber < 4 &&
              onSelectPanel((panel.panelNumber + 1) as 1 | 2 | 3 | 4)
            }
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#050B14] text-white disabled:opacity-40 text-xs font-bold cursor-pointer"
          >
            <span>Next Panel</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
