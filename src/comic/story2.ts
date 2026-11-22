import type { Char, Page } from "./types";
import { K, FS, F, M, N, T, C, SW } from "./cast";

const GUARD: Partial<Char> = { shirt: "#dc2626", pants: "#111827", neck: "whistle" };
void K;

export const part2: Page[] = [
  // ───────────── CHAPTER 4 ─────────────
  {
    ch: 4,
    panels: [
      {
        bg: "room", sky: "day",
        c: [T(190, 268, "think", { L: "book", ex: "sad" })],
        p: [["desk", 80, 262, 1.3]],
        say: ["Is this really it…?", "tr", "think"],
        cap: "After tenth grade, everyone expected the boy to continue studying. But he wasn't interested. Studying wasn't making him happy or giving him the life he wanted.",
      },
      {
        bg: "room", col: "#fde68a",
        c: [M(90, 268, "hips"), T(205, 268, "stand", { ex: "sad" }), N(315, 268, "point", { flip: true })],
        say: ["You must study.", "tr", "say"],
        cap: "He spoke to his parents about it, but they had different plans.",
      },
      {
        bg: "shop",
        c: [T(160, 268, "walk", { R: "sack", ex: "grit" })],
        p: [["sweat", 210, 190, 1.2]],
        sfx: "HEAVE!", sfxAt: "tr",
        cap: "Eventually, he ended up working at a wholesale shop. He worked there for fifteen days. The work was difficult.",
      },
      {
        bg: "road", sky: "dawn",
        c: [T(170, 272, "think")],
        p: [["bulb", 250, 120, 1.4]],
        say: ["This isn't the life I want. College!", "tl", "shout"],
        cap: "During those fifteen days, he realized something. He decided he would go to college, study, and enjoy his life.",
      },
    ],
  },
  {
    ch: 4,
    panels: [
      {
        bg: "road", sky: "day",
        c: [T(110, 272, "walk", { bag: true })],
        p: [["sign", 270, 268, 1.3, "SSN COLLEGE"]],
        cap: "He began searching for a junior college for eleventh and twelfth grade. That search brought him to SSN College, Narasaraopet.",
      },
      {
        img: "college",
        cap: "There was something special about the college. It had an Olympic-standard swimming pool.",
      },
      {
        bg: "class", sky: "day",
        c: [T(85, 268, "stand", { ex: "o" }), N(325, 268, "point", { flip: true, shirt: "#7c3aed" })],
        p: [["board", 190, 100, 1.2, "ENGLISH|ONLY!", "#166534"], ["question", 60, 125, 1]],
        say: ["Everything's in English?!", "br", "shout"],
        cap: "But college brought a new challenge. Until then, he had studied in Telugu medium. Now, for the first time, he was studying entirely in English medium.",
      },
      {
        bg: "room", sky: "day",
        c: [T(170, 270, "think", { L: "book", ex: "sad" })],
        p: [["desk", 300, 262, 1.4]],
        say: ["What does this sentence mean…?", "tr", "think"],
        cap: "His English was very weak. He had barely managed to pass English tests at school. Now he read the same sentence again and again, trying to understand.",
      },
    ],
  },
  {
    ch: 4,
    panels: [
      {
        bg: "class", sky: "dawn", dim: 0.15, tag: "MORNING TUITION",
        c: [T(190, 268, "stand", { ex: "sad", L: "book" })],
        p: [["clock", 320, 90, 1.2, "5:30"]],
        cap: "His daily routine was packed. Morning tuition: 5:30 AM to 8:00 AM.",
      },
      {
        bg: "class", sky: "day", tag: "COLLEGE",
        c: [T(140, 268, "stand", { R: "book" }), F(270, 268, "stand", "#38bdf8")],
        p: [["clock", 320, 90, 1.2, "10:00"]],
        cap: "College during the day.",
      },
      {
        bg: "class", sky: "night", dim: 0.4, tag: "EVENING TUITION",
        c: [T(200, 268, "think", { L: "book", ex: "sad" })],
        p: [["clock", 320, 90, 1.2, "8:00"]],
        cap: "Evening tuition: 8:00 PM to 10:00 PM.",
      },
      {
        bg: "room", sky: "night", dim: 0.45,
        c: [T(150, 266, "sit", { ex: "sad" })],
        say: ["Why am I here? Is this really the life I imagined?", "tr", "think"],
        cap: "He lived in the college hostel, right next to his classroom. Sometimes he wondered: Why am I here?",
      },
    ],
  },
  {
    ch: 4,
    panels: [
      {
        bg: "pool", sky: "day", tag: "RIGHT BESIDE HIS CLASSROOM",
        c: [T(80, 262, "stand", { L: "book", ex: "sad" }), FS(250, 168, "swim", "#16a34a"), FS(320, 190, "swim", "#f59e0b")],
        cap: "He had wanted freedom, friends, and fun. Instead, his days were filled with books and tuition. But there was something right beside his classroom: the swimming pool.",
      },
      {
        bg: "pool", sky: "dawn",
        c: [T(150, 262, "think", { L: "book" })],
        p: [["bulb", 250, 100, 1.3]],
        say: ["Swimming means… no tuition! 😄", "tr", "say"],
        cap: "The pool had morning and evening sessions. He started thinking about joining. Not because he had a big plan to become a national athlete — he wanted to escape tuition, at least sometimes.",
      },
      {
        bg: "pool", sky: "day",
        c: [T(110, 262, "stand", SW), C(290, 262, "point", { flip: true, L: "board" })],
        say: ["What should I do today?", "tl", "say"], say2: ["Fifty laps. Go!", "br", "shout"],
        cap: "The coach was busy preparing other swimmers for competitions, so the boy didn't get continuous guidance. Sometimes he'd ask what to do — and the coach gave him practice tasks.",
      },
      {
        bg: "pool", sky: "day",
        c: [T(190, 168, "swim", SW), F(335, 262, "stand", "#38bdf8")],
        p: [["splash", 120, 165, 0.9]],
        sfx: "SPLASH!", sfxAt: "tr",
        cap: "He had no mobile phone of his own, but he wanted to learn. Whenever he could, he watched swimming videos, observed other swimmers, and practised.",
      },
    ],
  },
  {
    ch: 4,
    panels: [
      {
        bg: "pool", sky: "day",
        c: [T(200, 262, "cheer", { ...SW, neck: "medal" })],
        p: [["txt", 310, 100, 1.2, "2ND PLACE", "#e5e7eb"], ["sparkle", 120, 140, 1.5]],
        cap: "He signed up for a competition. In one event, he secured second place. In another, he managed to finish.",
      },
      {
        bg: "pool", sky: "day", tag: "STATE LEVEL",
        c: [FS(200, 189, "cheer", "#16a34a"), FS(132, 215, "cheer", "#f59e0b"), T(268, 234, "cheer", { ...SW, neck: "medal", s: 1.15 })],
        p: [["podium", 200, 270, 1.3]],
        cap: "Then came the next state-level competition. He secured third place.",
      },
      {
        bg: "pool", sky: "day",
        c: [C(110, 262, "point", { L: "board" }), T(270, 262, "stand", { ...SW, ex: "o" })],
        p: [["exclaim", 200, 100, 1]],
        say: ["You're selected for the National Games!", "tr", "shout"], say2: ["Me?!", "br", "say"],
        cap: "After the competition, he returned to his regular college routine. One day, the coach told him something unexpected: he had been selected for the National Games.",
      },
      {
        img: "nationals",
        cap: "He travelled to New Delhi for the 65th National School Games 2019–20, held from November 17 to 22, 2019, in the Boys Under-17 category.",
      },
    ],
  },
  {
    ch: 4,
    panels: [
      {
        bg: "delhi", sky: "day", tag: "NEW DELHI · NOV 2019",
        c: [T(200, 272, "cheer", { bag: true, neck: "medal" })],
        p: [["flag", 70, 262, 1.1], ["flag", 330, 262, 1.1]],
        cap: "It was a huge moment. The same boy who had joined swimming to escape tuition, who struggled with English lessons, was now representing Andhra Pradesh at the national level.",
      },
      {
        art: "month",
        cap: "And all of this had happened after less than one month of structured swimming practice.",
      },
      {
        bg: "road", sky: "dawn",
        c: [T(130, 272, "walk", { bag: true })],
        p: [["sign", 290, 268, 1.1, "SSN COLLEGE"]],
        cap: "He hadn't entered college planning to become a national-level athlete. He had entered because he wanted a different life.",
      },
      {
        bg: "pool", sky: "dawn",
        c: [T(200, 262, "stand", SW)],
        p: [["sparkle", 120, 130, 1.6], ["sparkle", 290, 100, 1.2], ["txt", 200, 55, 1, "THE POOL HAD OTHER PLANS"]],
        cap: "But the swimming pool had other plans for him.",
      },
    ],
  },

  // ───────────── CHAPTER 5 ─────────────
  {
    ch: 5,
    sub: "The Dream That COVID Interrupted",
    panels: [
      {
        bg: "village", sky: "warm",
        c: [T(190, 272, "stand", { neck: "medal" })],
        say: ["I actually did it!", "tr", "shout"],
        cap: "After returning from Delhi, the boy started thinking differently. He had achieved something he had never expected.",
      },
      {
        bg: "pool", sky: "dawn",
        c: [T(150, 262, "think", SW)],
        p: [["trophy", 310, 175, 1.4]],
        say: ["One more year of training… what then?", "tr", "think"],
        cap: "If he could reach that level with barely one month of structured practice, what could happen if he trained for another year? What if he competed in more events? How far could he go?",
      },
      {
        bg: "lake", sky: "dawn",
        c: [T(200, 280, "point", { shirt: "#fb923c" })],
        p: [["sparkle", 300, 120, 1.5], ["sparkle", 90, 90, 1.1]],
        cap: "For the first time, he started imagining a bigger sporting future.",
      },
      {
        bg: "village", sky: "storm",
        c: [T(140, 272, "stand", { ex: "o" })],
        p: [["virus", 280, 100, 2.2]],
        sfx: "LOCKDOWN!", sfxAt: "tl",
        cap: "But just when he began thinking about what came next, the world changed. COVID arrived. Lockdown began.",
      },
    ],
  },
  {
    ch: 5,
    panels: [
      {
        img: "covid",
        cap: "Swimming pools closed. Competitions stopped. Training opportunities disappeared.",
      },
      {
        bg: "village", sky: "gray",
        c: [T(190, 268, "sit", { ex: "sad" })],
        p: [["mask", 300, 235, 1.5]],
        cap: "The boy returned home and stayed there for almost two years. There was no regular swimming practice, no competitions, and no coach-led training.",
      },
      {
        bg: "room", col: "#e5e7eb", sky: "gray",
        c: [T(130, 268, "think", { ex: "sad" })],
        p: [["clock", 300, 80, 1.3, "2020"], ["clock", 300, 135, 1.3, "2021"]],
        cap: "The momentum he had built slowly disappeared. His college journey was also affected: under the COVID arrangements, students were promoted to the next academic year.",
      },
      {
        bg: "pool", sky: "night", dim: 0.4,
        c: [T(90, 262, "stand", { ex: "sad" })],
        p: [["gate", 260, 262, 1.5], ["mask", 360, 270, 1]],
        say: ["I found my potential… but where's the pool?", "tr", "think"],
        cap: "He had finally discovered his potential, but now he had no opportunity to explore it. He had plans in his mind. But the world had stopped.",
      },
    ],
  },

  // ───────────── CHAPTER 6 ─────────────
  {
    ch: 6,
    panels: [
      {
        bg: "pool", sky: "day",
        c: [T(110, 262, "wave", SW)],
        p: [["sign", 280, 262, 1.2, "POOL OPEN"], ["sparkle", 200, 120, 1.3]],
        cap: "After the COVID period, the college swimming pool reopened. But things were different. The previous coach had left, and a new team was coming in.",
      },
      {
        img: "lifeguard",
        cap: "The pool needed lifeguard support. The boy got an opportunity to return — and this time, he wasn't returning only as a swimmer.",
      },
      {
        bg: "pool", sky: "day",
        c: [T(140, 262, "stand", { ...GUARD, L: "buoy" }), FS(260, 262, "cheer", "#16a34a"), FS(330, 262, "wave", "#f59e0b")],
        p: [["ring", 60, 235, 1.1]],
        say: ["Lifeguard AND junior coach!", "tr", "shout"],
        cap: "He started working as both a lifeguard and a junior coach. He took the opportunity to earn money and enjoy life.",
      },
      {
        bg: "pool", sky: "dawn",
        c: [T(110, 262, "point", GUARD), FS(240, 168, "swim", "#16a34a"), FS(310, 190, "swim", "#f59e0b")],
        cap: "He worked in the mornings and evenings. He also attended college classes, handled lifeguard duties, supported the coaching team, and practised swimming himself.",
      },
    ],
  },
  {
    ch: 6,
    panels: [
      {
        bg: "pool", sky: "day",
        c: [T(60, 262, "stand", GUARD), FS(210, 170, "swim", "#16a34a"), FS(290, 192, "swim", "#f59e0b")],
        cap: "It was still the period after COVID, so attendance was low. Only a few students came for the morning and evening sessions. There wasn't much pressure.",
      },
      {
        bg: "pool", sky: "warm",
        c: [T(180, 262, "think", GUARD)],
        say: ["So this is how a pool works…", "tr", "think"],
        cap: "But something important was happening. He was beginning to understand the swimming pool from another side.",
      },
      {
        bg: "plant", sky: "day",
        c: [T(210, 268, "point")],
        say: ["What's behind all this water?", "tr", "think"],
        cap: "Earlier, he had entered the pool as a swimmer. Now he was learning what happened behind the scenes.",
      },
      {
        bg: "pool", sky: "day",
        c: [T(130, 262, "hold", { ...GUARD, L: "board" }), C(300, 262, "point", { flip: true, L: "board" })],
        cap: "He watched how a pool operated, how coaching sessions were handled, and how the people responsible managed their work. He was moving from swimmer to understanding the world behind swimming.",
      },
    ],
  },

  // ───────────── CHAPTER 7 ─────────────
  {
    ch: 7,
    panels: [
      {
        bg: "city", sky: "day",
        c: [T(150, 276, "walk", { bag: true })],
        p: [["sign", 300, 276, 1.15, "HYDERABAD"]],
        cap: "After gaining experience as a lifeguard and junior coach, he went to Hyderabad. This time, the purpose was different.",
      },
      {
        bg: "plant", sky: "day",
        c: [T(160, 268, "hold", { L: "board" })],
        p: [["txt", 310, 170, 0.9, "3 MONTHS"]],
        cap: "He wanted to learn pool maintenance and operations. He spent three months learning how swimming pools were managed.",
      },
      {
        bg: "plant", sky: "day",
        c: [T(120, 268, "think")],
        p: [["bulb", 250, 150, 1.2]],
        say: ["Filters, pumps, chemicals… a whole system!", "tr", "think"],
        cap: "He began understanding that a swimming pool was not just water, lanes, and swimmers. There was an entire system behind it.",
      },
      {
        bg: "pool", sky: "day",
        c: [T(130, 262, "point", { ...GUARD, shirt: "#0d9488", L: "board" }), FS(250, 170, "swim", "#16a34a"), FS(315, 190, "swim", "#f59e0b")],
        cap: "After those three months, he worked at the same pool for about a month as pool operator and coach — handling maintenance, operations and coaching, and learning what it takes to run a pool.",
      },
    ],
  },

  // ───────────── CHAPTER 8 ─────────────
  {
    ch: 8,
    panels: [
      {
        bg: "room", col: "#bfdbfe",
        c: [T(110, 268, "stand"), N(320, 268, "stand", { flip: true, shirt: "#1d4ed8" })],
        p: [["desk", 215, 262, 1.7]],
        say: ["We're hiring swimming coaches.", "tr", "say"], say2: ["I'm ready!", "bl", "say"],
        cap: "During this period, he received an opportunity from his hometown. They were hiring swimming coaches. He attended the interview and joined.",
      },
      {
        bg: "pool", sky: "day",
        c: [T(110, 262, "point", { ...GUARD, L: "kick" }), FS(240, 170, "swim", "#16a34a"), FS(310, 192, "swim", "#f59e0b")],
        cap: "He worked there for almost one year. It was another experience in his coaching journey.",
      },
      {
        bg: "room", sky: "day",
        c: [T(150, 268, "think", { L: "book" })],
        p: [["board", 300, 100, 1, "DEGREE|EXAMS|SOON!", "#166534"]],
        cap: "But something else was approaching. His degree examinations were coming in two or three months. He decided to leave the job and focus on completing his degree.",
      },
      {
        bg: "city", sky: "day",
        c: [T(190, 276, "cheer", { shirt: "#111827", pants: "#111827" })],
        p: [["cert", 310, 215, 1.5, "DEGREE"], ["sparkle", 100, 150, 1.5], ["sparkle", 280, 110, 1.2]],
        cap: "He completed his degree. And after that, he returned to Hyderabad.",
      },
    ],
  },
  {
    ch: 8,
    panels: [
      {
        bg: "pool", sky: "day", tag: "SWIMMER",
        c: [T(190, 168, "swim", SW)],
        p: [["splash", 125, 165, 0.9]],
        cap: "By then, his journey had already taken him through several roles. He had been a swimmer…",
      },
      {
        bg: "pool", sky: "day", tag: "LIFEGUARD",
        c: [T(190, 262, "stand", { ...GUARD, L: "buoy" })],
        p: [["ring", 90, 235, 1.1]],
        cap: "…a lifeguard, a junior coach…",
      },
      {
        bg: "plant", sky: "day", tag: "POOL OPERATOR",
        c: [T(190, 268, "point")],
        cap: "…a pool operator…",
      },
      {
        bg: "pool", sky: "warm", tag: "COACH",
        c: [T(180, 262, "point", { ...GUARD, shirt: "#0d9488", L: "board" }), FS(300, 262, "cheer", "#16a34a")],
        p: [["sparkle", 290, 110, 1.3]],
        cap: "…and a swimming coach. Each experience had taught him something different. But he was still figuring out what he wanted to build with all that experience.",
      },
    ],
  },
];
