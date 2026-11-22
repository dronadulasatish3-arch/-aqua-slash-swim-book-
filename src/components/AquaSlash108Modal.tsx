import React, { useState } from 'react';
import { AQUA_SLASH_STAGES } from '../data/comicStoryData';
import { Droplets, X, CheckCircle2, Sparkles, Award } from 'lucide-react';
import { comicAudio } from '../utils/comicAudio';

interface AquaSlash108ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AquaSlash108Modal: React.FC<AquaSlash108ModalProps> = ({ isOpen, onClose }) => {
  const [selectedStageIdx, setSelectedStageIdx] = useState<number>(0);
  const [masteredDrops, setMasteredDrops] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
  });

  if (!isOpen) return null;

  const currentStage = AQUA_SLASH_STAGES[selectedStageIdx];
  const totalMastered = Object.values(masteredDrops).filter(Boolean).length;

  const toggleDrop = (globalDropNumber: number) => {
    comicAudio.playWaterDrop();
    setMasteredDrops((prev) => ({
      ...prev,
      [globalDropNumber]: !prev[globalDropNumber],
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-[#091528] border-4 border-[#050B14] rounded-2xl shadow-[10px_10px_0px_#0EA5E9] overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Top Comic Banner */}
        <div className="bg-gradient-to-r from-sky-950 via-cyan-900 to-amber-950 px-5 py-4 border-b-4 border-[#050B14] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#0EA5E9] border-2 border-[#050B14] shadow-[3px_3px_0px_#050B14] flex items-center justify-center text-[#050B14]">
              <Droplets className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[11px] font-mono-code font-bold bg-[#FDE047] text-[#050B14] rounded border border-[#050B14]">
                  JULY 1, 2026 • AQUA SLASH ARCHITECTURE
                </span>
                <span className="hidden sm:inline-block text-xs font-mono-code text-sky-300">
                  6 STAGES × 3 LEVELS × 6 DROPS = 108 DROPS
                </span>
              </div>
              <h2 className="font-comic text-2xl sm:text-3xl text-white tracking-wider mt-0.5">
                THE 108 DROPS SYSTEM — ONE DROP AT A TIME
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 hover:bg-rose-600 text-white border-2 border-[#050B14] shadow-[3px_3px_0px_#050B14] transition cursor-pointer"
            aria-label="Close 108 Drops Explorer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formula & Progress Bar */}
        <div className="bg-[#0D1E38] px-5 py-3 border-b-2 border-[#050B14] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-sky-200 font-medium">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong className="text-white">Philosophy:</strong> Cut through fear of water. One skill, one level, one stage at a time.
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-[#050B14] px-3 py-1 rounded-full border border-sky-500/40">
              <Award className="w-4 h-4 text-amber-400" />
              <span className="font-mono-code text-xs font-bold text-amber-300">
                {totalMastered} / 108 DROPS PRACTICED
              </span>
            </div>
          </div>
        </div>

        {/* 6 Stage Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 p-4 bg-[#071120] border-b-2 border-[#050B14]">
          {AQUA_SLASH_STAGES.map((st, idx) => {
            const isSelected = idx === selectedStageIdx;
            return (
              <button
                key={st.name}
                onClick={() => {
                  comicAudio.playPageFlip();
                  setSelectedStageIdx(idx);
                }}
                className={`p-2.5 rounded-xl border-2 text-left transition cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-br ' +
                      st.color +
                      ' text-[#050B14] border-[#050B14] shadow-[4px_4px_0px_#FDE047] -translate-y-0.5'
                    : 'bg-[#0F223D] text-slate-200 border-[#050B14] hover:border-sky-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono-code text-[10px] font-bold opacity-80">
                    STAGE 0{st.stageNumber}
                  </span>
                  <span className="font-mono-code text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/20">
                    18 DROPS
                  </span>
                </div>
                <div className="font-comic text-xl tracking-wider mt-0.5">{st.name}</div>
              </button>
            );
          })}
        </div>

        {/* Selected Stage Details + 3 Levels × 6 Drops Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          <div className="narrator-box p-4 rounded-xl">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-comic text-2xl text-[#050B14]">
                STAGE 0{currentStage.stageNumber}: {currentStage.name} — {currentStage.tagline}
              </h3>
              <span className="font-mono-code text-xs font-bold px-2.5 py-1 rounded bg-[#050B14] text-[#FDE047]">
                DROPS #{(currentStage.stageNumber - 1) * 18 + 1} – #{currentStage.stageNumber * 18}
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-800 mt-1">
              {currentStage.storyEcho}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {currentStage.levels.map((lvl) => (
              <div
                key={lvl.levelNumber}
                className="bg-[#0E213B] border-3 border-[#050B14] rounded-xl p-4 shadow-[5px_5px_0px_#050B14] flex flex-col"
              >
                <div className="flex items-center justify-between pb-2.5 mb-3 border-b-2 border-slate-700/80">
                  <div>
                    <span className="font-mono-code text-[11px] font-bold text-amber-400">
                      LEVEL 0{lvl.levelNumber}
                    </span>
                    <h4 className="font-display font-bold text-base text-white">
                      {lvl.levelTitle}
                    </h4>
                  </div>
                  <span className="font-mono-code text-xs px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-400/30">
                    6 DROPS
                  </span>
                </div>

                <div className="space-y-2 flex-1">
                  {lvl.drops.map((drp) => {
                    const isDone = !!masteredDrops[drp.globalDropNumber];
                    return (
                      <button
                        key={drp.globalDropNumber}
                        onClick={() => toggleDrop(drp.globalDropNumber)}
                        className={`w-full text-left p-2.5 rounded-lg border-2 transition flex items-start gap-2.5 cursor-pointer ${
                          isDone
                            ? 'bg-emerald-950/80 border-emerald-400 text-emerald-100'
                            : 'bg-[#081526] border-[#050B14] hover:border-sky-400 text-slate-200'
                        }`}
                      >
                        <CheckCircle2
                          className={`w-4 h-4 mt-0.5 shrink-0 ${
                            isDone ? 'text-emerald-400' : 'text-slate-500'
                          }`}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-mono-code text-[10px] font-bold text-sky-400">
                              DROP #{drp.globalDropNumber}
                            </span>
                            <span className="font-mono-code text-[10px] text-slate-400">
                              D0{drp.dropNumber}
                            </span>
                          </div>
                          <div className="text-xs font-bold leading-snug mt-0.5">
                            {drp.title.split(': ')[1] || drp.title}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
