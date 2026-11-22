import React, { useState } from 'react';
import {
  ShieldCheck,
  BookOpen,
  Film,
  Sparkles,
  Award,
  CheckCircle2,
  AlertTriangle,
  HeartHandshake,
  Compass,
  Waves,
  Eye,
  Info,
} from 'lucide-react';

interface SwimLearningResourcesProps {
  onGoVideos?: () => void;
  onGoComics?: () => void;
}

export function SwimLearningResources({ onGoVideos, onGoComics }: SwimLearningResourcesProps) {
  const [activeCategory, setActiveCategory] = useState<'safety' | 'techniques' | 'drills'>('safety');
  const [expandedTechnique, setExpandedTechnique] = useState<string | null>('freestyle');

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-6 py-6 font-sans">
      {/* ── HEADER BANNER ── */}
      <div className="relative overflow-hidden rounded-3xl border-3 border-black bg-gradient-to-r from-sky-600 via-indigo-600 to-blue-700 p-6 sm:p-8 text-white shadow-[6px_6px_0_#000]">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-wider backdrop-blur-sm">
            <span>💡 Aqua Slash Educational Resources</span>
          </div>
          <h1 className="mt-3 font-bangers text-3xl sm:text-5xl tracking-wide uppercase drop-shadow-[2px_2px_0_#000]">
            Technique Demonstrations & Water Safety
          </h1>
          <p className="mt-2 font-comic text-sm sm:text-base text-sky-100 font-semibold leading-relaxed">
            Master stroke mechanics, essential water safety rules, and foundational swimming drills from the Aqua Slash 108-drop curriculum.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            {onGoVideos && (
              <button
                onClick={onGoVideos}
                className="flex items-center gap-2 rounded-xl border-2 border-black bg-yellow-400 px-4 py-2 font-bangers text-sm sm:text-base text-black shadow-[3px_3px_0_#000] hover:bg-yellow-300 transition cursor-pointer"
              >
                <Film className="w-4 h-4" /> WATCH 1080P VIDEO DRILLS ▶
              </button>
            )}
            {onGoComics && (
              <button
                onClick={onGoComics}
                className="flex items-center gap-2 rounded-xl border-2 border-black bg-white px-4 py-2 font-bangers text-sm sm:text-base text-black shadow-[3px_3px_0_#000] hover:bg-slate-100 transition cursor-pointer"
              >
                <BookOpen className="w-4 h-4" /> READ WATER SAFETY COMIC 📖
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── SUB-TABS: Safety vs Techniques vs Drills ── */}
      <div className="mt-6 flex flex-wrap items-center gap-2 rounded-2xl border-3 border-black bg-slate-900 p-2 shadow-[4px_4px_0_#000]">
        <button
          onClick={() => setActiveCategory('safety')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 font-bangers text-sm sm:text-base tracking-wider transition cursor-pointer ${
            activeCategory === 'safety'
              ? 'bg-rose-500 text-white border-2 border-black shadow-[2px_2px_0_#000]'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>🛡️ WATER SAFETY EDUCATION</span>
        </button>

        <button
          onClick={() => setActiveCategory('techniques')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 font-bangers text-sm sm:text-base tracking-wider transition cursor-pointer ${
            activeCategory === 'techniques'
              ? 'bg-cyan-400 text-black border-2 border-black shadow-[2px_2px_0_#000]'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Waves className="w-4 h-4" />
          <span>🏊 TECHNIQUE DEMONSTRATIONS</span>
        </button>

        <button
          onClick={() => setActiveCategory('drills')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 font-bangers text-sm sm:text-base tracking-wider transition cursor-pointer ${
            activeCategory === 'drills'
              ? 'bg-amber-400 text-black border-2 border-black shadow-[2px_2px_0_#000]'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>🎯 CURRICULUM PRACTICE DRILLS</span>
        </button>
      </div>

      {/* ── SECTION 1: WATER SAFETY EDUCATION ── */}
      {activeCategory === 'safety' && (
        <div className="mt-6 space-y-6">
          {/* 5 Golden Rules Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                num: '01',
                title: 'Constant Adult / Coach Supervision',
                desc: 'Never swim alone. An adult, coach, or certified lifeguard must always have active visual contact.',
                icon: '👀',
                color: 'border-amber-400 bg-amber-50 text-amber-950',
              },
              {
                num: '02',
                title: 'Controlled Pool Edge Entry',
                desc: 'Always sit, turn, and lower into water slowly. Never run on wet pool decks or dive in shallow water.',
                icon: '🚶‍♂️',
                color: 'border-blue-400 bg-blue-50 text-blue-950',
              },
              {
                num: '03',
                title: 'Panic Prevention: "Float to Live"',
                desc: 'If tired or startled, roll onto your back, relax your shoulders, chin up to the sky, and gently breathe.',
                icon: '🧘',
                color: 'border-emerald-400 bg-emerald-50 text-emerald-950',
              },
              {
                num: '04',
                title: 'Breath Control & Submersion Rules',
                desc: 'Breathe in through the mouth above water, exhale steady bubbles through nose and mouth under water.',
                icon: '🫧',
                color: 'border-cyan-400 bg-cyan-50 text-cyan-950',
              },
              {
                num: '05',
                title: 'River, Lake & Open Water Rules',
                desc: 'Natural bodies of water have unseen currents, drop-offs, and cold shocks. Always wear safety vests in natural water.',
                icon: '🏞️',
                color: 'border-indigo-400 bg-indigo-50 text-indigo-950',
              },
              {
                num: '06',
                title: 'Emergency: Reach or Throw, Don’t Go',
                desc: 'If someone is struggling, reach with a pole, kickboard, or towel, or throw a float. Never jump in unprepared.',
                icon: '🛟',
                color: 'border-rose-400 bg-rose-50 text-rose-950',
              },
            ].map((rule) => (
              <div
                key={rule.num}
                className={`rounded-2xl border-3 border-black p-5 shadow-[4px_4px_0_#000] ${rule.color}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{rule.icon}</span>
                  <span className="font-bangers text-lg tracking-wider opacity-60">RULE {rule.num}</span>
                </div>
                <h3 className="mt-3 font-bangers text-xl tracking-wide uppercase leading-tight">{rule.title}</h3>
                <p className="mt-2 font-comic text-sm font-semibold leading-relaxed opacity-90">{rule.desc}</p>
              </div>
            ))}
          </div>

          {/* Water Quality & Ecosystem Awareness Card */}
          <div className="rounded-3xl border-3 border-black bg-slate-900 p-6 text-white shadow-[6px_6px_0_#000]">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1 space-y-3">
                <span className="rounded bg-teal-400 px-2.5 py-1 font-bangers text-xs text-black">
                  ECOSYSTEM & HEALTH SAFETY
                </span>
                <h2 className="font-bangers text-2xl sm:text-3xl tracking-wide uppercase text-yellow-300">
                  River & Water Quality Safety Awareness
                </h2>
                <p className="font-comic text-sm text-slate-300 font-semibold leading-relaxed">
                  Clean water is vital for safe swimming. Understanding river pollution, agricultural runoff, and water clarity helps swimmers choose safe environments and protect aquatic habitats.
                </p>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="rounded-xl border border-white/20 bg-white/5 p-3">
                    <p className="font-bangers text-sm text-cyan-300">1. WATER CLARITY</p>
                    <p className="font-comic text-xs text-slate-300 mt-1">If you cannot see your feet at knee-depth, avoid swimming.</p>
                  </div>
                  <div className="rounded-xl border border-white/20 bg-white/5 p-3">
                    <p className="font-bangers text-sm text-emerald-300">2. CURRENT CHECK</p>
                    <p className="font-comic text-xs text-slate-300 mt-1">Check river flow speed using floating leaves or twigs before entry.</p>
                  </div>
                </div>
              </div>
              <div className="w-full md:w-80 shrink-0 rounded-2xl border-2 border-black overflow-hidden bg-black shadow-[4px_4px_0_#000]">
                <img
                  src="https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=800&q=80"
                  alt="Clear swimming water safety"
                  className="h-48 w-full object-cover"
                />
                <div className="p-3 bg-slate-800 text-xs text-slate-300 font-semibold flex items-center justify-between">
                  <span>Aqua Slash Safety Standard</span>
                  <span className="text-emerald-400 font-bold">100% Verified</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SECTION 2: TECHNIQUE DEMONSTRATIONS ── */}
      {activeCategory === 'techniques' && (
        <div className="mt-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {[
              {
                id: 'freestyle',
                stroke: 'Freestyle (Front Crawl)',
                phase: 'Foundational Propulsion & Rhythm',
                cues: [
                  'High Elbow Catch: Reach forward, engage lats, press water backward.',
                  'Bilateral Side Breathing: One goggle in water, one out. Turn head, don’t lift it.',
                  'Continuous 6-Beat Flutter Kick: Kicking starts from the hips with floppy ankles.',
                  'Streamline Body Position: Head aligned with spine, pressing the "buoy" (chest).',
                ],
                drillDemo: 'Catch-up drill with kickboard & Single-arm progression',
                bg: 'bg-cyan-950/40 border-cyan-400 text-cyan-100',
                badge: 'Primary Speed Stroke',
              },
              {
                id: 'backstroke',
                stroke: 'Backstroke',
                phase: 'Unobstructed Breathing & Shoulder Rotation',
                cues: [
                  'Chin to the Sky: Keep ears underwater, gaze directly upward.',
                  'Thumb Out, Pinky In: Arm exits with thumb up, rotates in air, enters with pinky finger first.',
                  'Continuous Hip & Shoulder Roll: Rotate body ~45 degrees with every stroke.',
                  'Boiling Water Kick: Fast, shallow flutter kick creating small surface boils.',
                ],
                drillDemo: 'Cup-on-forehead balance drill & 6-kick 1-switch drill',
                bg: 'bg-blue-950/40 border-blue-400 text-blue-100',
                badge: 'Easy Breathing Stroke',
              },
              {
                id: 'breaststroke',
                stroke: 'Breaststroke',
                phase: 'Timing: Pull, Breathe, Kick, GLIDE',
                cues: [
                  'Heart-Shaped Pull: Hands sweep outward, sweep inward under the chin, and shoot forward.',
                  'Heels to Butt Whip Kick: Feet turn outwards, kick back in a circle, snap together.',
                  'The Magic Glide: Hold streamline for 1–2 full seconds after every kick.',
                  'Never Kick and Pull at the Same Time: Distinct sequential rhythm.',
                ],
                drillDemo: 'Two kicks + one pull glide drill & Heel-touch drill',
                bg: 'bg-emerald-950/40 border-emerald-400 text-emerald-100',
                badge: 'Endurance & Resting Stroke',
              },
              {
                id: 'butterfly',
                stroke: 'Butterfly',
                phase: 'Chest Undulation & Double Dolphin Kick',
                cues: [
                  'Undulation from the Chest: Wave motion starts behind the collarbones, not the knees.',
                  'Two Kicks per Arm Cycle: Kick 1 when hands enter water; Kick 2 when hands push out at hips.',
                  'Low Forward Breath: Sweep chin forward along water surface; avoid rearing high up.',
                  'Thumb-Grazing Water Recovery: Wide, relaxed recovery skimmed just above surface.',
                ],
                drillDemo: 'One-arm butterfly drill & Underwater dolphin kick off walls',
                bg: 'bg-purple-950/40 border-purple-400 text-purple-100',
                badge: 'Power & Rhythm Stroke',
              },
            ].map((tech) => (
              <div
                key={tech.id}
                className={`rounded-3xl border-3 border-black p-6 shadow-[5px_5px_0_#000] bg-slate-900 ${tech.bg}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bangers text-xs tracking-wider uppercase text-yellow-300">
                    {tech.badge}
                  </span>
                  <span className="rounded bg-black px-2 py-0.5 text-[10px] font-bold text-slate-300">
                    Technique Analysis
                  </span>
                </div>
                <h3 className="mt-2 font-bangers text-2xl tracking-wide uppercase text-white">
                  {tech.stroke}
                </h3>
                <p className="font-comic text-xs font-bold text-sky-300">{tech.phase}</p>

                <div className="mt-4 space-y-2">
                  {tech.cues.map((cue, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <p className="font-comic text-xs text-slate-200 leading-snug">{cue}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-xl border border-white/20 bg-white/5 p-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold text-yellow-400 uppercase tracking-wider block">
                      Recommended Drill
                    </span>
                    <span className="font-comic text-xs text-slate-300 font-bold">{tech.drillDemo}</span>
                  </div>
                  {onGoVideos && (
                    <button
                      onClick={onGoVideos}
                      className="rounded-lg bg-sky-500 px-2.5 py-1 font-bangers text-xs text-white hover:bg-sky-400 cursor-pointer"
                    >
                      Watch Drill ▶
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SECTION 3: CURRICULUM PRACTICE DRILLS ── */}
      {activeCategory === 'drills' && (
        <div className="mt-6 space-y-6">
          <div className="rounded-3xl border-3 border-black bg-slate-900 p-6 text-white shadow-[6px_6px_0_#000]">
            <h2 className="font-bangers text-2xl sm:text-3xl tracking-wide uppercase text-yellow-300">
              18 Essential Practice Drills (Level 1 to Level 3)
            </h2>
            <p className="font-comic text-sm text-slate-300 font-semibold mt-1">
              Practise these structured drills to progress from water confidence to full stroke coordination.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  id: 1,
                  level: 'L1: Water Control',
                  name: 'Bubble Blowing & Controlled Exhalation',
                  desc: 'Submerge mouth and nose, blow smooth, continuous bubbles. Inhale through mouth upon surfacing.',
                  target: '5 continuous cycles without gasping',
                },
                {
                  id: 2,
                  level: 'L1: Water Control',
                  name: 'Mushroom Float & Recovery',
                  desc: 'Tuck knees to chest, hug legs, hold breath and float. To recover, open arms and press feet firmly down.',
                  target: '5 second stable float',
                },
                {
                  id: 3,
                  level: 'L1: Water Control',
                  name: 'Prone Streamline Push & Glide',
                  desc: 'Push off wall with hands locked overhead in streamline. Glide horizontally without kicking.',
                  target: 'Glide 3 meters to coach',
                },
                {
                  id: 4,
                  level: 'L2: Kick & Body Movement',
                  name: 'Wall Flutter Kick & Torso Alignment',
                  desc: 'Hold gutter or wall edge with two hands, keep body flat on water surface. Kick with pointed toes.',
                  target: '20 seconds steady kicking',
                },
                {
                  id: 5,
                  level: 'L2: Kick & Body Movement',
                  name: 'Kickboard Streamline Lap',
                  desc: 'Grip board at top, push off in streamline, kick with face submerged, lifting head only to breathe.',
                  target: '15 meters continuous kick',
                },
                {
                  id: 6,
                  level: 'L3: Basic Coordination',
                  name: 'Single-Arm Freestyle Catch & Pull',
                  desc: 'One arm extended forward on board, the other performs full pull, catch, and high elbow recovery.',
                  target: '6 pulls per side with side breathing',
                },
              ].map((drill) => (
                <div
                  key={drill.id}
                  className="rounded-2xl border-2 border-slate-700 bg-slate-800/80 p-4 flex flex-col justify-between hover:border-yellow-400 transition"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="rounded bg-sky-500/20 px-2 py-0.5 text-[10px] font-extrabold text-sky-400">
                        {drill.level}
                      </span>
                      <span className="font-bangers text-xs text-yellow-300">DRILL {drill.id}</span>
                    </div>
                    <h4 className="mt-2 font-bangers text-lg text-white">{drill.name}</h4>
                    <p className="mt-1 font-comic text-xs text-slate-300 leading-relaxed">{drill.desc}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-700/80">
                    <span className="text-[10px] uppercase font-bold text-emerald-400 block">Mastery Target:</span>
                    <span className="font-comic text-xs text-slate-200 font-semibold">{drill.target}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
