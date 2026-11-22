// ───────────────────────────────────────────────────────────
// Aqua Slash — Pool Level STATE MACHINE (single source of truth)
//
//   STATE controls DATA · EVENTS change STATE · ANIMATIONS visualize STATE
//
// ONE SKILL → ONE COMPLETION → ONE DROP 💧
// ───────────────────────────────────────────────────────────
import { useEffect, useReducer } from 'react';
import { SKILLS, getSkill, type LevelId } from '../data/curriculum';
import { CONFIG } from '../config';

/** Beta gate: levels above `activeLevels` are kept in code/data but shown as Coming Soon. */
export const poolConfig = { activeLevels: CONFIG.POOL_ACTIVE_LEVELS as number };
export const levelComingSoon = (l: LevelId) => l > poolConfig.activeLevels;
/** All ACTIVE Beta levels complete (e.g. Levels 1–2). */
export const poolBetaComplete = (s: { completedSkills: number[] }) => SKILLS.filter((k) => k.level <= poolConfig.activeLevels).every((k) => s.completedSkills.includes(k.id));

export type SkillState = 'LOCKED' | 'AVAILABLE' | 'LEARNING' | 'COMPLETED';
export type LevelState = 'LOCKED' | 'AVAILABLE' | 'ACTIVE' | 'COMPLETED';
export type StudentState =
  | 'IN_POOL'
  | 'SWIMMING'
  | 'APPROACHING_EDGE'
  | 'CLIMBING_OUT'
  | 'OUTSIDE_POOL'
  | 'RETURNING_TO_POOL'
  | 'WALKING_TO_POND'
  | 'AT_POND_EDGE'
  | 'JUMPING_TO_POND'
  | 'IN_POND'
  | 'FINAL_CELEBRATION';
export type JourneyState =
  | 'learning'
  | 'level_celebration'
  | 'level_complete'
  | 'returning'
  | 'pool_complete'
  | 'pond_journey'
  | 'completed';

/** The ONLY valid student transitions. */
export const STUDENT_TRANSITIONS: Record<StudentState, StudentState[]> = {
  IN_POOL: ['SWIMMING', 'APPROACHING_EDGE'],
  SWIMMING: ['IN_POOL'],
  APPROACHING_EDGE: ['CLIMBING_OUT'],
  CLIMBING_OUT: ['OUTSIDE_POOL'],
  OUTSIDE_POOL: ['RETURNING_TO_POOL', 'WALKING_TO_POND'],
  RETURNING_TO_POOL: ['IN_POOL'],
  WALKING_TO_POND: ['AT_POND_EDGE'],
  AT_POND_EDGE: ['JUMPING_TO_POND'],
  JUMPING_TO_POND: ['IN_POND'],
  IN_POND: ['FINAL_CELEBRATION'],
  FINAL_CELEBRATION: [],
};

/** Transitions the animation layer may request when a segment finishes. */
const ANIMATION_DRIVEN: StudentState[] = ['CLIMBING_OUT', 'OUTSIDE_POOL', 'IN_POOL', 'AT_POND_EDGE', 'JUMPING_TO_POND', 'IN_POND'];

export interface SkillChecks {
  q: (boolean | null)[];
  rounds: number;
  self: boolean[];
  coach: boolean;
}

export interface LogEntry {
  seq: number;
  type: string;
  detail: string;
  ok: boolean;
}

export interface PoolState {
  currentLevel: LevelId;
  currentSkill: number;
  completedSkills: number[];
  completedDrops: number[];
  totalSkills: 18;
  completedCount: number;
  level1Complete: boolean;
  level2Complete: boolean;
  level3Complete: boolean;
  studentState: StudentState;
  journeyState: JourneyState;
  pondUnlocked: boolean;
  finalJourneyComplete: boolean;
  // supporting state (still part of the one store)
  learningSkills: number[];
  checks: Record<number, SkillChecks>;
  activeDrop: number | null; // drop currently animating (APPEAR → … → SETTLED)
  pendingLevel: LevelId | null; // level completed, celebration waits for drop to settle
  uiLocked: boolean;
  pondAutoStart: boolean;
  log: LogEntry[];
  seq: number;
}

export type PoolEvent =
  | { type: 'SKILL_OPENED'; skillId: number }
  | { type: 'SKILL_CLOSED' }
  | { type: 'SET_CHECKS'; skillId: number; checks: SkillChecks }
  | { type: 'SKILL_COMPLETED'; skillId: number }
  | { type: 'DROP_SETTLED'; dropId: number }
  | { type: 'STUDENT_TRANSITION'; to: StudentState }
  | { type: 'CONTINUE_NEXT_LEVEL' }
  | { type: 'START_POND_JOURNEY' }
  | { type: 'FINAL_JOURNEY_COMPLETE' }
  | { type: 'FINAL_CELEBRATION_DISMISSED' }
  | { type: 'RESET' };

// ── initial state ─────────────────────────────────────────
export function initialState(): PoolState {
  return {
    currentLevel: 1,
    currentSkill: 1,
    completedSkills: [],
    completedDrops: [],
    totalSkills: 18,
    completedCount: 0,
    level1Complete: false,
    level2Complete: false,
    level3Complete: false,
    studentState: 'IN_POOL',
    journeyState: 'learning',
    pondUnlocked: false,
    finalJourneyComplete: false,
    learningSkills: [],
    checks: {},
    activeDrop: null,
    pendingLevel: null,
    uiLocked: false,
    pondAutoStart: false,
    log: [],
    seq: 0,
  };
}

// ── selectors ─────────────────────────────────────────────
export const levelDone = (s: PoolState, l: LevelId) => (l === 1 ? s.level1Complete : l === 2 ? s.level2Complete : s.level3Complete);

/**
 * FREE ORDER: any of the 18 skills can be opened/completed in any order — no
 * skill is ever LOCKED because of another skill. The only thing that can ever
 * lock something is a level/environment that is not released yet
 * (`levelComingSoon`) — see "lock other" in levelState below.
 */
export function skillState(s: PoolState, id: number): SkillState {
  if (s.completedSkills.includes(id)) return 'COMPLETED';
  if (levelComingSoon(getSkill(id).level)) return 'LOCKED';
  return s.learningSkills.includes(id) ? 'LEARNING' : 'AVAILABLE';
}

/** All 3 Pool Levels are freely selectable — only a not-yet-released level ("lock other") is LOCKED. */
export function levelState(s: PoolState, l: LevelId): LevelState {
  if (levelComingSoon(l)) return 'LOCKED';
  if (levelDone(s, l)) return 'COMPLETED';
  return l === s.currentLevel ? 'ACTIVE' : 'AVAILABLE';
}

/** First level (1→3) that isn't fully completed yet and isn't coming-soon — used only to orient the "Continue" flow; every open level can still be picked freely at any time. */
export function nextOpenLevel(s: PoolState): LevelId {
  const candidate = ([1, 2, 3] as LevelId[]).find((l) => !levelComingSoon(l) && !levelDone(s, l));
  return candidate ?? s.currentLevel;
}

export const levelCount = (s: PoolState, l: LevelId) => SKILLS.filter((k) => k.level === l && s.completedSkills.includes(k.id)).length;
export const dropSettled = (s: PoolState, id: number) => s.completedDrops.includes(id) && s.activeDrop !== id;
export const milestoneActive = (s: PoolState, l: LevelId) => levelDone(s, l) && s.activeDrop !== l * 6;
export const progressRatio = (s: PoolState) => s.completedSkills.length / 18;

export function emptyChecks(id: number): SkillChecks {
  const k = getSkill(id);
  return { q: k.questions.map(() => null), rounds: 0, self: k.selfCheck.map(() => false), coach: false };
}
export const getChecks = (s: PoolState, id: number) => s.checks[id] ?? emptyChecks(id);

export function requirementsMet(id: number, c: SkillChecks) {
  const k = getSkill(id);
  return {
    questions: c.q.length === k.questions.length && c.q.every((v) => v === true),
    practice: c.rounds >= k.practice.rounds,
    self: c.self.length === k.selfCheck.length && c.self.every(Boolean),
    coach: c.coach,
  };
}

const exists = (id: number) => Number.isInteger(id) && id >= 1 && id <= 18;

/** Returns a rejection reason, or null when SKILL_OPENED is valid. Any of the 18 skills may be opened in any order. */
export function validateOpen(s: PoolState, id: number): string | null {
  if (!exists(id)) return 'skill does not exist';
  if (s.uiLocked) return 'UI locked during animation';
  if (levelComingSoon(getSkill(id).level)) return `Level ${getSkill(id).level} is coming soon`;
  const st = skillState(s, id);
  if (st !== 'AVAILABLE' && st !== 'LEARNING') return `skill is ${st}`;
  if (s.studentState !== 'IN_POOL' && s.studentState !== 'SWIMMING') return `student is ${s.studentState}`;
  return null;
}

/** Returns a rejection reason, or null when SKILL_COMPLETED is valid. Any of the 18 skills may be completed in any order. */
export function validateComplete(s: PoolState, id: number): string | null {
  if (!exists(id)) return 'skill does not exist';
  if (s.completedSkills.includes(id)) return 'already COMPLETED (duplicate ignored)';
  if (s.completedDrops.includes(id)) return 'drop already exists (duplicate ignored)';
  if (s.uiLocked) return 'UI locked during animation';
  if (levelComingSoon(getSkill(id).level)) return `Level ${getSkill(id).level} is coming soon`;
  const st = skillState(s, id);
  if (st !== 'LEARNING') return `skill is ${st}, must be LEARNING`;
  const r = requirementsMet(id, getChecks(s, id));
  if (!(r.questions && r.practice && r.self && r.coach)) return 'completion requirements not met';
  return null;
}

// ── reducer helpers ───────────────────────────────────────
function log(s: PoolState, type: string, detail: string, ok = true): PoolState {
  const seq = s.seq + 1;
  return { ...s, seq, log: [{ seq, type, detail, ok }, ...s.log].slice(0, 80) };
}
const reject = (s: PoolState, type: string, reason: string) => log(s, type, `REJECTED — ${reason}`, false);

function moveStudent(s: PoolState, to: StudentState): PoolState | null {
  if (!STUDENT_TRANSITIONS[s.studentState].includes(to)) return null;
  return log({ ...s, studentState: to }, 'STUDENT_STATE', `${s.studentState} → ${to}`);
}

function checkLevelCompletion(s: PoolState): PoolState {
  let n = log(s, 'CHECK_LEVEL_COMPLETION', `${s.completedCount}/18`);
  // Free order: a level completes whenever ALL of its 6 skills are done, regardless of
  // what order they were completed in or what else has been completed meanwhile.
  for (const l of [1, 2, 3] as LevelId[]) {
    const all = SKILLS.filter((k) => k.level === l).every((k) => n.completedSkills.includes(k.id));
    if (all && !levelDone(n, l)) {
      n = { ...n, [`level${l}Complete`]: true, pendingLevel: l } as PoolState;
      n = log(n, 'LEVEL_COMPLETED', `Level ${l} → COMPLETED`);
      if (l < 3) {
        n = log(n, 'LEVEL_UNLOCKED', `Level ${l + 1} → AVAILABLE · Skill ${l * 6 + 1} → AVAILABLE`);
      } else {
        n = log({ ...n, pondUnlocked: true }, 'POND_UNLOCKED', 'pondUnlocked = true');
      }
    }
  }
  return n;
}

// ── the reducer ───────────────────────────────────────────
export function poolReducer(s: PoolState, e: PoolEvent): PoolState {
  switch (e.type) {
    case 'SKILL_OPENED': {
      const r = validateOpen(s, e.skillId);
      if (r) return reject(s, 'SKILL_OPENED', `Skill ${e.skillId}: ${r}`);
      const level = getSkill(e.skillId).level;
      let n: PoolState = s.learningSkills.includes(e.skillId) ? s : { ...s, learningSkills: [...s.learningSkills, e.skillId] };
      if (level !== n.currentLevel) n = log({ ...n, currentLevel: level }, 'LEVEL_SWITCHED', `Now practising in Level ${level} (free order)`);
      n = log(n, 'SKILL_OPENED', `Skill ${e.skillId} → LEARNING (no drop, no progress)`);
      if (n.studentState === 'IN_POOL') n = moveStudent(n, 'SWIMMING') ?? n;
      return n;
    }

    case 'SKILL_CLOSED': {
      if (s.studentState !== 'SWIMMING') return s;
      return moveStudent(s, 'IN_POOL') ?? s;
    }

    case 'SET_CHECKS': {
      if (skillState(s, e.skillId) !== 'LEARNING' || s.uiLocked) return s;
      return { ...s, checks: { ...s.checks, [e.skillId]: e.checks } };
    }

    case 'SKILL_COMPLETED': {
      const id = e.skillId;
      const r = validateComplete(s, id);
      if (r) return reject(s, 'SKILL_COMPLETED', `Skill ${id}: ${r}`);
      // 1–3. mark completed, add to list, increment count
      const completedSkills = [...s.completedSkills, id].sort((a, b) => a - b);
      let n: PoolState = {
        ...s,
        completedSkills,
        completedCount: completedSkills.length,
        learningSkills: s.learningSkills.filter((x) => x !== id),
        currentSkill: SKILLS.find((k) => !completedSkills.includes(k.id))?.id ?? 18,
        uiLocked: true,
      };
      n = log(n, 'SKILL_COMPLETED', `Skill ${id} → COMPLETED`);
      // 4–5. exactly ONE drop (dropId = skillId)
      n = log({ ...n, completedDrops: [...n.completedDrops, id].sort((a, b) => a - b), activeDrop: id }, 'DROP_CREATED', `Drop ${id} created`);
      // 6. progress from completed skills (never from animation)
      n = log(n, 'PROGRESS_UPDATED', `${n.completedCount}/18`);
      if (n.studentState === 'SWIMMING') n = moveStudent(n, 'IN_POOL') ?? n;
      // 9. level check
      n = checkLevelCompletion(n);
      // 10. unlock next skill (within level)
      if (id < 18 && id % 6 !== 0) n = log(n, 'SKILL_UNLOCKED', `Skill ${id + 1} → AVAILABLE`);
      return n;
    }

    case 'DROP_SETTLED': {
      if (s.activeDrop !== e.dropId) return reject(s, 'DROP_SETTLED', `Drop ${e.dropId} is not animating`);
      let n = log({ ...s, activeDrop: null }, 'DROP_SETTLED', `Drop ${e.dropId}.state = SETTLED`);
      if (n.pendingLevel) {
        const l = n.pendingLevel;
        n = log({ ...n, pendingLevel: null, journeyState: 'level_celebration' }, 'LEVEL_CELEBRATION', `Milestone ${['💧', '🦵', '🏊'][l - 1]} activated`);
        const moved = moveStudent(n, 'APPROACHING_EDGE');
        if (!moved) return reject(n, 'STUDENT_EXIT_POOL', `invalid from ${n.studentState}`);
        return log(moved, 'STUDENT_EXIT_POOL', `Level ${l}`);
      }
      return { ...n, uiLocked: false };
    }

    case 'STUDENT_TRANSITION': {
      if (!ANIMATION_DRIVEN.includes(e.to)) return reject(s, 'STUDENT_TRANSITION', `${e.to} must be triggered by its own event`);
      if (e.to === 'IN_POOL' && s.studentState !== 'RETURNING_TO_POOL') return reject(s, 'STUDENT_TRANSITION', `${s.studentState} → IN_POOL not allowed`);
      const n = moveStudent(s, e.to);
      if (!n) return reject(s, 'STUDENT_TRANSITION', `${s.studentState} → ${e.to} is not a valid transition`);
      if (e.to === 'OUTSIDE_POOL') {
        if (s.completedCount < 18) return log({ ...n, journeyState: 'level_complete', uiLocked: false }, 'CONTINUE_ENABLED', `Continue — any Pool Level is open`);
        return log({ ...n, journeyState: 'pool_complete', pondAutoStart: true }, 'POOL_LEVEL_COMPLETE', '18/18 — ready for the pond');
      }
      if (e.to === 'IN_POOL') {
        // Free order: head back in on whichever level still has unfinished skills (any level may be picked afterwards anyway).
        const next = nextOpenLevel(s);
        return log({ ...n, currentLevel: next, journeyState: 'learning', uiLocked: false }, 'LEVEL_ACTIVE', `Level ${next} → ACTIVE`);
      }
      return n;
    }

    case 'CONTINUE_NEXT_LEVEL': {
      if (s.studentState !== 'OUTSIDE_POOL') return reject(s, 'CONTINUE_NEXT_LEVEL', `student is ${s.studentState}`);
      if (s.completedCount >= 18) return reject(s, 'CONTINUE_NEXT_LEVEL', 'all 18 skills are already complete');
      if (!levelDone(s, s.currentLevel)) return reject(s, 'CONTINUE_NEXT_LEVEL', `Level ${s.currentLevel} is not finished yet`);
      if (s.uiLocked) return reject(s, 'CONTINUE_NEXT_LEVEL', 'UI locked');
      const n = moveStudent(s, 'RETURNING_TO_POOL');
      if (!n) return reject(s, 'CONTINUE_NEXT_LEVEL', 'invalid transition');
      return log({ ...n, journeyState: 'returning', uiLocked: true }, 'CONTINUE_NEXT_LEVEL', `Returning to pool for Level ${s.currentLevel + 1}`);
    }

    case 'START_POND_JOURNEY': {
      if (s.finalJourneyComplete) return reject(s, 'START_POND_JOURNEY', 'journey already complete');
      if (!(s.level3Complete && s.completedCount === 18 && s.pondUnlocked)) return reject(s, 'START_POND_JOURNEY', 'pond is locked');
      const n = moveStudent(s, 'WALKING_TO_POND');
      if (!n) return reject(s, 'START_POND_JOURNEY', `invalid from ${s.studentState}`);
      return log({ ...n, journeyState: 'pond_journey', uiLocked: true, pondAutoStart: false }, 'START_POND_JOURNEY', 'Walking to the pond');
    }

    case 'FINAL_JOURNEY_COMPLETE': {
      if (s.finalJourneyComplete) return reject(s, 'FINAL_JOURNEY_COMPLETE', 'already complete');
      const n = moveStudent(s, 'FINAL_CELEBRATION');
      if (!n) return reject(s, 'FINAL_JOURNEY_COMPLETE', `invalid from ${s.studentState}`);
      return log({ ...n, finalJourneyComplete: true, journeyState: 'completed', uiLocked: true }, 'FINAL_JOURNEY_COMPLETE', '🎉 Pool Journey complete');
    }

    case 'FINAL_CELEBRATION_DISMISSED':
      if (s.studentState !== 'FINAL_CELEBRATION') return s;
      return { ...s, uiLocked: false };

    case 'RESET':
      return log(initialState(), 'RESET', 'Journey reset');

    default:
      return s;
  }
}

// ── persistence ───────────────────────────────────────────
export const STORAGE_KEY = 'aquaslash-pool-state-v2';

export function serialize(s: PoolState) {
  return {
    completedSkills: s.completedSkills,
    completedDrops: s.completedDrops,
    completedCount: s.completedCount,
    currentLevel: s.currentLevel,
    level1Complete: s.level1Complete,
    level2Complete: s.level2Complete,
    level3Complete: s.level3Complete,
    finalJourneyComplete: s.finalJourneyComplete,
    learningSkills: s.learningSkills,
    checks: s.checks,
  };
}
export type Persisted = ReturnType<typeof serialize>;

/** Rebuild a consistent, settled state from persisted data (no animation replay). Free order — any subset of the 18 skills may be completed. */
export function restore(p: Partial<Persisted>): PoolState {
  const base = initialState();
  const raw = Array.isArray(p.completedSkills) ? p.completedSkills.filter(exists) : [];
  const completedSkills = [...new Set(raw)].sort((a, b) => a - b);
  const n = completedSkills.length;
  const l1 = SKILLS.filter((k) => k.level === 1).every((k) => completedSkills.includes(k.id));
  const l2 = SKILLS.filter((k) => k.level === 2).every((k) => completedSkills.includes(k.id));
  const l3 = SKILLS.filter((k) => k.level === 3).every((k) => completedSkills.includes(k.id));
  let currentLevel = (p.currentLevel && [1, 2, 3].includes(p.currentLevel) ? p.currentLevel : 1) as LevelId;
  const doneCurrent = currentLevel === 1 ? l1 : currentLevel === 2 ? l2 : l3;
  const final = l3 && n === 18 && !!p.finalJourneyComplete;
  const studentState: StudentState = final ? 'FINAL_CELEBRATION' : doneCurrent ? 'OUTSIDE_POOL' : 'IN_POOL';
  const journeyState: JourneyState = final ? 'completed' : doneCurrent ? (n === 18 ? 'pool_complete' : 'level_complete') : 'learning';
  const learningSkills = (Array.isArray(p.learningSkills) ? p.learningSkills : []).filter((id) => exists(id) && !completedSkills.includes(id));
  const s: PoolState = {
    ...base,
    completedSkills,
    completedDrops: [...completedSkills],
    completedCount: n,
    currentLevel,
    currentSkill: SKILLS.find((k) => !completedSkills.includes(k.id))?.id ?? 18,
    level1Complete: l1,
    level2Complete: l2,
    level3Complete: l3,
    pondUnlocked: n === 18,
    finalJourneyComplete: final,
    studentState,
    journeyState,
    learningSkills,
    checks: p.checks && typeof p.checks === 'object' ? p.checks : {},
  };
  return log(s, 'STATE_RESTORED', `${n}/18 restored · drops settled · student ${studentState}`);
}

/**
 * BETA: every Student ID / Email has its OWN saved pool state.
 * (The old single global key is intentionally never read, so no student inherits it.)
 * A backend can replace these two functions later.
 */
export const storageKeyFor = (studentId: string) => `aquaslash-pool-v3:${studentId}`;

export function loadStudentState(studentId: string, get: (k: string) => string | null = (k) => localStorage.getItem(k)): PoolState {
  try {
    const raw = get(storageKeyFor(studentId));
    if (raw) return restore(JSON.parse(raw));
  } catch {
    /* ignore */
  }
  return initialState();
}

/** Mount with `key={studentId}` so switching students always loads the right progress. */
export function usePoolMachine(studentId: string) {
  const [state, dispatch] = useReducer(poolReducer, studentId, (id: string) => loadStudentState(id));
  const persisted = JSON.stringify(serialize(state));
  useEffect(() => {
    try {
      localStorage.setItem(storageKeyFor(studentId), persisted);
      window.dispatchEvent(new CustomEvent('aquaslash-progress', { detail: studentId }));
    } catch {
      /* ignore */
    }
  }, [persisted, studentId]);
  return { state, dispatch };
}

export type Dispatch = (e: PoolEvent) => void;
