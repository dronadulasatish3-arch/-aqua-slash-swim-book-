import { getSkill } from '../data/curriculum';
import {
  initialState,
  poolReducer,
  restore,
  serialize,
  skillState,
  levelState,
  milestoneActive,
  poolConfig,
  type PoolEvent,
  type PoolState,
  type SkillChecks,
} from './poolMachine';

export interface TestResult {
  name: string;
  pass: boolean;
  detail: string;
}

const run = (s: PoolState, ...events: PoolEvent[]) => events.reduce(poolReducer, s);

function fullChecks(id: number): SkillChecks {
  const k = getSkill(id);
  return { q: k.questions.map(() => true), rounds: k.practice.rounds, self: k.selfCheck.map(() => true), coach: true };
}

/** Student learns + completes a skill; the drop animation settles. */
function learnAndComplete(s: PoolState, id: number) {
  return run(s, { type: 'SKILL_OPENED', skillId: id }, { type: 'SET_CHECKS', skillId: id, checks: fullChecks(id) }, { type: 'SKILL_COMPLETED', skillId: id }, { type: 'DROP_SETTLED', dropId: id });
}

/** Simulates the exit animation segments finishing. */
const exitPool = (s: PoolState) => run(s, { type: 'STUDENT_TRANSITION', to: 'CLIMBING_OUT' }, { type: 'STUDENT_TRANSITION', to: 'OUTSIDE_POOL' });
const continueLevel = (s: PoolState) => run(s, { type: 'CONTINUE_NEXT_LEVEL' }, { type: 'STUDENT_TRANSITION', to: 'IN_POOL' });

function through(s: PoolState, from: number, to: number) {
  for (let i = from; i <= to; i++) s = learnAndComplete(s, i);
  return s;
}

/** Tests exercise the full 3-level machine, then verify the Beta gate separately. */
export function runAcceptanceTests(): TestResult[] {
  const prev = poolConfig.activeLevels;
  poolConfig.activeLevels = 3;
  let results: TestResult[];
  try {
    results = runAllStateTests();
  } finally {
    poolConfig.activeLevels = prev;
  }
  // Beta gate: with 2 active levels, Level 3 can't be entered
  poolConfig.activeLevels = 2;
  try {
    let s = initialState();
    for (let id = 1; id <= 12; id++) {
      if (s.studentState === 'OUTSIDE_POOL') s = [{ type: 'CONTINUE_NEXT_LEVEL' } as PoolEvent, { type: 'STUDENT_TRANSITION', to: 'IN_POOL' } as PoolEvent].reduce(poolReducer, s);
      s = learnAndComplete(s, id);
      if (id % 6 === 0) s = exitPool(s);
    }
    const blocked = poolReducer(s, { type: 'CONTINUE_NEXT_LEVEL' });
    const open13 = poolReducer(s, { type: 'SKILL_OPENED', skillId: 13 });
    results.push({
      name: '+ Beta: Level 3 is Coming Soon after 12/12',
      pass: s.completedCount === 12 && s.level2Complete && blocked.studentState === 'OUTSIDE_POOL' && !open13.learningSkills.includes(13),
      detail: `${s.completedCount}/18 · continue → "${blocked.log[0].detail}"`,
    });
  } finally {
    poolConfig.activeLevels = prev;
  }
  return results;
}

function runAllStateTests(): TestResult[] {
  const out: TestResult[] = [];
  const t = (name: string, pass: boolean, detail: string) => out.push({ name, pass, detail });

  // Test 1
  let s = learnAndComplete(initialState(), 1);
  t('1 · Complete Skill 1', s.completedCount === 1 && s.completedDrops.join() === '1' && skillState(s, 2) === 'AVAILABLE', `${s.completedCount}/18 · drops [${s.completedDrops}] · Skill 2 ${skillState(s, 2)}`);

  // Test 2
  s = run(s, { type: 'SKILL_OPENED', skillId: 2 });
  t('2 · Open Skill 2 only', s.completedCount === 1 && !s.completedDrops.includes(2) && skillState(s, 2) === 'LEARNING', `${s.completedCount}/18 · Drop 2 ${s.completedDrops.includes(2) ? 'exists ✗' : 'absent'} · Skill 2 ${skillState(s, 2)}`);

  // Test 3
  s = run(s, { type: 'SET_CHECKS', skillId: 2, checks: fullChecks(2) }, { type: 'SKILL_COMPLETED', skillId: 2 }, { type: 'DROP_SETTLED', dropId: 2 });
  t('3 · Complete Skill 2', s.completedCount === 2 && s.completedDrops.includes(2) && skillState(s, 3) === 'AVAILABLE', `${s.completedCount}/18 · Skill 3 ${skillState(s, 3)}`);

  // Test 8 — FREE ORDER: Skill 5 can be completed before Skill 4 (nothing in Glass/Pool is locked by sequence)
  const before = s.completedCount;
  const s8 = run(s, { type: 'SKILL_OPENED', skillId: 5 }, { type: 'SET_CHECKS', skillId: 5, checks: fullChecks(5) }, { type: 'SKILL_COMPLETED', skillId: 5 });
  t(
    '8 · Skill 5 before Skill 4 is ALLOWED (free order)',
    s8.completedCount === before + 1 && s8.completedDrops.includes(5) && skillState(s8, 4) === 'AVAILABLE',
    `accepted · ${s8.completedCount}/18 · Drop 5 created · Skill 4 still ${skillState(s8, 4)} (independent)`,
  );

  // Test 4
  s = through(s, 3, 6);
  const afterSettle6 = s.studentState;
  s = exitPool(s);
  t(
    '4 · Complete Skill 6',
    s.completedCount === 6 && s.completedDrops.includes(6) && s.level1Complete && milestoneActive(s, 1) && afterSettle6 === 'APPROACHING_EDGE' && s.studentState === 'OUTSIDE_POOL' && levelState(s, 2) === 'AVAILABLE',
    `6/18 · Level 1 ${levelState(s, 1)} · 💧 ${milestoneActive(s, 1) ? 'on' : 'off'} · student ${afterSettle6} → ${s.studentState} · Level 2 ${levelState(s, 2)}`,
  );

  // Test 5
  s = continueLevel(s);
  const l2Active = levelState(s, 2) === 'ACTIVE' && s.completedCount === 6;
  s = through(s, 7, 12);
  s = exitPool(s);
  t('5 · Complete Skill 12', l2Active && s.completedCount === 12 && s.level2Complete && milestoneActive(s, 2) && s.studentState === 'OUTSIDE_POOL' && levelState(s, 3) === 'AVAILABLE', `12/18 · 🦵 on · student ${s.studentState} · Level 3 ${levelState(s, 3)}`);

  // Test 7 (refresh after Skill 10)
  let s7 = continueLevel(exitPool(through(initialState(), 1, 6)));
  s7 = through(s7, 7, 10);
  const reloaded = restore(JSON.parse(JSON.stringify(serialize(s7))));
  t(
    '7 · Refresh after Skill 10',
    reloaded.completedCount === 10 && reloaded.completedDrops.length === 10 && levelState(reloaded, 2) === 'ACTIVE' && skillState(reloaded, 11) === 'AVAILABLE' && reloaded.activeDrop === null,
    `${reloaded.completedCount}/18 · drops settled ${reloaded.completedDrops.length} · Level 2 ${levelState(reloaded, 2)} · Skill 11 ${skillState(reloaded, 11)}`,
  );

  // Test 6
  s = continueLevel(s);
  s = through(s, 13, 18);
  const pondLocked = run(s, { type: 'START_POND_JOURNEY' }).studentState; // still APPROACHING_EDGE → rejected
  s = exitPool(s);
  s = run(
    s,
    { type: 'START_POND_JOURNEY' },
    { type: 'STUDENT_TRANSITION', to: 'AT_POND_EDGE' },
    { type: 'STUDENT_TRANSITION', to: 'JUMPING_TO_POND' },
    { type: 'STUDENT_TRANSITION', to: 'IN_POND' },
    { type: 'FINAL_JOURNEY_COMPLETE' },
  );
  t(
    '6 · Complete Skill 18 → pond',
    pondLocked === 'APPROACHING_EDGE' && s.completedCount === 18 && s.level3Complete && s.pondUnlocked && s.finalJourneyComplete && s.studentState === 'FINAL_CELEBRATION',
    `18/18 · 🏊 on · pond ${s.pondUnlocked ? 'unlocked' : 'locked'} · student ${s.studentState} · final ${s.finalJourneyComplete}`,
  );

  // Test 9 (double click)
  let s9 = run(initialState(), { type: 'SKILL_OPENED', skillId: 1 }, { type: 'SET_CHECKS', skillId: 1, checks: fullChecks(1) });
  s9 = run(s9, { type: 'SKILL_COMPLETED', skillId: 1 }, { type: 'SKILL_COMPLETED', skillId: 1 }, { type: 'SKILL_COMPLETED', skillId: 1 });
  s9 = run(s9, { type: 'DROP_SETTLED', dropId: 1 }, { type: 'SKILL_COMPLETED', skillId: 1 });
  t('9 · Double-click Complete', s9.completedCount === 1 && s9.completedDrops.length === 1, `completions 1 · drops ${s9.completedDrops.length} · ${s9.log.filter((l) => l.type === 'SKILL_COMPLETED' && !l.ok).length} duplicates ignored`);

  // Extra safety rules
  const bad = run(initialState(), { type: 'STUDENT_TRANSITION', to: 'JUMPING_TO_POND' });
  t('+ IN_POOL → JUMPING_TO_POND blocked', bad.studentState === 'IN_POOL', bad.log[0].detail);
  const again = run(s, { type: 'START_POND_JOURNEY' });
  t('+ Duplicate pond journey blocked', again.studentState === 'FINAL_CELEBRATION', again.log[0].detail);
  const openAnywhere = run(initialState(), { type: 'SKILL_OPENED', skillId: 7 });
  t('+ Free order: Skill 7 (Level 2) opens from a fresh start', openAnywhere.learningSkills.includes(7) && skillState(openAnywhere, 1) === 'AVAILABLE', `Skill 7 → ${skillState(openAnywhere, 7)} · Skill 1 still ${skillState(openAnywhere, 1)} (independent)`);
  const noCheck = run(initialState(), { type: 'SKILL_OPENED', skillId: 1 }, { type: 'SKILL_COMPLETED', skillId: 1 });
  t('+ Opening ≠ completion (checks required)', noCheck.completedCount === 0, noCheck.log[0].detail);

  return out;
}
