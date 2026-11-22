import type { ReactNode } from "react";
import type { Prop } from "./types";
import { Item } from "./person";

const O = "#111";

export const Txt = ({
  x, y, size = 30, fill = "#fde047", stroke = O, sw = 6, children, anchor = "middle", rot = 0, ls = 1,
}: {
  x: number; y: number; size?: number; fill?: string; stroke?: string; sw?: number;
  children: ReactNode; anchor?: string; rot?: number; ls?: number;
}) => {
  const n = typeof children === "string" ? children.length : 0;
  const fs = n && n * size * 0.5 > 370 ? 370 / (n * 0.5) : size;
  return (
  <text
    x={x} y={y} textAnchor={anchor as "middle"} fontFamily="Bangers, Impact, sans-serif" fontSize={fs}
    fill={fill} stroke={stroke} strokeWidth={sw} paintOrder="stroke" strokeLinejoin="round"
    letterSpacing={ls} transform={rot ? `rotate(${rot} ${x} ${y})` : undefined}
  >
    {children}
  </text>
  );
};

export const wavePath = (y: number, amp = 6, reps = 55) =>
  `M-900 ${y}` + ` q10 -${amp} 20 0 t20 0`.repeat(reps);

const star = (n: number, r1: number, r2: number) => {
  const pts: string[] = [];
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 === 0 ? r1 : r2;
    const a = (Math.PI * i) / n;
    pts.push(`${(Math.cos(a) * r).toFixed(1)},${(Math.sin(a) * r).toFixed(1)}`);
  }
  return pts.join(" ");
};

export function Tree({ s = 1 }: { s?: number }) {
  return (
    <g transform={`scale(${s})`}>
      <rect x={-6} y={-52} width={12} height={52} fill="#7c4a1d" stroke={O} strokeWidth={3} />
      <circle cx={-21} cy={-48} r={19} fill="#15803d" stroke={O} strokeWidth={3} />
      <circle cx={21} cy={-48} r={19} fill="#15803d" stroke={O} strokeWidth={3} />
      <circle cx={0} cy={-64} r={27} fill="#16a34a" stroke={O} strokeWidth={3} />
    </g>
  );
}

export function Palm({ s = 1 }: { s?: number }) {
  const fronds = [-70, -35, 0, 35, 70, -105, 105];
  return (
    <g transform={`scale(${s})`}>
      <path d="M-5 0 Q-14 -50 4 -100 L12 -98 Q-2 -50 8 0Z" fill="#a16207" stroke={O} strokeWidth={3} />
      <g transform="translate(8 -100)">
        {fronds.map((a) => (
          <path key={a} transform={`rotate(${a})`} d="M0 0 Q8 -18 4 -44 Q-8 -20 0 0Z" fill="#16a34a" stroke={O} strokeWidth={2.5} />
        ))}
        <circle cx={-3} cy={4} r={5} fill="#854d0e" stroke={O} strokeWidth={2} />
        <circle cx={5} cy={5} r={5} fill="#854d0e" stroke={O} strokeWidth={2} />
      </g>
    </g>
  );
}

export function Hut({ s = 1 }: { s?: number }) {
  return (
    <g transform={`scale(${s})`}>
      <rect x={-34} y={-42} width={68} height={42} fill="#fcd9a8" stroke={O} strokeWidth={3} />
      <path d="M-44 -40 L0 -80 L44 -40Z" fill="#a16207" stroke={O} strokeWidth={3} strokeLinejoin="round" />
      <path d="M-30 -48 L0 -74 M-14 -45 L10 -68 M2 -44 L22 -62" stroke="#78350f" strokeWidth={2} />
      <rect x={-8} y={-26} width={16} height={26} fill="#78350f" stroke={O} strokeWidth={2.5} />
      <rect x={14} y={-32} width={13} height={12} fill="#7dd3fc" stroke={O} strokeWidth={2.5} />
    </g>
  );
}

export const Tower = ({ color = "#fda4af", w = 50, h = 120 }: { color?: string; w?: number; h?: number }) => {
  const cols = Math.floor(w / 17);
  const rows = Math.floor(h / 22);
  const wins: ReactNode[] = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      wins.push(
        <rect key={`${r}-${c}`} x={-w / 2 + 6 + c * 17} y={-h + 8 + r * 22} width={10} height={13} fill={(r * 3 + c) % 5 === 0 ? "#fde047" : "#bae6fd"} stroke={O} strokeWidth={1.5} />
      );
  return (
    <g>
      <rect x={-w / 2} y={-h} width={w} height={h} fill={color} stroke={O} strokeWidth={3} />
      {wins}
    </g>
  );
};

export function PropView({ p }: { p: Prop }) {
  const [raw, x, y, s = 1, a, b] = p;
  const t = raw.replace("^", "");
  const txt = Array.isArray(a) ? a.join(" ") : a;
  const g = (n: ReactNode) => <g transform={`translate(${x} ${y}) scale(${s})`}>{n}</g>;
  switch (t) {
    case "tree": return g(<Tree />);
    case "palm": return g(<Palm />);
    case "hut": return g(<Hut />);
    case "tower": return g(<Tower color={b || "#fda4af"} />);
    case "splash":
      return g(<>
        <polygon points={star(9, 30, 16)} fill="#fff" stroke={O} strokeWidth={3} />
        <circle cx={-34} cy={-22} r={5} fill="#e0f2fe" stroke={O} strokeWidth={2} />
        <circle cx={36} cy={-26} r={6} fill="#e0f2fe" stroke={O} strokeWidth={2} />
        <circle cx={4} cy={-42} r={4} fill="#e0f2fe" stroke={O} strokeWidth={2} />
      </>);
    case "grass":
      return g(<>
        {txt === "tear" && (
          <>
            <path d="M-10 4 l-5 18 M0 4 l3 24 M9 4 l7 16 M-4 4 l-9 10" stroke="#7c4a1d" strokeWidth={3} strokeLinecap="round" fill="none" />
            <circle cx={-14} cy={26} r={4} fill="#78350f" /><circle cx={16} cy={22} r={3} fill="#78350f" />
          </>
        )}
        <ellipse cx={0} cy={4} rx={26} ry={8} fill="#78350f" stroke={O} strokeWidth={2.5} />
        {[[-16, -26, -22], [-8, -34, -10], [0, -38, 2], [8, -32, 12], [16, -24, 22]].map(([sx, ty, tx], i) => (
          <path key={i} d={`M${sx - 3} 2 Q${sx} ${ty / 2} ${tx} ${ty} Q${sx + 5} ${ty / 2} ${sx + 3} 2Z`} fill="#22c55e" stroke={O} strokeWidth={2} />
        ))}
      </>);
    case "hand":
      return (
        <g>
          <line x1={x + 34} y1={-70} x2={x} y2={y} stroke={O} strokeWidth={32} strokeLinecap="round" />
          <line x1={x + 34} y1={-70} x2={x} y2={y} stroke="#9a5f32" strokeWidth={25} strokeLinecap="round" />
          <line x1={x + 34} y1={-70} x2={x + 34 + (x - x - 34) * 0.5} y2={-70 + (y + 70) * 0.5} stroke="#15803d" strokeWidth={28} strokeLinecap="butt" />
          <circle cx={x} cy={y} r={15} fill="#9a5f32" stroke={O} strokeWidth={3} />
          {[-9, -3, 3, 9].map((d) => (
            <g key={d}>
              <line x1={x + d} y1={y + 6} x2={x + d} y2={y + 24} stroke={O} strokeWidth={8} strokeLinecap="round" />
              <line x1={x + d} y1={y + 6} x2={x + d} y2={y + 24} stroke="#9a5f32" strokeWidth={4.5} strokeLinecap="round" />
            </g>
          ))}
        </g>
      );
    case "lunch": return g(<Item t="lunch" x={0} y={0} />);
    case "ball": return g(<Item t="ball" x={0} y={0} />);
    case "drop":
      return g(<path d="M0 -16 C0 -16 -11 0 -11 6 A11 11 0 0 0 11 6 C11 0 0 -16 0 -16Z" fill={b || "#38bdf8"} stroke={O} strokeWidth={2.5} />);
    case "question": return g(<Txt x={0} y={0} size={64} rot={-8}>?</Txt>);
    case "exclaim": return g(<Txt x={0} y={0} size={64} fill="#f87171" rot={6}>!</Txt>);
    case "clock":
      return g(<>
        <rect x={-36} y={-20} width={72} height={38} rx={7} fill="#111" stroke="#fff" strokeWidth={3} />
        <text x={0} y={9} textAnchor="middle" fontFamily="Bangers, monospace" fontSize={26} fill="#4ade80" letterSpacing={2}>{txt}</text>
      </>);
    case "flag":
      return g(<>
        <line x1={0} y1={0} x2={0} y2={-80} stroke={O} strokeWidth={4} />
        <rect x={0} y={-80} width={42} height={9} fill="#f97316" stroke={O} strokeWidth={1.5} />
        <rect x={0} y={-71} width={42} height={9} fill="#fff" stroke={O} strokeWidth={1.5} />
        <rect x={0} y={-62} width={42} height={9} fill="#16a34a" stroke={O} strokeWidth={1.5} />
        <circle cx={21} cy={-66.5} r={3.2} fill="none" stroke="#1d4ed8" strokeWidth={1.4} />
      </>);
    case "gate":
      return g(<>
        {[-52, 2].map((gx) => (
          <g key={gx}>
            <rect x={gx} y={-92} width={50} height={92} fill="#475569" fillOpacity={0.25} stroke={O} strokeWidth={4} />
            {[8, 18, 28, 38, 48].map((d) => <line key={d} x1={gx + d - 4} y1={-92} x2={gx + d - 4} y2={0} stroke={O} strokeWidth={3} />)}
          </g>
        ))}
        <path d="M-40 -48 q20 14 40 0 t40 0" fill="none" stroke="#9ca3af" strokeWidth={6} />
        <rect x={-8} y={-44} width={16} height={14} rx={3} fill="#fbbf24" stroke={O} strokeWidth={2.5} />
      </>);
    case "mask":
      return g(<>
        <path d="M-16 -3 q-9 6 -2 14 M16 -3 q9 6 2 14" fill="none" stroke={O} strokeWidth={2} />
        <rect x={-17} y={-9} width={34} height={20} rx={7} fill="#7dd3fc" stroke={O} strokeWidth={2.5} />
        <path d="M-12 -3 h24 M-12 2 h24 M-12 7 h24" stroke="#0ea5e9" strokeWidth={1.4} />
      </>);
    case "sack": return g(<Item t="sack" x={0} y={0} />);
    case "comic":
      return g(<>
        <rect x={-17} y={-24} width={34} height={26} rx={2} fill="#facc15" stroke={O} strokeWidth={2.5} />
        <polygon points={star(6, 9, 5)} transform="translate(0 -11)" fill="#ef4444" stroke={O} strokeWidth={1.5} />
        <path d="M-12 -4 h24" stroke={O} strokeWidth={1.5} />
      </>);
    case "bed":
      return g(<>
        <rect x={-76} y={-24} width={152} height={26} rx={3} fill="#7c4a1d" stroke={O} strokeWidth={3} />
        <rect x={-72} y={-44} width={144} height={22} rx={6} fill="#e0f2fe" stroke={O} strokeWidth={3} />
        <rect x={-68} y={-56} width={36} height={14} rx={7} fill="#fff" stroke={O} strokeWidth={3} />
        <rect x={-76} y={-60} width={8} height={62} fill="#5b3413" stroke={O} strokeWidth={3} />
        <rect x={68} y={-40} width={8} height={42} fill="#5b3413" stroke={O} strokeWidth={3} />
      </>);
    case "cert":
      return g(<>
        <rect x={-30} y={-22} width={60} height={42} fill="#fff" stroke={O} strokeWidth={3} />
        <rect x={-25} y={-17} width={50} height={32} fill="none" stroke="#d97706" strokeWidth={2} />
        <Txt x={0} y={-2} size={17} sw={3} fill="#0f766e">{txt || "CERTIFICATE"}</Txt>
        <circle cx={0} cy={9} r={5} fill="#ef4444" stroke={O} strokeWidth={1.5} />
      </>);
    case "sign":
      return g(<>
        <rect x={-4} y={-50} width={8} height={50} fill="#7c4a1d" stroke={O} strokeWidth={2.5} />
        <rect x={-48} y={-86} width={96} height={38} rx={5} fill="#fde68a" stroke={O} strokeWidth={3} />
        <Txt x={0} y={-61} size={Math.min(17, 170 / Math.max(1, (txt || "").length))} sw={0} fill="#7c2d12">{txt}</Txt>
      </>);
    case "txt": return <Txt x={x} y={y} size={28 * s} fill={b || "#fde047"}>{txt}</Txt>;
    case "podium":
      return g(<>
        <rect x={-78} y={-42} width={52} height={42} fill="#cbd5e1" stroke={O} strokeWidth={3} />
        <rect x={-26} y={-62} width={52} height={62} fill="#fde047" stroke={O} strokeWidth={3} />
        <rect x={26} y={-28} width={52} height={28} fill="#d6a05f" stroke={O} strokeWidth={3} />
        <Txt x={-52} y={-14} size={26} sw={4} fill="#fff">2</Txt>
        <Txt x={0} y={-22} size={30} sw={4} fill="#fff">1</Txt>
        <Txt x={52} y={-6} size={22} sw={4} fill="#fff">3</Txt>
      </>);
    case "bulb":
      return g(<>
        {[0, 45, 90, 135, 180, 225, 270, 315].map((r) => (
          <line key={r} x1={0} y1={-20} x2={0} y2={-30} stroke="#facc15" strokeWidth={3.5} strokeLinecap="round" transform={`rotate(${r} 0 0)`} />
        ))}
        <circle r={14} fill="#fde047" stroke={O} strokeWidth={3} />
        <rect x={-6} y={13} width={12} height={8} fill="#94a3b8" stroke={O} strokeWidth={2.5} />
      </>);
    case "ripple":
      return g(<>
        <ellipse rx={50} ry={12} fill="none" stroke="#fff" strokeOpacity={0.35} strokeWidth={3} />
        <ellipse rx={32} ry={8} fill="none" stroke="#fff" strokeOpacity={0.6} strokeWidth={3} />
        <ellipse rx={15} ry={4} fill="none" stroke="#fff" strokeWidth={3} />
      </>);
    case "scooter":
      return g(<>
        <circle cx={-32} cy={-11} r={11} fill="#374151" stroke={O} strokeWidth={3} />
        <circle cx={34} cy={-11} r={11} fill="#374151" stroke={O} strokeWidth={3} />
        <path d="M-32 -11 L-18 -34 L18 -34 L34 -11 M18 -34 L28 -60 M20 -60 L38 -60" fill="none" stroke={O} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M-32 -11 L-18 -34 L18 -34 L34 -11 M18 -34 L28 -60 M20 -60 L38 -60" fill="none" stroke="#ef4444" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
      </>);
    case "signpost": {
      const labels = Array.isArray(a) ? a : [a || ""];
      return g(<>
        <rect x={-4} y={-110} width={8} height={110} fill="#7c4a1d" stroke={O} strokeWidth={2.5} />
        {labels.map((l, i) => (
          <g key={i}>
            <path d={i % 2 ? `M-4 ${-104 + i * 24} h-62 l-10 9 l10 9 h62z` : `M4 ${-104 + i * 24} h62 l10 9 l-10 9 h-62z`} fill={["#fde047", "#86efac", "#7dd3fc", "#fda4af"][i % 4]} stroke={O} strokeWidth={2.5} />
            <Txt x={i % 2 ? -36 : 36} y={-90 + i * 24} size={13} sw={0} fill="#111">{l}</Txt>
          </g>
        ))}
      </>);
    }
    case "sweat":
      return g(<>
        <path d="M0 -10 q-5 8 0 10 q5 -2 0 -10Z" fill="#7dd3fc" stroke={O} strokeWidth={1.5} />
        <path d="M18 -22 q-5 8 0 10 q5 -2 0 -10Z" fill="#7dd3fc" stroke={O} strokeWidth={1.5} />
        <path d="M-16 -24 q-5 8 0 10 q5 -2 0 -10Z" fill="#7dd3fc" stroke={O} strokeWidth={1.5} />
      </>);
    case "virus":
      return g(<>
        {Array.from({ length: 12 }).map((_, i) => (
          <g key={i} transform={`rotate(${i * 30})`}>
            <line x1={0} y1={-16} x2={0} y2={-26} stroke={O} strokeWidth={3} />
            <circle cx={0} cy={-28} r={4} fill="#ef4444" stroke={O} strokeWidth={2} />
          </g>
        ))}
        <circle r={17} fill="#84cc16" stroke={O} strokeWidth={3.5} />
        <circle cx={-5} cy={-4} r={3} fill="#4d7c0f" /><circle cx={6} cy={5} r={4} fill="#4d7c0f" />
      </>);
    case "sparkle":
      return g(<path d="M0 -16 Q2 -2 16 0 Q2 2 0 16 Q-2 2 -16 0 Q-2 -2 0 -16Z" fill="#fde047" stroke={O} strokeWidth={2} />);
    case "trophy":
      return g(<>
        <path d="M-16 -40 h32 v14 a16 16 0 0 1 -32 0z" fill="#facc15" stroke={O} strokeWidth={3} />
        <path d="M-16 -36 q-12 0 -10 10 q2 6 12 6 M16 -36 q12 0 10 10 q-2 6 -12 6" fill="none" stroke={O} strokeWidth={3} />
        <rect x={-4} y={-14} width={8} height={10} fill="#facc15" stroke={O} strokeWidth={2.5} />
        <rect x={-14} y={-5} width={28} height={7} fill="#92400e" stroke={O} strokeWidth={2.5} />
      </>);
    case "rock":
      return g(<path d="M-24 0 Q-28 -18 -10 -24 Q8 -30 22 -14 Q30 -4 26 0Z" fill="#9ca3af" stroke={O} strokeWidth={3} />);
    case "ring":
      return g(<>
        <circle r={14} fill="none" stroke={O} strokeWidth={13} />
        <circle r={14} fill="none" stroke="#ef4444" strokeWidth={8} />
        <circle r={14} fill="none" stroke="#fff" strokeWidth={8} strokeDasharray="11 11" />
      </>);
    case "board": {
      const lines = (txt || "").split("|");
      return g(<>
        <rect x={-62} y={-48} width={124} height={92} rx={4} fill={b || "#fff"} stroke={O} strokeWidth={4} />
        {lines.map((l, i) => (
          <Txt key={i} x={0} y={-14 + i * 28 - (lines.length - 1) * 8} size={22} sw={0} fill={b ? "#fff" : "#1e293b"}>{l}</Txt>
        ))}
      </>);
    }
    case "desk":
      return g(<>
        <rect x={-34} y={-30} width={68} height={8} fill="#a16207" stroke={O} strokeWidth={3} />
        <path d="M-28 -22 v22 M28 -22 v22" stroke={O} strokeWidth={4} />
      </>);
    case "bubbles":
      return g(<>
        <circle cx={0} cy={0} r={5} fill="#e0f2fe" stroke={O} strokeWidth={1.8} />
        <circle cx={10} cy={-14} r={3.5} fill="#e0f2fe" stroke={O} strokeWidth={1.8} />
        <circle cx={-6} cy={-24} r={4} fill="#e0f2fe" stroke={O} strokeWidth={1.8} />
      </>);
    case "lines":
      return g(<>
        <path d="M0 0 h60 M10 12 h54 M0 24 h48" stroke="#fff" strokeWidth={4} strokeLinecap="round" opacity={0.85} />
      </>);
    case "w":
      return (
        <g>
          <g className="wave">
            <path d={`${wavePath(y, 6)} L1300 600 L-900 600Z`} fill={b || "#38bdf8"} fillOpacity={0.78} stroke={O} strokeWidth={3} />
          </g>
        </g>
      );
    default:
      return null;
  }
}
