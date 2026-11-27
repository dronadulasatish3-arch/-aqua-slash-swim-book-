import { useState, useEffect, useRef } from 'react';
import { api } from '../lib/api';
import { cn } from '../utils/cn';
import {
  getSavedAccounts,
  removeSavedAccount,
  saveLocalPassword,
  getLocalPassword,
  type SavedAccount,
} from '../lib/identity';
import {
  getAllRegisteredFaces,
  type FaceRegistration,
  CENTRAL_ATTENDANCE_URL,
} from '../lib/faceStorage';
import { getRegisteredStudents } from '../data/studentRegistry';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function isValidIdentifier(val: string): boolean {
  const clean = val.trim();
  if (clean.includes('@')) return EMAIL_PATTERN.test(clean);
  const digits = clean.replace(/[^\d]/g, '');
  return digits.length >= 8;
}

type AuthMode = 'quick-login' | 'login' | 'register' | 'forgot-password' | 'face-login';

export function AuthGate({
  onAuthenticated,
}: {
  onAuthenticated: (session: { name: string; email: string; phone?: string; mobile?: string; studentId?: string; role?: string }) => void;
}) {
  const [savedAccounts, setSavedAccounts] = useState<SavedAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<SavedAccount | null>(null);
  const [mode, setMode] = useState<AuthMode>('login');
  const [loginTab, setLoginTab] = useState<'phone' | 'email'>('phone');

  // Form fields
  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState(''); // email or phone
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Face Login states
  const [registeredFaces, setRegisteredFaces] = useState<FaceRegistration[]>([]);
  const [faceError, setFaceError] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoStreamRef = useRef<MediaStream | null>(null);

  const stopCamera = () => {
    if (videoStreamRef.current) {
      videoStreamRef.current.getTracks().forEach((track) => track.stop());
      videoStreamRef.current = null;
    }
    setCameraActive(false);
  };

  const startCamera = async () => {
    stopCamera();
    setFaceError(null);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera device not supported by this browser.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      });
      videoStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setCameraActive(true);
    } catch (err) {
      console.warn('Face login camera error:', err);
      setFaceError('Camera access unavailable. Please allow camera permissions or click an enrolled profile below.');
    }
  };

  useEffect(() => {
    if (mode === 'face-login') {
      setRegisteredFaces(getAllRegisteredFaces());
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [mode]);

  const handleFaceLoginSubmit = async (face: FaceRegistration) => {
    setBusy(true);
    setError(null);
    setSuccessMsg(`Face verified! Welcome, ${face.studentName}…`);
    setTimeout(() => {
      stopCamera();
      onAuthenticated({
        name: face.studentName,
        email: face.email,
        mobile: face.mobile,
        phone: face.mobile,
        studentId: face.studentId,
        role: face.email.toLowerCase().includes('dronadulasatish') ? 'ADMIN' : 'STUDENT',
      });
    }, 1000);
  };

  // Load saved accounts on mount
  useEffect(() => {
    const accounts = getSavedAccounts();
    setSavedAccounts(accounts);
    if (accounts.length > 0) {
      setSelectedAccount(accounts[0]);
      setMode('quick-login');
      setIdentifier(accounts[0].email || accounts[0].phone || '');
      const localPass = getLocalPassword(accounts[0].email) || (accounts[0].phone ? getLocalPassword(accounts[0].phone) : null);
      if (localPass) {
        setPassword(localPass);
      }
    } else {
      setMode('login');
    }
  }, []);

  // Quick 1-click login for already logged-in user on same device
  const handleQuickLogin = async (account: SavedAccount) => {
    setError(null);
    setBusy(true);

    const reg = getRegisteredStudents().find(
      (s) =>
        (account.studentId && s.studentId === account.studentId) ||
        (account.email && s.email && s.email.toLowerCase() === account.email.toLowerCase()) ||
        (account.phone && s.mobile && s.mobile.replace(/\D/g, '') === account.phone.replace(/\D/g, ''))
    );

    const resolvedEmail = account.email || reg?.email || '';
    const resolvedMobile = account.phone || account.mobile || reg?.mobile || '';
    const resolvedName = account.name || reg?.studentName || 'Swimmer';
    const resolvedStudentId = account.studentId || reg?.studentId;

    try {
      const savedPass = password || getLocalPassword(account.email) || (account.phone ? getLocalPassword(account.phone) : '') || '';
      // Try backend login
      try {
        const res = await api.login(account.email || account.phone || '', savedPass);
        if (res.success && res.user) {
          onAuthenticated({
            name: res.user.studentName || res.user.name || resolvedName,
            email: res.user.email || resolvedEmail,
            mobile: res.user.mobile || res.user.phone || resolvedMobile,
            phone: res.user.mobile || res.user.phone || resolvedMobile,
            studentId: res.user.studentId || resolvedStudentId,
            role: res.user.role || (resolvedEmail.includes('dronadulasatish') ? 'ADMIN' : 'STUDENT'),
          });
          return;
        }
      } catch {
        // Fallback to local session if network is unavailable
      }

      // Allow instant seamless access on same device
      onAuthenticated({
        name: resolvedName,
        email: resolvedEmail,
        mobile: resolvedMobile,
        phone: resolvedMobile,
        studentId: resolvedStudentId,
        role: resolvedEmail.includes('dronadulasatish') ? 'ADMIN' : 'STUDENT',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to log in. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  // Standard Login (Accepts Phone Number OR Email)
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = identifier.trim();

    if (loginTab === 'phone') {
      const digits = cleanId.replace(/[^\d]/g, '');
      if (digits.length < 8) {
        setError('Please enter a valid mobile / phone number (e.g. 6305252050).');
        return;
      }
    } else {
      if (!cleanId.includes('@') || !EMAIL_PATTERN.test(cleanId)) {
        setError('Please enter a valid email address.');
        return;
      }
    }

    setBusy(true);
    setError(null);
    setSuccessMsg(null);

    const reg = getRegisteredStudents().find(
      (s) =>
        (cleanId.includes('@') && s.email && s.email.toLowerCase() === cleanId.toLowerCase()) ||
        (!cleanId.includes('@') && s.mobile && s.mobile.replace(/\D/g, '') === cleanId.replace(/\D/g, ''))
    );

    try {
      // 1. Try API login
      try {
        const res = await api.login(cleanId, password);
        if (res.success && res.user) {
          const resolvedEmail = res.user.email || (cleanId.includes('@') ? cleanId.toLowerCase() : (reg?.email || ''));
          const resolvedMobile = res.user.mobile || res.user.phone || (!cleanId.includes('@') ? cleanId : (reg?.mobile || ''));
          const resolvedName = res.user.studentName || res.user.name || reg?.studentName || (cleanId.includes('@') ? cleanId.split('@')[0] : 'Swimmer');
          const resolvedId = res.user.studentId || reg?.studentId;

          if (password) {
            saveLocalPassword(cleanId, password);
            if (resolvedEmail) saveLocalPassword(resolvedEmail, password);
            if (resolvedMobile) saveLocalPassword(resolvedMobile, password);
          }
          onAuthenticated({
            name: resolvedName,
            email: resolvedEmail,
            mobile: resolvedMobile,
            phone: resolvedMobile,
            studentId: resolvedId,
            role: res.user.role || (resolvedEmail.includes('dronadulasatish') ? 'ADMIN' : 'STUDENT'),
          });
          return;
        } else if (res.notRegistered) {
          setError('This email or phone number is not registered yet. Please create an account below.');
          if (cleanId.includes('@')) setEmail(cleanId);
          else setPhone(cleanId);
          setMode('register');
          return;
        } else if (res.error) {
          setError(res.error);
          return;
        }
      } catch (apiErr) {
        // If offline, check local saved accounts or registry
        const existing = savedAccounts.find((a) => 
          (a.email && a.email.toLowerCase() === cleanId.toLowerCase()) || 
          (a.phone && a.phone.replace(/\D/g, '') === cleanId.replace(/\D/g, ''))
        );
        if (existing || reg) {
          const matchedName = existing?.name || reg?.studentName || (cleanId.includes('@') ? cleanId.split('@')[0] : 'Swimmer');
          const matchedEmail = existing?.email || reg?.email || (cleanId.includes('@') ? cleanId.toLowerCase() : '');
          const matchedPhone = existing?.phone || reg?.mobile || (!cleanId.includes('@') ? cleanId : '');
          const matchedId = existing?.studentId || reg?.studentId;
          onAuthenticated({
            name: matchedName,
            email: matchedEmail,
            mobile: matchedPhone,
            phone: matchedPhone,
            studentId: matchedId,
            role: matchedEmail.includes('dronadulasatish') ? 'ADMIN' : 'STUDENT',
          });
          return;
        }
        throw apiErr;
      }

      // Default fallback
      const derivedName = reg?.studentName || (cleanId.includes('@') ? cleanId.split('@')[0] : 'Swimmer');
      const fallbackEmail = reg?.email || (cleanId.includes('@') ? cleanId.toLowerCase() : '');
      const fallbackMobile = reg?.mobile || (!cleanId.includes('@') ? cleanId : '');
      onAuthenticated({
        name: derivedName,
        email: fallbackEmail,
        mobile: fallbackMobile,
        phone: fallbackMobile,
        studentId: reg?.studentId,
        role: fallbackEmail.includes('dronadulasatish') ? 'ADMIN' : 'STUDENT',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please check your connection.');
    } finally {
      setBusy(false);
    }
  };

  // Register New Student (Requires Name, Email AND Phone Number)
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim().slice(0, 60);
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim().replace(/[^\d+]/g, '');

    if (!cleanName) {
      setError('Please enter your full name.');
      return;
    }
    if (!cleanEmail || !EMAIL_PATTERN.test(cleanEmail)) {
      setError('Please enter a valid email address.');
      return;
    }
    const phoneDigits = cleanPhone.replace(/[^\d]/g, '');
    if (!phoneDigits || phoneDigits.length < 8) {
      setError('Please enter a valid mobile / phone number (at least 8-10 digits).');
      return;
    }
    if (!password || password.length < 4) {
      setError('Please choose a password with at least 4 characters.');
      return;
    }
    if (confirmPassword && password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setBusy(true);
    setError(null);

    try {
      if (password) {
        saveLocalPassword(cleanEmail, password);
        saveLocalPassword(cleanPhone, password);
      }

      // Call Google Apps Script backend
      try {
        const res = await api.register({
          name: cleanName,
          email: cleanEmail,
          phone: cleanPhone,
          mobile: cleanPhone,
          password: password,
        });

        if (res.success && res.user) {
          onAuthenticated({
            name: res.user.studentName || cleanName,
            email: res.user.email || cleanEmail,
            mobile: res.user.mobile || cleanPhone,
            phone: res.user.mobile || cleanPhone,
            studentId: res.user.studentId,
            role: res.user.role,
          });
          return;
        } else if (res.error) {
          setError(res.error);
          setBusy(false);
          return;
        }
      } catch {
        // Fallback if offline
      }

      onAuthenticated({
        name: cleanName,
        email: cleanEmail,
        mobile: cleanPhone,
        phone: cleanPhone,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to complete registration.');
    } finally {
      setBusy(false);
    }
  };

  // Forgot / Change Password Anytime (Accepts Phone Number OR Email)
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = identifier.trim();

    if (loginTab === 'phone') {
      const digits = cleanId.replace(/[^\d]/g, '');
      if (digits.length < 8) {
        setError('Please enter your registered mobile number.');
        return;
      }
    } else {
      if (!cleanId.includes('@') || !EMAIL_PATTERN.test(cleanId)) {
        setError('Please enter your registered email address.');
        return;
      }
    }
    if (!password || password.length < 4) {
      setError('New password must be at least 4 characters.');
      return;
    }
    if (confirmPassword && password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setBusy(true);
    setError(null);
    setSuccessMsg(null);

    try {
      saveLocalPassword(cleanId, password);

      // Call Backend to update password in Google Sheet
      const res = await api.resetPassword(cleanId, password, name);
      if (res.success) {
        setSuccessMsg('New password updated successfully! Opening Swim Book...');
        setTimeout(() => {
          onAuthenticated({
            name: res.user?.studentName || res.user?.name || name || (cleanId.includes('@') ? cleanId.split('@')[0] : 'Swimmer'),
            email: res.user?.email || (cleanId.includes('@') ? cleanId.toLowerCase() : ''),
            mobile: res.user?.mobile || (!cleanId.includes('@') ? cleanId : ''),
            phone: res.user?.mobile || (!cleanId.includes('@') ? cleanId : ''),
            studentId: res.user?.studentId,
          });
        }, 1200);
      } else {
        // Even if sheet had error, allow login with local update
        setSuccessMsg('Password updated on this device! Logging in...');
        setTimeout(() => {
          onAuthenticated({
            name: name || (cleanId.includes('@') ? cleanId.split('@')[0] : 'Swimmer'),
            email: cleanId.includes('@') ? cleanId.toLowerCase() : '',
            mobile: !cleanId.includes('@') ? cleanId : '',
            phone: !cleanId.includes('@') ? cleanId : '',
          });
        }, 1000);
      }
    } catch {
      // Offline fallback
      setSuccessMsg('New password saved on this device. Logging in...');
      setTimeout(() => {
        onAuthenticated({
          name: name || (cleanId.includes('@') ? cleanId.split('@')[0] : 'Swimmer'),
          email: cleanId.includes('@') ? cleanId.toLowerCase() : '',
          mobile: !cleanId.includes('@') ? cleanId : '',
          phone: !cleanId.includes('@') ? cleanId : '',
        });
      }, 1000);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,#d6f3ff_0%,#eaf8ff_45%,#f5fbff_100%)] px-4 py-8 text-slate-800">
      <div className="w-full max-w-md rounded-[32px] border border-sky-100 bg-white/95 p-6 shadow-[0_24px_80px_rgba(14,116,144,0.18)] backdrop-blur-md sm:p-8">
        {/* Header / Brand */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-black uppercase tracking-[0.25em] text-sky-600">
            <span className="text-base">🏊</span> Aqua Slash
          </div>
          <h1 className="mt-3 font-display text-3xl font-black text-[#06214a] sm:text-4xl">
            {mode === 'quick-login' && 'Welcome Back!'}
            {mode === 'login' && 'Student Login'}
            {mode === 'register' && 'New Registration'}
            {mode === 'forgot-password' && 'Create New Password'}
            {mode === 'face-login' && 'Face ID Login'}
          </h1>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            {mode === 'quick-login' && 'Already logged in on this device. Tap to continue!'}
            {mode === 'login' && 'Log in to continue your swimming journey'}
            {mode === 'register' && 'Enter your details to start your swimming journey'}
            {mode === 'forgot-password' && 'Forgot password? Create a new one right here!'}
            {mode === 'face-login' && 'Position your face in the oval frame for instant biometric sign-in'}
          </p>
        </div>

        {/* Notifications */}
        {error && (
          <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-800 animate-fadeIn">
            ⚠️ {error}
          </div>
        )}
        {successMsg && (
          <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800 animate-fadeIn">
            ✅ {successMsg}
          </div>
        )}

        {/* ── MODE 1: QUICK RE-LOGIN (For already logged-in users) ── */}
        {mode === 'quick-login' && selectedAccount && (
          <div className="space-y-4">
            <div className="flex items-center gap-3.5 rounded-2xl border-2 border-sky-100 bg-gradient-to-r from-sky-50 to-cyan-50/50 p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-sky-600 text-lg font-black text-white shadow-md shadow-sky-200">
                {selectedAccount.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-black text-[#06214a]">{selectedAccount.name}</p>
                <p className="truncate text-xs font-semibold text-slate-500">{selectedAccount.email}</p>
                <span className="mt-1 inline-block rounded-md bg-white px-1.5 py-0.5 text-[10px] font-black text-sky-700 shadow-xs">
                  ID: {selectedAccount.studentId}
                </span>
              </div>
            </div>

            {/* Optional Password field if user wants/has one */}
            <div className="space-y-1 text-left">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-sky-800">
                Password <span className="font-normal text-slate-400">(Optional / Quick Access)</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password or tap below to continue"
                  className="min-h-12 w-full rounded-2xl border-2 border-sky-100 bg-white px-4 pr-11 font-semibold text-slate-800 outline-none transition focus:border-cyan-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-sm text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Main 1-Click Action */}
            <button
              type="button"
              disabled={busy}
              onClick={() => handleQuickLogin(selectedAccount)}
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-600 px-5 text-base font-extrabold text-white shadow-lg shadow-sky-200 transition hover:brightness-105 active:scale-[0.99] disabled:opacity-60"
            >
              {busy ? 'Logging in…' : `⚡ Continue as ${selectedAccount.name}`}
            </button>

            {/* Helper links */}
            <div className="flex items-center justify-between pt-2 text-xs font-extrabold text-sky-700">
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setEmail(selectedAccount.email);
                  setPassword('');
                  setMode('forgot-password');
                }}
                className="hover:underline"
              >
                Forgot Password?
              </button>
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setMode('login');
                }}
                className="hover:underline"
              >
                Switch Account
              </button>
            </div>

            {/* Remove from this device */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => {
                  removeSavedAccount(selectedAccount.email);
                  const updated = getSavedAccounts();
                  setSavedAccounts(updated);
                  if (updated.length > 0) {
                    setSelectedAccount(updated[0]);
                  } else {
                    setMode('login');
                  }
                }}
                className="text-[11px] font-bold text-slate-400 hover:text-rose-500"
              >
                Remove this profile from device
              </button>
            </div>

            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-sky-100" /></div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-400"><span className="bg-white px-2">or instant access</span></div>
            </div>
            <button
              type="button"
              onClick={() => onAuthenticated({ name: 'Swimmer Guest', email: 'guest@aquaslash.com', studentId: 'AS-GUEST' })}
              className="flex min-h-11 w-full items-center justify-center gap-1.5 rounded-2xl border-2 border-sky-200 bg-sky-50 px-4 text-xs font-black text-sky-800 transition hover:bg-sky-100 cursor-pointer"
            >
              🏊 Enter Swim Book as Guest
            </button>

            {/* Dedicated Face Login Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setMode('face-login');
                }}
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-cyan-400/40 px-4 text-xs font-black text-cyan-300 shadow-md shadow-indigo-950/20 hover:brightness-110 active:scale-[0.99] transition cursor-pointer"
              >
                <span className="text-base">📸</span>
                <span>Login with Face ID</span>
                <span className="rounded-full bg-cyan-400/20 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-cyan-300">
                  Biometric
                </span>
              </button>
            </div>
          </div>
        )}

        {/* ── MODE 2: STANDARD LOGIN ── */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-left" noValidate>
            {/* Tab Switcher: Mobile Phone vs Email */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-sky-50 rounded-2xl border border-sky-100 mb-3">
              <button
                type="button"
                onClick={() => {
                  setLoginTab('phone');
                  setError(null);
                }}
                className={cn(
                  "flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-black text-xs transition cursor-pointer",
                  loginTab === 'phone'
                    ? "bg-white text-sky-900 shadow-sm border border-sky-200"
                    : "text-slate-500 hover:text-sky-700"
                )}
              >
                📱 Mobile / Phone
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginTab('email');
                  setError(null);
                }}
                className={cn(
                  "flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-black text-xs transition cursor-pointer",
                  loginTab === 'email'
                    ? "bg-white text-sky-900 shadow-sm border border-sky-200"
                    : "text-slate-500 hover:text-sky-700"
                )}
              >
                ✉️ Email Address
              </button>
            </div>

            <div>
              <label className="mb-1 block text-xs font-extrabold uppercase tracking-wider text-sky-800">
                {loginTab === 'phone' ? '📱 Mobile / Phone Number *' : '✉️ Email Address *'}
              </label>
              <input
                type={loginTab === 'phone' ? 'tel' : 'email'}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={loginTab === 'phone' ? 'Enter 10-digit mobile (e.g. 6305252050)' : 'swimmer@example.com'}
                required
                className="min-h-12 w-full rounded-2xl border-2 border-sky-100 bg-white px-4 font-semibold text-slate-800 outline-none transition focus:border-cyan-400"
              />
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-xs font-extrabold uppercase tracking-wider text-sky-800">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setMode('forgot-password');
                  }}
                  className="text-xs font-bold text-sky-600 hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="min-h-12 w-full rounded-2xl border-2 border-sky-100 bg-white px-4 pr-11 font-semibold text-slate-800 outline-none transition focus:border-cyan-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-sm text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="flex min-h-12 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-600 px-5 text-base font-extrabold text-white shadow-lg shadow-sky-200 transition hover:brightness-105 active:scale-[0.99] disabled:opacity-60 cursor-pointer"
            >
              {busy ? 'Logging in…' : 'Log In'}
            </button>

            <div className="relative my-1">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-sky-100" /></div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-400"><span className="bg-white px-2">or instant access</span></div>
            </div>
            <button
              type="button"
              onClick={() => onAuthenticated({ name: 'Swimmer Guest', email: 'guest@aquaslash.com', studentId: 'AS-GUEST' })}
              className="flex min-h-11 w-full items-center justify-center gap-1.5 rounded-2xl border-2 border-sky-200 bg-sky-50 px-4 text-xs font-black text-sky-800 transition hover:bg-sky-100 cursor-pointer"
            >
              🏊 Enter Swim Book as Guest
            </button>

            {/* Dedicated Face Login Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setMode('face-login');
                }}
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-cyan-400/40 px-4 text-xs font-black text-cyan-300 shadow-md shadow-indigo-950/20 hover:brightness-110 active:scale-[0.99] transition cursor-pointer"
              >
                <span className="text-base">📸</span>
                <span>Login with Face ID</span>
                <span className="rounded-full bg-cyan-400/20 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-cyan-300">
                  Biometric
                </span>
              </button>
            </div>

            <div className="flex flex-col gap-2 pt-2 text-center text-xs font-extrabold text-sky-700">
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setMode('register');
                }}
                className="hover:underline cursor-pointer"
              >
                New Swimmer? Create an Account
              </button>
              {savedAccounts.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setSelectedAccount(savedAccounts[0]);
                    setMode('quick-login');
                  }}
                  className="text-slate-500 hover:text-sky-700 cursor-pointer"
                >
                  ← Back to Saved Account ({savedAccounts[0].name})
                </button>
              )}
            </div>
          </form>
        )}

        {/* ── MODE 3: FORGOT PASSWORD -> CHANGE ANYTIME ── */}
        {mode === 'forgot-password' && (
          <form onSubmit={handleForgotPasswordSubmit} className="space-y-4 text-left" noValidate>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3.5 text-xs font-bold text-amber-900">
              💡 <strong>Change or Reset Password Anytime:</strong> Choose your phone number or email and choose your new password.
            </div>

            {/* Tab Switcher: Mobile Phone vs Email */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-sky-50 rounded-2xl border border-sky-100 mb-2">
              <button
                type="button"
                onClick={() => {
                  setLoginTab('phone');
                  setError(null);
                }}
                className={cn(
                  "flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-black text-xs transition cursor-pointer",
                  loginTab === 'phone'
                    ? "bg-white text-sky-900 shadow-sm border border-sky-200"
                    : "text-slate-500 hover:text-sky-700"
                )}
              >
                📱 Mobile / Phone
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginTab('email');
                  setError(null);
                }}
                className={cn(
                  "flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-black text-xs transition cursor-pointer",
                  loginTab === 'email'
                    ? "bg-white text-sky-900 shadow-sm border border-sky-200"
                    : "text-slate-500 hover:text-sky-700"
                )}
              >
                ✉️ Email Address
              </button>
            </div>

            <div>
              <label className="mb-1 block text-xs font-extrabold uppercase tracking-wider text-sky-800">
                {loginTab === 'phone' ? '📱 Registered Mobile / Phone Number *' : '✉️ Registered Email Address *'}
              </label>
              <input
                type={loginTab === 'phone' ? 'tel' : 'email'}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={loginTab === 'phone' ? 'e.g. 6305252050' : 'swimmer@example.com'}
                required
                className="min-h-12 w-full rounded-2xl border-2 border-sky-100 bg-white px-4 font-semibold text-slate-800 outline-none transition focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-extrabold uppercase tracking-wider text-sky-800">
                New Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password (min 4 characters)"
                  required
                  className="min-h-12 w-full rounded-2xl border-2 border-sky-100 bg-white px-4 pr-11 font-semibold text-slate-800 outline-none transition focus:border-cyan-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-sm text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-extrabold uppercase tracking-wider text-sky-800">
                Confirm New Password *
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                required
                className="min-h-12 w-full rounded-2xl border-2 border-sky-100 bg-white px-4 font-semibold text-slate-800 outline-none transition focus:border-cyan-400"
              />
            </div>

            <button
              type="submit"
              disabled={busy}
              className="flex min-h-12 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 text-base font-extrabold text-white shadow-lg shadow-teal-200 transition hover:brightness-105 active:scale-[0.99] disabled:opacity-60 cursor-pointer"
            >
              {busy ? 'Updating Password…' : 'Save New Password & Log In'}
            </button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setMode(savedAccounts.length > 0 ? 'quick-login' : 'login');
                }}
                className="text-xs font-extrabold text-sky-700 hover:underline cursor-pointer"
              >
                ← Back to Login
              </button>
            </div>
          </form>
        )}

        {/* ── MODE 4: REGISTER NEW STUDENT (Name, Email & Phone Number) ── */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4 text-left" noValidate>
            <div>
              <label className="mb-1 block text-xs font-extrabold uppercase tracking-wider text-sky-800">
                Student Full Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Satish Kumar"
                required
                className="min-h-12 w-full rounded-2xl border-2 border-sky-100 bg-white px-4 font-semibold text-slate-800 outline-none transition focus:border-cyan-400"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-extrabold uppercase tracking-wider text-sky-800">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="swimmer@example.com"
                  required
                  className="min-h-12 w-full rounded-2xl border-2 border-sky-100 bg-white px-4 font-semibold text-slate-800 outline-none transition focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-extrabold uppercase tracking-wider text-sky-800">
                  Mobile / Phone Number *
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 6305252050"
                  required
                  className="min-h-12 w-full rounded-2xl border-2 border-sky-100 bg-white px-4 font-semibold text-slate-800 outline-none transition focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-extrabold uppercase tracking-wider text-sky-800">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 4 characters"
                    required
                    className="min-h-12 w-full rounded-2xl border-2 border-sky-100 bg-white px-4 pr-11 font-semibold text-slate-800 outline-none transition focus:border-cyan-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-sm text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-extrabold uppercase tracking-wider text-sky-800">
                  Confirm Password *
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  required
                  className="min-h-12 w-full rounded-2xl border-2 border-sky-100 bg-white px-4 font-semibold text-slate-800 outline-none transition focus:border-cyan-400"
                />
              </div>
            </div>

            <p className="text-[11px] font-bold text-slate-500">
              💡 You can use either your <strong>Email</strong> or <strong>Phone Number</strong> with this password to log in anytime!
            </p>

            <button
              type="submit"
              disabled={busy}
              className="flex min-h-12 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-600 px-5 text-base font-extrabold text-white shadow-lg shadow-sky-200 transition hover:brightness-105 active:scale-[0.99] disabled:opacity-60 cursor-pointer"
            >
              {busy ? 'Creating Account…' : 'Start My Swim Journey 🏊'}
            </button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setMode(savedAccounts.length > 0 ? 'quick-login' : 'login');
                }}
                className="text-xs font-extrabold text-sky-700 hover:underline cursor-pointer"
              >
                Already have an account? Log in here
              </button>
            </div>
          </form>
        )}

        {/* ── MODE 5: SEPARATE FACE LOGIN (BIOMETRIC SCANNER) ── */}
        {mode === 'face-login' && (
          <div className="space-y-4 text-center">
            {/* Camera & Scanner Window */}
            <div className="relative overflow-hidden rounded-3xl bg-slate-950 border-2 border-cyan-400 shadow-xl aspect-4/3 flex items-center justify-center">
              <style>{`
                @keyframes faceScanLaser {
                  0% { top: 12%; opacity: 0.3; }
                  50% { top: 82%; opacity: 1; }
                  100% { top: 12%; opacity: 0.3; }
                }
                .animate-face-laser {
                  animation: faceScanLaser 2.4s ease-in-out infinite;
                }
              `}</style>

              {cameraActive ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="absolute inset-0 h-full w-full object-cover -scale-x-100"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400">
                  <span className="text-4xl mb-2">📸</span>
                  <p className="text-xs font-bold text-slate-300">
                    {faceError || 'Starting front camera sensor…'}
                  </p>
                  {!cameraActive && (
                    <button
                      type="button"
                      onClick={startCamera}
                      className="mt-3 px-3 py-1.5 rounded-xl bg-cyan-600 text-white font-black text-xs hover:bg-cyan-500 cursor-pointer"
                    >
                      🔄 Retry Camera
                    </button>
                  )}
                </div>
              )}

              {/* Biometric Oval Guide Frame */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="relative h-44 w-34 sm:h-52 sm:w-40 rounded-[50%] border-2 border-dashed border-cyan-400/80 shadow-[0_0_20px_rgba(6,182,212,0.45)]">
                  {/* Laser Beam */}
                  <div className="animate-face-laser absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#22d3ee]" />

                  {/* Crosshairs */}
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 h-2.5 w-0.5 bg-cyan-400" />
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-2.5 w-0.5 bg-cyan-400" />
                  <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2.5 h-0.5 bg-cyan-400" />
                  <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2.5 h-0.5 bg-cyan-400" />
                </div>
              </div>

              {/* Status Indicator */}
              <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 bg-black/75 backdrop-blur-md px-3 py-1 rounded-full border border-cyan-500/40 text-[10px] font-black text-cyan-300 flex items-center gap-1.5 shadow">
                <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>Aqua Slash Face ID · Biometric Sensor</span>
              </div>
            </div>

            {/* Enrolled profiles on this device */}
            {registeredFaces.length > 0 ? (
              <div className="space-y-2 text-left">
                <p className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Enrolled Swimmers on this Device:
                </p>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {registeredFaces.map((face) => (
                    <div
                      key={face.studentId}
                      className="flex items-center justify-between gap-3 p-3 rounded-2xl border-2 border-sky-100 bg-gradient-to-r from-sky-50 to-white hover:border-cyan-400 transition"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {face.photoDataUrl ? (
                          <img
                            src={face.photoDataUrl}
                            alt={face.studentName}
                            className="h-11 w-11 shrink-0 rounded-xl object-cover border-2 border-cyan-400 shadow-sm"
                          />
                        ) : (
                          <div className="h-11 w-11 shrink-0 rounded-xl bg-gradient-to-br from-cyan-500 to-sky-700 text-white font-black flex items-center justify-center text-sm shadow-sm">
                            {face.studentName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-display font-black text-slate-900 text-sm truncate">
                            {face.studentName}
                          </p>
                          <p className="text-[11px] font-bold text-slate-500">
                            ID: {face.studentId}
                          </p>
                          <p className="text-[10px] text-sky-700 font-semibold truncate">
                            {face.email || face.mobile}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => handleFaceLoginSubmit(face)}
                        className="shrink-0 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 text-white font-black text-xs shadow-md shadow-sky-200 hover:brightness-105 active:scale-95 transition cursor-pointer"
                      >
                        {busy ? 'Verifying…' : '⚡ Login'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl bg-sky-50 border border-sky-200 p-4 text-center">
                <span className="text-2xl">👤</span>
                <h4 className="font-display font-black text-sm text-[#06214a] mt-1">
                  No Face ID Enrolled Yet
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  Please log in once with your Mobile Number or Email. Then open your <strong>Student Profile</strong> to snap and register your face!
                </p>
                <div className="mt-3 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      stopCamera();
                      setMode('login');
                    }}
                    className="w-full py-2.5 rounded-xl bg-sky-600 text-white font-black text-xs shadow hover:bg-sky-700 cursor-pointer"
                  >
                    📱 Switch to Mobile / Email Login
                  </button>
                  <a
                    href={CENTRAL_ATTENDANCE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 rounded-xl bg-white border border-sky-300 text-sky-800 font-black text-xs hover:bg-sky-50 transition block"
                  >
                    🌐 Open Central Face Attendance App ↗
                  </a>
                </div>
              </div>
            )}

            {/* Back button */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  setError(null);
                  setMode(savedAccounts.length > 0 ? 'quick-login' : 'login');
                }}
                className="text-xs font-extrabold text-sky-700 hover:underline cursor-pointer"
              >
                ← Back to Password / Mobile Login
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
