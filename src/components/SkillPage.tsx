import type { ReactNode } from 'react';
import { getLevel, getSkill, SKILLS } from '../data/curriculum';
import { getChecks, requirementsMet, skillState, validateComplete, type Dispatch, type PoolState, type SkillChecks } from '../state/poolMachine';
import { sfx } from '../lib/sound';
import { cn } from '../utils/cn';
import { STATUS_META } from './Drops';
import { useAdmin } from '../context/AdminContext';
import { useIdentity } from '../lib/identity';

function Section({ n, title, icon, children, className, tone = 'white' }: { n: number; title: string; icon: string; children: ReactNode; className?: string; tone?: 'white' | 'amber' | 'navy' | 'sky' }) {
  return (
    <section
      className={cn(
        'fade-up rounded-3xl p-5 shadow-sm sm:p-6',
        tone === 'white' && 'bg-white',
        tone === 'amber' && 'border-2 border-amber-200 bg-amber-50',
        tone === 'navy' && 'bg-[#06214a] text-white',
        tone === 'sky' && 'bg-gradient-to-br from-sky-50 to-cyan-50 ring-1 ring-sky-100',
        className,
      )}
      aria-labelledby={`sec-${n}`}
    >
      <h3 id={`sec-${n}`} className="mb-3 flex items-center gap-2.5 font-display text-lg font-semibold uppercase tracking-wide">
        <span className={cn('grid h-8 w-8 place-items-center rounded-xl text-sm font-black', tone === 'navy' ? 'bg-cyan-400 text-[#06214a]' : 'bg-[#06214a] text-white')}>{n}</span>
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
  dispatch,
  soundOn,
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
  const c = getChecks(state, id);
  const st = skillState(state, id);
  // read-only unless the skill is LEARNING (reviewing a completed skill never changes state)
  const done = st !== 'LEARNING';
  const req = requirementsMet(id, c);
  const allMet = req.questions && req.practice && req.self && req.coach;
  const blockReason = st === 'LEARNING' ? validateComplete(state, id) : null;
  const canComplete = allMet && !blockReason && !state.uiLocked;
  const next = SKILLS.find((x) => x.id === id + 1);
  const { isAdmin } = useAdmin();
  const { student } = useIdentity();
  const isCoachOrAdmin = Boolean(
    isAdmin ||
    student?.role === 'ADMIN' ||
    (student?.email && student.email.toLowerCase().includes('dronadulasatish')) ||
    (student?.mobile && student.mobile.includes('6305252050'))
  );

  const set = (patch: Partial<SkillChecks>) => {
    dispatch({ type: 'SET_CHECKS', skillId: id, checks: { ...c, ...patch } });
    if (soundOn) sfx.click();
  };

  const practiceFlow = ['Practice', 'Rest', 'Repeat', 'Self-check'];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button onClick={onBack} className="min-h-11 rounded-full bg-white px-4 py-2 text-sm font-extrabold text-sky-700 shadow-sm ring-1 ring-sky-100 transition hover:bg-sky-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-cyan-200">
          ← Back to Pool Journey
        </button>
        <span className={cn('rounded-full px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider', STATUS_META[st].chip)}>
          {STATUS_META[st].icon} {STATUS_META[st].label}
        </span>
      </div>

      {/* 1. intro */}
      <Section n={1} title="Skill introduction" icon="💧" tone="navy">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="grid h-20 w-20 shrink-0 place-items-center rounded-3xl bg-gradient-to-br from-cyan-300 to-sky-600 text-4xl shadow-lg" aria-hidden>
            {s.icon}
          </div>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-cyan-300">
              Drop {s.id} of 18 · Pool Level {lv.id} — {lv.name}
            </p>
            <h2 className="font-display text-3xl font-semibold uppercase leading-tight sm:text-4xl">{s.name}</h2>
            <p className="mt-1 text-sky-100">{s.short}</p>
          </div>
        </div>
      </Section>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* 2. why */}
        <Section n={2} title="Why this skill?" icon="🧭">
          <p className="leading-relaxed text-slate-700">{s.why}</p>
          <p className="mt-3 text-sm font-bold text-sky-700">
            Stage: {lv.progression.map((p, i) => (
              <span key={p} className={cn(i === (s.id - 1) % 6 ? 'rounded bg-amber-200 px-1 text-[#06214a]' : 'text-slate-400')}>
                {p}
                {i < 5 ? ' → ' : ''}
              </span>
            ))}
          </p>
        </Section>

        {/* 3. safety */}
        <Section n={3} title="Safety" icon="🛟" tone="amber">
          <ul className="space-y-2">
            {s.safety.map((x) => (
              <li key={x} className="flex gap-2 text-sm leading-relaxed text-amber-950">
                <span aria-hidden>⚠️</span>
                {x}
              </li>
            ))}
          </ul>
        </Section>

        {/* 4. who */}
        <Section n={4} title="Who is this for?" icon="🙋">
          <p className="leading-relaxed text-slate-700">{s.who}</p>
        </Section>

        {/* 5. need */}
        <Section n={5} title="What you need" icon="🎒">
          <ul className="flex flex-wrap gap-2">
            {s.need.map((x) => (
              <li key={x} className="rounded-2xl bg-sky-50 px-3 py-2 text-sm font-bold text-sky-800 ring-1 ring-sky-100">
                {x}
              </li>
            ))}
          </ul>
        </Section>
      </div>

      {/* 6. quick questions */}
      <Section n={6} title="Quick questions — am I ready?" icon="❓" tone="sky">
        <div className="space-y-3">
          {s.questions.map((q, i) => (
            <div key={q} className="flex flex-col gap-2 rounded-2xl bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <p className="font-bold text-slate-700">{q}</p>
              <div className="flex gap-2" role="group" aria-label={q}>
                {[
                  { v: true, label: '👍 Yes' },
                  { v: false, label: '✋ Not yet' },
                ].map((o) => (
                  <button
                    key={o.label}
                    disabled={done}
                    onClick={() => set({ q: c.q.map((a, j) => (j === i ? o.v : a)) })}
                    aria-pressed={c.q[i] === o.v}
                    className={cn(
                      'min-h-11 rounded-xl px-4 text-sm font-extrabold transition focus:outline-none focus-visible:ring-4 focus-visible:ring-cyan-200',
                      c.q[i] === o.v ? (o.v ? 'bg-emerald-500 text-white' : 'bg-amber-400 text-[#06214a]') : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                    )}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {c.q.some((a) => a === false) && (
            <p className="rounded-2xl bg-amber-100 p-3 text-sm font-bold text-amber-900">
              ✋ That’s okay! Practise the previous drop again with your instructor, then come back when you can answer “Yes”.
            </p>
          )}
        </div>
      </Section>

      {/* 7. learn */}
      <Section n={7} title="Learn" icon="📘">
        <ol className="grid gap-3 sm:grid-cols-2">
          {s.steps.map((x, i) => (
            <li key={x} className="flex gap-3 rounded-2xl bg-slate-50 p-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-cyan-400 to-sky-600 text-sm font-black text-white">{i + 1}</span>
              <span className="pt-1 font-semibold text-slate-700">{x}</span>
            </li>
          ))}
        </ol>
        <p className="mt-3 text-sm text-slate-500">👆 Watch the pool above — tap any step in the timeline to pause on it.</p>
      </Section>

      {/* 8. practice */}
      <Section n={8} title="Practice" icon="🔁" tone="sky">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {practiceFlow.map((p, i) => (
            <span key={p} className="flex items-center gap-2">
              <span className="rounded-full bg-[#06214a] px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider text-white">{p}</span>
              {i < practiceFlow.length - 1 && <span className="text-sky-500">→</span>}
            </span>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-white p-3 shadow-sm">
            <p className="text-xs font-extrabold uppercase tracking-wider text-sky-500">Practice</p>
            <p className="font-bold text-slate-700">{s.practice.task}</p>
          </div>
          <div className="rounded-2xl bg-white p-3 shadow-sm">
            <p className="text-xs font-extrabold uppercase tracking-wider text-sky-500">Each round</p>
            <p className="font-bold text-slate-700">{s.practice.reps}</p>
          </div>
          <div className="rounded-2xl bg-white p-3 shadow-sm">
            <p className="text-xs font-extrabold uppercase tracking-wider text-sky-500">Rest</p>
            <p className="font-bold text-slate-700">{s.practice.rest}</p>
          </div>
        </div>
        <p className="mt-4 text-sm font-bold text-slate-600">Tap each round when you have finished it in the pool:</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {Array.from({ length: s.practice.rounds }).map((_, i) => {
            const ok = c.rounds > i;
            return (
              <button
                key={i}
                disabled={done || (!ok && c.rounds !== i)}
                onClick={() => set({ rounds: ok ? i : i + 1 })}
                aria-pressed={ok}
                className={cn(
                  'min-h-12 rounded-2xl px-4 font-extrabold transition focus:outline-none focus-visible:ring-4 focus-visible:ring-cyan-200 disabled:cursor-not-allowed',
                  ok ? 'bg-sky-600 text-white' : c.rounds === i ? 'bg-white text-sky-700 ring-2 ring-sky-300 hover:bg-sky-50' : 'bg-white/60 text-slate-400',
                )}
              >
                {ok ? '💧' : '○'} Round {i + 1}
              </button>
            );
          })}
        </div>
      </Section>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* 9. self-check */}
        <Section n={9} title="Self-check — can I do this?" icon="✅">
          <div className="space-y-2">
            {s.selfCheck.map((x, i) => (
              <label key={x} className={cn('flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl p-3 transition', c.self[i] ? 'bg-emerald-50 ring-1 ring-emerald-200' : 'bg-slate-50 hover:bg-slate-100')}>
                <input
                  type="checkbox"
                  className="h-6 w-6 shrink-0 accent-emerald-500"
                  checked={!!c.self[i]}
                  disabled={done}
                  onChange={(e) => set({ self: c.self.map((v, j) => (j === i ? e.target.checked : v)) })}
                />
                <span className="font-bold text-slate-700">{x}</span>
              </label>
            ))}
          </div>
        </Section>

        {/* 10. mistakes */}
        <Section n={10} title="Common mistakes" icon="🚫">
          <ul className="space-y-2">
            {s.mistakes.map((m) => (
              <li key={m.mistake} className="rounded-2xl bg-slate-50 p-3">
                <p className="text-sm font-bold text-rose-600">✗ {m.mistake}</p>
                <p className="text-sm font-bold text-emerald-700">✓ {m.fix}</p>
              </li>
            ))}
          </ul>
        </Section>
      </div>

      {/* 11. cues */}
      <Section n={11} title="Coach cues" icon="📣" tone="navy">
        <div className="flex flex-wrap gap-2">
          {s.cues.map((x) => (
            <span key={x} className="rounded-full bg-gradient-to-r from-cyan-400 to-sky-500 px-4 py-2 font-display text-lg font-semibold text-white shadow">
              “{x}”
            </span>
          ))}
        </div>
      </Section>

      {/* 12. ready */}
      <Section n={12} title="Ready to progress?" icon="🚀">
        <p className="mb-3 font-bold text-slate-600">Before moving on, show your instructor that you can:</p>
        <ul className="mb-5 space-y-2">
          {s.ready.map((x) => (
            <li key={x} className="flex gap-2 font-semibold text-slate-700">
              <span aria-hidden>🎯</span>
              {x}
            </li>
          ))}
        </ul>

        {/* Coach / Instructor Verification Block */}
        {isCoachOrAdmin ? (
          <div className="mb-5 rounded-2xl border-2 border-emerald-300 bg-emerald-50/70 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-200 px-2.5 py-0.5 text-[11px] font-black uppercase text-emerald-900">
                  🧑‍🏫 Coach Evaluation Mode
                </span>
                <p className="mt-1 font-bold text-sm text-slate-800">
                  Instructor authority: verify that student demonstrated this skill safely in the pool.
                </p>
              </div>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  className="h-6 w-6 shrink-0 accent-emerald-600 cursor-pointer"
                  checked={c.coach}
                  disabled={done}
                  onChange={(e) => set({ coach: e.target.checked })}
                />
                <span className="font-extrabold text-sm text-emerald-900">
                  {c.coach ? 'Approved ✅' : 'Approve Drop'}
                </span>
              </label>
            </div>
          </div>
        ) : (
          <div className={cn(
            'mb-5 flex items-center gap-3 rounded-2xl p-4 border',
            c.coach
              ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
              : 'border-amber-200 bg-amber-50 text-amber-900'
          )}>
            <span className="text-2xl" aria-hidden>{c.coach ? '✅' : '⏳'}</span>
            <div>
              <p className="font-extrabold text-sm">
                {c.coach ? 'Instructor / Coach Verified' : 'Coach Evaluation Required'}
              </p>
              <p className="text-xs font-semibold text-slate-600">
                {c.coach
                  ? 'Your instructor watched and verified this skill in the pool.'
                  : 'Your coach will evaluate and approve this drop during your pool session.'}
              </p>
            </div>
          </div>
        )}

        {st === 'COMPLETED' ? (
          <div className="rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-500 p-4 text-center font-extrabold text-white">
            💧 Drop {s.id} completed! {next ? `Next: Drop ${next.id} — ${next.name}` : 'You completed the whole Pool Journey 🏊'}
          </div>
        ) : done ? (
          <div className="rounded-2xl bg-slate-100 p-4 text-center font-bold text-slate-500">🔒 Open this skill from its card to start learning it.</div>
        ) : (
          <>
            <ul className="mb-4 grid gap-2 sm:grid-cols-2" aria-label="Completion requirements">
              {[
                { ok: req.questions, label: 'Answered “Yes” to all quick questions' },
                { ok: req.practice, label: `Finished ${s.practice.rounds} practice rounds` },
                { ok: req.self, label: 'Ticked every self-check' },
                { ok: req.coach, label: 'Instructor / adult confirmation' },
              ].map((r) => (
                <li key={r.label} className={cn('flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold', r.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-500')}>
                  <span aria-hidden>{r.ok ? '✅' : '⬜'}</span>
                  {r.label}
                </li>
              ))}
            </ul>
            <button
              disabled={!canComplete}
              onClick={() => canComplete && onComplete(id)}
              className={cn(
                'min-h-14 w-full rounded-2xl px-6 py-4 font-display text-xl font-semibold uppercase tracking-wide transition focus:outline-none focus-visible:ring-4 focus-visible:ring-cyan-200',
                canComplete ? 'bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 text-white shadow-xl shadow-sky-300/50 hover:-translate-y-0.5' : 'cursor-not-allowed bg-slate-200 text-slate-400',
              )}
            >
              💧 Add my drop — complete Drop {s.id}
            </button>
            {allMet && blockReason && <p className="mt-2 text-center text-sm font-bold text-amber-700">⏳ {blockReason}</p>}
            <p className="mt-2 text-center text-xs font-semibold text-slate-400">Fires SKILL_COMPLETED({s.id}) → DROP_CREATED({s.id}). A completed skill can never create a second drop.</p>
          </>
        )}
      </Section>
    </div>
  );
}
