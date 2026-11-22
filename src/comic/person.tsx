import type { Char, Pose } from "./types";

const O = "#111";
type V = [number, number];

const POSES: Record<Pose, { la: V; ra: V; ll: V; rl: V; rot?: number; h: number }> = {
  stand: { la: [-14, -6], ra: [14, -6], ll: [-7, 34], rl: [7, 34], h: 34 },
  walk: { la: [-12, -10], ra: [13, -14], ll: [-14, 34], rl: [13, 32], h: 34 },
  run: { la: [-14, -20], ra: [16, -4], ll: [-17, 32], rl: [17, 28], h: 33, rot: 8 },
  swim: { la: [-2, -72], ra: [8, -4], ll: [-4, 42], rl: [6, 38], rot: 82, h: 0 },
  grab: { la: [-22, -36], ra: [12, -72], ll: [-6, 32], rl: [6, 28], h: 0 },
  cheer: { la: [-20, -66], ra: [20, -66], ll: [-8, 34], rl: [8, 34], h: 34 },
  sit: { la: [-10, -2], ra: [12, -6], ll: [34, 4], rl: [30, 12], h: 9 },
  reach: { la: [-12, -4], ra: [44, -34], ll: [-8, 34], rl: [8, 34], h: 34 },
  point: { la: [-12, -4], ra: [40, -42], ll: [-7, 34], rl: [7, 34], h: 34 },
  tumble: { la: [-26, -54], ra: [24, -62], ll: [-16, 30], rl: [18, 24], rot: 35, h: 0 },
  lie: { la: [-12, -6], ra: [12, -8], ll: [-6, 36], rl: [6, 36], rot: 90, h: 0 },
  think: { la: [-12, -4], ra: [7, -45], ll: [-7, 34], rl: [7, 34], h: 34 },
  hold: { la: [22, -20], ra: [24, -14], ll: [-7, 34], rl: [7, 34], h: 34 },
  hips: { la: [-20, -14], ra: [20, -14], ll: [-7, 34], rl: [7, 34], h: 34 },
  wave: { la: [-14, -6], ra: [20, -62], ll: [-7, 34], rl: [7, 34], h: 34 },
};

const ln = (a: V, b: V, c: string, w: number, key?: string) => (
  <line key={key} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={c} strokeWidth={w} strokeLinecap="round" />
);

export function Item({ t, x, y }: { t: string; x: number; y: number }) {
  const g = (n: React.ReactNode) => <g transform={`translate(${x} ${y})`}>{n}</g>;
  switch (t) {
    case "lunch":
      return g(<>
        <path d="M-4 -2 v-5 h8 v5" fill="none" stroke={O} strokeWidth={2.5} />
        <rect x={-9} y={-2} width={18} height={12} rx={2} fill="#cbd5e1" stroke={O} strokeWidth={2.5} />
        <rect x={-9} y={3} width={18} height={2} fill="#ef4444" />
      </>);
    case "book":
      return g(<>
        <rect x={-6} y={-18} width={14} height={19} rx={1} fill="#ef4444" stroke={O} strokeWidth={2.5} />
        <rect x={-3} y={-14} width={8} height={3} fill="#fff" />
      </>);
    case "board":
      return g(<>
        <rect x={-3} y={-16} width={17} height={24} rx={2} fill="#b45309" stroke={O} strokeWidth={2.5} />
        <rect x={-1} y={-12} width={13} height={17} fill="#fff" />
        <path d="M1 -8 h9 M1 -4 h9 M1 0 h6" stroke="#64748b" strokeWidth={1.4} />
      </>);
    case "kick":
      return g(<rect x={-13} y={-5} width={28} height={10} rx={5} fill="#facc15" stroke={O} strokeWidth={2.5} />);
    case "buoy":
      return g(<>
        <rect x={-15} y={-5} width={30} height={10} rx={5} fill="#ef4444" stroke={O} strokeWidth={2.5} />
        <rect x={-3} y={-5} width={6} height={10} fill="#fff" />
      </>);
    case "cert":
      return g(<>
        <rect x={-12} y={-18} width={24} height={17} fill="#fff" stroke={O} strokeWidth={2.5} />
        <circle cx={5} cy={-8} r={3.5} fill="#ef4444" />
        <path d="M-8 -13 h10 M-8 -9 h8" stroke="#64748b" strokeWidth={1.4} />
      </>);
    case "ball":
      return g(<>
        <circle r={8} cy={-4} fill="#fff" stroke={O} strokeWidth={2.5} />
        <path d="M0 -9 l4 3 -1.5 5 h-5 l-1.5 -5z" fill={O} />
      </>);
    case "sack":
      return g(<>
        <path d="M-18 4 Q-24 -16 -10 -26 L10 -26 Q24 -16 18 4Z" fill="#f5deb3" stroke={O} strokeWidth={2.5} />
        <rect x={-6} y={-30} width={12} height={6} rx={2} fill="#d6b97f" stroke={O} strokeWidth={2} />
      </>);
    case "tray":
      return g(<>
        <rect x={-14} y={-2} width={28} height={4} fill="#94a3b8" stroke={O} strokeWidth={2} />
        <circle cx={-6} cy={-7} r={5} fill="#facc15" stroke={O} strokeWidth={2} />
      </>);
    default:
      return null;
  }
}

export function Person(c: Char) {
  const {
    k = "boy", x, y, s = 1, pose = "stand", flip, shirt = "#f97316", pants = "#1e3a8a",
    skin = "#b7773f", hair = "#161616", head = 1, L, R, neck, band, bag, short, ex = "smile",
  } = c;
  const P = POSES[pose];
  const rot = c.rot ?? P.rot ?? 0;
  const woman = k === "woman";
  const hip = P.h > 0 ? y - (P.h + (woman ? 5 : 0)) * s : y;
  const sh = (sx: number): V => [sx, -29];
  const leg = (f: V, sx: number, key: string) => {
    const a: V = [sx, 0];
    const b: V = woman ? [f[0], f[1] + 5] : f;
    if (woman) return <g key={key}>{ln(a, b, O, 11)}{ln(a, b, skin, 7)}</g>;
    const m: V = [a[0] + (b[0] - a[0]) * 0.4, a[1] + (b[1] - a[1]) * 0.4];
    return (
      <g key={key}>
        {ln(a, b, O, 12.5)}
        {ln(a, b, short ? skin : pants, 8.5)}
        {short && ln(a, m, pants, 9)}
        {!short && <circle cx={b[0] + 2} cy={b[1]} r={4.6} fill="#1f2937" stroke={O} strokeWidth={2} />}
      </g>
    );
  };
  const arm = (hnd: V, sx: number, key: string) => {
    const a = sh(sx);
    const m: V = [a[0] + (hnd[0] - a[0]) * 0.42, a[1] + (hnd[1] - a[1]) * 0.42];
    return (
      <g key={key}>
        {ln(a, hnd, O, 10.5)}
        {ln(a, hnd, skin, 6.5)}
        {ln(a, m, shirt === skin ? skin : shirt, 8)}
        <circle cx={hnd[0]} cy={hnd[1]} r={3.9} fill={skin} stroke={O} strokeWidth={1.8} />
      </g>
    );
  };
  const mouth =
    ex === "o" ? <ellipse cx={3} cy={6} rx={2.4} ry={3.2} fill="#7f1d1d" stroke={O} strokeWidth={1} /> :
    ex === "sad" ? <path d="M-1 8 q4 -4 8 0" fill="none" stroke={O} strokeWidth={1.6} strokeLinecap="round" /> :
    ex === "grit" ? <rect x={-1} y={5} width={9} height={4} rx={1} fill="#fff" stroke={O} strokeWidth={1.4} /> :
    <path d="M-1 5 q4 5 8 0" fill="none" stroke={O} strokeWidth={1.6} strokeLinecap="round" />;

  return (
    <g transform={`translate(${x} ${hip}) scale(${flip ? -s : s} ${s}) rotate(${rot})`}>
      {bag && <rect x={-18} y={-33} width={11} height={25} rx={3} fill="#2563eb" stroke={O} strokeWidth={2.5} />}
      {leg(P.ll, -4, "ll")}
      {leg(P.rl, 4, "rl")}
      {woman && <path d="M-12 -6 L12 -6 L20 31 L-20 31Z" fill={pants} stroke={O} strokeWidth={2.5} strokeLinejoin="round" />}
      <rect x={-10} y={-35} width={20} height={woman ? 32 : 38} rx={8} fill={shirt} stroke={O} strokeWidth={2.5} />
      {woman && <path d="M-10 -22 h20" stroke={O} strokeWidth={2} />}
      {arm(P.la, -9, "la")}
      {arm(P.ra, 9, "ra")}
      {L && <Item t={L} x={P.la[0]} y={P.la[1]} />}
      {R && <Item t={R} x={P.ra[0]} y={P.ra[1]} />}
      {neck === "medal" && (
        <g>
          <path d="M-5 -34 L0 -19 L5 -34" fill="none" stroke="#2563eb" strokeWidth={3} />
          <circle cx={0} cy={-17} r={6} fill="#facc15" stroke={O} strokeWidth={2} />
        </g>
      )}
      {neck === "whistle" && (
        <g>
          <path d="M-4 -34 L2 -20" stroke={O} strokeWidth={1.5} />
          <circle cx={3} cy={-18} r={3.4} fill="#fde047" stroke={O} strokeWidth={1.5} />
        </g>
      )}
      <rect x={-3.5} y={-40} width={7} height={8} fill={skin} stroke={O} strokeWidth={2} />
      <g transform={`translate(0 -46) scale(${head})`}>
        {woman && (
          <>
            <path d="M-9 -2 Q-15 12 -11 26" fill="none" stroke={hair} strokeWidth={5} strokeLinecap="round" />
            <circle cx={-8} cy={-11} r={5.5} fill={hair} stroke={O} strokeWidth={1.5} />
          </>
        )}
        <circle r={11.5} fill={skin} stroke={O} strokeWidth={2.5} />
        <path d="M-11.3 0 A11.5 11.5 0 0 1 11.3 0 Q6 -7 -1 -5 Q-8 -3 -11.3 0Z" fill={hair} stroke={O} strokeWidth={1.5} />
        <circle cx={-2} cy={0} r={1.8} fill={O} />
        <circle cx={6} cy={0} r={1.8} fill={O} />
        {mouth}
        {k === "man" && <path d="M0 3 q4 -2.5 9 0" fill="none" stroke={hair} strokeWidth={2} strokeLinecap="round" />}
        {band && (
          <g>
            <rect x={-11.5} y={-6} width={23} height={5.5} fill="#fff" stroke={O} strokeWidth={1.5} />
            <circle cx={3} cy={-3.2} r={1.4} fill="#ef4444" />
          </g>
        )}
      </g>
    </g>
  );
}
