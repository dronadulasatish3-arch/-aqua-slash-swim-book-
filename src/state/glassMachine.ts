// GLASS state — per student, sequential, ONE SKILL → ONE COMPLETION → ONE DROP 💧
import { useEffect, useReducer } from 'react';
import { GLASS_SKILLS, getGlassSkill, type GlassLevelId } from '../data/glass';

export type GlassSkillState = 'LOCKED' | 'AVAILABLE' | 'LEARNING' | 'COMPLETED';

export interface GlassChecks {
  self: boolean[];
  coach: boolean;
}

export interface GlassState {
  completed: number[];
  learning: number[];
  checks: Record<number, GlassChecks>;
  activeDrop: number | null; // animating, not yet settled
}

export type GlassEvent =
  | { type: 'OPEN'; id: number }
  | { type: 'SET_CHECKS'; id: number; checks: GlassChecks }
  | { type: 'COMPLETE'; id: number }
  | { type: 'DROP_SETTLED'; id: number }
  | { type: 'RESET' };

export const glassInitial = (): GlassState => ({ completed: [], learning: [], checks: {}, activeDrop: null });

/** FREE ORDER: any of the 18 Glass skills can be opened/completed in any order — nothing is ever LOCKED. */
export function glassSkillState(s: GlassState, id: number): GlassSkillState {
  if (s.completed.includes(id)) return 'COMPLETED';
  return s.learning.includes(id) ? 'LEARNING' : 'AVAILABLE';
}

export const glassLevelCount = (s: GlassState, l: GlassLevelId) => GLASS_SKILLS.filter((k) => k.level === l && s.completed.includes(k.id)).length;
export const glassLevelDone = (s: GlassState, l: GlassLevelId) => glassLevelCount(s, l) === 6;
/** All 3 Glass Levels are freely selectable. */
export const glassLevelUnlocked = (_s: GlassState, _l: GlassLevelId) => true;
export const glassCurrent = (s: GlassState) => GLASS_SKILLS.find((k) => !s.completed.includes(k.id))?.id ?? null;
export const glassChecks = (s: GlassState, id: number): GlassChecks => s.checks[id] ?? { self: getGlassSkill(id).selfCheck.map(() => false), coach: false };
export const glassReady = (_s: GlassState, _id: number) => true;
/** Settled drops = completed minus the one still falling. Water level uses this. */
export const glassSettledCount = (s: GlassState) => s.completed.length - (s.activeDrop != null ? 1 : 0);

export function glassReducer(s: GlassState, e: GlassEvent): GlassState {
  switch (e.type) {
    case 'OPEN': {
      const st = glassSkillState(s, e.id);
      if (st !== 'AVAILABLE') return s;
      return { ...s, learning: [...s.learning, e.id] };
    }
    case 'SET_CHECKS':
      if (glassSkillState(s, e.id) !== 'LEARNING') return s;
      return { ...s, checks: { ...s.checks, [e.id]: e.checks } };
    case 'COMPLETE': {
      // guards: free order, must be LEARNING, requirements met, never twice, one drop at a time
      if (s.activeDrop != null || s.completed.includes(e.id)) return s;
      if (glassSkillState(s, e.id) !== 'LEARNING' || !glassReady(s, e.id)) return s;
      return { ...s, completed: [...s.completed, e.id].sort((a, b) => a - b), learning: s.learning.filter((x) => x !== e.id), activeDrop: e.id };
    }
    case 'DROP_SETTLED':
      return s.activeDrop === e.id ? { ...s, activeDrop: null } : s;
    case 'RESET':
      return glassInitial();
    default:
      return s;
  }
}

export const glassKeyFor = (studentId: string) => `aquaslash-glass-v1:${studentId}`;

export function loadGlass(studentId: string): GlassState {
  try {
    const raw = localStorage.getItem(glassKeyFor(studentId));
    if (raw) {
      const p = JSON.parse(raw) as Partial<GlassState>;
      const completed = [...new Set((p.completed ?? []).filter((n) => Number.isInteger(n) && n >= 1 && n <= 18))].sort((a, b) => a - b);
      return { completed, learning: (p.learning ?? []).filter((n) => !completed.includes(n)), checks: p.checks ?? {}, activeDrop: null };
    }
  } catch {
    /* ignore */
  }
  return glassInitial();
}

/** Read-only peek (e.g. for the journey dashboard). */
export const peekGlassCount = (studentId: string) => loadGlass(studentId).completed.length;

export function useGlassMachine(studentId: string) {
  const [state, dispatch] = useReducer(glassReducer, studentId, loadGlass);
  const persisted = JSON.stringify({ completed: state.completed, learning: state.learning, checks: state.checks });
  useEffect(() => {
    try {
      localStorage.setItem(glassKeyFor(studentId), persisted);
      window.dispatchEvent(new CustomEvent('aquaslash-progress', { detail: studentId }));
    } catch {
      /* ignore */
    }
  }, [persisted, studentId]);
  return { state, dispatch };
}
