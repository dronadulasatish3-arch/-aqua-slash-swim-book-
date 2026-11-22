// ───────────────────────────────────────────────────────────
// GLASS — real swimmer animations for all 18 Glass skills.
// Reuses the SAME swimmer model & keyframe engine as the Pool (src/pool/animations.ts),
// set in a shallower, friendlier "learning pool" scene (steps, rail, no lane ropes).
// ───────────────────────────────────────────────────────────
import { FLOAT_Y, PRONE, STAND, STAND_Y, SUPINE, clamp, flutter, keys, lerp, smooth, type Camera, type Part, type Phase, type Pose } from '../pool/animations';

export const G_SURFACE = 232;
export const G_FLOOR = 350;
export const G_WALL_X = 130;

export interface GlassAnim {
  duration: number;
  camera: Camera;
  phases: Phase[];
  pose: (t: number) => Pose;
  splashes?: { t: number; x: number }[];
}

const DECK: Camera = { name: 'Pool-deck view', z: 1.4, cx: 230, cy: 235 };
const WATER: Camera = { name: 'Water-level view', z: 1.55, cx: 300, cy: 240 };
const CLOSE: Camera = { name: 'Close-up view', z: 1.75, cx: 300, cy: 245 };
const SPLIT: Camera = { name: 'Above / underwater split view', z: 1.85, cx: 280, cy: G_SURFACE, split: true };

const G_PRONE: Pose = { ...PRONE, x: 300, y: FLOAT_Y + 22 };
const G_SUPINE: Pose = { ...SUPINE, x: 300, y: FLOAT_Y + 20 };
const G_STAND: Pose = { ...STAND, x: 260, y: STAND_Y + 12 };

export const GLASS_ANIMS: Record<number, GlassAnim> = {
  // ── GLASS 1 — FIRST SPLASH ──
  1: {
    duration: 6500,
    camera: DECK,
    phases: [
      { label: 'Walk to the edge', end: 0.35 },
      { label: 'Look at the water', end: 0.7, hl: ['head'] },
      { label: 'Breathe calmly', end: 1 },
    ],
    pose: keys({ ...STAND, x: 90, y: 150, facing: -1 }, [
      [0, {}],
      [0.35, { x: 190, y: 150 }],
      [0.55, { x: 210, y: 150, head: -18 }],
      [0.8, { head: -14, aN: [16, 10], aF: [10, 10] }],
      [1, { head: -10 }],
    ]),
  },
  2: {
    duration: 6500,
    camera: { name: 'Pool-steps view', z: 1.55, cx: 230, cy: 220 },
    phases: [
      { label: 'Hold the rail', end: 0.25, hl: ['arms'] },
      { label: 'Sit on the step', end: 0.6, hl: ['hips'] },
      { label: 'Legs in the water', end: 1, hl: ['legs'] },
    ],
    pose: keys({ ...STAND, x: 150, y: 150, facing: -1, aN: [90, 10], aF: [86, 10] }, [
      [0, {}],
      [0.3, { y: 175, aN: [80, 20], aF: [76, 20] }],
      [0.55, { x: 190, y: 205, angle: 8, aN: [40, 20], aF: [36, 20], lN: [70, -20], lF: [66, -18] }],
      [0.8, { lN: [30, -60], lF: [24, -56] }],
      [1, { lN: [40, -50], lF: [20, -40] }],
    ]),
  },
  3: {
    duration: 6500,
    camera: WATER,
    phases: [
      { label: 'Hold on', end: 0.25, hl: ['arms'] },
      { label: 'Slide in slowly', end: 0.65, hl: ['legs'] },
      { label: 'Stand in the water', end: 1 },
    ],
    splashes: [{ t: 0.55, x: 260 }],
    pose: keys({ ...STAND, x: 175, y: 175, facing: -1, aN: [110, 10], aF: [105, 10] }, [
      [0, {}],
      [0.28, { y: 190, angle: 6 }],
      [0.5, { x: 230, y: 225, angle: -4, lN: [30, -20], lF: [10, -10] }],
      [0.72, { x: 255, y: STAND_Y + 12, angle: 0, aN: [60, 15], aF: [55, 15], lN: [2, 0], lF: [-3, 0] }],
      [1, { aN: [18, 12], aF: [10, 10] }],
    ]),
  },
  4: {
    duration: 6500,
    camera: WATER,
    phases: [
      { label: 'Walk to the steps', end: 0.3 },
      { label: 'Hold the rail', end: 0.55, hl: ['arms'] },
      { label: 'Climb out', end: 0.85, hl: ['legs'] },
      { label: 'Stand tall', end: 1 },
    ],
    pose: keys({ ...G_STAND, x: 320 }, [
      [0, {}],
      [0.3, { x: 240 }],
      [0.55, { x: 210, aN: [80, 20], aF: [76, 20] }],
      [0.75, { y: STAND_Y - 6, angle: -8, lN: [80, -70], lF: [10, -20], aN: [30, 20], aF: [26, 20] }],
      [1, { x: 190, y: 150, angle: 0, lN: [2, 0], lF: [-3, 0], aN: [18, 12], aF: [10, 10] }],
    ]),
  },
  5: {
    duration: 6000,
    camera: CLOSE,
    phases: [
      { label: 'Scoop water', end: 0.4, hl: ['arms'] },
      { label: 'Pour on shoulders', end: 0.75, hl: ['body'] },
      { label: 'Smile', end: 1 },
    ],
    pose: keys(G_STAND, [
      [0, { aN: [60, 60], aF: [55, 60] }],
      [0.2, { aN: [110, 70], aF: [55, 60] }],
      [0.4, { aN: [40, 100], aF: [55, 60] }],
      [0.6, { aN: [70, 90], aF: [70, 90], head: 6 }],
      [0.85, { head: 10, mouth: 0.5 }],
      [1, { aN: [18, 12], aF: [10, 10], head: 4, mouth: 0.4 }],
    ]),
  },
  6: {
    duration: 5200,
    camera: CLOSE,
    phases: [
      { label: 'Cup water', end: 0.3, hl: ['arms'] },
      { label: 'Splash your face', end: 0.55, hl: ['head'] },
      { label: 'Blink and smile', end: 1, hl: ['head'] },
    ],
    splashes: [{ t: 0.5, x: 300 }],
    pose: keys(G_STAND, [
      [0, { aN: [70, 90], aF: [65, 90] }],
      [0.28, { aN: [140, 70], aF: [65, 90] }],
      [0.42, { aN: [155, 30], aF: [65, 90], head: -6 }],
      [0.55, { head: 8, mouth: 0.6 }],
      [0.8, { aN: [18, 12], head: 6, mouth: 0.5 }],
      [1, { aF: [10, 10], head: 4, mouth: 0.3 }],
    ]),
  },

  // ── GLASS 2 — BUBBLE MAKER ──
  7: {
    duration: 5500,
    camera: CLOSE,
    phases: [
      { label: 'Breathe in', end: 0.2, hl: ['head'] },
      { label: 'Lips on the water', end: 0.4 },
      { label: 'Blow bubbles', end: 0.8, hl: ['head'] },
      { label: 'Breathe in again', end: 1 },
    ],
    pose: keys(G_STAND, [
      [0, { mouth: 0 }],
      [0.14, { head: 14, mouth: 1, aN: [30, 20], aF: [24, 18] }],
      [0.24, { head: 4, mouth: 0.2 }],
      [0.4, { angle: 24, y: STAND_Y + 16, head: -6, mouth: 0.4, lN: [20, -30], lF: [16, -28] }],
      [0.42, { bubbles: 1 }],
      [0.76, { bubbles: 1 }],
      [0.8, { bubbles: 0 }],
      [0.94, { angle: 0, y: STAND_Y + 12, head: 6, mouth: 0.5, lN: [2, 0], lF: [-3, 0] }],
      [1, { head: 3, mouth: 0 }],
    ]),
  },
  8: {
    duration: 4600,
    camera: CLOSE,
    phases: [
      { label: 'Breathe in', end: 0.2, hl: ['head'] },
      { label: 'Bubble, bubble, bubble', end: 0.75, hl: ['head'] },
      { label: 'Recover', end: 1 },
    ],
    pose: keys(G_STAND, [
      [0, {}],
      [0.14, { head: 12, mouth: 1 }],
      [0.22, { angle: 26, y: STAND_Y + 18, head: -6, mouth: 0.4, bubbles: 1 }],
      [0.7, { bubbles: 1 }],
      [0.75, { bubbles: 0 }],
      [0.92, { angle: 0, y: STAND_Y + 12, head: 6, mouth: 0.4 }],
      [1, { head: 3, mouth: 0 }],
    ]),
  },
  9: {
    duration: 5000,
    camera: SPLIT,
    phases: [
      { label: 'Breathe in', end: 0.2, hl: ['head'] },
      { label: 'Nose & mouth under', end: 0.45 },
      { label: 'Hum bubbles out', end: 0.8, hl: ['head'] },
      { label: 'Lift up', end: 1 },
    ],
    pose: keys(G_STAND, [
      [0, {}],
      [0.16, { head: 10, mouth: 1 }],
      [0.32, { angle: 34, y: STAND_Y + 26, head: -10, mouth: 0.3 }],
      [0.46, { bubbles: 1 }],
      [0.76, { bubbles: 1 }],
      [0.8, { bubbles: 0 }],
      [0.94, { angle: 0, y: STAND_Y + 12, head: 6, mouth: 0.4 }],
      [1, { head: 2, mouth: 0 }],
    ]),
  },
  10: {
    duration: 5200,
    camera: SPLIT,
    phases: [
      { label: 'Breathe in', end: 0.18, hl: ['head'] },
      { label: 'Whole face in', end: 0.4 },
      { label: 'Stay calm, bubbles', end: 0.78, hl: ['head'] },
      { label: 'Lift, blink, smile', end: 1 },
    ],
    pose: keys(G_STAND, [
      [0, {}],
      [0.14, { head: 10, mouth: 1 }],
      [0.34, { angle: 44, y: STAND_Y + 32, head: -14, mouth: 0.2 }],
      [0.42, { bubbles: 0.8 }],
      [0.74, { bubbles: 0.8 }],
      [0.78, { bubbles: 0 }],
      [0.94, { angle: 0, y: STAND_Y + 12, head: 8, mouth: 0.5 }],
      [1, { head: 3, mouth: 0.3 }],
    ]),
  },
  11: {
    duration: 6500,
    camera: WATER,
    phases: [
      { label: 'Instructor supports you', end: 0.22, hl: ['body'] },
      { label: 'Lean back slowly', end: 0.5, hl: ['head'] },
      { label: 'Float — ears in, tummy up', end: 0.82, hl: ['hips'] },
      { label: 'Recover with help', end: 1 },
    ],
    pose: keys(G_STAND, [
      [0, { aN: [60, 10], aF: [56, 10] }],
      [0.22, { aN: [90, 0], aF: [86, 0] }],
      [0.46, { angle: -40, y: STAND_Y, head: 16, lN: [10, -16], lF: [8, -14] }],
      [0.6, { ...G_SUPINE, angle: -88, aN: [150, 0], aF: [146, 0] }],
      [0.85, { angle: -30, y: STAND_Y + 8, head: -14, lN: [90, -100], lF: [86, -96], aN: [70, 20], aF: [66, 20] }],
      [1, { angle: 0, y: STAND_Y + 12, head: 2, lN: [2, 0], lF: [-3, 0] }],
    ]),
  },
  12: {
    duration: 4200,
    camera: CLOSE,
    phases: [
      { label: 'Hold the wall', end: 0.15, hl: ['arms'] },
      { label: 'Legs float up', end: 0.35, hl: ['hips'] },
      { label: 'Kick, kick, kick', end: 1, hl: ['legs'] },
    ],
    pose: (t) => {
      const grip = smooth(clamp(t / 0.32));
      const base = { ...G_PRONE, x: 200, aN: [178, 0] as [number, number], aF: [182, 0] as [number, number] };
      return { ...base, y: lerp(STAND_Y + 12, FLOAT_Y + 20, grip), angle: lerp(0, 90, grip), ...flutter(t, 3, 10), bubbles: 0.2 };
    },
  },

  // ── GLASS 3 — FEARLESS JUMPER ──
  13: {
    duration: 6000,
    camera: SPLIT,
    phases: [
      { label: 'Breathe in', end: 0.18, hl: ['head'] },
      { label: 'Bend knees, head under', end: 0.45, hl: ['legs'] },
      { label: 'Blow bubbles', end: 0.75, hl: ['head'] },
      { label: 'Stand up slowly', end: 1 },
    ],
    pose: keys(G_STAND, [
      [0, {}],
      [0.14, { head: 10, mouth: 1 }],
      [0.4, { angle: 20, y: STAND_Y + 46, head: -8, mouth: 0, lN: [40, -70], lF: [36, -66] }],
      [0.44, { bubbles: 1 }],
      [0.72, { bubbles: 1 }],
      [0.76, { bubbles: 0 }],
      [0.94, { angle: 0, y: STAND_Y + 12, head: 6, lN: [2, 0], lF: [-3, 0], mouth: 0.4 }],
      [1, { head: 2, mouth: 0 }],
    ]),
  },
  14: {
    duration: 6200,
    camera: SPLIT,
    phases: [
      { label: 'Go under with bubbles', end: 0.3, hl: ['head'] },
      { label: 'Open your eyes', end: 0.6, hl: ['head'] },
      { label: 'Look around', end: 0.85 },
      { label: 'Come up and blink', end: 1 },
    ],
    pose: keys(G_STAND, [
      [0, {}],
      [0.14, { head: 8, mouth: 0.8 }],
      [0.28, { angle: 22, y: STAND_Y + 40, head: -6, mouth: 0, bubbles: 0.8, roll: 0 }],
      [0.55, { bubbles: 0.1, roll: 0.7 }],
      [0.82, { roll: 0.7 }],
      [0.94, { angle: 0, y: STAND_Y + 12, head: 6, roll: 0, mouth: 0.4 }],
      [1, { head: 2, mouth: 0 }],
    ]),
  },
  15: {
    duration: 6500,
    camera: SPLIT,
    phases: [
      { label: 'Breathe in', end: 0.16, hl: ['head'] },
      { label: 'Go fully under', end: 0.4 },
      { label: 'Calm pause', end: 0.7 },
      { label: 'Push up and stand', end: 1, hl: ['legs'] },
    ],
    pose: keys(G_STAND, [
      [0, {}],
      [0.14, { head: 10, mouth: 1 }],
      [0.36, { angle: 30, y: STAND_Y + 52, head: -10, mouth: 0, bubbles: 0.6 }],
      [0.42, { bubbles: 0.15 }],
      [0.68, { bubbles: 0.15 }],
      [0.78, { bubbles: 0.5, angle: 26, y: STAND_Y + 44 }],
      [0.95, { angle: 0, y: STAND_Y + 12, head: 6, lN: [2, 0], lF: [-3, 0], bubbles: 0, mouth: 0.4 }],
      [1, { head: 2, mouth: 0 }],
    ]),
  },
  16: {
    duration: 6000,
    camera: WATER,
    phases: [
      { label: 'Sit and wait for the signal', end: 0.3 },
      { label: 'Check the water', end: 0.45, hl: ['head'] },
      { label: 'Lower yourself in', end: 0.8, hl: ['arms'] },
      { label: 'Thumbs up!', end: 1 },
    ],
    pose: keys({ ...STAND, x: 165, y: 195, facing: -1, aN: [90, 10], aF: [86, 10], lN: [70, -20], lF: [66, -18] }, [
      [0, {}],
      [0.3, { head: -10 }],
      [0.5, { x: 215, y: 220, angle: -6, aN: [50, 20], aF: [46, 20], lN: [30, -30], lF: [26, -28] }],
      [0.75, { x: 250, y: STAND_Y + 12, angle: 0, aN: [70, 20], aF: [66, 20], lN: [2, 0], lF: [-3, 0] }],
      [0.9, { aN: [-30, 20], aF: [60, 20] }],
      [1, { aN: [18, 12], aF: [10, 10] }],
    ]),
  },
  17: {
    duration: 6200,
    camera: { name: 'Jump view', z: 1.25, cx: 250, cy: 210 },
    phases: [
      { label: 'Toes over the edge', end: 0.25 },
      { label: 'Wait for “jump!”', end: 0.4 },
      { label: 'Jump — feet first', end: 0.65, hl: ['legs'] },
      { label: 'Splash & surface', end: 1 },
    ],
    splashes: [{ t: 0.62, x: 250 }],
    pose: keys({ ...STAND, x: 150, y: 150, facing: -1 }, [
      [0, {}],
      [0.25, { aN: [40, 10], aF: [35, 10] }],
      [0.4, { y: 142, aN: [60, 10], aF: [55, 10] }],
      [0.5, { x: 200, y: 110, angle: -10, aN: [110, 10], aF: [105, 10], lN: [10, -10], lF: [6, -8] }],
      [0.62, { x: 250, y: 230, angle: 0, aN: [130, 10], aF: [126, 10], lN: [4, -4], lF: [-2, -2], bubbles: 0.6 }],
      [0.78, { y: 254, bubbles: 0.6 }],
      [0.94, { y: STAND_Y + 12, angle: 0, aN: [40, 15], aF: [35, 15], lN: [2, 0], lF: [-3, 0], bubbles: 0 }],
      [1, { aN: [18, 12], aF: [10, 10] }],
    ]),
  },
  18: {
    duration: 5000,
    camera: WATER,
    phases: [
      { label: 'Get support', end: 0.15, hl: ['arms'] },
      { label: 'Stretch out long', end: 0.35, hl: ['body'] },
      { label: 'Kick, kick, kick', end: 0.85, hl: ['legs'] },
      { label: 'Arrive!', end: 1 },
    ],
    pose: (t) => {
      const k = smooth(clamp(t / 0.32));
      const travel = clamp((t - 0.35) / 0.6);
      return { ...G_PRONE, x: lerp(230, 380, travel), y: lerp(STAND_Y + 12, FLOAT_Y + 18, k), angle: lerp(0, 90, k), aN: [178, 0], aF: [182, 0], ...flutter(t, 4, 11), bubbles: 0.25 };
    },
  },
};

export const getGlassAnim = (id: number) => GLASS_ANIMS[id];

export function glassPhaseAt(anim: GlassAnim, t: number) {
  const i = anim.phases.findIndex((p) => t < p.end);
  return i === -1 ? anim.phases.length - 1 : i;
}
export function glassPhaseStart(anim: GlassAnim, i: number) {
  return i === 0 ? 0 : anim.phases[i - 1].end;
}

export type { Part };
