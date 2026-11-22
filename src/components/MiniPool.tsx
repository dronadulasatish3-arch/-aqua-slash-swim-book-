import { useMemo } from 'react';
import { SURFACE, getAnim, phaseAt, type Part } from '../pool/animations';
import { Swimmer } from '../pool/Swimmer';

const SAMPLE: Record<number, number> = {
  1: 0.8, 2: 0.5, 3: 0.55, 4: 0.45, 5: 0.58, 6: 0.28, 7: 0.9, 8: 0.1, 9: 0.12,
  10: 0.6, 11: 0.42, 12: 0.3, 13: 0.45, 14: 0.2, 15: 0.48, 16: 0.2, 17: 0.08, 18: 0.2,
};

/** Small static pool visual of the swimmer's key position for a skill card. */
export function MiniPool({ id, dim = false }: { id: number; dim?: boolean }) {
  const { pose, hl } = useMemo(() => {
    const a = getAnim(id);
    const t = SAMPLE[id] ?? 0.4;
    const p = a.pose(t);
    return { pose: { ...p, alpha: 1 }, hl: new Set<Part>(a.phases[phaseAt(a, t)].hl ?? []) };
  }, [id]);
  const cx = pose.angle === 0 ? pose.x : pose.x;
  const cy = Math.abs(pose.angle) > 45 ? pose.y : pose.y - 20;
  const w = 230;
  const h = 120;
  return (
    <svg viewBox={`${cx - w / 2} ${cy - h / 2} ${w} ${h}`} className="h-full w-full" aria-hidden preserveAspectRatio="xMidYMid slice">
      <rect x={cx - w} y={cy - h} width={w * 2} height={h * 2} fill="#dff4ff" />
      <rect x={cx - w} y={SURFACE} width={w * 2} height={h * 2} fill="#35b8e8" />
      <g className={dim ? 'opacity-40 grayscale' : ''}>
        <Swimmer pose={pose} hl={dim ? new Set() : hl} />
      </g>
      <rect x={cx - w} y={SURFACE} width={w * 2} height={h * 2} fill="#0b5fa8" opacity={0.28} />
      <path d={`M ${cx - w} ${SURFACE} Q ${cx - w / 2} ${SURFACE - 2} ${cx} ${SURFACE} T ${cx + w} ${SURFACE}`} stroke="#fff" strokeWidth={1.6} fill="none" opacity={0.9} />
    </svg>
  );
}
