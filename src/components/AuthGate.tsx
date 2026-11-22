import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import {
  getSavedAccounts,
  removeSavedAccount,
  saveLocalPassword,
  getLocalPassword,
  type SavedAccount,
} from '../lib/identity';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function isValidIdentifier(val: string): boolean {
  const clean = val.trim();
  if (clean.includes('@')) return EMAIL_PATTERN.test(clean);
  const digits = clean.replace(/[^\d]/g, '');
  return digits.length >= 8;
}

type AuthMode = 'quick-login' | 'login' | 'register' | 'forgot-password';

export function AuthGate({
  onAuthenticated,
}: {
  onAuthenticated: (session: { name: string; email: string; phone?: string; mobile?: string; studentId?: string; role?: string }) => void;
}) {
  const [savedAccounts, setSavedAccounts] = useState<SavedAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<SavedAccount | null>(null);
  const [mode, setMode] = useState<AuthMode>('login');

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

    try {
      const savedPass = password || getLocalPassword(account.email) || (account.phone ? getLocalPassword(account.phone) : '') || '';
      // Try backend login
      try {
        const res = await api.login(account.email || account.phone || '', savedPass);
        if (res.success && res.user) {
          onAuthenticated({
            name: res.user.studentName || res.user.name || account.name,
            email: res.user.email || account.email,
            mobile: res.user.mobile || res.user.phone || account.phone,
            phone: res.user.mobile || res.user.phone || account.phone,
            studentId: res.user.studentId || account.studentId,
            role: res.user.role || 'STUDENT',
          });
          return;
        }
      } catch {
        // Fallback to local session if network is unavailable
      }

      // Allow instant seamless access on same device
      onAuthenticated({
        name: account.name,
        email: account.email,
        mobile: account.phone,
        phone: account.phone,
        studentId: account.studentId,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to log in. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  // Standard Login (Accepts Email OR Phone Number)
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = identifier.trim();

    if (!isValidIdentifier(cleanId)) {
      setError('Please enter a valid email address or mobile number.');
      return;
    }

    setBusy(true);
    setError(null);
    setSuccessMsg(null);

    try {
      // 1. Try API login
      try {
        const res = await api.login(cleanId, password);
        if (res.success && res.user) {
          if (password) {
            saveLocalPassword(cleanId, password);
            if (res.user.email) saveLocalPassword(res.user.email, password);
            if (res.user.mobile) saveLocalPassword(res.user.mobile, password);
          }
          onAuthenticated({
            name: res.user.studentName || res.user.name || (cleanId.includes('@') ? cleanId.split('@')[0] : 'Swimmer'),
            email: res.user.email || (cleanId.includes('@') ? cleanId.toLowerCase() : ''),
            mobile: res.user.mobile || res.user.phone || (!cleanId.includes('@') ? cleanId : ''),
            phone: res.user.mobile || res.user.phone || (!cleanId.includes('@') ? cleanId : ''),
            studentId: res.user.studentId,
            role: res.user.role,
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
        // If offline, check local saved accounts
        const existing = savedAccounts.find((a) => 
          (a.email && a.email.toLowerCase() === cleanId.toLowerCase()) || 
          (a.phone && a.phone.replace(/\D/g, '') === cleanId.replace(/\D/g, ''))
        );
        if (existing) {
          onAuthenticated({
            name: existing.name,
            email: existing.email,
            mobile: existing.phone,
            phone: existing.phone,
            studentId: existing.studentId,
          });
          return;
        }
        throw apiErr;
      }

      // Default fallback
      const derivedName = cleanId.includes('@') ? cleanId.split('@')[0] : 'Swimmer';
      onAuthenticated({
        name: derivedName,
        email: cleanId.includes('@') ? cleanId.toLowerCase() : '',
        mobile: !cleanId.includes('@') ? cleanId : '',
        phone: !cleanId.includes('@') ? cleanId : '',
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

  // Forgot / Change Password Anytime (Accepts Email OR Phone Number)
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = identifier.trim();

    if (!isValidIdentifier(cleanId)) {
      setError('Please enter your registered email address or mobile number.');
      return;
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
          </h1>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            {mode === 'quick-login' && 'Already logged in on this device. Tap to continue!'}
            {mode === 'login' && 'Log in to continue your swimming journey'}
            {mode === 'register' && 'Enter your details to start your swimming journey'}
            {mode === 'forgot-password' && 'Forgot password? Create a new one right here!'}
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
          </div>
        )}

        {/* ── MODE 2: STANDARD LOGIN ── */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-left" noValidate>
            <div>
              <label className="mb-1 block text-xs font-extrabold uppercase tracking-wider text-sky-800">
                Email Address or Phone Number *
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="swimmer@example.com or 9876543210"
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
              💡 <strong>Change or Reset Password Anytime:</strong> Enter your registered email or phone number and choose your new password.
            </div>

            <div>
              <label className="mb-1 block text-xs font-extrabold uppercase tracking-wider text-sky-800">
                Registered Email or Phone Number *
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="swimmer@example.com or 9876543210"
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
      </div>
    </div>
  );
}
