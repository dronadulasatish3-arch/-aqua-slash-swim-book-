export function RoleBadge({ role, className = '' }: { role: 'STUDENT' | 'ADMIN'; className?: string }) {
  if (role !== 'ADMIN') return null;
  return (
    <span className={`inline-flex items-center rounded-full bg-fuchsia-600 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.18em] text-white ring-1 ring-fuchsia-400/60 ${className}`} title="Admin account">
      🛠 Admin
    </span>
  );
}

export function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <svg width="38" height="44" viewBox="0 0 24 29" aria-hidden>
        <defs>
          <linearGradient id="logoG" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#67e8f9" />
            <stop offset="1" stopColor="#0369a1" />
          </linearGradient>
        </defs>
        <path d="M12 1.5 C16 8 21 12.5 21 18.5 A9 9 0 0 1 3 18.5 C3 12.5 8 8 12 1.5 Z" fill="url(#logoG)" />
        <path d="M6 19 q3 -2.5 6 0 t6 0" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <path d="M14 7 l-5 9" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" opacity="0.8" />
      </svg>
      <div className="leading-none">
        <p className="font-display text-xl font-bold tracking-wide text-[#06214a] sm:text-2xl">
          AQUA <span className="text-sky-500">SLASH</span>
        </p>
        <p className="mt-0.5 text-[10px] font-extrabold uppercase tracking-[0.25em] text-sky-600/80">Swim Book</p>
      </div>
    </div>
  );
}
