import { useEffect, useRef, useState } from 'react';
import { landmarks, lerp, type Part } from '../pool/animations';
import { Swimmer } from '../pool/Swimmer';
import { sfx } from '../lib/sound';
import { getGlassSkill } from '../data/glass';
import { G_FLOOR, G_SURFACE, G_WALL_X, getGlassAnim, glassPhaseAt, glassPhaseStart } from './animations';
import { cn } from '../utils/cn';

type Bubble = { x: number; y: number; r: number; ph: number; vy: number };
type Ripple = { x: number; age: number; size: number };
type Spray = { x: number; y: number; vx: number; vy: number };

const prefersReduced = () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const crossed = (prev: number, cur: number, e: number) => (prev <= cur ? prev < e && cur >= e : prev < e || cur >= e);

/**
 * GLASS — a real swimmer performing the current skill, in a friendly shallow learning pool.
 * Same swimmer model & rendering quality as the Pool, tuned for Glass's beginner skills.
 */
export function GlassScene({ skillId, soundOn }: { skillId: number; soundOn: boolean }) {
  const reduced = useState(prefersReduced)[0];
  const skill = getGlassSkill(skillId);
  const anim = getGlassAnim(skillId);
  const animRef = useRef(anim);
  animRef.current = anim;
  const soundRef = useRef(soundOn);
  soundRef.current = soundOn;

  const [playing, setPlaying] = useState(!reduced);
  const playingRef = useRef(playing);
  playingRef.current = playing;
  const tRef = useRef(reduced ? 0.5 : 0);
  const loopRef = useRef(0);
  const timeRef = useRef(0);
  const bubbles = useRef<Bubble[]>([]);
  const ripples = useRef<Ripple[]>([]);
  const spray = useRef<Spray[]>([]);
  const prevPose = useRef(anim.pose(tRef.current));
  const [, setFrame] = useState(0);

  useEffect(() => {
    tRef.current = 0;
    loopRef.current = 0;
    bubbles.current = [];
    ripples.current = [];
    spray.current = [];
    prevPose.current = getGlassAnim(skillId).pose(0);
  }, [skillId]);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(50, now - last);
      last = now;
      timeRef.current += dt;
      const a = animRef.current;
      const prevT = tRef.current;
      if (playingRef.current) {
        let t = prevT + dt / a.duration;
        if (t >= 1) {
          t -= 1;
          loopRef.current += 1;
        }
        tRef.current = t;
      }
      const t = tRef.current;
      const pose = a.pose(t);
      const firstLoop = loopRef.current === 0;

      if (playingRef.current) {
        a.splashes?.forEach((e) => {
          if (crossed(prevT, t, e.t)) {
            ripples.current.push({ x: e.x, age: 0, size: 60 }, { x: e.x + 8, age: -160, size: 42 });
            for (let i = 0; i < 10; i++) spray.current.push({ x: e.x + (Math.random() - 0.5) * 24, y: G_SURFACE - 2, vx: (Math.random() - 0.5) * 0.16, vy: -0.14 - Math.random() * 0.14 });
            if (soundRef.current && firstLoop) sfx.splash();
          }
        });
        const lm = landmarks(pose);
        if (pose.bubbles > 0 && lm.mouth.y > G_SURFACE + 2 && Math.random() < pose.bubbles * dt * (reduced ? 0.004 : 0.015)) {
          bubbles.current.push({ x: lm.mouth.x, y: lm.mouth.y, r: 1.3 + Math.random() * 2.6, ph: Math.random() * 6, vy: 0.026 + Math.random() * 0.026 });
        }
        if (soundRef.current && firstLoop && prevPose.current.bubbles < 0.5 && pose.bubbles >= 0.5) sfx.bubbles();
      }

      bubbles.current = bubbles.current.filter((b) => {
        b.y -= b.vy * dt;
        b.x += Math.sin(timeRef.current / 280 + b.ph) * 0.15;
        if (b.y < G_SURFACE + 1) {
          if (Math.random() < 0.3) ripples.current.push({ x: b.x, age: 0, size: 10 });
          return false;
        }
        return true;
      });
      ripples.current = ripples.current.filter((r) => {
        r.age += dt;
        return r.age < 1200;
      });
      spray.current = spray.current.filter((s) => {
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.vy += 0.0006 * dt;
        return !(s.y > G_SURFACE && s.vy > 0);
      });

      prevPose.current = pose;
      setFrame((f) => (f + 1) % 1_000_000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  const t = tRef.current;
  const time = timeRef.current;
  const pose = anim.pose(t);
  const pIndex = glassPhaseAt(anim, t);
  const phase = anim.phases[pIndex];
  const hl = new Set<Part>(phase.hl ?? []);
  const cam = anim.camera;

  const surfY = (x: number) => G_SURFACE + Math.sin(x * 0.024 + time * 0.0022) * 1.4 + Math.sin(x * 0.05 - time * 0.0032) * 0.8;
  let surfacePath = '';
  for (let x = G_WALL_X - 40; x <= 900; x += 14) surfacePath += `${x === G_WALL_X - 40 ? 'M' : 'L'} ${x} ${surfY(x).toFixed(1)} `;

  const jumpTo = (i: number) => {
    tRef.current = glassPhaseStart(anim, i) + 0.005;
    setPlaying(false);
    if (soundOn) sfx.click();
  };

  return (
    <div className="overflow-hidden rounded-[28px] bg-[#083a63] shadow-2xl shadow-sky-900/30 ring-1 ring-white/10">
      <div className="relative aspect-[4/3] w-full sm:aspect-[16/9] lg:aspect-[1000/500]">
        <svg
          viewBox="0 0 1000 520"
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 h-full w-full"
          role="img"
          aria-label={`Glass skill animation for Drop ${skill.id}, ${skill.name}. Current step: ${phase.label}. ${skill.short}`}
        >
          <defs>
            <linearGradient id="glHall" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ffe8c2" />
              <stop offset="0.55" stopColor="#bdeaff" />
              <stop offset="1" stopColor="#d7f4ff" />
            </linearGradient>
            <linearGradient id="glWater" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#7fe3ff" />
              <stop offset="0.4" stopColor="#33b8ea" />
              <stop offset="1" stopColor="#0d5fa0" />
            </linearGradient>
            <linearGradient id="glTint" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#8ff0ff" stopOpacity="0.18" />
              <stop offset="1" stopColor="#063d7a" stopOpacity="0.45" />
            </linearGradient>
            <linearGradient id="glGround" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#137aad" />
              <stop offset="1" stopColor="#053a63" />
            </linearGradient>
            <filter id="glGlow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="5" />
            </filter>
          </defs>

          <g style={{ transform: `translate(500px, 260px) scale(${cam.z}) translate(${-cam.cx}px, ${-cam.cy}px)`, transition: 'transform 1.1s cubic-bezier(.45,0,.2,1)' }}>
            {/* sunny deck */}
            <rect x={-400} y={-400} width={1800} height={400 + G_SURFACE + 4} fill="url(#glHall)" />
            <circle cx={720} cy={-40} r={46} fill="#fff3c4" opacity="0.9" />
            <circle cx={720} cy={-40} r={26} fill="#ffe066" />
            {[0, 1, 2, 3].map((i) => (
              <ellipse key={i} cx={120 + i * 210} cy={-90} rx={44} ry={16} fill="#ffffff" opacity="0.75" />
            ))}
            <text x={640} y={40} textAnchor="middle" fontSize="16" fontWeight={800} fill="#06214a" opacity="0.12" letterSpacing={4}>
              AQUA SLASH · LEARNING POOL
            </text>
            {/* rail + steps on the deck */}
            <rect x={130} y={90} width={8} height={110} rx={4} fill="#e2f6ff" stroke="#8fd6ef" strokeWidth={2} />
            <rect x={130} y={90} width={100} height={8} rx={4} fill="#e2f6ff" stroke="#8fd6ef" strokeWidth={2} />
            {[0, 1, 2].map((i) => (
              <rect key={i} x={150 + i * 26} y={150 + i * 18} width={70 - i * 20} height={12} fill="#eaf7ff" stroke="#9fd6ea" />
            ))}

            {/* water body */}
            <rect x={G_WALL_X - 40} y={G_SURFACE} width={900} height={G_FLOOR - G_SURFACE + 10} fill="url(#glWater)" />
            <rect x={G_WALL_X - 40} y={G_FLOOR} width={900} height={140} fill="url(#glGround)" />
            <path d={`M ${G_WALL_X - 40} ${G_FLOOR} L 900 ${G_FLOOR}`} stroke="#ffffff" strokeOpacity={0.4} strokeWidth={2} />
            {Array.from({ length: 6 }).map((_, i) => (
              <ellipse key={i} cx={200 + i * 130} cy={G_FLOOR - 4} rx={22} ry={3} fill="#ffffff" opacity={0.16 + Math.sin(time * 0.002 + i) * 0.08} />
            ))}
            {/* pool toys for friendliness */}
            <g transform="translate(560 300)" opacity={0.85}>
              <circle r={16} fill="#ff8fa3" />
              <path d="M -16 0 A16 16 0 0 1 0 -16 L 0 0 Z" fill="#ffe066" />
              <path d="M 0 0 A16 16 0 0 1 16 0 L 0 16 Z" fill="#7dd3fc" />
            </g>

            <Swimmer pose={pose} hl={hl} />

            <path d={`${surfacePath} L 900 ${G_FLOOR} L ${G_WALL_X - 40} ${G_FLOOR} Z`} fill="url(#glTint)" />
            <path d={surfacePath} stroke="#effcff" strokeWidth={cam.split ? 2.4 : 2} fill="none" opacity={0.95} />

            {ripples.current.map((r, i) => {
              if (r.age < 0) return null;
              const k = r.age / 1200;
              const rx = 5 + r.size * k;
              return <ellipse key={i} cx={r.x} cy={G_SURFACE} rx={rx} ry={rx * 0.2} fill="none" stroke="#ffffff" strokeWidth={1.4} opacity={(1 - k) * 0.85} />;
            })}
            {bubbles.current.map((b, i) => (
              <g key={i}>
                <circle cx={b.x} cy={b.y} r={b.r} fill="#ffffff" fillOpacity={0.18} stroke="#ffffff" strokeOpacity={0.85} strokeWidth={0.7} />
                <circle cx={b.x - b.r * 0.35} cy={b.y - b.r * 0.35} r={b.r * 0.28} fill="#ffffff" opacity={0.9} />
              </g>
            ))}
            {spray.current.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={1.8} fill="#eafcff" />
            ))}

            {/* simple highlight tag for the current focus */}
            {hl.size > 0 &&
              (() => {
                const lm = landmarks(pose);
                const p = hl.has('head') ? lm.head : hl.has('legs') || hl.has('legN') || hl.has('legF') ? lm.footN : hl.has('hips') ? lm.hip : hl.has('arms') || hl.has('armN') ? lm.handN : lm.chest;
                return (
                  <g transform={`translate(${p.x} ${p.y - 26})`}>
                    <rect x={-34} y={-10} width={68} height={18} rx={9} fill="#06214a" fillOpacity={0.85} stroke="#ffe066" />
                    <text textAnchor="middle" dominantBaseline="central" fontSize={9} fontWeight={800} fill="#ffe066">
                      {[...hl][0]?.toUpperCase()}
                    </text>
                  </g>
                );
              })()}
          </g>
        </svg>

        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3 sm:p-4">
          <div className="rounded-2xl bg-[#06214a]/80 px-3 py-2 text-white shadow-lg backdrop-blur sm:px-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300 sm:text-xs">
              Glass {skill.level} · Skill {skill.n}
            </p>
            <p className="font-display text-sm font-semibold sm:text-lg">
              💧 Drop {skill.id} — {skill.name}
            </p>
          </div>
          <span className="rounded-full bg-white/85 px-3 py-1 text-[10px] font-bold text-[#06214a] shadow sm:text-xs">🎥 {cam.name}</span>
        </div>
        {cam.split && (
          <>
            <span className="pointer-events-none absolute left-3 top-[calc(50%-30px)] rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-extrabold tracking-wider text-sky-800 shadow">▲ ABOVE WATER</span>
            <span className="pointer-events-none absolute left-3 top-[calc(50%+16px)] rounded-full bg-[#06214a]/75 px-2.5 py-1 text-[10px] font-extrabold tracking-wider text-cyan-200 shadow">▼ UNDERWATER</span>
          </>
        )}
      </div>

      <div className="border-t border-white/10 bg-[#0a4f81] px-3 py-3 sm:px-5">
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
              <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-amber-300" style={{ width: `${lerp(0, 100, t)}%` }} />
            </div>
          </div>
        </div>
        <p className="mt-2.5 text-xs leading-relaxed text-sky-100/80 sm:text-sm">
          <span className="font-bold text-cyan-300">👁 What you see: </span>
          {skill.short}
        </p>
      </div>
    </div>
  );
}
