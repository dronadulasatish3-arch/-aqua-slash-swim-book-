import type { Char, Page } from "./types";
import { A, K, FS, F, M, N, T, SW } from "./cast";

const MUD = "#c28a2c";
const OLD: Partial<Char> = { shirt: "#6366f1", neck: "whistle" };
const GUARD: Partial<Char> = { shirt: "#dc2626", pants: "#111827", neck: "whistle" };

export const part3: Page[] = [
  // ───────────── CHAPTER 9 ─────────────
  {
    ch: 9,
    panels: [
      {
        bg: "club", sky: "day", tag: "CLUB STARTUP",
        c: [A(130, 262, "point", { ...OLD, L: "board" }), FS(250, 170, "swim", "#16a34a"), FS(315, 192, "swim", "#f59e0b")],
        cap: "After completing his degree, he returned to Hyderabad. Before starting his own venture, he worked with a small startup operating in a club environment.",
      },
      {
        img: "community",
        cap: "There, he gained experience in community swimming coaching. He began understanding how swimming programs could operate beyond traditional academies — reaching people in their own residential communities.",
      },
      {
        bg: "room", col: "#e0f2fe",
        c: [A(160, 268, "stand", OLD)],
        p: [["cert", 300, 215, 1.7, "NSNIS"], ["sparkle", 90, 120, 1.4], ["sparkle", 330, 100, 1.1]],
        say: ["NSNIS certified!", "tr", "shout"],
        cap: "Alongside this journey, he completed his NSNIS certification.",
      },
      {
        bg: "road", sky: "dusk",
        c: [A(150, 274, "stand", OLD)],
        p: [["signpost", 300, 278, 1.1, ["ATHLETE", "LIFEGUARD", "COACH", "OPERATOR"]]],
        cap: "His experience was growing. He had seen swimming from different angles: as an athlete, lifeguard, junior coach, pool operator, and community swimming coach.",
      },
    ],
  },
  {
    ch: 9,
    panels: [
      {
        bg: "road", sky: "dusk",
        c: [A(120, 274, "think", OLD)],
        p: [["signpost", 300, 278, 1.1, ["WORK FOR OTHERS", "BUILD MY OWN"]]],
        say: ["My own venture.", "tr", "think"],
        cap: "Then came a new decision. Instead of continuing to work for someone else's organization, he wanted to build something of his own.",
      },
      {
        art: "logo",
        cap: "He wanted to create his own swimming venture. And in 2024, Aqua Slash began.",
      },
      {
        bg: "community", sky: "day",
        c: [A(200, 262, "cheer")],
        p: [["sparkle", 110, 120, 1.5], ["sparkle", 300, 100, 1.2]],
        cap: "It was his own startup. His own idea. His own responsibility.",
      },
      {
        bg: "room", col: "#fef9c3",
        c: [A(110, 268, "point")],
        p: [["board", 275, 105, 1.3, "WHY?|AQUA SLASH"]],
        cap: "He worked on building Aqua Slash through 2024 and 2025. It was no longer about finding a place to swim — he was trying to bring swimming education to more people. But first, he needed to understand why.",
      },
    ],
  },

  // ───────────── CHAPTER 10 ─────────────
  {
    ch: 10,
    panels: [
      {
        bg: "flood", sky: "gray",
        c: [A(60, 240, "think"), K(230, 200, "swim", { s: 0.6, ex: "o" })],
        say: ["The river…", "tr", "think"],
        cap: "Throughout his journey, the boy had seen how people struggled around water. He had experienced a frightening river incident himself.",
      },
      {
        bg: "wellsad", sky: "dusk", dim: 0.2,
        c: [A(80, 266, "stand", { ex: "sad" })],
        cap: "He had also witnessed how a tragedy at the village well changed the lives of people around him.",
      },
      {
        bg: "room", col: "#cbd5e1",
        c: [A(190, 268, "think", { ex: "sad" })],
        p: [["drop", 300, 100, 1.8], ["drop", 90, 130, 1.2]],
        say: ["So many lives lost…", "tr", "think"],
        cap: "One thought kept returning. So many people were losing their lives because they did not know how to swim or how to understand water.",
      },
      {
        bg: "room", col: "#e0f2fe",
        c: [A(110, 268, "point")],
        p: [["bulb", 280, 110, 1.6]],
        say: ["Why not take swimming education to the people?", "tr", "shout"],
        cap: "He began asking himself: Why should swimming education remain limited to people who visit academies? Why should people always have to search for a pool or a coaching center?",
      },
    ],
  },
  {
    ch: 10,
    panels: [
      {
        bg: "community", sky: "day",
        c: [A(60, 262, "point"), FS(260, 262, "stand", "#16a34a")],
        cap: "He started thinking about residential communities. Many already had swimming pools. People lived there with their families, and children had access to those facilities.",
      },
      {
        bg: "community", sky: "day",
        c: [F(150, 262, "stand", "#f472b6", { ex: "sad" }), F(220, 262, "stand", "#38bdf8", { ex: "sad" }), M(330, 262, "stand")],
        say: ["I'm scared of the water…", "tl", "say"],
        cap: "But access to a swimming pool did not automatically mean people knew how to swim.",
      },
      {
        bg: "community", sky: "warm",
        c: [A(150, 262, "walk", { L: "kick" }), FS(260, 262, "cheer", "#16a34a"), FS(330, 262, "wave", "#f59e0b")],
        p: [["sparkle", 300, 110, 1.4]],
        cap: "He saw an opportunity. Instead of waiting for students to come to an academy, he could bring structured swimming coaching to residential communities. That became one of the foundations of Aqua Slash.",
      },
      {
        bg: "community", sky: "day",
        c: [A(110, 262, "hold", { L: "kick" })],
        p: [["comic", 285, 235, 2.2]],
        say: ["Classes. Water safety. Even comics!", "tr", "say"],
        cap: "He wanted to work with communities, build confidence in water, and create awareness about water safety. Over time, he also wanted to explore school programs, educational content, comics, and visual learning.",
      },
    ],
  },
  {
    ch: 10,
    panels: [
      {
        bg: "community", sky: "day",
        c: [M(90, 262, "stand"), A(190, 262, "wave"), N(300, 262, "stand", { shirt: "#7c3aed" })],
        cap: "Aqua Slash was not just about collecting students or conducting swimming classes. There was a bigger reason behind it. He wanted people to understand water.",
      },
      {
        bg: "community", sky: "day",
        c: [A(110, 262, "point", { L: "kick" }), FS(240, 170, "swim", "#16a34a"), FS(310, 192, "swim", "#f59e0b"), FS(340, 262, "cheer", "#7c3aed")],
        cap: "He wanted children to learn swimming.",
      },
      {
        bg: "community", sky: "warm",
        c: [A(200, 262, "cheer")],
        p: [["sparkle", 100, 120, 1.4], ["sparkle", 310, 110, 1.4]],
        cap: "He wanted swimming education to reach places where people could actually use it.",
      },
      {
        art: "tagline",
        cap: "The idea was simple. The boy who once needed a hand in the water now wanted to build something that could help others understand it. But the real challenge was just beginning.",
      },
    ],
  },

  // ───────────── CHAPTER 11 ─────────────
  {
    ch: 11,
    panels: [
      {
        bg: "community", sky: "day",
        c: [A(190, 262, "walk", { L: "kick", R: "board", ex: "grit" })],
        p: [["sweat", 240, 190, 1.3]],
        say: ["Where do I even begin?", "tr", "think"],
        cap: "Starting Aqua Slash was exciting. But the moment he entered the real world of community coaching, he understood that building a startup was not easy.",
      },
      {
        bg: "community", sky: "day",
        c: [A(100, 262, "point"), N(250, 262, "stand", { shirt: "#7c3aed", flip: true }), M(335, 262, "stand", { flip: true })],
        say: ["We teach swimming — safely, step by step.", "tl", "say"], say2: ["Hmm… let us think.", "br", "say"],
        cap: "He had to approach communities, build relationships, convince people, organize classes, and establish trust.",
      },
      {
        bg: "community", sky: "day",
        c: [A(150, 262, "point", { L: "board", ex: "grit" }), FS(260, 170, "swim", "#16a34a"), FS(330, 195, "swim", "#f59e0b")],
        p: [["sweat", 210, 190, 1.4]],
        cap: "He was handling much of the work himself.",
      },
      {
        art: "year", col: "#0d9488", txt: "2 COMMUNITIES", sub: "WHERE IT ALL BEGAN",
        cap: "In the initial stage, Aqua Slash began working in two communities. Most of his time was spent there, building the program, coaching students, and making the startup work.",
      },
    ],
  },
  {
    ch: 11,
    panels: [
      {
        bg: "road", sky: "day",
        c: [A(250, 220, "tumble", { ex: "o" })],
        p: [["scooter", 150, 280, 1.3], ["splash", 200, 250, 0.7]],
        sfx: "CRASH!", sfxAt: "tl",
        cap: "But the journey wasn't smooth. During this early phase, he met with an accident.",
      },
      {
        bg: "room", col: "#f1f5f9",
        c: [A(185, 214, "lie", { flip: true, band: true, ex: "sad" })],
        p: [["bed", 200, 270, 1.6]],
        say: ["I can't coach like this…", "tr", "think"],
        cap: "The accident interrupted his coaching work, and for some time, he couldn't continue as usual.",
      },
      {
        bg: "community", sky: "warm",
        c: [F(110, 262, "stand", "#f472b6", { ex: "sad" }), F(200, 262, "stand", "#38bdf8", { ex: "sad" }), F(290, 262, "sit", "#a3e635", { ex: "sad" })],
        say: ["Where is our coach?", "tr", "think"],
        cap: "But the students were still waiting for him.",
      },
      {
        bg: "community", sky: "day",
        c: [A(200, 262, "cheer"), FS(95, 262, "cheer", "#16a34a"), FS(310, 262, "cheer", "#f59e0b")],
        p: [["sparkle", 300, 110, 1.4], ["sparkle", 100, 100, 1.2]],
        say: ["Coach is back!", "tl", "shout"],
        cap: "After recovering, he returned to coaching and started again. He did not quit. The first communities were where he began learning what it actually meant to run Aqua Slash.",
      },
    ],
  },

  // ───────────── CHAPTER 12 ─────────────
  {
    ch: 12,
    panels: [
      {
        bg: "room", col: "#fef9c3",
        c: [A(130, 268, "think", { L: "board" })],
        p: [["comic", 275, 232, 2.6], ["bulb", 200, 90, 1.3]],
        cap: "As the months passed, his thinking started expanding. He began planning educational comics — content that could explain swimming concepts in a different way.",
      },
      {
        bg: "community", sky: "day",
        c: [F(150, 262, "hold", "#f472b6", { L: "book" }), F(240, 262, "hold", "#38bdf8", { L: "book" })],
        p: [["comic", 335, 242, 2]],
        say: ["Swimming is fun!", "tr", "say"],
        cap: "He thought about how children could understand water, swimming skills, and learning stages through visual storytelling.",
      },
      {
        bg: "plant", sky: "day",
        c: [A(150, 268, "hold", { L: "board" })],
        say: ["My own pool operations… my own leads.", "tr", "think"],
        cap: "At one point, he returned to his hometown to work again. He also wanted to take responsibility for pool maintenance and operations independently, and planned to build his own leads.",
      },
      {
        bg: "lake", sky: "dusk",
        c: [A(200, 280, "stand", { ex: "sad" })],
        p: [["bulb", 90, 110, 1], ["bulb", 300, 90, 1.2], ["question", 330, 170, 0.9]],
        cap: "But that plan did not materialize. Some ideas moved forward. Others remained unfinished. But he kept thinking about how Aqua Slash could become more than a coaching service.",
      },
    ],
  },

  // ───────────── CHAPTER 13 ─────────────
  {
    ch: 13,
    panels: [
      {
        art: "year", col: "#0ea5e9", txt: "2024", sub: "THE BEGINNING",
        cap: "2024 was the year Aqua Slash began its journey. It started with an idea and the decision to build something of his own.",
      },
      {
        bg: "community", sky: "day", tag: "2 COMMUNITIES",
        c: [A(110, 262, "point", { L: "kick" }), FS(240, 170, "swim", "#16a34a"), FS(310, 192, "swim", "#f59e0b")],
        cap: "The initial work was in two residential communities. He spent most of his time there, handling coaching and trying to establish the program.",
      },
      {
        bg: "community", sky: "dawn",
        c: [A(200, 262, "stand", { ex: "grit" })],
        p: [["sparkle", 110, 120, 1.4], ["sparkle", 300, 110, 1.1]],
        cap: "There were challenges, including an accident that interrupted his work. But after recovering, he returned. He continued building Aqua Slash.",
      },
      {
        bg: "room", col: "#fef9c3",
        c: [A(150, 268, "hold", { L: "board" })],
        p: [["board", 300, 100, 1, "WHAT WORKS?|TRY - FIX|REPEAT"]],
        cap: "He explored educational comics, thought about pool operations, and tried to improve the way swimming was taught. It was not a perfect beginning — he was learning through experience.",
      },
    ],
  },
  {
    ch: 13,
    panels: [
      {
        art: "year", col: "#0d9488", txt: "2025", sub: "THE EXPANSION",
        cap: "The second year was about continuing the work and expanding through experience.",
      },
      {
        bg: "community", sky: "day",
        c: [A(100, 262, "point"), N(240, 262, "stand", { shirt: "#7c3aed", flip: true }), M(315, 262, "stand", { flip: true })],
        say: ["Can you teach our kids too?", "tr", "say"],
        cap: "He visited more communities, met different people, and worked with students from different backgrounds. Every community brought a different experience.",
      },
      {
        bg: "community", sky: "dusk",
        c: [A(190, 262, "think")],
        say: ["Why am I doing this? What am I building? How can I make it better?", "tr", "think"],
        cap: "He learned how to communicate with residents, organize programs, and understand each community's expectations. And he kept questioning himself.",
      },
      {
        art: "growth",
        cap: "He wasn't simply trying to increase the number of students. By 2025, Aqua Slash had grown from its initial two communities to seven communities.",
      },
    ],
  },
  {
    ch: 13,
    panels: [
      {
        art: "timeline",
        cap: "2024 — The foundation. 2025 — The expansion. Two years of building, learning, struggling, and improving Aqua Slash.",
      },
      {
        bg: "lake", sky: "dusk",
        c: [A(200, 280, "stand", { ex: "sad" })],
        say: ["Something is still missing…", "tr", "think"],
        cap: "But after two years of running his own startup, he began feeling that something was still missing.",
      },
      {
        bg: "room", col: "#fef9c3",
        c: [A(150, 268, "think")],
        p: [["bulb", 270, 100, 1.4], ["bulb", 90, 110, 0.9]],
        cap: "He had his own experience. He had his own coaching style. He had his own ideas. But he wanted to understand swimming development at a deeper level.",
      },
      {
        bg: "pool", sky: "day",
        c: [A(110, 262, "think")],
        p: [["board", 285, 110, 1.15, "STAGES?|LEVELS?|SKILLS?", "#166534"]],
        cap: "He wanted to learn how a structured swimming system was designed and how swimmers could progress through clearly defined stages. That feeling would lead him to another important chapter.",
      },
    ],
  },

  // ───────────── CHAPTER 14 ─────────────
  {
    ch: 14,
    sub: "One Drop at a Time",
    panels: [
      {
        art: "year", col: "#7c3aed", txt: "JULY 1, 2026", sub: "A NEW WAY OF SEEING THE WATER",
        cap: "After two years of building Aqua Slash, he started feeling that something was missing. He had coached students, worked across communities, and built a startup from the ground up. But he wanted to understand something deeper.",
      },
      {
        bg: "pool", sky: "day",
        c: [A(110, 262, "think")],
        p: [["question", 290, 120, 1.4]],
        say: ["How could a swimmer's journey be organized?", "tr", "think"],
        cap: "How could a beginner progress from their first experience in water to becoming a confident swimmer? How could every skill be taught, practised, and evaluated with a clear purpose?",
      },
      {
        bg: "pool", sky: "day",
        c: [A(150, 262, "stand", { L: "board" }), N(300, 262, "point", { flip: true, shirt: "#1d4ed8", neck: "whistle" })],
        p: [["txt", 200, 50, 0.95, "GAME THEORY"]],
        cap: "On July 1, 2026, he joined Game Theory. He entered with experience as a founder and coach, but also with the mindset of a student.",
      },
      {
        bg: "pool", sky: "day",
        c: [A(100, 262, "hold", { L: "board" })],
        p: [["board", 280, 112, 1.2, "STAGE|LEVEL|SKILL", "#166534"]],
        cap: "There, he observed a structured swimming-development system with different stages and levels. A swimmer could progress through a planned pathway instead of learning random skills without direction.",
      },
    ],
  },
  {
    ch: 14,
    panels: [
      {
        bg: "room", col: "#e0e7ff",
        c: [A(180, 268, "think")],
        p: [["bulb", 270, 105, 1.5]],
        say: ["Why shouldn't Aqua Slash have its own path?", "tr", "think"],
        cap: "And that experience made him think: If I am building Aqua Slash, why should I simply follow someone else's path?",
      },
      {
        bg: "burst", col: "#fde68a",
        p: [["txt", 200, 82, 1, "FEAR TO CONFIDENCE", "#ef4444"], ["txt", 200, 150, 1, "BEGINNER TO SWIMMER", "#0ea5e9"], ["txt", 200, 218, 1, "SWIMMER TO COACH", "#16a34a"]],
        cap: "He already had a story. Years of experiences around water. He had seen the journey from fear to confidence, from beginner to swimmer, and from swimmer to coach.",
      },
      {
        art: "logo",
        cap: "Now he wanted to turn those experiences into a system. Not a copy. Not just another swimming class. Something that belonged to Aqua Slash.",
      },
      {
        art: "stairs",
        cap: "THE BIRTH OF THE AQUA SLASH SYSTEM. He began shaping his own swimming-development architecture. Six stages. Three levels in every stage. Six skills in every level.",
      },
    ],
  },
  {
    ch: 14,
    panels: [
      {
        img: "stages",
        cap: "The six stages became: GLASS, POOL, POND, LAKE, RIVER, OCEAN. Each stage would represent another part of the swimmer's journey.",
      },
      { art: "glass", cap: "STAGE 1 — GLASS. Where every journey begins: the first Drop of confidence." },
      { art: "pool", cap: "STAGE 2 — POOL. The swimmer steps into a whole new world of water." },
      { art: "pond", cap: "STAGE 3 — POND. Skills grow, and the water gets wider." },
    ],
  },
  {
    ch: 14,
    panels: [
      { art: "lake", cap: "STAGE 4 — LAKE. Calm, confident movement across open water." },
      { art: "river", cap: "STAGE 5 — RIVER. The current is stronger — and so is the swimmer." },
      { art: "ocean", cap: "STAGE 6 — OCEAN. The final stage of progress." },
      {
        art: "drop",
        cap: "Each stage would contain three levels. Each level would contain six skills. At Aqua Slash, every skill would be called a DROP.",
      },
    ],
  },
  {
    ch: 14,
    panels: [
      {
        art: "formula",
        cap: "6 STAGES × 3 LEVELS × 6 DROPS = 108 DROPS. Every level would move the swimmer forward. Every Drop would be a skill to learn, practise, and master.",
      },
      {
        bg: "room", col: "#cffafe",
        c: [A(120, 268, "point")],
        p: [["board", 275, 105, 1.2, "THE IDENTITY|OF AQUA|SLASH"]],
        cap: "But he wanted something more than ordinary skill names. He wanted the entire system to carry the identity of Aqua Slash.",
      },
      {
        art: "tagline",
        cap: "ONE DROP AT A TIME. This became more than a slogan. It became the philosophy behind Aqua Slash.",
      },
      {
        bg: "pool", sky: "warm",
        c: [T(200, 189, "cheer", SW)],
        p: [["podium", 200, 270, 1.3], ["sparkle", 90, 130, 1.4], ["sparkle", 320, 120, 1.2]],
        cap: "One skill at a time. One level at a time. One stage at a time.",
      },
    ],
  },
  {
    ch: 14,
    panels: [
      {
        bg: "pool", sky: "day",
        c: [A(110, 262, "point", { L: "kick" }), FS(260, 170, "swim", "#16a34a")],
        cap: "Progress doesn't happen all at once. It happens through small skills, repeated practice, improvement, and achievement.",
      },
      {
        bg: "pool", sky: "warm",
        c: [FS(200, 262, "cheer", "#16a34a")],
        p: [["drop", 120, 50, 2.2], ["drop", 280, 90, 1.8], ["ripple", 120, 172, 1], ["ripple", 280, 198, 1.2]],
        cap: "Every Drop matters. Every small achievement becomes part of a bigger transformation. And suddenly, the name Aqua Slash had a deeper meaning.",
      },
      {
        bg: "flood", sky: "gray",
        c: [K(230, 208, "swim", { s: 0.85 })],
        p: [["^w", 0, 216, 1, "", MUD]],
        cap: "The boy who once entered the water without understanding its power had spent years learning about it. He had experienced fear.",
      },
      {
        bg: "pool", sky: "day",
        c: [T(190, 262, "cheer", { ...SW, neck: "medal" })],
        p: [["trophy", 310, 190, 1.4]],
        cap: "He had discovered swimming. He had competed.",
      },
    ],
  },
  {
    ch: 14,
    panels: [
      {
        bg: "pool", sky: "day",
        c: [T(120, 262, "point", { ...GUARD, L: "board" }), FS(250, 168, "swim", "#16a34a")],
        cap: "He had coached. He had worked behind the pool.",
      },
      {
        bg: "community", sky: "day",
        c: [A(200, 262, "stand", { ex: "grit" })],
        p: [["sweat", 250, 190, 1.2]],
        cap: "He had built a startup. He had faced setbacks. And he had continued learning.",
      },
      {
        bg: "community", sky: "dawn",
        c: [A(110, 262, "point"), FS(250, 262, "cheer", "#16a34a"), FS(320, 262, "wave", "#f59e0b")],
        say: ["Your journey starts with one Drop.", "tr", "say"],
        cap: "Now he wanted to create a system that could guide someone else's journey.",
      },
      {
        art: "year", col: "#0ea5e9", txt: "NOT THE END", sub: "THE FINAL CHAPTER — BUT",
        cap: "THE FINAL CHAPTER — BUT NOT THE END.",
      },
    ],
  },
  {
    ch: 14,
    panels: [
      {
        bg: "floodhigh", sky: "storm",
        c: [K(150, 258, "grab", { L: "lunch", ex: "o" })],
        p: [["hand", 161, 182], ["^w", 0, 240, 1, "", MUD]],
        cap: "Think about where it all began. A little boy walking home from school. A river with a powerful current. A hand reaching out of the water.",
      },
      {
        bg: "well", sky: "dusk", dim: 0.12,
        c: [K(90, 268, "stand", { ex: "sad" })],
        cap: "A village without a swimming academy. A boy who kept returning to the water. A school tragedy that changed the way he saw swimming.",
      },
      {
        bg: "pool", sky: "dawn",
        c: [T(190, 262, "cheer", { ...SW, neck: "medal" })],
        p: [["virus", 320, 90, 1.6]],
        cap: "A college swimming pool that opened an unexpected door. A national-level journey that began when he was trying to escape tuition. A pandemic that interrupted his dreams.",
      },
      {
        bg: "community", sky: "day",
        c: [A(190, 262, "cheer")],
        p: [["sparkle", 100, 120, 1.4], ["sparkle", 310, 110, 1.4]],
        cap: "A lifeguard. A junior coach. A pool operator. A swimming coach. Then a founder. Two years of building Aqua Slash. Seven communities. And finally, a decision to create something of his own.",
      },
    ],
  },
  {
    ch: 14,
    panels: [
      {
        bg: "lake", sky: "dusk",
        c: [A(200, 278, "sit")],
        cap: "He didn't have every answer. He didn't have everything figured out.",
      },
      {
        bg: "river", sky: "dawn",
        c: [A(40, 242, "walk"), K(88, 244, "walk", { bag: true })],
        p: [["sparkle", 260, 110, 1.5], ["sparkle", 330, 160, 1]],
        cap: "But he had something that had stayed with him since childhood: a connection with water and a reason to keep moving forward.",
      },
      {
        art: "stairs",
        cap: "Aqua Slash was no longer just about teaching people to swim. It was about creating a journey — from the first Drop of confidence to the final stage of progress.",
      },
      {
        art: "summary",
        cap: "SIX STAGES. EIGHTEEN LEVELS. ONE HUNDRED AND EIGHT DROPS. ONE PHILOSOPHY. AQUA SLASH — CUT THROUGH FEAR OF WATER. ONE DROP AT A TIME.",
      },
    ],
  },
  {
    ch: 14,
    sub: "The End of the Beginning",
    panels: [
      { img: "handwater", cap: "The boy's story began with a hand in the water." },
      { img: "finale", cap: "Now, he was building a world of his own, one Drop at a time." },
      { art: "logo", cap: "AQUA SLASH. Cut through fear of water. One Drop at a Time." },
      { art: "end", cap: "Thank you for following the journey. 🌊" },
    ],
  },
];

void F;
void M;
