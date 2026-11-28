import { useEffect, useState, useMemo, useRef } from 'react';
import { api, type Student } from '../lib/api';
import { renameProfile, saveLocalPassword, useIdentity, profileStore } from '../lib/identity';
import { useAdmin } from '../context/AdminContext';
import { peekGlassCount, loadGlass } from '../state/glassMachine';
import { loadStudentState } from '../state/poolMachine';
import { peekPondCount } from '../state/pondMachine';
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
import {
  getRegisteredFace,
  saveRegisteredFace,
  deleteRegisteredFace,
  type FaceRegistration,
} from '../lib/faceStorage';
import { FeedbackSection } from './FeedbackSection';
import { MyVideosSection } from './MyVideosSection';
import { WhatsAppButton } from './WhatsAppButton';
import type { Section } from './JourneyHome';

type Tab = 'profile' | 'videos' | 'journey' | 'attendance' | 'level' | 'feedback';

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'profile', label: 'My Profile', icon: '👤' },
  { key: 'videos', label: 'My Swim Videos', icon: '🎬' },
  { key: 'journey', label: 'My Journey', icon: '🧭' },
  { key: 'attendance', label: 'Attendance', icon: '📅' },
  { key: 'level', label: 'Swimming Level', icon: '🏊' },
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
  const activeStudentMeta: Student = useMemo(() => {
    if (activeStudentId === student.studentId) return student;
    const known = KNOWN_STUDENTS.find((s) => s.studentId === activeStudentId);
    return {
      studentId: activeStudentId,
      studentName: known?.studentName || 'Student ' + activeStudentId,
      email: '',
      mobile: '',
      currentLevel: known?.defaultLevel || 'Pool 1',
      role: 'STUDENT',
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

  // Face Registration State
  const [registeredFace, setRegisteredFace] = useState<FaceRegistration | null>(() =>
    getRegisteredFace(activeStudentId)
  );
  const [faceModalOpen, setFaceModalOpen] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraLoading, setCameraLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoStreamRef = useRef<MediaStream | null>(null);

  // Contact Info Editing State (linking email & mobile)
  const [editingContacts, setEditingContacts] = useState(false);
  const [emailDraft, setEmailDraft] = useState(activeStudentMeta.email || student.email || '');
  const [mobileDraft, setMobileDraft] = useState(activeStudentMeta.mobile || student.mobile || '');
  const [contactMsg, setContactMsg] = useState<string | null>(null);

  useEffect(() => {
    setRegisteredFace(getRegisteredFace(activeStudentId));
    setEmailDraft(activeStudentMeta.email || student.email || '');
    setMobileDraft(activeStudentMeta.mobile || student.mobile || '');
  }, [activeStudentId, activeStudentMeta, student]);

  useEffect(() => {
    const handleFaceUpdate = () => {
      setRegisteredFace(getRegisteredFace(activeStudentId));
    };
    window.addEventListener('aquaslash-face-registered', handleFaceUpdate);
    window.addEventListener('aquaslash-face-deleted', handleFaceUpdate);
    return () => {
      window.removeEventListener('aquaslash-face-registered', handleFaceUpdate);
      window.removeEventListener('aquaslash-face-deleted', handleFaceUpdate);
    };
  }, [activeStudentId]);

  const stopCamera = () => {
    if (videoStreamRef.current) {
      videoStreamRef.current.getTracks().forEach((track) => track.stop());
      videoStreamRef.current = null;
    }
  };

  const startCamera = async () => {
    stopCamera();
    setCameraError(null);
    setCameraLoading(true);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera access not supported on this device.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      });
      videoStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err) {
      console.warn('Camera error:', err);
      setCameraError('Unable to access camera. Please allow camera permissions and try again.');
    } finally {
      setCameraLoading(false);
    }
  };

  const handleCaptureSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    // Mirror horizontally so it feels natural like a selfie
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
    setCapturedPhoto(dataUrl);
    stopCamera();
  };

  const handleConfirmSaveFace = () => {
    if (!capturedPhoto) return;
    const newReg: FaceRegistration = {
      studentId: activeStudentId,
      studentName: activeStudentMeta.studentName,
      email: activeStudentMeta.email || student.email || '',
      mobile: activeStudentMeta.mobile || student.mobile || '',
      photoDataUrl: capturedPhoto,
      registeredAt: new Date().toISOString(),
    };
    saveRegisteredFace(newReg);
    setRegisteredFace(newReg);
    stopCamera();
    setFaceModalOpen(false);
    setCapturedPhoto(null);
  };

  const handleSaveContacts = (e: React.FormEvent) => {
    e.preventDefault();
    profileStore.updateContactInfo({
      email: emailDraft,
      mobile: mobileDraft,
      name: activeStudentMeta.studentName,
    });
    setContactMsg('✅ Email and Mobile Number linked successfully!');
    setTimeout(() => {
      setEditingContacts(false);
      setContactMsg(null);
    }, 1800);
  };

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
    <div className="mx-auto max-w-5xl pt-4 pb-12 px-3 sm:px-6">
      {/* Top Profile Header Banner */}
      <div className="mb-5 text-center">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-yellow-400/20 border border-yellow-500/40 px-3 py-1 mb-2">
          <span className="text-xs font-black uppercase tracking-widest text-yellow-900">Aqua Slash Swimmer Profile</span>
        </div>
        <h1 className="font-display text-3xl font-bold uppercase text-[#06214a] sm:text-4xl">
          👤 {activeStudentMeta.studentName}
        </h1>
        <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
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
              <p className="text-[11px] text-sky-200">View and update attendance, videos, or swimming levels for any registered student</p>
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

      {/* Navigation Sub-Tabs in Student Profile */}
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

          {/* Quick Snapshot Overview Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 1. My Videos Snapshot Card */}
            <div className="rounded-[28px] bg-gradient-to-br from-indigo-50 to-sky-50 border-2 border-indigo-200 p-5 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black uppercase tracking-wider text-indigo-900 flex items-center gap-1">
                    🎬 Private Videos
                  </span>
                  <span className="text-xs font-black bg-indigo-600 text-white px-2 py-0.5 rounded-full">
                    Coach Drills
                  </span>
                </div>
                <p className="font-display text-xl font-black text-[#06214a]">
                  My Swim Videos & Drills
                </p>
                <p className="mt-1 text-xs font-semibold text-slate-600">
                  Personalized technique breakdowns and coach recordings for {activeStudentMeta.studentName}.
                </p>
              </div>
              <button
                onClick={() => setTab('videos')}
                className="mt-4 w-full rounded-xl bg-white border border-indigo-300 py-2.5 text-xs font-extrabold text-indigo-900 shadow-sm hover:bg-indigo-100 transition cursor-pointer flex items-center justify-center gap-1"
              >
                <span>Watch My Swim Videos</span>
                <span>→</span>
              </button>
            </div>

            {/* 2. Attendance Snapshot Card */}
            <div className="rounded-[28px] bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 p-5 shadow-sm flex flex-col justify-between">
              <div>
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
                <div className="mt-2 flex items-center gap-3 text-xs font-bold text-slate-600">
                  <span className="text-emerald-700">✓ Present: {attendance.presentClasses}</span>
                  <span className="text-rose-600">✕ Absent: {attendance.absentClasses}</span>
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-emerald-200/60 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${Math.min(100, attendance.percentage)}%` }}
                  />
                </div>
              </div>
              <button
                onClick={() => setTab('attendance')}
                className="mt-4 w-full rounded-xl bg-white border border-emerald-300 py-2.5 text-xs font-extrabold text-emerald-800 shadow-sm hover:bg-emerald-100 transition cursor-pointer flex items-center justify-center gap-1"
              >
                <span>View Attendance Log</span>
                <span>→</span>
              </button>
            </div>

            {/* 3. Swimming Level Snapshot Card */}
            <div className="rounded-[28px] bg-gradient-to-br from-sky-50 to-blue-50 border-2 border-sky-200 p-5 shadow-sm flex flex-col justify-between">
              <div>
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
                <div className="mt-2 flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>Done: {completedSkillsCount} / 18</span>
                  <span>{curriculumPercentage}%</span>
                </div>
                <div className="mt-1 h-2 w-full rounded-full bg-sky-200/60 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-sky-500 transition-all duration-500"
                    style={{ width: `${Math.min(100, curriculumPercentage)}%` }}
                  />
                </div>
              </div>
              <button
                onClick={() => setTab('level')}
                className="mt-4 w-full rounded-xl bg-white border border-sky-300 py-2.5 text-xs font-extrabold text-sky-800 shadow-sm hover:bg-sky-100 transition cursor-pointer flex items-center justify-center gap-1"
              >
                <span>Curriculum & Skills</span>
                <span>→</span>
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

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <div className="rounded-2xl border border-sky-100 bg-white p-3">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-500">Student ID</span>
                <p className="font-mono text-sm font-black text-[#06214a]">{activeStudentMeta.studentId}</p>
              </div>
              <div className="rounded-2xl border border-sky-100 bg-white p-3">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-500">Current Swimming Level</span>
                <p className="truncate text-sm font-bold text-sky-700">{currentLevelString}</p>
              </div>
            </div>

            {/* Linked Email & Mobile Number */}
            <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
              <div className="rounded-2xl border border-sky-100 bg-white p-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-500">
                    ✉️ Linked Email Address
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    Linked
                  </span>
                </div>
                <p className="truncate text-sm font-bold text-[#06214a] mt-0.5">
                  {activeStudentMeta.email || student.email || 'No email registered'}
                </p>
              </div>

              <div className="rounded-2xl border border-sky-100 bg-white p-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-500">
                    📱 Linked Mobile Number
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    Linked
                  </span>
                </div>
                <p className="truncate text-sm font-bold text-[#06214a] mt-0.5">
                  {activeStudentMeta.mobile || student.mobile || 'No mobile registered'}
                </p>
              </div>
            </div>

            {/* Edit / Link Email & Mobile Form */}
            <div className="mt-3">
              {editingContacts ? (
                <form onSubmit={handleSaveContacts} className="space-y-3 rounded-2xl bg-sky-50/70 p-4 border border-sky-100">
                  <p className="text-xs font-black text-sky-900">
                    🔗 Link Both Email and Mobile Number to This Swimmer Profile:
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-extrabold uppercase tracking-wider text-sky-800">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={emailDraft}
                        onChange={(e) => setEmailDraft(e.target.value)}
                        placeholder="e.g. swimmer@gmail.com"
                        required
                        className="min-h-11 w-full rounded-xl border border-sky-200 bg-white px-3 text-sm font-bold text-slate-800 outline-none focus:border-cyan-400"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-extrabold uppercase tracking-wider text-sky-800">
                        Mobile / Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={mobileDraft}
                        onChange={(e) => setMobileDraft(e.target.value)}
                        placeholder="e.g. 6305252055"
                        required
                        className="min-h-11 w-full rounded-xl border border-sky-200 bg-white px-3 text-sm font-bold text-slate-800 outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>
                  {contactMsg && (
                    <div className="rounded-xl bg-emerald-100 p-2 text-xs font-bold text-emerald-800">
                      {contactMsg}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="min-h-10 rounded-xl bg-sky-600 px-4 text-xs font-black text-white shadow hover:bg-sky-700 cursor-pointer"
                    >
                      Save & Link Both Contacts
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingContacts(false)}
                      className="min-h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setEmailDraft(activeStudentMeta.email || student.email || '');
                    setMobileDraft(activeStudentMeta.mobile || student.mobile || '');
                    setEditingContacts(true);
                  }}
                  className="w-full rounded-xl bg-white border border-sky-200 py-2.5 text-xs font-extrabold text-sky-700 hover:bg-sky-50 shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>✏️ Update / Link Both Email & Mobile Number</span>
                </button>
              )}
            </div>
          </Card>

          {/* ── CARD: BIOMETRIC FACE ID REGISTRATION ── */}
          <Card
            title="📸 Biometric Face ID Registration"
            subtitle="Register your face photo to enable contactless 1-tap Face ID login and automated pool attendance."
          >
            {registeredFace ? (
              <div className="flex flex-col sm:flex-row items-center gap-4 rounded-2xl bg-gradient-to-r from-cyan-50/80 via-sky-50 to-white p-4 border-2 border-cyan-300">
                <div className="relative shrink-0">
                  <img
                    src={registeredFace.photoDataUrl}
                    alt={registeredFace.studentName}
                    className="h-20 w-20 rounded-2xl object-cover border-2 border-cyan-500 shadow-md"
                  />
                  <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white text-xs font-black shadow">
                    ✓
                  </span>
                </div>
                <div className="flex-1 text-center sm:text-left min-w-0">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
                    <span className="text-xs font-black text-slate-900">{registeredFace.studentName}</span>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-800 border border-emerald-300">
                      Face ID Enrolled & Active
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-500 mt-1">
                    Enrolled: {new Date(registeredFace.registeredAt).toLocaleDateString()}
                  </p>
                  <p className="text-[11px] font-semibold text-slate-600 truncate mt-0.5">
                    Linked to: {registeredFace.studentId} · {registeredFace.email || registeredFace.mobile}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 shrink-0 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setFaceModalOpen(true);
                      startCamera();
                    }}
                    className="rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs px-3.5 py-2 transition shadow cursor-pointer"
                  >
                    🔄 Re-take Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Remove Face ID registration for ${activeStudentMeta.studentName}?`)) {
                        deleteRegisteredFace(activeStudentId);
                        setRegisteredFace(null);
                      }
                    }}
                    className="rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 font-bold text-xs px-3 py-2 transition cursor-pointer"
                  >
                    🗑️ Remove
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-4 rounded-2xl bg-sky-50 p-4 border border-sky-200">
                <div className="h-16 w-16 shrink-0 rounded-2xl bg-white border-2 border-dashed border-sky-300 flex items-center justify-center text-2xl shadow-xs">
                  📷
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <p className="font-display font-black text-sm text-[#06214a]">
                    Face ID Not Enrolled Yet
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Snap a quick photo with your camera to enroll your face for {activeStudentMeta.studentName} ({activeStudentId}). Uses your signed-in email and mobile automatically.
                  </p>
                </div>
                <div className="shrink-0 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setFaceModalOpen(true);
                      startCamera();
                    }}
                    className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 hover:brightness-105 text-white font-black text-xs px-5 py-3 shadow-md shadow-sky-200 transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>📸 Snap & Register Face ID</span>
                  </button>
                </div>
              </div>
            )}
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

      {/* ── TAB 2: MY SWIM VIDEOS & DRILLS (CENTRALISED IN PROFILE) ── */}
      {tab === 'videos' && (
        <div className="space-y-4">
          <MyVideosSection
            student={activeStudentMeta as Student}
            onOpenPublicLibrary={() => onNavigate('library')}
          />
        </div>
      )}

      {/* ── TAB 3: STUDENT ATTENDANCE SUMMARY ── */}
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

      {/* ── TAB 4: STUDENT SWIMMING LEVEL & CURRICULUM ── */}
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

      {/* ── TAB: MY SWIMMING JOURNEY ROADMAP & CURRICULUM ── */}
      {tab === 'journey' && (
        <div className="space-y-5">
          <div className="rounded-[28px] bg-gradient-to-br from-[#06214a] via-[#0a3170] to-[#0b4a8f] p-5 sm:p-6 text-white shadow-xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-cyan-300">Aqua Slash Curriculum Progression</p>
            <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold uppercase text-white">
              🧭 My Swimming Journey
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-sky-100 font-medium">
              Glass → Pool → Pond → Lake → River → Ocean. Glass, Pool, and Pond are active now for {activeStudentMeta.studentName}.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Stage 1: Glass */}
            <div className="rounded-[28px] bg-gradient-to-br from-cyan-400 via-sky-500 to-sky-600 p-5 text-white shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/20 text-2xl shadow-inner">
                    🥛
                  </span>
                  <span className="rounded-full bg-white px-2.5 py-0.5 text-[10px] font-black uppercase text-sky-800">
                    {glassData.completed.length >= 18 ? '✓ Complete' : 'Active Stage'}
                  </span>
                </div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-200">Stage 1</p>
                <h3 className="font-display text-2xl font-bold uppercase">Glass</h3>
                <p className="text-xs text-white/90 mt-0.5">Water Confidence & Basic Safety · 18 Drops</p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/20">
                <div className="flex justify-between text-xs font-black mb-1.5">
                  <span>3 Glass Levels</span>
                  <span>{peekGlassCount(activeStudentId)} / 18 Drops</span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/30 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-white transition-all duration-700"
                    style={{ width: `${Math.min(100, (peekGlassCount(activeStudentId) / 18) * 100)}%` }}
                  />
                </div>
                <button
                  onClick={() => onNavigate('glass')}
                  className="mt-3.5 w-full rounded-xl bg-white py-2 text-xs font-black uppercase text-sky-800 shadow hover:bg-sky-50 transition cursor-pointer"
                >
                  Open Glass Curriculum →
                </button>
              </div>
            </div>

            {/* Stage 2: Pool */}
            <div className="rounded-[28px] bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 p-5 text-white shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/20 text-2xl shadow-inner">
                    🏊
                  </span>
                  <span className="rounded-full bg-white px-2.5 py-0.5 text-[10px] font-black uppercase text-blue-900">
                    {poolDoneCount >= 18 ? '✓ Complete' : 'Active Stage'}
                  </span>
                </div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-200">Stage 2</p>
                <h3 className="font-display text-2xl font-bold uppercase">Pool</h3>
                <p className="text-xs text-white/90 mt-0.5">Swimming Foundations & Stroke Mastery · 18 Skills</p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/20">
                <div className="flex justify-between text-xs font-black mb-1.5">
                  <span>Pool 1 · 2 · 3 Levels</span>
                  <span>{poolDoneCount} / 18 Skills</span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/30 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-white transition-all duration-700"
                    style={{ width: `${Math.min(100, (poolDoneCount / 18) * 100)}%` }}
                  />
                </div>
                <button
                  onClick={() => onNavigate('pool')}
                  className="mt-3.5 w-full rounded-xl bg-white py-2 text-xs font-black uppercase text-blue-900 shadow hover:bg-sky-50 transition cursor-pointer"
                >
                  Open Pool Curriculum →
                </button>
              </div>
            </div>

            {/* Stage 3: Pond */}
            <div className="rounded-[28px] bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-800 p-5 text-white shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/20 text-2xl shadow-inner">
                    🌿
                  </span>
                  <span className="rounded-full bg-white px-2.5 py-0.5 text-[10px] font-black uppercase text-teal-900">
                    {peekPondCount(activeStudentId) >= 18 ? '✓ Complete' : 'Active Stage'}
                  </span>
                </div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-200">Stage 3</p>
                <h3 className="font-display text-2xl font-bold uppercase">Pond</h3>
                <p className="text-xs text-white/90 mt-0.5">Advanced Swimming & Multi-Stroke Foundations · 18 Drops</p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/20">
                <div className="flex justify-between text-xs font-black mb-1.5">
                  <span>Pond 1 · 2 · 3 Levels</span>
                  <span>{peekPondCount(activeStudentId)} / 18 Drops</span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/30 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-white transition-all duration-700"
                    style={{ width: `${Math.min(100, (peekPondCount(activeStudentId) / 18) * 100)}%` }}
                  />
                </div>
                <button
                  onClick={() => onNavigate('pond')}
                  className="mt-3.5 w-full rounded-xl bg-white py-2 text-xs font-black uppercase text-teal-900 shadow hover:bg-teal-50 transition cursor-pointer"
                >
                  Open Pond Curriculum →
                </button>
              </div>
            </div>

            {/* Stage 4: Lake */}
            <div className="rounded-[28px] bg-gradient-to-br from-indigo-600 to-purple-800 p-5 text-white shadow-lg flex flex-col justify-between opacity-80">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/20 text-2xl shadow-inner">
                    🏔️
                  </span>
                  <span className="rounded-full bg-black/30 px-2.5 py-0.5 text-[10px] font-black uppercase text-white/90">
                    🔒 Coming Soon
                  </span>
                </div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-200">Stage 4</p>
                <h3 className="font-display text-2xl font-bold uppercase">Lake</h3>
                <p className="text-xs text-white/90 mt-0.5">Endurance & Greater Distance Adaptability</p>
              </div>
            </div>

            {/* Stage 5: River */}
            <div className="rounded-[28px] bg-gradient-to-br from-teal-600 to-cyan-800 p-5 text-white shadow-lg flex flex-col justify-between opacity-80">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/20 text-2xl shadow-inner">
                    🏞️
                  </span>
                  <span className="rounded-full bg-black/30 px-2.5 py-0.5 text-[10px] font-black uppercase text-white/90">
                    🔒 Coming Soon
                  </span>
                </div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-teal-200">Stage 5</p>
                <h3 className="font-display text-2xl font-bold uppercase">River</h3>
                <p className="text-xs text-white/90 mt-0.5">Moving-Water Preparation & Current Management</p>
              </div>
            </div>

            {/* Stage 6: Ocean */}
            <div className="rounded-[28px] bg-gradient-to-br from-blue-700 to-[#06214a] p-5 text-white shadow-lg flex flex-col justify-between opacity-80">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/20 text-2xl shadow-inner">
                    🌊
                  </span>
                  <span className="rounded-full bg-black/30 px-2.5 py-0.5 text-[10px] font-black uppercase text-white/90">
                    🔒 Coming Soon
                  </span>
                </div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-200">Stage 6</p>
                <h3 className="font-display text-2xl font-bold uppercase">Ocean</h3>
                <p className="text-xs text-white/90 mt-0.5">Advanced Open-Water Preparation & Coastal Swimming</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 6: FEEDBACK ── */}
      {tab === 'feedback' && <FeedbackSection student={student} />}

      {/* ── FACE REGISTRATION CAMERA MODAL ── */}
      {faceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-[32px] bg-slate-950 border-2 border-cyan-400 p-6 text-white shadow-2xl relative">
            <button
              onClick={() => {
                stopCamera();
                setFaceModalOpen(false);
                setCapturedPhoto(null);
              }}
              className="absolute top-4 right-4 h-8 w-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold cursor-pointer"
            >
              ✕
            </button>

            <div className="text-center mb-4">
              <span className="text-3xl">📸</span>
              <h3 className="font-display text-xl font-black text-white mt-1">
                {capturedPhoto ? 'Review Enrolled Photo' : 'Register Swimmer Face ID'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {capturedPhoto
                  ? 'Confirm this photo to save your biometric credentials'
                  : `Position face clearly for ${activeStudentMeta.studentName} (${activeStudentId})`}
              </p>
            </div>

            {/* Video / Photo Container */}
            <div className="relative overflow-hidden rounded-2xl bg-black aspect-4/3 flex items-center justify-center border border-cyan-500/40">
              {capturedPhoto ? (
                <img
                  src={capturedPhoto}
                  alt="Captured face preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <>
                  {cameraLoading ? (
                    <div className="text-center p-6 text-xs text-slate-400">
                      🔄 Starting camera sensor…
                    </div>
                  ) : cameraError ? (
                    <div className="text-center p-6 text-xs text-rose-300 font-bold">
                      ⚠️ {cameraError}
                      <button
                        type="button"
                        onClick={startCamera}
                        className="mt-3 block mx-auto px-3 py-1.5 rounded-xl bg-cyan-600 text-white font-bold text-xs"
                      >
                        Retry Camera
                      </button>
                    </div>
                  ) : (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="h-full w-full object-cover -scale-x-100"
                    />
                  )}
                  {/* Oval overlay */}
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="h-44 w-32 rounded-[50%] border-2 border-dashed border-cyan-400/90 shadow-[0_0_20px_rgba(6,182,212,0.4)]" />
                  </div>
                </>
              )}
            </div>

            <canvas ref={canvasRef} className="hidden" />

            {/* Actions */}
            <div className="mt-5 flex flex-col gap-2.5">
              {!capturedPhoto ? (
                <button
                  type="button"
                  onClick={handleCaptureSnapshot}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-400 to-sky-500 text-slate-950 font-black text-sm shadow-lg shadow-cyan-500/30 hover:brightness-110 active:scale-98 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>📸 Snap Face Photo</span>
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleConfirmSaveFace}
                    className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 font-black text-sm shadow hover:brightness-110 active:scale-98 transition cursor-pointer"
                  >
                    💾 Save & Enroll Face ID
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCapturedPhoto(null);
                      startCamera();
                    }}
                    className="py-3 px-4 rounded-2xl border border-slate-700 bg-slate-900 text-slate-300 hover:text-white font-bold text-xs cursor-pointer"
                  >
                    🔄 Retake
                  </button>
                </div>
              )}
              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  setFaceModalOpen(false);
                  setCapturedPhoto(null);
                }}
                className="w-full py-2 text-xs font-bold text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
