import { LEVELS, skillsByLevel, type LevelId } from '../data/curriculum';
import { levelComingSoon, levelCount, levelState, type PoolState } from '../state/poolMachine';
import { cn } from '../utils/cn';
import { DropIcon, STATUS_META, dropVisual } from './Drops';
import { MiniPool } from './MiniPool';

const LEVEL_CHIP = {
  LOCKED: { text: '🔒 Locked', cls: 'bg-white/80 text-slate-500' },
  AVAILABLE: { text: '🔓 Open', cls: 'bg-amber-300 text-[#06214a]' },
  ACTIVE: { text: '● Active', cls: 'bg-white/90 text-sky-800' },
  COMPLETED: { text: '✓ Complete', cls: 'bg-emerald-400 text-white' },
};

/** FREE ORDER: every Pool Level (1–3) is open from the start — only a not-yet-released level ("lock other") is locked. */
export function LevelCards({ state, selected, onSelect }: { state: PoolState; selected: LevelId; onSelect: (l: LevelId) => void }) {
  const locked = state.uiLocked;
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {LEVELS.map((lv) => {
        const soon = levelComingSoon(lv.id);
        const ls = levelState(state, lv.id);
        const open = !soon;
        const count = levelCount(state, lv.id);
        const isSel = selected === lv.id;
        return (
          <article
            key={lv.id}
            className={cn(
              'relative flex h-full flex-col overflow-hidden rounded-[26px] border-2 bg-white p-5 shadow-lg transition',
              isSel ? 'border-cyan-400 shadow-cyan-200/60' : 'border-transparent shadow-sky-100',
              !open && 'bg-slate-50',
            )}
          >
            <div className={cn('absolute inset-x-0 top-0 h-24 bg-gradient-to-br opacity-90', open ? lv.gradient : 'from-slate-200 to-slate-300')} />
            <svg className="wave-move absolute inset-x-0 top-16 h-12 w-[200%]" viewBox="0 0 800 40" preserveAspectRatio="none" aria-hidden>
              <path d="M0 20 Q50 5 100 20 T200 20 T300 20 T400 20 T500 20 T600 20 T700 20 T800 20 V40 H0Z" fill="#ffffff" />
            </svg>
            <div className="relative flex items-start justify-between">
              <div className={cn('grid h-16 w-16 place-items-center rounded-2xl bg-white text-4xl shadow-md', !open && 'grayscale')}>{lv.emoji}</div>
              <span className={cn('rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-wider', soon ? 'bg-[#06214a]/80 text-white' : LEVEL_CHIP[ls].cls)}>{soon ? '🔒 Coming Soon' : LEVEL_CHIP[ls].text}</span>
            </div>
            <div className="relative mt-6">
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-sky-500">Pool Level {lv.id}</p>
              <h3 className="font-display text-2xl font-semibold leading-tight text-[#06214a]">{lv.name}</h3>
              <p className="mt-1 text-sm text-slate-600">{lv.purpose}</p>
            </div>
            <div className="relative mt-4 flex items-center justify-between text-sm font-bold text-slate-600">
              <span>6 Skills</span>
              <span>
                Progress: <span className="text-[#06214a]">{count}/6</span>
              </span>
            </div>
            <div className="mt-2 flex gap-1.5">
              {skillsByLevel(lv.id).map((s) => (
                <DropIcon key={s.id} status={dropVisual(state, s.id)} size={20} n={s.id} />
              ))}
            </div>
            <div className="mt-auto pt-5">
              {soon ? (
                <div className="rounded-2xl bg-slate-200/70 px-4 py-3 text-center text-sm font-bold text-slate-500">🔒 Coming Soon — this level is under development</div>
              ) : (
                <button
                  disabled={locked}
                  onClick={() => onSelect(lv.id)}
                  className={cn(
                    'min-h-12 w-full rounded-2xl px-4 py-3 font-extrabold text-white shadow-md transition hover:-translate-y-0.5 focus:outline-none focus-visible:ring-4 focus-visible:ring-cyan-200 disabled:cursor-not-allowed disabled:opacity-50',
                    ls === 'COMPLETED' ? 'bg-emerald-500' : 'bg-gradient-to-r from-sky-500 to-cyan-500',
                  )}
                >
                  {ls === 'COMPLETED' ? '💧 Review Level' : count > 0 ? '▶ Continue Level' : '▶ Enter Level'}
                </button>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}

export function SkillCards({
  level,
  state,
  onOpen,
  onReview,
  onPreview,
}: {
  level: LevelId;
  state: PoolState;
  onOpen: (id: number) => void;
  onReview: (id: number) => void;
  onPreview: (id: number) => void;
}) {
  const lv = LEVELS.find((l) => l.id === level)!;
  const soonLevel = levelComingSoon(level);
  const uiLocked = state.uiLocked;
  const current = state.completedCount < 18 ? state.currentSkill : -1;
  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-2">
        {lv.progression.map((p, i) => (
          <span key={p} className="flex items-center gap-2">
            <span className="rounded-full bg-white px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-sky-700 shadow-sm">{p}</span>
            {i < lv.progression.length - 1 && (
              <span className="text-sky-400" aria-hidden>
                →
              </span>
            )}
          </span>
        ))}
      </div>
      {soonLevel && (
        <div className="mb-5 rounded-2xl border-2 border-dashed border-slate-300 bg-white/70 p-4 text-center font-bold text-slate-500">
          🔒 Pool Level {level} is coming soon. This Aqua Slash level is currently under development.
        </div>
      )}
      {!soonLevel && (
        <div className="mb-5 rounded-2xl border-2 border-sky-100 bg-sky-50 p-3 text-center text-sm font-bold text-sky-800">💧 Open order — start any of these 6 drops whenever you like.</div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {skillsByLevel(level).map((s) => {
          const vis = dropVisual(state, s.id);
          const st = vis === 'FALLING' ? 'COMPLETED' : vis;
          const meta = STATUS_META[st];
          const locked = st === 'LOCKED'; // only true when the whole level is "coming soon"
          const isCurrent = s.id === current && !locked;
          return (
            <article
              key={s.id}
              className={cn(
                'group relative flex flex-col overflow-hidden rounded-3xl bg-white shadow-md ring-2 transition',
                isCurrent ? 'ring-amber-300 shadow-amber-100' : 'ring-transparent',
                !locked && 'hover:-translate-y-1 hover:shadow-xl',
              )}
            >
              <button
                onClick={() => !locked && onPreview(s.id)}
                disabled={locked || uiLocked}
                className="relative h-32 overflow-hidden bg-sky-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-cyan-300"
                aria-label={locked ? `${s.name} is locked` : `Preview ${s.name} in the pool`}
              >
                <div className={cn('h-full w-full', !locked && 'float-y')}>
                  <MiniPool id={s.id} dim={locked} />
                </div>
                <span className="absolute left-3 top-3 rounded-full bg-[#06214a]/85 px-2.5 py-1 text-xs font-extrabold text-white">💧 DROP {s.id}</span>
                <span className={cn('absolute right-3 top-3 rounded-full px-2.5 py-1 text-xs font-extrabold', meta.chip)}>
                  {meta.icon} {meta.label}
                </span>
                {isCurrent && <span className="absolute bottom-2 left-3 rounded-full bg-amber-300 px-2 py-0.5 text-[10px] font-black uppercase text-[#06214a]">Suggested next</span>}
                {!locked && <span className="absolute bottom-2 right-3 rounded-full bg-white/85 px-2 py-0.5 text-[10px] font-bold text-sky-700 opacity-0 transition group-hover:opacity-100">👁 Preview in pool</span>}
              </button>
              <div className="flex flex-1 flex-col p-4">
                <div className="flex items-start gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-sky-50 text-2xl" aria-hidden>
                    {s.icon}
                  </span>
                  <div>
                    <h4 className="font-display text-lg font-semibold uppercase leading-tight text-[#06214a]">{s.name}</h4>
                    <p className="mt-1 text-sm text-slate-600">{s.short}</p>
                  </div>
                </div>
                <div className="mt-auto pt-4">
                  <button
                    onClick={() => {
                      if (locked) return;
                      if (st === 'COMPLETED') onReview(s.id);
                      else onOpen(s.id);
                    }}
                    disabled={locked || uiLocked}
                    className={cn(
                      'min-h-12 w-full rounded-2xl px-4 py-2.5 text-sm font-extrabold uppercase tracking-wide transition focus:outline-none focus-visible:ring-4 focus-visible:ring-cyan-200 disabled:cursor-not-allowed disabled:opacity-60',
                      locked && 'bg-slate-100 text-slate-400',
                      st === 'AVAILABLE' && 'bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-md',
                      st === 'LEARNING' && 'bg-amber-300 text-[#06214a] shadow-md',
                      st === 'COMPLETED' && 'bg-sky-50 text-sky-700 ring-2 ring-sky-200',
                    )}
                  >
                    {locked ? '🔒 Coming Soon' : st === 'COMPLETED' ? '💧 Review skill' : st === 'AVAILABLE' ? '▶ Start' : '🔄 Continue learning'}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
