// ───────────────────────────────────────────────────────────
// Aqua Slash — Level 3: Pond Section Component
// 3 Pond Levels · 6 Drops per level · 18 Drops in total · 1 skill = 1 drop earned
// ───────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react';
import {
  getPondLevel,
  getPondSkill,
  getPondSkillsByLevel,
  POND_LEVELS,
  type PondLevelId,
} from '../data/pondCurriculum';
import type { Student } from '../lib/api';
import { sfx, useSoundOn } from '../lib/sound';
import { PondScene } from '../pond/PondScene';
import {
  loadPond,
  pondChecks,
  pondCurrent,
  pondLevelCount,
  pondLevelDone,
  pondLevelUnlocked,
  pondReady,
  pondSkillState,
  usePondMachine,
} from '../state/pondMachine';
import { cn } from '../utils/cn';

const CHIP = {
  AVAILABLE: { cls: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200', label: '▶ Ready' },
  LEARNING: { cls: 'bg-amber-100 text-amber-900 ring-1 ring-amber-300 animate-pulse', label: '🔄 Active' },
  COMPLETED: { cls: 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300', label: '✓ Earned' },
};

export function PondSection({
  student,
  onGoNext,
}: {
  student: Student;
  onGoNext?: () => void;
}) {
  const { state, dispatch } = usePondMachine(student.studentId);
  const soundOn = useSoundOn();

  const current = pondCurrent(state);
  const [level, setLevel] = useState<PondLevelId>(1);
  const [openId, setOpenId] = useState<number | null>(current ?? 1);
  const [showPondGuide, setShowPondGuide] = useState(false);
  const [celebrate, setCelebrate] = useState<PondLevelId | null>(null);

  const pondRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);

  // Sync initial level based on active uncompleted drop
  useEffect(() => {
    if (current) {
      const s = getPondSkill(current);
      setLevel(s.level);
      setOpenId(current);
    }
  }, [current]);

  const open = (id: number) => {
    const st = pondSkillState(state, id);
    if (st === 'AVAILABLE') dispatch({ type: 'OPEN', id });
    setOpenId(id);
    if (soundOn) sfx.click();
    requestAnimationFrame(() =>
      detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    );
  };

  const complete = (id: number) => {
    if (!pondReady(state, id)) return;
    dispatch({ type: 'COMPLETE', id });
    if (soundOn) (id === 18 ? sfx.celebrate : sfx.success)();

    setTimeout(() => {
      dispatch({ type: 'DROP_SETTLED', id });
      if (id % 6 === 0) {
        setCelebrate(getPondSkill(id).level);
      }
    }, 1500);

    requestAnimationFrame(() =>
      pondRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    );
  };

  const reset = () => {
    if (
      !window.confirm(
        `Reset Pond Stage progress for ${student.studentName}?\n\nOnly Pond drops will be cleared. Glass and Pool progress are not affected.`
      )
    )
      return;
    dispatch({ type: 'RESET' });
    setLevel(1);
    setOpenId(1);
  };

  const heroId = openId ?? current ?? 1;
  const activeSkill = getPondSkill(heroId);
  const activeSt = pondSkillState(state, heroId);
  const totalCompleted = state.completed.length;

  return (
    <div className="pt-6 pb-20">
      {/* Stage Header */}
      <div className="mb-5 text-center">
        <p className="text-xs font-extrabold uppercase tracking-[0.3em] text-teal-600">
          Aqua Slash Journey · Stage 3
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold uppercase leading-tight text-[#06214a] sm:text-5xl">
          🌿 Pond
        </h1>
        <p className="mt-1 font-display text-lg font-medium text-teal-700 sm:text-xl">
          Advanced Swimming & Multi-Stroke Foundations · One drop at a time 💧
        </p>

        {/* Essential Curriculum Notice */}
        <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-teal-50 px-4 py-1.5 text-xs font-extrabold text-teal-900 border border-teal-200 shadow-sm">
          <span>ℹ️</span>
          <span>
            Pond is a curriculum stage name. All skills are taught and practiced strictly in a regulated swimming pool.
          </span>
        </div>
      </div>

      {/* Interactive Swimmer Animation Scene */}
      <div ref={pondRef} className="mb-6 scroll-mt-28">
        <PondScene skillId={heroId} soundOn={soundOn} />
      </div>

      {/* Drop Selection & Overview */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        {/* Left Column: Totem Progress Card */}
        <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#06214a] via-[#083344] to-[#042f2e] p-5 sm:p-6 text-white shadow-xl border border-teal-500/30">
          <div className="flex items-center justify-between">
            <span className="font-display text-lg font-bold">Pond Stage Drops</span>
            <span className="rounded-full bg-teal-400/20 px-3 py-1 text-xs font-black text-teal-200 border border-teal-400/30">
              💧 {totalCompleted}/18 Drops
            </span>
          </div>

          <p className="mt-2 text-xs font-semibold text-teal-100">
            Every completed skill awards exactly 1 Drop. Complete all 18 Drops across the 3 Pond Levels.
          </p>

          {/* 18-Drop Progress Visualizer */}
          <div className="mt-4 grid grid-cols-6 gap-2 rounded-2xl bg-white/10 p-3">
            {Array.from({ length: 18 }).map((_, i) => {
              const dropId = i + 1;
              const isDone = state.completed.includes(dropId);
              const isActive = dropId === heroId;
              return (
                <button
                  key={dropId}
                  onClick={() => open(dropId)}
                  className={cn(
                    'grid h-10 w-full place-items-center rounded-xl text-xs font-black transition cursor-pointer',
                    isDone
                      ? 'bg-emerald-400 text-[#06214a] shadow-md shadow-emerald-400/30'
                      : isActive
                      ? 'bg-cyan-400 text-[#06214a] ring-2 ring-white scale-105'
                      : 'bg-white/15 text-slate-300 hover:bg-white/25'
                  )}
                  title={`Drop ${dropId}: ${getPondSkill(dropId).name}`}
                >
                  {isDone ? '✓' : `💧${dropId}`}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between text-xs font-extrabold text-teal-200">
            <span>Pond 1: Drops 1–6</span>
            <span>Pond 2: Drops 7–12</span>
            <span>Pond 3: Drops 13–18</span>
          </div>

          {/* Reset button */}
          <div className="mt-6 border-t border-white/10 pt-4 text-center">
            <button
              onClick={reset}
              className="text-xs font-bold text-slate-400 hover:text-white transition cursor-pointer"
            >
              ↺ Reset Pond drops for this student
            </button>
          </div>
        </div>

        {/* Right Column: Level Tabs & Skill List */}
        <div className="rounded-[28px] bg-white p-4 shadow-lg ring-1 ring-sky-100 sm:p-6">
          {/* Level Tabs */}
          <div className="mb-4 grid grid-cols-3 gap-1.5 rounded-2xl bg-teal-50 p-1.5" role="tablist">
            {POND_LEVELS.map((l) => {
              const count = pondLevelCount(state, l.id);
              const isSelected = level === l.id;
              const isDone = count === 6;
              return (
                <button
                  key={l.id}
                  onClick={() => setLevel(l.id)}
                  role="tab"
                  aria-selected={isSelected}
                  className={cn(
                    'min-h-12 rounded-xl px-2 text-xs font-extrabold transition sm:text-sm cursor-pointer',
                    isSelected
                      ? 'bg-[#06214a] text-white shadow-md'
                      : 'text-teal-800 hover:bg-white'
                  )}
                >
                  {l.emoji} Pond {l.id}
                  {isDone && ' ✓'}
                </button>
              );
            })}
          </div>

          {/* Active Level Header */}
          {(() => {
            const currentLevelData = getPondLevel(level);
            return (
              <div className="mb-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-teal-600">
                    Pond {currentLevelData.id} · {pondLevelCount(state, currentLevelData.id)}/6 Drops
                  </p>
                  {pondLevelDone(state, currentLevelData.id) && (
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-black text-emerald-800">
                      Level Complete 🏆
                    </span>
                  )}
                </div>
                <h2 className="font-display text-2xl font-semibold uppercase leading-tight text-[#06214a]">
                  {currentLevelData.name}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 font-semibold mt-0.5">
                  {currentLevelData.purpose}
                </p>
              </div>
            );
          })()}

          {/* Drops in this level */}
          <ol className="space-y-2.5">
            {getPondSkillsByLevel(level).map((k) => {
              const st = pondSkillState(state, k.id);
              const isSelected = heroId === k.id;
              return (
                <li key={k.id}>
                  <button
                    onClick={() => open(k.id)}
                    className={cn(
                      'flex min-h-16 w-full items-center gap-3.5 rounded-2xl p-3.5 text-left ring-2 transition focus:outline-none focus-visible:ring-4 focus-visible:ring-cyan-200 cursor-pointer',
                      isSelected
                        ? 'bg-teal-50/70 ring-teal-500 shadow-sm'
                        : 'bg-white ring-slate-100 hover:bg-slate-50 hover:ring-teal-200'
                    )}
                  >
                    <span
                      className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-teal-100 text-2xl shadow-inner"
                      aria-hidden
                    >
                      {k.icon}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[11px] font-black uppercase tracking-wider text-teal-600">
                        💧 Drop {k.id} of 18 · {k.focus}
                      </span>
                      <span className="block font-display text-sm sm:text-base font-bold text-[#06214a] leading-snug">
                        {k.name}
                      </span>
                    </span>
                    <span className={cn('shrink-0 rounded-full px-3 py-1 text-xs font-black', CHIP[st].cls)}>
                      {CHIP[st].label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      {/* Selected Drop Action & Video Card */}
      <div
        ref={detailRef}
        className="fade-up mt-6 scroll-mt-28 rounded-[28px] bg-gradient-to-br from-[#06214a] via-[#0c2f5a] to-[#06214a] p-5 sm:p-7 text-white shadow-xl border-2 border-teal-400"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span
              className="grid h-16 w-16 shrink-0 place-items-center rounded-3xl bg-gradient-to-br from-teal-300 to-cyan-500 text-3xl shadow-lg text-[#06214a]"
              aria-hidden
            >
              {activeSkill.icon}
            </span>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-teal-300">
                Pond Level {activeSkill.level} · Drop {activeSkill.id} of 18
              </p>
              <h3 className="font-display text-2xl sm:text-3xl font-bold uppercase leading-tight text-white">
                {activeSkill.name}
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-teal-100 font-medium">
                {activeSkill.short}
              </p>
              {activeSkill.cues && activeSkill.cues[0] && (
                <p className="mt-2 text-xs font-bold text-yellow-300">
                  📣 Cue: “{activeSkill.cues[0]}”
                </p>
              )}
            </div>
          </div>

          {/* Action Button: 1 Completed Skill = 1 Drop */}
          <div className="shrink-0 w-full sm:w-auto">
            {activeSt === 'COMPLETED' ? (
              <div className="rounded-2xl bg-emerald-500/20 border-2 border-emerald-400 px-6 py-3 text-center font-black text-emerald-300">
                ✓ Drop {activeSkill.id} Earned!
              </div>
            ) : (
              <button
                onClick={() => complete(activeSkill.id)}
                className="w-full sm:w-auto min-h-12 rounded-2xl bg-gradient-to-r from-teal-400 via-cyan-400 to-sky-500 px-6 py-3 font-display text-lg font-bold uppercase tracking-wide text-[#06214a] shadow-xl hover:-translate-y-0.5 transition cursor-pointer"
              >
                💧 Add My Drop — Complete
              </button>
            )}
          </div>
        </div>

        {/* Collapsible Curriculum Details Toggle */}
        <div className="mt-4 pt-3 border-t border-white/10 text-center">
          <button
            onClick={() => setShowPondGuide(!showPondGuide)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-200 hover:text-white bg-white/10 px-4 py-2 rounded-full border border-white/15 cursor-pointer transition hover:bg-white/20"
          >
            <span>
              {showPondGuide
                ? '▲ Hide Skill Curriculum & Guide'
                : '▼ Show Full Skill Curriculum & Guide (Optional)'}
            </span>
          </button>
        </div>

        {/* Full Curriculum Format (Shown only when toggled) */}
        {showPondGuide && (
          <div className="mt-5 space-y-4 rounded-2xl bg-white/5 p-4 sm:p-6 border border-white/10 text-white">
            {/* Why This Skill & Who is it for */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-white/10 p-4">
                <h4 className="font-display text-sm font-black uppercase text-teal-300 mb-1">
                  🧭 Why This Skill?
                </h4>
                <p className="text-xs text-slate-200 font-medium leading-relaxed">{activeSkill.why}</p>
              </div>
              <div className="rounded-xl bg-white/10 p-4">
                <h4 className="font-display text-sm font-black uppercase text-teal-300 mb-1">
                  🙋 Who is this for?
                </h4>
                <p className="text-xs text-slate-200 font-medium leading-relaxed">{activeSkill.who}</p>
                <div className="mt-2 text-xs text-slate-300">
                  <span className="font-bold text-white">What you need: </span>
                  {activeSkill.need.join(' · ')}
                </div>
              </div>
            </div>

            {/* Learn Steps */}
            <div className="rounded-xl bg-white/10 p-4">
              <h4 className="font-display text-sm font-black uppercase text-teal-300 mb-2">
                📘 Learn Steps
              </h4>
              <ol className="grid gap-2 sm:grid-cols-2">
                {activeSkill.steps.map((st, i) => (
                  <li key={i} className="flex gap-2.5 text-xs text-slate-200">
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-teal-400 font-bold text-[#06214a] text-[10px]">
                      {i + 1}
                    </span>
                    <span>{st}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Practice & Safety */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-white/10 p-4">
                <h4 className="font-display text-sm font-black uppercase text-cyan-300 mb-1">
                  🔄 Pool Practice Task
                </h4>
                <p className="text-xs text-slate-200 font-medium">{activeSkill.practice.task}</p>
                <div className="mt-2 text-[11px] text-teal-200 font-bold flex gap-3">
                  <span>Reps: {activeSkill.practice.reps}</span>
                  <span>Rest: {activeSkill.practice.rest}</span>
                </div>
              </div>

              <div className="rounded-xl bg-amber-400/10 border border-amber-400/20 p-4">
                <h4 className="font-display text-sm font-black uppercase text-amber-300 mb-1">
                  🛟 Pool Safety
                </h4>
                <ul className="space-y-1 text-xs text-amber-100">
                  {activeSkill.safety.map((sf, i) => (
                    <li key={i} className="flex gap-1.5">
                      <span>⚠️</span>
                      <span>{sf}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Mistakes & Fixes */}
            <div className="rounded-xl bg-white/10 p-4">
              <h4 className="font-display text-sm font-black uppercase text-teal-300 mb-2">
                🚫 Common Mistakes & Corrections
              </h4>
              <div className="grid gap-3 sm:grid-cols-2">
                {activeSkill.mistakes.map((m, i) => (
                  <div key={i} className="rounded-lg bg-black/20 p-2.5 text-xs">
                    <p className="font-bold text-rose-300">✗ {m.mistake}</p>
                    <p className="mt-1 font-bold text-emerald-300">✓ {m.fix}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Level Milestone Celebration Modal */}
      {celebrate && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-[#06214a]/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="fade-up w-full max-w-md rounded-[32px] bg-gradient-to-br from-teal-500 to-[#06214a] p-7 text-center text-white shadow-2xl border-2 border-teal-300">
            <div className="mx-auto mb-3 grid h-20 w-20 place-items-center rounded-full bg-white/20 text-5xl">
              🏆
            </div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-teal-200">
              Pond Milestone Achieved!
            </p>
            <h3 className="font-display text-3xl font-extrabold uppercase mt-1">
              Pond Level {celebrate} Complete
            </h3>
            <p className="mt-2 text-sm text-teal-100 font-semibold">
              {celebrate === 1 && 'Mastered Advanced Freestyle & Backstroke efficiency! Ready for Breaststroke kick.'}
              {celebrate === 2 && 'Mastered Advanced Strokes and Breaststroke Kick! Ready for Breaststroke basics & Dolphin kick.'}
              {celebrate === 3 && 'All 18 Pond Drops Completed! You have earned your Pond Stage Graduation!'}
            </p>

            <button
              onClick={() => {
                setCelebrate(null);
                if (celebrate < 3) setLevel((celebrate + 1) as PondLevelId);
              }}
              className="mt-6 min-h-12 w-full rounded-2xl bg-white font-extrabold uppercase tracking-wide text-[#06214a] shadow-lg hover:bg-teal-50 cursor-pointer"
            >
              {celebrate < 3 ? `Continue to Pond Level ${celebrate + 1} →` : 'Awesome! Close'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
