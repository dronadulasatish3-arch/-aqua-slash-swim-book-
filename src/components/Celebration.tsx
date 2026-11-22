import { useEffect, useRef } from 'react';
import { LEVELS, getLevel, type LevelId } from '../data/curriculum';
import { levelComingSoon, type StudentState } from '../state/poolMachine';

/** Banner shown over the pool while the student exits after a level completion. */
export function LevelBanner({ level }: { level: LevelId }) {
  const lv = getLevel(level);
  return (
    <div className="fade-up flex items-center gap-3 rounded-3xl bg-gradient-to-r from-sky-500/95 via-cyan-500/95 to-teal-400/95 px-4 py-2.5 text-white shadow-2xl ring-2 ring-white/40 backdrop-blur sm:px-6 sm:py-3" role="status">
      <span className="pop-in grid h-10 w-10 place-items-center rounded-full bg-white/25 text-2xl sm:h-12 sm:w-12 sm:text-3xl">{lv.milestoneIcon}</span>
      <div className="leading-tight">
        <p className="font-display text-base font-semibold uppercase sm:text-xl">{lv.milestoneLabel}</p>
        <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-white/90 sm:text-xs">{level === 3 ? 'Pool Level complete' : `Level ${level} complete`}</p>
      </div>
    </div>
  );
}

/** Panel below the pool once the student is OUTSIDE_POOL. */
export function LevelCompletePanel({
  level,
  studentState,
  uiLocked,
  onContinue,
  onStartPond,
  onJourney,
}: {
  level: LevelId;
  studentState: StudentState;
  uiLocked: boolean;
  onContinue: () => void;
  onStartPond: () => void;
  onJourney?: () => void;
}) {
  const lv = getLevel(level);
  const final = level === 3;
  const outside = studentState === 'OUTSIDE_POOL';
  // Beta: the next Pool level is still in development
  if (!final && levelComingSoon((level + 1) as LevelId)) {
    return (
      <div className="relative overflow-hidden border-t border-white/10 bg-gradient-to-r from-[#0a3a7a] via-[#0b4a8f] to-[#0a3a7a] px-4 py-4 text-white sm:px-6" aria-live="polite">
        <div className="relative flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="flex items-center gap-3">
            <span className="pop-in grid h-14 w-14 shrink-0 place-items-center rounded-full bg-white/15 text-3xl shadow-[0_0_24px_rgba(125,211,252,0.6)]">{lv.milestoneIcon}</span>
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-cyan-300">Pool Levels 1–{level} complete · {level * 6}/{level * 6}</p>
              <p className="font-display text-2xl font-semibold uppercase leading-tight">Level {level} Complete!</p>
              <p className="text-sm text-sky-100">🔒 Pool Level {level + 1} and more Aqua Slash environments are coming soon.</p>
            </div>
          </div>
          {outside && onJourney ? (
            <button onClick={onJourney} disabled={uiLocked} className="min-h-12 shrink-0 rounded-2xl bg-gradient-to-r from-amber-300 to-orange-300 px-5 py-3 font-extrabold uppercase tracking-wide text-[#06214a] shadow-lg disabled:opacity-50">
              🧭 Back to My Journey
            </button>
          ) : (
            <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-sky-100">🏊 Swimmer is leaving the pool…</span>
          )}
        </div>
      </div>
    );
  }
  return (
    <div className="relative overflow-hidden border-t border-white/10 bg-gradient-to-r from-[#0a3a7a] via-[#0b4a8f] to-[#0a3a7a] px-4 py-4 text-white sm:px-6" aria-live="polite">
      {Array.from({ length: 10 }).map((_, i) => (
        <span key={i} className="rise pointer-events-none absolute bottom-0 rounded-full bg-white/40" style={{ left: `${6 + i * 9.5}%`, width: 5 + (i % 3) * 3, height: 5 + (i % 3) * 3, animationDelay: `${(i % 5) * 0.4}s` }} aria-hidden />
      ))}
      <div className="relative flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-between sm:text-left">
        <div className="flex items-center gap-3">
          <span className="pop-in grid h-14 w-14 shrink-0 place-items-center rounded-full bg-white/15 text-3xl shadow-[0_0_24px_rgba(125,211,252,0.6)]">{lv.milestoneIcon}</span>
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-cyan-300">{final ? 'Pool Level complete · 18/18' : `Level complete · ${level * 6}/18`}</p>
            <p className="font-display text-2xl font-semibold uppercase leading-tight">{final ? '🏊 Basic Stroke Coordination' : `Level ${level} Complete!`}</p>
            <p className="text-sm text-sky-100">{final ? 'Your swimmer is heading out to a new adventure…' : `${lv.name} ✓ — all 6 drops are recorded.`}</p>
          </div>
        </div>
        {outside &&
          (final ? (
            <button
              onClick={onStartPond}
              disabled={uiLocked}
              className="min-h-12 shrink-0 rounded-2xl bg-gradient-to-r from-emerald-300 to-teal-300 px-5 py-3 font-extrabold uppercase tracking-wide text-[#06214a] shadow-lg transition hover:-translate-y-0.5 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200 disabled:opacity-70"
            >
              {uiLocked ? '🌿 Heading to the pond…' : '🌿 Start the Pond Journey →'}
            </button>
          ) : (
            <button
              onClick={onContinue}
              disabled={uiLocked}
              className="min-h-12 shrink-0 rounded-2xl bg-gradient-to-r from-amber-300 to-orange-300 px-5 py-3 font-extrabold uppercase tracking-wide text-[#06214a] shadow-lg transition hover:-translate-y-0.5 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-200 disabled:opacity-50"
            >
              Continue to Level {level + 1} →
            </button>
          ))}
        {!outside && <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-sky-100">🏊 Swimmer is leaving the pool…</span>}
      </div>
    </div>
  );
}

/** Final modal after the pond splash settles. */
export function FinalCelebration({ onBack, onJourney, onFeedback }: { onBack: () => void; onJourney: () => void; onFeedback?: () => void }) {
  const btn = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    btn.current?.focus();
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onBack();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onBack]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#06214a]/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="final-title">
      <div className="fade-up relative w-full max-w-md overflow-hidden rounded-[32px] bg-gradient-to-b from-sky-500 via-cyan-500 to-emerald-400 p-7 text-center text-white shadow-2xl">
        {Array.from({ length: 16 }).map((_, i) => (
          <span key={i} className="rise pointer-events-none absolute bottom-0 rounded-full bg-white/70" style={{ left: `${4 + i * 6}%`, width: 5 + (i % 3) * 4, height: 5 + (i % 3) * 4, animationDelay: `${(i % 6) * 0.3}s` }} aria-hidden />
        ))}
        <div className="relative mx-auto mb-3 grid h-24 w-24 place-items-center">
          <span className="ring-out absolute inset-0 rounded-full border-4 border-white/70" />
          <span className="ring-out absolute inset-0 rounded-full border-4 border-white/50" style={{ animationDelay: '0.4s' }} />
          <div className="pop-in grid h-24 w-24 place-items-center rounded-full bg-white/20 text-5xl shadow-[0_0_40px_rgba(255,255,255,0.6)]">🎉</div>
        </div>
        <h2 id="final-title" className="relative font-display text-3xl font-semibold uppercase leading-tight">
          Pool Journey Complete!
        </h2>
        <p className="relative mt-1 font-bold text-white/90">You completed all 18 skills.</p>
        <ul className="relative mx-auto mt-4 max-w-xs space-y-2 text-left">
          {LEVELS.map((l) => (
            <li key={l.id} className="flex items-center justify-between rounded-2xl bg-white/15 px-4 py-2 font-extrabold">
              <span>
                {l.milestoneIcon} {l.milestoneLabel}
              </span>
              <span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-300 text-sm text-[#06214a]">✓</span>
            </li>
          ))}
        </ul>
        <p className="relative mt-4 font-display text-xl font-semibold">🏊 18 / 18 Skills Completed</p>
        <div className="relative mt-5 grid gap-2">
          <button ref={btn} onClick={onBack} className="min-h-12 rounded-2xl bg-white px-6 py-3 font-extrabold uppercase tracking-wide text-sky-700 shadow-lg transition hover:-translate-y-0.5 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/60">
            Back to Pool Map
          </button>
          <button onClick={onJourney} className="min-h-12 rounded-2xl bg-white/15 px-6 py-3 font-extrabold uppercase tracking-wide text-white ring-2 ring-white/50 transition hover:bg-white/25 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/60">
            View My Swimming Journey
          </button>
          {onFeedback && (
            <button onClick={onFeedback} className="min-h-11 rounded-2xl px-6 py-2 text-sm font-extrabold uppercase tracking-wide text-white/95 underline-offset-4 hover:underline focus:outline-none focus-visible:ring-4 focus-visible:ring-white/60">
              💬 Share Student Feedback
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
