// ───────────────────────────────────────────────────────────
// Aqua Slash — Pond Stage Animations
// Kinematic animations for all 18 Pond skills.
// Reuses the core kinematic swimmer model (Swimmer.tsx) and keyframe interpolator.
// ───────────────────────────────────────────────────────────

import {
  FLOAT_Y,
  PRONE,
  STAND,
  STAND_Y,
  SUPINE,
  SURFACE,
  clamp,
  flutter,
  keys,
  lerp,
  smooth,
  type Camera,
  type GuideKind,
  type Part,
  type Phase,
  type Pose,
} from '../pool/animations';

export const POND_SURFACE = SURFACE;
export const POND_FLOOR = 390;
export const POND_WALL_X = 90;

export interface PondAnim {
  duration: number;
  camera: Camera;
  phases: Phase[];
  guide: GuideKind;
  pose: (t: number) => Pose;
  splashes?: { t: number; x: number; big?: boolean }[];
}

const FULL_LANE: Camera = { name: 'Pool-lane view', z: 1.45, cx: 340, cy: 230 };
const CLOSE_CATCH: Camera = { name: 'High-elbow catch view', z: 1.7, cx: 330, cy: 220 };
const BREATH_SPLIT: Camera = { name: 'Bilateral breathing split view', z: 1.6, cx: 330, cy: POND_SURFACE, split: true };
const BACKSTROKE_CAM: Camera = { name: 'Backstroke lane view', z: 1.5, cx: 340, cy: 215 };
const KICK_CAM: Camera = { name: 'Whip kick underwater view', z: 1.6, cx: 310, cy: 245 };
const DOLPHIN_CAM: Camera = { name: 'Dolphin undulation view', z: 1.55, cx: 330, cy: 235 };

export const POND_ANIMS: Record<number, PondAnim> = {
  // ═══════════════════════════════════════════════════════════════
  // POND LEVEL 1 — ADVANCED FREESTYLE & BACKSTROKE (DROPS 1–6)
  // ═══════════════════════════════════════════════════════════════

  // Drop 1: High-Elbow Freestyle Catch & Pull Efficiency
  1: {
    duration: 3800,
    camera: CLOSE_CATCH,
    guide: 'arm',
    phases: [
      { label: 'Reach & set high elbow', end: 0.25, hl: ['armN'] },
      { label: 'Tip forearm down to catch', end: 0.5, hl: ['armN', 'body'] },
      { label: 'Accelerate past hip', end: 0.75, hl: ['armN'] },
      { label: 'High relaxed recovery', end: 1, hl: ['armN'] },
    ],
    pose: (t: number): Pose => {
      // Near arm demonstrates technical high-elbow catch
      // Far arm does alternating steady catch
      const armPhase = (t * 2) % 1;
      let aN: [number, number];
      if (armPhase < 0.25) {
        // High elbow setup: upper arm near surface (160°), forearm angled down (60°)
        aN = [lerp(180, 160, armPhase / 0.25), lerp(10, 60, armPhase / 0.25)];
      } else if (armPhase < 0.5) {
        // Power pull under chest
        aN = [lerp(160, 95, (armPhase - 0.25) / 0.25), lerp(60, 95, (armPhase - 0.25) / 0.25)];
      } else if (armPhase < 0.75) {
        // Finish at hip
        aN = [lerp(95, 20, (armPhase - 0.5) / 0.25), lerp(95, 15, (armPhase - 0.5) / 0.25)];
      } else {
        // High elbow recovery forward
        aN = [lerp(20, 180, (armPhase - 0.75) / 0.25), lerp(15, 10, (armPhase - 0.75) / 0.25)];
      }
      const fl = flutter(t, 5.5, 16);
      return {
        ...PRONE,
        x: 320,
        y: FLOAT_Y + Math.sin(t * Math.PI * 4) * 2,
        angle: 90,
        roll: Math.sin(t * Math.PI * 2) * 0.35,
        aN,
        aF: [180 - aN[0] * 0.5, 20],
        lN: fl.lN,
        lF: fl.lF,
        bubbles: armPhase > 0.3 && armPhase < 0.7 ? 0.3 : 0,
      };
    },
  },

  // Drop 2: Long-Axis Freestyle Body Rotation & Streamline
  2: {
    duration: 4200,
    camera: FULL_LANE,
    guide: 'align',
    phases: [
      { label: 'Roll 45° to right', end: 0.3, hl: ['body', 'hips'] },
      { label: 'Head stays steady center', end: 0.5, hl: ['head'] },
      { label: 'Roll 45° to left', end: 0.8, hl: ['body', 'hips'] },
      { label: 'Streamlined symmetry', end: 1 },
    ],
    pose: (t: number): Pose => {
      const rollAngle = Math.sin(t * Math.PI * 2) * 45;
      const fl = flutter(t, 6, 14);
      const stroke = (t * 2) % 1;
      return {
        ...PRONE,
        x: 330,
        y: FLOAT_Y,
        angle: 90 + Math.sin(t * Math.PI * 2) * 4,
        roll: Math.sin(t * Math.PI * 2) * 0.7,
        head: 0, // Head locked still
        aN: stroke < 0.5 ? [lerp(180, 20, stroke * 2), 40] : [lerp(20, 180, (stroke - 0.5) * 2), 20],
        aF: stroke >= 0.5 ? [lerp(180, 20, (stroke - 0.5) * 2), 40] : [lerp(20, 180, stroke * 2), 20],
        lN: fl.lN,
        lF: fl.lF,
      };
    },
  },

  // Drop 3: Bilateral Freestyle Breathing Rhythm (Every 3 Strokes)
  3: {
    duration: 5400,
    camera: BREATH_SPLIT,
    guide: 'breath',
    phases: [
      { label: 'Stroke 1 (Right): Exhale bubbles', end: 0.28, hl: ['armN'] },
      { label: 'Stroke 2 (Left): Exhale bubbles', end: 0.55, hl: ['armF'] },
      { label: 'Stroke 3 & Breathe: Pocket breath', end: 0.82, hl: ['head', 'body'] },
      { label: 'Face returns down', end: 1 },
    ],
    pose: (t: number): Pose => {
      const fl = flutter(t, 6, 14);
      // 3 stroke cycle: stroke 1 (0-0.3), stroke 2 (0.3-0.6), stroke 3 + breathe (0.6-0.9), return (0.9-1.0)
      let headRoll = 0;
      let mouth = 0;
      let bubbles = 0.4;
      if (t >= 0.62 && t <= 0.85) {
        headRoll = Math.sin(((t - 0.62) / 0.23) * Math.PI) * 0.85;
        mouth = headRoll > 0.4 ? 0.8 : 0;
        bubbles = 0; // Inhaling in the pocket
      }
      return {
        ...PRONE,
        x: 330,
        y: FLOAT_Y + (t > 0.6 && t < 0.85 ? -3 : 0),
        angle: 90,
        roll: headRoll * 0.6,
        head: headRoll * 20,
        mouth,
        aN: [lerp(180, 20, (t * 3) % 1), 35],
        aF: [lerp(20, 180, (t * 3) % 1), 25],
        lN: fl.lN,
        lF: fl.lF,
        bubbles,
      };
    },
  },

  // Drop 4: Backstroke High-Arm Recovery & Pinky-First Entry
  4: {
    duration: 4000,
    camera: BACKSTROKE_CAM,
    guide: 'backarm',
    phases: [
      { label: 'Thumb exits at hip', end: 0.25, hl: ['armN'] },
      { label: 'Straight arm sweeps past ear', end: 0.5, hl: ['armN'] },
      { label: 'Pinky finger slices water', end: 0.75, hl: ['armN'] },
      { label: 'Deep underwater catch', end: 1, hl: ['armN'] },
    ],
    pose: (t: number): Pose => {
      const fl = flutter(t, 6, 14);
      const armRot = (t * 360) % 360;
      return {
        ...SUPINE,
        x: 330,
        y: FLOAT_Y - 2,
        angle: -90,
        aN: [armRot, 5],
        aF: [(armRot + 180) % 360, 5],
        lN: fl.lN,
        lF: fl.lF,
        head: 0,
      };
    },
  },

  // Drop 5: Backstroke Hip-Driven Body Roll & Continuous Flutter
  5: {
    duration: 4200,
    camera: BACKSTROKE_CAM,
    guide: 'backkick',
    phases: [
      { label: 'Right shoulder drops into catch', end: 0.3, hl: ['body', 'armN'] },
      { label: 'Left shoulder clears water', end: 0.6, hl: ['armF'] },
      { label: 'Continuous surface flutter', end: 0.9, hl: ['legs'] },
      { label: 'Head steady like a cup', end: 1, hl: ['head'] },
    ],
    pose: (t: number): Pose => {
      const fl = flutter(t, 6.5, 16);
      const roll = Math.sin(t * Math.PI * 2) * 0.6;
      return {
        ...SUPINE,
        x: 330,
        y: FLOAT_Y - 2,
        angle: -90,
        roll,
        aN: [(t * 360) % 360, 10],
        aF: [((t * 360) + 180) % 360, 10],
        lN: fl.lN,
        lF: fl.lF,
      };
    },
  },

  // Drop 6: Continuous 50m Advanced Freestyle & Backstroke Medley
  6: {
    duration: 5200,
    camera: FULL_LANE,
    guide: 'coord',
    phases: [
      { label: '25m High-Elbow Freestyle', end: 0.45, hl: ['arms', 'body'] },
      { label: 'Smooth Wall Turn Transition', end: 0.58, hl: ['body', 'hips'] },
      { label: 'Streamline Push & Breakout', end: 0.72, hl: ['legs'] },
      { label: '25m Advanced Backstroke', end: 1, hl: ['armN', 'armF'] },
    ],
    pose: (t: number): Pose => {
      const fl = flutter(t, 6, 14);
      if (t < 0.48) {
        // Freestyle phase
        return {
          ...PRONE,
          x: lerp(240, 420, t / 0.48),
          y: FLOAT_Y,
          angle: 90,
          aN: [lerp(180, 20, (t * 5) % 1), 35],
          aF: [lerp(20, 180, (t * 5) % 1), 25],
          lN: fl.lN,
          lF: fl.lF,
        };
      } else if (t < 0.6) {
        // Wall turn pivot
        const turnT = (t - 0.48) / 0.12;
        return {
          ...PRONE,
          x: 430 - Math.sin(turnT * Math.PI) * 15,
          y: FLOAT_Y + 10,
          angle: lerp(90, -90, turnT),
          aN: [160, 40],
          aF: [160, 40],
          lN: [lerp(0, 90, turnT), 20],
          lF: [lerp(0, 90, turnT), 20],
        };
      } else {
        // Backstroke phase
        const backT = (t - 0.6) / 0.4;
        return {
          ...SUPINE,
          x: lerp(420, 230, backT),
          y: FLOAT_Y - 2,
          angle: -90,
          aN: [(backT * 360 * 2) % 360, 8],
          aF: [((backT * 360 * 2) + 180) % 360, 8],
          lN: fl.lN,
          lF: fl.lF,
        };
      }
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // POND LEVEL 2 — ADVANCED STROKES + BREASTSTROKE KICK (DROPS 7–12)
  // ═══════════════════════════════════════════════════════════════

  // Drop 7: Advanced 50m Freestyle Distance & Stroke Count Efficiency
  7: {
    duration: 4400,
    camera: FULL_LANE,
    guide: 'streamline',
    phases: [
      { label: 'Long forward reach', end: 0.3, hl: ['armN'] },
      { label: 'Deep hold & catch', end: 0.6, hl: ['armN', 'body'] },
      { label: 'Long streamline glide', end: 1, hl: ['body', 'legs'] },
    ],
    pose: (t: number): Pose => {
      const fl = flutter(t, 5, 12);
      return {
        ...PRONE,
        x: 330,
        y: FLOAT_Y,
        angle: 90,
        roll: Math.sin(t * Math.PI * 2) * 0.4,
        aN: [lerp(180, 20, (t * 1.5) % 1), 30],
        aF: [lerp(20, 180, (t * 1.5) % 1), 30],
        lN: fl.lN,
        lF: fl.lF,
      };
    },
  },

  // Drop 8: Advanced Backstroke Deep Water Wall Push-Off & Glide
  8: {
    duration: 4600,
    camera: BACKSTROKE_CAM,
    guide: 'streamline',
    phases: [
      { label: 'Feet on wall, arms in streamline', end: 0.25, hl: ['arms', 'legs'] },
      { label: 'Explosive horizontal push', end: 0.5, hl: ['legs'] },
      { label: 'Underwater back glide', end: 0.75, hl: ['body'] },
      { label: 'Breakout into backstroke', end: 1, hl: ['armN', 'armF'] },
    ],
    pose: keys({ ...SUPINE, x: 140, y: FLOAT_Y + 15, angle: -90, aN: [180, 0], aF: [180, 0], lN: [90, -80], lF: [90, -80] }, [
      [0, {}],
      [0.25, { lN: [80, -70], lF: [80, -70] }],
      [0.45, { x: 260, y: FLOAT_Y + 8, lN: [0, 0], lF: [0, 0] }],
      [0.72, { x: 380, y: FLOAT_Y - 2 }],
      [1, { x: 420, aN: [120, 10], aF: [300, 10], lN: [15, 0], lF: [-15, 0] }],
    ]),
  },

  // Drop 9: Pool-Wall Breaststroke Whip Kick Mechanics
  9: {
    duration: 3800,
    camera: KICK_CAM,
    guide: 'kick',
    phases: [
      { label: 'Heels draw to buttocks', end: 0.3, hl: ['legs', 'legN'] },
      { label: 'Ankles flex outward (duck feet)', end: 0.55, hl: ['legs'] },
      { label: 'Circular backward whip snap', end: 0.8, hl: ['legs'] },
      { label: 'Squeeze & hold glide', end: 1, hl: ['legs'] },
    ],
    pose: (t: number): Pose => {
      const cycle = t % 1;
      let kneeAngle = 0;
      let ankleAngle = 0;
      if (cycle < 0.3) {
        // Recovery: knees bend, heels come up
        kneeAngle = lerp(0, 85, cycle / 0.3);
        ankleAngle = lerp(0, 30, cycle / 0.3);
      } else if (cycle < 0.55) {
        // Catch: feet turn out
        kneeAngle = 85;
        ankleAngle = 45;
      } else if (cycle < 0.8) {
        // Whip: snap legs together
        const p = (cycle - 0.55) / 0.25;
        kneeAngle = lerp(85, 0, p);
        ankleAngle = lerp(45, 0, p);
      } else {
        // Squeeze & glide
        kneeAngle = 0;
        ankleAngle = 0;
      }
      return {
        ...PRONE,
        x: 280,
        y: FLOAT_Y,
        angle: 90,
        aN: [140, 20], // Hands holding pool wall
        aF: [140, 20],
        lN: [kneeAngle, -ankleAngle],
        lF: [kneeAngle, -ankleAngle],
      };
    },
  },

  // Drop 10: Supported Breaststroke Kick with Board (15m)
  10: {
    duration: 3800,
    camera: KICK_CAM,
    guide: 'kick',
    phases: [
      { label: 'Heels recover, board stable', end: 0.3, hl: ['legs'] },
      { label: 'Flex toes outward', end: 0.5, hl: ['legs'] },
      { label: 'Whip kick snap backward', end: 0.75, hl: ['legs'] },
      { label: '2-second forward surge glide', end: 1, hl: ['body', 'legs'] },
    ],
    pose: (t: number): Pose => {
      const cycle = t % 1;
      let knee = 0;
      if (cycle < 0.35) knee = lerp(0, 80, cycle / 0.35);
      else if (cycle < 0.7) knee = lerp(80, 0, (cycle - 0.35) / 0.35);
      else knee = 0;
      return {
        ...PRONE,
        x: 330,
        y: FLOAT_Y - 2,
        angle: 90,
        aN: [180, 5], // Hands on kickboard
        aF: [180, 5],
        lN: [knee, -knee * 0.4],
        lF: [knee, -knee * 0.4],
      };
    },
  },

  // Drop 11: Hands-at-Side Breaststroke Kick on Front & Back
  11: {
    duration: 4000,
    camera: FULL_LANE,
    guide: 'align',
    phases: [
      { label: 'Hands streamlined at sides', end: 0.25, hl: ['arms'] },
      { label: 'Heels recover under water', end: 0.5, hl: ['legs'] },
      { label: 'Symmetrical whip snap', end: 0.75, hl: ['legs'] },
      { label: 'Horizontal hip lift & glide', end: 1, hl: ['hips', 'legs'] },
    ],
    pose: (t: number): Pose => {
      const cycle = t % 1;
      let knee = 0;
      if (cycle < 0.3) knee = lerp(0, 75, cycle / 0.3);
      else if (cycle < 0.65) knee = lerp(75, 0, (cycle - 0.3) / 0.35);
      return {
        ...PRONE,
        x: 330,
        y: FLOAT_Y + (cycle > 0.6 ? -3 : 0),
        angle: 90,
        aN: [15, 5], // Hands at sides
        aF: [15, 5],
        lN: [knee, -knee * 0.3],
        lF: [knee, -knee * 0.3],
      };
    },
  },

  // Drop 12: Combined Stroke Circuit: 25m Freestyle + 25m Breaststroke Kick
  12: {
    duration: 5200,
    camera: FULL_LANE,
    guide: 'coord',
    phases: [
      { label: '25m Advanced Freestyle', end: 0.48, hl: ['arms', 'legs'] },
      { label: 'Wall touch & push-off', end: 0.6, hl: ['hips'] },
      { label: '25m Breaststroke Kick Glide', end: 1, hl: ['legs'] },
    ],
    pose: (t: number): Pose => {
      if (t < 0.48) {
        // Freestyle
        const fl = flutter(t, 6, 14);
        return {
          ...PRONE,
          x: lerp(240, 420, t / 0.48),
          y: FLOAT_Y,
          angle: 90,
          aN: [lerp(180, 20, (t * 5) % 1), 35],
          aF: [lerp(20, 180, (t * 5) % 1), 25],
          lN: fl.lN,
          lF: fl.lF,
        };
      } else {
        // Breaststroke kick glide
        const bT = (t - 0.48) / 0.52;
        const kickCycle = (bT * 3) % 1;
        let knee = 0;
        if (kickCycle < 0.35) knee = lerp(0, 75, kickCycle / 0.35);
        else if (kickCycle < 0.7) knee = lerp(75, 0, (kickCycle - 0.35) / 0.35);
        return {
          ...PRONE,
          x: lerp(420, 240, bT),
          y: FLOAT_Y,
          angle: 90,
          facing: -1,
          aN: [180, 5], // Streamline forward
          aF: [180, 5],
          lN: [knee, -knee * 0.3],
          lF: [knee, -knee * 0.3],
        };
      }
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // POND LEVEL 3 — ADVANCED STROKES + BREASTSTROKE BASICS + BUTTERFLY KICK (DROPS 13–18)
  // ═══════════════════════════════════════════════════════════════

  // Drop 13: Advanced Freestyle Bilateral 75m Continuous Endurance
  13: {
    duration: 4800,
    camera: FULL_LANE,
    guide: 'breath',
    phases: [
      { label: 'Rhythmic stroke pacing', end: 0.3, hl: ['armN'] },
      { label: 'Bilateral side breathing', end: 0.6, hl: ['head'] },
      { label: 'Strong continuous stamina', end: 1, hl: ['body', 'legs'] },
    ],
    pose: (t: number): Pose => {
      const fl = flutter(t, 6, 14);
      const breathe = (t * 3) % 1 > 0.75;
      return {
        ...PRONE,
        x: 330,
        y: FLOAT_Y,
        angle: 90,
        roll: Math.sin(t * Math.PI * 3) * 0.5,
        head: breathe ? 15 : 0,
        mouth: breathe ? 0.7 : 0,
        aN: [lerp(180, 20, (t * 3) % 1), 35],
        aF: [lerp(20, 180, (t * 3) % 1), 25],
        lN: fl.lN,
        lF: fl.lF,
      };
    },
  },

  // Drop 14: Advanced Backstroke 50m Speed & Continuous Stroke Tempo
  14: {
    duration: 3800,
    camera: BACKSTROKE_CAM,
    guide: 'backarm',
    phases: [
      { label: 'Continuous windmill cadence', end: 0.35, hl: ['armN', 'armF'] },
      { label: 'Strong hip catch power', end: 0.7, hl: ['body'] },
      { label: 'High boiling kick speed', end: 1, hl: ['legs'] },
    ],
    pose: (t: number): Pose => {
      const fl = flutter(t, 7, 18);
      return {
        ...SUPINE,
        x: 330,
        y: FLOAT_Y - 3,
        angle: -90,
        roll: Math.sin(t * Math.PI * 3) * 0.5,
        aN: [(t * 360 * 1.5) % 360, 5],
        aF: [((t * 360 * 1.5) + 180) % 360, 5],
        lN: fl.lN,
        lF: fl.lF,
      };
    },
  },

  // Drop 15: Breaststroke Basic Arm Pull & Head Lift Timing
  15: {
    duration: 3600,
    camera: CLOSE_CATCH,
    guide: 'arm',
    phases: [
      { label: 'Outsweep: Press palms outward', end: 0.28, hl: ['arms'] },
      { label: 'Insweep: Hands sweep under chin', end: 0.55, hl: ['arms', 'head'] },
      { label: 'Breathe: Chin lifts forward', end: 0.75, hl: ['head'] },
      { label: 'Shoot hands forward into glide', end: 1, hl: ['arms'] },
    ],
    pose: (t: number): Pose => {
      const cycle = t % 1;
      let armAngle = 180;
      let armBend = 0;
      let headLift = 0;
      let mouth = 0;
      if (cycle < 0.28) {
        // Outsweep
        armAngle = lerp(180, 130, cycle / 0.28);
        armBend = lerp(0, 35, cycle / 0.28);
      } else if (cycle < 0.55) {
        // Insweep under chin
        const p = (cycle - 0.28) / 0.27;
        armAngle = lerp(130, 80, p);
        armBend = lerp(35, 90, p);
        headLift = lerp(0, 22, p);
        mouth = p > 0.5 ? 0.7 : 0;
      } else if (cycle < 0.75) {
        // Shoot forward
        const p = (cycle - 0.55) / 0.2;
        armAngle = lerp(80, 180, p);
        armBend = lerp(90, 0, p);
        headLift = lerp(22, 0, p);
      } else {
        // Glide
        armAngle = 180;
        armBend = 0;
        headLift = 0;
      }
      return {
        ...PRONE,
        x: 330,
        y: FLOAT_Y - headLift * 0.2,
        angle: 90 - headLift * 0.4,
        head: headLift,
        mouth,
        aN: [armAngle, armBend],
        aF: [armAngle, armBend],
        lN: [0, 0],
        lF: [0, 0],
      };
    },
  },

  // Drop 16: Basic Breaststroke Coordination (Pull, Breathe, Kick, Glide)
  16: {
    duration: 4000,
    camera: FULL_LANE,
    guide: 'coord',
    phases: [
      { label: '1. PULL & BREATHE: Hands sweep to chin', end: 0.32, hl: ['arms', 'head'] },
      { label: '2. SHOOT & KICK: Hands extend as legs whip', end: 0.65, hl: ['arms', 'legs'] },
      { label: '3. GLIDE: Streamlined momentum', end: 1, hl: ['body', 'legs'] },
    ],
    pose: (t: number): Pose => {
      const cycle = t % 1;
      let armAngle = 180;
      let armBend = 0;
      let headLift = 0;
      let knee = 0;
      if (cycle < 0.32) {
        // Phase 1: Pull and Breathe (legs trail straight)
        const p = cycle / 0.32;
        armAngle = lerp(180, 85, p);
        armBend = lerp(0, 85, p);
        headLift = lerp(0, 24, p);
        knee = 0;
      } else if (cycle < 0.65) {
        // Phase 2: Shoot and Kick (arms shoot straight, legs whip snap)
        const p = (cycle - 0.32) / 0.33;
        armAngle = lerp(85, 180, p);
        armBend = lerp(85, 0, p);
        headLift = lerp(24, 0, p);
        knee = p < 0.5 ? lerp(0, 80, p * 2) : lerp(80, 0, (p - 0.5) * 2);
      } else {
        // Phase 3: Pure horizontal glide
        armAngle = 180;
        armBend = 0;
        headLift = 0;
        knee = 0;
      }
      return {
        ...PRONE,
        x: 330,
        y: FLOAT_Y - headLift * 0.25,
        angle: 90 - headLift * 0.3,
        head: headLift,
        mouth: headLift > 15 ? 0.7 : 0,
        aN: [armAngle, armBend],
        aF: [armAngle, armBend],
        lN: [knee, -knee * 0.35],
        lF: [knee, -knee * 0.35],
      };
    },
  },

  // Drop 17: Butterfly Dolphin Kick Introduction (Pool Wall & Kickboard)
  17: {
    duration: 3200,
    camera: DOLPHIN_CAM,
    guide: 'kick',
    phases: [
      { label: 'Chest presses down, hips rise', end: 0.35, hl: ['body', 'hips'] },
      { label: 'Hips drive down, wave travels', end: 0.7, hl: ['hips', 'legs'] },
      { label: 'Feet whip together as one flipper', end: 1, hl: ['legs'] },
    ],
    pose: (t: number): Pose => {
      // Fluid sinusoidal dolphin undulation from chest to toes
      const wave = Math.sin(t * Math.PI * 4);
      const kneeWave = Math.sin((t * Math.PI * 4) - 0.8) * 35;
      return {
        ...PRONE,
        x: 330,
        y: FLOAT_Y + wave * 5,
        angle: 90 + wave * 8,
        head: -wave * 6,
        aN: [180, 5],
        aF: [180, 5],
        lN: [Math.max(0, kneeWave), -kneeWave * 0.4],
        lF: [Math.max(0, kneeWave), -kneeWave * 0.4], // Legs move synchronously
      };
    },
  },

  // Drop 18: Streamlined Underwater Dolphin Kick & Multi-Stroke Graduation
  18: {
    duration: 5600,
    camera: FULL_LANE,
    guide: 'coord',
    phases: [
      { label: 'Tight Underwater Dolphin Kicks', end: 0.35, hl: ['legs', 'body'] },
      { label: 'Advanced Freestyle Breakout', end: 0.65, hl: ['arms', 'legs'] },
      { label: 'Coordinated Breaststroke Finish', end: 1, hl: ['arms', 'legs'] },
    ],
    pose: (t: number): Pose => {
      if (t < 0.35) {
        // Underwater dolphin streamline
        const wave = Math.sin(t * Math.PI * 8);
        return {
          ...PRONE,
          x: lerp(200, 340, t / 0.35),
          y: FLOAT_Y + 12 + wave * 4,
          angle: 90 + wave * 6,
          aN: [180, 0],
          aF: [180, 0],
          lN: [Math.max(0, wave * 30), -wave * 12],
          lF: [Math.max(0, wave * 30), -wave * 12],
        };
      } else if (t < 0.7) {
        // Freestyle breakout
        const fT = (t - 0.35) / 0.35;
        const fl = flutter(t, 6, 14);
        return {
          ...PRONE,
          x: lerp(340, 420, fT),
          y: FLOAT_Y,
          angle: 90,
          aN: [lerp(180, 20, (fT * 4) % 1), 35],
          aF: [lerp(20, 180, (fT * 4) % 1), 25],
          lN: fl.lN,
          lF: fl.lF,
        };
      } else {
        // Coordinated breaststroke
        const bT = (t - 0.7) / 0.3;
        const cycle = (bT * 2) % 1;
        let knee = 0;
        let headLift = 0;
        if (cycle < 0.5) {
          headLift = Math.sin(cycle * Math.PI) * 20;
          knee = 0;
        } else {
          knee = Math.sin((cycle - 0.5) * Math.PI * 2) * 65;
        }
        return {
          ...PRONE,
          x: lerp(420, 470, bT),
          y: FLOAT_Y,
          angle: 90 - headLift * 0.3,
          head: headLift,
          aN: cycle < 0.5 ? [100, 70] : [180, 0],
          aF: cycle < 0.5 ? [100, 70] : [180, 0],
          lN: [knee, -knee * 0.3],
          lF: [knee, -knee * 0.3],
        };
      }
    },
  },
};

export function getPondAnim(skillId: number): PondAnim {
  return POND_ANIMS[skillId] || POND_ANIMS[1];
}
