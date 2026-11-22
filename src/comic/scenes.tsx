import type { ReactNode } from "react";
import type { Panel } from "./types";
import { Person } from "./person";
import { Palm, PropView, Tower, Tree, Hut, wavePath } from "./props";

const O = "#111";

const SKIES: Record<string, [string, string]> = {
  day: ["#38bdf8", "#e0f2fe"],
  rain: ["#475569", "#94a3b8"],
  dusk: ["#6d28d9", "#fdba74"],
  night: ["#0b1026", "#1e3a8a"],
  dawn: ["#f472b6", "#fde68a"],
  gray: ["#6b7280", "#d1d5db"],
  storm: ["#1e293b", "#64748b"],
  warm: ["#f59e0b", "#fef3c7"],
};

function Sky({ k }: { k: string }) {
  const [a, b] = SKIES[k] ?? SKIES.day;
  return (
    <g>
      <defs>
        <linearGradient id={`sk-${k}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={a} />
          <stop offset="1" stopColor={b} />
        </linearGradient>
      </defs>
      <rect x={-900} y={-500} width={2200} height={1100} fill={`url(#sk-${k})`} />
      {k === "night" && (
        <g>
          {Array.from({ length: 36 }).map((_, i) => (
            <circle key={i} cx={-250 + ((i * 71) % 900)} cy={(i * 37) % 150} r={i % 4 === 0 ? 2 : 1.2} fill="#fef9c3" />
          ))}
          <circle cx={330} cy={50} r={22} fill="#fef9c3" />
          <circle cx={339} cy={44} r={20} fill="#0f1a45" />
        </g>
      )}
      {(k === "day" || k === "warm") && (
        <g>
          {Array.from({ length: 12 }).map((_, i) => (
            <line key={i} x1={335} y1={58} x2={335 + Math.cos((i * Math.PI) / 6) * 52} y2={58 + Math.sin((i * Math.PI) / 6) * 52} stroke="#fde047" strokeWidth={4} strokeLinecap="round" />
          ))}
          <circle cx={335} cy={58} r={28} fill="#fde047" stroke={O} strokeWidth={3} />
        </g>
      )}
      {k === "dawn" && <circle cx={200} cy={150} r={56} fill="#fb923c" stroke={O} strokeWidth={3} />}
      {k === "dusk" && <circle cx={290} cy={150} r={44} fill="#fb923c" stroke={O} strokeWidth={3} />}
      {k !== "night" && (
        <g className="drift" opacity={k === "storm" || k === "rain" ? 0.9 : 1}>
          {[[70, 50, 1], [220, 30, 0.8], [-110, 40, 1.1], [470, 60, 0.9]].map(([cx, cy, sc], i) => (
            <g key={i} transform={`translate(${cx} ${cy}) scale(${sc})`} fill={k === "storm" || k === "rain" ? "#cbd5e1" : "#fff"} stroke={O} strokeWidth={2.5}>
              <ellipse cx={0} cy={0} rx={28} ry={12} />
              <ellipse cx={-14} cy={-8} rx={16} ry={11} />
              <ellipse cx={12} cy={-10} rx={18} ry={13} />
            </g>
          ))}
        </g>
      )}
    </g>
  );
}

function Rain() {
  return (
    <g className="rain" stroke="#e2e8f0" strokeWidth={1.6} opacity={0.7}>
      {Array.from({ length: 90 }).map((_, i) => {
        const x = -260 + ((i * 37) % 760);
        const y = ((i * 53) % 330) - 30;
        return <line key={i} x1={x} y1={y} x2={x - 7} y2={y + 18} />;
      })}
    </g>
  );
}

const Hills = ({ y, c, amp = 40 }: { y: number; c: string; amp?: number }) => (
  <path d={`M-900 ${y} Q-600 ${y - amp} -300 ${y} T300 ${y} T900 ${y} T1300 ${y} L1300 600 L-900 600Z`} fill={c} stroke={O} strokeWidth={2.5} />
);

const Fields = ({ y = 160, far = "#86efac", ground = "#22c55e" }: { y?: number; far?: string; ground?: string }) => (
  <g>
    <Hills y={y - 6} c={far} amp={50} />
    <rect x={-900} y={y} width={2200} height={500} fill={ground} stroke={O} strokeWidth={2.5} />
  </g>
);

const at = (x: number, y: number, s: number, n: ReactNode) => <g transform={`translate(${x} ${y}) scale(${s})`}>{n}</g>;

const Waves = ({ ys, c, op = 1 }: { ys: number[]; c: string; op?: number }) => (
  <g>
    {ys.map((y, i) => (
      <g key={y} className="wave" style={{ animationDuration: `${2.4 + i * 0.55}s` }}>
        <path d={wavePath(y, 6)} fill="none" stroke={c} strokeWidth={3} strokeLinecap="round" opacity={op} />
      </g>
    ))}
  </g>
);

function River({ flood, high }: { flood?: boolean; high?: boolean }) {
  const water = flood ? "#c28a2c" : "#38bdf8";
  const line = flood ? "#7c4a12" : "#e0f2fe";
  return (
    <g>
      <Fields y={118} />
      {[-60, 60, 180, 320, 450].map((x) => <g key={x}>{at(x, 128, 0.42, <Tree />)}</g>)}
      <rect x={-900} y={128} width={2200} height={500} fill={water} stroke={O} strokeWidth={3} />
      <Waves ys={[150, 182, 214, 246, 278, 310]} c={line} />
      {flood && (
        <g>
          <path d="M270 190 l36 -6" stroke="#7c4a1d" strokeWidth={5} strokeLinecap="round" />
          <path d="M120 232 l30 5 M128 236 l-8 -10" stroke="#7c4a1d" strokeWidth={4} strokeLinecap="round" />
        </g>
      )}
      <path d={high ? "M-900 168 L40 172 Q96 182 112 226 L128 600 L-900 600Z" : "M-900 232 L40 236 Q100 246 118 300 L140 600 L-900 600Z"} fill={flood ? "#6b8e23" : "#84cc16"} stroke={O} strokeWidth={3} />
      <path d={high ? "M-900 182 L38 186 Q86 196 100 226" : "M-900 244 L38 247 Q88 256 104 300"} fill="none" stroke="#a16207" strokeWidth={5} opacity={0.7} />
    </g>
  );
}

function Well({ sad }: { sad?: boolean }) {
  return (
    <g>
      <Fields y={150} />
      {at(40, 168, 0.9, <Hut />)}
      {at(-80, 168, 0.8, <Hut />)}
      {at(345, 170, 1, <Palm />)}
      {at(-150, 170, 1, <Palm />)}
      {at(470, 170, 1, <Palm />)}
      <ellipse cx={200} cy={252} rx={260} ry={46} fill="#e4b676" stroke={O} strokeWidth={2.5} />
      <path d="M155 196 V118 M245 196 V118 M149 118 H251" fill="none" stroke={O} strokeWidth={7} />
      <path d="M155 196 V118 M245 196 V118 M149 118 H251" fill="none" stroke="#7c4a1d" strokeWidth={3.5} />
      <circle cx={200} cy={122} r={8} fill="#facc15" stroke={O} strokeWidth={3} />
      <path d="M200 130 V186" stroke="#7c4a1d" strokeWidth={3} />
      <rect x={146} y={196} width={108} height={54} fill="#a8a29e" stroke={O} strokeWidth={4} />
      <path d="M146 214 H254 M146 232 H254 M180 196 V214 M220 196 V214 M164 214 V232 M200 214 V232 M238 214 V232 M180 232 V250 M220 232 V250" stroke={O} strokeWidth={1.5} opacity={0.5} />
      <ellipse cx={200} cy={196} rx={54} ry={15} fill="#d6d3d1" stroke={O} strokeWidth={4} />
      <ellipse cx={200} cy={197} rx={41} ry={10} fill={sad ? "#1e3a5f" : "#0ea5e9"} stroke={O} strokeWidth={3} />
    </g>
  );
}

function Lake() {
  return (
    <g>
      <Hills y={150} c="#94a3b8" amp={80} />
      <rect x={-900} y={152} width={2200} height={500} fill="#0ea5e9" stroke={O} strokeWidth={3} />
      <Waves ys={[172, 200, 228]} c="#e0f2fe" op={0.8} />
      <path d="M-900 266 Q-100 246 200 266 T900 266 L900 600 L-900 600Z" fill="#a3e635" stroke={O} strokeWidth={3} />
      {[340, 360, 380].map((x, i) => (
        <g key={x}>
          <line x1={x} y1={262} x2={x - 3} y2={228 - i * 5} stroke="#92400e" strokeWidth={3} />
          <ellipse cx={x - 3} cy={224 - i * 5} rx={3.5} ry={9} fill="#7c4a1d" stroke={O} strokeWidth={1.5} />
        </g>
      ))}
    </g>
  );
}

function Quarry() {
  return (
    <g>
      <path d="M-900 70 L-700 40 L-500 62 L-300 38 L-100 60 L100 36 L300 58 L500 40 L700 62 L900 38 L1300 60 L1300 190 L-900 190Z" fill="#c98f52" stroke={O} strokeWidth={3} />
      <path d="M-900 100 H1300 M-900 130 H1300 M-900 160 H1300" stroke="#8b5a2b" strokeWidth={3} opacity={0.5} />
      <rect x={-900} y={188} width={2200} height={500} fill="#0f766e" stroke={O} strokeWidth={3} />
      <Waves ys={[212, 240, 268, 296]} c="#134e4a" />
      <path d="M-900 150 L110 150 L96 196 L128 246 L88 330 L70 600 L-900 600Z" fill="#8b5a2b" stroke={O} strokeWidth={3.5} />
      <path d="M-900 168 H100 M-900 190 H90 M-900 214 H100" stroke="#5b3413" strokeWidth={3} opacity={0.5} />
      <path d="M1300 160 L300 160 L316 200 L284 250 L324 330 L340 600 L1300 600Z" fill="#a16207" stroke={O} strokeWidth={3.5} />
      <path d="M-900 150 H110" stroke="#4d7c0f" strokeWidth={8} />
    </g>
  );
}

function Pool({ back }: { back: string }) {
  return (
    <g>
      {back === "college" && (
        <g>
          <rect x={-900} y={55} width={2200} height={72} fill="#fde68a" stroke={O} strokeWidth={3} />
          {Array.from({ length: 22 }).map((_, i) => (
            <rect key={i} x={-480 + i * 50} y={72} width={26} height={30} fill="#38bdf8" stroke={O} strokeWidth={2.5} />
          ))}
          <rect x={-900} y={50} width={2200} height={10} fill="#d97706" stroke={O} strokeWidth={3} />
        </g>
      )}
      {back === "towers" && (
        <g>
          {[[-150, "#fda4af"], [-30, "#fcd34d"], [95, "#a5b4fc"], [215, "#86efac"], [335, "#fdba74"], [455, "#fda4af"]].map(([x, c], i) =>
            at(x as number, 130, 1, <Tower color={c as string} w={90} h={i % 2 ? 150 : 128} />)
          )}
          {at(40, 132, 0.6, <Tree />)}
          {at(380, 132, 0.6, <Tree />)}
        </g>
      )}
      {back === "club" && (
        <g>
          <rect x={-900} y={70} width={2200} height={58} fill="#fecaca" stroke={O} strokeWidth={3} />
          <rect x={-900} y={58} width={2200} height={14} fill="#b91c1c" stroke={O} strokeWidth={3} />
          {at(60, 130, 0.9, <Palm />)}
          {at(340, 130, 0.9, <Palm />)}
        </g>
      )}
      <rect x={-900} y={126} width={2200} height={90} fill="#22d3ee" stroke={O} strokeWidth={3} />
      {[146, 166, 186].map((y, i) => (
        <line key={y} x1={-900} x2={1300} y1={y} y2={y} stroke={i === 1 ? "#facc15" : "#ef4444"} strokeWidth={5} strokeDasharray="9 5" />
      ))}
      <Waves ys={[136, 156, 176, 200]} c="#ecfeff" op={0.6} />
      <rect x={-900} y={214} width={2200} height={500} fill="#e5e7eb" stroke={O} strokeWidth={3} />
      {Array.from({ length: 40 }).map((_, i) => {
        const x = -800 + i * 60;
        return <line key={i} x1={x} y1={214} x2={(x - 200) * 1.7 + 200} y2={420} stroke="#cbd5e1" strokeWidth={2} />;
      })}
      {[244, 290, 350].map((y) => <line key={y} x1={-900} x2={1300} y1={y} y2={y} stroke="#cbd5e1" strokeWidth={2} />)}
    </g>
  );
}

function Plant() {
  return (
    <g>
      <rect x={-900} y={-300} width={2200} height={540} fill="#cbd5e1" stroke={O} strokeWidth={3} />
      <rect x={-900} y={228} width={2200} height={500} fill="#78716c" stroke={O} strokeWidth={3} />
      <path d="M-900 120 H1300" stroke="#94a3b8" strokeWidth={3} />
      <rect x={20} y={60} width={90} height={168} fill="#38bdf8" stroke={O} strokeWidth={4} />
      <ellipse cx={65} cy={60} rx={45} ry={12} fill="#7dd3fc" stroke={O} strokeWidth={4} />
      <path d="M20 100 H110 M20 140 H110 M20 180 H110" stroke={O} strokeWidth={2} opacity={0.4} />
      <rect x={150} y={110} width={46} height={118} rx={10} fill="#fb923c" stroke={O} strokeWidth={4} />
      <rect x={210} y={130} width={40} height={98} rx={10} fill="#a78bfa" stroke={O} strokeWidth={4} />
      <path d="M110 190 H150 M196 150 H210 M130 190 V240 M170 110 V70 H320" fill="none" stroke={O} strokeWidth={11} strokeLinecap="round" />
      <path d="M110 190 H150 M196 150 H210 M130 190 V240 M170 110 V70 H320" fill="none" stroke="#3b82f6" strokeWidth={6} strokeLinecap="round" />
      <circle cx={300} cy={46} r={26} fill="#fff" stroke={O} strokeWidth={4} />
      <path d="M300 46 L314 32" stroke="#ef4444" strokeWidth={3.5} strokeLinecap="round" />
      <path d="M282 56 A22 22 0 0 1 318 56" fill="none" stroke="#16a34a" strokeWidth={3} />
      <circle cx={170} cy={70} r={9} fill="#ef4444" stroke={O} strokeWidth={3} />
    </g>
  );
}

function City({ night }: { night?: boolean }) {
  return (
    <g>
      {Array.from({ length: 16 }).map((_, i) => {
        const h = 70 + ((i * 41) % 80);
        return (
          <g key={i}>
            <rect x={-330 + i * 56} y={205 - h} width={46} height={h} fill={i % 2 ? "#94a3b8" : "#a5b4c8"} stroke={O} strokeWidth={2.5} />
            {Array.from({ length: Math.floor(h / 22) }).map((__, r) => (
              <rect key={r} x={-322 + i * 56} y={212 - h + r * 22} width={10} height={10} fill={night ? "#fde047" : "#e0f2fe"} />
            ))}
          </g>
        );
      })}
      <g>
        <rect x={150} y={96} width={100} height={110} fill="#e7d3a8" stroke={O} strokeWidth={3.5} />
        <rect x={142} y={88} width={116} height={12} fill="#d9b97a" stroke={O} strokeWidth={3} />
        <path d="M168 206 V150 Q168 128 185 128 Q202 128 202 150 V206 M198 206 V150 Q198 128 215 128 Q232 128 232 150 V206" fill="#7c4a1d" stroke={O} strokeWidth={3} />
        {[136, 244].map((mx) => (
          <g key={mx}>
            <rect x={mx - 7} y={30} width={14} height={176} fill="#e7d3a8" stroke={O} strokeWidth={3.5} />
            <rect x={mx - 10} y={56} width={20} height={6} fill="#d9b97a" stroke={O} strokeWidth={2.5} />
            <rect x={mx - 10} y={90} width={20} height={6} fill="#d9b97a" stroke={O} strokeWidth={2.5} />
            <path d={`M${mx - 9} 30 Q${mx} 8 ${mx + 9} 30Z`} fill="#fde68a" stroke={O} strokeWidth={3} />
          </g>
        ))}
        <path d="M175 88 Q200 56 225 88Z" fill="#fde68a" stroke={O} strokeWidth={3} />
      </g>
      <rect x={-900} y={205} width={2200} height={500} fill="#64748b" stroke={O} strokeWidth={3} />
      <rect x={-900} y={205} width={2200} height={22} fill="#cbd5e1" stroke={O} strokeWidth={2.5} />
      <path d="M-900 290 H1300" stroke="#fde047" strokeWidth={5} strokeDasharray="26 18" />
    </g>
  );
}

function Delhi() {
  return (
    <g>
      <Fields y={170} ground="#4ade80" far="#bbf7d0" />
      {at(40, 180, 0.8, <Tree />)}
      {at(360, 180, 0.8, <Tree />)}
      {at(-120, 180, 0.8, <Tree />)}
      {at(520, 180, 0.8, <Tree />)}
      <rect x={136} y={52} width={128} height={14} fill="#b45309" stroke={O} strokeWidth={3} />
      <rect x={150} y={66} width={100} height={116} fill="#d97706" stroke={O} strokeWidth={3.5} />
      <path d="M172 182 V120 Q200 70 228 120 V182Z" fill="#7c2d12" stroke={O} strokeWidth={3.5} />
      <rect x={156} y={78} width={88} height={8} fill="#b45309" stroke={O} strokeWidth={2} />
      <path d="M-900 240 Q200 200 1300 240 V600 H-900Z" fill="#9ca3af" stroke={O} strokeWidth={3} />
      <path d="M-900 262 Q200 226 1300 262" fill="none" stroke="#fff" strokeWidth={4} strokeDasharray="24 16" />
    </g>
  );
}

function Room({ col = "#fef3c7", night }: { col?: string; night?: boolean }) {
  return (
    <g>
      <rect x={-900} y={-400} width={2200} height={640} fill={col} stroke={O} strokeWidth={3} />
      <rect x={-900} y={226} width={2200} height={500} fill="#b45309" stroke={O} strokeWidth={3} />
      <rect x={-900} y={218} width={2200} height={10} fill="#78350f" stroke={O} strokeWidth={2.5} />
      {[0, 70, 140, 210, 280].map((y) => <line key={y} x1={-900} x2={1300} y1={250 + y * 0.5} y2={250 + y * 0.5} stroke="#92400e" strokeWidth={2} />)}
      <rect x={290} y={40} width={80} height={86} fill={night ? "#1e3a8a" : "#7dd3fc"} stroke={O} strokeWidth={4} />
      <path d="M330 40 V126 M290 83 H370" stroke={O} strokeWidth={4} />
      {night && <circle cx={348} cy={64} r={8} fill="#fef9c3" />}
      <rect x={40} y={58} width={54} height={44} fill="#fff" stroke={O} strokeWidth={4} />
      <path d="M48 94 l12 -16 l10 10 l8 -8 l8 14Z" fill="#4ade80" />
      <circle cx={80} cy={70} r={5} fill="#fde047" />
    </g>
  );
}

function Shop() {
  const stack = (x: number, n: number) =>
    Array.from({ length: n }).flatMap((_, r) =>
      Array.from({ length: n - r }).map((__, c) => (
        <g key={`${x}-${r}-${c}`} transform={`translate(${x + c * 38 + r * 19} ${232 - r * 34})`}>
          <path d="M-18 0 Q-22 -20 -12 -28 L12 -28 Q22 -20 18 0Z" fill="#f5deb3" stroke={O} strokeWidth={3} />
          <rect x={-7} y={-32} width={14} height={6} rx={2} fill="#d6b97f" stroke={O} strokeWidth={2} />
        </g>
      ))
    );
  return (
    <g>
      <rect x={-900} y={-400} width={2200} height={640} fill="#92400e" stroke={O} strokeWidth={3} />
      <rect x={-900} y={90} width={2200} height={8} fill="#5b3413" />
      <rect x={-900} y={232} width={2200} height={500} fill="#a8a29e" stroke={O} strokeWidth={3} />
      {stack(-20, 4)}
      {stack(270, 3)}
      <rect x={-900} y={30} width={2200} height={6} fill="#5b3413" />
    </g>
  );
}

function Village() {
  return (
    <g>
      <Fields y={165} />
      {at(60, 185, 1, <Hut />)}
      {at(320, 185, 1.1, <Hut />)}
      {at(-150, 185, 1, <Hut />)}
      {at(460, 185, 1, <Hut />)}
      {at(190, 172, 0.9, <Palm />)}
      <path d="M-900 262 Q100 215 200 215 Q300 215 1300 262 V600 H-900Z" fill="#e4b676" stroke={O} strokeWidth={3} />
    </g>
  );
}

function Farm() {
  return (
    <g>
      <Fields y={125} ground="#65a30d" far="#bef264" />
      {at(70, 130, 0.6, <Hut />)}
      {at(330, 132, 0.5, <Tree />)}
      {Array.from({ length: 15 }).map((_, i) => {
        const dx = i - 7;
        return <line key={i} x1={200 + dx * 14} y1={126} x2={200 + dx * 190} y2={420} stroke="#166534" strokeWidth={4} opacity={0.75} />;
      })}
      {Array.from({ length: 30 }).map((_, i) => (
        <circle key={i} cx={-130 + ((i * 59) % 520)} cy={150 + ((i * 31) % 130)} r={3.5} fill="#4d7c0f" stroke={O} strokeWidth={1.2} />
      ))}
    </g>
  );
}

function Burst({ col = "#fde047" }: { col?: string }) {
  return (
    <g>
      <rect x={-900} y={-500} width={2200} height={1100} fill={col} />
      {Array.from({ length: 24 }).map((_, i) => {
        const a0 = (i * 15 * Math.PI) / 180;
        const a1 = a0 + (7.5 * Math.PI) / 180;
        return (
          <path key={i} d={`M200 150 L${200 + Math.cos(a0) * 1400} ${150 + Math.sin(a0) * 1400} L${200 + Math.cos(a1) * 1400} ${150 + Math.sin(a1) * 1400}Z`} fill="#fff" opacity={0.2} />
        );
      })}
    </g>
  );
}

function Road() {
  return (
    <g>
      <Fields y={160} />
      {at(-60, 176, 0.8, <Tree />)}
      {at(70, 172, 0.65, <Tree />)}
      {at(345, 172, 0.7, <Tree />)}
      {at(470, 176, 0.8, <Tree />)}
      <path d="M165 160 L235 160 L580 330 L-180 330Z" fill="#e9b872" stroke={O} strokeWidth={3} />
      <path d="M200 166 V176 M200 192 V212 M200 232 V262" stroke="#c8934d" strokeWidth={5} strokeLinecap="round" />
      <rect x={-900} y={326} width={2200} height={300} fill="#22c55e" />
      <path d="M-180 330 L580 330" stroke={O} strokeWidth={0} />
    </g>
  );
}

const DEFAULT_SKY: Record<string, string> = {
  flood: "rain", floodhigh: "storm", well: "day", lake: "day", quarry: "warm", pool: "day", road: "day", river: "day",
  village: "day", farm: "warm", delhi: "day", city: "day",
};

function Background({ p }: { p: Panel }) {
  const bg = p.bg ?? "road";
  const night = (p.dim ?? 0) > 0.3;
  switch (bg) {
    case "road": return <Road />;
    case "river": return <River />;
    case "flood": return <River flood />;
    case "floodhigh": return <River flood high />;
    case "well": return <Well />;
    case "wellsad": return <Well sad />;
    case "lake": return <Lake />;
    case "quarry": return <Quarry />;
    case "pool": return <Pool back="college" />;
    case "community": return <Pool back="towers" />;
    case "club": return <Pool back="club" />;
    case "plant": return <Plant />;
    case "city": return <City night={night} />;
    case "delhi": return <Delhi />;
    case "room": return <Room col={p.col} night={night} />;
    case "class": return <Room col="#e2e8f0" night={night} />;
    case "shop": return <Shop />;
    case "village": return <Village />;
    case "farm": return <Farm />;
    case "burst": return <Burst col={p.col} />;
    default: return <Road />;
  }
}

export function Scene({ p }: { p: Panel }) {
  const bg = p.bg ?? "road";
  const sky = p.sky ?? DEFAULT_SKY[bg] ?? "day";
  const props = p.p ?? [];
  return (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 h-full w-full" style={{ overflow: "visible" }}>
      <Sky k={sky} />
      <Background p={p} />
      {props.filter((x) => !x[0].startsWith("^")).map((x, i) => <PropView key={`b${i}`} p={x} />)}
      {(p.c ?? []).map((c, i) => <Person key={i} {...c} />)}
      {props.filter((x) => x[0].startsWith("^")).map((x, i) => <PropView key={`f${i}`} p={x} />)}
      {(sky === "rain" || sky === "storm") && <Rain />}
      {p.dim ? <rect x={-900} y={-500} width={2200} height={1100} fill="#0b1026" opacity={p.dim} /> : null}
    </svg>
  );
}

export { Hut, Tree };
