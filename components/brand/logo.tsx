export function PerchMark({ className = 'h-7 w-7' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="var(--brand)" />
      <circle cx="16" cy="8.5" r="2.4" fill="var(--brand-gold)" />
      <path
        d="M7 23 L16 13 L25 23"
        stroke="var(--paper)"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.5 23 L16 18 L20.5 23"
        stroke="var(--brand-mint)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.9"
      />
    </svg>
  )
}

export function PerchWordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2 ${className}`}>
      <PerchMark />
      <span className="font-display text-xl font-semibold tracking-tight text-[var(--brand)]">
        perch
      </span>
    </span>
  )
}
