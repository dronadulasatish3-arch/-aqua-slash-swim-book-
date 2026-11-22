// GLASS — Water Confidence & Basic Safety · 3 Glass Levels · 18 Skills · 18 Drops · ONE continuous glass
export type GlassLevelId = 1 | 2 | 3;

export interface GlassLevel {
  id: GlassLevelId;
  name: string;
  focus: string;
  emoji: string;
}

export interface GlassSkill {
  id: number; // 1–18 (drop number)
  level: GlassLevelId;
  n: number; // 1–6 within the level
  name: string;
  icon: string;
  short: string;
  steps: string[];
  safety: string;
  selfCheck: string[];
  cue: string;
}

export const GLASS_LEVELS: GlassLevel[] = [
  { id: 1, name: 'First Splash', focus: 'Water Confidence & Trust Building', emoji: '💦' },
  { id: 2, name: 'Bubble Maker', focus: 'Breath Control & Water Comfort', emoji: '🫧' },
  { id: 3, name: 'Fearless Jumper', focus: 'Full Submersion & Water Entry Confidence', emoji: '🤸' },
];

const SUPERVISED = 'Always with your instructor or a responsible adult watching closely.';

export const GLASS_SKILLS: GlassSkill[] = [
  // ── GLASS 1 — FIRST SPLASH ──
  {
    id: 1, level: 1, n: 1, name: 'Pool Deck Comfort & Edge Observation', icon: '👀',
    short: 'Feel relaxed on the pool deck and watch the water from a safe place.',
    steps: ['Walk slowly on the pool deck with your instructor.', 'Stop behind the edge line and look at the water.', 'Point out the shallow end and the steps.', 'Take a few calm breaths.'],
    safety: `${SUPERVISED} Walk — never run — on the deck.`,
    selfCheck: ['I can walk calmly on the pool deck.', 'I know where the shallow end and steps are.'],
    cue: 'Walk slowly, look and breathe',
  },
  {
    id: 2, level: 1, n: 2, name: 'Sitting Comfortably on Pool Steps', icon: '🪜',
    short: 'Sit on the pool steps with your legs in the water and feel calm.',
    steps: ['Hold the rail and step down to the first step.', 'Sit down with your feet in the water.', 'Move your feet and legs gently.', 'Stay seated and relaxed for a little while.'],
    safety: `${SUPERVISED} Hold the rail on the steps.`,
    selfCheck: ['I can sit on the steps with my legs in the water.', 'I feel calm while sitting.'],
    cue: 'Hold the rail, sit and relax',
  },
  {
    id: 3, level: 1, n: 3, name: 'Safe Basic Pool Entry', icon: '⬇️',
    short: 'Get into the shallow water slowly and safely using the steps or the edge.',
    steps: ['Wait for your instructor to say “ready”.', 'Hold the rail or the edge.', 'Step or slide in slowly, feet first.', 'Stand with your feet flat on the floor.'],
    safety: `${SUPERVISED} Only in water where you can stand. No jumping at this stage.`,
    selfCheck: ['I wait for my instructor’s signal.', 'I get in slowly while holding on.', 'I can stand in the shallow water.'],
    cue: 'Hold on, feet first, slowly',
  },
  {
    id: 4, level: 1, n: 4, name: 'Safe Basic Pool Exit', icon: '⬆️',
    short: 'Get out of the pool safely by yourself using the steps or the edge.',
    steps: ['Walk to the steps or the edge.', 'Hold the rail or put both hands on the edge.', 'Climb out step by step (or elbow, knee, stand).', 'Stand up away from the edge.'],
    safety: `${SUPERVISED} Take your time — no pushing or rushing.`,
    selfCheck: ['I can get out of the pool by myself.', 'I move away from the edge after getting out.'],
    cue: 'Hands, knee, stand up',
  },
  {
    id: 5, level: 1, n: 5, name: 'Water Touch & Body Familiarity', icon: '✋',
    short: 'Touch the water and let it touch your arms, shoulders and neck.',
    steps: ['Stand in the shallow water.', 'Scoop water onto your arms.', 'Pour water on your shoulders.', 'Bend down so the water reaches your neck.'],
    safety: SUPERVISED,
    selfCheck: ['I can put water on my arms and shoulders.', 'I can bend down with water up to my neck.'],
    cue: 'Scoop, pour, smile',
  },
  {
    id: 6, level: 1, n: 6, name: 'Splash Tolerance & Willing Face Splashing', icon: '💦',
    short: 'Splash water gently on your face and stay happy and calm.',
    steps: ['Cup water in your hands.', 'Gently splash your cheeks and chin.', 'Splash your whole face.', 'Blink, smile — no need to wipe.'],
    safety: SUPERVISED,
    selfCheck: ['I can splash water on my own face.', 'I stay calm when my face gets wet.'],
    cue: 'Splash, blink, smile',
  },

  // ── GLASS 2 — BUBBLE MAKER ──
  {
    id: 7, level: 2, n: 1, name: 'Bubble Introduction', icon: '🫧',
    short: 'Blow bubbles into the water with your mouth.',
    steps: ['Breathe in above the water.', 'Put your lips on the water.', 'Blow out gently — make bubbles.', 'Lift your head and breathe in again.'],
    safety: `${SUPERVISED} Only breathe in above the water.`,
    selfCheck: ['I can blow bubbles with my mouth.', 'I breathe in above the water.'],
    cue: 'In above, bubbles below',
  },
  {
    id: 8, level: 2, n: 2, name: 'Continuous Bubble Breathing', icon: '🔁',
    short: 'Breathe in, blow bubbles, and repeat in a calm rhythm.',
    steps: ['Breathe in above the water.', 'Blow bubbles for a slow count of 3.', 'Lift up and breathe in.', 'Repeat 5 times in a row.'],
    safety: `${SUPERVISED} No breath-holding games.`,
    selfCheck: ['I can do 5 bubble breaths in a row.', 'My breathing stays calm.'],
    cue: 'Breathe in, bubble out, repeat',
  },
  {
    id: 9, level: 2, n: 3, name: 'Mouth & Partial Face Submersion', icon: '👄',
    short: 'Put your mouth and nose in the water while blowing bubbles.',
    steps: ['Breathe in.', 'Lower your mouth and nose into the water.', 'Hum out bubbles through your nose and mouth.', 'Lift up and breathe.'],
    safety: `${SUPERVISED} Hold the wall if you like.`,
    selfCheck: ['I can put my mouth and nose in the water.', 'I blow bubbles out through my nose.'],
    cue: 'Hum the bubbles out',
  },
  {
    id: 10, level: 2, n: 4, name: 'Face-in-Water Comfort', icon: '😌',
    short: 'Put your whole face in the water for a few seconds and stay relaxed.',
    steps: ['Hold the wall and breathe in.', 'Put your whole face in the water.', 'Blow gentle bubbles for 3 seconds.', 'Lift up, blink and smile.'],
    safety: `${SUPERVISED} Short and calm — a few seconds is perfect.`,
    selfCheck: ['I can put my whole face in the water.', 'I stay relaxed and blow bubbles.'],
    cue: 'Face in, bubbles, up',
  },
  {
    id: 11, level: 2, n: 5, name: 'Assisted Back Float', icon: '🌙',
    short: 'Float on your back while your instructor supports you.',
    steps: ['Your instructor supports your head and back.', 'Lie back slowly, ears in the water.', 'Look up and push your tummy up.', 'Breathe normally, then stand up with help.'],
    safety: 'Only with your instructor supporting you in the water.',
    selfCheck: ['I can lie back with support.', 'My ears go in the water and I stay calm.'],
    cue: 'Ears in, tummy up',
  },
  {
    id: 12, level: 2, n: 6, name: 'Supported Kicking', icon: '🦵',
    short: 'Kick your legs while holding the wall or with instructor support.',
    steps: ['Hold the wall with both hands.', 'Let your legs float up behind you.', 'Kick with long, loose legs.', 'Small kicks from the hips.'],
    safety: `${SUPERVISED} Hold on the whole time.`,
    selfCheck: ['I can kick while holding the wall.', 'My kicks are small and from the hips.'],
    cue: 'Long legs, small kicks',
  },

  // ── GLASS 3 — FEARLESS JUMPER ──
  {
    id: 13, level: 3, n: 1, name: 'Full Face Submersion', icon: '🤿',
    short: 'Go under so your whole head is in the water, then come up calmly.',
    steps: ['Hold the wall and breathe in.', 'Bend your knees until your head goes under.', 'Blow gentle bubbles.', 'Stand up slowly and breathe.'],
    safety: `${SUPERVISED} No breath-holding contests.`,
    selfCheck: ['I can put my whole head under the water.', 'I come up calmly.'],
    cue: 'Breathe in, go under, bubbles',
  },
  {
    id: 14, level: 3, n: 2, name: 'Voluntary Eyes Open Underwater', icon: '👁️',
    short: 'Open your eyes under the water when you feel ready.',
    steps: ['Go under with bubbles (goggles optional).', 'Slowly open your eyes.', 'Look at your instructor’s hand or a toy.', 'Come up and blink.'],
    safety: `${SUPERVISED} Only when you feel ready — it is okay to take your time.`,
    selfCheck: ['I can open my eyes under the water.', 'I can see my instructor’s hand.'],
    cue: 'Go under, open, look',
  },
  {
    id: 15, level: 3, n: 3, name: 'Full Submersion & Calm Return', icon: '🔄',
    short: 'Go fully under, pause calmly, and return to standing in control.',
    steps: ['Breathe in above the water.', 'Go fully under and blow bubbles.', 'Pause for a short, calm moment.', 'Push up gently and stand.'],
    safety: `${SUPERVISED} Keep it short and calm.`,
    selfCheck: ['I can go fully under the water.', 'I return to standing calmly by myself.'],
    cue: 'Under, pause, up slowly',
  },
  {
    id: 16, level: 3, n: 4, name: 'Safe Supervised Entry', icon: '🚪',
    short: 'Enter the water from the edge by yourself, safely, when your instructor says so.',
    steps: ['Sit on the edge and wait for the signal.', 'Check the water in front is clear.', 'Turn, hold the edge and lower yourself in.', 'Stand and give a thumbs up.'],
    safety: `${SUPERVISED} Only in water depth chosen by your instructor.`,
    selfCheck: ['I wait for the signal.', 'I enter safely by myself.'],
    cue: 'Wait, check, lower in',
  },
  {
    id: 17, level: 3, n: 5, name: 'Supervised Jump Entry', icon: '🤸',
    short: 'Jump in feet first when your instructor is ready in the water.',
    steps: ['Stand at the edge with toes over.', 'Wait until your instructor is ready and says “jump”.', 'Jump out, feet first — never head first.', 'Come up, turn and swim or reach back to the wall.'],
    safety: 'Only with your instructor in the water, in a depth they have checked. Feet first — never dive.',
    selfCheck: ['I only jump when my instructor says so.', 'I jump feet first.', 'I come back up and return to the wall.'],
    cue: 'Toes over, wait, feet first',
  },
  {
    id: 18, level: 3, n: 6, name: 'Assisted Kicking & Short Movement', icon: '🌊',
    short: 'Kick and travel a short distance with instructor support.',
    steps: ['Your instructor supports you (or you hold a float if they use one).', 'Stretch out long in the water.', 'Kick with small kicks from the hips.', 'Travel a short distance to your instructor or the wall.'],
    safety: 'With your instructor supporting you in the water.',
    selfCheck: ['I can kick and move forward with support.', 'I travel a short distance calmly.'],
    cue: 'Stretch long, kick, go',
  },
];

export const glassSkillsByLevel = (l: GlassLevelId) => GLASS_SKILLS.filter((s) => s.level === l);
export const getGlassSkill = (id: number) => GLASS_SKILLS.find((s) => s.id === id)!;
