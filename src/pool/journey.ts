// Journey animations — the same swimmer leaves the pool, returns, and finally jumps into the pond.
import { FLOAT_Y, STAND, STAND_Y, clamp, flutter, freeArm, keys, lerp, lerpPose, smooth, type Camera, type Pose } from './animations';
import type { StudentState } from '../state/poolMachine';

export const DECK_Y = 96; // standing on deck (feet at y≈184)
export const HALL_END = -350;
export const POND = { left: -1296, right: -891, surface: 196, bottom: 354 };
export const POND_SHAPE = `M -1300 184 C -1285 250, -1200 352, -1085 354 C -975 356, -905 260, -888 184 Z`;
export const POND_BASIN = `M -1310 184 C -1293 260, -1205 364, -1085 366 C -968 368, -896 264, -878 184 Z`;

export interface JourneySeg {
  label: string;
  icon: string;
  duration: number;
  next?: StudentState;
  steps: string[];
  follow?: boolean;
  sparkle?: boolean;
  camera: (p: Pose, t: number) => Camera;
  pose: (t: number, time: number) => Pose;
  splashes?: { t: number; x: number; pond?: boolean; big?: boolean }[];
}

const PRONE_LEFT: Pose = { ...STAND, angle: -90, facing: -1, x: 470, y: FLOAT_Y + 2, head: 0, aN: [180, 0], aF: [180, 0], lN: [0, 0], lF: [0, 0] };
const WALL_HOLD: Pose = { ...STAND, facing: -1, angle: 0, x: 128, y: STAND_Y + 4, head: 8, aN: [136, 12], aF: [132, 12], lN: [8, -12], lF: [-4, -6], bubbles: 0 };
const DECK_STAND: Pose = { ...STAND, x: 52, y: DECK_Y, facing: -1 };

const swimLeft = (k: number): Pose => ({ ...PRONE_LEFT, x: lerp(470, 158, k), aN: freeArm(k * 3.5), aF: freeArm(k * 3.5 + 0.5), ...flutter(k, 12), bubbles: 0.4 });

const climb = keys(WALL_HOLD, [
  [0, {}],
  [0.28, { y: 172, x: 122, angle: -12, aN: [42, 20], aF: [38, 20], head: 0, lN: [10, -20], lF: [4, -10] }],
  [0.52, { x: 106, y: 140, angle: -28, lN: [100, -110], lF: [20, -20], aN: [22, 10], aF: [18, 10] }],
  [0.76, { x: 78, y: 110, angle: -10, lN: [60, -90], lF: [40, -60], aN: [10, 20], aF: [6, 20] }],
  [1, { x: 52, y: DECK_Y, angle: 0, lN: [2, 0], lF: [-3, 0], aN: [18, 12], aF: [10, 10] }],
]);

const returning = keys({ ...DECK_STAND, facing: 1 }, [
  [0, {}],
  [0.16, { x: 64, y: DECK_Y + 2, lN: [18, -10], lF: [-14, -6] }],
  [0.32, { x: 62, y: 164, aN: [-25, 0], aF: [-20, 0], lN: [90, -88], lF: [86, -84] }],
  [0.48, { x: 72, y: 172, angle: 8, aN: [-10, 0], aF: [-6, 0], lN: [70, -70], lF: [66, -66] }],
  [0.62, { x: 118, y: 218, angle: -6, aN: [130, 40], aF: [125, 40], lN: [10, -10], lF: [6, -8] }],
  [0.78, { x: 150, y: STAND_Y, angle: 0, aN: [100, 20], aF: [96, 20], lN: [2, 0], lF: [-3, 0] }],
  [1, { angle: 88, x: 215, y: FLOAT_Y + 4, head: -4, aN: [178, 0], aF: [182, 0], lN: [0, 0], lF: [0, 0] }],
]);

const POND_STAND: Pose = { ...STAND, x: -872, y: DECK_Y, facing: -1 };
const CROUCH: Partial<Pose> = { y: 110, lN: [50, -92], lF: [46, -88], aN: [-55, 10], aF: [-50, 10], angle: -10, head: -6 };
const atEdge = keys(POND_STAND, [
  [0, {}],
  [0.3, { head: -20 }],
  [0.58, { head: -18 }],
  [0.9, CROUCH],
  [1, {}],
]);

const ENTRY_X = -1072;
function tread(time: number, x = ENTRY_X - 2): Pose {
  return {
    ...STAND,
    x,
    y: 232 + Math.sin(time / 420) * 2,
    facing: 1,
    roll: 0.65,
    aN: [85 + Math.sin(time / 230) * 24, -34],
    aF: [85 - Math.sin(time / 230) * 24, -34],
    lN: [Math.sin(time / 260) * 16, -34],
    lF: [-Math.sin(time / 260) * 16, -34],
  };
}

export const SEGMENTS: Partial<Record<StudentState, JourneySeg>> = {
  APPROACHING_EDGE: {
    label: 'Approaching edge',
    icon: '🏊',
    duration: 3200,
    next: 'CLIMBING_OUT',
    steps: ['Swimming', 'Approach pool wall', 'Stop', 'Hold pool edge'],
    camera: () => ({ name: 'Pool-side view', z: 1.3, cx: 300, cy: 225 }),
    pose: (t) => (t < 0.7 ? swimLeft(t / 0.7) : lerpPose(swimLeft(1), WALL_HOLD, smooth((t - 0.7) / 0.3))),
  },
  CLIMBING_OUT: {
    label: 'Climbing out',
    icon: '🧗',
    duration: 2900,
    next: 'OUTSIDE_POOL',
    steps: ['Pull body upward', 'Knee onto deck', 'Climb out', 'Stand beside pool'],
    camera: () => ({ name: 'Pool-side close view', z: 1.6, cx: 150, cy: 170 }),
    pose: (t) => climb(t),
    splashes: [{ t: 0.3, x: 112 }],
  },
  OUTSIDE_POOL: {
    label: 'Outside pool',
    icon: '🙌',
    duration: 900,
    sparkle: true,
    steps: ['Level complete!'],
    camera: () => ({ name: 'Pool-side view', z: 1.5, cx: 160, cy: 150 }),
    pose: (t, time) => {
      const r = smooth(clamp(t));
      const w = Math.sin(time / 240);
      return { ...DECK_STAND, y: DECK_Y - r * Math.abs(Math.sin(time / 320)) * 3, aN: [lerp(18, 162 + 12 * w, r), 10], aF: [lerp(10, 150 - 12 * w, r), 10], head: 6 * r, mouth: 0.5 * r };
    },
  },
  RETURNING_TO_POOL: {
    label: 'Returning to pool',
    icon: '↩️',
    duration: 3400,
    next: 'IN_POOL',
    steps: ['Outside pool', 'Pool edge', 'Enter water', 'Swimming position'],
    camera: () => ({ name: 'Pool-side view', z: 1.5, cx: 200, cy: 200 }),
    pose: (t) => returning(t),
    splashes: [{ t: 0.6, x: 118 }],
  },
  WALKING_TO_POND: {
    label: 'Walking to pond',
    icon: '🚶',
    duration: 7600,
    next: 'AT_POND_EDGE',
    follow: true,
    steps: ['Walk away from the pool', 'Leave the pool hall', 'Follow the path', 'Reach the pond'],
    camera: (p, t) => {
      const e = smooth(clamp(t / 0.18));
      return { name: t < 0.4 ? 'Follow camera · leaving the pool' : 'Follow camera · to the pond', z: lerp(1.5, 1.3, e), cx: lerp(160, p.x - 70, e), cy: 150 };
    },
    pose: (t) => {
      const x = lerp(52, -872, t);
      const p = t * Math.PI * 2 * 13;
      const s = Math.sin(p);
      return {
        ...DECK_STAND,
        x,
        y: DECK_Y - Math.abs(Math.cos(p)) * 2,
        lN: [26 * s, -20 * Math.max(0, Math.cos(p))],
        lF: [-26 * s, -20 * Math.max(0, -Math.cos(p))],
        aN: [-22 * s, 14],
        aF: [22 * s, 14],
        head: 3,
      };
    },
  },
  AT_POND_EDGE: {
    label: 'At pond edge',
    icon: '👀',
    duration: 2300,
    next: 'JUMPING_TO_POND',
    steps: ['Pause', 'Look toward the water', 'Bend & prepare'],
    camera: () => ({ name: 'Pond-side view', z: 1.55, cx: -990, cy: 170 }),
    pose: (t) => atEdge(t),
  },
  JUMPING_TO_POND: {
    label: 'Jumping to pond',
    icon: '🌊',
    duration: 2800,
    next: 'IN_POND',
    follow: true,
    steps: ['Prepare', 'Jump', 'Airborne', 'Water entry', 'Splash & bubbles', 'Surface'],
    camera: (_p, t) => ({ name: 'Follow camera · jump', z: lerp(1.55, 1.5, t), cx: lerp(-990, -1060, smooth(clamp(t / 0.5))), cy: lerp(170, 200, smooth(clamp((t - 0.3) / 0.4))) }),
    splashes: [{ t: 0.5, x: ENTRY_X, pond: true, big: true }],
    pose: (t, time) => {
      const crouch = atEdge(1);
      const launch: Pose = { ...POND_STAND, x: -876, y: 84, angle: -6, aN: [175, 0], aF: [170, 0], lN: [0, 0], lF: [-2, 0], head: 4 };
      if (t < 0.14) return lerpPose(crouch, launch, smooth(t / 0.14));
      if (t < 0.5) {
        const k = (t - 0.14) / 0.36;
        const arm = lerp(175, 6, smooth(clamp((k - 0.35) / 0.5)));
        return { ...launch, x: lerp(-876, ENTRY_X, k), y: lerp(84, 108, k) - 95 * Math.sin(Math.PI * k), angle: lerp(-6, 0, k), aN: [arm, 0], aF: [arm - 4, 0], head: lerp(4, 0, k) };
      }
      if (t < 0.72) {
        const k = (t - 0.5) / 0.22;
        const e = 1 - (1 - k) * (1 - k);
        return { ...launch, x: ENTRY_X - 4 * k, y: lerp(108, 262, e), angle: 0, aN: [lerp(6, 130, k), -10], aF: [lerp(2, 124, k), -10], lN: [lerp(0, 10, k), -10 * k], lF: [lerp(-2, -8, k), -6 * k], bubbles: 1, head: 0 };
      }
      const k = smooth((t - 0.72) / 0.28);
      const under: Pose = { ...launch, x: ENTRY_X - 4, y: 262, angle: 0, aN: [130, -10], aF: [124, -10], lN: [10, -10], lF: [-8, -6], bubbles: 0.6 };
      return lerpPose(under, tread(time), k);
    },
  },
  IN_POND: {
    label: 'In the pond',
    icon: '💦',
    duration: 2800,
    next: 'FINAL_CELEBRATION',
    steps: ['Swim to the surface', 'Ripples spread', 'Enjoy the pond'],
    camera: () => ({ name: 'Pond view', z: 1.55, cx: -1060, cy: 195 }),
    pose: (_t, time) => tread(time),
  },
  FINAL_CELEBRATION: {
    label: 'Final celebration',
    icon: '🎉',
    duration: 900,
    sparkle: true,
    steps: ['Pool Journey complete!'],
    camera: () => ({ name: 'Pond view', z: 1.45, cx: -1060, cy: 190 }),
    pose: (t, time) => {
      const p = tread(time);
      const r = smooth(clamp(t));
      return { ...p, roll: 0.85, mouth: 0.6 * r, aN: [lerp(p.aN[0], 165 + Math.sin(time / 170) * 18, r), lerp(-34, 0, r)] };
    },
  },
};

export const EXIT_CHAIN: StudentState[] = ['APPROACHING_EDGE', 'CLIMBING_OUT', 'OUTSIDE_POOL'];
export const RETURN_CHAIN: StudentState[] = ['OUTSIDE_POOL', 'RETURNING_TO_POOL', 'IN_POOL'];
export const POND_CHAIN: StudentState[] = ['OUTSIDE_POOL', 'WALKING_TO_POND', 'AT_POND_EDGE', 'JUMPING_TO_POND', 'IN_POND', 'FINAL_CELEBRATION'];

export function chainFor(s: StudentState, poolComplete: boolean): StudentState[] {
  if (s === 'RETURNING_TO_POOL') return RETURN_CHAIN;
  if (POND_CHAIN.slice(1).includes(s)) return POND_CHAIN;
  if (s === 'OUTSIDE_POOL' && poolComplete) return ['APPROACHING_EDGE', 'CLIMBING_OUT', 'OUTSIDE_POOL', 'WALKING_TO_POND'];
  return EXIT_CHAIN;
}

export const STATE_LABEL: Record<StudentState, string> = {
  IN_POOL: 'In pool',
  SWIMMING: 'Swimming',
  APPROACHING_EDGE: 'Approaching edge',
  CLIMBING_OUT: 'Climbing out',
  OUTSIDE_POOL: 'Outside pool',
  RETURNING_TO_POOL: 'Returning to pool',
  WALKING_TO_POND: 'Walking to pond',
  AT_POND_EDGE: 'At pond edge',
  JUMPING_TO_POND: 'Jumping to pond',
  IN_POND: 'In pond',
  FINAL_CELEBRATION: 'Final celebration',
};
