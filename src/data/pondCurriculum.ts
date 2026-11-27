// ───────────────────────────────────────────────────────────
// Aqua Slash — Level 3: Pond Stage Curriculum
// IMPORTANT: Pond is a curriculum stage name only.
// All swimming lessons and skills are taught and practiced in a swimming pool.
// 3 Pond Levels · 6 Drops per level · 18 Drops in total.
// ───────────────────────────────────────────────────────────

export type PondLevelId = 1 | 2 | 3;

export interface Mistake {
  mistake: string;
  fix: string;
}

export interface PondLevel {
  id: PondLevelId;
  name: string;
  emoji: string;
  purpose: string;
  progression: string[];
  milestoneIcon: string;
  milestoneLabel: string;
  gradient: string;
  accent: string;
}

export interface PondSkill {
  id: number; // 1–18 (Drop number)
  level: PondLevelId;
  name: string;
  short: string;
  icon: string;
  focus: string;
  why: string;
  safety: string[];
  who: string;
  need: string[];
  questions: string[];
  steps: string[];
  practice: { task: string; reps: string; rest: string; rounds: number };
  selfCheck: string[];
  mistakes: Mistake[];
  cues: string[];
  ready: string[];
  animText: string;
}

export const POND_LEVELS: PondLevel[] = [
  {
    id: 1,
    name: 'Advanced Freestyle & Backstroke',
    emoji: '🏊',
    purpose: 'Refine high-efficiency catch, bilateral breathing rhythm, and body rotation for freestyle and backstroke in the swimming pool.',
    progression: ['High-Elbow Catch', 'Body Rotation', 'Bilateral Breathing', 'Backstroke Pinky Entry', 'Hip-Driven Roll', '50m Advanced Medley'],
    milestoneIcon: '⚡',
    milestoneLabel: 'Advanced Strokes',
    gradient: 'from-emerald-400 via-teal-500 to-cyan-600',
    accent: '#0d9488',
  },
  {
    id: 2,
    name: 'Advanced Strokes + Breaststroke Kick',
    emoji: '🦵',
    purpose: 'Maintain advanced freestyle and backstroke stamina while introducing technical breaststroke whip kick mechanics and glide timing.',
    progression: ['Freestyle Distance Catch', 'Backstroke Streamline', 'Wall Whip Kick', 'Board Whip Kick', 'Hands-Free Kick', '50m Mixed Stroke Circuit'],
    milestoneIcon: '🦵',
    milestoneLabel: 'Breaststroke Kick',
    gradient: 'from-teal-400 via-cyan-600 to-blue-600',
    accent: '#0891b2',
  },
  {
    id: 3,
    name: 'Advanced Strokes + Breaststroke Basics + Butterfly Kick',
    emoji: '🌿',
    purpose: 'Continue advanced stroke endurance while introducing foundational breaststroke arms and fluid butterfly dolphin kick undulation.',
    progression: ['75m Bilateral Freestyle', '50m Backstroke Tempo', 'Breaststroke Arm Sweep', 'Basic Breaststroke Timing', 'Dolphin Kick Mechanics', 'Dolphin Streamline Graduation'],
    milestoneIcon: '🌿',
    milestoneLabel: 'Pond Graduation',
    gradient: 'from-cyan-500 via-teal-600 to-emerald-700',
    accent: '#059669',
  },
];

const POOL_SAFETY = [
  'All Pond skills are taught and practiced strictly in a regulated swimming pool under qualified instructor supervision.',
  'Students must never practice swimming skills alone, and never in unmonitored natural open water or unsupervised bodies of water.',
  'Always stay within designated pool depth zones appropriate for your swimming level.',
];

export const POND_SKILLS: PondSkill[] = [
  // ═══════════════════════════════════════════════════════════════
  // POND LEVEL 1 — ADVANCED FREESTYLE & BACKSTROKE (DROPS 1–6)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 1,
    level: 1,
    name: 'High-Elbow Freestyle Catch & Pull Efficiency',
    short: 'Anchor your forearm with a high elbow under water to pull maximum water with every stroke.',
    icon: '⚡',
    focus: 'Underwater Catch Mechanics',
    why: 'Advanced freestyle moves away from straight-arm slipping. Setting a high elbow turns your forearm and palm into one large paddle that propels you forward effortlessly.',
    safety: [
      ...POOL_SAFETY,
      'Maintain loose, relaxed wrists during recovery to avoid shoulder strain.',
      'Stop and rest if your shoulder feels pinched or fatigued.',
    ],
    who: 'Swimmers who can swim basic freestyle across the pool and are ready to increase speed and power with less effort.',
    need: ['Swimming pool (chest-deep or deep lane)', 'Swimsuit & goggles', 'Pull buoy (optional drill tool)'],
    questions: [
      'Do you keep your elbow higher than your wrist during the catch phase?',
      'Does your hand enter fingertips first without slapping the water?',
    ],
    steps: [
      'Push off into a tight pool streamline with head neutral.',
      'Begin arm extension forward until shoulder reaches full extension.',
      'Bend the elbow while keeping it high, pointing fingertips downward to catch the water.',
      'Accelerate forearm and palm backward past the ribcage to the hip.',
      'Recover the arm forward smoothly with elbow relaxed and high.',
    ],
    practice: {
      task: 'Swim 4 x 15m pool lengths focusing entirely on setting the high elbow catch before pulling.',
      reps: '4 lengths (60m total)',
      rest: '25 seconds after each length',
      rounds: 3,
    },
    selfCheck: [
      'My elbow stays higher than my hand throughout the initial pull.',
      'I feel strong water pressure against my entire forearm and palm.',
      'My head remains steady without bobbing up and down.',
    ],
    mistakes: [
      {
        mistake: 'Dropping the elbow so the hand leads the pull without catching water.',
        fix: 'Keep the elbow near the surface while tipping the forearm down to catch water like reaching over a barrel.',
      },
      {
        mistake: 'Pulling with a completely straight, stiff arm.',
        fix: 'Bend elbow approximately 90–110 degrees as hand sweeps under the chest.',
      },
    ],
    cues: ['Fingertips down, elbow high', 'Reach over the barrel', 'Accelerate past the hip'],
    ready: ['Comfortable swimming 15m freestyle in the pool', 'Able to maintain continuous flutter kick'],
    animText: 'Watch the high-elbow anchor: the forearm tips down while the elbow stays elevated, pulling clean water backward.',
  },
  {
    id: 2,
    level: 1,
    name: 'Long-Axis Freestyle Body Rotation & Streamline',
    short: 'Rotate your hips and shoulders 45° along your body axis while keeping your head rock steady.',
    icon: '🔄',
    focus: 'Long-Axis Body Rotation',
    why: 'Swimming flat on your stomach creates huge drag. Rotating side-to-side cuts through the pool like a boat hull and engages core muscles for stronger pulls.',
    safety: [
      ...POOL_SAFETY,
      'Rotate your body as a single unit from hips through shoulders — never twist only at the neck.',
    ],
    who: 'Swimmers whose hips wiggle side-to-side or who swim completely flat on the water surface.',
    need: ['Swimming pool lane', 'Swim goggles'],
    questions: [
      'Are your hips rotating in sync with your shoulders?',
      'Is your nose pointed directly toward the pool floor when not breathing?',
    ],
    steps: [
      'Push off pool wall into streamline glide on stomach.',
      'Rotate hips and shoulders approximately 40–45 degrees onto your right side.',
      'Take a pull with the right arm while switching rotation smoothly onto your left side.',
      'Keep head completely locked looking straight at the black line on the pool floor.',
      'Maintain an unbroken flutter kick that naturally rotates with the hips.',
    ],
    practice: {
      task: 'Practice 6-kick switch drill: kick on right side for 6 beats, take 1 stroke, kick on left side for 6 beats.',
      reps: '4 x 20m pool drill lengths',
      rest: '20 seconds between lengths',
      rounds: 3,
    },
    selfCheck: [
      'My shoulders and hips rotate together like a rolling log.',
      'My head does not wiggle or turn side-to-side during the body roll.',
      'I glide further on each arm stroke.',
    ],
    mistakes: [
      {
        mistake: 'Rotating only the shoulders while hips remain completely flat.',
        fix: 'Drive the rotation from your core and hips — hips lead the rotation, shoulders follow.',
      },
      {
        mistake: 'Over-rotating past 45 degrees onto the back.',
        fix: 'Limit body angle to a crisp 40–45 degrees so you stay streamlined.',
      },
    ],
    cues: ['Roll like a torpedo', 'Quiet head, rotating hips', 'Slice through the water'],
    ready: ['Can hold a balanced horizontal body position in the pool'],
    animText: 'Observe the 45-degree body roll: hips and shoulders turn smoothly together while the head stays anchored center.',
  },
  {
    id: 3,
    level: 1,
    name: 'Bilateral Freestyle Breathing Rhythm (Every 3 Strokes)',
    short: 'Breathe smoothly on alternating sides every 3 arm strokes without lifting your chin.',
    icon: '🔁',
    focus: 'Bilateral Breathing & Symmetry',
    why: 'Breathing to only one side causes muscle imbalances and zig-zag swimming. Bilateral breathing develops balanced stroke symmetry and lets you monitor your surroundings in any pool lane.',
    safety: [
      ...POOL_SAFETY,
      'Never hold your breath under water; exhale steadily through nose or mouth so you are ready to inhale immediately upon turning.',
    ],
    who: 'Swimmers who can only breathe to their dominant side and want full stroke balance.',
    need: ['Swimming pool lane', 'Swim goggles'],
    questions: [
      'Can you turn your head to both left and right sides comfortably?',
      'Does one goggle lens stay in the water while breathing?',
    ],
    steps: [
      'Push off pool wall and establish regular freestyle cadence.',
      'Stroke 1 (Right): Exhale small steady bubbles under water.',
      'Stroke 2 (Left): Continue steady exhalation.',
      'Stroke 3 (Right): Turn head smoothly sideways into the bow wave created by the head.',
      'Inhale quickly through mouth with one goggle in the water, then rotate face back down.',
      'Count 1, 2, 3 and breathe on the left side next.',
    ],
    practice: {
      task: 'Swim 6 lengths of the pool with strict 3-stroke bilateral breathing throughout.',
      reps: '6 x 20m lengths',
      rest: '30 seconds rest between lengths',
      rounds: 3,
    },
    selfCheck: [
      'I breathe comfortably to both my left and right sides.',
      'I do not lift my chin forward; my head turns in the water pocket.',
      'My kick does not stop or cross over when taking a breath.',
    ],
    mistakes: [
      {
        mistake: 'Lifting the entire head forward out of the water to breathe.',
        fix: 'Keep your temple resting against the water surface like a pillow; turn just enough for mouth to clear.',
      },
      {
        mistake: 'Forgetting to exhale under water, causing frantic gasping.',
        fix: 'Blow continuous bubbles under water so lungs are empty when your mouth turns out.',
      },
    ],
    cues: ['1-2-3 breathe', 'One goggle in the water', 'Temple on the pillow'],
    ready: ['Completed Drop 2 Body Rotation', 'Comfortable side breathing to at least one side'],
    animText: 'Notice the three-stroke count: stroke right, stroke left, stroke right and breathe left, keeping one goggle submerged.',
  },
  {
    id: 4,
    level: 1,
    name: 'Backstroke High-Arm Recovery & Pinky-First Entry',
    short: 'Recover straight arms past your ear and enter cleanly into the pool pinky-finger first.',
    icon: '🌊',
    focus: 'Backstroke Arm Mechanics',
    why: 'A clean pinky-first entry sets up the underwater catch instantly without air bubbles or splashing, reducing drag and increasing backward propulsive force.',
    safety: [
      ...POOL_SAFETY,
      'Keep eyes looking straight up at the pool ceiling flags/sky to maintain straight lane alignment.',
      'Count your strokes from the backstroke flags to the wall so you never hit your head.',
    ],
    who: 'Swimmers who can float on their back and want clean, powerful backstroke propulsion.',
    need: ['Swimming pool lane with overhead backstroke flags', 'Swim goggles'],
    questions: [
      'Does your thumb exit the water first at your hip?',
      'Does your hand rotate in the air so the little finger enters first?',
    ],
    steps: [
      'Push off backstroke start, gliding on back with chin up and belly high.',
      'Thumb leaves the water first near the hip with straight, relaxed arm.',
      'Arm sweeps straight up past shoulder level perpendicular to water.',
      'Rotate palm outward in mid-air so the pinky finger faces down.',
      'Enter the water cleanly pinky-first directly in line with your shoulder.',
    ],
    practice: {
      task: 'Swim 4 x 25m backstroke lengths focusing on thumb-out, pinky-in rhythm.',
      reps: '4 x 25m lengths (100m total)',
      rest: '25 seconds rest after each 25m',
      rounds: 3,
    },
    selfCheck: [
      'My thumb exits first at the hip, pinky enters first above my head.',
      'My arm stays straight on recovery without bending or splashing wildly.',
      'My ears remain submerged in the water.',
    ],
    mistakes: [
      {
        mistake: 'Entering thumb-first or flat palm, causing slapping and poor catch.',
        fix: 'Rotate wrist outward at top of recovery so pinky cuts into the water smoothly.',
      },
      {
        mistake: 'Crossing hands over behind the head past the body centerline.',
        fix: 'Enter strictly in line with your shoulder width (at roughly 11 o\'clock and 1 o\'clock).',
      },
    ],
    cues: ['Thumb out, pinky in', 'Reach past the ear', 'Straight arm, clean slice'],
    ready: ['Basic backstroke from Pool Level 3', 'Comfortable back float in deep pool water'],
    animText: 'Watch the backstroke hand rotation: thumb leads out at the hip, hand twists in the air, pinky cuts cleanly into the water.',
  },
  {
    id: 5,
    level: 1,
    name: 'Backstroke Hip-Driven Body Roll & Continuous Flutter',
    short: 'Roll your shoulders and hips side-to-side on your back while keeping your head still and kick boiling.',
    icon: '🎯',
    focus: 'Backstroke Body Roll & Kick Rhythm',
    why: 'Just like freestyle, backstroke requires continuous body rotation on the spine. Rotating allows the arm to reach deeper for a powerful underwater push without stressing the shoulder.',
    safety: [
      ...POOL_SAFETY,
      'Keep chin tucked slightly so water does not wash over your nose or mouth.',
    ],
    who: 'Swimmers whose backstroke feels heavy in the water or whose knees break the surface.',
    need: ['Swimming pool lane', 'Swim goggles'],
    questions: [
      'Is your nose pointing steadily straight up while your shoulders dip left and right?',
      'Are your toes making small boiling ripples at the surface?',
    ],
    steps: [
      'Push off pool wall into supine streamline glide.',
      'Roll right shoulder down into water as right arm catches beneath the surface.',
      'Left shoulder rises up out of the water clear of surface drag.',
      'Maintain continuous 6-beat flutter kick from the hips with toes pointed.',
      'Switch rotation crisply as left arm begins catch and right recovers.',
    ],
    practice: {
      task: 'Single-arm backstroke drill: swim 25m with left arm only (right arm at side), switch to right arm for 25m.',
      reps: '4 x 25m drill lengths',
      rest: '25 seconds rest',
      rounds: 3,
    },
    selfCheck: [
      'My shoulder pops up out of the water during recovery.',
      'My head remains completely stationary with eyes fixed on ceiling.',
      'My kick stays tight with toes pointed, bubbling at the surface.',
    ],
    mistakes: [
      {
        mistake: 'Head rolls side to side with the shoulders, causing disorientation.',
        fix: 'Imagine balancing a small cup of water on your forehead that cannot spill.',
      },
      {
        mistake: 'Bending knees excessively like riding a bicycle on back.',
        fix: 'Kick from your hips with long legs and flexible, floppy ankles.',
      },
    ],
    cues: ['Cup on the forehead', 'Shoulder to chin', 'Boil the surface with your toes'],
    ready: ['Drop 4 Backstroke Arm Mechanics mastered', 'Strong continuous back flutter kick'],
    animText: 'Notice how the swimmer’s shoulders rotate 40 degrees while the head stays perfectly level, creating effortless backstroke propulsion.',
  },
  {
    id: 6,
    level: 1,
    name: 'Continuous 50m Advanced Freestyle & Backstroke Medley',
    short: 'Swim a continuous 50m pool medley: 25m advanced freestyle transitioned into 25m advanced backstroke.',
    icon: '🏆',
    focus: 'Endurance & Stroke Transition Milestone',
    why: 'Completing Pond Level 1 requires proving stamina and technical consistency over 50 meters in the pool across both primary competitive strokes.',
    safety: [
      ...POOL_SAFETY,
      'Maintain calm, regulated breathing rhythm; do not sprint the first 15 meters and exhaust yourself.',
    ],
    who: 'Swimmers ready to graduate from Pond Level 1 and unlock breaststroke kick development in Pond Level 2.',
    need: ['25m swimming pool lane', 'Swim goggles'],
    questions: [
      'Can you complete 50m without stopping or touching the pool floor?',
      'Do you maintain high-elbow freestyle and clean pinky-entry backstroke throughout?',
    ],
    steps: [
      'Push off in streamline and swim 25m advanced freestyle with bilateral 3-stroke breathing.',
      'Touch pool wall firmly with hand, perform open pivot turn, and push off on back in streamline.',
      'Break out into continuous advanced backstroke with pinky-first entry and hip rotation.',
      'Finish the full 25m backstroke to complete the 50m distance.',
    ],
    practice: {
      task: 'Complete 3 sets of 50m Medley (25m Freestyle + 25m Backstroke) with strict technique.',
      reps: '3 x 50m rounds',
      rest: '45 seconds rest between rounds',
      rounds: 3,
    },
    selfCheck: [
      'I completed the continuous 50m without stopping or holding lane ropes.',
      'My freestyle utilized bilateral breathing and high-elbow catches.',
      'My backstroke had smooth shoulder roll and strong continuous flutter.',
    ],
    mistakes: [
      {
        mistake: 'Slowing down or stopping during the turn transition at 25m.',
        fix: 'Touch the wall, tuck knees quickly, push off hard into underwater glide before breaking out into backstroke.',
      },
    ],
    cues: ['Pace your energy', 'Smooth transition at the wall', 'Finish strong on your back'],
    ready: ['Completed Drops 1 through 5 of Pond Level 1'],
    animText: 'Graduation Milestone: Swimmer completes 25m advanced freestyle, touches the pool wall, pivots into supine glide, and completes 25m backstroke.',
  },

  // ═══════════════════════════════════════════════════════════════
  // POND LEVEL 2 — ADVANCED STROKES + BREASTSTROKE KICK (DROPS 7–12)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 7,
    level: 2,
    name: 'Advanced 50m Freestyle Distance & Stroke Count Efficiency',
    short: 'Swim 50m freestyle counting your strokes per length, focusing on maximum glide and distance per pull.',
    icon: '📊',
    focus: 'Stroke Efficiency & Distance Per Stroke (DPS)',
    why: 'Advanced swimmers do not just swim fast; they swim with low stroke counts by maximizing propulsion and minimizing drag through the water.',
    safety: [
      ...POOL_SAFETY,
      'Maintain regular bilateral breathing so oxygen intake remains steady over 50 meters.',
    ],
    who: 'Swimmers in Pond Level 2 refining advanced freestyle stamina while preparing for multi-stroke training.',
    need: ['25m swimming pool lane', 'Swim goggles'],
    questions: [
      'Can you reduce your stroke count by 2 strokes per 25m length?',
      'Do you hold your streamline glide for 3 meters off every wall push?',
    ],
    steps: [
      'Push off with strong underwater glide past the 5m pool marker.',
      'Establish a powerful, elongated freestyle stroke with full extension.',
      'Count strokes on the first 25m length.',
      'Turn, push off hard, and aim to match or beat that stroke count on the second 25m.',
    ],
    practice: {
      task: 'Swim 4 x 50m freestyle aiming for consistent stroke counts and effortless rhythm.',
      reps: '4 x 50m (200m total)',
      rest: '30 seconds rest between 50m sets',
      rounds: 3,
    },
    selfCheck: [
      'My stroke count was consistent across both 25m lengths.',
      'My body stayed streamlined without hips sinking at the 40m mark.',
    ],
    mistakes: [
      {
        mistake: 'Shortening stroke recovery when getting tired.',
        fix: 'Keep reaching forward fully before starting the high-elbow catch.',
      },
    ],
    cues: ['Reach and glide', 'Count every stroke', 'Hold your distance'],
    ready: ['Completed Pond Level 1 graduation (Drop 6)'],
    animText: 'Observe the long, patient glide: each freestyle pull is stretched to maximize distance traveled per stroke.',
  },
  {
    id: 8,
    level: 2,
    name: 'Advanced Backstroke Deep Water Wall Push-Off & Glide',
    short: 'Execute a powerful submerged backstroke start from the pool wall with streamline breakout.',
    icon: '🚀',
    focus: 'Backstroke Wall Starts & Underwater Breakout',
    why: 'A crisp underwater push-off carries high speed into backstroke swimming, positioning your body high on the water surface right from the start.',
    safety: [
      ...POOL_SAFETY,
      'Ensure head remains back with chin up during push-off so water does not flood nose.',
    ],
    who: 'Swimmers developing competition-standard wall starts in the pool.',
    need: ['Pool wall with gutter or handrail', 'Swim goggles'],
    questions: [
      'Are your feet placed flat against the pool wall with knees bent at 90 degrees?',
      'Are your arms locked tight behind your ears in streamline before your feet push?',
    ],
    steps: [
      'Place both hands on pool gutter, feet flat against the wall beneath the surface.',
      'Tuck body in tight and drop head back between extended arms into streamline.',
      'Push hard off the wall, launching body horizontally backward under water.',
      'Hold tight streamline for 3–5 meters before breaking the surface with flutter kick.',
      'Transition smoothly into full backstroke arm rotation.',
    ],
    practice: {
      task: 'Practice 6 pool wall push-offs, holding streamline glide for 5 meters each.',
      reps: '6 push-off glides',
      rest: '20 seconds rest',
      rounds: 3,
    },
    selfCheck: [
      'My hands are locked tightly together in streamline with elbows straight.',
      'I glide straight backward horizontally without surfacing too early.',
    ],
    mistakes: [
      {
        mistake: 'Pushing off too deep or too shallow and scraping back on the surface.',
        fix: 'Aim push-off straight backward about 30cm below the water surface.',
      },
    ],
    cues: ['Lock your ears', 'Explode off the wall', 'Glide like an arrow'],
    ready: ['Pond 1 Backstroke mastery'],
    animText: 'Swimmer grips pool edge, extends into tight back streamline, drives off the wall, and glides smoothly into backstroke.',
  },
  {
    id: 9,
    level: 2,
    name: 'Pool-Wall Breaststroke Whip Kick Mechanics',
    short: 'Master the circular whip kick: bend knees, flex ankles outward, and whip feet around and together.',
    icon: '🦵',
    focus: 'Breaststroke Whip Kick Foundation',
    why: 'The breaststroke kick is unique: propulsion comes from the insides of your feet and lower legs whipping backward in a circular arc. Mastering foot turn-out (dorsiflexion) is the key to breaststroke power.',
    safety: [
      ...POOL_SAFETY,
      'Never force knees too wide — keep knees approximately shoulder-width apart to protect knee joints.',
      'Flex ankles with toes pointing outward before kicking.',
    ],
    who: 'Swimmers beginning their breaststroke journey who need clean, knee-safe kick mechanics.',
    need: ['Swimming pool edge / gutter', 'Swimsuit & goggles'],
    questions: [
      'Do your heels pull up toward your buttocks while knees stay shoulder-width?',
      'Are your feet flexed like duck feet (toes pointing outward) before you kick?',
    ],
    steps: [
      'Hold pool edge with hands, body floating horizontally on stomach.',
      'Recovery: Draw heels gently up toward buttocks, keeping knees inside shoulder width.',
      'Catch: Flex ankles sharply outward with toes pointed to the side pool walls (duck feet).',
      'Kick / Whip: Accelerate feet in a backward circular arc, snapping heels together.',
      'Glide: Hold legs straight, ankles extended, touching toes together for 2 seconds.',
    ],
    practice: {
      task: 'Perform 3 sets of 15 wall-supported breaststroke kicks focusing on heel-snap and 2-second hold.',
      reps: '3 sets of 15 kicks',
      rest: '30 seconds rest between sets',
      rounds: 3,
    },
    selfCheck: [
      'My feet flex outward before the kick begins.',
      'I feel water resistance against the soles and insides of my feet.',
      'My legs finish completely straight with toes pointed together.',
    ],
    mistakes: [
      {
        mistake: 'Kicking like a frog with knees spread excessively wide.',
        fix: 'Keep knees inside shoulder width; bring your heels to your hips, not your knees to your chest.',
      },
      {
        mistake: 'Scissor kick where one foot kicks sideways while the other flutters.',
        fix: 'Keep kick strictly symmetrical — both feet must circle outward and snap inward simultaneously.',
      },
    ],
    cues: ['Up, out, whip together', 'Duck feet on the catch', 'Snap and squeeze'],
    ready: ['Comfortable holding pool edge on stomach with face in water'],
    animText: 'Observe the breaststroke whip kick: heels draw up, ankles flex outward into duck feet, and legs whip backward snapping together.',
  },
  {
    id: 10,
    level: 2,
    name: 'Supported Breaststroke Kick with Board (15m)',
    short: 'Kick 15m across the pool holding a kickboard, timing each whip kick with a 2-second streamlined glide.',
    icon: '🏄',
    focus: 'Kickboard Breaststroke Kick & Glide Timing',
    why: 'Using a kickboard lets you focus 100% on leg propulsion and feel how much distance you gain from each whip kick glide.',
    safety: [
      ...POOL_SAFETY,
      'Hold kickboard by the top edge with arms relaxed and elbows soft to avoid straining your neck.',
    ],
    who: 'Swimmers moving their breaststroke wall kick into open pool motion.',
    need: ['Standard swimming kickboard', 'Swimming pool lane', 'Swim goggles'],
    questions: [
      'Does your kick drive you forward with noticeable speed?',
      'Do you pause for a count of 2 between kicks to glide?',
    ],
    steps: [
      'Hold top of kickboard with hands, push off pool wall into horizontal prone glide.',
      'Inhale with face above water or exhale with face dipping into water.',
      'Draw heels up toward buttocks with knees shoulder-width.',
      'Turn toes out (duck feet) and whip legs backward, snapping heels together.',
      'Squeeze legs together and glide forward for a full count of "1-Mississippi, 2-Mississippi".',
      'Repeat rhythmically across 15 meters.',
    ],
    practice: {
      task: 'Kick 4 x 15m lengths with kickboard, achieving at least 2 meters of forward glide per kick.',
      reps: '4 x 15m pool lengths',
      rest: '30 seconds rest',
      rounds: 3,
    },
    selfCheck: [
      'Each kick produces strong forward propulsion.',
      'I do not rush into the next kick; I hold the glide position.',
      'My kick is symmetrical on left and right sides.',
    ],
    mistakes: [
      {
        mistake: 'Continuous rapid kicking without pausing for the glide.',
        fix: 'Breaststroke is a glide stroke — kick, snap, then glide for 2 full seconds.',
      },
    ],
    cues: ['Kick, snap, GLIDE', 'Feel the forward surge', 'Patience on the glide'],
    ready: ['Mastered Drop 9 Wall Breaststroke Kick'],
    animText: 'Watch the kickboard drill: swimmer draws heels up, flexes feet outward, snaps legs together, and glides forward 2 seconds.',
  },
  {
    id: 11,
    level: 2,
    name: 'Hands-at-Side Breaststroke Kick on Front & Back',
    short: 'Kick breaststroke without a board: arms streamlined or held at thighs, riding the wave of your kick.',
    icon: '✨',
    focus: 'Boardless Breaststroke Kick Balance',
    why: 'Removing the kickboard forces your core and hips to stabilize your body line, preparing you for full breaststroke coordination.',
    safety: [
      ...POOL_SAFETY,
      'Keep chin near the water surface when breathing on stomach; do not crane neck backward.',
    ],
    who: 'Swimmers who can kick with a board and are ready to eliminate board dependency.',
    need: ['Swimming pool lane', 'Swim goggles'],
    questions: [
      'Can you kick breaststroke on your back with knees staying under water?',
      'Do your hips stay high near the pool surface after each kick?',
    ],
    steps: [
      'Part A (Front): Push off on stomach with arms extended in streamline or at sides.',
      'Execute whip kick, breathe by lifting chin forward gently, snap heels and glide.',
      'Part B (Back): Roll onto back, hands resting at thighs, kick breaststroke with knees submerged.',
      'Snap heels together on back and feel your hips rise to the surface.',
    ],
    practice: {
      task: 'Alternate 2 x 15m breaststroke kick on stomach + 2 x 15m on back with hands at sides.',
      reps: '4 x 15m drill lengths',
      rest: '25 seconds rest',
      rounds: 3,
    },
    selfCheck: [
      'On my back, my knees do not break the water surface when bending.',
      'On my stomach, my hips lift up during the glide.',
    ],
    mistakes: [
      {
        mistake: 'Knees pulling up out of the water like sitting in a chair on back.',
        fix: 'Keep knees submerged below the surface; drop heels down and back under water.',
      },
    ],
    cues: ['Knees under water', 'Hips high on the glide', 'Snap and squeeze'],
    ready: ['Drop 10 Kickboard Breaststroke Kick completed'],
    animText: 'Swimmer kicks breaststroke without a board: hands held at thighs on stomach and back, demonstrating pure leg propulsion.',
  },
  {
    id: 12,
    level: 2,
    name: 'Combined Stroke Circuit: 25m Freestyle + 25m Breaststroke Kick',
    short: 'Complete a continuous 50m circuit: 25m advanced freestyle transitioned into 25m breaststroke kick.',
    icon: '🏅',
    focus: 'Pond Level 2 Milestone & Endurance',
    why: 'Proves you can integrate newly learned breaststroke kick propulsion alongside your continuous advanced freestyle swimming.',
    safety: [
      ...POOL_SAFETY,
      'Keep steady breath pacing throughout both lengths.',
    ],
    who: 'Swimmers ready to graduate from Pond Level 2 and unlock basic breaststroke arms and butterfly dolphin kick in Pond Level 3.',
    need: ['25m swimming pool lane', 'Swim goggles'],
    questions: [
      'Can you transition smoothly at the 25m wall without stopping?',
      'Is your breaststroke kick symmetrical and powerful throughout the full 25m?',
    ],
    steps: [
      'Push off and swim 25m advanced freestyle with bilateral breathing and high elbow catch.',
      'Touch pool wall, pivot into streamline push-off, and break out into 25m breaststroke kick with glide.',
      'Finish the full 50m distance with strong technique.',
    ],
    practice: {
      task: 'Complete 3 rounds of the 50m combined circuit (25m Freestyle + 25m Breaststroke Kick).',
      reps: '3 x 50m rounds',
      rest: '45 seconds rest',
      rounds: 3,
    },
    selfCheck: [
      'I completed the 50m circuit without stopping or standing on the pool floor.',
      'My breaststroke kick maintained a strong 2-second glide on every kick.',
    ],
    mistakes: [
      {
        mistake: 'Reverting to flutter kick when tired during the breaststroke kick length.',
        fix: 'Commit to full whip kick circles: heels up, toes out, whip together, glide.',
      },
    ],
    cues: ['Freestyle power into breaststroke glide', 'Control your tempo', 'Pond 2 milestone!'],
    ready: ['Completed Drops 7 through 11 of Pond Level 2'],
    animText: 'Pond Level 2 Graduation: Swimmer powers through 25m advanced freestyle, touches the pool wall, and completes 25m breaststroke kick glide.',
  },

  // ═══════════════════════════════════════════════════════════════
  // POND LEVEL 3 — ADVANCED STROKES + BREASTSTROKE BASICS + BUTTERFLY KICK (DROPS 13–18)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 13,
    level: 3,
    name: 'Advanced Freestyle Bilateral 75m Continuous Endurance',
    short: 'Swim 3 continuous pool lengths (75m) of advanced freestyle maintaining bilateral 3-stroke breathing.',
    icon: '🌊',
    focus: 'Advanced Freestyle Stamina',
    why: 'Demonstrates true aerobic endurance and stroke consistency before adding complex multi-stroke coordination.',
    safety: [
      ...POOL_SAFETY,
      'Pace your speed: start at a smooth 70% effort so you finish with clean technique on length 3.',
    ],
    who: 'Swimmers building competitive or fitness endurance in the pool.',
    need: ['25m swimming pool lane', 'Swim goggles'],
    questions: [
      'Did you maintain bilateral breathing on all 3 lengths?',
      'Did your high elbow catch remain crisp on the final 25m?',
    ],
    steps: [
      'Push off pool wall into streamlined underwater glide.',
      'Length 1 (0–25m): Establish steady 3-stroke bilateral breathing rhythm.',
      'Length 2 (25–50m): Focus on hip body roll and clean arm recovery.',
      'Length 3 (50–75m): Maintain kick tempo and finish with strong high-elbow pulls to the wall.',
    ],
    practice: {
      task: 'Swim 2 sets of 75m continuous freestyle with strict bilateral breathing.',
      reps: '2 x 75m (150m total)',
      rest: '60 seconds rest between sets',
      rounds: 2,
    },
    selfCheck: [
      'I swam 75m without stopping or grabbing the lane rope.',
      'My breathing remained bilateral on both left and right sides.',
    ],
    mistakes: [
      {
        mistake: 'Going out too fast on length 1 and having to stop on length 3.',
        fix: 'Pace yourself like a distance swimmer: smooth and long on length 1, accelerate on length 3.',
      },
    ],
    cues: ['Smooth and steady', '1-2-3 breathe', 'Strong 75m finish'],
    ready: ['Pond Level 2 completion'],
    animText: 'Swimmer glides continuously across 75 meters of pool freestyle, maintaining consistent high elbow pull and bilateral breathing.',
  },
  {
    id: 14,
    level: 3,
    name: 'Advanced Backstroke 50m Speed & Continuous Stroke Tempo',
    short: 'Swim 50m continuous backstroke with rhythmic stroke tempo and strong underwater wall push-offs.',
    icon: '⏱️',
    focus: 'Backstroke Cadence & Distance Control',
    why: 'Builds shoulder conditioning, core rotational power, and confidence swimming long distances on your back.',
    safety: [
      ...POOL_SAFETY,
      'Watch overhead flags for wall approach; count strokes to wall.',
    ],
    who: 'Swimmers refining backstroke speed and endurance.',
    need: ['25m swimming pool lane with overhead flags', 'Swim goggles'],
    questions: [
      'Is your turnover cadence steady like a clock ticking?',
      'Do your hips stay at the surface on the second 25m?',
    ],
    steps: [
      'Execute backstroke wall push-off with underwater streamline.',
      'Break out into rhythmic backstroke with pinky-first entry and shoulder roll.',
      'Keep head locked looking up, chin steady.',
      'Turn at 25m wall and complete return length with strong kick.',
    ],
    practice: {
      task: 'Swim 3 x 50m backstroke maintaining consistent stroke count and rhythm.',
      reps: '3 x 50m (150m total)',
      rest: '40 seconds rest',
      rounds: 3,
    },
    selfCheck: [
      'My turnover remained steady without pauses between arm recoveries.',
      'My kick boiled continuously at the surface.',
    ],
    mistakes: [
      {
        mistake: 'Pausing one arm at the hip while waiting for the other arm to recover.',
        fix: 'Backstroke is a continuous windmill: as one arm enters above, the other arm finishes at the hip.',
      },
    ],
    cues: ['Windmill rhythm', 'Never stop the kick', 'Clean pinky slice'],
    ready: ['Completed Pond 2 Backstroke starts'],
    animText: 'Observe the non-stop windmill tempo of the backstroke arms: continuous propulsion with steady head stability.',
  },
  {
    id: 15,
    level: 3,
    name: 'Breaststroke Basic Arm Pull & Head Lift Timing',
    short: 'Master the heart-shaped breaststroke arm sweep: outsweep, insweep to chin, breathe, shoot forward.',
    icon: '🫀',
    focus: 'Breaststroke Hand & Arm Mechanics',
    why: 'Breaststroke arms do not pull all the way to the hips. Instead, they draw a small heart shape in front of the chest, creating lift to breathe while setting up forward glide.',
    safety: [
      ...POOL_SAFETY,
      'Hands must never pull past your shoulders or waist under water.',
      'Lift chin forward to breathe; do not throw head backward.',
    ],
    who: 'Swimmers in Pond Level 3 ready to add basic breaststroke arm mechanics.',
    need: ['Swimming pool lane (chest-deep or deep)', 'Swim goggles', 'Pull buoy (optional)'],
    questions: [
      'Do your hands stay in front of your chest throughout the pull?',
      'Do your elbows stay high as your hands sweep inward to meet under your chin?',
    ],
    steps: [
      'Begin in horizontal streamline glide with hands together in front.',
      'Outsweep: Turn palms slightly outward and press hands apart just wider than shoulders.',
      'Insweep: Bend elbows and sweep palms inward together under your chin like drawing a heart.',
      'Breathe: Lift chin smoothly as hands sweep together.',
      'Shoot Forward: Extend hands together straight forward into streamline glide.',
    ],
    practice: {
      task: 'Practice 4 x 15m breaststroke arms with pull buoy between legs (no kick) focusing on clean sweep and shoot.',
      reps: '4 x 15m pool lengths',
      rest: '25 seconds rest',
      rounds: 3,
    },
    selfCheck: [
      'My hands never pulled past my chest line.',
      'My hands shot forward together into streamline immediately after breathing.',
    ],
    mistakes: [
      {
        mistake: 'Pulling hands all the way back to the hips like freestyle.',
        fix: 'Stop the pull at your chest! Sweep hands together under your chin and shoot them forward.',
      },
      {
        mistake: 'Dropping elbows below the chest during the pull.',
        fix: 'Keep elbows high in the water as palms sweep inward.',
      },
    ],
    cues: ['Draw the heart', 'Hands to chin', 'Shoot forward into glide'],
    ready: ['Pond Level 2 breaststroke kick mastered'],
    animText: 'Watch the heart-shaped sweep: hands press out, sweep under the chin, and shoot straight forward together into streamline.',
  },
  {
    id: 16,
    level: 3,
    name: 'Basic Breaststroke Coordination (Pull, Breathe, Kick, Glide)',
    short: 'Combine basic arms and legs in the classic breaststroke rhythm: Pull & Breathe, Kick, then GLIDE.',
    icon: '🤝',
    focus: 'Breaststroke Stroke Coordination',
    why: 'Breaststroke is the only stroke where arms and legs take turns rather than moving together. Mastering the sequence "Pull, Breathe, Kick, Glide" unlocks effortless breaststroke.',
    safety: [
      ...POOL_SAFETY,
      'Never kick and pull at the exact same moment — arms pull first, then legs kick as hands shoot forward.',
    ],
    who: 'Swimmers putting together basic breaststroke arms and whip kick in the pool.',
    need: ['Swimming pool lane', 'Swim goggles'],
    questions: [
      'Do you pull while your legs are straight?',
      'Do you kick while your hands shoot forward into streamline?',
    ],
    steps: [
      '1. PULL & BREATHE: Hands outsweep and sweep inward to chin; chin lifts gently to inhale.',
      '2. SHOOT & KICK: As hands shoot forward into streamline, heels draw up and whip kick snaps.',
      '3. GLIDE: Body locks into horizontal streamline, riding the kick momentum for 2 full seconds.',
      'Repeat the 3-step rhythm smoothly across the pool.',
    ],
    practice: {
      task: 'Swim 4 x 20m full breaststroke focusing strictly on: Pull-Breathe-Kick-Glide.',
      reps: '4 x 20m pool lengths',
      rest: '30 seconds rest',
      rounds: 3,
    },
    selfCheck: [
      'I hold a distinct 2-second glide after every kick before starting the next pull.',
      'My arms and legs take turns instead of thrashing at the same time.',
    ],
    mistakes: [
      {
        mistake: 'Pulling and kicking at the same time, cancelling out glide momentum.',
        fix: 'Say the cue in your head: "Pull, Breathe, Kick, GLIDE... Pull, Breathe, Kick, GLIDE".',
      },
    ],
    cues: ['Pull & breathe', 'Kick as hands shoot', 'Hold the glide'],
    ready: ['Completed Drop 11 (Breaststroke Kick) and Drop 15 (Breaststroke Arms)'],
    animText: 'Observe the synchronized sequence: Arms sweep to breathe, hands shoot forward as legs whip, and the swimmer glides in streamline.',
  },
  {
    id: 17,
    level: 3,
    name: 'Butterfly Dolphin Kick Introduction (Pool Wall & Kickboard)',
    short: 'Develop fluid dolphin kick undulation originating from your chest and hips with feet pressed together.',
    icon: '🐬',
    focus: 'Butterfly Dolphin Kick Foundation',
    why: 'The dolphin kick is the fastest underwater propulsion in swimming. Learning the wave-like undulation from chest to toes builds core strength and lays the foundation for butterfly.',
    safety: [
      ...POOL_SAFETY,
      'Never bend knees excessively like kicking a soccer ball — the movement must flow from your hips and core.',
      'Keep ankles loose and relaxed.',
    ],
    who: 'Swimmers in Pond Level 3 ready to learn butterfly kicking fundamentals.',
    need: ['Swimming pool lane', 'Kickboard', 'Swim goggles'],
    questions: [
      'Do both feet stay pressed tightly together like a dolphin flipper?',
      'Does the wave movement start from your chest and hips?',
    ],
    steps: [
      'Hold pool edge with hands on stomach, or hold kickboard out front.',
      'Press chest slightly down into water, allowing hips to rise up.',
      'Release chest and drive hips downward, letting legs whip down with loose ankles.',
      'Both legs move simultaneously as a single flipper.',
      'Maintain continuous rhythmic undulation: down-beat, up-beat, down-beat.',
    ],
    practice: {
      task: 'Kick 4 x 15m with kickboard using dolphin kick only (no flutter, no breast kick).',
      reps: '4 x 15m lengths',
      rest: '30 seconds rest',
      rounds: 3,
    },
    selfCheck: [
      'My feet stayed glued together throughout the kick.',
      'I felt my hips rise and fall in a rhythmic wave.',
      'My kick was symmetrical with both legs moving as one.',
    ],
    mistakes: [
      {
        mistake: 'Bending knees at 90 degrees and kicking with lower legs only.',
        fix: 'Keep knees soft; initiate the wave from your chest and hips like whip cracking.',
      },
    ],
    cues: ['Wave from the chest', 'Glue your feet together', 'Flick like a dolphin tail'],
    ready: ['Strong core stability and comfort swimming in deep pool lanes'],
    animText: 'Watch the dolphin undulation: chest presses down, hips rise, and both legs whip together in a fluid underwater wave.',
  },
  {
    id: 18,
    level: 3,
    name: 'Streamlined Underwater Dolphin Kick & Multi-Stroke Graduation',
    short: 'Master underwater dolphin kicks off the wall and complete the full 4-stroke Pond Graduation circuit.',
    icon: '🎓',
    focus: 'Pond Stage Capstone & Multi-Stroke Mastery',
    why: 'Demonstrates mastery of all Pond Stage requirements: advanced freestyle & backstroke stamina, basic breaststroke coordination, and butterfly dolphin kick propulsion in the swimming pool.',
    safety: [
      ...POOL_SAFETY,
      'All skills performed strictly in supervised swimming pool environment.',
    ],
    who: 'Swimmers graduating from Pond Stage to earn their complete 18 Pond Drops and unlock Lake Stage!',
    need: ['25m swimming pool lane', 'Swim goggles'],
    questions: [
      'Can you execute 4 tight underwater dolphin kicks off every pool wall push?',
      'Can you demonstrate advanced freestyle, backstroke, breaststroke kick/stroke, and dolphin kick?',
    ],
    steps: [
      'Push off pool wall in tight streamline and perform 4–6 tight underwater dolphin kicks.',
      'Break out into 25m advanced freestyle with bilateral 3-stroke breathing.',
      'Wall turn: Streamline push-off with dolphin kick into 25m advanced backstroke.',
      'Wall turn: Streamline push-off into 25m coordinated breaststroke (Pull, Breathe, Kick, Glide).',
      'Touch the wall to complete your Pond Graduation!',
    ],
    practice: {
      task: 'Complete the Graduation Medley: 25m Freestyle + 25m Backstroke + 25m Breaststroke with dolphin kick wall breakouts.',
      reps: '1 full 75m graduation medley',
      rest: 'Complete with pride!',
      rounds: 1,
    },
    selfCheck: [
      'I completed all 18 Pond Drops with technical mastery.',
      'My underwater dolphin kicks provided strong forward propulsion.',
      'I demonstrated advanced freestyle, backstroke, and breaststroke coordination.',
    ],
    mistakes: [
      {
        mistake: 'Breaking streamline too early off the wall.',
        fix: 'Hold streamline tight while dolphin kicking before beginning your arm breakout.',
      },
    ],
    cues: ['Tight streamline', 'Dolphin power off the wall', 'Stage 3 Pond Complete!'],
    ready: ['Completed Drops 1 through 17 of Pond Stage'],
    animText: 'Grand Finale: Swimmer launches off pool wall with tight dolphin kicks, transitions into advanced freestyle, backstroke, and coordinated breaststroke to graduate Stage 3 Pond!',
  },
];

export function getPondSkill(id: number): PondSkill {
  const s = POND_SKILLS.find((x) => x.id === id);
  if (!s) throw new Error(`Unknown Pond skill ${id}`);
  return s;
}

export function getPondLevel(id: PondLevelId): PondLevel {
  const l = POND_LEVELS.find((x) => x.id === id);
  if (!l) throw new Error(`Unknown Pond level ${id}`);
  return l;
}

export function getPondSkillsByLevel(levelId: PondLevelId): PondSkill[] {
  return POND_SKILLS.filter((s) => s.level === levelId);
}
