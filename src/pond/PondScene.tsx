// ───────────────────────────────────────────────────────────
// Aqua Slash — Pond Scene Animation Player
// Interactive 2D kinematic swimmer demonstration for Level 3: Pond Stage.
// Deep water pool setting, lane markers, water physics, timeline scrubber, and cues.
// ───────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react';
import { getPondSkill } from '../data/pondCurriculum';
import { sfx } from '../lib/sound';
import { landmarks, type Part } from '../pool/animations';
import { Swimmer } from '../pool/Swimmer';
import { cn } from '../utils/cn';
import { getPondAnim, POND_FLOOR, POND_SURFACE, POND_WALL_X } from './animations';

type Bubble = { x: number; y: number; r: number; ph: number; vy: number };
type Ripple = { x: number; age: number; size: number };
type Spray = { x: number; y: number; vx: number; vy: number };

const prefersReduced = () =>
  typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

const crossed = (prev: number, cur: number, e: number) =>
  prev <= cur ? prev < e && cur >= e : prev < e || cur >= e;

export function PondScene({
  skillId,
  soundOn,
}: {
  skillId: number;
  soundOn: boolean;
}) {
  const reduced = useState(prefersReduced)[0];
  const skill = getPondSkill(skillId);
  const anim = getPondAnim(skillId);
  const animRef = useRef(anim);
  animRef.current = anim;
  const soundRef = useRef(soundOn);
  soundRef.current = soundOn;

  const [playing, setPlaying] = useState(!reduced);
  const playingRef = useRef(playing);
  playingRef.current = playing;
  const [speed, setSpeed] = useState<1 | 0.5>(1);
  const speedRef = useRef(speed);
  speedRef.current = speed;

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
    prevPose.current = getPondAnim(skillId).pose(0);
  }, [skillId]);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(50, now - last) * speedRef.current;
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
            ripples.current.push({ x: e.x, age: 0, size: 70 }, { x: e.x + 8, age: -150, size: 45 });
            for (let i = 0; i < 12; i++) {
              spray.current.push({
                x: e.x + (Math.random() - 0.5) * 28,
                y: POND_SURFACE - 2,
                vx: (Math.random() - 0.5) * 0.18,
                vy: -0.15 - Math.random() * 0.15,
              });
            }
            if (soundRef.current && firstLoop) sfx.splash();
          }
        });

        const lm = landmarks(pose);
        if (
          pose.bubbles > 0 &&
          lm.mouth.y > POND_SURFACE + 2 &&
          Math.random() < pose.bubbles * dt * (reduced ? 0.005 : 0.02)
        ) {
          bubbles.current.push({
            x: lm.mouth.x,
            y: lm.mouth.y,
            r: 1.4 + Math.random() * 2.8,
            ph: Math.random() * 6,
            vy: 0.028 + Math.random() * 0.028,
          });
        }
        if (soundRef.current && firstLoop && prevPose.current.bubbles < 0.4 && pose.bubbles >= 0.4) {
          sfx.bubbles();
        }
      }

      bubbles.current = bubbles.current.filter((b) => {
        b.y -= b.vy * dt;
        b.x += Math.sin(timeRef.current / 280 + b.ph) * 0.15;
        if (b.y < POND_SURFACE + 1) {
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
        s.vy += 0.00045 * dt;
        return s.y < POND_SURFACE + 10;
      });

      prevPose.current = pose;
      setFrame((f) => f + 1);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  const t = tRef.current;
  const time = timeRef.current;
  const pose = anim.pose(t);
  const cam = anim.camera;

  const currentPhaseIndex = Math.max(
    0,
    anim.phases.findIndex((p) => t <= p.end)
  );
  const phase = anim.phases[currentPhaseIndex] || anim.phases[0];
  const hl = new Set<Part>(phase.hl || []);

  const seek = (val: number) => {
    tRef.current = Math.max(0, Math.min(0.999, val));
    setFrame((f) => f + 1);
  };

  const waveD = 120;
  const surfacePath = Array.from({ length: 9 })
    .map((_, i) => {
      const x = 50 + i * waveD;
      const wave = Math.sin(time * 0.0028 + i * 0.9) * 2;
      return `${i === 0 ? 'M' : 'Q'} ${x - waveD * 0.5} ${POND_SURFACE + wave} ${x} ${POND_SURFACE}`;
    })
    .join(' ');

  return (
    <div className="relative overflow-hidden rounded-[28px] bg-[#06214a] shadow-2xl ring-1 ring-sky-900/40">
      <div className="relative aspect-[16/9] w-full min-h-[290px] max-h-[500px]">
        <svg
          viewBox="0 0 1000 520"
          className="h-full w-full select-none"
          preserveAspectRatio="xMidYMid slice"
          role="img"
          aria-label={`Pond skill animation for Drop ${skill.id}, ${skill.name}. Current step: ${phase.label}. ${skill.short}`}
        >
          <defs>
            <linearGradient id="pondHall" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#e0f2fe" />
              <stop offset="0.5" stopColor="#bae6fd" />
              <stop offset="1" stopColor="#7dd3fc" />
            </linearGradient>
            <linearGradient id="pondWaterGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#38bdf8" />
              <stop offset="0.35" stopColor="#0284c7" />
              <stop offset="1" stopColor="#0369a1" />
            </linearGradient>
            <linearGradient id="pondDeepGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#075985" />
              <stop offset="1" stopColor="#0c4a6e" />
            </linearGradient>
            <linearGradient id="pondWaterTint" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#38bdf8" stopOpacity="0.25" />
              <stop offset="1" stopColor="#082f49" stopOpacity="0.55" />
            </linearGradient>
            <filter id="pondGlow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="4" />
            </filter>
          </defs>

          <g
            style={{
              transform: `translate(500px, 260px) scale(${cam.z}) translate(${-cam.cx}px, ${-cam.cy}px)`,
              transition: 'transform 1.1s cubic-bezier(.45,0,.2,1)',
            }}
          >
            {/* Deep Pool Hall Sky / Ceiling */}
            <rect x={-500} y={-400} width={2000} height={400 + POND_SURFACE + 4} fill="url(#pondHall)" />

            {/* Backstroke overhead flags string */}
            <line x1={POND_WALL_X} y1={90} x2={900} y2={90} stroke="#94a3b8" strokeWidth={1.5} />
            {Array.from({ length: 14 }).map((_, i) => (
              <polygon
                key={i}
                points={`${120 + i * 55},90 ${135 + i * 55},90 ${127.5 + i * 55},118`}
                fill={i % 2 === 0 ? '#ef4444' : '#3b82f6'}
              />
            ))}

            {/* Pool Deck Tile Border & Depth Marker */}
            <rect x={-400} y={POND_SURFACE - 30} width={POND_WALL_X + 400} height={32} fill="#cbd5e1" stroke="#94a3b8" strokeWidth={2} />
            <text x={POND_WALL_X - 45} y={POND_SURFACE - 10} fontSize={12} fontWeight={900} fill="#0f172a">
              2.0M DEEP
            </text>

            {/* Water Body */}
            <rect x={POND_WALL_X} y={POND_SURFACE} width={900} height={POND_FLOOR - POND_SURFACE + 10} fill="url(#pondWaterGrad)" />
            <rect x={POND_WALL_X} y={POND_FLOOR} width={900} height={150} fill="url(#pondDeepGrad)" />

            {/* Swimming Pool Lane Markers on floor */}
            <line x1={POND_WALL_X} y1={POND_FLOOR - 2} x2={900} y2={POND_FLOOR - 2} stroke="#0284c7" strokeWidth={3} strokeDasharray="16 8" />
            <text x={450} y={POND_FLOOR + 24} textAnchor="middle" fontSize={11} fontWeight={800} fill="#38bdf8" letterSpacing={3} opacity={0.6}>
              AQUA SLASH · ADVANCED DEEP WATER POOL
            </text>

            {/* Lane Rope floating on surface */}
            <line x1={POND_WALL_X} y1={POND_SURFACE - 6} x2={900} y2={POND_SURFACE - 6} stroke="#f1f5f9" strokeWidth={1} strokeDasharray="6 3" opacity={0.4} />

            {/* Swimmer model */}
            <Swimmer pose={pose} hl={hl} />

            {/* Water surface overlay tint */}
            <path d={`${surfacePath} L 900 ${POND_FLOOR} L ${POND_WALL_X} ${POND_FLOOR} Z`} fill="url(#pondWaterTint)" />
            <path d={surfacePath} stroke="#e0f2fe" strokeWidth={cam.split ? 2.5 : 2} fill="none" opacity={0.9} />

            {/* Water Ripples */}
            {ripples.current.map((r, i) => {
              if (r.age < 0) return null;
              const k = r.age / 1200;
              const rx = 6 + r.size * k;
              return (
                <ellipse
                  key={i}
                  cx={r.x}
                  cy={POND_SURFACE}
                  rx={rx}
                  ry={rx * 0.22}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth={1.5}
                  opacity={(1 - k) * 0.8}
                />
              );
            })}

            {/* Breath bubbles */}
            {bubbles.current.map((b, i) => (
              <g key={i}>
                <circle cx={b.x} cy={b.y} r={b.r} fill="#ffffff" fillOpacity={0.2} stroke="#ffffff" strokeOpacity={0.9} strokeWidth={0.8} />
                <circle cx={b.x - b.r * 0.35} cy={b.y - b.r * 0.35} r={b.r * 0.28} fill="#ffffff" opacity={0.95} />
              </g>
            ))}

            {/* Surface spray */}
            {spray.current.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={1.8} fill="#f0f9ff" />
            ))}

            {/* Kinematic body focus tag */}
            {hl.size > 0 &&
              (() => {
                const lm = landmarks(pose);
                const p = hl.has('head')
                  ? lm.head
                  : hl.has('legs') || hl.has('legN') || hl.has('legF')
                  ? lm.footN
                  : hl.has('hips')
                  ? lm.hip
                  : hl.has('arms') || hl.has('armN')
                  ? lm.handN
                  : lm.chest;
                return (
                  <g transform={`translate(${p.x} ${p.y - 28})`}>
                    <rect x={-36} y={-11} width={72} height={20} rx={10} fill="#06214a" fillOpacity={0.9} stroke="#38bdf8" strokeWidth={1.5} />
                    <text textAnchor="middle" dominantBaseline="central" fontSize={9.5} fontWeight={900} fill="#38bdf8">
                      {[...hl][0]?.toUpperCase()}
                    </text>
                  </g>
                );
              })()}
          </g>
        </svg>

        {/* Top Overlay Badge */}
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3 sm:p-4">
          <div className="rounded-2xl bg-[#06214a]/85 px-3 py-2 text-white shadow-xl backdrop-blur-md border border-cyan-400/30">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-cyan-300 sm:text-xs">
              Pond Stage · Level {skill.level} · Drop {skill.id} of 18
            </p>
            <p className="font-display text-xs sm:text-sm font-bold text-white leading-snug">
              {skill.name}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-cyan-400/20 px-3 py-1 text-[11px] font-black uppercase text-cyan-200 border border-cyan-400/30">
              🏊 Pool Demonstration
            </span>
            <span className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-extrabold text-white">
              {cam.name}
            </span>
          </div>
        </div>

        {/* Bottom Cue & Phase Pill */}
        <div className="pointer-events-none absolute inset-x-0 bottom-16 flex items-center justify-between px-3 sm:px-5">
          <div className="rounded-full bg-[#06214a]/90 px-3.5 py-1.5 text-xs font-bold text-cyan-200 shadow-lg border border-cyan-400/40 backdrop-blur">
            📍 Step {currentPhaseIndex + 1}/{anim.phases.length}: <span className="text-white font-extrabold">{phase.label}</span>
          </div>
          {skill.cues && skill.cues[0] && (
            <div className="hidden md:inline-flex rounded-full bg-amber-400/20 px-3.5 py-1.5 text-xs font-black text-yellow-300 shadow border border-amber-400/40 backdrop-blur">
              📣 Coach Cue: “{skill.cues[0]}”
            </div>
          )}
        </div>
      </div>

      {/* Interactive Controls Bar */}
      <div className="bg-[#041633] px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          {/* Play / Pause Button */}
          <button
            onClick={() => setPlaying(!playing)}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-r from-cyan-400 to-sky-500 text-lg font-black text-[#06214a] shadow transition hover:scale-105 cursor-pointer"
            aria-label={playing ? 'Pause animation' : 'Play animation'}
          >
            {playing ? '⏸' : '▶'}
          </button>

          {/* Scrubber Timeline */}
          <div className="flex-1">
            <input
              type="range"
              min={0}
              max={1}
              step={0.005}
              value={t}
              onChange={(e) => seek(parseFloat(e.target.value))}
              className="h-2 w-full appearance-none rounded-full bg-white/20 accent-cyan-400 cursor-pointer"
              aria-label="Animation timeline scrubber"
            />
          </div>

          {/* Speed Toggle (1x / 0.5x) */}
          <button
            onClick={() => setSpeed(speed === 1 ? 0.5 : 1)}
            className="rounded-lg bg-white/15 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-white/25 transition cursor-pointer"
            title="Toggle playback speed"
          >
            {speed === 1 ? '1.0x' : '0.5x Slow'}
          </button>
        </div>

        {/* Phase step pills */}
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {anim.phases.map((p, i) => (
            <button
              key={p.label}
              onClick={() => seek(i === 0 ? 0 : anim.phases[i - 1].end + 0.02)}
              className={cn(
                'rounded-lg px-2.5 py-1 text-[11px] font-bold transition cursor-pointer',
                i === currentPhaseIndex
                  ? 'bg-cyan-400 text-[#06214a] font-black'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              )}
            >
              {i + 1}. {p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
