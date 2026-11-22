import type { Char, Pose } from "./types";

export const SKIN = "#b7773f";
type O = Partial<Char>;

// swimwear
export const SW: O = { shirt: SKIN, pants: "#dc2626", short: true };

// the hero as a little boy
export const K = (x: number, y: number, pose: Pose = "stand", o: O = {}): Char => ({
  k: "boy", x, y, s: 0.95, head: 1.22, pose, shirt: "#f8fafc", pants: "#1e3a8a", skin: SKIN, ...o,
});
// the hero as a teenager
export const T = (x: number, y: number, pose: Pose = "stand", o: O = {}): Char => ({
  k: "boy", x, y, s: 1.2, head: 1.06, pose, shirt: "#fb923c", pants: "#334155", skin: SKIN, ...o,
});
// the hero as a grown-up founder (teal Aqua Slash shirt)
export const A = (x: number, y: number, pose: Pose = "stand", o: O = {}): Char => ({
  k: "man", x, y, s: 1.4, head: 1, pose, shirt: "#0d9488", pants: "#1f2937", skin: SKIN, ...o,
});
// mother
export const M = (x: number, y: number, pose: Pose = "stand", o: O = {}): Char => ({
  k: "woman", x, y, s: 1.3, head: 1, pose, shirt: "#be185d", pants: "#db2777", skin: "#a8683a", ...o,
});
// a man (rescuer / villager / resident)
export const N = (x: number, y: number, pose: Pose = "stand", o: O = {}): Char => ({
  k: "man", x, y, s: 1.4, head: 1, pose, shirt: "#15803d", pants: "#78350f", skin: "#9a5f32", ...o,
});
// coach
export const C = (x: number, y: number, pose: Pose = "stand", o: O = {}): Char => ({
  k: "man", x, y, s: 1.4, head: 1, pose, shirt: "#dc2626", pants: "#111827", skin: "#8d5524", neck: "whistle", ...o,
});
// friend in swimwear (shirtless, shorts)
export const FS = (x: number, y: number, pose: Pose = "stand", pants = "#2563eb", o: O = {}): Char => {
  const f = F(x, y, pose, "#000", { short: true, pants, ...o });
  return { ...f, shirt: f.skin };
};
// friend / other kid
const SKINS = ["#c68642", "#8d5524", "#a9703a", "#d39b63"];
export const F = (x: number, y: number, pose: Pose = "stand", color = "#38bdf8", o: O = {}): Char => ({
  k: "boy", x, y, s: 0.9, head: 1.22, pose, shirt: color, pants: "#374151",
  skin: SKINS[Math.abs(Math.round(x)) % 4], ...o,
});
