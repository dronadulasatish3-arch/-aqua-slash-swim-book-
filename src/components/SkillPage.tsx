import { useState, type ReactNode } from 'react';
import { getLevel, getSkill } from '../data/curriculum';
import { getChecks, skillState, type Dispatch, type PoolState } from '../state/poolMachine';
import { cn } from '../utils/cn';
import { STATUS_META } from './Drops';

function Section({
  n,
  title,
  icon,
  children,
  className,
  tone = 'white',
}: {
  n: number;
  title: string;
  icon: string;
  children: ReactNode;
  className?: string;
  tone?: 'white' | 'amber' | 'navy' | 'sky';
}) {
  return (
    <section
      className={cn(
        'fade-up rounded-3xl p-5 shadow-sm sm:p-6',
        tone === 'white' && 'bg-white',
        tone === 'amber' && 'border-2 border-amber-200 bg-amber-50',
        tone === 'navy' && 'bg-[#06214a] text-white',
        tone === 'sky' && 'bg-gradient-to-br from-sky-50 to-cyan-50 ring-1 ring-sky-100',
        className
      )}
      aria-labelledby={`sec-${n}`}
    >
      <h3 id={`sec-${n}`} className="mb-3 flex items-center gap-2.5 font-display text-lg font-semibold uppercase tracking-wide">
        <span className={cn('grid h-8 w-8 place-items-center rounded-xl text-sm font-black', tone === 'navy' ? 'bg-cyan-400 text-[#06214a]' : 'bg-[#06214a] text-white')}>
          {n}
        </span>
        <span aria-hidden>{icon}</span>
        {title}
      </h3>
      {children}
    </section>
  );
}

export function SkillPage({
  id,
  state,
  onBack,
  onComplete,
}: {
  id: number;
  state: PoolState;
  dispatch: Dispatch;
  soundOn: boolean;
  onBack: () => void;
  onComplete: (id: number) => void;
}) {
  const s = getSkill(id);
  const lv = getLevel(s.level);
  const st = skillState(state, id);
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="space-y-4">
      {/* Top Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="min-h-11 rounded-full bg-white px-4 py-2 text-sm font-extrabold text-sky-700 shadow-sm ring-1 ring-sky-100 transition hover:bg-sky-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-cyan-200 cursor-pointer"
        >
          ← Back to Pool Journey
        </button>
        <span className={cn('rounded-full px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider', STATUS_META[st].chip)}>
          {STATUS_META[st].icon} {STATUS_META[st].label}
        </span>
      </div>

      {/* Primary Video / Demonstration Action Card */}
      <div className="rounded-[28px] bg-gradient-to-br from-[#06214a] via-[#0a3170] to-[#06214a] p-5 sm:p-7 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-2 border-sky-400">
        <div className="flex items-center gap-3.5">
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-3xl bg-gradient-to-br from-cyan-300 to-sky-600 text-3xl shadow-lg" aria-hidden>
            {s.icon}
          </span>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-cyan-300">
              Drop {s.id} of 18 · Pool Level {lv.id} — {lv.name}
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold uppercase leading-tight text-white">{s.name}</h2>
            <p className="mt-0.5 text-xs sm:text-sm text-sky-100 font-medium">{s.short}</p>
            {s.cues && s.cues[0] && (
              <p className="mt-2 text-xs font-bold text-yellow-300">
                📣 Cue: “{s.cues[0]}”
              </p>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="w-full sm:w-auto shrink-0">
          {st === 'COMPLETED' ? (
            <div className="rounded-2xl bg-emerald-500/20 border border-emerald-400 px-5 py-3 text-center font-extrabold text-emerald-300">
              ✓ Drop {s.id} Completed
            </div>
          ) : (
            <button
              onClick={() => onComplete(id)}
              className="w-full sm:w-auto min-h-12 rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 px-6 py-3 font-display text-lg font-semibold uppercase tracking-wide text-white shadow-xl shadow-sky-300/50 hover:-translate-y-0.5 transition cursor-pointer"
            >
              💧 Add My Drop — Complete
            </button>
          )}
        </div>
      </div>

      {/* Optional Collapsible Info Toggle (Hidden by Default) */}
      <div className="text-center pt-1">
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-sky-700 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm cursor-pointer transition hover:bg-slate-50"
        >
          <span>{showInfo ? '▲ Hide Skill Details & Guide' : '▼ Show Skill Details & Guide (Optional)'}</span>
        </button>
      </div>

      {showInfo && (
        <div className="space-y-4 pt-2">
          {/* Steps */}
          <Section n={1} title="Learn Steps" icon="📘">
            <ol className="grid gap-2.5 sm:grid-cols-2">
              {s.steps.map((x, i) => (
                <li key={x} className="flex gap-2.5 rounded-xl bg-slate-50 p-2.5 text-xs font-semibold text-slate-700">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gradient-to-br from-cyan-400 to-sky-600 text-[11px] font-black text-white">{i + 1}</span>
                  <span className="pt-0.5">{x}</span>
                </li>
              ))}
            </ol>
          </Section>

          {/* Safety & Mistakes */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Section n={2} title="Safety" icon="🛟" tone="amber">
              <ul className="space-y-1.5 text-xs font-semibold text-amber-950">
                {s.safety.map((x) => (
                  <li key={x} className="flex gap-1.5">
                    <span>⚠️</span>
                    <span>{x}</span>
                  </li>
                ))}
              </ul>
            </Section>

            <Section n={3} title="Common Mistakes" icon="🚫">
              <ul className="space-y-1.5 text-xs">
                {s.mistakes.map((m) => (
                  <li key={m.mistake} className="rounded-xl bg-slate-50 p-2">
                    <p className="font-bold text-rose-600">✗ {m.mistake}</p>
                    <p className="font-bold text-emerald-700">✓ {m.fix}</p>
                  </li>
                ))}
              </ul>
            </Section>
          </div>
        </div>
      )}
    </div>
  );
}
