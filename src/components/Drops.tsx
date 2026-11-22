import { SKILLS, LEVELS } from '../data/curriculum';
import { dropSettled, skillState, type PoolState, type SkillState } from '../state/poolMachine';
import { cn } from '../utils/cn';

export const STATUS_META: Record<SkillState, { label: string; icon: string; chip: string }> = {
  LOCKED: { label: 'Locked', icon: '🔒', chip: 'bg-slate-200 text-slate-500' },
  AVAILABLE: { label: 'Start', icon: '▶️', chip: 'bg-cyan-100 text-cyan-800' },
  LEARNING: { label: 'Learning', icon: '🔄', chip: 'bg-amber-100 text-amber-800' },
  COMPLETED: { label: 'Completed', icon: '💧', chip: 'bg-sky-600 text-white' },
};

/** Visual drop state: a completed drop shows as "falling" until its animation settles. */
export type DropVisual = SkillState | 'FALLING';

export function dropVisual(s: PoolState, id: number): DropVisual {
  const st = skillState(s, id);
  if (st === 'COMPLETED' && !dropSettled(s, id)) return 'FALLING';
  return st;
}

export function DropIcon({ status, size = 28, active = false, n }: { status: DropVisual; size?: number; active?: boolean; n?: number }) {
  const fill =
    status === 'COMPLETED' ? 'url(#dropFill)' : status === 'FALLING' ? '#bae6fd' : status === 'LEARNING' ? '#fde68a' : status === 'AVAILABLE' ? '#cffafe' : 'rgba(148,163,184,0.25)';
  const stroke = status === 'COMPLETED' || status === 'FALLING' ? '#7dd3fc' : status === 'LEARNING' ? '#f59e0b' : status === 'AVAILABLE' ? '#22d3ee' : 'rgba(148,163,184,0.6)';
  return (
    <svg width={size} height={size * 1.2} viewBox="0 0 24 29" aria-hidden className={cn(active && 'drop-shadow-[0_0_6px_rgba(255,224,102,0.9)]', status === 'FALLING' && 'animate-pulse')}>
      <defs>
        <radialGradient id="dropFill" cx="0.35" cy="0.4" r="0.8">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.35" stopColor="#67e8f9" />
          <stop offset="1" stopColor="#0284c7" />
        </radialGradient>
      </defs>
      <path d="M12 1.5 C16 8 21 12.5 21 18.5 A9 9 0 0 1 3 18.5 C3 12.5 8 8 12 1.5 Z" fill={fill} stroke={active ? '#ffe066' : stroke} strokeWidth={active ? 2.2 : 1.4} />
      {status === 'COMPLETED' && <path d="M8 18.5 l3 3 l5.5 -6" stroke="#fff" strokeWidth={2.2} fill="none" strokeLinecap="round" strokeLinejoin="round" />}
      {status === 'LOCKED' && (
        <text x="12" y="22" textAnchor="middle" fontSize="8" fill="#94a3b8" fontWeight="800">
          {n}
        </text>
      )}
      {status === 'AVAILABLE' && <path d="M10 15 l6 3.5 l-6 3.5 z" fill="#0891b2" />}
      {status === 'LEARNING' && <circle cx="12" cy="18.5" r="3" fill="none" stroke="#b45309" strokeWidth="1.8" strokeDasharray="12 4" />}
    </svg>
  );
}

const LABEL: Record<DropVisual, string> = { ...Object.fromEntries(Object.entries(STATUS_META).map(([k, v]) => [k, v.label])), FALLING: 'Drop falling' } as Record<DropVisual, string>;

/** The 18-drop rail shown at the top of the pool. */
export function DropRail({ state, viewSkill, disabled, onPick }: { state: PoolState; viewSkill: number; disabled: boolean; onPick: (id: number) => void }) {
  return (
    <div className="flex flex-col gap-2 border-b border-white/10 bg-gradient-to-r from-[#06214a] via-[#0a3170] to-[#06214a] px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <div className="flex items-center gap-2 text-white">
        <span className="font-display text-base font-semibold tracking-wide sm:text-lg">One drop at a time</span>
        <span className="rounded-full bg-cyan-400/20 px-2.5 py-0.5 text-xs font-extrabold text-cyan-200">💧 {state.completedCount}/18</span>
      </div>
      <div className="no-scrollbar -mx-1 flex items-center gap-1 overflow-x-auto px-1 sm:gap-2">
        {LEVELS.map((lv, li) => (
          <div key={lv.id} className="flex shrink-0 items-center gap-1 sm:gap-2">
            {li > 0 && (
              <span className="px-0.5 text-sm" aria-hidden>
                {LEVELS[li - 1].milestoneIcon}
              </span>
            )}
            <div className="flex items-center gap-[2px] rounded-full bg-white/5 px-1.5 py-1 sm:gap-1">
              {SKILLS.filter((s) => s.level === lv.id).map((s) => {
                const vis = dropVisual(state, s.id);
                const locked = vis === 'LOCKED';
                return (
                  <button
                    key={s.id}
                    onClick={() => !locked && !disabled && onPick(s.id)}
                    disabled={locked || disabled}
                    className={cn('grid min-h-8 min-w-6 place-items-center rounded-full transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300', !locked && !disabled && 'hover:scale-110')}
                    aria-label={`Drop ${s.id}: ${s.name} — ${LABEL[vis]}${!locked ? '. Preview in pool' : ''}`}
                    title={`Drop ${s.id} · ${s.name}`}
                  >
                    <span key={`${s.id}-${vis}`} className={cn(vis === 'COMPLETED' && 'pop-in')}>
                      <DropIcon status={vis} size={17} active={viewSkill === s.id} n={s.id} />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        <span className="px-0.5 text-sm" aria-hidden>
          🏊
        </span>
      </div>
    </div>
  );
}
