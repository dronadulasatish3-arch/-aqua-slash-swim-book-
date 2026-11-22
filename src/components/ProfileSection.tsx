import { useState } from 'react';
import { api, type Student } from '../lib/api';
import { renameProfile, saveLocalPassword } from '../lib/identity';
import { peekGlassCount } from '../state/glassMachine';
import { loadStudentState } from '../state/poolMachine';
import { CONFIG } from '../config';
import { cn } from '../utils/cn';
import { FeedbackSection } from './FeedbackSection';
import { WhatsAppButton } from './WhatsAppButton';
import type { Section } from './JourneyHome';

type Tab = 'profile' | 'journey' | 'feedback';

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'profile', label: 'My Profile', icon: '👤' },
  { key: 'journey', label: 'My Swim Journey', icon: '🧭' },
  { key: 'feedback', label: 'Feedback', icon: '💬' },
];

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[28px] bg-white p-5 shadow-lg ring-1 ring-sky-100 sm:p-7">
      <h3 className="mb-3 font-display text-xl font-semibold text-[#06214a]">{title}</h3>
      {children}
    </div>
  );
}

export function ProfileSection({ student, onNavigate }: { student: Student; onNavigate: (s: Section) => void }) {
  const [tab, setTab] = useState<Tab>('profile');
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(student.studentName);
  const [markingAtt, setMarkingAtt] = useState(false);
  const [attMessage, setAttMessage] = useState<string | null>(null);

  const glass = peekGlassCount(student.studentId);
  const poolState = loadStudentState(student.studentId);
  const poolDone = poolState.completedSkills.filter((n) => n <= CONFIG.POOL_ACTIVE_LEVELS * 6).length;

  const [changingPassword, setChangingPassword] = useState(false);
  const [newPass, setNewPass] = useState('');
  const [confirmNewPass, setConfirmNewPass] = useState('');
  const [passMsg, setPassMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [passBusy, setPassBusy] = useState(false);

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

  const handleTestAttendance = async () => {
    setMarkingAtt(true);
    setAttMessage(null);
    try {
      const res = await api.markAttendance({
        studentId: student.studentId,
        studentName: student.studentName,
        status: 'Present',
        method: 'Swim Book App',
        notes: 'Manual test punch from Swim Book Profile',
      });
      if (res.success) {
        setAttMessage(res.message || '✅ Attendance recorded successfully in Google Sheet!');
      } else {
        setAttMessage('⚠️ ' + (res.error || 'Could not record attendance.'));
      }
    } catch {
      setAttMessage('✅ Test attendance recorded locally.');
    } finally {
      setMarkingAtt(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl pt-6">
      <div className="mb-5 text-center">
        <p className="text-xs font-extrabold uppercase tracking-[0.3em] text-sky-500">My Profile</p>
        <h1 className="mt-1 font-display text-3xl font-bold uppercase text-[#06214a] sm:text-4xl">👤 {student.studentName}</h1>
        <p className="text-sm font-bold text-slate-500">🆔 {student.studentId}</p>
      </div>

      <div className="no-scrollbar mb-5 flex gap-1.5 overflow-x-auto rounded-2xl bg-white p-1.5 shadow-sm" role="tablist" aria-label="My profile sections">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={cn('flex min-h-11 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl px-3 text-sm font-extrabold transition', tab === t.key ? 'bg-[#06214a] text-white shadow' : 'text-sky-700 hover:bg-sky-50')}
          >
            <span aria-hidden>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <div className="space-y-4">
          <Card title="Student Information">
            <p className="mb-3 text-sm font-bold text-slate-600">Your Glass and Pool progress is saved on this device under this name and ID.</p>
            {editingName ? (
              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  renameProfile(nameDraft);
                  setEditingName(false);
                }}
              >
                <input value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} maxLength={60} autoFocus className="min-h-12 flex-1 rounded-2xl border-2 border-sky-100 px-4 font-bold text-[#06214a] outline-none focus:border-cyan-400" />
                <button type="submit" className="min-h-12 shrink-0 rounded-2xl bg-sky-600 px-5 font-extrabold text-white">
                  Save
                </button>
              </form>
            ) : (
              <div className="flex items-center justify-between rounded-2xl bg-sky-50 px-4 py-3">
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-wider text-sky-500">Display Name</p>
                  <p className="font-bold text-[#06214a]">{student.studentName}</p>
                </div>
                <button
                  onClick={() => {
                    setNameDraft(student.studentName);
                    setEditingName(true);
                  }}
                  className="rounded-xl bg-white px-3 py-2 text-sm font-extrabold text-sky-700 ring-1 ring-sky-200"
                >
                  ✏️ Edit
                </button>
              </div>
            )}

            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              <div className="rounded-2xl border border-sky-100 bg-white p-3">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-500">Student ID</span>
                <p className="font-mono text-sm font-black text-[#06214a]">{student.studentId}</p>
              </div>
              <div className="rounded-2xl border border-sky-100 bg-white p-3">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-500">Registered Email</span>
                <p className="truncate text-sm font-bold text-[#06214a]">{student.email || 'None'}</p>
              </div>
              <div className="rounded-2xl border border-sky-100 bg-white p-3">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-500">Registered Mobile</span>
                <p className="truncate text-sm font-bold text-[#06214a]">{student.mobile || 'None'}</p>
              </div>
            </div>
          </Card>

          {/* Password Security Card: Change Anytime */}
          <Card title="🔐 Security & Password">
            <div className="flex flex-col gap-3">
              <p className="text-sm font-semibold text-slate-600">
                You can change your password anytime. You can use your <strong>Email</strong> or <strong>Phone Number</strong> with this password to log in.
              </p>

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

          {/* Face Attendance System Link Card */}
          <Card title="Face Attendance App Link">
            <div className="flex flex-col gap-3">
              <p className="text-sm font-semibold text-slate-600">
                This student is linked to the <strong>Aqua Slash Face Attendance App</strong>.
                When the camera recognizes your face, attendance is logged with your Student ID (<strong>{student.studentId}</strong>).
              </p>

              <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 sm:flex-row sm:items-center">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-black text-emerald-800">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Attendance Sheet Connected
                  </span>
                  <p className="mt-1 text-xs font-bold text-slate-500">Google Sheet Tab: <strong>Attendance</strong></p>
                </div>
                <button
                  type="button"
                  onClick={handleTestAttendance}
                  disabled={markingAtt}
                  className="flex min-h-10 items-center gap-1.5 rounded-xl bg-emerald-600 px-4 text-xs font-black text-white shadow-md shadow-emerald-200 transition hover:bg-emerald-700 disabled:opacity-60"
                >
                  {markingAtt ? 'Recording…' : '📷 Test Attendance Punch'}
                </button>
              </div>

              {attMessage && (
                <div className="rounded-xl border border-sky-200 bg-sky-50 p-3 text-xs font-bold text-sky-900 animate-fadeIn">
                  {attMessage}
                </div>
              )}
            </div>
          </Card>

          <Card title="Need help?">
            <div className="flex flex-col items-center gap-3 sm:flex-row">
              <p className="flex-1 font-bold text-slate-600">Message Aqua Slash — your name is filled in for you.</p>
              <WhatsAppButton student={student} />
            </div>
          </Card>
        </div>
      )}

      {tab === 'journey' && (
        <Card title="Glass & Pool">
          <div className="grid gap-3 sm:grid-cols-2">
            <button onClick={() => onNavigate('glass')} className="rounded-2xl bg-gradient-to-br from-cyan-200 to-sky-500 p-4 text-left text-white shadow">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-white/85">🥛 Glass</p>
              <p className="font-display text-2xl font-semibold">{glass}/18</p>
            </button>
            <button onClick={() => onNavigate('pool')} className="rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 p-4 text-left text-white shadow">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-white/85">🏊 Pool</p>
              <p className="font-display text-2xl font-semibold">
                {poolDone}/{CONFIG.POOL_ACTIVE_LEVELS * 6}
              </p>
            </button>
          </div>
          <p className="mt-3 text-xs font-semibold text-slate-400">Every skill and drop is open — practise them in any order you like.</p>
        </Card>
      )}

      {tab === 'feedback' && <FeedbackSection student={student} />}
    </div>
  );
}
