import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import {
  X,
  BookOpen,
  Download,
  RotateCcw,
  Plus,
  Edit2,
  Trash2,
  Layers,
  Palette,
  Image as ImageIcon,
} from 'lucide-react';

export const AdminControlDrawer: React.FC = () => {
  const {
    adminDrawerOpen,
    setAdminDrawerOpen,
    illustratedPages,
    vectorPages,
    vectorChapters,
    openEditor,
    addVectorPage,
    deleteVectorPage,
    addVectorPanel,
    deleteVectorPanel,
    resetBothStoriesToDefaults,
    exportAllStoriesJson,
    importAllStoriesJson,
  } = useAdmin();

  const [activeTab, setActiveTab] = useState<'vector' | 'illustrated' | 'chapters' | 'cover' | 'backup'>('vector');
  const [selectedVectorPageNum, setSelectedVectorPageNum] = useState<number>(1);
  const [selectedIllustratedPageNum, setSelectedIllustratedPageNum] = useState<number>(1);

  if (!adminDrawerOpen) return null;

  const vectorPageIdx = Math.max(0, Math.min(vectorPages.length - 1, selectedVectorPageNum - 1));
  const selectedVectorPage = vectorPages[vectorPageIdx] || vectorPages[0];

  const illustratedPage =
    illustratedPages.find((p) => p.pageNumber === selectedIllustratedPageNum) ||
    illustratedPages[0];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl bg-[#091528] border-l-4 border-black text-white flex flex-col h-full shadow-[-10px_0_0_#000]">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 p-4 border-b-4 border-black flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-black bg-yellow-400 text-black shadow-[2px_2px_0_#000]">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-bold bg-yellow-400 text-black px-2 py-0.5 rounded border border-black">
                  DUAL COMIC CMS CONTROL CENTER
                </span>
                <span className="text-xs text-sky-300">Admin: Satish Dronadula</span>
              </div>
              <h2 className="font-bangers text-2xl tracking-wide text-white">
                THE HAND IN THE WATER — STORY MANAGER
              </h2>
            </div>
          </div>

          <button
            onClick={() => setAdminDrawerOpen(false)}
            className="rounded-lg border-2 border-black bg-rose-600 p-1.5 text-white hover:bg-rose-500 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigator */}
        <div className="flex flex-wrap items-center gap-1.5 border-b-2 border-black bg-slate-950 p-2.5">
          <button
            onClick={() => setActiveTab('vector')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bangers text-xs tracking-wider border-2 transition cursor-pointer ${
              activeTab === 'vector'
                ? 'bg-yellow-400 text-black border-black shadow-[2px_2px_0_#000]'
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500'
            }`}
          >
            <Palette className="w-3.5 h-3.5" /> COMIC 2: VECTOR STRIP ({vectorPages.length} PAGES)
          </button>

          <button
            onClick={() => setActiveTab('illustrated')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bangers text-xs tracking-wider border-2 transition cursor-pointer ${
              activeTab === 'illustrated'
                ? 'bg-yellow-400 text-black border-black shadow-[2px_2px_0_#000]'
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" /> COMIC 1: ILLUSTRATED ({illustratedPages.length} PAGES)
          </button>

          <button
            onClick={() => setActiveTab('chapters')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bangers text-xs tracking-wider border-2 transition cursor-pointer ${
              activeTab === 'chapters'
                ? 'bg-yellow-400 text-black border-black shadow-[2px_2px_0_#000]'
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> 14 CHAPTER TITLES
          </button>

          <button
            onClick={() => setActiveTab('cover')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bangers text-xs tracking-wider border-2 transition cursor-pointer ${
              activeTab === 'cover'
                ? 'bg-yellow-400 text-black border-black shadow-[2px_2px_0_#000]'
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" /> COVER PAGE
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bangers text-xs tracking-wider border-2 transition cursor-pointer ${
              activeTab === 'backup'
                ? 'bg-yellow-400 text-black border-black shadow-[2px_2px_0_#000]'
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500'
            }`}
          >
            <Download className="w-3.5 h-3.5" /> BACKUP & RESTORE
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* TAB 1: VECTOR STRIP COMIC */}
          {activeTab === 'vector' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bangers text-lg text-yellow-300">
                  COMIC 2: VECTOR STRIP PAGES ({vectorPages.length} TOTAL)
                </span>
                <button
                  onClick={() => addVectorPage(vectorPageIdx)}
                  className="flex items-center gap-1 rounded-lg border-2 border-black bg-emerald-500 px-3 py-1 font-bangers text-xs text-black shadow-[2px_2px_0_#000] hover:bg-emerald-400"
                >
                  <Plus className="w-3 h-3" /> ADD NEW PAGE AFTER PAGE {vectorPageIdx + 1}
                </button>
              </div>

              {/* Page Number Chips */}
              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-2 rounded-lg bg-slate-950 border border-slate-800">
                {vectorPages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedVectorPageNum(idx + 1)}
                    className={`h-8 w-8 rounded-lg font-bangers text-sm border-2 transition ${
                      idx === vectorPageIdx
                        ? 'bg-yellow-400 text-black border-black shadow-[2px_2px_0_#000]'
                        : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>

              {selectedVectorPage && (
                <div className="rounded-xl border-2 border-slate-700 bg-slate-950 p-3 flex items-center justify-between">
                  <div>
                    <span className="font-mono text-xs text-yellow-300">
                      CHAPTER {selectedVectorPage.ch} • PAGE {vectorPageIdx + 1}
                    </span>
                    <h3 className="font-bangers text-xl text-white">
                      {vectorChapters.find((c) => c.n === selectedVectorPage.ch)?.title || 'Story'}
                    </h3>
                    {selectedVectorPage.sub && (
                      <p className="text-xs text-sky-300 font-bold">{selectedVectorPage.sub}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        openEditor({
                          type: 'vector-page',
                          pageIndex: vectorPageIdx,
                          page: selectedVectorPage,
                        })
                      }
                      className="rounded-lg border-2 border-black bg-cyan-400 px-3 py-1 font-bangers text-xs text-black hover:bg-cyan-300"
                    >
                      <Edit2 className="w-3 h-3 inline mr-1" /> EDIT SUBTITLE
                    </button>
                    <button
                      onClick={() => deleteVectorPage(vectorPageIdx)}
                      className="rounded-lg border border-rose-600 bg-rose-950 px-2 py-1 font-bangers text-xs text-rose-300 hover:bg-rose-900"
                    >
                      <Trash2 className="w-3 h-3 inline mr-1" /> DELETE PAGE
                    </button>
                  </div>
                </div>
              )}

              {/* Panels */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bangers text-sm tracking-wider text-slate-300">
                    PANELS ON THIS PAGE ({selectedVectorPage?.panels.length || 0})
                  </span>
                  <button
                    onClick={() => addVectorPanel(vectorPageIdx)}
                    className="flex items-center gap-1 rounded bg-yellow-400 text-black px-2.5 py-0.5 font-bangers text-xs hover:bg-yellow-300"
                  >
                    <Plus className="w-3 h-3" /> ADD PANEL
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {selectedVectorPage?.panels.map((panel, pIdx) => (
                    <div
                      key={pIdx}
                      className="rounded-xl border-2 border-black bg-slate-900 p-3 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                          <span className="font-mono text-xs font-bold text-yellow-300">
                            PANEL #{pIdx + 1}
                          </span>
                          {panel.tag && (
                            <span className="text-[10px] bg-black px-1.5 py-0.5 rounded text-sky-300">
                              {panel.tag}
                            </span>
                          )}
                        </div>

                        <p className="mt-2 text-xs text-slate-200 line-clamp-3">
                          {panel.cap || '(No caption set)'}
                        </p>

                        {panel.say && (
                          <div className="mt-2 text-xs text-sky-200 bg-slate-950 p-1.5 rounded border border-slate-800">
                            💬 "{typeof panel.say === 'string' ? panel.say : panel.say[0]}"
                          </div>
                        )}

                        {panel.customImg && (
                          <div className="mt-2 text-[10px] text-amber-300 font-bold">
                            ✓ Custom image attached
                          </div>
                        )}
                      </div>

                      <div className="mt-3 flex items-center justify-between border-t border-slate-800 pt-2">
                        <button
                          onClick={() =>
                            openEditor({
                              type: 'vector-panel',
                              pageIndex: vectorPageIdx,
                              panelIndex: pIdx,
                              panel,
                            })
                          }
                          className="flex items-center gap-1 rounded-lg border-2 border-black bg-yellow-400 px-3 py-1 font-bangers text-xs text-black hover:bg-yellow-300"
                        >
                          <Edit2 className="w-3 h-3" /> EDIT PANEL & IMAGE
                        </button>
                        <button
                          onClick={() => deleteVectorPanel(vectorPageIdx, pIdx)}
                          className="rounded p-1 text-slate-400 hover:text-rose-400"
                          title="Delete panel"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ILLUSTRATED MEMOIR COMIC */}
          {activeTab === 'illustrated' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bangers text-lg text-yellow-300">
                  COMIC 1: ILLUSTRATED PAGES ({illustratedPages.length} TOTAL)
                </span>
                <button
                  onClick={() =>
                    openEditor({
                      type: 'illustrated-page',
                      pageNumber: illustratedPage.pageNumber,
                      page: illustratedPage,
                    })
                  }
                  className="rounded-lg border-2 border-black bg-cyan-400 px-3 py-1 font-bangers text-xs text-black hover:bg-cyan-300"
                >
                  <Edit2 className="w-3 h-3 inline mr-1" /> EDIT PAGE TITLE & QUOTE
                </button>
              </div>

              {/* Page Number Chips */}
              <div className="flex flex-wrap gap-1.5 p-2 rounded-lg bg-slate-950 border border-slate-800">
                {illustratedPages.map((p) => (
                  <button
                    key={p.pageNumber}
                    onClick={() => setSelectedIllustratedPageNum(p.pageNumber)}
                    className={`h-8 w-8 rounded-lg font-bangers text-sm border-2 transition ${
                      p.pageNumber === selectedIllustratedPageNum
                        ? 'bg-yellow-400 text-black border-black shadow-[2px_2px_0_#000]'
                        : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    {p.pageNumber}
                  </button>
                ))}
              </div>

              {illustratedPage && (
                <div className="rounded-xl border-2 border-slate-700 bg-slate-950 p-3">
                  <span className="font-mono text-xs text-yellow-300">{illustratedPage.chapterCode}</span>
                  <h3 className="font-bangers text-xl text-white">{illustratedPage.title}</h3>
                  <p className="text-xs text-slate-400">{illustratedPage.subtitle}</p>
                  <p className="mt-1 text-xs italic text-sky-300">"{illustratedPage.summaryQuote}"</p>
                </div>
              )}

              {/* Panels */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {illustratedPage?.panels.map((panel) => (
                  <div
                    key={panel.id}
                    className="rounded-xl border-2 border-black bg-slate-900 p-3 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                        <span className="font-mono text-xs font-bold text-yellow-300">
                          PANEL #{panel.panelNumber}
                        </span>
                        <span className="text-[10px] text-sky-400">{panel.locationTag}</span>
                      </div>
                      <p className="mt-2 text-xs text-slate-200 line-clamp-3">
                        {panel.narratorCaption}
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        openEditor({
                          type: 'illustrated-panel',
                          pageNumber: illustratedPage.pageNumber,
                          panel,
                        })
                      }
                      className="mt-3 flex items-center justify-center gap-1.5 rounded-lg border-2 border-black bg-yellow-400 py-1 font-bangers text-xs text-black hover:bg-yellow-300"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> EDIT CAPTION, DIALOGUE & ART
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: 14 CHAPTER TITLES */}
          {activeTab === 'chapters' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bangers text-lg text-yellow-300">
                  ALL 14 CHAPTER TITLES
                </span>
                <span className="text-xs text-slate-400">Click any title to edit</span>
              </div>

              <div className="space-y-2">
                {vectorChapters.map((ch) => (
                  <div
                    key={ch.n}
                    onClick={() =>
                      openEditor({
                        type: 'vector-chapter',
                        chapterNumber: ch.n,
                        title: ch.title,
                      })
                    }
                    className="p-3 rounded-xl border-2 border-black bg-slate-900 hover:border-yellow-400 transition cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="grid h-8 w-8 place-items-center bg-black font-bangers text-yellow-300 text-sm rounded border border-slate-800">
                        {ch.n}
                      </span>
                      <span className="font-bangers text-lg text-white tracking-wide">
                        {ch.title}
                      </span>
                    </div>

                    <button className="flex items-center gap-1 text-xs text-yellow-300 font-bold">
                      <Edit2 className="w-3.5 h-3.5" /> Edit
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: COVER PAGE */}
          {activeTab === 'cover' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bangers text-lg text-yellow-300">
                  COMIC BOOK COVER CUSTOMIZATION
                </span>
                <button
                  onClick={() => openEditor({ type: 'vector-cover' })}
                  className="flex items-center gap-1 rounded-lg border-2 border-black bg-yellow-400 px-4 py-1.5 font-bangers text-sm text-black hover:bg-yellow-300"
                >
                  <Edit2 className="w-3.5 h-3.5" /> EDIT COVER HEADLINES & IMAGE
                </button>
              </div>

              <div className="rounded-2xl border-4 border-black bg-black p-6 text-center space-y-3">
                <div className="inline-block border-[3px] border-black bg-yellow-300 px-4 py-1 font-bangers text-lg text-black -rotate-2">
                  A TRUE CHILDHOOD JOURNEY
                </div>
                <h1 className="font-bangers text-5xl text-white">
                  The Hand <span className="text-sky-300">in the Water</span>
                </h1>
                <p className="font-comic text-sm text-sky-200">
                  A Journey That Began With Water • Memoir of a Swimmer
                </p>
              </div>
            </div>
          )}

          {/* TAB 5: BACKUP & RESTORE */}
          {activeTab === 'backup' && (
            <div className="space-y-6">
              <div className="rounded-xl border-2 border-black bg-slate-900 p-5 space-y-3">
                <h4 className="font-bangers text-xl text-yellow-300">
                  DOWNLOAD BOTH STORIES BACKUP (JSON)
                </h4>
                <p className="text-xs text-slate-300">
                  Save all customizations for both Comic 1 (Illustrated) and Comic 2 (Vector Strip) into a portable JSON backup file.
                </p>
                <button
                  onClick={exportAllStoriesJson}
                  className="flex items-center gap-2 rounded-xl border-3 border-black bg-cyan-400 px-5 py-2.5 font-bangers text-sm tracking-wider text-black shadow-[3px_3px_0_#000] hover:bg-cyan-300 cursor-pointer"
                >
                  <Download className="w-4 h-4" /> EXPORT ALL STORIES BACKUP (.JSON)
                </button>
              </div>

              <div className="rounded-xl border-2 border-black bg-slate-900 p-5 space-y-3">
                <h4 className="font-bangers text-xl text-emerald-400">
                  RESTORE FROM BACKUP FILE
                </h4>
                <p className="text-xs text-slate-300">
                  Upload a previously saved backup file to restore all your custom comic pages and texts.
                </p>
                <input
                  type="file"
                  accept=".json"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = () => {
                        importAllStoriesJson(reader.result as string);
                      };
                      reader.readAsText(file);
                    }
                  }}
                  className="text-xs text-slate-300 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-2 file:border-black file:bg-yellow-400 file:font-bangers file:text-black file:cursor-pointer hover:file:bg-yellow-300"
                />
              </div>

              <div className="rounded-xl border-2 border-rose-900 bg-rose-950/40 p-5 space-y-3">
                <h4 className="font-bangers text-xl text-rose-400">
                  RESET TO ORIGINAL FACTORY EDITIONS
                </h4>
                <p className="text-xs text-slate-300">
                  Revert all custom edits across both comic stories back to the original author publication.
                </p>
                <button
                  onClick={resetBothStoriesToDefaults}
                  className="flex items-center gap-2 rounded-xl border-3 border-black bg-rose-600 px-5 py-2.5 font-bangers text-sm tracking-wider text-white shadow-[3px_3px_0_#000] hover:bg-rose-500 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" /> REVERT BOTH STORIES TO DEFAULTS
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
