import { useEffect, useRef, useState } from 'react';
import { GLASS_LEVELS, GLASS_SKILLS, getGlassSkill, glassSkillsByLevel, type GlassLevelId } from '../data/glass';
import type { Student } from '../lib/api';
import { sfx, useSoundOn } from '../lib/sound';
import {
  glassChecks,
  glassCurrent,
  glassLevelCount,
  glassLevelDone,
  glassLevelUnlocked,
  glassReady,
  glassSettledCount,
  glassSkillState,
  useGlassMachine,
  type GlassSkillState,
} from '../state/glassMachine';
import { cn } from '../utils/cn';
import { Glass3D } from './Glass3D';
import { GlassScene } from '../glass/GlassScene';
import { useAdmin } from '../context/AdminContext';

const CHIP: Record<GlassSkillState, { label: string; cls: string }> = {
  LOCKED: { label: '🔒 Locked', cls: 'bg-slate-200 text-slate-500' },
  AVAILABLE: { label: '▶ Start', cls: 'bg-cyan-100 text-cyan-800' },
  LEARNING: { label: '🔄 Learning', cls: 'bg-amber-100 text-amber-800' },
  COMPLETED: { label: '💧 Completed', cls: 'bg-sky-600 text-white' },
};

function MiniDrop({ state, active }: { state: 'done' | 'falling' | 'current' | 'todo'; active?: boolean }) {
  const fill = state === 'done' ? 'url(#mdFill)' : state === 'falling' ? '#bae6fd' : state === 'current' ? '#fde68a' : 'rgba(148,163,184,0.25)';
  return (
    <svg width="16" height="20" viewBox="0 0 24 29" aria-hidden className={cn(state === 'falling' && 'animate-pulse', active && 'drop-shadow-[0_0_5px_rgba(255,224,102,0.9)]')}>
      <defs>
        <radialGradient id="mdFill" cx="0.35" cy="0.4" r="0.8">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.35" stopColor="#67e8f9" />
          <stop offset="1" stopColor="#0284c7" />
        </radialGradient>
      </defs>
      <path d="M12 1.5 C16 8 21 12.5 21 18.5 A9 9 0 0 1 3 18.5 C3 12.5 8 8 12 1.5 Z" fill={fill} stroke={state === 'current' ? '#f59e0b' : state === 'todo' ? 'rgba(148,163,184,0.6)' : '#7dd3fc'} strokeWidth="1.5" />
    </svg>
  );
}

export function GlassSection({ student, onGoPool }: { student: Student; onGoPool: () => void }) {
  const { isAdmin } = useAdmin();
  const isCoachOrAdmin = Boolean(
    isAdmin ||
    student?.role === 'ADMIN' ||
    (student?.email && student.email.toLowerCase().includes('dronadulasatish')) ||
    (student?.mobile && student.mobile.includes('6305252050'))
  );

  const { state, dispatch } = useGlassMachine(student.studentId);
  const soundOn = useSoundOn();
  const current = glassCurrent(state);
  const [level, setLevel] = useState<GlassLevelId>(() => (current ? getGlassSkill(current).level : 3));
  const [openId, setOpenId] = useState<number | null>(null);
  const [celebrate, setCelebrate] = useState<GlassLevelId | null>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  const glassRef = useRef<HTMLDivElement>(null);
  const settled = glassSettledCount(state);
  const done = state.completed.length === 18;
  const busy = state.activeDrop != null;

  // DROP: APPEAR → FALL → SPLASH → WATER RISES → SETTLE (visual follows state)
  useEffect(() => {
    const id = state.activeDrop;
    if (id == null) return;
    const t1 = setTimeout(() => {
      if (soundOn) {
        sfx.drop();
        setTimeout(() => sfx.splash(), 60);
        setTimeout(() => sfx.bubbles(), 400);
      }
    }, 1000);
    const t2 = setTimeout(() => {
      dispatch({ type: 'DROP_SETTLED', id });
      if (id % 6 === 0) {
        setTimeout(() => {
          if (soundOn) (id === 18 ? sfx.celebrate : sfx.success)();
          setCelebrate(getGlassSkill(id).level);
        }, 900);
      } else setLevel(getGlassSkill(id + 1).level);
    }, 2200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.activeDrop]);

  const open = (id: number) => {
    const st = glassSkillState(state, id);
    if (st === 'LOCKED' || busy) return;
    if (st === 'AVAILABLE') dispatch({ type: 'OPEN', id });
    setOpenId(id);
    if (soundOn) sfx.click();
    requestAnimationFrame(() => detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  const complete = (id: number) => {
    if (busy || !glassReady(state, id)) return;
    dispatch({ type: 'COMPLETE', id });
    setOpenId(null);
    requestAnimationFrame(() => glassRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  const reset = () => {
    if (!window.confirm(`Reset Glass progress for ${student.studentName}?\n\nOnly this student's Glass drops are cleared. Pool progress and other students are not affected.`)) return;
    dispatch({ type: 'RESET' });
    setLevel(1);
    setOpenId(null);
  };

  const skill = openId ? getGlassSkill(openId) : null;
  const checks = openId ? glassChecks(state, openId) : null;
  const skillSt = openId ? glassSkillState(state, openId) : null;
  const cur = current ? getGlassSkill(current) : null;
  const next = current && current < 18 ? getGlassSkill(current + 1) : null;
  const pct = Math.round((state.completed.length / 18) * 100);
  const heroId = openId ?? current ?? 18;

  return (
    <div className="pt-6">
      <div className="mb-5 text-center">
        <p className="text-xs font-extrabold uppercase tracking-[0.3em] text-sky-500">Aqua Slash Journey · Stage 1</p>
        <h1 className="mt-1 font-display text-3xl font-bold uppercase leading-tight text-[#06214a] sm:text-5xl">🥛 Glass</h1>
        <p className="mt-1 font-display text-lg font-medium text-sky-600 sm:text-xl">Water Confidence & Basic Safety · One drop at a time 💧</p>
      </div>

      {/* THE SWIMMER — real swim animation for the current skill, same quality as the Pool */}
      <div ref={glassRef} className="mb-5 scroll-mt-28">
        <GlassScene skillId={heroId} soundOn={soundOn} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        {/* ONE CONTINUOUS GLASS — the drop-progress totem */}
        <div className="relative overflow-hidden rounded-[28px] bg-[radial-gradient(ellipse_at_top,#0f4c9c_0%,#0a3170_45%,#06214a_100%)] p-4 shadow-2xl shadow-sky-900/30 ring-1 ring-white/10 sm:p-6">
          <div className="pointer-events-none absolute inset-0 opacity-40 [background:radial-gradient(circle_at_20%_10%,rgba(143,240,255,0.25),transparent_40%),radial-gradient(circle_at_80%_90%,rgba(56,189,248,0.2),transparent_45%)]" aria-hidden />
          <div className="relative mb-1 flex items-center justify-between text-white">
            <span className="font-display text-lg font-semibold">One Continuous Glass</span>
            <span className="rounded-full bg-cyan-400/20 px-2.5 py-0.5 text-xs font-extrabold text-cyan-200">{busy ? `💧 Drop ${state.activeDrop} falling…` : `💧 ${state.completed.length}/18`}</span>
          </div>
          <div className="relative h-[240px] sm:h-[280px]">
            <Glass3D settled={settled} falling={state.activeDrop} levelDone={[glassLevelDone(state, 1), glassLevelDone(state, 2), glassLevelDone(state, 3)]} label={`${student.studentName}'s glass`} />
          </div>
          <p className="relative -mt-1 text-center text-[11px] font-bold text-sky-200/70">Move your pointer over the glass to tilt it ✨</p>

          {/* 18-drop progression */}
          <div className="relative mt-3 flex flex-wrap items-center justify-center gap-1.5 rounded-2xl bg-white/5 px-2 py-2" aria-label={`${state.completed.length} of 18 drops`}>
            {GLASS_LEVELS.map((l, li) => (
              <div key={l.id} className="flex items-center gap-0.5">
                {li > 0 && <span className="mx-1 h-4 w-px bg-white/20" aria-hidden />}
                {glassSkillsByLevel(l.id).map((k) => (
                  <MiniDrop
                    key={k.id}
                    active={k.id === current}
                    state={state.activeDrop === k.id ? 'falling' : state.completed.includes(k.id) ? 'done' : k.id === current ? 'current' : 'todo'}
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="relative mt-2 grid grid-cols-3 gap-2">
            {GLASS_LEVELS.map((l) => {
              const c = glassLevelCount(state, l.id);
              return (
                <div key={l.id} className={cn('rounded-2xl px-2 py-2 text-center transition', c === 6 ? 'bg-cyan-400/25 text-white ring-1 ring-cyan-300/40' : 'bg-white/5 text-sky-100/80')}>
                  <p className="text-lg" aria-hidden>
                    {l.emoji}
                  </p>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider">Glass {l.id}</p>
                  <p className="text-xs font-black">{c === 6 ? '✓ 6/6' : `${c}/6`}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* status + skills */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <div className="col-span-2 rounded-3xl bg-white p-4 shadow-sm ring-2 ring-amber-200">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-amber-600">🎯 Current skill</p>
              <p className="mt-1 font-display text-base font-semibold leading-tight">{cur ? `Drop ${cur.id} — ${cur.name}` : '🏆 All 18 complete'}</p>
              {cur && <p className="text-xs font-bold text-slate-500">Glass {cur.level} · {GLASS_LEVELS[cur.level - 1].name}</p>}
            </div>
            <div className="rounded-3xl bg-white p-4 shadow-sm">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-sky-500">✅ Completed</p>
              <p className="mt-1 font-display text-2xl font-semibold">{state.completed.length}/18</p>
            </div>
            <div className="rounded-3xl bg-gradient-to-br from-sky-500 to-cyan-500 p-4 text-white shadow-sm">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-white/85">📈 Progress</p>
              <p className="mt-1 font-display text-2xl font-semibold">{pct}%</p>
            </div>
            <div className="col-span-2 rounded-3xl bg-white p-4 shadow-sm xl:col-span-4">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-sky-500">⏭ Next skill</p>
              <p className="mt-1 font-display text-base font-semibold leading-tight">{next ? `Drop ${next.id} — ${next.name}` : cur ? 'Last drop — then Pool!' : '🏊 Pool — Swimming Foundation'}</p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-sky-100">
                <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-sky-600 transition-all duration-700" style={{ width: `${pct}%` }} />
              </div>
            </div>
          </div>

          {done && (
            <div className="fade-up flex flex-col items-center gap-3 rounded-3xl bg-gradient-to-r from-sky-500 via-cyan-500 to-teal-400 p-5 text-center text-white shadow-lg sm:flex-row sm:text-left">
              <span className="text-4xl" aria-hidden>
                🏊
              </span>
              <div className="flex-1">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-white/85">Glass complete · Next journey</p>
                <p className="font-display text-2xl font-semibold uppercase">Pool — Swimming Foundation</p>
                <p className="text-sm text-white/90">You have built water confidence. Time for structured swimming!</p>
              </div>
              <button onClick={onGoPool} className="min-h-12 rounded-2xl bg-white px-5 font-extrabold uppercase tracking-wide text-sky-700 shadow">
                Go to Pool →
              </button>
            </div>
          )}

          <div className="rounded-[28px] bg-white p-4 shadow-lg ring-1 ring-sky-100 sm:p-5">
            <div className="mb-4 grid grid-cols-3 gap-1.5 rounded-2xl bg-sky-50 p-1.5" role="tablist" aria-label="Glass levels">
              {GLASS_LEVELS.map((l) => {
                const unlocked = glassLevelUnlocked(state, l.id);
                return (
                  <button
                    key={l.id}
                    role="tab"
                    aria-selected={level === l.id}
                    onClick={() => setLevel(l.id)}
                    className={cn('min-h-12 rounded-xl px-2 text-xs font-extrabold transition sm:text-sm', level === l.id ? 'bg-[#06214a] text-white shadow' : 'text-sky-700 hover:bg-white', !unlocked && level !== l.id && 'opacity-60')}
                  >
                    {l.emoji} Glass {l.id}
                    {!unlocked && ' 🔒'}
                    {glassLevelDone(state, l.id) && ' ✓'}
                  </button>
                );
              })}
            </div>
            {(() => {
              const l = GLASS_LEVELS[level - 1];
              return (
                <div className="mb-3">
                  <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-sky-500">
                    Glass {l.id} · {glassLevelCount(state, l.id)}/6
                  </p>
                  <h2 className="font-display text-2xl font-semibold uppercase leading-tight text-[#06214a]">{l.name}</h2>
                  <p className="text-sm font-bold text-slate-500">Focus: {l.focus}</p>
                </div>
              );
            })()}
            <ol className="space-y-2">
              {glassSkillsByLevel(level).map((k) => {
                const st = state.activeDrop === k.id ? 'COMPLETED' : glassSkillState(state, k.id);
                const locked = st === 'LOCKED';
                const isCurrent = k.id === current;
                return (
                  <li key={k.id}>
                    <button
                      onClick={() => open(k.id)}
                      disabled={locked || busy}
                      className={cn(
                        'flex min-h-16 w-full items-center gap-3 rounded-2xl p-3 text-left ring-2 transition focus:outline-none focus-visible:ring-4 focus-visible:ring-cyan-200',
                        locked ? 'cursor-not-allowed bg-slate-50 ring-transparent' : 'bg-white ring-sky-100 hover:-translate-y-0.5 hover:ring-sky-300',
                        isCurrent && 'ring-amber-300',
                        openId === k.id && 'ring-cyan-400',
                      )}
                    >
                      <span className={cn('grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-xl', locked ? 'bg-slate-100 grayscale' : 'bg-sky-50')} aria-hidden>
                        {k.icon}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[10px] font-extrabold uppercase tracking-wider text-sky-500">
                          💧 Drop {k.id} · Skill {k.n}
                        </span>
                        <span className={cn('block font-display font-semibold leading-tight', locked ? 'text-slate-400' : 'text-[#06214a]')}>{k.name}</span>
                      </span>
                      <span className={cn('shrink-0 rounded-full px-2.5 py-1 text-[10px] font-extrabold sm:text-xs', CHIP[st].cls)}>{CHIP[st].label}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </div>

      {/* skill detail */}
      {skill && checks && skillSt && (
        <div ref={detailRef} className="fade-up mt-5 scroll-mt-28 rounded-[28px] bg-white p-5 shadow-lg ring-1 ring-sky-100 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-br from-cyan-300 to-sky-600 text-3xl shadow" aria-hidden>
                {skill.icon}
              </span>
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-sky-500">
                  Glass {skill.level} · Skill {skill.n} · Drop {skill.id} of 18
                </p>
                <h3 className="font-display text-2xl font-semibold uppercase leading-tight text-[#06214a]">{skill.name}</h3>
              </div>
            </div>
            <button onClick={() => setOpenId(null)} className="min-h-11 rounded-full bg-slate-100 px-4 text-sm font-extrabold text-slate-500 hover:bg-slate-200">
              ✕ Close
            </button>
          </div>
          <p className="mt-3 text-slate-700">{skill.short}</p>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div>
              <p className="mb-2 font-display text-lg font-semibold text-[#06214a]">📘 Learn</p>
              <ol className="space-y-2">
                {skill.steps.map((x, i) => (
                  <li key={x} className="flex gap-3 rounded-2xl bg-slate-50 p-3">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gradient-to-br from-cyan-400 to-sky-600 text-xs font-black text-white">{i + 1}</span>
                    <span className="pt-0.5 font-semibold text-slate-700">{x}</span>
                  </li>
                ))}
              </ol>
              <p className="mt-3 rounded-2xl border-2 border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-950">🛟 {skill.safety}</p>
              <p className="mt-3 inline-block rounded-full bg-gradient-to-r from-cyan-400 to-sky-500 px-4 py-2 font-display font-semibold text-white">📣 “{skill.cue}”</p>
            </div>
            <div>
              <p className="mb-2 font-display text-lg font-semibold text-[#06214a]">✅ Can I do this?</p>
              <div className="space-y-2">
                {skill.selfCheck.map((x, i) => (
                  <label key={x} className={cn('flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl p-3', checks.self[i] ? 'bg-emerald-50 ring-1 ring-emerald-200' : 'bg-slate-50')}>
                    <input
                      type="checkbox"
                      className="h-6 w-6 shrink-0 accent-emerald-500"
                      checked={!!checks.self[i]}
                      disabled={skillSt !== 'LEARNING'}
                      onChange={(e) => dispatch({ type: 'SET_CHECKS', id: skill.id, checks: { ...checks, self: checks.self.map((v, j) => (j === i ? e.target.checked : v)) } })}
                    />
                    <span className="font-bold text-slate-700">{x}</span>
                  </label>
                ))}
                {isCoachOrAdmin ? (
                  <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50/70 p-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-200 px-2 py-0.5 text-[10px] font-black uppercase text-emerald-900">
                          🧑‍🏫 Coach Evaluation Mode
                        </span>
                        <p className="text-xs font-bold text-slate-800">
                          Confirm student completed this water confidence skill safely.
                        </p>
                      </div>
                      <label className="flex cursor-pointer items-center gap-1.5">
                        <input
                          type="checkbox"
                          className="h-5 w-5 shrink-0 accent-emerald-600 cursor-pointer"
                          checked={checks.coach}
                          disabled={skillSt !== 'LEARNING'}
                          onChange={(e) => dispatch({ type: 'SET_CHECKS', id: skill.id, checks: { ...checks, coach: e.target.checked } })}
                        />
                        <span className="font-extrabold text-xs text-emerald-900">
                          {checks.coach ? 'Approved ✅' : 'Approve Drop'}
                        </span>
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className={cn(
                    'flex items-center gap-2.5 rounded-2xl p-3 border',
                    checks.coach
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                      : 'border-amber-200 bg-amber-50 text-amber-900'
                  )}>
                    <span className="text-xl" aria-hidden>{checks.coach ? '✅' : '⏳'}</span>
                    <div>
                      <p className="font-extrabold text-xs">
                        {checks.coach ? 'Instructor / Coach Verified' : 'Coach Evaluation Required'}
                      </p>
                      <p className="text-[11px] font-semibold text-slate-600">
                        {checks.coach
                          ? 'Your instructor confirmed you did this safely.'
                          : 'Your coach will evaluate and approve this drop during your session.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              {skillSt === 'COMPLETED' ? (
                <p className="mt-4 rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-500 p-4 text-center font-extrabold text-white">💧 Drop {skill.id} is in your glass!</p>
              ) : (
                <button
                  onClick={() => complete(skill.id)}
                  disabled={!glassReady(state, skill.id) || busy}
                  className={cn(
                    'mt-4 min-h-14 w-full rounded-2xl px-6 font-display text-xl font-semibold uppercase tracking-wide transition',
                    glassReady(state, skill.id) && !busy ? 'bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 text-white shadow-xl shadow-sky-300/50 hover:-translate-y-0.5' : 'cursor-not-allowed bg-slate-200 text-slate-400',
                  )}
                >
                  💧 Add my drop
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-center">
        <button onClick={reset} disabled={busy} className="min-h-11 rounded-full bg-white px-4 text-sm font-bold text-slate-500 ring-1 ring-slate-200 hover:bg-slate-50 disabled:opacity-50">
          ↺ Reset my Glass progress
        </button>
      </div>

      {celebrate && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#06214a]/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="glass-cele">
          <div className="fade-up relative w-full max-w-md overflow-hidden rounded-[32px] bg-gradient-to-b from-sky-500 via-cyan-500 to-teal-400 p-7 text-center text-white shadow-2xl">
            {Array.from({ length: 12 }).map((_, i) => (
              <span key={i} className="rise pointer-events-none absolute bottom-0 rounded-full bg-white/60" style={{ left: `${5 + i * 8}%`, width: 5 + (i % 3) * 4, height: 5 + (i % 3) * 4, animationDelay: `${(i % 5) * 0.3}s` }} aria-hidden />
            ))}
            <div className="pop-in mx-auto mb-3 grid h-24 w-24 place-items-center rounded-full bg-white/20 text-5xl">{GLASS_LEVELS[celebrate - 1].emoji}</div>
            <p className="text-xs font-extrabold uppercase tracking-[0.3em] text-white/85">{celebrate === 3 ? 'Glass journey complete · 18/18' : `Glass ${celebrate} complete · 6/6`}</p>
            <h2 id="glass-cele" className="mt-1 font-display text-3xl font-semibold uppercase">
              {GLASS_LEVELS[celebrate - 1].name}
            </h2>
            <p className="mt-2 text-white/90">{celebrate === 3 ? 'Your glass is full! Next journey: 🏊 Pool — Swimming Foundation.' : `Glass ${celebrate + 1} — ${GLASS_LEVELS[celebrate].name} is now unlocked.`}</p>
            <div className="mt-5 grid gap-2">
              {celebrate === 3 ? (
                <>
                  <button
                    onClick={() => {
                      setCelebrate(null);
                      onGoPool();
                    }}
                    className="min-h-12 rounded-2xl bg-white px-6 font-extrabold uppercase tracking-wide text-sky-700 shadow-lg"
                  >
                    🏊 Start Pool →
                  </button>
                  <button onClick={() => setCelebrate(null)} className="min-h-11 rounded-2xl px-6 text-sm font-extrabold uppercase text-white/95 ring-2 ring-white/50">
                    View my Glass
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setLevel((celebrate + 1) as GlassLevelId);
                    setCelebrate(null);
                  }}
                  className="min-h-12 rounded-2xl bg-white px-6 font-extrabold uppercase tracking-wide text-sky-700 shadow-lg"
                >
                  Continue to Glass {celebrate + 1} →
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export const GLASS_TOTAL = GLASS_SKILLS.length;
