import { useEffect, useRef, useState } from 'react';
import { CONFIG } from '../config';
import type { Student } from '../lib/api';
import { renameProfile } from '../lib/identity';
import { peekGlassCount } from '../state/glassMachine';
import { loadStudentState } from '../state/poolMachine';
import { cn } from '../utils/cn';
import { WhatsAppButton } from './WhatsAppButton';

export type Section = 'home' | 'glass' | 'pool' | 'profile' | 'library';

interface Env {
  key: string;
  name: string;
  subtitle: string;
  emoji: string;
  bg: string;
  active: boolean;
  section?: Section;
}

const ENVIRONMENTS: Env[] = [
  { key: 'glass', name: 'Glass', subtitle: 'Water Confidence & Basic Safety', emoji: '🥛', bg: 'from-cyan-200 via-sky-300 to-sky-500', active: true, section: 'glass' },
  { key: 'pool', name: 'Pool', subtitle: 'Swimming Foundation', emoji: '🏊', bg: 'from-sky-300 via-sky-500 to-blue-600', active: true, section: 'pool' },
  { key: 'pond', name: 'Pond', subtitle: 'Advanced Swimming & Adaptation', emoji: '🪷', bg: 'from-emerald-300 via-teal-500 to-teal-700', active: false },
  { key: 'lake', name: 'Lake', subtitle: 'Endurance & Greater Adaptability', emoji: '🏔️', bg: 'from-sky-300 via-indigo-500 to-indigo-700', active: false },
  { key: 'river', name: 'River', subtitle: 'Moving-Water Preparation & Current Management', emoji: '🏞️', bg: 'from-teal-300 via-cyan-600 to-blue-800', active: false },
  { key: 'ocean', name: 'Ocean', subtitle: 'Advanced Open-Water Preparation & Decision-Making', emoji: '🌊', bg: 'from-blue-400 via-blue-700 to-[#06214a]', active: false },
];

/** Pool progress within the active levels. */
export function poolBetaCount(studentId: string) {
  const s = loadStudentState(studentId);
  const max = CONFIG.POOL_ACTIVE_LEVELS * 6;
  return { done: s.completedSkills.filter((n) => n <= max).length, total: max };
}

function ComingSoon({ env, onClose }: { env: Env; onClose: () => void }) {
  const btn = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    btn.current?.focus();
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#06214a]/55 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="soon-title" onClick={onClose}>
      <div className={cn('fade-up relative w-full max-w-sm overflow-hidden rounded-[28px] bg-gradient-to-br p-7 text-center text-white shadow-2xl', env.bg)} onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto mb-3 grid h-20 w-20 place-items-center rounded-full bg-white/20 text-5xl">{env.emoji}</div>
        <p className="text-xs font-extrabold uppercase tracking-[0.3em] text-white/85">🔒 Coming Soon</p>
        <h2 id="soon-title" className="mt-1 font-display text-3xl font-semibold uppercase">
          {env.name}
        </h2>
        <p className="mt-1 font-bold text-white/90">{env.subtitle}</p>
        <p className="mt-4 rounded-2xl bg-white/15 p-3 text-sm font-semibold">This Aqua Slash level is currently under development.</p>
        <button ref={btn} onClick={onClose} className="mt-5 min-h-12 w-full rounded-2xl bg-white px-6 font-extrabold uppercase tracking-wide text-sky-700 shadow-lg">
          OK
        </button>
      </div>
    </div>
  );
}

export function JourneyHome({ student, onNavigate }: { student: Student; onNavigate: (s: Section) => void }) {
  const [soon, setSoon] = useState<Env | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(student.studentName);
  const glass = peekGlassCount(student.studentId);
  const pool = poolBetaCount(student.studentId);
  const progress = (key: string) => (key === 'glass' ? { done: glass, total: 18 } : key === 'pool' ? pool : null);

  return (
    <div className="pt-6">
      <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#06214a] via-[#0a3170] to-[#0b4a8f] p-5 text-white shadow-xl sm:p-7">
        <svg className="wave-move pointer-events-none absolute inset-x-0 bottom-0 h-16 w-[200%] opacity-20" viewBox="0 0 800 40" preserveAspectRatio="none" aria-hidden>
          <path d="M0 20 Q50 5 100 20 T200 20 T300 20 T400 20 T500 20 T600 20 T700 20 T800 20 V40 H0Z" fill="#8ff0ff" />
        </svg>
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-3xl bg-gradient-to-br from-cyan-300 to-sky-600 font-display text-3xl font-bold shadow-lg" aria-hidden>
              {student.studentName.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-cyan-300">Aqua Slash Swim Book</p>
              {editingName ? (
                <form
                  className="mt-1 flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    renameProfile(nameDraft);
                    setEditingName(false);
                  }}
                >
                  <input value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} maxLength={60} autoFocus className="min-h-10 rounded-xl bg-white/15 px-3 font-display text-xl font-semibold text-white outline-none placeholder:text-white/60" />
                  <button type="submit" className="rounded-xl bg-white px-3 text-sm font-extrabold text-sky-700">
                    Save
                  </button>
                </form>
              ) : (
                <h1 className="truncate font-display text-3xl font-semibold leading-tight sm:text-4xl">
                  {student.studentName}
                  <button
                    onClick={() => {
                      setNameDraft(student.studentName);
                      setEditingName(true);
                    }}
                    className="ml-2 align-middle text-sm font-bold text-cyan-200 underline-offset-4 hover:underline"
                  >
                    ✏️ edit
                  </button>
                </h1>
              )}
            </div>
          </div>
          <WhatsAppButton student={student} className="shrink-0" />
        </div>
      </section>

      <section className="mt-8 text-center">
        <p className="text-xs font-extrabold uppercase tracking-[0.3em] text-sky-500">Glass → Pool → Pond → Lake → River → Ocean</p>
        <h2 className="mt-1 font-display text-3xl font-bold uppercase leading-tight text-[#06214a] sm:text-4xl">My Swimming Journey</h2>
        <p className="mx-auto mt-2 max-w-2xl text-sm font-semibold text-slate-500">Glass and Pool are open now — every skill and drop in any order. More Aqua Slash environments are coming soon.</p>
      </section>

      <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Aqua Slash journey">
        {ENVIRONMENTS.map((env, i) => {
          const p = progress(env.key);
          const complete = p && p.done === p.total;
          return (
            <li key={env.key}>
              <button
                onClick={() => (env.active && env.section ? onNavigate(env.section) : setSoon(env))}
                className={cn(
                  'group relative flex h-full min-h-56 w-full flex-col overflow-hidden rounded-[28px] bg-gradient-to-br p-5 text-left text-white shadow-lg transition focus:outline-none focus-visible:ring-4 focus-visible:ring-cyan-300',
                  env.bg,
                  env.active ? 'hover:-translate-y-1 hover:shadow-2xl' : 'opacity-90 saturate-[0.65] hover:opacity-100',
                )}
                aria-label={`${env.name}: ${env.subtitle}. ${env.active ? (p ? `${p.done} of ${p.total} skills complete` : 'Available') : 'Coming soon'}`}
              >
                <svg className="wave-move pointer-events-none absolute inset-x-0 bottom-0 h-16 w-[200%] opacity-40" viewBox="0 0 800 40" preserveAspectRatio="none" aria-hidden>
                  <path d={`M0 20 Q50 ${10 - i} 100 20 T200 20 T300 20 T400 20 T500 20 T600 20 T700 20 T800 20 V40 H0Z`} fill="#ffffff" />
                </svg>
                <div className="relative flex items-start justify-between">
                  <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/25 text-3xl shadow-inner" aria-hidden>
                    {env.emoji}
                  </span>
                  <span className={cn('rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider', env.active ? (complete ? 'bg-emerald-300 text-[#06214a]' : 'bg-white text-sky-700') : 'bg-[#06214a]/50 text-white')}>
                    {env.active ? (complete ? '✓ Complete' : 'Available') : '🔒 Coming Soon'}
                  </span>
                </div>
                <p className="relative mt-4 text-[11px] font-extrabold uppercase tracking-[0.25em] text-white/80">Stage {i + 1}</p>
                <h3 className="relative font-display text-3xl font-semibold uppercase leading-none">{env.name}</h3>
                <p className="relative mt-1 text-sm font-bold text-white/90">{env.subtitle}</p>
                <div className="relative mt-auto pt-4">
                  {p ? (
                    <>
                      <div className="mb-1 flex justify-between text-xs font-extrabold">
                        <span>{env.key === 'pool' ? '3 Pool Levels · open order' : '3 Glass Levels · open order'}</span>
                        <span>
                          {p.done}/{p.total}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-white/25">
                        <div className="h-full rounded-full bg-white transition-all duration-700" style={{ width: `${(p.done / p.total) * 100}%` }} />
                      </div>
                      <p className="mt-3 text-sm font-extrabold">{complete ? 'Review →' : p.done > 0 ? 'Continue →' : 'Start →'}</p>
                    </>
                  ) : (
                    <p className="text-sm font-extrabold text-white/85">Under development</p>
                  )}
                </div>
              </button>
            </li>
          );
        })}
      </ol>

      <section className="mt-6 grid gap-3 sm:grid-cols-2">
        <button
          onClick={() => onNavigate('library')}
          className="flex items-center gap-3 rounded-3xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-300 p-5 text-left shadow-sm border-2 border-black/80 transition hover:-translate-y-0.5 cursor-pointer"
        >
          <span className="text-3xl" aria-hidden>
            📚
          </span>
          <span>
            <span className="block font-bangers text-xl tracking-wider text-black">SWIM LIBRARY (Educational Resources)</span>
            <span className="text-xs font-comic font-bold text-slate-800">1080p Swim Videos, Illustrated Comics & Technique Guides →</span>
          </span>
        </button>

        <button
          onClick={() => onNavigate('profile')}
          className="flex items-center gap-3 rounded-3xl bg-white p-5 text-left shadow-sm ring-1 ring-sky-100 transition hover:-translate-y-0.5 cursor-pointer"
        >
          <span className="text-3xl" aria-hidden>
            💬
          </span>
          <span>
            <span className="block font-display text-lg font-semibold text-[#06214a]">My Profile & Feedback</span>
            <span className="text-sm font-bold text-slate-500">Edit student details and connect with Aqua Slash coaches</span>
          </span>
        </button>
      </section>

      {soon && <ComingSoon env={soon} onClose={() => setSoon(null)} />}
    </div>
  );
}
