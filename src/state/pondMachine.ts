// ───────────────────────────────────────────────────────────
// Aqua Slash — Level 3: Pond State Machine
// 18 Drops · 3 Levels · 6 Drops per level · 1 skill = 1 drop earned
// ───────────────────────────────────────────────────────────

import { useEffect, useReducer } from 'react';
import { POND_SKILLS, getPondSkill, type PondLevelId } from '../data/pondCurriculum';

export type PondSkillState = 'AVAILABLE' | 'LEARNING' | 'COMPLETED';

export interface PondChecks {
  self: boolean[];
  coach: boolean;
}

export interface PondState {
  completed: number[]; // Array of completed Drop IDs (1–18)
  learning: number[];
  checks: Record<number, PondChecks>;
  activeDrop: number | null; // Currently animating drop
}

export type PondEvent =
  | { type: 'OPEN'; id: number }
  | { type: 'SET_CHECKS'; id: number; checks: PondChecks }
  | { type: 'COMPLETE'; id: number }
  | { type: 'DROP_SETTLED'; id: number }
  | { type: 'RESET' };

export const pondInitial = (): PondState => ({
  completed: [],
  learning: [],
  checks: {},
  activeDrop: null,
});

export function pondSkillState(s: PondState, id: number): PondSkillState {
  if (s.completed.includes(id)) return 'COMPLETED';
  return s.learning.includes(id) ? 'LEARNING' : 'AVAILABLE';
}

export const pondLevelCount = (s: PondState, l: PondLevelId) =>
  POND_SKILLS.filter((k) => k.level === l && s.completed.includes(k.id)).length;

export const pondLevelDone = (s: PondState, l: PondLevelId) => pondLevelCount(s, l) === 6;

export const pondLevelUnlocked = (_s: PondState, _l: PondLevelId) => true;

export const pondCurrent = (s: PondState) =>
  POND_SKILLS.find((k) => !s.completed.includes(k.id))?.id ?? null;

export const pondChecks = (s: PondState, id: number): PondChecks =>
  s.checks[id] ?? { self: getPondSkill(id).selfCheck.map(() => false), coach: false };

export const pondReady = (_s: PondState, _id: number) => true;

export const pondSettledCount = (s: PondState) =>
  s.completed.length - (s.activeDrop != null ? 1 : 0);

export function pondReducer(s: PondState, e: PondEvent): PondState {
  switch (e.type) {
    case 'OPEN': {
      const st = pondSkillState(s, e.id);
      if (st !== 'AVAILABLE') return s;
      return { ...s, learning: [...s.learning, e.id] };
    }
    case 'SET_CHECKS':
      if (pondSkillState(s, e.id) !== 'LEARNING') return s;
      return { ...s, checks: { ...s.checks, [e.id]: e.checks } };
    case 'COMPLETE': {
      // 1 Skill completed = 1 Drop earned. Never duplicate or award multiple drops.
      if (s.activeDrop != null || s.completed.includes(e.id)) return s;
      return {
        ...s,
        completed: [...s.completed, e.id].sort((a, b) => a - b),
        learning: s.learning.filter((x) => x !== e.id),
        activeDrop: e.id,
      };
    }
    case 'DROP_SETTLED':
      return s.activeDrop === e.id ? { ...s, activeDrop: null } : s;
    case 'RESET':
      return pondInitial();
    default:
      return s;
  }
}

export const pondKeyFor = (studentId: string) => `aquaslash-pond-v1:${studentId}`;

export function loadPond(studentId: string): PondState {
  try {
    const raw = localStorage.getItem(pondKeyFor(studentId));
    if (raw) {
      const p = JSON.parse(raw) as Partial<PondState>;
      const completed = [
        ...new Set((p.completed ?? []).filter((n) => Number.isInteger(n) && n >= 1 && n <= 18)),
      ].sort((a, b) => a - b);
      return {
        completed,
        learning: (p.learning ?? []).filter((n) => !completed.includes(n)),
        checks: p.checks ?? {},
        activeDrop: null,
      };
    }
  } catch {
    /* ignore */
  }
  return pondInitial();
}

/** Read-only peek for the journey dashboard and student profile. */
export const peekPondCount = (studentId: string) => loadPond(studentId).completed.length;

export function usePondMachine(studentId: string) {
  const [state, dispatch] = useReducer(pondReducer, studentId, loadPond);
  const persisted = JSON.stringify({
    completed: state.completed,
    learning: state.learning,
    checks: state.checks,
  });

  useEffect(() => {
    try {
      localStorage.setItem(pondKeyFor(studentId), persisted);
    } catch {
      /* ignore */
    }
  }, [studentId, persisted]);

  return { state, dispatch };
}
