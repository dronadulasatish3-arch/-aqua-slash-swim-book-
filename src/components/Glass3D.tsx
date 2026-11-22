import { useEffect, useMemo, useRef, useState } from 'react';

// ── geometry (viewBox 300 × 460) ──────────────────────────
const CX = 150;
const RIM_Y = 56;
const BASE_Y = 400;
const OUT_TOP = 100;
const OUT_BOT = 76;
const WALL = 8;
const B = 390; // inner floor (water at 0 drops)
const FULL = 76; // water top at 18 drops
const RY_K = 0.17; // ellipse flattening (perspective)

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const outerRx = (y: number) => lerp(OUT_TOP, OUT_BOT, (y - RIM_Y) / (BASE_Y - RIM_Y));
const innerRx = (y: number) => outerRx(y) - WALL;
const levelY = (count: number) => lerp(B, FULL, count / 18);

const prefersReduced = () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

interface Props {
  settled: number;
  falling: number | null;
  levelDone: boolean[];
  label?: string;
}

/** ONE continuous glass · 18 drops · 3 Glass levels. Interactive 3D-style, spring-animated water. */
export function Glass3D({ settled, falling, levelDone, label }: Props) {
  const reduced = useMemo(prefersReduced, []);
  const [time, setTime] = useState(0);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const level = useRef(settled);
  const vel = useRef(0);
  const dropStart = useRef<{ id: number; t: number } | null>(null);
  const timeRef = useRef(0);
  const fallingRef = useRef(falling);
  fallingRef.current = falling;
  const settledRef = useRef(settled);
  settledRef.current = settled;

  useEffect(() => {
    if (falling != null && dropStart.current?.id !== falling) dropStart.current = { id: falling, t: timeRef.current };
  }, [falling]);

  // animation loop: spring water level + time for waves / bubbles / drop
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(48, now - last);
      last = now;
      timeRef.current += dt;
      const d = dropStart.current;
      const splashed = fallingRef.current != null && d && timeRef.current - d.t >= 1000;
      const target = settledRef.current + (splashed ? 1 : 0);
      if (reduced) {
        level.current = target;
        vel.current = 0;
      } else {
        const force = (target - level.current) * 0.00006 - vel.current * 0.011;
        vel.current += force * dt;
        level.current += vel.current * dt;
      }
      setTime(timeRef.current);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  const S = levelY(clamp(level.current, 0, 18.4));
  const rxS = innerRx(S);
  const wob = reduced ? 0 : Math.sin(time / 380) * 1.2 + Math.min(3, Math.abs(vel.current) * 900);
  const ryS = rxS * RY_K + wob * 0.4;
  const rxB = innerRx(B);
  const ryB = rxB * RY_K;
  const hasWater = level.current > 0.02;
  const pct = Math.round((settled / 18) * 100);

  const drop = dropStart.current && falling != null ? { id: dropStart.current.id, e: time - dropStart.current.t } : null;
  const splashE = drop && drop.e >= 1000 ? drop.e - 1000 : -1;

  const bubbleCount = Math.min(22, 4 + Math.round(level.current * 1.2)) + (splashE >= 0 && splashE < 1600 ? 10 : 0);
  const bubbles = hasWater
    ? Array.from({ length: bubbleCount }, (_, i) => {
        const sp = 0.018 + ((i * 37) % 11) / 600;
        const span = B - S - 8;
        const y = B - 6 - ((time * sp + i * 97) % Math.max(10, span));
        const k = (y - S) / (B - S);
        const x = CX + Math.sin(i * 12.9898 + time / 900) * innerRx(y) * 0.72 * (0.4 + 0.6 * ((i * 7) % 10) / 10);
        return { x, y, r: 1.4 + ((i * 13) % 5) * 0.55, o: clamp(k * 3) };
      })
    : [];

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduced) return;
    const r = e.currentTarget.getBoundingClientRect();
    setTilt({ x: ((e.clientX - r.left) / r.width - 0.5) * 16, y: -((e.clientY - r.top) / r.height - 0.5) * 10 });
  };

  const bodyPath = (y0: number, rx0: number, y1: number, rx1: number, ry1: number) => `M ${CX - rx0} ${y0} L ${CX - rx1} ${y1} A ${rx1} ${ry1} 0 0 0 ${CX + rx1} ${y1} L ${CX + rx0} ${y0} Z`;

  return (
    <div
      className="relative h-full w-full select-none [perspective:900px]"
      onPointerMove={onMove}
      onPointerLeave={() => setTilt({ x: 0, y: 0 })}
      role="img"
      aria-label={`${label ?? 'The Aqua Slash glass'}: ${settled} of 18 drops, ${pct} percent full.${falling ? ` Drop ${falling} is falling in.` : ''}`}
    >
      <div className="h-full w-full transition-transform duration-300 ease-out [transform-style:preserve-3d]" style={{ transform: `rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)` }}>
        <svg viewBox="0 0 300 460" className="mx-auto h-full w-full" aria-hidden>
          <defs>
            <linearGradient id="g3Water" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#0b5fa8" />
              <stop offset="0.3" stopColor="#1aa7e6" />
              <stop offset="0.55" stopColor="#4fd0f2" />
              <stop offset="0.8" stopColor="#1491d4" />
              <stop offset="1" stopColor="#0a4f93" />
            </linearGradient>
            <linearGradient id="g3Depth" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#8ff0ff" stopOpacity="0.25" />
              <stop offset="1" stopColor="#06214a" stopOpacity="0.55" />
            </linearGradient>
            <radialGradient id="g3Surface" cx="0.45" cy="0.4" r="0.7">
              <stop offset="0" stopColor="#e6fdff" />
              <stop offset="0.5" stopColor="#8ff0ff" />
              <stop offset="1" stopColor="#38bdf8" />
            </radialGradient>
            <linearGradient id="g3Glass" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#ffffff" stopOpacity="0.5" />
              <stop offset="0.12" stopColor="#ffffff" stopOpacity="0.12" />
              <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.03" />
              <stop offset="0.86" stopColor="#ffffff" stopOpacity="0.1" />
              <stop offset="1" stopColor="#ffffff" stopOpacity="0.45" />
            </linearGradient>
            <radialGradient id="g3Drop" cx="0.35" cy="0.35" r="0.8">
              <stop offset="0" stopColor="#ffffff" />
              <stop offset="0.35" stopColor="#8ff0ff" />
              <stop offset="1" stopColor="#19a7e6" />
            </radialGradient>
            <radialGradient id="g3Glow">
              <stop offset="0" stopColor="#8ff0ff" stopOpacity="0.9" />
              <stop offset="1" stopColor="#8ff0ff" stopOpacity="0" />
            </radialGradient>
            <filter id="g3Blur" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" />
            </filter>
            <clipPath id="g3Inner">
              <path d={`${bodyPath(RIM_Y + 4, innerRx(RIM_Y + 4), B, rxB, ryB)}`} />
              <ellipse cx={CX} cy={B} rx={rxB} ry={ryB} />
            </clipPath>
          </defs>

          {/* shadow + caustic light on the table */}
          <ellipse cx={CX} cy={BASE_Y + 22} rx={OUT_BOT + 30} ry={14} fill="#020b1f" opacity="0.45" filter="url(#g3Blur)" />
          {hasWater && <ellipse cx={CX + tilt.x} cy={BASE_Y + 22} rx={OUT_BOT * 0.8} ry={8} fill="#38bdf8" opacity={0.18 + 0.2 * (settled / 18)} filter="url(#g3Blur)" />}

          {/* glass back wall */}
          <path d={bodyPath(RIM_Y, OUT_TOP, BASE_Y, OUT_BOT, OUT_BOT * RY_K)} fill="#bfefff" fillOpacity="0.06" />
          <ellipse cx={CX} cy={RIM_Y} rx={OUT_TOP} ry={OUT_TOP * RY_K} fill="none" stroke="#dff8ff" strokeOpacity="0.35" strokeWidth="2" />

          {/* level bands */}
          {[6, 12].map((c) => {
            const y = levelY(c);
            return <ellipse key={c} cx={CX} cy={y} rx={innerRx(y)} ry={innerRx(y) * RY_K} fill="none" stroke="#ffffff" strokeOpacity="0.28" strokeDasharray="3 5" />;
          })}

          {/* WATER */}
          <g clipPath="url(#g3Inner)">
            {hasWater && (
              <>
                <path d={bodyPath(S, rxS, B, rxB, ryB)} fill="url(#g3Water)" />
                <ellipse cx={CX} cy={B} rx={rxB} ry={ryB} fill="url(#g3Water)" />
                <path d={bodyPath(S, rxS, B, rxB, ryB)} fill="url(#g3Depth)" />
                {/* caustics */}
                {!reduced &&
                  Array.from({ length: 5 }).map((_, i) => {
                    const y = lerp(S + 14, B - 10, (i + 0.5) / 5);
                    if (y <= S + 8) return null;
                    const r = innerRx(y) * 0.8;
                    const ph = time / 700 + i;
                    return (
                      <path
                        key={i}
                        d={`M ${CX - r} ${y} Q ${CX - r / 2} ${y - 5 * Math.sin(ph)} ${CX} ${y} T ${CX + r} ${y}`}
                        stroke="#e6fdff"
                        strokeOpacity={0.12 + 0.06 * Math.sin(ph * 1.3)}
                        strokeWidth="2"
                        fill="none"
                      />
                    );
                  })}
                {/* bubbles */}
                {bubbles.map((b, i) => (
                  <g key={i} opacity={b.o}>
                    <circle cx={b.x} cy={b.y} r={b.r} fill="#ffffff" fillOpacity="0.18" stroke="#ffffff" strokeOpacity="0.8" strokeWidth="0.7" />
                    <circle cx={b.x - b.r * 0.35} cy={b.y - b.r * 0.35} r={b.r * 0.3} fill="#ffffff" />
                  </g>
                ))}
                {/* surface */}
                <ellipse cx={CX} cy={S} rx={rxS} ry={ryS} fill="url(#g3Surface)" opacity="0.95" />
                <ellipse cx={CX} cy={S} rx={rxS} ry={ryS} fill="none" stroke="#ffffff" strokeWidth="1.6" opacity="0.9" />
                {!reduced && <ellipse cx={CX - rxS * 0.25 + Math.sin(time / 900) * rxS * 0.2} cy={S - ryS * 0.2} rx={rxS * 0.35} ry={ryS * 0.28} fill="#ffffff" opacity="0.35" />}
                {/* ripples */}
                {splashE >= 0 &&
                  [0, 220, 440].map((delay, i) => {
                    const k = clamp((splashE - delay) / 1200);
                    if (k <= 0 || k >= 1) return null;
                    return <ellipse key={i} cx={CX} cy={S} rx={10 + rxS * 0.9 * k} ry={(10 + rxS * 0.9 * k) * RY_K} fill="none" stroke="#ffffff" strokeWidth={2 * (1 - k) + 0.5} opacity={1 - k} />;
                  })}
              </>
            )}
            {!hasWater && <ellipse cx={CX} cy={B} rx={rxB} ry={ryB} fill="#8ff0ff" opacity="0.08" />}
          </g>

          {/* 18 drop ticks + level labels */}
          {Array.from({ length: 18 }).map((_, i) => {
            const y = levelY(i + 0.5);
            const x = CX - innerRx(y) - 16;
            const on = i < settled;
            return <circle key={i} cx={x} cy={y} r={on ? 3.2 : 2.2} fill={on ? '#8ff0ff' : '#ffffff'} opacity={on ? 1 : 0.25} />;
          })}
          {[0, 1, 2].map((g) => {
            const y = levelY(g * 6 + 3);
            const x = CX + innerRx(y) + 14;
            return (
              <g key={g} transform={`translate(${x} ${y})`}>
                <rect x={-2} y={-9} width={28} height={18} rx={9} fill={levelDone[g] ? '#8ff0ff' : '#06214a'} opacity={levelDone[g] ? 0.95 : 0.6} />
                <text x={12} y={4} textAnchor="middle" fontSize="10" fontWeight="900" fill={levelDone[g] ? '#06214a' : '#bff6ff'}>
                  G{g + 1}
                </text>
              </g>
            );
          })}

          {/* falling drop */}
          {drop && drop.e < 1000 && (() => {
            const a = clamp(drop.e / 350);
            const f = clamp((drop.e - 350) / 650);
            const y = lerp(-20, S - 12, f * f);
            return (
              <g transform={`translate(${CX} ${y}) scale(${0.4 + 0.6 * a})`} opacity={a}>
                <circle r={26} fill="url(#g3Glow)" />
                <line x1={0} y1={-46} x2={0} y2={-16} stroke="#bff6ff" strokeWidth={3} strokeLinecap="round" opacity={0.6 * f} />
                <path d="M 0 -18 C 6 -8 11 -1 11 6 A 11 11 0 0 1 -11 6 C -11 -1 -6 -8 0 -18 Z" fill="url(#g3Drop)" />
                <ellipse cx={-4} cy={3} rx={2.5} ry={4} fill="#ffffff" opacity="0.85" />
                <text y={30} textAnchor="middle" fontSize="10" fontWeight="900" fill="#ffffff">
                  {drop.id}
                </text>
              </g>
            );
          })()}
          {/* splash crown */}
          {splashE >= 0 && splashE < 800 &&
            Array.from({ length: 10 }).map((_, i) => {
              const k = splashE / 800;
              const ang = (i / 10) * Math.PI * 2;
              const vx = Math.cos(ang) * 36;
              const h = 42 * (0.6 + ((i * 7) % 5) / 10);
              return <circle key={i} cx={CX + vx * k} cy={S - h * 4 * k * (1 - k) + Math.sin(ang) * 4 * k} r={2.6 * (1 - k * 0.6)} fill="#e3fbff" opacity={1 - k} />;
            })}

          {/* glass front: highlights + rim */}
          <path d={bodyPath(RIM_Y, OUT_TOP, BASE_Y, OUT_BOT, OUT_BOT * RY_K)} fill="url(#g3Glass)" />
          <path d={`M ${CX - OUT_TOP + 14 - tilt.x * 0.4} ${RIM_Y + 18} L ${CX - OUT_BOT + 12 - tilt.x * 0.4} ${BASE_Y - 24}`} stroke="#ffffff" strokeOpacity="0.45" strokeWidth="7" strokeLinecap="round" />
          <path d={`M ${CX + OUT_TOP - 20 - tilt.x * 0.3} ${RIM_Y + 30} L ${CX + OUT_BOT - 16 - tilt.x * 0.3} ${BASE_Y - 60}`} stroke="#ffffff" strokeOpacity="0.18" strokeWidth="3" strokeLinecap="round" />
          <path d={`M ${CX - OUT_BOT} ${BASE_Y} A ${OUT_BOT} ${OUT_BOT * RY_K} 0 0 0 ${CX + OUT_BOT} ${BASE_Y}`} fill="none" stroke="#dff8ff" strokeOpacity="0.6" strokeWidth="3" />
          <ellipse cx={CX} cy={BASE_Y + 6} rx={OUT_BOT} ry={OUT_BOT * RY_K} fill="none" stroke="#dff8ff" strokeOpacity="0.25" strokeWidth="6" />
          <path d={`M ${CX - OUT_TOP} ${RIM_Y} A ${OUT_TOP} ${OUT_TOP * RY_K} 0 0 0 ${CX + OUT_TOP} ${RIM_Y}`} fill="none" stroke="#f0fdff" strokeWidth="3" />

          {/* full-glass sparkle */}
          {settled === 18 &&
            !reduced &&
            Array.from({ length: 8 }).map((_, i) => {
              const k = ((time / 1400 + i / 8) % 1);
              const ang = (i / 8) * Math.PI * 2 + time / 3000;
              const r = 4 * Math.sin(Math.PI * k);
              const x = CX + Math.cos(ang) * (OUT_TOP + 10);
              const y = RIM_Y + Math.sin(ang) * 22 - 10 * k;
              return <path key={i} d={`M ${x} ${y - r} L ${x + r * 0.3} ${y - r * 0.3} L ${x + r} ${y} L ${x + r * 0.3} ${y + r * 0.3} L ${x} ${y + r} L ${x - r * 0.3} ${y + r * 0.3} L ${x - r} ${y} L ${x - r * 0.3} ${y - r * 0.3} Z`} fill="#ffe066" />;
            })}
        </svg>
      </div>

      {/* percentage badge */}
      <div className="pointer-events-none absolute left-2 top-2 rounded-2xl bg-[#06214a]/75 px-3 py-1.5 text-center text-white shadow-lg backdrop-blur">
        <p className="font-display text-2xl font-semibold leading-none">{pct}%</p>
        <p className="text-[9px] font-extrabold uppercase tracking-widest text-cyan-200">{settled}/18 drops</p>
      </div>
      {settled === 18 && (
        <div className="pointer-events-none absolute right-2 top-2 rounded-full bg-amber-300 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#06214a] shadow">🏆 Glass full</div>
      )}
    </div>
  );
}
