import type { Page } from "./types";
import { K, FS, F, M, N, T, SW } from "./cast";

const MUD = "#c28a2c";

export const part1: Page[] = [
  // ───────────── CHAPTER 1 ─────────────
  {
    ch: 1,
    panels: [
      {
        bg: "road", sky: "day",
        c: [K(150, 270, "walk", { bag: true })],
        p: [["sign", 330, 268, 0.8, "SCHOOL · 4 KM"]],
        cap: "There was once a little boy living in a small village. His school was around four kilometres away from his home.",
      },
      {
        bg: "river", sky: "day",
        c: [K(30, 240, "walk", { bag: true })],
        p: [["sign", 80, 238, 0.6, "RIVER"]],
        cap: "Every day, he followed the same route to school. One of the usual ways home involved crossing a river.",
      },
      {
        bg: "flood", sky: "rain",
        c: [F(-5, 240, "walk", "#f87171", { flip: true }), F(45, 240, "walk", "#a3e635", { flip: true })],
        p: [["sign", 95, 238, 0.6, "FLOODED"]],
        cap: "But the river was not always the same. In the rainy season the water overflowed — and the children had to walk an extra two kilometres.",
      },
      {
        bg: "road", sky: "warm",
        c: [K(105, 276, "walk", { bag: true, L: "lunch" }), F(250, 205, "walk", "#38bdf8", { s: 0.5 }), F(285, 205, "walk", "#f472b6", { s: 0.5 })],
        say: ["Almost home…", "tr", "think"],
        cap: "One day, after school, his friends left ahead of him. He was walking alone, carrying his lunchbox in one hand.",
      },
    ],
  },
  {
    ch: 1,
    panels: [
      {
        bg: "flood", sky: "gray",
        c: [K(45, 240, "walk", { bag: true, L: "lunch" })],
        say: ["Same as always…", "tr", "think"],
        cap: "He didn't know the river had overflowed after the rain. He approached and stepped into the water, just as he normally did.",
      },
      {
        bg: "flood", sky: "gray",
        c: [K(150, 238, "walk", { bag: true, L: "lunch", ex: "o" })],
        p: [["^w", 0, 208, 1, "", MUD], ["lines", 200, 150, 1.2]],
        say: ["Huh?!", "tr", "say"], sfx: "WHOOSH!", sfxAt: "bl",
        cap: "But that day, the current was stronger. Within moments, the water pulled at his legs.",
      },
      {
        bg: "flood", sky: "storm",
        c: [K(190, 200, "tumble", { bag: true, L: "lunch", ex: "o" })],
        p: [["splash", 140, 205, 1.1], ["^w", 0, 224, 1, "", MUD]],
        sfx: "SPLASH!", sfxAt: "tr",
        cap: "He lost his balance. Before he could understand what was happening, the river swept him away.",
      },
      {
        bg: "flood", sky: "storm",
        c: [K(190, 205, "swim", { L: "lunch", ex: "o" })],
        p: [["^w", 0, 214, 1, "", MUD], ["bubbles", 120, 205, 1]],
        say: ["HELP!", "tl", "shout"],
        cap: "He struggled against the current, but the water was too powerful. He was being carried downstream — and began to feel he might not survive.",
      },
    ],
  },
  {
    ch: 1,
    panels: [
      {
        bg: "floodhigh", sky: "storm",
        c: [K(99, 284, "grab", { L: "lunch", ex: "grit" })],
        p: [["grass", 110, 224, 1], ["^w", 0, 262, 1, "", MUD]],
        cap: "Then, with one hand, he managed to grab a small patch of grass near the riverbank. His other hand was still holding his lunchbox.",
      },
      {
        bg: "floodhigh", sky: "storm",
        c: [K(99, 284, "grab", { L: "lunch", ex: "o" })],
        p: [["grass", 110, 224, 1.1, "tear"], ["^w", 0, 262, 1, "", MUD]],
        sfx: "RIIIP…", sfxAt: "tr", say: ["I can't hold on…", "tl", "think"],
        cap: "The current kept pulling. The grass began loosening from the muddy ground, its roots tearing away. He was almost out of strength.",
      },
      {
        bg: "flood", sky: "gray",
        c: [N(35, 240, "run"), K(240, 205, "swim", { s: 0.75, L: "lunch" })],
        p: [["exclaim", 150, 100, 1]],
        say: ["Hold on, boy!", "tr", "shout"],
        cap: "Just when he was close to letting go, a man passing nearby noticed him.",
      },
      {
        img: "handwater",
        cap: "The man immediately reached out his hand, grabbed the boy, and pulled him out of the river.",
      },
    ],
  },
  {
    ch: 1,
    panels: [
      {
        bg: "river", sky: "warm",
        c: [K(52, 228, "lie", { flip: true, ex: "o", bag: true })],
        p: [["lunch", 100, 236, 1.1], ["sweat", 20, 190, 1]],
        say: ["*cough* *cough*", "tr", "say"],
        cap: "The boy landed on the muddy riverbank, exhausted and frightened. His lunchbox was lying beside him. He had survived.",
      },
      {
        bg: "burst", col: "#a16207",
        p: [["lunch", 200, 215, 4.5], ["sparkle", 285, 90, 2], ["sparkle", 110, 120, 1.4]],
        cap: "That day, the boy didn't understand everything that had happened. He was just a child who had nearly lost his life in the river.",
      },
      {
        bg: "river", sky: "dusk",
        c: [K(50, 244, "think", { ex: "sad" })],
        p: [["question", 300, 110, 1.3]],
        say: ["How could I learn to swim?", "tr", "think"],
        cap: "But something had changed. The water had frightened him — but it had also left him with a question.",
      },
      {
        art: "year", col: "#0ea5e9", txt: "ONE HAND", sub: "ONE LIFE SAVED",
        cap: "That day, one man's hand saved a little boy's life.",
      },
    ],
  },

  // ───────────── CHAPTER 2 ─────────────
  {
    ch: 2,
    panels: [
      {
        bg: "village", sky: "warm",
        c: [K(150, 270, "think")],
        say: ["I want to learn swimming!", "tr", "say"],
        cap: "After the river incident, the boy wanted to learn swimming.",
      },
      {
        bg: "village", sky: "day",
        c: [K(190, 270, "stand", { ex: "sad" })],
        p: [["sign", 70, 262, 0.8, "NO POOL"], ["sign", 320, 262, 0.8, "NO COACH"], ["question", 200, 95, 1.2]],
        cap: "But there was one problem. He lived in a small village. No swimming academy. No swimming pool. No professional coach.",
      },
      {
        bg: "river", sky: "day",
        c: [K(185, 200, "cheer", SW), FS(275, 210, "swim", "#16a34a")],
        p: [["^w", 0, 207, 1, "", "#38bdf8"], ["splash", 120, 205, 0.9]],
        sfx: "SPLASH!", sfxAt: "tr",
        cap: "But there was water everywhere. And slowly, nature became his playground. First came the small canal.",
      },
      {
        bg: "well", sky: "day",
        c: [K(80, 266, "cheer", SW), FS(320, 266, "wave", "#7c3aed"), FS(205, 125, "tumble", "#f59e0b", { rot: 10 })],
        p: [["splash", 200, 186, 0.8]],
        sfx: "JUMP!", sfxAt: "tl",
        cap: "Then the village well.",
      },
    ],
  },
  {
    ch: 2,
    panels: [
      {
        bg: "lake", sky: "day",
        c: [K(120, 195, "swim", SW), FS(250, 215, "swim", "#16a34a"), FS(60, 280, "wave", "#7c3aed")],
        sfx: "SPLASH!", sfxAt: "tr",
        cap: "After that, the village lake. He began spending time around different water bodies with his friends.",
      },
      {
        bg: "village", sky: "warm",
        c: [M(120, 272, "hips")],
        p: [["exclaim", 250, 130, 1]],
        say: ["Where is that boy?!", "tr", "shout"],
        cap: "His mother spent years searching for him. Sometimes she found him at the canal. Sometimes at the well. Other times, near the lake.",
      },
      {
        bg: "village", sky: "day",
        c: [M(250, 272, "point", { flip: true }), K(120, 272, "walk", { ex: "sad" })],
        say: ["Don't go there again!", "tr", "shout"], say2: ["Okay, Amma…", "bl", "say"],
        cap: "She would scold him, take him home, and warn him not to go there again. The boy would listen. At least until the next day.",
      },
      {
        bg: "village", sky: "dusk",
        c: [M(100, 272, "think"), K(270, 270, "sit")],
        say: ["He always comes back safe…", "tr", "think"],
        cap: "Eventually, she became tired of following him everywhere. Since he kept returning home safely, she gradually began believing he knew how to handle himself.",
      },
    ],
  },
  {
    ch: 2,
    panels: [
      {
        img: "quarry",
        cap: "By seventh or eighth grade, he discovered another place: a quarry. It was enormous. The sides were steep and rocky, and nobody really knew how deep the water was.",
      },
      {
        bg: "village", sky: "day",
        c: [N(110, 272, "point", { hair: "#e5e7eb", shirt: "#f8fafc", pants: "#f8fafc" }), K(270, 272, "stand"), F(330, 272, "stand", "#a3e635")],
        say: ["Stay away from the quarry!", "tr", "shout"],
        cap: "Villagers warned children not to go near it. But the boy was curious.",
      },
      {
        bg: "quarry", sky: "warm",
        c: [K(60, 150, "stand"), F(18, 150, "point", "#f472b6")],
        say: ["How deep is it…?", "br", "think"],
        cap: "He continued exploring different places with his friends. Somewhere along the way, he almost forgot why he had started following water in the first place.",
      },
      {
        bg: "lake", sky: "dusk",
        c: [K(160, 150, "tumble", SW), FS(60, 280, "cheer", "#7c3aed"), FS(330, 280, "wave", "#f59e0b")],
        p: [["splash", 200, 185, 0.9]],
        sfx: "SPLASH!", sfxAt: "tr",
        cap: "No coach. No curriculum. Not even a proper swimming pool. He had childhood, friends, and water. And the journey continued.",
      },
    ],
  },

  // ───────────── CHAPTER 3 ─────────────
  {
    ch: 3,
    panels: [
      {
        bg: "village", sky: "day",
        c: [K(130, 272, "cheer"), F(260, 272, "run", "#a3e635")],
        p: [["ball", 195, 268, 1.6]],
        say: ["Don't talk about studies! 😂", "tr", "shout"],
        cap: "The boy loved playing more than studying. If someone asked him about studies, his answer would probably be:",
      },
      {
        bg: "village", sky: "day",
        c: [K(200, 272, "run"), F(300, 272, "run", "#f472b6", { flip: true })],
        p: [["sign", 70, 262, 0.8, "SCHOOL"], ["ball", 250, 268, 1.6]],
        cap: "At school, he played whenever he got the chance. After school, he continued playing at home. Sometimes he went swimming, but most of his childhood was filled with games and fun.",
      },
      {
        bg: "well", sky: "day",
        c: [K(105, 266, "stand", SW), T(290, 266, "wave", { ...SW, s: 1.05, pants: "#0d9488" }), FS(55, 270, "sit", "#a855f7")],
        cap: "There was a well very close to his home. His older brother — just one class ahead — and his friends joined them there.",
      },
      {
        bg: "well", sky: "day",
        c: [FS(90, 266, "cheer", "#ef4444"), FS(310, 266, "wave", "#7c3aed"), FS(205, 122, "tumble", "#f59e0b", { rot: 10 })],
        p: [["splash", 200, 188, 0.8]],
        sfx: "SPLASH!", sfxAt: "tr",
        cap: "Some already knew swimming. Others were still learning. For them, it was a favourite gathering place.",
      },
    ],
  },
  {
    ch: 3,
    panels: [
      {
        bg: "village", sky: "warm",
        c: [K(200, 272, "cheer")],
        p: [["ball", 120, 268, 1.6]],
        say: ["Today I'll play with my friends!", "tr", "say"],
        cap: "But one particular day in ninth grade changed everything. The boy had planned to stay home and play with his friends.",
      },
      {
        bg: "farm", sky: "warm",
        c: [M(110, 262, "point"), K(250, 268, "walk", { ex: "sad" })],
        say: ["Today you're coming with me.", "tr", "say"], say2: ["But Amma…", "br", "say"],
        cap: "His mother had other plans. Instead of spending the day playing, he had to accompany her to work in the village farms.",
      },
      {
        bg: "well", sky: "gray",
        c: [T(60, 266, "walk", { ...SW, s: 1.05, pants: "#0d9488" }), FS(130, 266, "walk", "#ef4444"), FS(300, 266, "walk", "#7c3aed", { flip: true })],
        cap: "He wasn't at the well that day. While he was away, his older brother and their friends went there as usual.",
      },
      {
        bg: "wellsad", sky: "dusk", dim: 0.28,
        p: [["ripple", 200, 198, 1], ["exclaim", 330, 110, 1.2]],
        sfx: "…", sfxAt: "tl",
        cap: "But something terrible happened. One of the boys drowned and died at the very place where they had all spent so much time playing.",
      },
    ],
  },
  {
    ch: 3,
    panels: [
      {
        bg: "farm", sky: "gray",
        c: [K(190, 268, "walk"), M(260, 262, "walk"), N(30, 270, "run", { shirt: "#fde047" })],
        say: ["Come quickly! The well…!", "tr", "shout"],
        cap: "The boy was not there when the tragedy happened. He was far away, working with his mother in the village farms.",
      },
      {
        bg: "farm", sky: "storm", dim: 0.18,
        c: [K(200, 270, "stand", { ex: "sad" })],
        p: [["exclaim", 300, 110, 1.2]],
        say: ["No… it can't be.", "tl", "think"],
        cap: "When he learned what had happened, the place that had once been filled with laughter became a place of painful memories.",
      },
      {
        img: "well",
        cap: "Nobody went swimming at that well again. The gatherings stopped. The laughter disappeared. The well was still there, but everything around it had changed.",
      },
      {
        bg: "wellsad", sky: "dusk", dim: 0.15,
        c: [K(65, 268, "sit", { ex: "sad" })],
        cap: "As the boy moved toward tenth grade, an entire year passed without swimming at that well. Swimming did not disappear from his life — but that chapter of his childhood had come to an end.",
      },
    ],
  },
];
