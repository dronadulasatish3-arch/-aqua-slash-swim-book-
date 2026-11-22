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
  const top = hasTag && pos.startsWith("t") ? "!top-9" : "";
  const place = `absolute z-20 max-w-[65%] ${POS[pos as SayPos]} ${top}`;

  const editClass = isEditMode
    ? "cursor-pointer hover:scale-105 hover:ring-2 hover:ring-yellow-400 transition"
    : "";

  if (kind === "shout") {
    return (
      <div className={`${place} bubble-pop ${editClass}`} onClick={onClick}>
        <div
          className="-rotate-2 border-[3px] border-black bg-yellow-300 px-3 py-1.5 text-center font-bangers text-lg leading-tight tracking-wide text-black shadow-[3px_3px_0_#111] md:text-xl"
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
        <div className="relative rounded-[1.6rem] border-[3px] border-black bg-white px-3 py-2 text-center font-comic text-[13px] font-bold italic leading-tight text-slate-800 md:text-sm shadow-[3px_3px_0_#111]">
          {t}
          <span className="absolute -bottom-3 left-5 h-3 w-3 rounded-full border-[2.5px] border-black bg-white" />
          <span className="absolute -bottom-[22px] left-3 h-2 w-2 rounded-full border-2 border-black bg-white" />
        </div>
      </div>
    );
  }
  return (
    <div className={`${place} bubble-pop ${editClass}`} onClick={onClick}>
      <div className="relative rounded-2xl border-[3px] border-black bg-white px-3 py-1.5 text-center font-comic text-[13px] font-bold leading-tight text-black md:text-sm shadow-[3px_3px_0_#111]">
        {t}
        <span className="absolute -bottom-[8px] left-6 h-3.5 w-3.5 rotate-45 border-b-[3px] border-r-[3px] border-black bg-white" />
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
}: {
  p: Panel;
  i: number;
  pageIndex: number;
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

  return (
    <figure
      className={`panel-in relative m-0 flex min-h-0 flex-col overflow-hidden border-[4px] border-black bg-white shadow-[4px_4px_0_rgba(0,0,0,.85)] group ${
        isEditMode ? "hover:border-yellow-400 cursor-pointer" : ""
      }`}
      style={{ animationDelay: `${i * 100}ms` }}
      onClick={() => {
        if (isEditMode) {
          handleEditThisPanel();
        }
      }}
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

      {/* Panel Scene Canvas */}
      <div
        onClick={() => {
          if (isEditMode) handleEditThisPanel();
        }}
        className={`relative aspect-[4/3] overflow-hidden bg-sky-200 md:aspect-auto md:min-h-0 md:flex-1 ${
          isEditMode ? "cursor-pointer" : ""
        }`}
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
            className={`absolute left-0 top-0 z-20 bg-black px-2.5 py-0.5 font-bangers text-sm tracking-wider text-yellow-300 ${
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
            className={`sfx absolute z-10 ${SFX_POS[p.sfxAt ?? "tr"]} ${
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
          onClick={() => {
            if (isEditMode) handleEditThisPanel();
          }}
          className={`relative z-10 border-t-[3px] border-black bg-[#fff1a8] px-3 py-2 font-comic text-[13px] font-bold leading-snug text-slate-900 md:text-[13.5px] ${
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
}: {
  page: Page;
  index: number;
  total: number;
}) {
  const { vectorChapters, isEditMode, openEditor, addVectorPanel } = useAdmin();
  const ch = vectorChapters.find((c) => c.n === page.ch) || {
    n: page.ch,
    title: `Chapter ${page.ch}`,
  };

  const layout = LAYOUTS[index % LAYOUTS.length];

  return (
    <article className="page-in mx-auto w-full max-w-5xl border-[5px] border-black bg-[#fffaf0] p-2.5 shadow-[10px_10px_0_rgba(0,0,0,.55)] md:p-4 rounded-xl">
      {/* Chapter Top Header */}
      <header className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-b-2 border-black/10 pb-2">
        <div className="-rotate-1 border-[3px] border-black bg-black px-3 py-1 font-bangers text-lg tracking-wider text-yellow-300 md:text-xl shadow-[2px_2px_0_#111]">
          CHAPTER {ch.n}
        </div>

        <h2 className="font-bangers text-xl uppercase tracking-wide text-slate-900 md:text-2xl">
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
            <Edit2 className="w-3 h-3" /> EDIT CHAPTER TITLE
          </button>
        )}

        {page.sub && (
          <span className="rounded-full border-2 border-black bg-sky-300 px-3 py-0.5 font-comic text-xs font-bold text-slate-900">
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

        <span className="ml-auto font-bangers text-lg text-slate-600">
          PAGE {index + 1} / {total}
        </span>
      </header>

      {/* Panels Grid */}
      <div className="grid grid-cols-1 gap-3 md:auto-rows-[385px] md:grid-cols-12">
        {page.panels.map((p, i) => (
          <div
            key={i}
            className={`flex min-h-0 flex-col ${layout[i % layout.length] || "md:col-span-6"} [&>figure]:flex-1`}
          >
            <PanelView p={p} i={i} pageIndex={index} />
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
