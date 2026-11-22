import { useEffect, useRef, useState } from 'react';
import type { Student } from '../lib/api';
import { whatsappLink, whatsappMessage } from '../lib/whatsapp';
import { CONFIG } from '../config';
import { cn } from '../utils/cn';

const Icon = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.9-4.45 9.9-9.91A9.86 9.86 0 0 0 12.04 2Zm5.8 14.04c-.24.68-1.42 1.3-1.95 1.34-.5.04-.97.23-3.27-.68-2.76-1.09-4.5-3.92-4.64-4.1-.13-.18-1.1-1.47-1.1-2.8 0-1.33.7-1.99.95-2.26.24-.27.53-.34.71-.34h.51c.16 0 .38-.06.6.46.23.54.77 1.87.84 2 .07.14.11.3.02.48-.09.18-.13.29-.27.45-.13.16-.28.35-.4.47-.13.13-.27.28-.12.55.16.27.7 1.15 1.5 1.86 1.03.92 1.9 1.2 2.17 1.34.27.13.43.11.58-.07.16-.18.67-.78.85-1.05.18-.27.36-.22.6-.13.25.09 1.57.74 1.84.88.27.13.45.2.52.31.07.11.07.65-.17 1.33Z" />
  </svg>
);

/** Fallback dialog: shown if the automatic WhatsApp tab could not be opened (e.g. a sandboxed preview blocking pop-ups). */
function WhatsAppFallback({ student, onClose }: { student: Pick<Student, 'studentId' | 'studentName'>; onClose: () => void }) {
  const href = whatsappLink(student);
  const message = whatsappMessage(student);
  const [copied, setCopied] = useState(false);
  const linkRef = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    linkRef.current?.focus();
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#06214a]/55 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="wa-title" onClick={onClose}>
      <div className="fade-up w-full max-w-sm rounded-[28px] bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-[#25D366] text-2xl text-white">
            <Icon />
          </span>
          <div>
            <h2 id="wa-title" className="font-display text-xl font-semibold text-[#06214a]">
              Message Aqua Slash
            </h2>
            <p className="text-xs font-bold text-slate-500">+{CONFIG.WHATSAPP_NUMBER}</p>
          </div>
        </div>
        <p className="text-sm font-semibold text-slate-600">If WhatsApp didn’t open automatically, tap below or copy the message and send it yourself.</p>
        <pre className="mt-3 whitespace-pre-wrap rounded-2xl bg-slate-50 p-3 text-sm font-semibold text-slate-700">{message}</pre>
        <div className="mt-4 grid gap-2">
          <a
            ref={linkRef}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-4 font-extrabold text-white shadow-md transition hover:bg-[#1ebe5b]"
          >
            <Icon /> Open WhatsApp
          </a>
          <button onClick={copy} className="min-h-12 rounded-2xl bg-slate-100 px-4 font-extrabold text-slate-600 transition hover:bg-slate-200">
            {copied ? '✓ Copied!' : '📋 Copy message'}
          </button>
          <button onClick={onClose} className="min-h-11 rounded-2xl px-4 text-sm font-bold text-slate-400 hover:text-slate-600">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/** 💬 WhatsApp Aqua Slash — pre-filled with the logged-in student's ID and name. Always tries a real tab first, with a guaranteed fallback. */
export function WhatsAppButton({ student, variant = 'full', className }: { student: Pick<Student, 'studentId' | 'studentName'>; variant?: 'full' | 'compact'; className?: string }) {
  const [showFallback, setShowFallback] = useState(false);
  const href = whatsappLink(student);

  const open = (e: React.MouseEvent) => {
    e.preventDefault();
    let win: Window | null = null;
    try {
      win = window.open(href, '_blank', 'noopener,noreferrer');
    } catch {
      win = null;
    }
    // Blocked (sandboxed preview / pop-up blocker) or the tab was opened but instantly closed → show the fallback dialog too.
    if (!win || win.closed) setShowFallback(true);
    else setTimeout(() => win?.closed && setShowFallback(true), 600);
  };

  const cls =
    variant === 'compact'
      ? cn('flex min-h-11 items-center gap-1.5 rounded-full bg-[#25D366] px-3 text-sm font-extrabold text-white shadow-md shadow-emerald-200 transition hover:bg-[#1ebe5b] focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200', className)
      : cn(
          'inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-5 font-extrabold text-white shadow-lg shadow-emerald-200 transition hover:-translate-y-0.5 hover:bg-[#1ebe5b] focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200',
          className,
        );

  return (
    <>
      <a href={href} target="_blank" rel="noopener noreferrer" onClick={open} className={cls} aria-label="WhatsApp Aqua Slash (opens WhatsApp with your Student ID and name)">
        <Icon className={variant === 'compact' ? 'h-5 w-5' : 'h-6 w-6'} />
        {variant === 'compact' ? <span className="hidden xl:inline">WhatsApp</span> : '💬 WhatsApp Aqua Slash'}
      </a>
      {showFallback && <WhatsAppFallback student={student} onClose={() => setShowFallback(false)} />}
    </>
  );
}
