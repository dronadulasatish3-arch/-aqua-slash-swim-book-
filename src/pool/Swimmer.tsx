import { BODY, clamp, lerp, type Part, type Pose } from './animations';

const SKIN = '#f3b893';
const SKIN_FAR = '#d9926c';
const SUIT = '#0b2f6b';
const SUIT_FAR = '#08234f';
const STRIPE = '#19c3e6';
const CAP = '#ff6b4a';
const GLOW = '#ffe066';

interface LimbProps {
  origin: readonly [number, number];
  a: [number, number];
  l1: number;
  l2: number;
  w1: number;
  w2: number;
  color: string;
  glow: boolean;
  end: 'hand' | 'foot';
}

function Limb({ origin, a, l1, l2, w1, w2, color, glow, end }: LimbProps) {
  return (
    <g transform={`translate(${origin[0]} ${origin[1]}) rotate(${-a[0]})`}>
      {glow && <line x1={0} y1={0} x2={0} y2={l1} stroke={GLOW} strokeWidth={w1 + 9} strokeLinecap="round" className="glow-pulse" />}
      <line x1={0} y1={0} x2={0} y2={l1} stroke={color} strokeWidth={w1} strokeLinecap="round" />
      <g transform={`translate(0 ${l1}) rotate(${-a[1]})`}>
        {glow && <line x1={0} y1={0} x2={0} y2={l2 + (end === 'foot' ? 8 : 3)} stroke={GLOW} strokeWidth={w2 + 9} strokeLinecap="round" className="glow-pulse" />}
        <line x1={0} y1={0} x2={0} y2={l2} stroke={color} strokeWidth={w2} strokeLinecap="round" />
        {end === 'hand' ? (
          <ellipse cx={0} cy={l2 + 2} rx={4.2} ry={5.2} fill={color} />
        ) : (
          <path d={`M -3 ${l2 - 3} Q 1 ${l2 + 10} 2.5 ${l2 + 9} Q 4.5 ${l2 + 2} 3 ${l2 - 3} Z`} fill={color} />
        )}
      </g>
    </g>
  );
}

export function Swimmer({ pose, hl }: { pose: Pose; hl: Set<Part> }) {
  const has = (p: Part) => hl.has(p);
  const armN = has('arms') || has('armN');
  const armF = has('arms') || has('armF');
  const legN = has('legs') || has('legN');
  const legF = has('legs') || has('legF');
  const r = clamp(pose.roll);
  const fc = lerp(9.5, 0.5, r); // face centre moves as head rotates to the viewer
  const hipN: [number, number] = [2, BODY.hip[1] - 2];
  const hipF: [number, number] = [-2, BODY.hip[1] - 2];

  return (
    <g
      transform={`translate(${pose.x} ${pose.y}) rotate(${pose.angle}) scale(${pose.facing} 1)`}
      opacity={pose.alpha}
    >
      {/* far arm + far leg */}
      <Limb origin={BODY.shoulder} a={pose.aF} l1={BODY.upperArm} l2={BODY.foreArm} w1={8} w2={7} color={SKIN_FAR} glow={armF} end="hand" />
      <Limb origin={hipF} a={pose.lF} l1={BODY.thigh} l2={BODY.shin} w1={11} w2={9} color={SKIN_FAR} glow={legF} end="foot" />
      <line x1={-2} y1={16} x2={-2 + Math.sin((pose.lF[0] * Math.PI) / 180) * 9} y2={16 + Math.cos((pose.lF[0] * Math.PI) / 180) * 9} stroke={SUIT_FAR} strokeWidth={12} strokeLinecap="round" />

      {/* torso */}
      {has('body') && <line x1={0} y1={-28} x2={0} y2={24} stroke={GLOW} strokeWidth={34} strokeLinecap="round" className="glow-pulse" />}
      {has('hips') && <circle cx={0} cy={BODY.hip[1]} r={17} fill={GLOW} className="glow-pulse" />}
      <line x1={1} y1={-31} x2={2} y2={-39} stroke={SKIN} strokeWidth={10} strokeLinecap="round" />
      <line x1={0} y1={-26} x2={0} y2={18} stroke={SKIN} strokeWidth={22} strokeLinecap="round" />
      <path d="M -11 -18 Q 0 -24 11 -18 L 12 24 Q 0 32 -12 24 Z" fill={SUIT} />
      <path d="M 9 -16 L 11 22" stroke={STRIPE} strokeWidth={3} strokeLinecap="round" />
      <path d="M -8 8 Q 0 12 10 6" stroke={STRIPE} strokeWidth={2} fill="none" opacity={0.8} />

      {/* near leg */}
      <Limb origin={hipN} a={pose.lN} l1={BODY.thigh} l2={BODY.shin} w1={11} w2={9} color={SKIN} glow={legN} end="foot" />
      <line x1={2} y1={16} x2={2 + Math.sin((pose.lN[0] * Math.PI) / 180) * 10} y2={16 + Math.cos((pose.lN[0] * Math.PI) / 180) * 10} stroke={SUIT} strokeWidth={12} strokeLinecap="round" />

      {/* head */}
      <g transform={`translate(${BODY.head[0]} ${BODY.head[1]}) rotate(${-pose.head})`}>
        {has('head') && <circle r={20} fill={GLOW} className="glow-pulse" />}
        <circle r={BODY.headR} fill={SKIN} />
        {r < 0.6 && <circle cx={-1.5} cy={1.5} r={3.2} fill={SKIN_FAR} opacity={1 - r * 1.6} />}
        {r < 0.5 && <path d="M 12.5 -1 Q 15.5 2 12.6 4" fill={SKIN} stroke={SKIN_FAR} strokeWidth={0.8} opacity={1 - r * 2} />}
        {/* cap */}
        <path d="M -12.8 4.6 A 13.6 13.6 0 0 1 8.7 -10.4 Q -1 -4 -12.8 4.6 Z" fill={CAP} />
        <path d="M -5 -9.5 q 1.6 2.4 0 3.6 q -1.6 -1.2 0 -3.6 z" fill="#fff" opacity={0.9} />
        {/* goggles */}
        <line x1={fc} y1={-2} x2={-13} y2={-1} stroke="#0b1d3a" strokeWidth={1.6} opacity={1 - r * 0.7} />
        <ellipse cx={fc + 4.5 * r} cy={-2.4} rx={lerp(2.4, 3.6, r)} ry={2.6} fill="#0b1d3a" />
        <ellipse cx={fc + 4.5 * r - 0.6} cy={-3.2} rx={1} ry={0.8} fill={STRIPE} />
        {r > 0.15 && (
          <>
            <ellipse cx={fc - 4.5 * r} cy={-2.4} rx={3.6 * r} ry={2.6} fill="#0b1d3a" opacity={clamp(r * 2)} />
            <ellipse cx={fc - 4.5 * r - 0.6} cy={-3.2} rx={r} ry={0.8} fill={STRIPE} opacity={clamp(r * 2)} />
          </>
        )}
        {/* mouth */}
        <ellipse cx={lerp(10.5, 0.5, r)} cy={6} rx={lerp(1.6, 2.8, r)} ry={0.7 + pose.mouth * 2.2} fill="#7a2e22" />
      </g>

      {/* near arm */}
      <Limb origin={BODY.shoulder} a={pose.aN} l1={BODY.upperArm} l2={BODY.foreArm} w1={8} w2={7} color={SKIN} glow={armN} end="hand" />
    </g>
  );
}
