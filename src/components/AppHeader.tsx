import type { ReactNode } from 'react';
import type { Student } from '../lib/api';
import { WhatsAppButton } from './WhatsAppButton';
import { cn } from '../utils/cn';
import type { Section } from './JourneyHome';
import { Logo } from './Logo';

export const NAV: { key: Section; label: string; icon: string }[] = [
  { key: 'home', label: 'Journey', icon: '🧭' },
  { key: 'glass', label: 'Glass', icon: '🥛' },
  { key: 'pool', label: 'Pool', icon: '🏊' },
  { key: 'videos', label: 'My Videos', icon: '🎬' },
  { key: 'profile', label: 'Profile', icon: '👤' },
  { key: 'library', label: 'Swim Library', icon: '📚' },
];

function StudentChip({ student, onOpen }: { student: Student; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="flex min-h-11 items-center gap-1.5 rounded-full bg-white px-3 text-xs font-extrabold ring-1 ring-sky-100 transition hover:bg-sky-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-cyan-200"
      aria-label={`${student.studentName}. Open profile`}
    >
      <span className="grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br from-cyan-400 to-sky-600 text-[11px] font-black text-white" aria-hidden>
        {student.studentName.charAt(0).toUpperCase()}
      </span>
      <span className="hidden max-w-[8rem] truncate text-[#06214a] sm:inline">{student.studentName}</span>
    </button>
  );
}

/** Shared Aqua Slash header + navigation. No login, no sign up — just the journey. */
export function AppHeader({ student, section, onNavigate, locked, extra, onLogout }: { student: Student; section: Section; onNavigate: (s: Section) => void; locked?: boolean; extra?: ReactNode; onLogout?: () => void }) {
  return (
    <header className="relative md:sticky md:top-0 z-30 border-b border-sky-100/80 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-2 sm:px-6">
        <button onClick={() => !locked && onNavigate('home')} className="rounded-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-cyan-200" aria-label="Aqua Slash journey home">
          <Logo />
        </button>
        <div className="flex items-center gap-1.5 sm:gap-2">
          {extra}
          <WhatsAppButton student={student} variant="compact" />
          <button
            onClick={() => {
              sessionStorage.clear();
              window.location.reload();
            }}
            className="flex min-h-11 items-center justify-center rounded-full bg-slate-100 px-2.5 text-xs font-extrabold text-slate-700 transition hover:bg-slate-200 focus:outline-none"
            title="Refresh app to latest version"
            aria-label="Refresh app to latest version"
          >
            🔄 <span className="hidden lg:inline ml-1">Refresh</span>
          </button>
          {onLogout && (
            <button
              onClick={onLogout}
              className="min-h-11 rounded-full bg-slate-100 px-3 text-xs font-extrabold text-slate-700 transition hover:bg-slate-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-cyan-200"
              aria-label="Log out"
            >
              Logout
            </button>
          )}
          <StudentChip student={student} onOpen={() => !locked && onNavigate('profile')} />
        </div>
      </div>
      <nav className="mx-auto max-w-6xl px-1.5 pb-2 pt-1 sm:px-6" aria-label="Main">
        <ul className="grid grid-cols-6 gap-0.5 sm:gap-1 rounded-2xl bg-sky-50 p-1">
          {NAV.map((n) => (
            <li key={n.key}>
              <button
                onClick={() => onNavigate(n.key)}
                disabled={locked && n.key !== section}
                aria-current={section === n.key ? 'page' : undefined}
                className={cn(
                  'flex min-h-10 w-full flex-col items-center justify-center rounded-xl px-0.5 py-1 text-[10px] sm:text-xs font-extrabold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 sm:flex-row sm:gap-1.5 sm:text-sm',
                  section === n.key ? 'bg-[#06214a] text-white shadow' : 'text-sky-700 hover:bg-white',
                  locked && n.key !== section && 'cursor-not-allowed opacity-50',
                )}
              >
                <span aria-hidden>{n.icon}</span>
                <span className="truncate max-w-full">
                  {n.key === 'library' ? (
                    <>
                      <span className="hidden sm:inline">Swim </span>Library
                    </>
                  ) : n.key === 'videos' ? (
                    <>
                      <span className="hidden sm:inline">My </span>Videos
                    </>
                  ) : (
                    n.label
                  )}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
