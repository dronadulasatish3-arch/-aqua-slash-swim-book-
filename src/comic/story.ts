import type { Page } from "./types";
import { part1 } from "./story1";
import { part2 } from "./story2";
import { part3 } from "./story3";

export const CHAPTERS: { n: number; title: string }[] = [
  { n: 1, title: "The Hand in the Water" },
  { n: 2, title: "The Boy Who Followed Water" },
  { n: 3, title: "The Well That Changed Everything" },
  { n: 4, title: "From Escaping Tuition to National Games" },
  { n: 5, title: "When the World Stopped" },
  { n: 6, title: "From Swimmer to Lifeguard & Junior Coach" },
  { n: 7, title: "Learning the World Behind the Pool" },
  { n: 8, title: "Back to His Hometown" },
  { n: 9, title: "The Beginning of Aqua Slash" },
  { n: 10, title: "Why Aqua Slash?" },
  { n: 11, title: "The First Communities — Reality Begins" },
  { n: 12, title: "The Ideas That Waited" },
  { n: 13, title: "Two Years of Building — From Two to Seven Communities" },
  { n: 14, title: "The Six Stages — One Drop at a Time" },
];

export const PAGES: Page[] = [...part1, ...part2, ...part3];

export const firstPageOfChapter = (ch: number) => PAGES.findIndex((p) => p.ch === ch);
