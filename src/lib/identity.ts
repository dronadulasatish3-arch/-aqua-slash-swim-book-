import { useSyncExternalStore } from 'react';
import type { Student } from './api';
import { browserKV } from './storage';
import { getAuthorizedChildrenForAccount, getRegisteredStudents, saveRegisteredStudent, type StudentRecord } from '../data/studentRegistry';

const PROFILE_KEY = 'aquaslash-profile-v1';
const AUTH_KEY = 'aquaslash-auth-v1';
const EMAIL_PROFILES_KEY = 'aquaslash-email-profiles-v1';
const PROFILE_OWNER_KEY = 'aquaslash-profile-owner-v1';
const SAVED_ACCOUNTS_KEY = 'aquaslash-saved-accounts-v1';
const PASSWORDS_KEY = 'aquaslash-passwords-v1';

export interface LocalProfile {
  studentId: string;
  studentName: string;
}

export interface AuthSession {
  demo: true;
  name: string;
  email: string;
  mobile?: string;
  phone?: string;
  studentId?: string;
  role?: string;
}

export interface SavedAccount {
  name: string;
  email: string;
  mobile?: string;
  phone?: string;
  studentId: string;
  lastLogin: string;
}

function randomId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return 'AS-' + code;
}

export function getSavedAccounts(): SavedAccount[] {
  try {
    const raw = browserKV.get(SAVED_ACCOUNTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    /* ignore */
  }

  // Fallback: check profile and profile owner
  const owner = browserKV.get(PROFILE_OWNER_KEY);
  const p = readProfile();
  if (owner && p?.studentName && owner.includes('@')) {
    return [
      {
        name: p.studentName,
        email: owner.toLowerCase(),
        studentId: p.studentId,
        lastLogin: new Date().toISOString(),
      },
    ];
  }
  return [];
}

export function saveSavedAccount(account: SavedAccount) {
  const current = getSavedAccounts().filter((a) => a.email.toLowerCase() !== account.email.toLowerCase());
  current.unshift(account);
  browserKV.set(SAVED_ACCOUNTS_KEY, JSON.stringify(current.slice(0, 10)));
}

export function removeSavedAccount(email: string) {
  const current = getSavedAccounts().filter((a) => a.email.toLowerCase() !== email.toLowerCase());
  browserKV.set(SAVED_ACCOUNTS_KEY, JSON.stringify(current));
  if (browserKV.get(PROFILE_OWNER_KEY)?.toLowerCase() === email.toLowerCase()) {
    browserKV.remove(PROFILE_OWNER_KEY);
  }
}

export function getLocalPassword(email: string): string | null {
  try {
    const raw = browserKV.get(PASSWORDS_KEY);
    if (raw) {
      const map = JSON.parse(raw) as Record<string, string>;
      return map[email.toLowerCase()] || null;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function saveLocalPassword(email: string, password: string) {
  try {
    let map: Record<string, string> = {};
    const raw = browserKV.get(PASSWORDS_KEY);
    if (raw) map = JSON.parse(raw);
    map[email.toLowerCase()] = password;
    browserKV.set(PASSWORDS_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

function readProfile(): LocalProfile {
  try {
    const raw = browserKV.get(PROFILE_KEY);
    if (raw) {
      const p = JSON.parse(raw) as LocalProfile;
      if (p && p.studentId && p.studentName) return p;
    }
  } catch {
    /* ignore */
  }
  const fresh: LocalProfile = { studentId: randomId(), studentName: 'Swimmer' };
  browserKV.set(PROFILE_KEY, JSON.stringify(fresh));
  return fresh;
}

function bindProfileToEmail(session: AuthSession) {
  let email = session.email.trim().toLowerCase();
  let mobile = session.mobile || session.phone || '';

  // Cross-reference registry so both email & mobile are populated
  try {
    const regStudents = getRegisteredStudents();
    const match = regStudents.find(
      (s) =>
        (email && s.email && s.email.toLowerCase() === email) ||
        (mobile && s.mobile && s.mobile.replace(/\D/g, '') === mobile.replace(/\D/g, '')) ||
        (session.studentId && s.studentId === session.studentId)
    );
    if (match) {
      if (!email && match.email) email = match.email.toLowerCase();
      if (!mobile && match.mobile) mobile = match.mobile;
      session.email = email;
      session.mobile = mobile;
      session.phone = mobile;
      if (!session.studentId && match.studentId) session.studentId = match.studentId;
    }
  } catch (e) {
    console.warn('Error cross-linking student contacts:', e);
  }

  let emailProfiles: Record<string, string> = {};
  try {
    const raw = browserKV.get(EMAIL_PROFILES_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        emailProfiles = parsed as Record<string, string>;
      }
    }
  } catch {
    emailProfiles = {};
  }

  const owner = browserKV.get(PROFILE_OWNER_KEY);
  const studentId = session.studentId || (email ? emailProfiles[email] : '') || (mobile ? emailProfiles[mobile] : '') || (owner === null || owner === (email || mobile) ? profile.studentId : randomId());
  if (email) emailProfiles[email] = studentId;
  if (mobile) emailProfiles[mobile] = studentId;
  profile = { studentId, studentName: session.name };
  browserKV.set(EMAIL_PROFILES_KEY, JSON.stringify(emailProfiles));
  browserKV.set(PROFILE_OWNER_KEY, email || mobile || studentId);
  browserKV.set(PROFILE_KEY, JSON.stringify(profile));

  // Save to saved accounts list for easy 1-click re-login
  saveSavedAccount({
    name: session.name,
    email: email,
    mobile: mobile,
    phone: mobile,
    studentId: studentId,
    lastLogin: new Date().toISOString(),
  });
}

function readRegistrationHandoff(): AuthSession | null {
  if (typeof window === 'undefined' || !window.location.hash.startsWith('#as-register=')) return null;

  try {
    const encoded = window.location.hash.slice('#as-register='.length);
    const handoff: unknown = JSON.parse(decodeURIComponent(encoded));
    if (!handoff || typeof handoff !== 'object') throw new Error('Invalid registration handoff.');

    const details = handoff as { name?: unknown; email?: unknown; studentId?: unknown; mobile?: unknown; phone?: unknown };
    const name = typeof details.name === 'string' ? details.name.trim().slice(0, 60) : '';
    const email = typeof details.email === 'string' ? details.email.trim().toLowerCase() : '';
    const mobile = typeof details.mobile === 'string' ? details.mobile.trim() : (typeof details.phone === 'string' ? details.phone.trim() : '');
    const studentId = typeof details.studentId === 'string' ? details.studentId.trim() : undefined;
    if (!name || (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) && mobile.length < 8)) {
      throw new Error('Invalid registration handoff.');
    }

    const session: AuthSession = { demo: true, name, email, mobile, phone: mobile, studentId };
    bindProfileToEmail(session);
    browserKV.set(AUTH_KEY, JSON.stringify(session));
    window.history.replaceState(window.history.state, '', window.location.pathname + window.location.search);
    return session;
  } catch {
    window.history.replaceState(window.history.state, '', window.location.pathname + window.location.search);
    return null;
  }
}

function readAuthSession(): AuthSession | null {
  const registrationSession = readRegistrationHandoff();
  if (registrationSession) return registrationSession;

  try {
    const raw = browserKV.get(AUTH_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthSession & { student?: Student };
    if (parsed?.demo === true && (typeof parsed.email === 'string' || typeof (parsed as any).mobile === 'string') && typeof parsed.name === 'string') {
      const session: AuthSession = {
        demo: true,
        name: parsed.name,
        email: (parsed.email || '').trim().toLowerCase(),
        mobile: parsed.mobile || parsed.phone || '',
        phone: parsed.mobile || parsed.phone || '',
        studentId: parsed.studentId,
        role: parsed.role,
      };
      bindProfileToEmail(session);
      return session;
    }
  } catch {
    browserKV.remove(AUTH_KEY);
  }
  browserKV.remove(AUTH_KEY);
  return null;
}

let profile: LocalProfile = readProfile();
let authSession: AuthSession | null = readAuthSession();
let version = 0;
const listeners = new Set<() => void>();

function notify() {
  version += 1;
  listeners.forEach((f) => f());
}

export const profileStore = {
  get: () => profile,
  getVersion: () => version,
  rename(name: string) {
    const clean = name.trim().slice(0, 60) || 'Swimmer';
    profile = { ...profile, studentName: clean };
    browserKV.set(PROFILE_KEY, JSON.stringify(profile));
    if (authSession) {
      authSession = { ...authSession, name: clean };
      browserKV.set(AUTH_KEY, JSON.stringify(authSession));
      saveSavedAccount({
        name: clean,
        email: authSession.email,
        mobile: authSession.mobile || authSession.phone || '',
        phone: authSession.mobile || authSession.phone || '',
        studentId: profile.studentId,
        lastLogin: new Date().toISOString(),
      });
    }
    notify();
  },
  updateContactInfo(info: { email: string; mobile: string; name?: string }) {
    const cleanEmail = info.email.trim().toLowerCase();
    const cleanMobile = info.mobile.trim();
    const cleanName = info.name?.trim() || profile.studentName;
    profile = { ...profile, studentName: cleanName };
    browserKV.set(PROFILE_KEY, JSON.stringify(profile));
    if (authSession) {
      authSession = {
        ...authSession,
        name: cleanName,
        email: cleanEmail,
        mobile: cleanMobile,
        phone: cleanMobile,
      };
      browserKV.set(AUTH_KEY, JSON.stringify(authSession));
    }
    saveSavedAccount({
      name: cleanName,
      email: cleanEmail,
      mobile: cleanMobile,
      phone: cleanMobile,
      studentId: profile.studentId,
      lastLogin: new Date().toISOString(),
    });
    saveRegisteredStudent({
      studentId: profile.studentId,
      studentName: cleanName,
      email: cleanEmail,
      mobile: cleanMobile,
      currentLevel: 'Level 1',
      role: 'STUDENT',
      status: 'Active',
      lastLogin: new Date().toISOString(),
    });
    notify();
  },
  switchChild(childId: string) {
    const identifier = authSession?.email || authSession?.mobile || authSession?.phone || authSession?.studentId || '';
    const children = getAuthorizedChildrenForAccount(identifier);
    const target = children.find((c) => c.studentId === childId);
    if (target) {
      profile = {
        studentId: target.studentId,
        studentName: target.studentName,
      };
      browserKV.set(PROFILE_KEY, JSON.stringify(profile));
      notify();
    }
  },
  setAuth(session: Omit<AuthSession, 'demo'> | null) {
    authSession = session
      ? {
          demo: true,
          name: session.name.trim(),
          email: session.email.trim().toLowerCase(),
          mobile: session.mobile || session.phone || '',
          phone: session.mobile || session.phone || '',
          studentId: session.studentId,
          role: session.role,
        }
      : null;
    if (authSession) {
      bindProfileToEmail(authSession);
      browserKV.set(AUTH_KEY, JSON.stringify(authSession));
    } else {
      browserKV.remove(AUTH_KEY);
    }
    notify();
  },
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};

function useProfile() {
  useSyncExternalStore(profileStore.subscribe, profileStore.getVersion, profileStore.getVersion);
  return profileStore.get();
}

function profileAsStudent(p: LocalProfile, email = '', mobile = ''): Student {
  let resolvedEmail = email;
  let resolvedMobile = mobile;
  if (!resolvedEmail || !resolvedMobile) {
    try {
      const regStudents = getRegisteredStudents();
      const found = regStudents.find(
        (s) =>
          (p.studentId && s.studentId === p.studentId) ||
          (email && s.email && s.email.toLowerCase() === email.toLowerCase()) ||
          (mobile && s.mobile && s.mobile.replace(/\D/g, '') === mobile.replace(/\D/g, ''))
      );
      if (found) {
        if (!resolvedEmail && found.email) resolvedEmail = found.email;
        if (!resolvedMobile && found.mobile) resolvedMobile = found.mobile;
      }
    } catch {
      /* ignore */
    }
  }
  return {
    studentId: p.studentId,
    studentName: p.studentName,
    email: resolvedEmail,
    mobile: resolvedMobile,
    age: '',
    parentName: '',
    parentMobile: '',
    emergencyContactName: '',
    emergencyContactNumber: '',
    currentLevel: '',
    role: 'STUDENT',
    status: 'Active',
    lastLogin: '',
  };
}

export function useIdentity() {
  const p = useProfile();
  const session = authSession ?? null;

  const userIdentifier = session?.email || session?.mobile || session?.phone || session?.studentId || p.studentId;
  const authorizedChildren: StudentRecord[] = getAuthorizedChildrenForAccount(userIdentifier);
  const authorizedStudentIds = authorizedChildren.map((c) => c.studentId);
  if (p.studentId && !authorizedStudentIds.includes(p.studentId)) {
    authorizedStudentIds.push(p.studentId);
  }

  return {
    student: {
      ...profileAsStudent(p, session?.email ?? '', session?.mobile || session?.phone || ''),
      studentName: p.studentName || session?.name || 'Swimmer',
      mobile: session?.mobile || session?.phone || '',
      role:
        (session?.role as 'STUDENT' | 'ADMIN') ||
        (session?.email?.toLowerCase().includes('dronadulasatish') ||
        session?.email?.toLowerCase().includes('admin@aquaslash.com') ||
        (session?.mobile && session.mobile.replace(/\D/g, '').includes('6305252050')) ||
        (session?.phone && session.phone.replace(/\D/g, '').includes('6305252050'))
          ? 'ADMIN'
          : 'STUDENT'),
    },
    authorizedChildren,
    authorizedStudentIds,
    activeChildId: p.studentId,
    switchChild(childId: string) {
      profileStore.switchChild(childId);
    },
    token: null,
    isAuthenticated: !!session,
    login(session: Omit<AuthSession, 'demo'>) {
      profileStore.setAuth(session);
    },
    logout() {
      profileStore.setAuth(null);
    },
  };
}

export const renameProfile = profileStore.rename;
export const setAuthSession = profileStore.setAuth;
export const switchActiveChild = profileStore.switchChild;
