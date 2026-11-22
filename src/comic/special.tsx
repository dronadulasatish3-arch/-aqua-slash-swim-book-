import type { ReactNode } from "react";
import type { Panel } from "./types";
import { Tower, Tree, Txt, wavePath } from "./props";

const O = "#111";

function Burst({ col }: { col: string }) {
  return (
    <g>
      <rect x={-900} y={-500} width={2200} height={1100} fill={col} />
      {Array.from({ length: 24 }).map((_, i) => {
        const a0 = (i * 15 * Math.PI) / 180;
        const a1 = a0 + (7.5 * Math.PI) / 180;
        return <path key={i} d={`M200 150 L${200 + Math.cos(a0) * 1400} ${150 + Math.sin(a0) * 1400} L${200 + Math.cos(a1) * 1400} ${150 + Math.sin(a1) * 1400}Z`} fill="#fff" opacity={0.2} />;
      })}
    </g>
  );
}

const Ribbon = ({ children }: { children: ReactNode }) => (
  <g>
    <rect x={95} y={10} width={210} height={38} rx={4} fill="#fde047" stroke={O} strokeWidth={4} transform="rotate(-2 200 29)" />
    <Txt x={200} y={38} size={24} sw={0} fill="#111" rot={-2}>{children}</Txt>
  </g>
);

const dropPath = "M200 40 C200 40 120 140 120 190 A80 80 0 0 0 280 190 C280 140 200 40 200 40Z";

export function Special({ p }: { p: Panel }) {
  const a = p.art;
  const body = (): ReactNode => {
    switch (a) {
      case "glass":
        return (
          <>
            <Burst col="#67e8f9" />
            <Ribbon>STAGE 1 · GLASS</Ribbon>
            <path d="M140 80 L260 80 L242 250 Q240 262 228 262 L172 262 Q160 262 158 250Z" fill="#f0f9ff" stroke={O} strokeWidth={5} />
            <g className="wave"><path d="M120 118 q10 -8 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 L260 270 L120 270Z" fill="#38bdf8" opacity={0} /></g>
            <path d="M147 130 Q173 120 200 130 T253 130 L242 248 Q240 258 228 258 L172 258 Q160 258 158 248Z" fill="#38bdf8" stroke={O} strokeWidth={4} />
            <path d="M165 140 L172 240" stroke="#fff" strokeWidth={6} strokeLinecap="round" opacity={0.7} />
            <path d="M200 52 C200 52 192 66 192 72 A8 8 0 0 0 208 72 C208 66 200 52 200 52Z" fill="#38bdf8" stroke={O} strokeWidth={3} />
          </>
        );
      case "pool":
        return (
          <>
            <Burst col="#a5f3fc" />
            <Ribbon>STAGE 2 · POOL</Ribbon>
            <rect x={50} y={75} width={300} height={190} rx={10} fill="#e5e7eb" stroke={O} strokeWidth={5} />
            <rect x={70} y={95} width={260} height={150} rx={4} fill="#22d3ee" stroke={O} strokeWidth={4} />
            {[132, 170, 208].map((y, i) => <line key={y} x1={70} x2={330} y1={y} y2={y} stroke={i === 1 ? "#facc15" : "#ef4444"} strokeWidth={5} strokeDasharray="10 6" />)}
            <g className="wave"><path d={wavePath(115, 5)} fill="none" stroke="#fff" strokeWidth={3} opacity={0.7} /></g>
            <circle cx={150} cy={150} r={9} fill="#b7773f" stroke={O} strokeWidth={3} />
            <path d="M159 150 q18 -18 34 -4" fill="none" stroke={O} strokeWidth={7} strokeLinecap="round" />
            <path d="M159 150 q18 -18 34 -4" fill="none" stroke="#b7773f" strokeWidth={4} strokeLinecap="round" />
            <path d="M318 82 v-14 q0 -8 -8 -8 M300 82 v-14 q0 -8 8 -8" fill="none" stroke="#94a3b8" strokeWidth={4} />
          </>
        );
      case "pond":
        return (
          <>
            <Burst col="#bbf7d0" />
            <Ribbon>STAGE 3 · POND</Ribbon>
            <ellipse cx={200} cy={180} rx={160} ry={86} fill="#4ade80" stroke={O} strokeWidth={4} />
            <ellipse cx={200} cy={182} rx={138} ry={68} fill="#38bdf8" stroke={O} strokeWidth={4} />
            {[[150, 190, 1], [240, 170, 1.2], [210, 215, 0.9], [120, 160, 0.8]].map(([x, y, s], i) => (
              <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
                <path d="M0 0 L20 -4 A20 9 0 1 1 8 -8Z" fill="#16a34a" stroke={O} strokeWidth={2.5} />
              </g>
            ))}
            <circle cx={240} cy={162} r={7} fill="#f472b6" stroke={O} strokeWidth={2.5} />
            <circle cx={150} cy={184} r={6} fill="#f9a8d4" stroke={O} strokeWidth={2.5} />
            <g transform="translate(252 178)">
              <ellipse rx={11} ry={8} fill="#22c55e" stroke={O} strokeWidth={2.5} />
              <circle cx={-5} cy={-7} r={4} fill="#fff" stroke={O} strokeWidth={2} /><circle cx={5} cy={-7} r={4} fill="#fff" stroke={O} strokeWidth={2} />
              <circle cx={-5} cy={-7} r={1.5} fill={O} /><circle cx={5} cy={-7} r={1.5} fill={O} />
            </g>
            {[50, 62, 340].map((x, i) => (
              <g key={x}><line x1={x} y1={245} x2={x} y2={190 - i * 6} stroke="#166534" strokeWidth={4} /><ellipse cx={x} cy={186 - i * 6} rx={4} ry={11} fill="#7c4a1d" stroke={O} strokeWidth={2} /></g>
            ))}
          </>
        );
      case "lake":
        return (
          <>
            <rect x={-900} y={-500} width={2200} height={1100} fill="#bae6fd" />
            <Ribbon>STAGE 4 · LAKE</Ribbon>
            <path d="M-100 170 L40 80 L120 140 L210 70 L320 150 L420 100 L520 170Z" fill="#64748b" stroke={O} strokeWidth={4} strokeLinejoin="round" />
            <path d="M210 70 L184 100 L204 94 L212 106 L226 94 L240 100Z" fill="#fff" stroke={O} strokeWidth={2.5} />
            <path d="M40 80 L22 104 L40 98 L52 108Z" fill="#fff" stroke={O} strokeWidth={2.5} />
            <rect x={-900} y={168} width={2200} height={500} fill="#0ea5e9" stroke={O} strokeWidth={4} />
            <g className="wave"><path d={wavePath(195, 6)} fill="none" stroke="#e0f2fe" strokeWidth={3} /></g>
            <g className="wave" style={{ animationDuration: "4s" }}><path d={wavePath(235, 6)} fill="none" stroke="#e0f2fe" strokeWidth={3} /></g>
            <path d="M150 215 L250 215 L232 240 L168 240Z" fill="#ef4444" stroke={O} strokeWidth={3} />
            <path d="M200 215 V158 L238 208Z" fill="#fff" stroke={O} strokeWidth={3} strokeLinejoin="round" />
            <path d="M196 215 V166 L164 208Z" fill="#fde047" stroke={O} strokeWidth={3} strokeLinejoin="round" />
          </>
        );
      case "river":
        return (
          <>
            <Burst col="#d9f99d" />
            <Ribbon>STAGE 5 · RIVER</Ribbon>
            <path d="M-20 110 C110 70 150 160 205 160 S300 250 430 215" fill="none" stroke={O} strokeWidth={72} strokeLinecap="round" />
            <path d="M-20 110 C110 70 150 160 205 160 S300 250 430 215" fill="none" stroke="#a3e635" strokeWidth={64} strokeLinecap="round" />
            <path d="M-20 110 C110 70 150 160 205 160 S300 250 430 215" fill="none" stroke="#38bdf8" strokeWidth={46} strokeLinecap="round" />
            <path d="M-20 110 C110 70 150 160 205 160 S300 250 430 215" fill="none" stroke="#e0f2fe" strokeWidth={4} strokeDasharray="14 18" className="flow" />
            <g transform="translate(70 215) scale(.6)"><Tree /></g>
            <g transform="translate(340 140) scale(.6)"><Tree /></g>
            <g transform="translate(300 90) scale(.45)"><Tree /></g>
          </>
        );
      case "ocean":
        return (
          <>
            <rect x={-900} y={-500} width={2200} height={1100} fill="#fde68a" />
            <Ribbon>STAGE 6 · OCEAN</Ribbon>
            <circle cx={200} cy={150} r={62} fill="#f97316" stroke={O} strokeWidth={4} />
            <rect x={-900} y={150} width={2200} height={500} fill="#0ea5e9" stroke={O} strokeWidth={4} />
            <g className="wave"><path d={`${wavePath(172, 8)} L1300 600 L-900 600Z`} fill="#0284c7" stroke={O} strokeWidth={3} /></g>
            <g className="wave" style={{ animationDuration: "3.6s" }}><path d={`${wavePath(206, 9)} L1300 600 L-900 600Z`} fill="#075985" stroke={O} strokeWidth={3} /></g>
            <g className="wave" style={{ animationDuration: "2.6s" }}><path d={`${wavePath(244, 10)} L1300 600 L-900 600Z`} fill="#0c4a6e" stroke={O} strokeWidth={3} /></g>
            <path d="M270 168 L330 168 L322 184 L278 184Z" fill="#dc2626" stroke={O} strokeWidth={3} />
            <path d="M300 168 V132 L324 164Z" fill="#fff" stroke={O} strokeWidth={3} />
          </>
        );
      case "drop":
        return (
          <>
            <Burst col="#38bdf8" />
            <path d={dropPath} fill="#e0f2fe" stroke={O} strokeWidth={6} />
            <path d="M150 170 Q148 205 170 232" fill="none" stroke="#fff" strokeWidth={9} strokeLinecap="round" />
            <Txt x={205} y={205} size={46} fill="#0284c7" stroke="#fff" sw={0}>DROP</Txt>
            <Txt x={200} y={280} size={26} sw={5}>= ONE SKILL TO MASTER</Txt>
          </>
        );
      case "formula": {
        const boxes: [number, string, string][] = [[20, "6", "STAGES"], [100, "3", "LEVELS"], [180, "6", "DROPS"]];
        return (
          <>
            <Burst col="#fde047" />
            <Ribbon>THE AQUA SLASH SYSTEM</Ribbon>
            {boxes.map(([x, n, l]) => (
              <g key={x}>
                <rect x={x} y={90} width={56} height={84} rx={8} fill="#fff" stroke={O} strokeWidth={5} />
                <Txt x={x + 28} y={148} size={58} fill="#0284c7" sw={0}>{n}</Txt>
                <Txt x={x + 28} y={198} size={17} sw={4}>{l}</Txt>
              </g>
            ))}
            <Txt x={88} y={146} size={34} sw={5} fill="#fff">×</Txt>
            <Txt x={168} y={146} size={34} sw={5} fill="#fff">×</Txt>
            <Txt x={256} y={146} size={44} sw={5} fill="#fff">=</Txt>
            <rect x={272} y={80} width={112} height={104} rx={10} fill="#0ea5e9" stroke={O} strokeWidth={5} />
            <Txt x={328} y={146} size={64} fill="#fff" sw={5}>108</Txt>
            <Txt x={328} y={206} size={19} sw={4}>DROPS</Txt>
            <Txt x={200} y={266} size={26} fill="#fff" sw={6}>ONE DROP AT A TIME</Txt>
          </>
        );
      }
      case "logo":
        return (
          <>
            <Burst col="#0d9488" />
            <g transform="translate(200 100) scale(.5) translate(-200 -115)">
              <path d={dropPath} fill="#e0f2fe" stroke={O} strokeWidth={9} />
              <path d="M130 200 q25 -22 50 0 t50 0 t40 0" fill="none" stroke="#0ea5e9" strokeWidth={14} strokeLinecap="round" />
              <path d="M240 90 L170 250" stroke="#f97316" strokeWidth={14} strokeLinecap="round" />
            </g>
            <Txt x={200} y={206} size={58} fill="#fff" sw={7}>AQUA SLASH</Txt>
            <Txt x={200} y={250} size={22} fill="#fde047" sw={5}>ONE DROP AT A TIME</Txt>
          </>
        );
      case "tagline":
        return (
          <>
            <Burst col="#0ea5e9" />
            <Txt x={200} y={96} size={46} fill="#fff" sw={7}>CUT THROUGH</Txt>
            <Txt x={200} y={150} size={46} fill="#fde047" sw={7}>FEAR OF WATER.</Txt>
            <Txt x={200} y={222} size={36} fill="#fff" sw={7}>ONE DROP</Txt>
            <Txt x={200} y={262} size={36} fill="#fff" sw={7}>AT A TIME.</Txt>
          </>
        );
      case "stairs": {
        const names = ["GLASS", "POOL", "POND", "LAKE", "RIVER", "OCEAN"];
        const cols = ["#67e8f9", "#22d3ee", "#38bdf8", "#0ea5e9", "#0284c7", "#075985"];
        return (
          <>
            <rect x={-900} y={-500} width={2200} height={1100} fill="#e0f2fe" />
            <Burst col="#e0f2fe" />
            {names.map((n, i) => (
              <g key={n}>
                <rect x={14 + i * 62} y={250 - (i + 1) * 30} width={62} height={(i + 1) * 30 + 60} fill={cols[i]} stroke={O} strokeWidth={4} />
                <Txt x={45 + i * 62} y={244 - (i + 1) * 30 + 26} size={15} sw={3} fill="#fff">{n}</Txt>
              </g>
            ))}
            <g transform="translate(138 118)">
              <path d="M0 -26 C0 -26 -16 -2 -16 8 A16 16 0 0 0 16 8 C16 -2 0 -26 0 -26Z" fill="#e0f2fe" stroke={O} strokeWidth={3.5} />
              <circle cx={-5} cy={6} r={2.5} fill={O} /><circle cx={6} cy={6} r={2.5} fill={O} />
              <path d="M-4 12 q4 4 8 0" fill="none" stroke={O} strokeWidth={2} />
            </g>
            <Txt x={200} y={40} size={26} sw={5}>6 STAGES · 18 LEVELS · 108 DROPS</Txt>
          </>
        );
      }
      case "year":
        return (
          <>
            <Burst col={p.col || "#0ea5e9"} />
            <Txt x={200} y={p.sub ? 160 : 180} size={Math.min(120, 470 / Math.max(3, (p.txt || "").length))} fill="#fde047" sw={9}>{p.txt}</Txt>
            {p.sub && <Txt x={200} y={236} size={Math.min(34, 780 / p.sub.length)} fill="#fff" sw={7}>{p.sub}</Txt>}
          </>
        );
      case "growth": {
        const small = [["#fda4af", 0], ["#a5b4fc", 1]] as const;
        const big = ["#fda4af", "#a5b4fc", "#fcd34d", "#86efac", "#fdba74", "#c4b5fd", "#f9a8d4"];
        return (
          <>
            <Burst col="#fde047" />
            {small.map(([c, i]) => <g key={i} transform={`translate(${40 + i * 52} 230)`}><Tower color={c} w={44} h={70 + i * 20} /></g>)}
            <Txt x={66} y={262} size={40} fill="#fff" sw={6}>2</Txt>
            <path d="M138 170 H196 M180 150 L204 170 L180 190" fill="none" stroke={O} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
            <path d="M138 170 H196 M180 150 L204 170 L180 190" fill="none" stroke="#fff" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
            {big.map((c, i) => <g key={i} transform={`translate(${224 + (i % 4) * 40} ${i < 4 ? 232 : 150})`}><Tower color={c} w={36} h={i < 4 ? 70 + (i % 2) * 24 : 52 + (i % 2) * 16} /></g>)}
            <Txt x={300} y={272} size={40} fill="#fff" sw={6}>7</Txt>
            <Txt x={200} y={46} size={28} sw={5}>COMMUNITIES</Txt>
          </>
        );
      }
      case "timeline":
        return (
          <>
            <Burst col="#fde68a" />
            <path d="M30 170 H370" stroke={O} strokeWidth={12} strokeLinecap="round" />
            <path d="M30 170 H370" stroke="#fff" strokeWidth={6} strokeLinecap="round" />
            {[[90, "2024", "FOUNDATION", "#0ea5e9"], [210, "2025", "EXPANSION", "#0d9488"]].map(([x, y, l, c]) => (
              <g key={y as string}>
                <circle cx={x as number} cy={170} r={34} fill={c as string} stroke={O} strokeWidth={5} />
                <Txt x={x as number} y={182} size={32} fill="#fff" sw={4}>{y as string}</Txt>
                <Txt x={x as number} y={236} size={20} sw={4}>{l as string}</Txt>
              </g>
            ))}
            <circle cx={330} cy={170} r={34} fill="#fff" stroke={O} strokeWidth={5} strokeDasharray="8 6" />
            <Txt x={330} y={190} size={52} fill="#f97316" sw={0}>?</Txt>
            <Txt x={200} y={80} size={30} sw={5}>TWO YEARS OF BUILDING</Txt>
          </>
        );
      case "summary":
        return (
          <>
            <Burst col="#0ea5e9" />
            <Txt x={200} y={72} size={42} fill="#fff" sw={7}>SIX STAGES.</Txt>
            <Txt x={200} y={126} size={42} fill="#fde047" sw={7}>EIGHTEEN LEVELS.</Txt>
            <Txt x={200} y={180} size={42} fill="#fff" sw={7}>108 DROPS.</Txt>
            <Txt x={200} y={236} size={42} fill="#fde047" sw={7}>ONE PHILOSOPHY.</Txt>
          </>
        );
      case "end":
        return (
          <>
            <Burst col="#7c3aed" />
            <Txt x={200} y={100} size={50} fill="#fde047" sw={8}>THE END OF</Txt>
            <Txt x={200} y={160} size={50} fill="#fff" sw={8}>THE BEGINNING.</Txt>
            <path d="M200 190 C200 190 178 222 178 238 A22 22 0 0 0 222 238 C222 222 200 190 200 190Z" fill="#e0f2fe" stroke={O} strokeWidth={4} />
          </>
        );
      case "month":
        return (
          <>
            <Burst col="#f97316" />
            <rect x={110} y={50} width={180} height={190} rx={10} fill="#fff" stroke={O} strokeWidth={6} />
            <rect x={110} y={50} width={180} height={46} rx={10} fill="#ef4444" stroke={O} strokeWidth={6} />
            <Txt x={200} y={86} size={32} fill="#fff" sw={0}>1 MONTH</Txt>
            {Array.from({ length: 28 }).map((_, i) => (
              <rect key={i} x={122 + (i % 7) * 23} y={110 + Math.floor(i / 7) * 30} width={17} height={22} rx={3} fill={i < 24 ? "#e2e8f0" : "#fde047"} stroke={O} strokeWidth={1.5} />
            ))}
            <Txt x={200} y={280} size={24} fill="#fff" sw={6}>NATIONAL LEVEL!</Txt>
          </>
        );
      default:
        return <Burst col="#fde047" />;
    }
  };
  return (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 h-full w-full" style={{ overflow: "visible" }}>
      {body()}
    </svg>
  );
}
