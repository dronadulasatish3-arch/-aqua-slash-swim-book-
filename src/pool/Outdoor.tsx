import { memo } from 'react';
import { HALL_END, POND, POND_BASIN, POND_SHAPE } from './journey';

function Tree({ x, s = 1, tone = '#3fa35b' }: { x: number; s?: number; tone?: string }) {
  return (
    <g transform={`translate(${x} 184) scale(${s})`}>
      <rect x={-6} y={-70} width={12} height={70} rx={4} fill="#7a5436" />
      <circle cx={0} cy={-92} r={36} fill={tone} />
      <circle cx={-26} cy={-72} r={24} fill={tone} opacity={0.95} />
      <circle cx={26} cy={-74} r={26} fill={tone} opacity={0.95} />
      <circle cx={-10} cy={-108} r={16} fill="#ffffff" opacity={0.12} />
    </g>
  );
}

function Reeds({ x }: { x: number }) {
  return (
    <g>
      {[0, 7, 13, 20, 26].map((d, i) => (
        <g key={i}>
          <path d={`M ${x + d} 200 Q ${x + d - 4} ${160 - i * 4} ${x + d + (i % 2 ? 5 : -3)} ${128 - (i % 3) * 8}`} stroke="#4c9a4f" strokeWidth={2.4} fill="none" />
          {i % 2 === 0 && <ellipse cx={x + d + (i % 2 ? 5 : -3)} cy={134 - (i % 3) * 8} rx={3} ry={9} fill="#8a5a33" />}
        </g>
      ))}
    </g>
  );
}

/** Natural outdoor world west of the pool hall, with the pond. Static → memoized. */
export const OutdoorBack = memo(function OutdoorBack() {
  const L = -2600;
  const W = HALL_END - L;
  return (
    <g aria-hidden>
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7cc8f5" />
          <stop offset="0.7" stopColor="#c7ecff" />
          <stop offset="1" stopColor="#fff4d8" />
        </linearGradient>
        <linearGradient id="grass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5fbf6a" />
          <stop offset="0.12" stopColor="#3f9a52" />
          <stop offset="1" stopColor="#24562f" />
        </linearGradient>
        <linearGradient id="pondWater" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5ed3c1" />
          <stop offset="0.45" stopColor="#2a9a9a" />
          <stop offset="1" stopColor="#154f63" />
        </linearGradient>
        <clipPath id="pondClip">
          <rect x={POND.left - 20} y={POND.surface} width={POND.right - POND.left + 40} height={300} />
        </clipPath>
      </defs>
      {/* sky */}
      <rect x={L} y={-700} width={W} height={884} fill="url(#sky)" />
      <circle cx={-1180} cy={40} r={62} fill="#fff6c4" opacity={0.35} />
      <circle cx={-1180} cy={40} r={30} fill="#fff3a8" />
      {[
        [-620, 30, 1],
        [-980, 0, 0.8],
        [-1480, 50, 1.1],
        [-1850, 10, 0.9],
      ].map(([x, y, s], i) => (
        <g key={i} transform={`translate(${x} ${y}) scale(${s})`} opacity={0.92}>
          <ellipse cx={0} cy={0} rx={46} ry={16} fill="#fff" />
          <ellipse cx={-24} cy={4} rx={26} ry={12} fill="#fff" />
          <ellipse cx={22} cy={-6} rx={28} ry={16} fill="#fff" />
        </g>
      ))}
      {/* hills */}
      <path d={`M ${L} 184 L ${L} 150 Q -2200 110 -1900 150 T -1300 140 T -700 150 T ${HALL_END} 140 L ${HALL_END} 184 Z`} fill="#a6dca0" />
      <path d={`M ${L} 184 L ${L} 166 Q -2000 140 -1650 168 T -1000 160 T -500 166 L ${HALL_END} 170 L ${HALL_END} 184 Z`} fill="#7fcb84" />
      {/* trees & bushes */}
      <Tree x={-520} s={1} />
      <Tree x={-690} s={0.7} tone="#4fb068" />
      <Tree x={-1400} s={1.15} tone="#379a54" />
      <Tree x={-1520} s={0.8} tone="#4fb068" />
      <Tree x={-1760} s={1} />
      {[
        [-430, 1],
        [-790, 0.8],
        [-1350, 0.9],
        [-1620, 1],
      ].map(([x, s], i) => (
        <g key={i} transform={`translate(${x} 184) scale(${s})`}>
          <ellipse cx={0} cy={-10} rx={26} ry={14} fill="#46a55a" />
          <ellipse cx={16} cy={-14} rx={16} ry={12} fill="#58b86b" />
        </g>
      ))}
      {/* ground */}
      <rect x={L} y={184} width={W} height={900} fill="url(#grass)" />
      <rect x={L} y={182} width={W} height={5} fill="#86d890" />
      {/* stone path */}
      {Array.from({ length: 13 }).map((_, i) => (
        <ellipse key={i} cx={-380 - i * 38} cy={186} rx={13} ry={3} fill="#efe8d8" opacity={0.95} />
      ))}
      {/* flowers */}
      {[-460, -560, -760, -840, -1340, -1420, -1580, -1690].map((x, i) => (
        <g key={i}>
          <line x1={x} y1={184} x2={x} y2={174} stroke="#3f8f4a" strokeWidth={1.4} />
          <circle cx={x} cy={172} r={3.2} fill={['#ff8fa3', '#ffd166', '#ffffff', '#c3a6ff'][i % 4]} />
        </g>
      ))}
      {/* pond */}
      <path d={POND_BASIN} fill="#5b4632" />
      <path d={POND_SHAPE} fill="url(#pondWater)" clipPath="url(#pondClip)" />
      {[
        [-1180, 340],
        [-1120, 348],
        [-1010, 342],
        [-960, 320],
      ].map(([x, y], i) => (
        <ellipse key={i} cx={x} cy={y} rx={10} ry={5} fill="#7b7466" opacity={0.7} />
      ))}
      {[-1210, -1150, -990, -940].map((x, i) => (
        <path key={i} d={`M ${x} 346 q -8 -30 4 -60 q 6 -18 -2 -34`} stroke="#2f7d55" strokeWidth={3} fill="none" opacity={0.7} />
      ))}
      {/* rocks & reeds */}
      <ellipse cx={-1318} cy={184} rx={22} ry={12} fill="#9aa3a8" />
      <ellipse cx={-1300} cy={188} rx={14} ry={8} fill="#b8c0c4" />
      <ellipse cx={-868} cy={187} rx={10} ry={4} fill="#b8c0c4" opacity={0.8} />
      <Reeds x={-1352} />
      <Reeds x={-1270} />
      {/* pool hall end wall with doorway */}
      <rect x={HALL_END - 16} y={-700} width={20} height={760} fill="#a9d6ea" />
      <rect x={HALL_END - 20} y={52} width={28} height={10} rx={3} fill="#ffffff" />
      <rect x={HALL_END - 18} y={62} width={4} height={122} fill="#ffffff" opacity={0.8} />
      <g transform={`translate(${HALL_END + 40} 20)`}>
        <rect x={-38} y={-14} width={76} height={26} rx={8} fill="#06214a" />
        <text x={0} y={4} textAnchor="middle" fontSize={12} fontWeight={800} fill="#bff6ff">← POND 🌿</text>
      </g>
    </g>
  );
});
