import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  DEEP_FLOOR,
  SHALLOW_FLOOR,
  STAND,
  SURFACE,
  WALL_X,
  clamp,
  getAnim,
  landmarks,
  lerp,
  phaseAt,
  phaseStart,
  smooth,
  type Camera,
  type Part,
  type Pose,
  type SkillAnim,
} from './animations';
import { Swimmer } from './Swimmer';
import { OutdoorBack } from './Outdoor';
import { HALL_END, POND, POND_CHAIN, POND_SHAPE, SEGMENTS, STATE_LABEL, chainFor } from './journey';
import { sfx } from '../lib/sound';
import { getLevel, getSkill, type LevelId } from '../data/curriculum';
import type { StudentState } from '../state/poolMachine';
import { cn } from '../utils/cn';

type Bubble = { x: number; y: number; r: number; ph: number; vy: number };
type Ripple = { x: number; y: number; age: number; size: number };
type Spray = { x: number; y: number; vx: number; vy: number };
type Sparkle = { x: number; y: number; vy: number; age: number; life: number; c: string };
type Pt = { x: number; y: number };
type DropAnim = { id: number; start: number; x: number; top: number; landed: boolean; fired: boolean; sx: number; sy: number };

const RIGHT = 1700;
const DROP_T = { appear: 400, fall: 1250, settleStart: 1700, settleEnd: 2600, done: 3200 };
const DROP_STEPS: [string, number][] = [
  ['Appear', 400],
  ['Fall', 1250],
  ['Splash', 1450],
  ['Ripple', 1650],
  ['Bubbles', 1850],
  ['Settle', 2600],
  ['Settled', Infinity],
];

const surfaceAt = (x: number) => (x < HALL_END ? POND.surface : SURFACE);
const inWater = (x: number, y: number) => (x > WALL_X ? y > SURFACE + 2 : x > POND.left && x < POND.right && y > POND.surface + 2);
export const slotPos = (id: number) => {
  const g = Math.floor((id - 1) / 6);
  const i = (id - 1) % 6;
  return { x: 262 + g * 190 + i * 26, y: 480 };
};
const DROP_PATH = 'M 0 -9 C 3 -4 6 -1 6 3 A 6 6 0 0 1 -6 3 C -6 -1 -3 -4 0 -9 Z';

interface Props {
  skillId: number;
  mode: 'skill' | 'journey';
  studentState: StudentState;
  level: LevelId;
  poolComplete: boolean;
  activeDrop: number | null;
  settled: (id: number) => boolean;
  completedCount: number;
  milestones: boolean[];
  onDropSettled: (id: number) => void;
  onStudentStep: (next: StudentState) => void;
  soundOn: boolean;
  top?: ReactNode;
  status?: ReactNode;
  banner?: ReactNode;
  panel?: ReactNode;
}

const prefersReduced = () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

function crossed(prev: number, cur: number, e: number) {
  return prev <= cur ? prev < e && cur >= e : prev < e || cur >= e;
}

export function PoolScene(props: Props) {
  const { skillId, mode, studentState, level, poolComplete, activeDrop, settled, completedCount, milestones, soundOn, top, status, banner, panel } = props;
  const reduced = useMemo(prefersReduced, []);
  const anim = getAnim(skillId);
  const skill = getSkill(skillId);
  const lvl = getLevel(skill.level);

  // refs mirrored from props for the animation loop
  const animRef = useRef<SkillAnim>(anim);
  animRef.current = anim;
  const idRef = useRef(skillId);
  idRef.current = skillId;
  const modeRef = useRef(mode);
  modeRef.current = mode;
  const stateRef = useRef(studentState);
  stateRef.current = studentState;
  const soundRef = useRef(soundOn);
  soundRef.current = soundOn;
  const settledCb = useRef(props.onDropSettled);
  settledCb.current = props.onDropSettled;
  const stepCb = useRef(props.onStudentStep);
  stepCb.current = props.onStudentStep;

  const [playing, setPlaying] = useState(!reduced);
  const playingRef = useRef(playing);
  playingRef.current = playing;

  const tRef = useRef(0);
  const loopRef = useRef(0);
  const timeRef = useRef(0);
  const segRef = useRef({ state: studentState, start: 0, t: 0, fired: false });
  const poseRef = useRef<Pose | null>(null);
  const camRef = useRef<Camera>(anim.camera);
  const bubbles = useRef<Bubble[]>([]);
  const ripples = useRef<Ripple[]>([]);
  const spray = useRef<Spray[]>([]);
  const sparkles = useRef<Sparkle[]>([]);
  const trail = useRef<Pt[]>([]);
  const trailHand = useRef<'N' | 'F'>('N');
  const prevPose = useRef<Pose | null>(null);
  const dropRef = useRef<DropAnim | null>(null);
  const settledAt = useRef<Record<number, number>>({});
  const milestoneAt = useRef<Record<number, number>>({});
  const prevMilestones = useRef<boolean[] | null>(null);
  const flash = useRef(0);
  const boost = useRef(0);
  const boostX = useRef(500);
  const pondBoost = useRef(0);
  const pondBoostX = useRef(-1070);
  const pausedRendered = useRef(false);
  const [, setFrame] = useState(0);

  // skill change
  useEffect(() => {
    const a = getAnim(skillId);
    tRef.current = reduced ? (phaseStart(a, 1) + a.phases[1].end) / 2 : 0;
    loopRef.current = 0;
    bubbles.current = [];
    trail.current = [];
    prevPose.current = null;
    pausedRendered.current = false;
  }, [skillId, reduced]);

  // student state change → start a new journey segment
  useEffect(() => {
    if (segRef.current.state !== studentState) segRef.current = { state: studentState, start: timeRef.current, t: 0, fired: false };
    pausedRendered.current = false;
  }, [studentState]);

  // milestone pulse
  const mKey = milestones.join();
  useEffect(() => {
    const prev = prevMilestones.current;
    if (prev) milestones.forEach((m, i) => m && !prev[i] && (milestoneAt.current[i] = timeRef.current));
    prevMilestones.current = [...milestones];
    pausedRendered.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mKey]);

  // DROP_CREATED → start the drop animation (state-driven, never the other way round)
  useEffect(() => {
    if (activeDrop == null || dropRef.current?.id === activeDrop) return;
    const cam = camRef.current;
    dropRef.current = {
      id: activeDrop,
      start: timeRef.current + 500,
      x: Math.max(WALL_X + 70, cam.cx + 40 / cam.z),
      top: cam.cy - 300 / cam.z,
      landed: false,
      fired: false,
      sx: 0,
      sy: 0,
    };
    pausedRendered.current = false;
  }, [activeDrop]);

  // animation loop
  useEffect(() => {
    let raf = 0;
    let last = performance.now();

    const splashAt = (x: number, pond = false, big = false) => {
      const sy = pond ? POND.surface : SURFACE;
      ripples.current.push({ x, y: sy, age: 0, size: big ? 180 : 70 }, { x: x + 10, y: sy, age: -180, size: big ? 130 : 50 });
      if (big) ripples.current.push({ x: x - 8, y: sy, age: -420, size: 90 }, { x, y: sy, age: -700, size: 60 });
      const n = big ? 32 : 8;
      for (let i = 0; i < n; i++)
        spray.current.push({ x: x + (Math.random() - 0.5) * (big ? 30 : 20), y: sy - 2, vx: (Math.random() - 0.5) * (big ? 0.34 : 0.12), vy: -(big ? 0.2 : 0.12) - Math.random() * (big ? 0.24 : 0.12) });
      if (big) for (let i = 0; i < 22; i++) bubbles.current.push({ x: x + (Math.random() - 0.5) * 40, y: sy + 20 + Math.random() * 90, r: 1.5 + Math.random() * 4, ph: Math.random() * 6, vy: 0.02 + Math.random() * 0.03 });
      if (pond) {
        pondBoost.current = 1;
        pondBoostX.current = x;
      } else {
        boost.current = Math.max(boost.current, 0.6);
        boostX.current = x;
      }
      if (soundRef.current) {
        sfx.splash();
        if (big) setTimeout(() => sfx.bubbles(), 250);
      }
    };

    const loop = (now: number) => {
      const dt = Math.min(50, now - last);
      last = now;
      timeRef.current += dt;
      const time = timeRef.current;
      const a = animRef.current;
      let pose: Pose;
      let active: boolean;
      let dScroll = 0;

      if (modeRef.current === 'skill') {
        const prevT = tRef.current;
        active = playingRef.current;
        if (active) {
          let t = prevT + dt / a.duration;
          if (t >= 1) {
            t -= 1;
            loopRef.current += 1;
            trail.current = [];
          }
          tRef.current = t;
        }
        const t = tRef.current;
        pose = a.pose(t);
        const pp = prevPose.current;
        dScroll = pp ? pose.scroll - pp.scroll : 0;
        if (Math.abs(dScroll) > 40) dScroll = 0;
        if (active) {
          const firstLoop = loopRef.current === 0;
          a.splashes?.forEach((e) => {
            if (crossed(prevT, t, e.t)) {
              ripples.current.push({ x: e.x, y: SURFACE, age: 0, size: 70 }, { x: e.x + 10, y: SURFACE, age: -180, size: 50 });
              for (let i = 0; i < 8; i++) spray.current.push({ x: e.x + (Math.random() - 0.5) * 20, y: SURFACE - 2, vx: (Math.random() - 0.5) * 0.12, vy: -0.12 - Math.random() * 0.12 });
              if (soundRef.current && firstLoop) sfx.splash();
            }
          });
          if (soundRef.current && firstLoop && pp && pp.bubbles < 0.5 && pose.bubbles >= 0.5 && (idRef.current === 2 || idRef.current === 3)) sfx.bubbles();
          if (a.showTrail) {
            const hand: 'N' | 'F' = idRef.current === 17 && t >= 0.5 ? 'F' : 'N';
            if (hand !== trailHand.current) {
              trail.current = [];
              trailHand.current = hand;
            }
            const lm = landmarks(pose);
            const p = hand === 'N' ? lm.handN : lm.handF;
            trail.current.push({ x: p.x, y: p.y });
            if (trail.current.length > 46) trail.current.shift();
          }
        }
      } else {
        active = true;
        const seg = SEGMENTS[stateRef.current];
        // a new student state always starts its own segment clock (prevents skipping segments)
        if (segRef.current.state !== stateRef.current) segRef.current = { state: stateRef.current, start: time, t: 0, fired: false };
        const sr = segRef.current;
        if (seg) {
          const dur = seg.duration * (reduced ? 0.6 : 1);
          const prevJ = sr.t;
          const jt = clamp((time - sr.start) / dur);
          sr.t = jt;
          pose = seg.pose(jt, time);
          seg.splashes?.forEach((e) => prevJ < e.t && jt >= e.t && splashAt(e.x, e.pond, e.big));
          if (jt >= 1 && seg.next && !sr.fired) {
            sr.fired = true;
            stepCb.current(seg.next);
          }
          if (seg.sparkle && Math.random() < dt * 0.014) {
            const lm = landmarks(pose);
            sparkles.current.push({ x: lm.head.x + (Math.random() - 0.5) * 90, y: lm.head.y + (Math.random() - 0.3) * 50, vy: 0.02 + Math.random() * 0.03, age: 0, life: 1400, c: ['#ffe066', '#bff6ff', '#ffffff', '#ff9e80'][Math.floor(Math.random() * 4)] });
          }
          const s = stateRef.current;
          if ((s === 'IN_POND' || s === 'FINAL_CELEBRATION') && Math.random() < dt * 0.0022) {
            ripples.current.push({ x: pose.x + (Math.random() - 0.5) * 30, y: POND.surface, age: 0, size: 60 + Math.random() * 40 });
          }
        } else {
          pose = { ...STAND };
        }
      }

      // bubbles from the mouth (underwater only — pool or pond)
      const lm = landmarks(pose);
      if (active && pose.bubbles > 0 && inWater(lm.mouth.x, lm.mouth.y) && Math.random() < pose.bubbles * dt * (reduced ? 0.004 : 0.014)) {
        bubbles.current.push({ x: lm.mouth.x, y: lm.mouth.y, r: 1.4 + Math.random() * 3, ph: Math.random() * 6, vy: 0.028 + Math.random() * 0.03 });
      }
      trail.current.forEach((p) => (p.x -= dScroll));

      bubbles.current = bubbles.current.filter((b) => {
        b.y -= b.vy * dt * (1 + b.r * 0.12);
        b.x += Math.sin(time / 280 + b.ph) * 0.18 - dScroll;
        if (b.y < surfaceAt(b.x) + 1) {
          if (Math.random() < 0.25) ripples.current.push({ x: b.x, y: surfaceAt(b.x), age: 0, size: 12 });
          return false;
        }
        return true;
      });
      ripples.current = ripples.current.filter((r) => {
        r.age += dt;
        r.x -= dScroll;
        return r.age < 1400;
      });
      spray.current = spray.current.filter((s) => {
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.vy += 0.0006 * dt;
        return !(s.y > surfaceAt(s.x) && s.vy > 0);
      });
      sparkles.current = sparkles.current.filter((s) => {
        s.age += dt;
        s.y -= s.vy * dt;
        return s.age < s.life;
      });

      // ONE DROP AT A TIME — APPEAR → FALL → SPLASH → RIPPLE → BUBBLES → SETTLE
      const d = dropRef.current;
      if (d) {
        const e = time - d.start;
        if (e >= DROP_T.fall && !d.landed) {
          d.landed = true;
          ripples.current.push({ x: d.x, y: SURFACE, age: 0, size: 120 }, { x: d.x, y: SURFACE, age: -200, size: 90 }, { x: d.x, y: SURFACE, age: -420, size: 60 });
          for (let i = 0; i < 14; i++) spray.current.push({ x: d.x, y: SURFACE - 2, vx: (Math.random() - 0.5) * 0.22, vy: -0.16 - Math.random() * 0.14 });
          for (let i = 0; i < 12; i++) bubbles.current.push({ x: d.x + (Math.random() - 0.5) * 30, y: SURFACE + 20 + Math.random() * 60, r: 1.5 + Math.random() * 3.5, ph: Math.random() * 6, vy: 0.02 + Math.random() * 0.03 });
          flash.current = 1;
          boost.current = 1;
          boostX.current = d.x;
          const cam = camRef.current;
          d.sx = 500 + (d.x - cam.cx) * cam.z;
          d.sy = 260 + (SURFACE + 24 - cam.cy) * cam.z;
          if (soundRef.current) {
            sfx.drop();
            setTimeout(() => sfx.splash(), 60);
            setTimeout(() => sfx.bubbles(), 420);
          }
        }
        if (e >= DROP_T.settleEnd && !d.fired) {
          d.fired = true;
          settledAt.current[d.id] = time;
          settledCb.current(d.id);
        }
        if (e > DROP_T.done) dropRef.current = null;
      }
      flash.current = Math.max(0, flash.current - dt / 700);
      boost.current = Math.max(0, boost.current - dt / 1800);
      pondBoost.current = Math.max(0, pondBoost.current - dt / 2200);

      poseRef.current = pose;
      prevPose.current = pose;
      const busy =
        active ||
        bubbles.current.length > 0 ||
        ripples.current.length > 0 ||
        spray.current.length > 0 ||
        sparkles.current.length > 0 ||
        !!dropRef.current ||
        flash.current > 0 ||
        boost.current > 0 ||
        time - Math.max(0, ...Object.values(settledAt.current), ...Object.values(milestoneAt.current)) < 1600;
      if (busy || !pausedRendered.current) {
        pausedRendered.current = !active;
        setFrame((f) => (f + 1) % 1_000_000);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  // ── render ──────────────────────────────────────────────
  const t = tRef.current;
  const time = timeRef.current;
  const seg = mode === 'journey' ? SEGMENTS[studentState] : undefined;
  const jt = segRef.current.state === studentState ? segRef.current.t : 0;
  const pose = poseRef.current ?? (seg ? seg.pose(jt, time) : anim.pose(t));
  const cam: Camera = seg ? seg.camera(pose, jt) : anim.camera;
  camRef.current = cam;
  const follow = !!seg?.follow;
  const pIndex = phaseAt(anim, t);
  const phase = anim.phases[pIndex];
  const hl = new Set<Part>(mode === 'skill' ? phase.hl ?? [] : []);
  const s = 1.25 / cam.z;
  const scroll = mode === 'skill' ? pose.scroll : 0;

  const surfY = (x: number) =>
    SURFACE +
    Math.sin(x * 0.021 + time * 0.0021) * 1.3 +
    Math.sin(x * 0.047 - time * 0.0031) * 0.8 +
    boost.current * Math.sin(x * 0.07 - time * 0.014) * 4 * Math.exp(-Math.abs(x - boostX.current) / 220);
  let surfacePath = '';
  for (let x = WALL_X; x <= RIGHT; x += 14) surfacePath += `${x === WALL_X ? 'M' : 'L'} ${x} ${surfY(x).toFixed(1)} `;
  const waterPoly = `${surfacePath} L ${RIGHT} ${DEEP_FLOOR} L 660 ${DEEP_FLOOR} L 520 ${SHALLOW_FLOOR} L ${WALL_X} ${SHALLOW_FLOOR} Z`;
  let pondSurface = '';
  for (let x = POND.left; x <= POND.right; x += 12) {
    const y = POND.surface + Math.sin(x * 0.03 + time * 0.0018) * 1 + pondBoost.current * Math.sin(x * 0.08 - time * 0.012) * 5 * Math.exp(-Math.abs(x - pondBoostX.current) / 140);
    pondSurface += `${x === POND.left ? 'M' : 'L'} ${x} ${y.toFixed(1)} `;
  }
  const wrap = (v: number, m: number) => ((v % m) + m) % m;

  const d = dropRef.current;
  const dropE = d ? time - d.start : -1;
  const dropStep = d && dropE >= 0 ? DROP_STEPS.findIndex(([, end]) => dropE < end) : -1;

  const jumpTo = (i: number) => {
    tRef.current = phaseStart(anim, i) + 0.005;
    trail.current = [];
    pausedRendered.current = false;
    setPlaying(false);
    if (soundOn) sfx.click();
  };

  const inPondChain = POND_CHAIN.slice(1).includes(studentState);
  const chain = chainFor(studentState, poolComplete);
  const chainIdx = chain.indexOf(studentState);
  const ariaText =
    mode === 'skill'
      ? `Pool animation for Drop ${skill.id}, ${skill.name}. Current step: ${phase.label}. ${skill.animText}`
      : `Journey animation. Student state: ${STATE_LABEL[studentState]}.`;

  return (
    <div className="overflow-hidden rounded-[28px] bg-[#06214a] shadow-2xl shadow-sky-900/30 ring-1 ring-white/10">
      {top}
      <div className="relative aspect-[4/3] w-full sm:aspect-[16/9] lg:aspect-[1000/500]">
        <svg viewBox="0 0 1000 520" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" role="img" aria-label={ariaText}>
          <defs>
            <linearGradient id="hall" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#bfe9ff" />
              <stop offset="0.7" stopColor="#e9f8ff" />
              <stop offset="1" stopColor="#d3f0fb" />
            </linearGradient>
            <linearGradient id="deep" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#4fd0f2" />
              <stop offset="0.35" stopColor="#1a9fd8" />
              <stop offset="1" stopColor="#0a4f93" />
            </linearGradient>
            <linearGradient id="tint" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#5fe0ff" stopOpacity="0.18" />
              <stop offset="1" stopColor="#063d7a" stopOpacity="0.5" />
            </linearGradient>
            <linearGradient id="pondTint" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#7ff0dc" stopOpacity="0.25" />
              <stop offset="1" stopColor="#0d3f4f" stopOpacity="0.55" />
            </linearGradient>
            <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#0d3b73" />
              <stop offset="1" stopColor="#051632" />
            </linearGradient>
            <linearGradient id="ray" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ffffff" stopOpacity="0.35" />
              <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
            <radialGradient id="dropG" cx="0.35" cy="0.35" r="0.8">
              <stop offset="0" stopColor="#ffffff" />
              <stop offset="0.35" stopColor="#8ff0ff" />
              <stop offset="1" stopColor="#19a7e6" />
            </radialGradient>
            <filter id="glow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="6" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="softGlow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="3" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <pattern id="tiles" width="24" height="24" patternUnits="userSpaceOnUse" patternTransform={`translate(${wrap(-scroll * 0.6, 24)} 0)`}>
              <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#ffffff" strokeOpacity="0.08" strokeWidth="1" />
            </pattern>
            <pattern id="floorTiles" width="20" height="10" patternUnits="userSpaceOnUse" patternTransform={`translate(${wrap(-scroll, 20)} 0)`}>
              <rect width="20" height="10" fill="#dff4fb" />
              <path d="M 20 0 L 0 0 0 10" fill="none" stroke="#9fd4ea" strokeWidth="1" />
            </pattern>
            <pattern id="rope" width="84" height="10" patternUnits="userSpaceOnUse" patternTransform={`translate(${wrap(-scroll * 0.85, 84)} ${SURFACE - 5})`}>
              {['#ffffff', '#1d4ed8', '#1d4ed8', '#ffffff', '#ff6b4a', '#1d4ed8'].map((c, i) => (
                <ellipse key={i} cx={7 + i * 14} cy={5} rx={6.3} ry={3.8} fill={c} opacity={0.9} />
              ))}
            </pattern>
            <clipPath id="waterClip">
              <rect x={WALL_X} y={SURFACE - 4} width={RIGHT} height={800} />
            </clipPath>
            <clipPath id="pondClipFront">
              <rect x={POND.left - 20} y={POND.surface} width={POND.right - POND.left + 40} height={300} />
            </clipPath>
          </defs>

          <g
            style={{
              transform: `translate(500px, 260px) scale(${cam.z}) translate(${-cam.cx}px, ${-cam.cy}px)`,
              transition: reduced || follow ? 'none' : 'transform 1.3s cubic-bezier(.45,0,.2,1)',
            }}
          >
            {/* pool hall */}
            <rect x={HALL_END} y={-700} width={1900 - HALL_END} height={700 + SURFACE + 2} fill="url(#hall)" />
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <g key={i} transform={`translate(${-120 + i * 250} -60)`}>
                <rect width={170} height={150} rx={14} fill="#ffffff" opacity={0.55} />
                <line x1={85} y1={0} x2={85} y2={150} stroke="#cdeefe" strokeWidth={4} />
                <line x1={0} y1={75} x2={170} y2={75} stroke="#cdeefe" strokeWidth={4} />
              </g>
            ))}
            <text x={640} y={148} textAnchor="middle" fontSize={20} fontWeight={800} fill="#06214a" opacity={0.1} letterSpacing={6}>
              AQUA SLASH · ONE DROP AT A TIME
            </text>
            <line x1={-300} y1={112} x2={RIGHT} y2={112} stroke="#06214a" strokeOpacity={0.35} strokeWidth={1} />
            {Array.from({ length: 70 }).map((_, i) => {
              const x = -300 + i * 30 + wrap(-scroll * 0.3, 30);
              return <path key={i} d={`M ${x} 112 L ${x + 20} 112 L ${x + 10} 128 Z`} fill={['#19c3e6', '#ff6b4a', '#0b2f6b', '#ffffff'][i % 4]} opacity={0.75} />;
            })}
            <rect x={-300} y={SURFACE - 12} width={2100} height={12} fill="#cfeaf6" />
            <rect x={-300} y={SURFACE - 13} width={2100} height={2} fill="#ffffff" opacity={0.8} />

            {/* underwater back wall */}
            <rect x={WALL_X} y={SURFACE} width={RIGHT} height={DEEP_FLOOR - SURFACE + 10} fill="url(#deep)" />
            <rect x={WALL_X} y={SURFACE} width={RIGHT} height={DEEP_FLOOR - SURFACE + 10} fill="url(#tiles)" />
            <g clipPath="url(#waterClip)">
              {Array.from({ length: 11 }).map((_, i) => {
                const x = WALL_X - 200 + i * 200 + wrap(-scroll * 0.6, 200);
                return (
                  <g key={i} opacity={0.22}>
                    <rect x={x - 3} y={SURFACE + 40} width={6} height={DEEP_FLOOR - SURFACE - 60} fill="#06214a" />
                    <rect x={x - 14} y={SURFACE + 40} width={28} height={5} fill="#06214a" />
                  </g>
                );
              })}
              {Array.from({ length: 6 }).map((_, i) => {
                const x0 = 120 + i * 260 + Math.sin(time * 0.0004 + i * 1.7) * 30;
                return (
                  <polygon
                    key={i}
                    points={`${x0 - 18},${SURFACE} ${x0 + 34},${SURFACE} ${x0 + 140},${DEEP_FLOOR} ${x0 + 50},${DEEP_FLOOR}`}
                    fill="url(#ray)"
                    opacity={0.45 + Math.sin(time * 0.001 + i) * 0.15}
                  />
                );
              })}
            </g>

            {/* floor */}
            <path d={`M ${WALL_X} ${SHALLOW_FLOOR} L 520 ${SHALLOW_FLOOR} L 660 ${DEEP_FLOOR} L ${RIGHT} ${DEEP_FLOOR} L ${RIGHT} 1100 L ${WALL_X} 1100 Z`} fill="url(#ground)" />
            <path d={`M ${WALL_X} ${SHALLOW_FLOOR + 5} L 520 ${SHALLOW_FLOOR + 5} L 660 ${DEEP_FLOOR + 5} L ${RIGHT} ${DEEP_FLOOR + 5}`} stroke="url(#floorTiles)" strokeWidth={10} fill="none" />
            <path d={`M ${WALL_X} ${SHALLOW_FLOOR} L 520 ${SHALLOW_FLOOR} L 660 ${DEEP_FLOOR} L ${RIGHT} ${DEEP_FLOOR}`} stroke="#ffffff" strokeOpacity={0.7} strokeWidth={1.5} fill="none" />
            {Array.from({ length: 9 }).map((_, i) => {
              const x = WALL_X + wrap(i * 190 + time * 0.012 - scroll, 1600);
              const fy = x < 520 ? SHALLOW_FLOOR : x < 660 ? lerp(SHALLOW_FLOOR, DEEP_FLOOR, (x - 520) / 140) : DEEP_FLOOR;
              return <ellipse key={i} cx={x} cy={fy - 2} rx={26} ry={3} fill="#ffffff" opacity={0.18 + Math.sin(time * 0.002 + i) * 0.1} />;
            })}

            {/* deck + wall */}
            <path d={`M ${HALL_END} 190 L ${WALL_X} 190 L ${WALL_X} 1100 L ${HALL_END} 1100 Z`} fill="url(#ground)" />
            <rect x={HALL_END} y={184} width={WALL_X - HALL_END} height={9} fill="#eef8fc" />
            <rect x={WALL_X - 8} y={183} width={14} height={13} rx={4} fill="#ffffff" />
            <rect x={WALL_X - 1} y={196} width={5} height={SHALLOW_FLOOR - 196} fill="#e6f6fc" />
            <rect x={-60} y={176} width={34} height={8} rx={2} fill="#ff6b4a" opacity={0.9} />

            {/* outdoor world + pond (static, memoized) */}
            <OutdoorBack />

            <rect x={WALL_X + 6} y={SURFACE - 5} width={RIGHT} height={10} fill="url(#rope)" opacity={0.85} />

            {mode === 'skill' && anim.showTrail && trail.current.length > 2 && (
              <polyline
                points={trail.current.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')}
                fill="none"
                stroke="#ffe066"
                strokeWidth={2.2 * s}
                strokeDasharray={`${4 * s} ${4 * s}`}
                strokeLinecap="round"
                opacity={0.8}
              />
            )}

            {/* the one swimmer */}
            <Swimmer pose={pose} hl={hl} />

            {/* water in front of the swimmer */}
            <path d={waterPoly} fill="url(#tint)" />
            {flash.current > 0 && <path d={waterPoly} fill="#bff6ff" opacity={flash.current * 0.35} />}
            <path d={surfacePath} stroke="#effcff" strokeWidth={mode === 'skill' && cam.split ? 2.6 : 2} fill="none" opacity={0.95} />
            <path d={surfacePath} stroke="#ffffff" strokeWidth={1} fill="none" opacity={0.3} transform="translate(0 4)" />
            <path d={POND_SHAPE} fill="url(#pondTint)" clipPath="url(#pondClipFront)" />
            <path d={pondSurface} stroke="#e6fff8" strokeWidth={2} fill="none" opacity={0.9} />
            {[
              [-1240, 0],
              [-1190, 1.3],
              [-960, 2.4],
            ].map(([x, ph], i) => (
              <g key={i} transform={`translate(${x} ${POND.surface - 1 + Math.sin(time / 700 + ph) * 0.8})`}>
                <ellipse rx={15} ry={3.4} fill="#3fa35b" />
                <path d="M 0 0 L 13 -2 L 12 2 Z" fill="#2f8a4a" />
                {i === 1 && <circle cx={-4} cy={-3} r={3} fill="#ff9ec4" />}
              </g>
            ))}

            {ripples.current.map((r, i) => {
              if (r.age < 0) return null;
              const k = r.age / 1400;
              const rx = 6 + r.size * k;
              return <ellipse key={i} cx={r.x} cy={r.y} rx={rx} ry={rx * 0.2} fill="none" stroke="#ffffff" strokeWidth={1.5} opacity={(1 - k) * 0.85} />;
            })}
            {bubbles.current.map((b, i) => (
              <g key={i}>
                <circle cx={b.x} cy={b.y} r={b.r} fill="#ffffff" fillOpacity={0.18} stroke="#ffffff" strokeOpacity={0.85} strokeWidth={0.8} />
                <circle cx={b.x - b.r * 0.35} cy={b.y - b.r * 0.35} r={b.r * 0.28} fill="#ffffff" opacity={0.9} />
              </g>
            ))}
            {spray.current.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={2} fill="#e3fbff" />
            ))}
            {sparkles.current.map((p, i) => {
              const k = p.age / p.life;
              const r = 5 * Math.sin(Math.PI * k) * s;
              return <path key={i} d={`M ${p.x} ${p.y - r} L ${p.x + r * 0.3} ${p.y - r * 0.3} L ${p.x + r} ${p.y} L ${p.x + r * 0.3} ${p.y + r * 0.3} L ${p.x} ${p.y + r} L ${p.x - r * 0.3} ${p.y + r * 0.3} L ${p.x - r} ${p.y} L ${p.x - r * 0.3} ${p.y - r * 0.3} Z`} fill={p.c} opacity={1 - k * 0.6} />;
            })}

            {mode === 'skill' && <Guides id={skillId} anim={anim} pose={pose} phaseLabel={phase.label} hl={hl} s={s} t={t} />}

            {/* falling drop */}
            {d && dropE >= 0 && dropE < DROP_T.fall && (() => {
              const appearK = smooth(clamp(dropE / DROP_T.appear));
              const fk = clamp((dropE - DROP_T.appear) / (DROP_T.fall - DROP_T.appear));
              const y = lerp(d.top, SURFACE - 10, fk * fk);
              const sc = (1.25 / cam.z) * 1.6 * (0.3 + 0.7 * appearK);
              return (
                <g transform={`translate(${d.x} ${y}) scale(${sc})`}>
                  {dropE < DROP_T.appear && <circle r={10 + 30 * appearK} fill="none" stroke="#bff6ff" strokeWidth={2} opacity={1 - appearK} />}
                  <line x1={0} y1={-60} x2={0} y2={-18} stroke="#bff6ff" strokeWidth={3} strokeLinecap="round" opacity={0.5 * fk} />
                  <path d="M 0 -18 C 6 -8 11 -1 11 6 A 11 11 0 0 1 -11 6 C -11 -1 -6 -8 0 -18 Z" fill="url(#dropG)" filter="url(#glow)" />
                  <ellipse cx={-4} cy={3} rx={2.5} ry={4} fill="#ffffff" opacity={0.8} />
                  <text y={30} textAnchor="middle" fontSize={9} fontWeight={900} fill="#ffffff" opacity={appearK}>
                    {d.id}
                  </text>
                </g>
              );
            })()}
            {d && dropE >= DROP_T.fall && dropE < DROP_T.fall + 1000 && (
              <circle cx={d.x} cy={SURFACE} r={10 + (dropE - DROP_T.fall) * 0.06} fill="none" stroke="#8ff0ff" strokeWidth={3} opacity={1 - (dropE - DROP_T.fall) / 1000} filter="url(#glow)" />
            )}
          </g>

          {/* in-pool drop tray: settled drops stay recorded */}
          <g aria-hidden>
            <rect x={186} y={460} width={650} height={40} rx={20} fill="#06214a" opacity={0.55} />
            <text x={222} y={485} textAnchor="middle" fontSize={13} fontWeight={900} fill="#bff6ff">
              {completedCount}/18
            </text>
            {Array.from({ length: 18 }).map((_, i) => {
              const id = i + 1;
              const p = slotPos(id);
              const on = settled(id);
              const since = settledAt.current[id] != null ? time - settledAt.current[id] : 9999;
              const pop = on && since < 700 ? 1 + 0.7 * Math.sin((Math.PI * since) / 700) : 1;
              const bob = on ? Math.sin(time / 600 + id) * 0.8 : 0;
              return (
                <g key={id} transform={`translate(${p.x} ${p.y + bob}) scale(${pop})`}>
                  {on && since < 1200 && <circle r={6 + since * 0.02} fill="none" stroke="#bff6ff" strokeWidth={1.5} opacity={1 - since / 1200} />}
                  <path d={DROP_PATH} fill={on ? 'url(#dropG)' : 'none'} stroke={on ? '#e0fbff' : '#7dd3fc'} strokeOpacity={on ? 1 : 0.4} strokeWidth={1.2} filter={on ? 'url(#softGlow)' : undefined} />
                </g>
              );
            })}
            {[0, 1, 2].map((g) => {
              const x = [422, 612, 802][g];
              const on = milestones[g];
              const since = milestoneAt.current[g] != null ? time - milestoneAt.current[g] : 9999;
              return (
                <g key={g} transform={`translate(${x} 480)`}>
                  {on && since < 1600 && <circle r={10 + since * 0.03} fill="none" stroke="#ffe066" strokeWidth={2} opacity={1 - since / 1600} />}
                  <text textAnchor="middle" dominantBaseline="central" fontSize={16} opacity={on ? 1 : 0.35} style={{ filter: on ? 'none' : 'grayscale(1)' }}>
                    {['💧', '🦵', '🏊'][g]}
                  </text>
                </g>
              );
            })}
          </g>

          {/* settle: the drop glides into its place */}
          {d && dropE >= DROP_T.settleStart && dropE < DROP_T.settleEnd && (() => {
            const k = smooth((dropE - DROP_T.settleStart) / (DROP_T.settleEnd - DROP_T.settleStart));
            const slot = slotPos(d.id);
            const x = lerp(d.sx, slot.x, k);
            const y = lerp(d.sy, slot.y, k) - Math.sin(Math.PI * k) * 30;
            return (
              <g transform={`translate(${x} ${y}) scale(${lerp(2, 1, k)})`}>
                <path d={DROP_PATH} fill="url(#dropG)" filter="url(#glow)" />
              </g>
            );
          })()}
        </svg>

        {/* overlays */}
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3 sm:p-4">
          <div className="rounded-2xl bg-[#06214a]/80 px-3 py-2 text-white shadow-lg backdrop-blur sm:px-4">
            {mode === 'skill' ? (
              <>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300 sm:text-xs">
                  Pool Level {lvl.id} · {lvl.name}
                </p>
                <p className="font-display text-sm font-semibold sm:text-lg">
                  💧 Drop {skill.id} — {skill.name}
                </p>
              </>
            ) : (
              <>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300 sm:text-xs">
                  {inPondChain ? '🌿 Pond Journey' : `Pool Level ${level} · ${getLevel(level).name}`}
                </p>
                <p className="font-display text-sm font-semibold sm:text-lg">
                  {seg?.icon} Student: {STATE_LABEL[studentState]}
                </p>
              </>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="rounded-full bg-white/85 px-3 py-1 text-[10px] font-bold text-[#06214a] shadow sm:text-xs">🎥 {cam.name}</span>
            {mode === 'skill' && status}
          </div>
        </div>
        {mode === 'skill' && cam.split && (
          <>
            <span className="pointer-events-none absolute left-3 top-[calc(50%-34px)] rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-extrabold tracking-wider text-sky-800 shadow">▲ ABOVE WATER</span>
            <span className="pointer-events-none absolute left-3 top-[calc(50%+12px)] rounded-full bg-[#06214a]/75 px-2.5 py-1 text-[10px] font-extrabold tracking-wider text-cyan-200 shadow">▼ UNDERWATER</span>
          </>
        )}
        {dropStep >= 0 && (
          <div className="pointer-events-none absolute inset-x-0 top-[26%] flex justify-center px-2" aria-live="polite">
            <div className="fade-up flex flex-wrap items-center justify-center gap-1 rounded-full bg-[#06214a]/80 px-3 py-1.5 shadow-lg backdrop-blur">
              <span className="mr-1 text-xs font-black text-cyan-200">💧 DROP {d!.id}</span>
              {DROP_STEPS.map(([label], i) => (
                <span key={label} className={cn('rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase', i === dropStep ? 'bg-amber-300 text-[#06214a]' : i < dropStep ? 'text-cyan-200' : 'text-white/40')}>
                  {label}
                </span>
              ))}
            </div>
          </div>
        )}
        {banner && <div className="pointer-events-none absolute inset-x-0 top-[22%] flex justify-center px-3">{banner}</div>}
      </div>

      {panel}

      {/* timeline */}
      <div className="border-t border-white/10 bg-[#082a5c] px-3 py-3 sm:px-5">
        {mode === 'skill' ? (
          <>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setPlaying((p) => !p);
                  if (soundOn) sfx.click();
                }}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-cyan-400 text-lg font-bold text-[#06214a] shadow-lg shadow-cyan-500/30 transition hover:scale-105 focus:outline-none focus-visible:ring-4 focus-visible:ring-cyan-200"
                aria-label={playing ? 'Pause animation' : 'Play animation'}
              >
                {playing ? '❚❚' : '▶'}
              </button>
              <div className="min-w-0 flex-1">
                <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto pb-1" role="list" aria-label="Skill steps">
                  {anim.phases.map((p, i) => (
                    <div key={i} className="flex shrink-0 items-center gap-1.5" role="listitem">
                      <button
                        onClick={() => jumpTo(i)}
                        className={cn(
                          'min-h-9 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200',
                          i === pIndex ? 'bg-amber-300 text-[#06214a] shadow-md shadow-amber-400/30' : 'bg-white/10 text-sky-100 hover:bg-white/20',
                        )}
                        aria-current={i === pIndex ? 'step' : undefined}
                      >
                        {p.label}
                      </button>
                      {i < anim.phases.length - 1 && <span className="text-xs text-cyan-300/70">→</span>}
                    </div>
                  ))}
                </div>
                <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-amber-300" style={{ width: `${t * 100}%` }} />
                </div>
              </div>
            </div>
            <p className="mt-2.5 text-xs leading-relaxed text-sky-100/80 sm:text-sm">
              <span className="font-bold text-cyan-300">👁 What you see: </span>
              {skill.animText}
            </p>
          </>
        ) : (
          <>
            <p className="mb-1.5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-cyan-300">Student state machine</p>
            <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto pb-1" role="list" aria-label="Student journey states">
              {chain.map((c, i) => (
                <div key={c} className="flex shrink-0 items-center gap-1.5" role="listitem">
                  <span
                    className={cn(
                      'rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide',
                      i === chainIdx ? 'bg-amber-300 text-[#06214a] shadow-md shadow-amber-400/30' : i < chainIdx ? 'bg-cyan-400/20 text-cyan-100' : 'bg-white/10 text-sky-100/60',
                    )}
                    aria-current={i === chainIdx ? 'step' : undefined}
                  >
                    {i < chainIdx ? '✓ ' : ''}
                    {STATE_LABEL[c]}
                  </span>
                  {i < chain.length - 1 && <span className="text-xs text-cyan-300/70">→</span>}
                </div>
              ))}
            </div>
            <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-amber-300" style={{ width: `${(seg?.next ? jt : 1) * 100}%` }} />
            </div>
            {seg && (
              <p className="mt-2.5 text-xs leading-relaxed text-sky-100/80 sm:text-sm">
                <span className="font-bold text-cyan-300">👁 What you see: </span>
                {seg.steps.map((st, i) => (
                  <span key={st} className={cn(i === Math.min(seg.steps.length - 1, Math.floor(jt * seg.steps.length)) ? 'font-bold text-amber-200' : '')}>
                    {st}
                    {i < seg.steps.length - 1 ? ' → ' : ''}
                  </span>
                ))}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── educational body guides (skill mode) ──────────────────
function Tag({ x, y, text, active = true, s }: { x: number; y: number; text: string; active?: boolean; s: number }) {
  const w = (text.length * 6.4 + 14) * s;
  const h = 17 * s;
  return (
    <g transform={`translate(${x} ${y})`} opacity={active ? 1 : 0.5}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h / 2} fill="#06214a" fillOpacity={0.85} stroke={active ? '#ffe066' : '#7dd3fc'} strokeWidth={s} />
      <text textAnchor="middle" dominantBaseline="central" fontSize={10 * s} fontWeight={800} fill={active ? '#ffe066' : '#e0f2fe'} letterSpacing={0.4 * s}>
        {text}
      </text>
    </g>
  );
}

function Guides({ id, anim, pose, phaseLabel, hl, s, t }: { id: number; anim: SkillAnim; pose: Pose; phaseLabel: string; hl: Set<Part>; s: number; t: number }) {
  const lm = landmarks(pose);
  const footMid = { x: (lm.footN.x + lm.footF.x) / 2, y: (lm.footN.y + lm.footF.y) / 2 };
  const on = (p: Part) => hl.has(p);

  switch (anim.guide) {
    case 'align':
    case 'streamline': {
      if (Math.abs(pose.angle) <= 70) return null;
      const off = anim.guide === 'streamline' ? 38 * s : -30 * s;
      const pts = [lm.head, lm.chest, lm.hip, footMid];
      return (
        <g>
          <polyline points={pts.map((p) => `${p.x},${p.y}`).join(' ')} fill="none" stroke="#ffe066" strokeWidth={1.6 * s} strokeDasharray={`${5 * s} ${4 * s}`} opacity={0.9} />
          {anim.guide === 'streamline' && <Tag x={lm.handN.x} y={lm.handN.y + off} text="ARMS" active={on('arms')} s={s} />}
          <Tag x={lm.head.x} y={lm.head.y + off} text="HEAD" active={on('head') || id === 4 || id === 5} s={s} />
          <Tag x={lm.chest.x} y={lm.chest.y + off} text="BODY" active={on('body')} s={s} />
          <Tag x={lm.hip.x} y={lm.hip.y + off} text="HIPS" active={on('hips')} s={s} />
          <Tag x={footMid.x} y={footMid.y + off} text="LEGS" active={on('legs')} s={s} />
        </g>
      );
    }
    case 'kick':
      return (
        <g>
          <Tag x={footMid.x - 6 * s} y={footMid.y + 30 * s} text="LEFT LEG" active={on('legN')} s={s} />
          <Tag x={footMid.x - 6 * s} y={footMid.y + 52 * s} text="RIGHT LEG" active={on('legF')} s={s} />
        </g>
      );
    case 'backkick':
      return (
        <g>
          <Tag x={lm.hip.x} y={lm.hip.y - 30 * s} text="HIPS UP" active s={s} />
          <Tag x={(lm.kneeN.x + lm.kneeF.x) / 2} y={lm.kneeN.y + 52 * s} text={on('legN') ? 'LEFT LEG' : 'RIGHT LEG'} active s={s} />
          <Tag x={footMid.x} y={footMid.y + 30 * s} text="ANKLES" active={false} s={s} />
        </g>
      );
    case 'arm': {
      const above = lm.handN.y < SURFACE;
      return <Tag x={lm.handN.x} y={lm.handN.y + (above ? -24 : 26) * s} text={phaseLabel.toUpperCase()} active s={s} />;
    }
    case 'backarm': {
      const h = id === 17 && t >= 0.5 ? lm.handF : lm.handN;
      const above = h.y < SURFACE;
      return <Tag x={h.x} y={h.y + (above ? -24 : 26) * s} text={phaseLabel.toUpperCase()} active s={s} />;
    }
    case 'breath':
      return (
        <g>
          <circle cx={lm.head.x} cy={lm.head.y} r={24} fill="none" stroke="#ffe066" strokeWidth={1.4 * s} strokeDasharray={`${4 * s} ${4 * s}`} opacity={0.9} />
          <Tag x={lm.head.x} y={lm.head.y - 40 * s} text={phaseLabel.toUpperCase()} active s={s} />
        </g>
      );
    case 'coord': {
      const back = id === 18;
      return (
        <g>
          {on('head') && <Tag x={lm.head.x} y={lm.head.y - 36 * s} text={back ? 'HEAD STILL' : 'BREATHING'} active s={s} />}
          {(on('body') || on('hips')) && <Tag x={lm.chest.x} y={lm.chest.y + (back ? -34 : 40) * s} text="BODY POSITION" active s={s} />}
          {on('legs') && <Tag x={footMid.x} y={footMid.y + 32 * s} text={back ? 'BACK KICK' : 'FLUTTER KICK'} active s={s} />}
          {on('arms') && <Tag x={lm.handN.x} y={lm.handN.y + (lm.handN.y < SURFACE ? -24 : 28) * s} text="ARMS" active s={s} />}
        </g>
      );
    }
    default:
      return null;
  }
}
