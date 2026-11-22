import { useState } from 'react';
import { CONFIG } from '../config';
import { api } from '../lib/api';
import { runAcceptanceTests, type TestResult } from '../state/acceptance';
import { levelState, serialize, type PoolState } from '../state/poolMachine';
import { cn } from '../utils/cn';

function Results({ results }: { results: TestResult[] }) {
  const passed = results.filter((r) => r.pass).length;
  return (
    <>
      <p className={cn('mb-2 text-sm font-black', passed === results.length ? 'text-emerald-300' : 'text-rose-300')}>
        {passed}/{results.length} passed
      </p>
      <ul className="max-h-72 space-y-1.5 overflow-auto">
        {results.map((r) => (
          <li key={r.name} className="rounded-xl bg-black/30 p-2 text-[11px]">
            <p className={cn('font-black', r.pass ? 'text-emerald-300' : 'text-rose-300')}>
              {r.pass ? '✓' : '✗'} {r.name}
            </p>
            <p className="text-sky-200/80">{r.detail}</p>
          </li>
        ))}
      </ul>
    </>
  );
}

/** Developer view: live poolState, event log, Pool acceptance tests, and a live backend ping. */
export function DevPanel({ state }: { state: PoolState }) {
  const [results, setResults] = useState<TestResult[] | null>(null);
  const [ping, setPing] = useState<{ ok: boolean; detail: string } | null>(null);
  const [pinging, setPinging] = useState(false);
  const view = {
    ...serialize(state),
    checks: undefined,
    currentSkill: state.currentSkill,
    totalSkills: state.totalSkills,
    studentState: state.studentState,
    journeyState: state.journeyState,
    pondUnlocked: state.pondUnlocked,
    activeDrop: state.activeDrop,
    uiLocked: state.uiLocked,
    levels: { 1: levelState(state, 1), 2: levelState(state, 2), 3: levelState(state, 3) },
  };

  const doPing = async () => {
    setPinging(true);
    setPing(null);
    try {
      const res = await api.submitFeedback({ studentId: '__ping__', studentName: 'Dev Ping', learningExperience: 'It was okay', studentFeedback: '(connectivity test — safe to ignore in the sheet)' });
      setPing({ ok: res.success, detail: `Server responded: ${JSON.stringify(res)}` });
    } catch (e) {
      setPing({ ok: false, detail: e instanceof Error ? e.message : 'Unknown error' });
    } finally {
      setPinging(false);
    }
  };

  return (
    <details className="mt-10 overflow-hidden rounded-3xl bg-[#0b1d3a] text-sky-100 shadow-lg">
      <summary className="flex min-h-12 cursor-pointer items-center justify-between px-5 py-3 font-extrabold">
        <span>🛠 Developer · Pool state machine & backend</span>
        <span className={cn('rounded-full px-2.5 py-0.5 text-xs', state.uiLocked ? 'bg-amber-300 text-[#06214a]' : 'bg-emerald-400/20 text-emerald-200')}>{state.uiLocked ? 'uiLocked = true' : 'uiLocked = false'}</span>
      </summary>
      <div className="grid gap-4 border-t border-white/10 p-4 lg:grid-cols-3">
        <div>
          <p className="mb-2 text-xs font-black uppercase tracking-widest text-cyan-300">poolState</p>
          <pre className="max-h-80 overflow-auto rounded-2xl bg-black/30 p-3 text-[11px] leading-relaxed">{JSON.stringify(view, null, 2)}</pre>
        </div>
        <div>
          <p className="mb-2 text-xs font-black uppercase tracking-widest text-cyan-300">Event log (newest first)</p>
          <ol className="max-h-80 space-y-1 overflow-auto rounded-2xl bg-black/30 p-3 text-[11px]">
            {state.log.length === 0 && <li className="text-sky-300/60">No events yet.</li>}
            {state.log.map((l) => (
              <li key={l.seq} className={cn('font-mono', l.ok ? 'text-sky-100' : 'text-rose-300')}>
                <span className="text-sky-400/60">#{l.seq}</span> <span className="font-bold">{l.type}</span> — {l.detail}
              </li>
            ))}
          </ol>
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-widest text-cyan-300">State tests 1–9</p>
            <button onClick={() => setResults(runAcceptanceTests())} className="min-h-9 rounded-full bg-cyan-400 px-3 text-xs font-black text-[#06214a]">
              ▶ Run
            </button>
          </div>
          {results ? <Results results={results} /> : <p className="rounded-2xl bg-black/30 p-3 text-xs text-sky-300/70">Runs the 9 state-machine acceptance tests against the pure reducer.</p>}
        </div>
      </div>

      <div className="border-t border-white/10 p-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-black uppercase tracking-widest text-cyan-300">Backend connectivity (feedback → Google Sheets)</p>
          <button disabled={pinging} onClick={() => void doPing()} className="min-h-9 rounded-full bg-cyan-400 px-3 text-xs font-black text-[#06214a] disabled:opacity-50">
            {pinging ? '…' : '▶ Send test feedback'}
          </button>
        </div>
        <p className="mb-2 break-all rounded-2xl bg-black/30 p-3 text-[11px] text-amber-200">{CONFIG.API_URL}</p>
        {ping && <p className={cn('rounded-2xl bg-black/30 p-3 text-[11px]', ping.ok ? 'text-emerald-300' : 'text-rose-300')}>{ping.detail}</p>}
        <p className="mt-2 text-[11px] text-sky-300/70">{'{"success":true}'} means the backend received the feedback. A network/JSON-parse error means the Apps Script deployment needs attention.</p>
      </div>
    </details>
  );
}
