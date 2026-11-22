import React from "react";
import type { Page, Panel, Say, SayPos } from "./types";
import { Scene } from "./scenes";
import { Special } from "./special";
import handwater from "../assets/hand-water.jpg";
import quarry from "../assets/quarry.jpg";
import well from "../assets/well.jpg";
import college from "../assets/college-pool.jpg";
import nationals from "../assets/national-games.jpg";
import covid from "../assets/covid-pool.jpg";
import lifeguard from "../assets/lifeguard.jpg";
import community from "../assets/community-coach.jpg";
import stages from "../assets/six-stages.jpg";
import finale from "../assets/finale.jpg";
import { useAdmin } from "../context/AdminContext";
import { Edit2, Image as ImageIcon, Plus, Trash2, Sparkles } from "lucide-react";

export const IMGS: Record<string, string> = {
  handwater,
  quarry,
  well,
  college,
  nationals,
  covid,
  lifeguard,
  community,
  stages,
  finale,
};

const POS: Record<SayPos, string> = {
  tl: "left-2 top-2",
  tr: "right-2 top-2",
  bl: "left-2 bottom-2",
  br: "right-2 bottom-2",
};

function Bubble({
  s,
  hasTag,
  onClick,
  isEditMode,
}: {
  s: Say;
  hasTag?: boolean;
  onClick?: () => void;
  isEditMode?: boolean;
}) {
  const [t, pos = "tl", kind = "say"] = typeof s === "string" ? [s] : s;
  const top = hasTag && pos.startsWith("t") ? "!top-7 sm:!top-9" : "";
  const place = `absolute z-20 max-w-[85%] sm:max-w-[70%] ${POS[pos as SayPos]} ${top}`;

  const editClass = isEditMode
    ? "cursor-pointer hover:scale-105 hover:ring-2 hover:ring-yellow-400 transition"
    : "";

  if (kind === "shout") {
    return (
      <div className={`${place} bubble-pop ${editClass}`} onClick={onClick}>
        <div
          className="-rotate-2 border-2 sm:border-[3px] border-black bg-yellow-300 px-2 py-1 sm:px-3 sm:py-1.5 text-center font-bangers text-xs sm:text-lg leading-tight tracking-wide text-black shadow-[2px_2px_0_#111] md:text-xl"
          style={{
            clipPath:
              "polygon(0 8%, 6% 0, 20% 6%, 36% 0, 52% 5%, 70% 0, 86% 6%, 100% 0, 97% 40%, 100% 70%, 95% 100%, 78% 94%, 60% 100%, 42% 94%, 24% 100%, 8% 94%, 0 100%, 4% 55%)",
          }}
        >
          {t}
        </div>
      </div>
    );
  }
  if (kind === "think") {
    return (
      <div className={`${place} bubble-pop ${editClass}`} onClick={onClick}>
        <div className="relative rounded-[1.2rem] sm:rounded-[1.6rem] border-2 sm:border-[3px] border-black bg-white px-2 py-1 sm:px-3 sm:py-2 text-center font-comic text-[10px] sm:text-[13px] font-bold italic leading-tight text-slate-800 md:text-sm shadow-[2px_2px_0_#111]">
          {t}
          <span className="absolute -bottom-2 sm:-bottom-3 left-4 sm:left-5 h-2 w-2 sm:h-3 sm:w-3 rounded-full border-[2px] sm:border-[2.5px] border-black bg-white" />
          <span className="absolute -bottom-4 sm:-bottom-[22px] left-2 sm:left-3 h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full border sm:border-2 border-black bg-white" />
        </div>
      </div>
    );
  }
  return (
    <div className={`${place} bubble-pop ${editClass}`} onClick={onClick}>
      <div className="relative rounded-xl sm:rounded-2xl border-2 sm:border-[3px] border-black bg-white px-2 py-1 sm:px-3 sm:py-1.5 text-center font-comic text-[10px] sm:text-[13px] font-bold leading-tight text-black md:text-sm shadow-[2px_2px_0_#111]">
        {t}
        <span className="absolute -bottom-[6px] sm:-bottom-[8px] left-4 sm:left-6 h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 rotate-45 border-b-2 sm:border-b-[3px] border-r-2 sm:border-r-[3px] border-black bg-white" />
      </div>
    </div>
  );
}

const SFX_POS: Record<SayPos, string> = {
  tl: "left-3 top-3",
  tr: "right-3 top-3",
  bl: "left-3 bottom-3",
  br: "right-3 bottom-3",
};

export function PanelView({
  p,
  i,
  pageIndex,
  onInspect,
  isCompact = false,
}: {
  p: Panel;
  i: number;
  pageIndex: number;
  onInspect?: () => void;
  isCompact?: boolean;
}) {
  const { isEditMode, openEditor, deleteVectorPanel } = useAdmin();

  const handleEditThisPanel = () => {
    openEditor({
      type: "vector-panel",
      pageIndex,
      panelIndex: i,
      panel: p,
    });
  };

  const handleClick = () => {
    if (isEditMode) {
      handleEditThisPanel();
    } else if (onInspect) {
      onInspect();
    }
  };

  return (
    <figure
      className={`panel-in relative m-0 flex min-h-0 flex-col overflow-hidden border-2 sm:border-[4px] border-black bg-white shadow-[2px_2px_0_rgba(0,0,0,.85)] sm:shadow-[4px_4px_0_rgba(0,0,0,.85)] group ${
        isEditMode ? "hover:border-yellow-400 cursor-pointer" : onInspect ? "cursor-pointer" : ""
      }`}
      style={{ animationDelay: `${i * 100}ms` }}
      onClick={handleClick}
    >
      {/* Visual Edit Overlay Badge in Edit Mode */}
      {isEditMode && (
        <div className="absolute top-2 right-2 z-30 flex items-center gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEditThisPanel();
            }}
            title="Edit Panel Text, Caption, Speech & Image"
            className="flex items-center gap-1 rounded bg-yellow-400 text-slate-950 font-bangers text-xs px-2 py-0.5 border-2 border-black shadow-[2px_2px_0_#000] hover:bg-yellow-300 cursor-pointer"
          >
            <Edit2 className="w-3 h-3" /> EDIT
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteVectorPanel(pageIndex, i);
            }}
            title="Delete this panel"
            className="rounded bg-rose-600 text-white p-0.5 border border-black hover:bg-rose-500 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Tap to Zoom Hint on Mobile */}
      {!isEditMode && onInspect && (
        <span className="absolute bottom-1 right-1 z-20 rounded bg-black/60 px-1 py-0.5 text-[9px] font-bold text-white md:hidden">
          🔍
        </span>
      )}

      {/* Panel Scene Canvas */}
      <div
        className={`relative aspect-[4/3] overflow-hidden bg-sky-200 md:aspect-auto md:min-h-0 md:flex-1`}
      >
        {/* Custom Uploaded Image Takes Priority */}
        {p.customImg ? (
          <img
            src={p.customImg}
            alt={p.cap ?? "comic panel"}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : p.img ? (
          <img
            src={IMGS[p.img]}
            alt={p.cap ?? "comic panel"}
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
        ) : p.art ? (
          <Special p={p} />
        ) : (
          <Scene p={p} />
        )}

        <div className="halftone pointer-events-none absolute inset-0" />

        {p.tag && (
          <div
            onClick={(e) => {
              if (isEditMode) {
                e.stopPropagation();
                handleEditThisPanel();
              }
            }}
            className={`absolute left-0 top-0 z-20 bg-black px-2 sm:px-2.5 py-0.5 font-bangers text-xs sm:text-sm tracking-wider text-yellow-300 ${
              isEditMode ? "hover:bg-slate-800 cursor-pointer" : ""
            }`}
          >
            {p.tag}
          </div>
        )}

        {p.sfx && (
          <div
            onClick={(e) => {
              if (isEditMode) {
                e.stopPropagation();
                handleEditThisPanel();
              }
            }}
            className={`sfx absolute z-10 text-sm sm:text-base md:text-xl ${SFX_POS[p.sfxAt ?? "tr"]} ${
              isEditMode ? "cursor-pointer" : ""
            }`}
          >
            {p.sfx}
          </div>
        )}

        {p.say && (
          <Bubble
            s={p.say}
            hasTag={!!p.tag}
            onClick={() => {
              if (isEditMode) handleEditThisPanel();
            }}
            isEditMode={isEditMode}
          />
        )}
        {p.say2 && (
          <Bubble
            s={p.say2}
            hasTag={!!p.tag}
            onClick={() => {
              if (isEditMode) handleEditThisPanel();
            }}
            isEditMode={isEditMode}
          />
        )}

        {/* Hover Hint in Edit Mode */}
        {isEditMode && (
          <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition flex items-center justify-center pointer-events-none">
            <span className="bg-yellow-300 text-black px-3 py-1 font-bangers text-sm border-2 border-black shadow-[2px_2px_0_#000]">
              ✏️ CLICK TO EDIT TEXT & IMAGE
            </span>
          </div>
        )}
      </div>

      {/* Narrator Caption Box */}
      {p.cap && (
        <figcaption
          className={`relative z-10 border-t-2 sm:border-t-[3px] border-black bg-[#fff1a8] px-2 py-1 sm:px-3 sm:py-2 font-comic text-[11px] sm:text-[13px] font-bold leading-snug text-slate-900 md:text-[13.5px] ${
            isCompact ? "line-clamp-2 md:line-clamp-none" : ""
          } ${
            isEditMode
              ? "hover:bg-yellow-200 cursor-pointer border-b-2 border-yellow-500"
              : ""
          }`}
        >
          {p.cap}
        </figcaption>
      )}
    </figure>
  );
}

const LAYOUTS: string[][] = [
  ["md:col-span-7", "md:col-span-5", "md:col-span-5", "md:col-span-7"],
  ["md:col-span-5", "md:col-span-7", "md:col-span-7", "md:col-span-5"],
  ["md:col-span-6", "md:col-span-6", "md:col-span-6", "md:col-span-6"],
  ["md:col-span-8", "md:col-span-4", "md:col-span-4", "md:col-span-8"],
  ["md:col-span-4", "md:col-span-8", "md:col-span-8", "md:col-span-4"],
];

export function PageView({
  page,
  index,
  total,
  viewMode = 'fit',
  onInspectPanel,
}: {
  page: Page;
  index: number;
  total: number;
  viewMode?: 'fit' | 'scroll';
  onInspectPanel?: (panel: Panel, panelIndex: number) => void;
}) {
  const { vectorChapters, isEditMode, openEditor, addVectorPanel } = useAdmin();
  const ch = vectorChapters.find((c) => c.n === page.ch) || {
    n: page.ch,
    title: `Chapter ${page.ch}`,
  };

  const layout = LAYOUTS[index % LAYOUTS.length];
  const isFitMode = viewMode === 'fit';

  return (
    <article className="page-in mx-auto w-full max-w-5xl border-[3px] sm:border-[5px] border-black bg-[#fffaf0] p-1.5 sm:p-2.5 md:p-4 shadow-[4px_4px_0_rgba(0,0,0,.55)] sm:shadow-[10px_10px_0_rgba(0,0,0,.55)] rounded-xl">
      {/* Chapter Top Header */}
      <header className="mb-2 sm:mb-3 flex flex-wrap items-center gap-x-2 sm:gap-x-3 gap-y-1 border-b-2 border-black/10 pb-1.5 sm:pb-2">
        <div className="-rotate-1 border-2 sm:border-[3px] border-black bg-black px-2 sm:px-3 py-0.5 sm:py-1 font-bangers text-xs sm:text-lg tracking-wider text-yellow-300 md:text-xl shadow-[2px_2px_0_#111]">
          CH. {ch.n}
        </div>

        <h2 className="font-bangers text-sm sm:text-xl uppercase tracking-wide text-slate-900 md:text-2xl truncate max-w-[170px] sm:max-w-none">
          {ch.title}
        </h2>

        {isEditMode && (
          <button
            onClick={() =>
              openEditor({
                type: "vector-chapter",
                chapterNumber: ch.n,
                title: ch.title,
              })
            }
            className="flex items-center gap-1 rounded bg-yellow-400 text-black px-2 py-0.5 font-bangers text-xs border border-black hover:bg-yellow-300 cursor-pointer shadow-[1px_1px_0_#000]"
          >
            <Edit2 className="w-3 h-3" /> EDIT TITLE
          </button>
        )}

        {page.sub && (
          <span className="hidden sm:inline-block rounded-full border-2 border-black bg-sky-300 px-3 py-0.5 font-comic text-xs font-bold text-slate-900">
            {page.sub}
          </span>
        )}

        {isEditMode && (
          <button
            onClick={() =>
              openEditor({
                type: "vector-page",
                pageIndex: index,
                page,
              })
            }
            className="flex items-center gap-1 rounded bg-sky-200 text-black px-2 py-0.5 font-bangers text-xs border border-black hover:bg-sky-300 cursor-pointer"
          >
            <Edit2 className="w-3 h-3" /> EDIT SUBTITLE
          </button>
        )}

        <span className="ml-auto font-bangers text-xs sm:text-lg text-slate-600">
          PAGE {index + 1} / {total}
        </span>
      </header>

      {/* Panels Grid: Responsive 2x2 grid on mobile in Fit Mode, or 1-col in Scroll Mode, and md:grid-cols-12 on desktop */}
      <div
        className={`grid gap-1.5 sm:gap-2.5 md:gap-3 md:auto-rows-[385px] md:grid-cols-12 ${
          isFitMode ? "grid-cols-2" : "grid-cols-1"
        }`}
      >
        {page.panels.map((p, i) => (
          <div
            key={i}
            className={`flex min-h-0 flex-col ${layout[i % layout.length] || "md:col-span-6"} [&>figure]:flex-1`}
          >
            <PanelView
              p={p}
              i={i}
              pageIndex={index}
              isCompact={isFitMode}
              onInspect={() => onInspectPanel?.(p, i)}
            />
          </div>
        ))}
      </div>

      {/* Bottom Panel Management Bar in Edit Mode */}
      {isEditMode && (
        <div className="mt-4 flex items-center justify-between border-t-2 border-black/20 pt-3">
          <button
            onClick={() => addVectorPanel(index)}
            className="flex items-center gap-1.5 rounded-lg border-2 border-black bg-emerald-500 text-black px-3 py-1.5 font-bangers text-sm hover:bg-emerald-400 cursor-pointer shadow-[2px_2px_0_#000]"
          >
            <Plus className="w-4 h-4" /> ADD NEW PANEL TO THIS PAGE
          </button>

          <span className="text-xs text-slate-500 font-bold">
            💡 Click on any caption, speech bubble, or panel to edit it!
          </span>
        </div>
      )}
    </article>
  );
}

/**
 * Mobile-Friendly Vector Panel Zoom Modal
 * Allows zooming into any single panel for full speech text, art detail & narration
 */
export function VectorPanelZoomModal({
  panel,
  panelIndex,
  ch,
  chTitle,
  pageIndex,
  onClose,
}: {
  panel: Panel;
  panelIndex: number;
  ch: number;
  chTitle: string;
  pageIndex: number;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl bg-[#FFFDF9] text-slate-900 border-4 border-black rounded-2xl shadow-[8px_8px_0_#000] overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-black text-white px-3 py-2 flex items-center justify-between gap-2 border-b-2 border-black">
          <div className="flex items-center gap-2 min-w-0">
            <span className="px-2 py-0.5 rounded bg-yellow-300 text-black font-bangers text-xs sm:text-sm tracking-wider shrink-0">
              CH. {ch} • PANEL {panelIndex + 1}
            </span>
            <span className="font-bangers text-xs sm:text-sm text-yellow-200 truncate">
              {chTitle}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer"
          >
            ✕ Close
          </button>
        </div>

        {/* Enlarged Panel Scene */}
        <div className="relative aspect-[4/3] sm:aspect-[16/10] overflow-hidden bg-sky-200 border-b-2 border-black">
          {panel.customImg ? (
            <img src={panel.customImg} alt={panel.cap ?? "panel"} className="absolute inset-0 h-full w-full object-cover" />
          ) : panel.img ? (
            <img src={IMGS[panel.img]} alt={panel.cap ?? "panel"} className="absolute inset-0 h-full w-full object-cover" />
          ) : panel.art ? (
            <Special p={panel} />
          ) : (
            <Scene p={panel} />
          )}

          <div className="halftone pointer-events-none absolute inset-0" />

          {panel.tag && (
            <div className="absolute left-0 top-0 z-20 bg-black px-2.5 py-1 font-bangers text-xs sm:text-sm tracking-wider text-yellow-300">
              {panel.tag}
            </div>
          )}

          {panel.sfx && (
            <div className={`sfx absolute z-10 text-base sm:text-2xl ${SFX_POS[panel.sfxAt ?? "tr"]}`}>
              {panel.sfx}
            </div>
          )}

          {panel.say && <Bubble s={panel.say} hasTag={!!panel.tag} />}
          {panel.say2 && <Bubble s={panel.say2} hasTag={!!panel.tag} />}
        </div>

        {/* Full Narrator Caption */}
        {panel.cap && (
          <div className="bg-[#fff1a8] p-3 sm:p-4 border-b-2 border-black">
            <p className="font-comic text-xs sm:text-sm font-bold text-slate-900 leading-relaxed">
              {panel.cap}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="bg-[#fffaf0] p-2 flex items-center justify-between text-xs font-bangers text-slate-500">
          <span>PAGE {pageIndex + 1}</span>
          <span>Tap anywhere outside to close</span>
        </div>
      </div>
    </div>
  );
}
