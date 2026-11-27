import React, { useCallback, useEffect, useRef, useState } from 'react';
import { getLevel, getSkill, SKILLS, type LevelId } from '../data/curriculum';
import {
  dropSettled,
  levelCount,
  levelState,
  milestoneActive,
  poolBetaComplete,
  poolConfig,
  skillState,
  usePoolMachine,
  validateOpen,
  type StudentState,
} from '../state/poolMachine';
import { sfx, useSoundOn } from '../lib/sound';
import { PoolScene } from '../pool/PoolScene';
import { STATE_LABEL } from '../pool/journey';
import { DropRail, STATUS_META, dropVisual } from './Drops';
import { LevelCards, SkillCards } from './Journey';
import { SkillPage } from './SkillPage';
import { ProgressJourney } from './ProgressJourney';
import { FinalCelebration, LevelBanner, LevelCompletePanel } from './Celebration';
import { DevPanel } from './DevPanel';
import { AppHeader } from './AppHeader';
import { AuthGate } from './AuthGate';
import { JourneyHome, type Section } from './JourneyHome';
import { GlassSection } from './GlassSection';
import { PondSection } from './PondSection';
import { ProfileSection } from './ProfileSection';
import { MyVideosSection } from './MyVideosSection';
import { useIdentity } from '../lib/identity';
import type { Student } from '../lib/api';
import { cn } from '../utils/cn';
import { useAdmin } from '../context/AdminContext';

type View = { type: 'journey' } | { type: 'skill'; id: number };

export function SwimBookDashboard({ onOpenLibrary }: { onOpenLibrary?: () => void } = {}) {
  const { student, isAuthenticated, login, logout } = useIdentity();
  const { isAdmin } = useAdmin();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,#d6f3ff_0%,#eaf8ff_45%,#f5fbff_100%)] pb-16 font-sans">
        <AuthGate onAuthenticated={login} />
      </div>
    );
  }

  return (
    <MainSwimBookApp
      key={student.studentId}
      student={student}
      onLogout={logout}
      isAdmin={isAdmin}
      onOpenLibrary={onOpenLibrary}
    />
  );
}

/** AQUA SLASH SWIM BOOK: Journey · Glass · Pool · Profile. */
function MainSwimBookApp({
  student,
  onLogout,
  isAdmin,
  onOpenLibrary,
}: {
  student: Student;
  onLogout: () => void;
  isAdmin: boolean;
  onOpenLibrary?: () => void;
}) {
  const [section, setSection] = useState<Section>('home');

  const navigate = useCallback((s: Section) => {
    if (s === 'library' && onOpenLibrary) {
      onOpenLibrary();
      return;
    }
    setSection(s);
    window.scrollTo({ top: 0 });
  }, [onOpenLibrary]);

  if (section === 'pool') {
    return <PoolApp student={student} onNavigate={navigate} isAdmin={isAdmin} />;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,#d6f3ff_0%,#eaf8ff_45%,#f5fbff_100%)] pb-16 font-sans">
      <AppHeader student={student} section={section} onNavigate={navigate} onLogout={onLogout} />
      <main className="mx-auto max-w-6xl px-3 sm:px-6">
        {section === 'home' && <JourneyHome student={student} onNavigate={navigate} />}
        {section === 'glass' && <GlassSection student={student} onGoPool={() => navigate('pool')} />}
        {section === 'pond' && <PondSection student={student} onGoNext={() => navigate('home')} />}
        {section === 'videos' && <MyVideosSection student={student} onOpenPublicLibrary={() => navigate('library')} />}
        {section === 'profile' && <ProfileSection student={student} onNavigate={navigate} />}
        <footer className="mt-12 text-center text-xs font-semibold text-slate-400">
          Aqua Slash Swim Book · Always swim with a qualified instructor or supervising adult.
        </footer>
      </main>
    </div>
  );
}

function PoolApp({
  student,
  onNavigate,
  isAdmin,
}: {
  student: Student;
  onNavigate: (s: Section) => void;
  isAdmin: boolean;
}) {
  const { state, dispatch } = usePoolMachine(student.studentId);
  const soundOn = useSoundOn();
  const [view, setView] = useState<View>({ type: 'journey' });
  const [viewSkill, setViewSkill] = useState(state.currentSkill);
  const [selectedLevel, setSelectedLevel] = useState<LevelId>(state.currentLevel);
  const [reviewing, setReviewing] = useState(false);
  const [finalModal, setFinalModal] = useState(false);
  const poolRef = useRef<HTMLDivElement>(null);
  const skillsRef = useRef<HTMLDivElement>(null);
  const levelsRef = useRef<HTMLDivElement>(null);
  const soundRef = useRef(soundOn);
  soundRef.current = soundOn;

  const showDev = isAdmin || (typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('dev'));

  const scrollToPool = () =>
    requestAnimationFrame(() => poolRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  const { studentState, activeDrop, currentLevel, uiLocked } = state;
  const inPool = studentState === 'IN_POOL' || studentState === 'SWIMMING';
  const mode: 'skill' | 'journey' =
    inPool || (studentState === 'FINAL_CELEBRATION' && reviewing && !uiLocked) ? 'skill' : 'journey';

  // ── animations react to STATE changes ───────────────────
  const prevDrop = useRef(activeDrop);
  useEffect(() => {
    const prev = prevDrop.current;
    prevDrop.current = activeDrop;
    if (activeDrop != null && prev == null) {
      setView({ type: 'journey' });
      setViewSkill(activeDrop);
      scrollToPool();
    }
    if (activeDrop == null && prev != null) {
      const t = setTimeout(() => {
        setViewSkill((v) => (inPoolRef.current ? currentSkillRef.current : v));
        if (inPoolRef.current) setSelectedLevel(getSkill(currentSkillRef.current).level);
      }, 1100);
      return () => clearTimeout(t);
    }
  }, [activeDrop]);
  const inPoolRef = useRef(inPool);
  inPoolRef.current = inPool;
  const currentSkillRef = useRef(state.currentSkill);
  currentSkillRef.current = state.currentSkill;

  const prevStudent = useRef(studentState);
  useEffect(() => {
    const prev = prevStudent.current;
    prevStudent.current = studentState;
    if (prev === studentState) return;
    if (studentState === 'APPROACHING_EDGE') {
      if (soundRef.current) (currentLevel === 3 ? sfx.celebrate : sfx.success)();
      setView({ type: 'journey' });
      scrollToPool();
    }
    if (studentState === 'IN_POOL' && prev === 'RETURNING_TO_POOL') {
      setSelectedLevel(currentLevel);
    }
    if (studentState === 'WALKING_TO_POND') {
      setReviewing(false);
      scrollToPool();
    }
    if (studentState === 'FINAL_CELEBRATION' && prev === 'IN_POND') {
      if (soundRef.current) sfx.celebrate();
      const t = setTimeout(() => setFinalModal(true), 700);
      return () => clearTimeout(t);
    }
  }, [studentState, currentLevel]);

  useEffect(() => {
    if (studentState !== 'OUTSIDE_POOL' || !state.pondAutoStart) return;
    const t = setTimeout(() => dispatch({ type: 'START_POND_JOURNEY' }), 3200);
    return () => clearTimeout(t);
  }, [studentState, state.pondAutoStart, dispatch]);

  // ── handlers (they only dispatch events) — any of the 18 skills, any order ──
  const openSkill = (id: number) => {
    if (uiLocked) return;
    const reason = validateOpen(state, id);
    dispatch({ type: 'SKILL_OPENED', skillId: id });
    if (reason) return;
    setSelectedLevel(getSkill(id).level);
    setViewSkill(id);
    setView({ type: 'skill', id });
    if (soundOn) sfx.click();
    scrollToPool();
  };
  const reviewSkill = (id: number) => {
    if (uiLocked || skillState(state, id) !== 'COMPLETED') return;
    setViewSkill(id);
    setView({ type: 'skill', id });
    if (state.finalJourneyComplete) setReviewing(true);
    scrollToPool();
  };
  const preview = (id: number) => {
    if (uiLocked || skillState(state, id) === 'LOCKED') return;
    setViewSkill(id);
    if (state.finalJourneyComplete) setReviewing(true);
    if (soundOn) sfx.click();
    scrollToPool();
  };
  const completeSkill = (id: number) => dispatch({ type: 'SKILL_COMPLETED', skillId: id });
  const continueLevel = () => {
    dispatch({ type: 'CONTINUE_NEXT_LEVEL' });
    setView({ type: 'journey' });
    scrollToPool();
  };
  const startPond = () => dispatch({ type: 'START_POND_JOURNEY' });
  const onStudentStep = useCallback(
    (next: StudentState) =>
      dispatch(
        next === 'FINAL_CELEBRATION'
          ? { type: 'FINAL_JOURNEY_COMPLETE' }
          : { type: 'STUDENT_TRANSITION', to: next }
      ),
    [dispatch]
  );
  const onDropSettled = useCallback(
    (id: number) => dispatch({ type: 'DROP_SETTLED', dropId: id }),
    [dispatch]
  );
  const selectLevel = (l: LevelId) => {
    if (uiLocked || levelState(state, l) === 'LOCKED') return;
    setSelectedLevel(l);
    if (soundOn) sfx.click();
    requestAnimationFrame(() =>
      skillsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    );
  };
  const closeFinal = (toJourney: boolean) => {
    setFinalModal(false);
    dispatch({ type: 'FINAL_CELEBRATION_DISMISSED' });
    requestAnimationFrame(() =>
      (toJourney ? levelsRef : poolRef).current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    );
  };
  const reset = () => {
    if (
      !window.confirm(
        `Reset Pool progress for ${student.studentName}?\n\nOnly your drops and checklists will be cleared.`
      )
    )
      return;
    dispatch({ type: 'RESET' });
    setViewSkill(1);
    setSelectedLevel(1);
    setView({ type: 'journey' });
    setReviewing(false);
    setFinalModal(false);
  };

  // ── derived view data ───────────────────────────────────
  const settled = useCallback((id: number) => dropSettled(state, id), [state]);
  const milestones = [1, 2, 3].map((l) => milestoneActive(state, l as LevelId));
  const allDone = state.completedCount === 18;
  const cur = getSkill(state.currentSkill);
  const curAvailableHere = inPool && !allDone;
  const nextSkill = SKILLS.find((s) => !state.completedSkills.includes(s.id));
  const vis = dropVisual(state, viewSkill);
  const visMeta = STATUS_META[vis === 'FALLING' ? 'COMPLETED' : vis];
  const showBanner =
    ['APPROACHING_EDGE', 'CLIMBING_OUT', 'OUTSIDE_POOL'].includes(studentState) &&
    levelState(state, currentLevel) === 'COMPLETED';
  const showPanel = showBanner;

  let primary: { label: string; action: () => void } | null = null;
  if (curAvailableHere)
    primary = {
      label: skillState(state, cur.id) === 'LEARNING' ? `🔄 Continue Drop ${cur.id}` : `▶ Start Drop ${cur.id}`,
      action: () => openSkill(cur.id),
    };
  else if (studentState === 'OUTSIDE_POOL' && !allDone)
    primary = { label: '▶ Continue practising', action: continueLevel };
  else if (studentState === 'OUTSIDE_POOL' && allDone && !state.finalJourneyComplete)
    primary = { label: '🌿 Start Pond Journey', action: startPond };
  else if (state.finalJourneyComplete)
    primary = { label: '💧 Review Drop 18', action: () => reviewSkill(18) };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,#d6f3ff_0%,#eaf8ff_45%,#f5fbff_100%)] pb-40 font-sans">
      <AppHeader
        student={student}
        section="pool"
        onNavigate={onNavigate}
        locked={uiLocked}
        extra={
          <>
            <span
              className={cn(
                'hidden rounded-full px-3 py-1.5 text-xs font-extrabold lg:inline',
                uiLocked ? 'bg-amber-100 text-amber-800' : 'bg-sky-50 text-sky-700'
              )}
            >
              🏊 {STATE_LABEL[studentState]}
              {uiLocked ? ' · ⏳' : ''}
            </span>
            <button
              onClick={reset}
              disabled={uiLocked}
              className="min-h-11 rounded-full bg-slate-100 px-3 text-sm font-bold text-slate-500 transition hover:bg-slate-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-cyan-200 disabled:opacity-50 cursor-pointer"
              aria-label="Reset my Pool progress"
            >
              ↺ <span className="hidden md:inline">Reset</span>
            </button>
          </>
        }
      />

      <main className="mx-auto max-w-6xl px-3 sm:px-6">
        <section className="pb-4 pt-6 text-center sm:pt-8">
          <p className="text-xs font-extrabold uppercase tracking-[0.3em] text-sky-500">
            Aqua Slash Journey · Stage 2
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold uppercase leading-tight text-[#06214a] sm:text-5xl">
            🏊 Pool
          </h1>
          <p className="mt-1 font-display text-lg font-medium text-sky-600 sm:text-xl">
            Swimming Foundation · One drop at a time 💧
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs font-extrabold uppercase tracking-wider sm:text-sm">
            <span className="rounded-full bg-white px-3 py-1 text-sky-700 shadow-sm">
              💧 L1 Water Control
            </span>
            <span className="text-sky-400">→</span>
            <span className="rounded-full bg-white px-3 py-1 text-indigo-700 shadow-sm">
              🦵 L2 Kick & Body Movement
            </span>
            <span className="text-sky-400">→</span>
            <span className="rounded-full bg-white px-3 py-1 text-teal-700 shadow-sm">
              🏊 L3 Basic Stroke Coordination
            </span>
          </div>
          <p className="mx-auto mt-2 max-w-xl text-sm font-semibold text-slate-500">
            {poolBetaComplete(state)
              ? `🏆 Pool Levels 1–${poolConfig.activeLevels} complete!`
              : `Pool progress: ${
                  state.completedSkills.filter((n) => n <= poolConfig.activeLevels * 6).length
                }/${poolConfig.activeLevels * 6} skills`}
            <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black uppercase text-emerald-700">
              💧 Any drop, any order
            </span>
          </p>
        </section>

        {state.finalJourneyComplete && !uiLocked && (
          <div className="mb-3 flex justify-center">
            <div className="flex gap-1 rounded-2xl bg-white p-1.5 shadow-sm" role="tablist" aria-label="Scene">
              {[
                { on: !reviewing, label: '🌊 Pond', act: () => setReviewing(false) },
                { on: reviewing, label: '🏊 Review skills in pool', act: () => setReviewing(true) },
              ].map((b) => (
                <button
                  key={b.label}
                  role="tab"
                  aria-selected={b.on}
                  onClick={b.act}
                  className={cn(
                    'min-h-10 rounded-xl px-3 text-sm font-extrabold cursor-pointer',
                    b.on ? 'bg-[#06214a] text-white' : 'text-slate-500 hover:bg-slate-100'
                  )}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={poolRef} className="scroll-mt-20">
          <PoolScene
            skillId={viewSkill}
            mode={mode}
            studentState={studentState}
            level={currentLevel}
            poolComplete={allDone}
            activeDrop={activeDrop}
            settled={settled}
            completedCount={state.completedCount}
            milestones={milestones}
            onDropSettled={onDropSettled}
            onStudentStep={onStudentStep}
            soundOn={soundOn}
            top={<DropRail state={state} viewSkill={viewSkill} disabled={uiLocked} onPick={preview} />}
            status={
              <span className={cn('rounded-full px-3 py-1 text-[10px] font-extrabold shadow sm:text-xs', visMeta.chip)}>
                {visMeta.icon} {vis === 'FALLING' ? 'Drop falling' : visMeta.label}
              </span>
            }
            banner={showBanner ? <LevelBanner level={currentLevel} /> : undefined}
            panel={
              showPanel ? (
                <LevelCompletePanel
                  level={currentLevel}
                  studentState={studentState}
                  uiLocked={uiLocked}
                  onContinue={continueLevel}
                  onStartPond={startPond}
                  onJourney={() => onNavigate('home')}
                />
              ) : undefined
            }
          />
        </div>

        {view.type === 'skill' ? (
          <div className="mt-6">
            <SkillPage
              id={view.id}
              state={state}
              dispatch={dispatch}
              soundOn={soundOn}
              onBack={() => {
                setView({ type: 'journey' });
                dispatch({ type: 'SKILL_CLOSED' });
                requestAnimationFrame(() =>
                  skillsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                );
              }}
              onComplete={completeSkill}
            />
          </div>
        ) : (
          <>
            <section className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Where am I">
              <div className="rounded-3xl bg-white p-4 shadow-sm">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-sky-500">📍 Where am I?</p>
                <p className="mt-1 font-display text-lg font-semibold leading-tight">
                  {state.finalJourneyComplete
                    ? '🌊 In the pond — journey complete'
                    : `Pool Level ${currentLevel} — ${getLevel(currentLevel).name}`}
                </p>
                <p className="text-sm text-slate-500">
                  {levelCount(state, currentLevel)}/6 drops · Level {levelState(state, currentLevel).toLowerCase()} ·{' '}
                  {STATE_LABEL[studentState].toLowerCase()}
                </p>
              </div>
              <div className="rounded-3xl bg-white p-4 shadow-sm ring-2 ring-amber-200">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-amber-600">🎯 Suggested next</p>
                <p className="mt-1 font-display text-lg font-semibold leading-tight">
                  {allDone ? '🏆 All 18 skills' : `Drop ${cur.id} — ${cur.name}`}
                </p>
                <p className="text-sm text-slate-500">
                  {allDone ? 'Review any drop anytime' : `${STATUS_META[skillState(state, cur.id)].label} — or pick any other drop`}
                </p>
              </div>
              <div className="rounded-3xl bg-white p-4 shadow-sm">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-sky-500">⏭ What's left?</p>
                <p className="mt-1 font-display text-lg font-semibold leading-tight">
                  {nextSkill
                    ? `Drop ${nextSkill.id} — ${nextSkill.name}`
                    : allDone
                    ? state.finalJourneyComplete
                      ? 'Keep practising!'
                      : '🌊 Jump to the pond'
                    : 'Final drop 🏊'}
                </p>
                <p className="text-sm text-slate-500">{nextSkill ? `Pool Level ${nextSkill.level}` : 'Pool Level complete'}</p>
              </div>
              <div className="flex flex-col rounded-3xl bg-gradient-to-br from-sky-500 to-cyan-500 p-4 text-white shadow-md">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-white/80">🔁 What do I practise?</p>
                <p className="mt-1 text-sm font-bold leading-snug">{allDone ? 'Freestyle & backstroke 15 m' : cur.practice.task}</p>
                {primary && (
                  <button
                    onClick={primary.action}
                    disabled={uiLocked}
                    className="mt-auto min-h-11 rounded-2xl bg-white px-3 py-2 text-sm font-extrabold uppercase tracking-wide text-sky-700 shadow transition hover:-translate-y-0.5 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/60 disabled:opacity-60 cursor-pointer"
                  >
                    {uiLocked ? '⏳ Animation playing…' : primary.label}
                  </button>
                )}
              </div>
            </section>

            <section ref={levelsRef} className="mt-10 scroll-mt-20" aria-labelledby="levels-title">
              <div className="mb-4 text-center">
                <p className="text-xs font-extrabold uppercase tracking-[0.3em] text-sky-500">
                  3 Pool Levels · 18 Skills · 18 Drops · open order
                </p>
                <h2 id="levels-title" className="font-display text-2xl font-semibold uppercase text-[#06214a] sm:text-3xl">
                  Choose your Pool Level
                </h2>
              </div>
              <LevelCards state={state} selected={selectedLevel} onSelect={selectLevel} />
            </section>

            <section ref={skillsRef} className="mt-10 scroll-mt-20" aria-labelledby="skills-title">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.3em] text-sky-500">
                    {getLevel(selectedLevel).emoji} Pool Level {selectedLevel} · {levelState(state, selectedLevel)}
                  </p>
                  <h2 id="skills-title" className="font-display text-2xl font-semibold uppercase text-[#06214a] sm:text-3xl">
                    {getLevel(selectedLevel).name}
                  </h2>
                </div>
                <div className="flex gap-1.5 rounded-2xl bg-white p-1.5 shadow-sm" role="tablist" aria-label="Pool levels">
                  {([1, 2, 3] as LevelId[]).map((l) => {
                    const lockedLevel = levelState(state, l) === 'LOCKED';
                    return (
                      <button
                        key={l}
                        role="tab"
                        aria-selected={selectedLevel === l}
                        disabled={lockedLevel || uiLocked}
                        onClick={() => selectLevel(l)}
                        className={cn(
                          'min-h-10 rounded-xl px-3 text-sm font-extrabold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 disabled:cursor-not-allowed cursor-pointer',
                          selectedLevel === l ? 'bg-[#06214a] text-white' : 'text-slate-500 hover:bg-slate-100',
                          lockedLevel && 'opacity-50'
                        )}
                      >
                        {getLevel(l).milestoneIcon} L{l}
                        {lockedLevel && ' 🔒'}
                      </button>
                    );
                  })}
                </div>
              </div>
              <SkillCards level={selectedLevel} state={state} onOpen={openSkill} onReview={reviewSkill} onPreview={preview} />
            </section>

            <section className="mt-10 flex flex-col items-center gap-3 rounded-[28px] bg-white p-5 text-center shadow-sm ring-1 ring-sky-100 sm:flex-row sm:text-left">
              <span className="text-3xl" aria-hidden>
                💬
              </span>
              <p className="flex-1 font-bold text-slate-600">
                How is your swimming learning going? Share your feedback with Aqua Slash.
              </p>
              <button
                onClick={() => onNavigate('profile')}
                disabled={uiLocked}
                className="min-h-12 rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-500 px-5 font-extrabold uppercase text-white shadow disabled:opacity-50 cursor-pointer"
              >
                Give Feedback →
              </button>
            </section>

            {showDev && <DevPanel state={state} />}

            <footer className="mt-10 text-center text-xs font-semibold text-slate-400">
              Aqua Slash Swim Book · Always swim with a qualified instructor or supervising adult.
            </footer>
          </>
        )}
      </main>

      <ProgressJourney completedCount={state.completedCount} settled={settled} milestones={milestones} />
      {finalModal && (
        <FinalCelebration
          onBack={() => closeFinal(false)}
          onJourney={() => closeFinal(true)}
          onFeedback={() => {
            setFinalModal(false);
            dispatch({ type: 'FINAL_CELEBRATION_DISMISSED' });
            onNavigate('profile');
          }}
        />
      )}
    </div>
  );
}
