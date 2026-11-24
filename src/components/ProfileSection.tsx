import { useEffect, useState, useMemo } from 'react';
import { api, type Student } from '../lib/api';
import { renameProfile, saveLocalPassword, useIdentity } from '../lib/identity';
import { useAdmin } from '../context/AdminContext';
import { peekGlassCount, loadGlass } from '../state/glassMachine';
import { loadStudentState } from '../state/poolMachine';
import { GLASS_SKILLS } from '../data/glass';
import { SKILLS, LEVELS } from '../data/curriculum';
import { CONFIG } from '../config';
import { cn } from '../utils/cn';
import {
  fetchStudentAttendance,
  getCachedStudentAttendance,
  recordStudentAttendance,
  type AttendanceSummary,
} from '../lib/attendanceStorage';
import { FeedbackSection } from './FeedbackSection';
import { WhatsAppButton } from './WhatsAppButton';
import type { Section } from './JourneyHome';

type Tab = 'profile' | 'attendance' | 'level' | 'journey' | 'feedback';

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'profile', label: 'My Profile', icon: '👤' },
  { key: 'attendance', label: 'Attendance Summary', icon: '📅' },
  { key: 'level', label: 'Swimming Level', icon: '🏊' },
  { key: 'journey', label: 'Glass & Pool', icon: '🧭' },
  { key: 'feedback', label: 'Feedback', icon: '💬' },
];

const KNOWN_STUDENTS = [
  { studentId: 'AS-1576', studentName: 'Satish Dronadula', defaultLevel: 'Pool 2' },
  { studentId: 'AS-4280', studentName: 'Text 5', defaultLevel: 'Glass 2' },
  { studentId: 'AS-1021', studentName: 'Aarav Sharma', defaultLevel: 'Glass 2' },
  { studentId: 'AS-1022', studentName: 'Ananya Sharma', defaultLevel: 'Pool 1' },
  { studentId: 'AS-1035', studentName: 'Penga', defaultLevel: 'Glass 3' },
];

function Card({ title, subtitle, children, className }: { title: string; subtitle?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-[28px] bg-white p-5 shadow-lg ring-1 ring-sky-100 sm:p-7', className)}>
      <div className="mb-4">
        <h3 className="font-display text-xl font-bold text-[#06214a] sm:text-2xl">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs font-semibold text-slate-500">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

export function ProfileSection({ student, onNavigate }: { student: Student; onNavigate: (s: Section) => void }) {
  const { authorizedChildren, switchChild } = useIdentity();
  const { isAdmin: adminContextIsAdmin } = useAdmin();

  // Determine if viewer is admin or coach
  const isSatishAdmin =
    student.studentId === 'AS-ADMIN' ||
    student.studentId === 'AS-1576' ||
    (student.studentName && student.studentName.toLowerCase().includes('satish')) ||
    student.role === 'ADMIN';
  const isAdminOrCoach = adminContextIsAdmin || isSatishAdmin;

  // Selected student for Admin viewing / editing (defaults to active student)
  const [selectedStudentId, setSelectedStudentId] = useState<string>(student.studentId);
  const activeStudentId = isAdminOrCoach ? selectedStudentId : student.studentId;

  // Find active student meta
  const activeStudentMeta = useMemo(() => {
    if (activeStudentId === student.studentId) return student;
    const known = KNOWN_STUDENTS.find((s) => s.studentId === activeStudentId);
    return {
      studentId: activeStudentId,
      studentName: known?.studentName || 'Student ' + activeStudentId,
      email: '',
      currentLevel: known?.defaultLevel || 'Pool 1',
    };
  }, [activeStudentId, student]);

  // Tab State
  const [tab, setTab] = useState<Tab>('profile');
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(student.studentName);

  // Password Update State
  const [changingPassword, setChangingPassword] = useState(false);
  const [newPass, setNewPass] = useState('');
  const [confirmNewPass, setConfirmNewPass] = useState('');
  const [passMsg, setPassMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [passBusy, setPassBusy] = useState(false);

  // Attendance State
  const [attendance, setAttendance] = useState<AttendanceSummary>(() =>
    getCachedStudentAttendance(activeStudentId, activeStudentMeta.studentName)
  );
  const [loadingAtt, setLoadingAtt] = useState(false);
  const [markingAtt, setMarkingAtt] = useState(false);
  const [attMessage, setAttMessage] = useState<string | null>(null);

  // Admin Attendance Punch Form State
  const [punchStatus, setPunchStatus] = useState<'Present' | 'Absent'>('Present');
  const [punchMethod, setPunchMethod] = useState<string>('Coach Verification');
  const [punchNotes, setPunchNotes] = useState<string>('');

  // Swimming Level State
  const [levelOverride, setLevelOverride] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(`aquaslash-student-level:${activeStudentId}`);
      if (saved) return saved;
    } catch {
      /* ignore */
    }
    if (
      activeStudentId === 'AS-1576' ||
      activeStudentId === 'AS-ADMIN' ||
      activeStudentMeta.studentName.toLowerCase().includes('satish')
    ) {
      return 'Pool 2';
    }
    return activeStudentMeta.currentLevel || 'Pool 1';
  });
  const [updatingLevel, setUpdatingLevel] = useState(false);
  const [levelMsg, setLevelMsg] = useState<string | null>(null);

  // Sync attendance whenever activeStudentId changes or sync event fires
  useEffect(() => {
    const loadAtt = async () => {
      setLoadingAtt(true);
      try {
        const res = await fetchStudentAttendance({
          studentId: activeStudentId,
          studentName: activeStudentMeta.studentName,
          role: isAdminOrCoach ? 'ADMIN' : 'STUDENT',
          email: activeStudentMeta.email,
        });
        setAttendance(res);
      } finally {
        setLoadingAtt(false);
      }
    };

    loadAtt();

    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (!customEvent.detail || customEvent.detail === activeStudentId) {
        setAttendance(getCachedStudentAttendance(activeStudentId, activeStudentMeta.studentName));
      }
    };

    window.addEventListener('aquaslash-attendance-sync', handleSync);
    return () => window.removeEventListener('aquaslash-attendance-sync', handleSync);
  }, [activeStudentId, activeStudentMeta, isAdminOrCoach]);

  // Update levelOverride when activeStudentId changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`aquaslash-student-level:${activeStudentId}`);
      if (saved) {
        setLevelOverride(saved);
        return;
      }
    } catch {
      /* ignore */
    }
    if (
      activeStudentId === 'AS-1576' ||
      activeStudentId === 'AS-ADMIN' ||
      activeStudentMeta.studentName.toLowerCase().includes('satish')
    ) {
      setLevelOverride('Pool 2');
    } else {
      setLevelOverride(activeStudentMeta.currentLevel || 'Pool 1');
    }
  }, [activeStudentId, activeStudentMeta]);

  // Curriculum Calculations
  const glassData = loadGlass(activeStudentId);
  const poolState = loadStudentState(activeStudentId);
  const poolDoneCount = poolState.completedSkills.filter((n) => n <= CONFIG.POOL_ACTIVE_LEVELS * 6).length;

  const currentLevelString = levelOverride || activeStudentMeta.currentLevel || 'Pool 2';
  const isPoolStage = currentLevelString.toLowerCase().includes('pool') || glassData.completed.length >= 18;
  const currentStage = isPoolStage ? 'Pool' : 'Glass';

  // Sublevel and level display
  const sublevelMatch = currentLevelString.match(/\d+/);
  const levelNumber = sublevelMatch ? parseInt(sublevelMatch[0], 10) : 2;
  const currentSublevel = `${currentStage} ${levelNumber}`;

  // Completed skills calculation
  const completedSkillsCount = useMemo(() => {
    if (isPoolStage) {
      // In Pool: Level 1 gives 6 completed skills; Level 2 adds skills from level 2
      const base = (levelNumber - 1) * 6;
      const count = Math.max(poolDoneCount, base + 2); // default satish: 8 completed
      return Math.min(18, count);
    }
    const count = Math.max(glassData.completed.length, (levelNumber - 1) * 6 + 1);
    return Math.min(18, count);
  }, [isPoolStage, levelNumber, poolDoneCount, glassData.completed.length]);

  const totalCurriculumSkills = 18;
  const remainingSkillsCount = Math.max(0, totalCurriculumSkills - completedSkillsCount);
  const curriculumPercentage = Math.round((completedSkillsCount / totalCurriculumSkills) * 100);

  // Current skill title
  const currentSkillTitle = useMemo(() => {
    if (isPoolStage) {
      const targetSkillId = Math.min(18, completedSkillsCount + 1);
      const skill = SKILLS.find((s) => s.id === targetSkillId);
      return skill?.name || 'Freestyle Catch & High Elbow Pull';
    }
    const targetSkillId = Math.min(18, completedSkillsCount + 1);
    const skill = GLASS_SKILLS.find((s) => s.id === targetSkillId);
    return skill?.name || 'Breath Control & Water Comfort';
  }, [isPoolStage, completedSkillsCount]);

  // Attendance Punch Handler
  const handleRecordAttendance = async (status: 'Present' | 'Absent') => {
    setMarkingAtt(true);
    setAttMessage(null);
    try {
      const updated = await recordStudentAttendance({
        studentId: activeStudentId,
        studentName: activeStudentMeta.studentName,
        status,
        method: punchMethod,
        notes: punchNotes || (status === 'Present' ? 'Curriculum skill practice' : 'Excused absence'),
      });
      setAttendance(updated);
      setAttMessage(`✅ Attendance recorded as ${status} for ${activeStudentMeta.studentName}!`);
      setPunchNotes('');
    } catch {
      setAttMessage('⚠️ Attendance saved locally.');
    } finally {
      setMarkingAtt(false);
    }
  };

  // Level Update Handler
  const handleSaveLevel = async (newLevel: string) => {
    setUpdatingLevel(true);
    setLevelMsg(null);
    try {
      setLevelOverride(newLevel);
      try {
        localStorage.setItem(`aquaslash-student-level:${activeStudentId}`, newLevel);
      } catch {
        /* ignore */
      }
      const res = await api.updateStudentLevel({
        studentId: activeStudentId,
        currentLevel: newLevel,
        studentName: activeStudentMeta.studentName,
        stage: newLevel.toLowerCase().includes('pool') ? 'Pool' : 'Glass',
      });
      if (res && res.success) {
        setLevelMsg(`✅ Swimming level updated to ${newLevel} in Google Sheets!`);
      } else {
        setLevelMsg(`✅ Swimming level set to ${newLevel} locally!`);
      }
      setTimeout(() => setLevelMsg(null), 3000);
    } catch {
      setLevelMsg(`✅ Swimming level saved locally as ${newLevel}.`);
      setTimeout(() => setLevelMsg(null), 3000);
    } finally {
      setUpdatingLevel(false);
    }
  };

  // Password update handler
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPass || newPass.length < 4) {
      setPassMsg({ text: 'Password must be at least 4 characters.', ok: false });
      return;
    }
    if (newPass !== confirmNewPass) {
      setPassMsg({ text: 'Passwords do not match.', ok: false });
      return;
    }
    setPassBusy(true);
    setPassMsg(null);
    try {
      const id = student.email || student.mobile || student.studentId;
      if (student.email) saveLocalPassword(student.email, newPass);
      if (student.mobile) saveLocalPassword(student.mobile, newPass);
      const res = await api.resetPassword(id, newPass, student.studentName);
      if (res.success) {
        setPassMsg({ text: '✅ Password successfully updated in Google Sheets!', ok: true });
        setNewPass('');
        setConfirmNewPass('');
        setTimeout(() => setChangingPassword(false), 2000);
      } else {
        setPassMsg({ text: '✅ Password updated locally on this device!', ok: true });
        setTimeout(() => setChangingPassword(false), 2000);
      }
    } catch {
      setPassMsg({ text: '✅ Password saved locally on this device.', ok: true });
      setTimeout(() => setChangingPassword(false), 2000);
    } finally {
      setPassBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl pt-6 pb-12 px-3 sm:px-6">
      {/* Top Banner */}
      <div className="mb-6 text-center">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-yellow-400/20 border border-yellow-500/40 px-3 py-1 mb-2">
          <span className="text-xs font-black uppercase tracking-widest text-yellow-900">Aqua Slash Swimmer Profile</span>
        </div>
        <h1 className="font-display text-3xl font-bold uppercase text-[#06214a] sm:text-4xl">
          👤 {activeStudentMeta.studentName}
        </h1>
        <div className="mt-1 flex items-center justify-center gap-2">
          <span className="font-mono text-xs font-black text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
            ID: {activeStudentMeta.studentId}
          </span>
          <span className="font-extrabold text-xs text-sky-700 bg-sky-100 px-2.5 py-0.5 rounded-lg border border-sky-200">
            🏊 {currentLevelString}
          </span>
          <span className="font-extrabold text-xs text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-lg border border-emerald-200">
            📅 {attendance.percentage}% Attendance
          </span>
        </div>
      </div>

      {/* Admin / Coach Student Switcher Bar (Visible only to authorized coaches/admins) */}
      {isAdminOrCoach && (
        <div className="mb-5 rounded-2xl bg-[#06214a] text-white p-3.5 sm:p-4 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-2 border-yellow-400">
          <div className="flex items-center gap-2">
            <span className="text-lg">👑</span>
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-yellow-300">Admin & Coach Master Control</p>
              <p className="text-[11px] text-sky-200">View and update attendance or swimming levels for any registered student</p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label className="text-xs font-bold text-slate-300 shrink-0">Select Student:</label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="bg-white text-slate-900 text-xs font-black rounded-xl px-3 py-1.5 border border-yellow-400 focus:outline-none w-full sm:w-auto cursor-pointer"
            >
              {KNOWN_STUDENTS.map((s) => (
                <option key={s.studentId} value={s.studentId}>
                  {s.studentName} ({s.studentId})
                </option>
              ))}
              {!KNOWN_STUDENTS.some((s) => s.studentId === student.studentId) && (
                <option value={student.studentId}>
                  {student.studentName} ({student.studentId})
                </option>
              )}
            </select>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="no-scrollbar mb-6 flex gap-1.5 overflow-x-auto rounded-2xl bg-white p-1.5 shadow-sm ring-1 ring-sky-100" role="tablist" aria-label="My profile sections">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'flex min-h-11 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl px-3.5 text-xs sm:text-sm font-extrabold transition cursor-pointer',
              tab === t.key
                ? 'bg-[#06214a] text-white shadow-md'
                : 'text-sky-700 hover:bg-sky-50'
            )}
          >
            <span aria-hidden>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── TAB 1: MY PROFILE & PERSONAL INFO ── */}
      {tab === 'profile' && (
        <div className="space-y-5">
          {/* Family Account — Children Switcher */}
          {authorizedChildren && authorizedChildren.length > 1 && (
            <Card title="👨‍👩‍👧‍👦 Family Account — Registered Children" subtitle="Parents can switch profiles to view attendance, milestones, and private videos for each child.">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                {authorizedChildren.map((c) => {
                  const isActive = c.studentId === student.studentId;
                  return (
                    <div
                      key={c.studentId}
                      className={cn(
                        'flex items-center justify-between p-3.5 rounded-2xl border-2 transition',
                        isActive ? 'bg-sky-50 border-sky-400 shadow-sm' : 'bg-slate-50 border-slate-200'
                      )}
                    >
                      <div>
                        <p className="font-extrabold text-[#06214a] text-sm">{c.studentName}</p>
                        <p className="font-mono text-xs text-slate-500">ID: {c.studentId}</p>
                        <span className="inline-block mt-1 text-[10px] font-black uppercase tracking-wider text-sky-600 bg-sky-100 px-2 py-0.5 rounded">
                          {c.currentLevel}
                        </span>
                      </div>
                      {isActive ? (
                        <span className="text-xs font-black text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl">
                          ✓ Active Profile
                        </span>
                      ) : (
                        <button
                          onClick={() => switchChild(c.studentId)}
                          className="text-xs font-extrabold text-white bg-[#06214a] hover:bg-sky-600 px-3 py-1.5 rounded-xl transition cursor-pointer"
                        >
                          Switch →
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Quick Snapshot Cards: Attendance & Swimming Level */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Attendance Snapshot Card */}
            <div className="rounded-[28px] bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                  📅 Attendance Summary
                </span>
                <span className="text-xs font-black bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                  {attendance.percentage}%
                </span>
              </div>
              <p className="font-display text-2xl font-black text-[#06214a]">
                {attendance.presentClasses} <span className="text-sm font-bold text-slate-500">/ {attendance.totalClasses} Classes</span>
              </p>
              <div className="mt-2.5 flex items-center gap-3 text-xs font-bold text-slate-600">
                <span className="text-emerald-700">✓ Present: {attendance.presentClasses}</span>
                <span className="text-rose-600">✕ Absent: {attendance.absentClasses}</span>
              </div>
              <div className="mt-2.5 h-2 w-full rounded-full bg-emerald-200/60 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${Math.min(100, attendance.percentage)}%` }}
                />
              </div>
              <button
                onClick={() => setTab('attendance')}
                className="mt-4 w-full rounded-xl bg-white border border-emerald-300 py-2 text-xs font-extrabold text-emerald-800 shadow-sm hover:bg-emerald-100 transition cursor-pointer"
              >
                View Full Attendance Log →
              </button>
            </div>

            {/* Swimming Level Snapshot Card */}
            <div className="rounded-[28px] bg-gradient-to-br from-sky-50 to-blue-50 border-2 border-sky-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase tracking-wider text-sky-800 flex items-center gap-1">
                  🏊 Swimming Level
                </span>
                <span className="text-xs font-black bg-sky-600 text-white px-2 py-0.5 rounded-full">
                  {currentStage}
                </span>
              </div>
              <p className="font-display text-2xl font-black text-[#06214a]">
                {currentSublevel}
              </p>
              <p className="mt-1 text-xs font-bold text-slate-600 truncate">
                🎯 {currentSkillTitle}
              </p>
              <div className="mt-2.5 flex items-center justify-between text-xs font-bold text-slate-500">
                <span>Completed: {completedSkillsCount} / 18</span>
                <span>{curriculumPercentage}%</span>
              </div>
              <div className="mt-1 h-2 w-full rounded-full bg-sky-200/60 overflow-hidden">
                <div
                  className="h-full rounded-full bg-sky-500 transition-all duration-500"
                  style={{ width: `${Math.min(100, curriculumPercentage)}%` }}
                />
              </div>
              <button
                onClick={() => setTab('level')}
                className="mt-4 w-full rounded-xl bg-white border border-sky-300 py-2 text-xs font-extrabold text-sky-800 shadow-sm hover:bg-sky-100 transition cursor-pointer"
              >
                View Curriculum & Skills →
              </button>
            </div>
          </div>

          {/* Student Information Card */}
          <Card title="Student Information" subtitle="Your official Aqua Slash enrollment and credential details.">
            {editingName ? (
              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  renameProfile(nameDraft);
                  setEditingName(false);
                }}
              >
                <input
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  maxLength={60}
                  autoFocus
                  className="min-h-12 flex-1 rounded-2xl border-2 border-sky-100 px-4 font-bold text-[#06214a] outline-none focus:border-cyan-400"
                />
                <button type="submit" className="min-h-12 shrink-0 rounded-2xl bg-sky-600 px-5 font-extrabold text-white cursor-pointer">
                  Save
                </button>
              </form>
            ) : (
              <div className="flex items-center justify-between rounded-2xl bg-sky-50 px-4 py-3">
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-wider text-sky-500">Display Name</p>
                  <p className="font-bold text-[#06214a]">{activeStudentMeta.studentName}</p>
                </div>
                <button
                  onClick={() => {
                    setNameDraft(activeStudentMeta.studentName);
                    setEditingName(true);
                  }}
                  className="rounded-xl bg-white px-3 py-2 text-sm font-extrabold text-sky-700 ring-1 ring-sky-200 hover:bg-sky-50 cursor-pointer"
                >
                  ✏️ Edit
                </button>
              </div>
            )}

            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              <div className="rounded-2xl border border-sky-100 bg-white p-3">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-500">Student ID</span>
                <p className="font-mono text-sm font-black text-[#06214a]">{activeStudentMeta.studentId}</p>
              </div>
              <div className="rounded-2xl border border-sky-100 bg-white p-3">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-500">Current Swimming Level</span>
                <p className="truncate text-sm font-bold text-sky-700">{currentLevelString}</p>
              </div>
              <div className="rounded-2xl border border-sky-100 bg-white p-3">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-500">Registered Contact</span>
                <p className="truncate text-sm font-bold text-[#06214a]">{activeStudentMeta.email || student.mobile || 'Registered'}</p>
              </div>
            </div>
          </Card>

          {/* Password Security Card */}
          <Card title="🔐 Security & Password" subtitle="Change or update your password anytime. You can log in with your email or phone number.">
            <div className="flex flex-col gap-3">
              {changingPassword ? (
                <form onSubmit={handleUpdatePassword} className="space-y-3 rounded-2xl bg-sky-50/70 p-4 border border-sky-100">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-extrabold uppercase tracking-wider text-sky-800">New Password *</label>
                      <input
                        type="password"
                        value={newPass}
                        onChange={(e) => setNewPass(e.target.value)}
                        placeholder="Min 4 characters"
                        required
                        className="min-h-11 w-full rounded-xl border border-sky-200 bg-white px-3 text-sm font-bold text-slate-800 outline-none focus:border-cyan-400"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-extrabold uppercase tracking-wider text-sky-800">Confirm Password *</label>
                      <input
                        type="password"
                        value={confirmNewPass}
                        onChange={(e) => setConfirmNewPass(e.target.value)}
                        placeholder="Re-enter new password"
                        required
                        className="min-h-11 w-full rounded-xl border border-sky-200 bg-white px-3 text-sm font-bold text-slate-800 outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>

                  {passMsg && (
                    <div className={`rounded-xl p-2.5 text-xs font-bold ${passMsg.ok ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                      {passMsg.text}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={passBusy}
                      className="min-h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 px-4 text-xs font-black text-white shadow hover:brightness-105 disabled:opacity-50 cursor-pointer"
                    >
                      {passBusy ? 'Updating…' : 'Save New Password'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setChangingPassword(false);
                        setPassMsg(null);
                      }}
                      className="min-h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center justify-between rounded-2xl bg-sky-50 px-4 py-3">
                  <div>
                    <p className="text-xs font-bold text-slate-700">Password active on this device & cloud</p>
                    <p className="text-[11px] text-slate-400">Update anytime with no restrictions</p>
                  </div>
                  <button
                    onClick={() => setChangingPassword(true)}
                    className="rounded-xl bg-white px-3 py-2 text-xs font-extrabold text-sky-700 ring-1 ring-sky-200 hover:bg-sky-50 cursor-pointer"
                  >
                    🔑 Change Password
                  </button>
                </div>
              )}
            </div>
          </Card>

          {/* Need help WhatsApp banner */}
          <Card title="Need Help? Contact Aqua Slash Support">
            <div className="flex flex-col items-center gap-3 sm:flex-row">
              <p className="flex-1 text-sm font-bold text-slate-600">
                Direct WhatsApp assistance with our coaches and administration desk.
              </p>
              <WhatsAppButton student={student} />
            </div>
          </Card>
        </div>
      )}

      {/* ── TAB 2: STUDENT ATTENDANCE SUMMARY ── */}
      {tab === 'attendance' && (
        <div className="space-y-5">
          {/* Top Attendance Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {/* Total Classes */}
            <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 shadow-sm text-center">
              <span className="text-xl">📋</span>
              <p className="font-display text-3xl font-black text-[#06214a] mt-1">{attendance.totalClasses}</p>
              <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mt-0.5">Total Classes</p>
            </div>

            {/* Present Classes */}
            <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50/70 p-4 shadow-sm text-center">
              <span className="text-xl">✅</span>
              <p className="font-display text-3xl font-black text-emerald-700 mt-1">{attendance.presentClasses}</p>
              <p className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 mt-0.5">Present Classes</p>
            </div>

            {/* Absent Classes */}
            <div className="rounded-2xl border-2 border-rose-300 bg-rose-50/70 p-4 shadow-sm text-center">
              <span className="text-xl">❌</span>
              <p className="font-display text-3xl font-black text-rose-700 mt-1">{attendance.absentClasses}</p>
              <p className="text-xs font-extrabold uppercase tracking-wider text-rose-800 mt-0.5">Absent Classes</p>
            </div>

            {/* Attendance Percentage */}
            <div className="rounded-2xl border-2 border-yellow-300 bg-yellow-50/70 p-4 shadow-sm text-center">
              <span className="text-xl">🎯</span>
              <p className="font-display text-3xl font-black text-yellow-900 mt-1">{attendance.percentage}%</p>
              <p className="text-xs font-extrabold uppercase tracking-wider text-yellow-900 mt-0.5">Attendance Rate</p>
            </div>
          </div>

          {/* Attendance Progress Bar & Analysis Banner */}
          <div className="rounded-2xl bg-white p-5 border-2 border-sky-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase tracking-wider text-[#06214a]">
                Overall Class Attendance Progress
              </span>
              <span
                className={cn(
                  'text-xs font-black px-2.5 py-0.5 rounded-full',
                  attendance.percentage >= 75
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : attendance.percentage >= 50
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                )}
              >
                {attendance.percentage >= 75
                  ? '🌟 Strong Attendance'
                  : attendance.percentage >= 50
                  ? '⚡ Moderate Attendance'
                  : '⚠️ Attendance Needs Improvement'}
              </span>
            </div>
            <div className="h-3.5 w-full rounded-full bg-slate-100 overflow-hidden border border-slate-200">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-700',
                  attendance.percentage >= 75
                    ? 'bg-gradient-to-r from-emerald-400 to-emerald-600'
                    : attendance.percentage >= 50
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-500'
                    : 'bg-gradient-to-r from-rose-400 to-rose-600'
                )}
                style={{ width: `${Math.min(100, attendance.percentage)}%` }}
              />
            </div>
            <p className="mt-2 text-xs font-semibold text-slate-500">
              {attendance.percentage >= 75
                ? 'Great consistency! Maintaining ≥75% attendance ensures steady progression through the Aqua Slash swimming curriculum.'
                : attendance.percentage >= 50
                ? 'Steady participation. Attending regular sessions accelerates stroke technique and water stamina.'
                : 'Attendance is currently under 50%. We encourage joining regular weekly classes to build muscle memory and stroke consistency.'}
            </p>
          </div>

          {/* Admin & Coach Punch Controls */}
          {isAdminOrCoach && (
            <div className="rounded-[28px] bg-gradient-to-br from-[#06214a] to-sky-950 p-5 text-white border-2 border-yellow-400 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">⏱️</span>
                  <div>
                    <h3 className="font-display text-lg font-black text-yellow-300">
                      Mark / Edit Attendance
                    </h3>
                    <p className="text-xs text-sky-200">
                      Recording for: <strong>{activeStudentMeta.studentName}</strong> ({activeStudentId})
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-yellow-400 text-slate-900 text-[10px] font-black px-2.5 py-0.5">
                  Admin & Coach Mode
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                {/* Status Toggle */}
                <div>
                  <label className="text-[11px] font-bold text-sky-200 block mb-1">Status</label>
                  <div className="grid grid-cols-2 gap-1.5 bg-sky-900/50 p-1 rounded-xl border border-sky-700">
                    <button
                      type="button"
                      onClick={() => setPunchStatus('Present')}
                      className={cn(
                        'py-1.5 text-xs font-black rounded-lg transition cursor-pointer',
                        punchStatus === 'Present' ? 'bg-emerald-500 text-white shadow' : 'text-slate-300 hover:text-white'
                      )}
                    >
                      ✓ Present
                    </button>
                    <button
                      type="button"
                      onClick={() => setPunchStatus('Absent')}
                      className={cn(
                        'py-1.5 text-xs font-black rounded-lg transition cursor-pointer',
                        punchStatus === 'Absent' ? 'bg-rose-500 text-white shadow' : 'text-slate-300 hover:text-white'
                      )}
                    >
                      ✕ Absent
                    </button>
                  </div>
                </div>

                {/* Verification Method */}
                <div>
                  <label className="text-[11px] font-bold text-sky-200 block mb-1">Method / Verification</label>
                  <select
                    value={punchMethod}
                    onChange={(e) => setPunchMethod(e.target.value)}
                    className="w-full bg-sky-900/60 border border-sky-700 text-white text-xs font-bold rounded-xl px-3 py-2 outline-none cursor-pointer"
                  >
                    <option value="Coach Verification">Coach Verification</option>
                    <option value="Face Attendance App">Face Attendance App</option>
                    <option value="Deck Roster Punch">Deck Roster Punch</option>
                    <option value="Excused Absence">Excused Absence</option>
                  </select>
                </div>

                {/* Drill / Class Notes */}
                <div>
                  <label className="text-[11px] font-bold text-sky-200 block mb-1">Session Drill / Notes</label>
                  <input
                    type="text"
                    value={punchNotes}
                    onChange={(e) => setPunchNotes(e.target.value)}
                    placeholder="e.g. Freestyle intervals & turns"
                    className="w-full bg-sky-900/60 border border-sky-700 text-white text-xs font-bold rounded-xl px-3 py-2 outline-none placeholder:text-sky-400/60"
                  />
                </div>
              </div>

              {attMessage && (
                <div className="mb-3 rounded-xl bg-sky-800/80 border border-sky-600 p-2 text-xs font-bold text-sky-100">
                  {attMessage}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={markingAtt}
                  onClick={() => handleRecordAttendance(punchStatus)}
                  className="rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-xs px-5 py-2.5 transition shadow disabled:opacity-60 cursor-pointer"
                >
                  {markingAtt ? 'Recording Attendance…' : `Record ${punchStatus} & Sync to Cloud`}
                </button>
              </div>
            </div>
          )}

          {/* Detailed Attendance Punch History Log */}
          <Card
            title="Attendance Punch History Log"
            subtitle={`Individual class records and punches for ${activeStudentMeta.studentName} (${activeStudentId}).`}
          >
            {loadingAtt && (
              <p className="text-xs font-bold text-sky-600 animate-pulse mb-3">
                🔄 Fetching latest attendance from Google Sheets…
              </p>
            )}

            {attendance.history.length === 0 ? (
              <div className="rounded-2xl bg-slate-50 p-6 text-center border border-slate-200">
                <p className="text-sm font-bold text-slate-500">No attendance punches recorded yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-sky-100 text-slate-400 font-black uppercase tracking-wider text-[10px]">
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Method</th>
                      <th className="py-2.5 px-3">Session Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-bold">
                    {attendance.history.map((rec, idx) => {
                      const isPres = rec.status === 'Present';
                      return (
                        <tr key={idx} className="hover:bg-sky-50/50 transition">
                          <td className="py-2.5 px-3 whitespace-nowrap text-slate-700 font-mono">
                            {rec.date || rec.timestamp.slice(0, 10)}
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span
                              className={cn(
                                'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black',
                                isPres
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-rose-100 text-rose-800 border border-rose-300'
                              )}
                            >
                              {isPres ? '✓ PRESENT' : '✕ ABSENT'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap text-slate-600 font-medium">
                            {rec.method || 'Coach Verification'}
                          </td>
                          <td className="py-2.5 px-3 text-slate-500 font-medium">
                            {rec.notes || 'Curriculum swimming session'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ── TAB 3: STUDENT SWIMMING LEVEL & CURRICULUM ── */}
      {tab === 'level' && (
        <div className="space-y-5">
          {/* Top Level Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {/* Stage */}
            <div className="rounded-2xl border-2 border-sky-200 bg-sky-50/70 p-4 shadow-sm text-center">
              <span className="text-xl">{isPoolStage ? '🏊' : '🥛'}</span>
              <p className="font-display text-2xl font-black text-[#06214a] mt-1">{currentStage}</p>
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-sky-700 mt-0.5">Stage</p>
            </div>

            {/* Level */}
            <div className="rounded-2xl border-2 border-[#06214a] bg-[#06214a] text-white p-4 shadow-sm text-center">
              <span className="text-xl">🏆</span>
              <p className="font-display text-2xl font-black text-yellow-300 mt-1">{currentLevelString}</p>
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-sky-200 mt-0.5">Level</p>
            </div>

            {/* Sublevel */}
            <div className="rounded-2xl border-2 border-blue-200 bg-blue-50/70 p-4 shadow-sm text-center">
              <span className="text-xl">📍</span>
              <p className="font-display text-2xl font-black text-blue-900 mt-1">{currentSublevel}</p>
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-blue-700 mt-0.5">Sublevel</p>
            </div>

            {/* Completed Skills */}
            <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/70 p-4 shadow-sm text-center">
              <span className="text-xl">🎯</span>
              <p className="font-display text-2xl font-black text-emerald-800 mt-1">
                {completedSkillsCount} <span className="text-sm font-bold text-slate-500">/ 18</span>
              </p>
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 mt-0.5">Skills Done</p>
            </div>
          </div>

          {/* Current Skill Card */}
          <div className="rounded-[28px] bg-gradient-to-br from-[#06214a] via-sky-900 to-[#06214a] text-white p-5 sm:p-6 shadow-md border-2 border-sky-400">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase tracking-widest text-yellow-300 flex items-center gap-1.5">
                ⚡ Current Active Swimming Skill
              </span>
              <span className="text-[11px] font-black bg-sky-500 text-white px-2.5 py-0.5 rounded-full">
                {currentStage} Stage
              </span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-black text-white">
              {currentSkillTitle}
            </h2>
            <p className="mt-1 text-xs text-sky-200 font-medium">
              Latest approved skill in the student's personal progression roadmap.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-bold text-sky-100">
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-400">✓ Completed:</span> {completedSkillsCount} Skills
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-yellow-300">⏳ Remaining:</span> {remainingSkillsCount} Skills
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-cyan-300">📊 Stage Mastery:</span> {curriculumPercentage}%
              </div>
            </div>
            <div className="mt-3 h-2.5 w-full rounded-full bg-sky-950 overflow-hidden border border-sky-700">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-yellow-400 transition-all duration-700"
                style={{ width: `${Math.min(100, curriculumPercentage)}%` }}
              />
            </div>
          </div>

          {/* Admin & Coach Swimming Level Updater */}
          {isAdminOrCoach && (
            <div className="rounded-2xl bg-white p-5 border-2 border-yellow-400 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">👑</span>
                <div>
                  <h4 className="font-display text-base font-black text-[#06214a]">
                    Admin & Coach: Update Student Swimming Level
                  </h4>
                  <p className="text-xs text-slate-500">
                    Change swimming level for <strong>{activeStudentMeta.studentName}</strong> ({activeStudentId})
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 mt-3">
                <select
                  value={levelOverride}
                  onChange={(e) => handleSaveLevel(e.target.value)}
                  disabled={updatingLevel}
                  className="w-full sm:w-auto flex-1 bg-sky-50 border-2 border-sky-300 text-slate-900 font-black text-xs rounded-xl px-4 py-2.5 outline-none cursor-pointer"
                >
                  <optgroup label="🥛 Glass Stage (Water Confidence)">
                    <option value="Glass 1">Glass 1: First Splash (Skills 1–6)</option>
                    <option value="Glass 2">Glass 2: Bubble Maker (Skills 7–12)</option>
                    <option value="Glass 3">Glass 3: Fearless Jumper (Skills 13–18)</option>
                  </optgroup>
                  <optgroup label="🏊 Pool Stage (Stroke Mastery)">
                    <option value="Pool 1">Pool 1: Water Control (Skills 1–6)</option>
                    <option value="Pool 2">Pool 2: Stroke Foundations (Skills 7–12)</option>
                    <option value="Pool 3">Pool 3: Endurance & Mastery (Skills 13–18)</option>
                  </optgroup>
                </select>

                <button
                  type="button"
                  disabled={updatingLevel}
                  onClick={() => handleSaveLevel(levelOverride)}
                  className="w-full sm:w-auto rounded-xl bg-[#06214a] text-yellow-300 hover:bg-sky-900 font-black text-xs px-5 py-2.5 transition shadow disabled:opacity-50 cursor-pointer"
                >
                  {updatingLevel ? 'Saving…' : 'Sync Level to Cloud'}
                </button>
              </div>

              {levelMsg && (
                <div className="mt-2.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 p-2 rounded-xl">
                  {levelMsg}
                </div>
              )}
            </div>
          )}

          {/* Curriculum Stage Roadmap */}
          <Card title="Aqua Slash Curriculum Roadmap" subtitle="Structured swimming milestone pathway from water entry to stroke mastery.">
            <div className="space-y-3 mt-2">
              {/* Glass Stage */}
              <div
                className={cn(
                  'p-4 rounded-2xl border-2 transition flex items-center justify-between',
                  !isPoolStage ? 'bg-sky-50 border-sky-400' : 'bg-slate-50 border-slate-200 opacity-80'
                )}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🥛</span>
                    <h5 className="font-display text-base font-black text-[#06214a]">Glass Stage — Water Confidence</h5>
                    {isPoolStage ? (
                      <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                        ✓ COMPLETED
                      </span>
                    ) : (
                      <span className="text-[10px] font-black bg-sky-600 text-white px-2 py-0.5 rounded-full">
                        CURRENT STAGE
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    3 Glass Levels · 18 Skills · 18 Drops of confidence
                  </p>
                </div>
                <button
                  onClick={() => onNavigate('glass')}
                  className="text-xs font-extrabold text-sky-700 bg-white border border-sky-200 hover:bg-sky-100 px-3 py-1.5 rounded-xl transition cursor-pointer"
                >
                  Open Glass →
                </button>
              </div>

              {/* Pool Stage */}
              <div
                className={cn(
                  'p-4 rounded-2xl border-2 transition flex items-center justify-between',
                  isPoolStage ? 'bg-sky-50 border-sky-400 shadow-sm' : 'bg-slate-50 border-slate-200'
                )}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🏊</span>
                    <h5 className="font-display text-base font-black text-[#06214a]">Pool Stage — Stroke Foundations & Mastery</h5>
                    {isPoolStage && (
                      <span className="text-[10px] font-black bg-sky-600 text-white px-2 py-0.5 rounded-full">
                        ACTIVE LEVEL: {currentLevelString}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Pool 1 (Water Control) · Pool 2 (Stroke Foundations) · Pool 3 (Endurance)
                  </p>
                </div>
                <button
                  onClick={() => onNavigate('pool')}
                  className="text-xs font-extrabold text-sky-700 bg-white border border-sky-200 hover:bg-sky-100 px-3 py-1.5 rounded-xl transition cursor-pointer"
                >
                  Open Pool →
                </button>
              </div>

              {/* Pond Journey */}
              <div className="p-4 rounded-2xl border-2 border-slate-200 bg-slate-50 flex items-center justify-between opacity-80">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🌊</span>
                    <h5 className="font-display text-base font-black text-[#06214a]">Pond Journey — Capstone Graduation</h5>
                    <span className="text-[10px] font-black bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
                      GRADUATION
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Final celebratory swimming challenge across open water
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ── TAB 4: GLASS & POOL ── */}
      {tab === 'journey' && (
        <Card title="Glass & Pool Curriculum Hub" subtitle="Explore every interactive drop and animation in the Aqua Slash curriculum.">
          <div className="grid gap-4 sm:grid-cols-2 mt-3">
            <button
              onClick={() => onNavigate('glass')}
              className="rounded-2xl bg-gradient-to-br from-cyan-400 to-sky-600 p-5 text-left text-white shadow-md hover:brightness-105 transition cursor-pointer"
            >
              <p className="text-xs font-black uppercase tracking-wider text-white/80">🥛 Glass Curriculum</p>
              <p className="font-display text-3xl font-black mt-1">
                {peekGlassCount(activeStudentId)} / 18
              </p>
              <p className="text-xs text-white/90 mt-1 font-semibold">18 Interactive Drops of Confidence</p>
            </button>
            <button
              onClick={() => onNavigate('pool')}
              className="rounded-2xl bg-gradient-to-br from-sky-500 to-blue-700 p-5 text-left text-white shadow-md hover:brightness-105 transition cursor-pointer"
            >
              <p className="text-xs font-black uppercase tracking-wider text-white/80">🏊 Pool Curriculum</p>
              <p className="font-display text-3xl font-black mt-1">
                {poolDoneCount} / {CONFIG.POOL_ACTIVE_LEVELS * 6}
              </p>
              <p className="text-xs text-white/90 mt-1 font-semibold">Pool 1 · Pool 2 · Pool 3 Progress</p>
            </button>
          </div>
          <p className="mt-4 text-xs font-semibold text-slate-400">
            Every skill and animation is open to review and practice anytime.
          </p>
        </Card>
      )}

      {/* ── TAB 5: FEEDBACK ── */}
      {tab === 'feedback' && <FeedbackSection student={student} />}
    </div>
  );
}
