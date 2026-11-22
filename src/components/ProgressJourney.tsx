import { LEVELS, SKILLS } from '../data/curriculum';
import { cn } from '../utils/cn';

/**
 * Bottom journey bar. Progress = completedSkills.length / 18 (never from animation state).
 * Milestones light up after the level's final drop has settled.
 */
export function ProgressJourney({ completedCount, settled, milestones }: { completedCount: number; settled: (id: number) => boolean; milestones: boolean[] }) {
  const pct = (completedCount / 18) * 100;
  const ms = LEVELS.map((l, i) => ({ ...l, at: ((i + 1) / 3) * 100, reached: milestones[i] }));
  const next = ms.find((m) => !m.reached);

  return (
    <nav aria-label="Pool journey progress" className="fixed inset-x-0 bottom-0 z-40 border-t border-cyan-300/20 bg-[#06214a]/95 text-white shadow-[0_-10px_40px_rgba(6,33,74,0.35)] backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-5 pb-[max(10px,env(safe-area-inset-bottom))] pt-2 sm:px-10">
        <div className="mb-1 flex items-center justify-between text-[10px] font-extrabold uppercase tracking-[0.18em] sm:text-xs">
          <span className="text-cyan-300">How far have I come?</span>
          <span className="text-sky-100">
            {completedCount}/18 skills
            {next ? (
              <span className="hidden sm:inline">
                {' '}
                · next milestone: {next.milestoneIcon} {next.milestoneLabel}
              </span>
            ) : (
              ' · 🏆 Pool complete'
            )}
          </span>
        </div>

        <div className="relative h-12 sm:h-14" role="progressbar" aria-valuemin={0} aria-valuemax={18} aria-valuenow={completedCount} aria-valuetext={`${completedCount} of 18 skills completed`}>
          <div className="absolute inset-x-0 top-1/2 h-2.5 -translate-y-1/2 overflow-hidden rounded-full bg-white/10 sm:h-3">
            <div className="relative h-full rounded-full bg-gradient-to-r from-cyan-300 via-sky-400 to-teal-300 transition-[width] duration-[1400ms] ease-out" style={{ width: `${pct}%` }}>
              <div className="shimmer absolute inset-0 rounded-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.55),transparent)]" />
            </div>
          </div>

          <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="grid h-6 w-6 place-items-center rounded-full border-2 border-cyan-300 bg-[#06214a] text-[9px] font-black">GO</div>
          </div>

          {ms.map((m) => (
            <div key={m.id} className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ left: `${m.at}%` }}>
              <div className="relative">
                {m.reached && <span className="ring-out absolute inset-0 rounded-full border-2 border-cyan-200" />}
                <div
                  key={`${m.id}-${m.reached}`}
                  className={cn(
                    'relative grid h-10 w-10 place-items-center rounded-full border-2 text-lg sm:h-12 sm:w-12 sm:text-2xl',
                    m.reached ? 'pop-in border-amber-200 bg-gradient-to-br from-cyan-300 to-sky-600 shadow-[0_0_22px_rgba(103,232,249,0.8)]' : 'border-white/25 bg-[#0a2d62] opacity-70 grayscale',
                  )}
                  title={`Level ${m.id} complete: ${m.milestoneLabel}`}
                >
                  <span aria-hidden>{m.milestoneIcon}</span>
                  {m.reached && <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-emerald-400 text-[9px] font-black text-[#06214a]">✓</span>}
                </div>
              </div>
            </div>
          ))}

          {SKILLS.map((s) => (
            <span
              key={s.id}
              className={cn(
                'absolute top-[calc(50%+14px)] h-1.5 w-1.5 -translate-x-1/2 rounded-full transition-all duration-700 sm:top-[calc(50%+16px)] sm:h-2 sm:w-2',
                settled(s.id) ? 'bg-cyan-300 shadow-[0_0_6px_rgba(103,232,249,0.9)]' : s.id <= completedCount ? 'animate-pulse bg-cyan-100/70' : 'bg-white/20',
              )}
              style={{ left: `${(s.id / 18) * 100 - 100 / 36}%` }}
              aria-hidden
            />
          ))}
        </div>

        <div className="relative mt-0.5 hidden h-4 sm:block">
          <span className="absolute left-0 -translate-x-1/2 text-[10px] font-bold uppercase tracking-wider text-sky-200/70">Start</span>
          {ms.map((m) => (
            <span
              key={m.id}
              className={cn('absolute whitespace-nowrap text-[10px] font-extrabold uppercase tracking-wider', m.reached ? 'text-amber-200' : 'text-sky-200/60', m.id === 3 ? '-translate-x-full' : '-translate-x-1/2')}
              style={{ left: `${m.at}%` }}
            >
              {m.milestoneIcon} L{m.id} · {m.milestoneLabel}
            </span>
          ))}
        </div>
      </div>
    </nav>
  );
}
