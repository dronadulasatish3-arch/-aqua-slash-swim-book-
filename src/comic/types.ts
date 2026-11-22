export type Pose =
  | "stand" | "walk" | "run" | "swim" | "grab" | "cheer" | "sit" | "reach"
  | "point" | "tumble" | "lie" | "think" | "hold" | "hips" | "wave";

export interface Char {
  k?: "boy" | "man" | "woman";
  x: number;
  y: number; // ground (feet) y for standing poses, hip y for rotated poses
  s?: number;
  pose?: Pose;
  flip?: boolean;
  shirt?: string;
  pants?: string;
  skin?: string;
  hair?: string;
  head?: number;
  rot?: number;
  L?: string; // item in left hand
  R?: string; // item in right hand
  neck?: "medal" | "whistle";
  band?: boolean;
  bag?: boolean;
  short?: boolean;
  ex?: "smile" | "o" | "sad" | "grit";
}

// [type, x, y, scale?, text?, color?]  (type starting with ^ = drawn in front of characters)
export type Prop = [string, number, number, number?, (string | string[])?, string?];

export type SayPos = "tl" | "tr" | "bl" | "br";
export type SayKind = "say" | "think" | "shout";
export type Say = string | [string, SayPos?, SayKind?];

export interface Panel {
  cap?: string;
  say?: Say;
  say2?: Say;
  sfx?: string;
  sfxAt?: SayPos;
  tag?: string;
  img?: string;
  art?: string;
  txt?: string;
  sub?: string;
  col?: string;
  bg?: string;
  sky?: string;
  dim?: number;
  c?: Char[];
  p?: Prop[];
  customImg?: string;
}

export interface Page {
  ch: number;
  sub?: string;
  panels: Panel[];
}
