// ───────────────────────────────────────────────────────────
// Aqua Slash — Pool animation engine
// One swimmer model, one pool, 18 skill-specific animations.
// ───────────────────────────────────────────────────────────

export const SURFACE = 210;
export const SHALLOW_FLOOR = 322;
export const DEEP_FLOOR = 470;
export const WALL_X = 90;

export type Part = 'head' | 'arms' | 'armN' | 'armF' | 'body' | 'hips' | 'legs' | 'legN' | 'legF';
export type GuideKind = 'none' | 'align' | 'streamline' | 'kick' | 'backkick' | 'arm' | 'breath' | 'coord' | 'backarm';

export interface Pose {
  x: number;
  y: number;
  angle: number; // 0 upright, 90 prone (head right), -90 supine (head left)
  facing: number; // 1 or -1 (mirror)
  head: number; // chin lift in degrees
  roll: number; // 0 profile .. 1 face turned to viewer (breathing)
  mouth: number; // 0..1 mouth open
  aN: [number, number];
  aF: [number, number];
  lN: [number, number];
  lF: [number, number];
  bubbles: number; // emission 0..1
  scroll: number; // background travel offset
  alpha: number;
}

export interface Phase {
  label: string;
  end: number; // fraction of the loop
  hl?: Part[];
}

export interface Camera {
  name: string;
  z: number;
  cx: number;
  cy: number;
  split?: boolean;
}

export interface SkillAnim {
  duration: number;
  camera: Camera;
  phases: Phase[];
  guide: GuideKind;
  pose: (t: number) => Pose;
  splashes?: { t: number; x: number }[];
  showTrail?: boolean;
}

// ── math helpers ──────────────────────────────────────────
export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const smooth = (k: number) => k * k * (3 - 2 * k);
export const TAU = Math.PI * 2;
const frac = (v: number) => v - Math.floor(v);
const segK = (t: number, a: number, b: number) => smooth(clamp((t - a) / (b - a)));

export function lerpPose(a: Pose, b: Pose, k: number): Pose {
  const l2 = (p: [number, number], q: [number, number]): [number, number] => [lerp(p[0], q[0], k), lerp(p[1], q[1], k)];
  return {
    x: lerp(a.x, b.x, k),
    y: lerp(a.y, b.y, k),
    angle: lerp(a.angle, b.angle, k),
    facing: k < 0.5 ? a.facing : b.facing,
    head: lerp(a.head, b.head, k),
    roll: lerp(a.roll, b.roll, k),
    mouth: lerp(a.mouth, b.mouth, k),
    aN: l2(a.aN, b.aN),
    aF: l2(a.aF, b.aF),
    lN: l2(a.lN, b.lN),
    lF: l2(a.lF, b.lF),
    bubbles: lerp(a.bubbles, b.bubbles, k),
    scroll: lerp(a.scroll, b.scroll, k),
    alpha: lerp(a.alpha, b.alpha, k),
  };
}

export type Key = [number, Partial<Pose>];

/** Keyframe interpolation. Each key merges onto the previous full pose. */
export function keys(base: Pose, list: Key[]) {
  const full: [number, Pose][] = [];
  let prev = base;
  for (const [t, p] of list) {
    prev = { ...prev, ...p };
    full.push([t, prev]);
  }
  return (t: number): Pose => {
    if (t <= full[0][0]) return full[0][1];
    for (let i = 0; i < full.length - 1; i++) {
      const [t0, p0] = full[i];
      const [t1, p1] = full[i + 1];
      if (t >= t0 && t <= t1) return lerpPose(p0, p1, smooth((t - t0) / (t1 - t0 || 1)));
    }
    return full[full.length - 1][1];
  };
}

// ── base poses ────────────────────────────────────────────
export const STAND_Y = 238;
export const FLOAT_Y = 216;

export const STAND: Pose = {
  x: 250,
  y: STAND_Y,
  angle: 0,
  facing: 1,
  head: 0,
  roll: 0,
  mouth: 0,
  aN: [18, 12],
  aF: [10, 10],
  lN: [2, 0],
  lF: [-3, 0],
  bubbles: 0,
  scroll: 0,
  alpha: 1,
};

export const PRONE: Pose = {
  ...STAND,
  x: 520,
  y: FLOAT_Y,
  angle: 90,
  head: 0,
  aN: [178, 0],
  aF: [182, 0],
  lN: [0, 0],
  lF: [0, 0],
};

export const SUPINE: Pose = {
  ...STAND,
  x: 520,
  y: FLOAT_Y - 2,
  angle: -88,
  head: 12,
  aN: [8, 0],
  aF: [4, 0],
  lN: [0, 0],
  lF: [0, 0],
};

// ── movement generators ───────────────────────────────────
/** Flutter kick: near/far legs alternate. `n` kicks per leg per loop. */
export function flutter(t: number, n: number, amp = 14): { lN: [number, number]; lF: [number, number] } {
  const p = TAU * n * t;
  const a = -Math.cos(p) * amp;
  const b = Math.cos(p) * amp;
  const kn = -5 - 9 * (0.5 + 0.5 * Math.sin(p));
  const kf = -5 - 9 * (0.5 - 0.5 * Math.sin(p));
  return { lN: [a, kn], lF: [b, kf] };
}

/** Freestyle arm cycle. p ∈ [0,1). entry → extension → pull → recovery */
export function freeArm(p: number): [number, number] {
  p = frac(p);
  if (p < 0.12) return [lerp(205, 180, smooth(p / 0.12)), 0]; // entry
  if (p < 0.28) return [180, 0]; // extension
  if (p < 0.6) {
    const k = (p - 0.28) / 0.32; // pull
    return [lerp(180, 2, smooth(k)), -38 * Math.sin(Math.PI * k)];
  }
  const k = (p - 0.6) / 0.4; // recovery over the water
  return [lerp(2, -155, smooth(k)), -85 * Math.sin(Math.PI * clamp(k * 1.1))];
}

/** Backstroke arm cycle. p ∈ [0,1). recovery → entry → underwater */
export function backArm(p: number): [number, number] {
  p = frac(p);
  if (p < 0.36) return [lerp(4, 165, smooth(p / 0.36)), 0];
  if (p < 0.52) return [lerp(165, 192, smooth((p - 0.36) / 0.16)), 0];
  const k = (p - 0.52) / 0.48;
  return [lerp(192, 364, smooth(k)), 42 * Math.sin(Math.PI * k)];
}

// ── the 18 animations ─────────────────────────────────────
const SIDE: Camera = { name: 'Side underwater view', z: 1.35, cx: 560, cy: 250 };
const CLOSE_SIDE: Camera = { name: 'Close side underwater view', z: 1.6, cx: 560, cy: 240 };
const POOLSIDE: Camera = { name: 'Pool-side view', z: 1.5, cx: 220, cy: 225 };
const SPLIT: Camera = { name: 'Above / underwater split view', z: 1.9, cx: 250, cy: SURFACE, split: true };

export const ANIMS: Record<number, SkillAnim> = {
  // 1 — Water Entry & Confidence
  1: {
    duration: 7000,
    camera: POOLSIDE,
    guide: 'none',
    phases: [
      { label: 'Pool edge', end: 0.22, hl: ['body'] },
      { label: 'Hold the edge', end: 0.38, hl: ['arms'] },
      { label: 'Controlled entry', end: 0.58, hl: ['legs'] },
      { label: 'Standing comfortably', end: 1, hl: [] },
    ],
    splashes: [{ t: 0.47, x: 118 }],
    pose: keys(STAND, [
      [0, { x: 62, y: 164, angle: 0, aN: [-25, 0], aF: [-20, 0], lN: [90, -88], lF: [86, -84] }],
      [0.2, { x: 62, y: 164, aN: [-25, 0], aF: [-20, 0], lN: [90, -95], lF: [86, -90] }],
      [0.36, { x: 72, y: 172, angle: 8, aN: [-10, 0], aF: [-6, 0], lN: [70, -70], lF: [66, -66] }],
      [0.5, { x: 118, y: 218, angle: -6, aN: [130, 40], aF: [125, 40], lN: [10, -10], lF: [6, -8] }],
      [0.6, { x: 150, y: STAND_Y, angle: 0, aN: [100, 20], aF: [96, 20], lN: [2, 0], lF: [-3, 0] }],
      [0.75, { x: 200, y: STAND_Y + 2, aN: [40, 20], aF: [34, 16] }],
      [0.88, { x: 220, y: STAND_Y, aN: [20, 12], aF: [14, 10] }],
      [1, { x: 220, y: STAND_Y + 1, aN: [22, 12], aF: [12, 10] }],
    ]),
  },

  // 2 — Breath Control & Bubbles
  2: {
    duration: 6000,
    camera: { name: 'Above / underwater split view', z: 1.9, cx: 270, cy: 215, split: true },
    guide: 'breath',
    phases: [
      { label: 'Inhale', end: 0.2, hl: ['head'] },
      { label: 'Face near water', end: 0.35, hl: ['head'] },
      { label: 'Exhale — bubbles', end: 0.72, hl: ['head'] },
      { label: 'Recover', end: 1, hl: [] },
    ],
    pose: keys(STAND, [
      [0, { x: 250, head: 0, mouth: 0 }],
      [0.12, { head: 14, mouth: 1, y: STAND_Y - 2, aN: [30, 20], aF: [24, 18] }],
      [0.2, { head: 8, mouth: 0.2 }],
      [0.34, { angle: 36, y: STAND_Y + 6, head: -8, mouth: 0, lN: [30, -40], lF: [26, -38], aN: [60, 30], aF: [55, 28] }],
      [0.38, { angle: 40, y: STAND_Y + 8, head: -10, bubbles: 1, mouth: 0.5 }],
      [0.68, { angle: 40, y: STAND_Y + 8, head: -10, bubbles: 1, mouth: 0.5 }],
      [0.72, { bubbles: 0, mouth: 0.2 }],
      [0.88, { angle: 0, y: STAND_Y, head: 6, mouth: 0.6, lN: [2, 0], lF: [-3, 0], aN: [22, 12], aF: [12, 10] }],
      [1, { head: 0, mouth: 0 }],
    ]),
  },

  // 3 — Submersion & Face Control
  3: {
    duration: 7000,
    camera: SPLIT,
    guide: 'breath',
    phases: [
      { label: 'Face above water', end: 0.22, hl: ['head'] },
      { label: 'Face enters water', end: 0.42, hl: ['head', 'legs'] },
      { label: 'Bubbles', end: 0.68, hl: ['head'] },
      { label: 'Return to surface', end: 1, hl: [] },
    ],
    pose: keys({ ...STAND, aN: [120, 30], aF: [115, 28] }, [
      [0, { x: 250, mouth: 0 }],
      [0.14, { head: 12, mouth: 1 }],
      [0.22, { head: 0, mouth: 0 }],
      [0.4, { y: 276, angle: 10, head: -12, lN: [72, -130], lF: [68, -126], aN: [100, 20], aF: [96, 20] }],
      [0.44, { bubbles: 1, mouth: 0.4 }],
      [0.66, { bubbles: 1 }],
      [0.7, { bubbles: 0, mouth: 0 }],
      [0.86, { y: STAND_Y, angle: 0, head: 4, mouth: 0.5, lN: [2, 0], lF: [-3, 0], aN: [120, 30], aF: [115, 28] }],
      [1, { head: 0, mouth: 0 }],
    ]),
  },

  // 4 — Front Float & Recovery
  4: {
    duration: 8000,
    camera: { name: 'Side underwater view', z: 1.45, cx: 300, cy: 240 },
    guide: 'align',
    phases: [
      { label: 'Standing', end: 0.14 },
      { label: 'Extend body', end: 0.3, hl: ['arms'] },
      { label: 'Front float', end: 0.5, hl: ['head', 'body', 'hips', 'legs'] },
      { label: 'Control', end: 0.66, hl: ['body'] },
      { label: 'Recover', end: 1, hl: ['legs'] },
    ],
    pose: keys({ ...STAND, x: 230 }, [
      [0, { head: 0 }],
      [0.1, { head: 10, mouth: 1 }],
      [0.18, { angle: 35, y: STAND_Y + 2, head: -5, mouth: 0, aN: [150, 0], aF: [146, 0], lN: [10, -10], lF: [0, -5] }],
      [0.32, { angle: 88, y: FLOAT_Y + 2, x: 250, head: -4, aN: [176, 0], aF: [180, 0], lN: [0, 0], lF: [-2, 0] }],
      [0.5, { x: 262, y: FLOAT_Y, bubbles: 0.35 }],
      [0.64, { x: 270, y: FLOAT_Y + 1, bubbles: 0.35 }],
      [0.76, { angle: 35, y: 238, x: 275, head: 10, bubbles: 0, lN: [100, -125], lF: [96, -120], aN: [70, 10], aF: [66, 10] }],
      [0.9, { angle: 0, y: STAND_Y, x: 275, head: 4, lN: [2, 0], lF: [-3, 0], aN: [30, 12], aF: [22, 10] }],
      [1, { head: 0 }],
    ]),
  },

  // 5 — Back Float & Recovery
  5: {
    duration: 8000,
    camera: { name: 'Side underwater view', z: 1.45, cx: 250, cy: 240 },
    guide: 'align',
    phases: [
      { label: 'Lean back', end: 0.28, hl: ['head'] },
      { label: 'Back float', end: 0.48, hl: ['head', 'hips'] },
      { label: 'Balance', end: 0.68, hl: ['body', 'hips', 'legs'] },
      { label: 'Recover', end: 1, hl: ['legs'] },
    ],
    pose: keys({ ...STAND, x: 290 }, [
      [0, {}],
      [0.1, { aN: [60, 10], aF: [56, 10] }],
      [0.28, { angle: -45, y: STAND_Y - 4, head: 18, aN: [110, 0], aF: [104, 0], lN: [10, -20], lF: [8, -18] }],
      [0.42, { angle: -88, y: FLOAT_Y - 2, x: 280, head: 12, aN: [166, 0], aF: [162, 0], lN: [0, 0], lF: [-2, 0] }],
      [0.68, { angle: -90, x: 272, y: FLOAT_Y - 1 }],
      [0.8, { angle: -30, y: 244, x: 266, head: -18, lN: [100, -115], lF: [96, -110], aN: [80, 30], aF: [76, 30] }],
      [0.92, { angle: 0, y: STAND_Y, head: 0, lN: [2, 0], lF: [-3, 0], aN: [22, 12], aF: [12, 10] }],
      [1, {}],
    ]),
  },

  // 6 — Front & Back Glide
  6: {
    duration: 10000,
    camera: { name: 'Pool-side wide view', z: 1.15, cx: 330, cy: 250 },
    guide: 'none',
    phases: [
      { label: 'Push', end: 0.14, hl: ['legs'] },
      { label: 'Streamline', end: 0.2, hl: ['arms', 'body'] },
      { label: 'Front glide', end: 0.38, hl: ['body'] },
      { label: 'Controlled stop', end: 0.5, hl: ['legs'] },
      { label: 'Back glide — push', end: 0.62, hl: ['legs'] },
      { label: 'Back glide', end: 0.86, hl: ['body', 'hips'] },
      { label: 'Controlled stop', end: 1, hl: ['legs'] },
    ],
    pose: keys({ ...STAND, x: 120 }, [
      [0, { x: 118, alpha: 0 }],
      [0.03, { alpha: 1 }],
      [0.08, { angle: 40, y: STAND_Y + 4, head: -6, aN: [170, 0], aF: [166, 0], lN: [-20, -60], lF: [10, -30] }],
      [0.14, { angle: 88, x: 150, y: FLOAT_Y + 6, head: -6, aN: [180, 0], aF: [180, 0], lN: [0, 0], lF: [0, 0] }],
      [0.38, { x: 430, y: FLOAT_Y + 4 }],
      [0.47, { angle: 0, x: 450, y: STAND_Y, head: 4, aN: [40, 20], aF: [30, 15], lN: [2, 0], lF: [-3, 0], alpha: 1 }],
      [0.5, { alpha: 0 }],
      [0.505, { x: 140, facing: -1, angle: 0, aN: [120, 30], aF: [116, 30], alpha: 0 }],
      [0.54, { alpha: 1 }],
      [0.6, { angle: 45, y: STAND_Y - 4, head: 16, lN: [70, -110], lF: [66, -100] }],
      [0.64, { angle: 88, x: 170, y: FLOAT_Y - 2, head: 12, aN: [8, 0], aF: [4, 0], lN: [0, 0], lF: [0, 0] }],
      [0.86, { x: 420, y: FLOAT_Y - 1 }],
      [0.96, { angle: 0, x: 440, y: STAND_Y, head: 0, lN: [2, 0], lF: [-3, 0], aN: [22, 12], aF: [12, 10] }],
      [1, { alpha: 0 }],
    ]),
  },

  // 7 — Streamline Position
  7: {
    duration: 8000,
    camera: CLOSE_SIDE,
    guide: 'streamline',
    phases: [
      { label: 'Arms', end: 0.22, hl: ['arms'] },
      { label: 'Head', end: 0.4, hl: ['head'] },
      { label: 'Body', end: 0.56, hl: ['body'] },
      { label: 'Hips', end: 0.72, hl: ['hips'] },
      { label: 'Legs', end: 1, hl: ['legs'] },
    ],
    pose: (t) => {
      const base = keys({ ...PRONE, x: 540, y: 238 }, [
        [0, { aN: [60, 30], aF: [50, 30], head: 10, lN: [12, -20], lF: [-10, -10], angle: 80 }],
        [0.2, { aN: [178, 0], aF: [182, 0], head: 8, angle: 82 }],
        [0.38, { head: -6, angle: 84 }],
        [0.55, { angle: 88 }],
        [0.7, { angle: 90 }],
        [0.86, { lN: [0, 0], lF: [0, 0] }],
        [1, {}],
      ])(t);
      return { ...base, scroll: t * 160, y: base.y + Math.sin(t * TAU) * 1.5 };
    },
  },

  // 8 — Front Flutter Kick
  8: {
    duration: 4000,
    camera: CLOSE_SIDE,
    guide: 'kick',
    phases: [
      { label: 'Left kick', end: 0.25, hl: ['legN'] },
      { label: 'Right kick', end: 0.5, hl: ['legF'] },
      { label: 'Left', end: 0.75, hl: ['legN'] },
      { label: 'Right', end: 1, hl: ['legF'] },
    ],
    pose: (t) => ({ ...PRONE, x: 540, y: FLOAT_Y + 2, ...flutter(t, 2), scroll: t * 240, bubbles: 0.25 }),
  },

  // 9 — Back Flutter Kick
  9: {
    duration: 4000,
    camera: CLOSE_SIDE,
    guide: 'backkick',
    phases: [
      { label: 'Left kick', end: 0.25, hl: ['legN', 'hips'] },
      { label: 'Right kick', end: 0.5, hl: ['legF', 'hips'] },
      { label: 'Left', end: 0.75, hl: ['legN', 'hips'] },
      { label: 'Right', end: 1, hl: ['legF', 'hips'] },
    ],
    pose: (t) => ({ ...SUPINE, x: 580, ...flutter(t, 2), scroll: -t * 240 }),
  },

  // 10 — Kick + Glide
  10: {
    duration: 9000,
    camera: { name: 'Pool-side wide view', z: 1.05, cx: 480, cy: 260 },
    guide: 'none',
    phases: [
      { label: 'Push', end: 0.13, hl: ['legs'] },
      { label: 'Glide', end: 0.36, hl: ['arms', 'body'] },
      { label: 'Kick', end: 0.66, hl: ['legs'] },
      { label: 'Continue', end: 1, hl: ['legs'] },
    ],
    pose: (t) => {
      const base = keys({ ...STAND, x: 120 }, [
        [0, { alpha: 0 }],
        [0.03, { alpha: 1 }],
        [0.08, { angle: 40, y: STAND_Y + 4, head: -6, aN: [170, 0], aF: [166, 0], lN: [-20, -60], lF: [10, -30] }],
        [0.13, { angle: 88, x: 160, y: FLOAT_Y + 6, head: -4, aN: [180, 0], aF: [180, 0], lN: [0, 0], lF: [0, 0] }],
        [0.36, { x: 380, y: FLOAT_Y + 3 }],
        [0.93, { x: 830, y: FLOAT_Y + 2, alpha: 1 }],
        [1, { x: 880, alpha: 0 }],
      ])(t);
      // linear travel through the kick phase
      if (t > 0.36) {
        const k = clamp((t - 0.36) / 0.64);
        base.x = lerp(380, 880, k);
        const kick = flutter(t, 18, lerp(4, 14, clamp((t - 0.36) / 0.06)));
        base.lN = kick.lN;
        base.lF = kick.lF;
        base.bubbles = 0.2;
      }
      return base;
    },
  },

  // 11 — Breathing While Moving
  11: {
    duration: 5000,
    camera: { name: 'Side underwater view', z: 1.7, cx: 570, cy: 225 },
    guide: 'breath',
    phases: [
      { label: 'Move', end: 0.3, hl: ['legs'] },
      { label: 'Breath', end: 0.48, hl: ['head'] },
      { label: 'Return', end: 0.58, hl: ['head'] },
      { label: 'Exhale', end: 1, hl: ['head', 'legs'] },
    ],
    pose: (t) => {
      const up = segK(t, 0.3, 0.38) * (1 - segK(t, 0.5, 0.58));
      return {
        ...PRONE,
        x: 540,
        ...flutter(t, 4),
        head: up * 22,
        roll: up * 0.75,
        mouth: up * (t > 0.36 && t < 0.5 ? 1 : 0.3),
        y: FLOAT_Y + 2 - up * 3,
        bubbles: t > 0.6 ? 1 : 0.1,
        scroll: t * 240,
      };
    },
  },

  // 12 — Body Coordination (Level 2 hero)
  12: {
    duration: 6000,
    camera: SIDE,
    guide: 'coord',
    phases: [
      { label: 'Body position', end: 0.25, hl: ['body', 'hips'] },
      { label: 'Kick', end: 0.45, hl: ['legs'] },
      { label: 'Breathing', end: 0.65, hl: ['head'] },
      { label: 'Movement', end: 1, hl: ['head', 'body', 'hips', 'legs'] },
    ],
    pose: (t) => {
      const up = segK(t, 0.47, 0.53) * (1 - segK(t, 0.6, 0.66));
      return {
        ...PRONE,
        x: 560,
        ...flutter(t, 6),
        head: up * 20,
        roll: up * 0.8,
        mouth: up,
        bubbles: t > 0.66 || t < 0.4 ? 0.6 : 0.1,
        scroll: t * 480,
      };
    },
  },

  // 13 — Freestyle Arm Action
  13: {
    duration: 5200,
    camera: { name: 'Side underwater view', z: 1.6, cx: 560, cy: 225 },
    guide: 'arm',
    showTrail: true,
    phases: [
      { label: 'Entry', end: 0.12, hl: ['armN'] },
      { label: 'Extension', end: 0.28, hl: ['armN'] },
      { label: 'Pull', end: 0.6, hl: ['armN'] },
      { label: 'Recovery', end: 0.92, hl: ['armN'] },
      { label: 'Entry', end: 1, hl: ['armN'] },
    ],
    pose: (t) => ({ ...PRONE, x: 540, aN: freeArm(t), aF: [180, 0], ...flutter(t, 3, 8), bubbles: 0.35, scroll: t * 160 }),
  },

  // 14 — Freestyle Kick + Arms
  14: {
    duration: 3600,
    camera: SIDE,
    guide: 'coord',
    showTrail: true,
    phases: [
      { label: 'Body position', end: 0.33, hl: ['body', 'hips'] },
      { label: 'Flutter kick', end: 0.66, hl: ['legs'] },
      { label: 'Arm action', end: 1, hl: ['arms'] },
    ],
    pose: (t) => ({ ...PRONE, x: 560, aN: freeArm(t), aF: freeArm(t + 0.5), ...flutter(t, 3), bubbles: 0.5, scroll: t * 480 }),
  },

  // 15 — Freestyle Breathing
  15: {
    duration: 4200,
    camera: { name: 'Above / underwater split view', z: 1.9, cx: 580, cy: SURFACE, split: true },
    guide: 'breath',
    phases: [
      { label: 'Swim', end: 0.3, hl: ['arms'] },
      { label: 'Rotate', end: 0.42, hl: ['head'] },
      { label: 'Breath', end: 0.55, hl: ['head'] },
      { label: 'Return', end: 0.67, hl: ['head'] },
      { label: 'Swim', end: 1, hl: ['arms'] },
    ],
    pose: (t) => {
      const r = segK(t, 0.3, 0.42) * (1 - segK(t, 0.55, 0.67));
      return {
        ...PRONE,
        x: 560,
        aN: freeArm(t + 0.25),
        aF: freeArm(t + 0.75),
        ...flutter(t, 3),
        roll: r,
        head: r * 6,
        mouth: t > 0.42 && t < 0.55 ? 1 : 0,
        bubbles: t > 0.67 || t < 0.28 ? 0.9 : 0,
        scroll: t * 320,
      };
    },
  },

  // 16 — Freestyle Coordination
  16: {
    duration: 3400,
    camera: SIDE,
    guide: 'coord',
    showTrail: true,
    phases: [
      { label: 'Arm action', end: 0.28, hl: ['arms'] },
      { label: 'Breathing', end: 0.62, hl: ['head'] },
      { label: 'Flutter kick', end: 0.82, hl: ['legs'] },
      { label: 'Body position', end: 1, hl: ['body', 'hips'] },
    ],
    pose: (t) => {
      const r = segK(t, 0.3, 0.4) * (1 - segK(t, 0.54, 0.64));
      return {
        ...PRONE,
        x: 560,
        aN: freeArm(t + 0.25),
        aF: freeArm(t + 0.75),
        ...flutter(t, 3),
        roll: r,
        head: r * 5,
        mouth: t > 0.4 && t < 0.54 ? 1 : 0,
        bubbles: t > 0.66 || t < 0.26 ? 0.9 : 0,
        scroll: t * 480,
      };
    },
  },

  // 17 — Backstroke Arm Action
  17: {
    duration: 7000,
    camera: { name: 'Side underwater view', z: 1.55, cx: 560, cy: 220 },
    guide: 'backarm',
    showTrail: true,
    phases: [
      { label: 'Arm recovery', end: 0.18, hl: ['armN'] },
      { label: 'Entry', end: 0.26, hl: ['armN'] },
      { label: 'Underwater movement', end: 0.5, hl: ['armN'] },
      { label: 'Other arm', end: 1, hl: ['armF'] },
    ],
    pose: (t) => ({
      ...SUPINE,
      x: 580,
      aN: t < 0.5 ? backArm(t / 0.5) : [4, 0],
      aF: t >= 0.5 ? backArm((t - 0.5) / 0.5) : [4, 0],
      ...flutter(t, 6, 10),
      scroll: -t * 240,
    }),
  },

  // 18 — Backstroke Coordination (final)
  18: {
    duration: 3800,
    camera: SIDE,
    guide: 'coord',
    showTrail: true,
    phases: [
      { label: 'Backstroke arms', end: 0.3, hl: ['arms'] },
      { label: 'Back kick', end: 0.55, hl: ['legs'] },
      { label: 'Body position', end: 0.78, hl: ['head', 'body', 'hips'] },
      { label: 'Rhythm', end: 1, hl: ['arms', 'legs'] },
    ],
    pose: (t) => ({ ...SUPINE, x: 600, aN: backArm(t), aF: backArm(t + 0.5), ...flutter(t, 3), scroll: -t * 480 }),
  },
};

export const getAnim = (id: number) => ANIMS[id];

export function phaseAt(anim: SkillAnim, t: number) {
  const i = anim.phases.findIndex((p) => t < p.end);
  return i === -1 ? anim.phases.length - 1 : i;
}

export function phaseStart(anim: SkillAnim, i: number) {
  return i === 0 ? 0 : anim.phases[i - 1].end;
}

// ── forward kinematics (for guides, bubbles, trails) ──────
export const BODY = {
  shoulder: [0, -27] as const,
  hip: [0, 24] as const,
  head: [2, -47] as const,
  headR: 13,
  upperArm: 25,
  foreArm: 23,
  thigh: 30,
  shin: 28,
};

export function toWorld(p: Pose, lx: number, ly: number) {
  const a = (p.angle * Math.PI) / 180;
  const x = lx * p.facing;
  return { x: p.x + x * Math.cos(a) - ly * Math.sin(a), y: p.y + x * Math.sin(a) + ly * Math.cos(a) };
}

function limbEnd(origin: readonly [number, number], a1: number, a2: number, l1: number, l2: number) {
  const r1 = (a1 * Math.PI) / 180;
  const r2 = ((a1 + a2) * Math.PI) / 180;
  const jx = origin[0] + Math.sin(r1) * l1;
  const jy = origin[1] + Math.cos(r1) * l1;
  return { joint: [jx, jy] as const, end: [jx + Math.sin(r2) * l2, jy + Math.cos(r2) * l2] as const };
}

export function landmarks(p: Pose) {
  const hN = limbEnd(BODY.shoulder, p.aN[0], p.aN[1], BODY.upperArm, BODY.foreArm);
  const hF = limbEnd(BODY.shoulder, p.aF[0], p.aF[1], BODY.upperArm, BODY.foreArm);
  const fN = limbEnd(BODY.hip, p.lN[0], p.lN[1], BODY.thigh, BODY.shin + 6);
  const fF = limbEnd(BODY.hip, p.lF[0], p.lF[1], BODY.thigh, BODY.shin + 6);
  const hr = (-p.head * Math.PI) / 180;
  const mx = lerp(10, 3, p.roll);
  const my = 6;
  const mouthLocal = [BODY.head[0] + mx * Math.cos(hr) - my * Math.sin(hr), BODY.head[1] + mx * Math.sin(hr) + my * Math.cos(hr)];
  return {
    head: toWorld(p, BODY.head[0], BODY.head[1]),
    mouth: toWorld(p, mouthLocal[0], mouthLocal[1]),
    shoulder: toWorld(p, BODY.shoulder[0], BODY.shoulder[1]),
    chest: toWorld(p, 0, -4),
    hip: toWorld(p, BODY.hip[0], BODY.hip[1]),
    handN: toWorld(p, hN.end[0], hN.end[1]),
    handF: toWorld(p, hF.end[0], hF.end[1]),
    kneeN: toWorld(p, fN.joint[0], fN.joint[1]),
    kneeF: toWorld(p, fF.joint[0], fF.joint[1]),
    footN: toWorld(p, fN.end[0], fN.end[1]),
    footF: toWorld(p, fF.end[0], fF.end[1]),
  };
}
