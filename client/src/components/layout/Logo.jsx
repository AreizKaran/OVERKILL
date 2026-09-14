import { cx } from '../ui/index.jsx';

export function Logo({ className, size = 36, showWordmark = true, compact = false }) {
  return (
    <span className={cx('flex items-center gap-2.5', className)}>
      <svg viewBox="0 0 64 64" width={size} height={size} className="shrink-0" role="img" aria-label="eCampus ELO Portal">
        <defs>
          <linearGradient id="logoGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#5d87fd" />
            <stop offset="100%" stopColor="#131a4c" />
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx="16" fill="url(#logoGradient)" />
        <path d="M32 15 L52 25 L32 35 L12 25 Z" fill="#fdb022" />
        <path d="M20 29.5 V40 c0 4.5 5.4 8 12 8 s12-3.5 12-8 V29.5 L32 38.5 Z" fill="#ffffff" fillOpacity="0.92" />
      </svg>
      {showWordmark && (
        <span className="min-w-0 leading-tight">
          <span className="block truncate font-display text-[0.9375rem] font-extrabold tracking-tight text-ink-900 dark:text-white">
            eCampus <span className="text-brand-600 dark:text-brand-300">ELO</span>
          </span>
          {!compact && (
            <span className="block truncate text-[0.6875rem] font-medium tracking-wide text-ink-500 uppercase dark:text-ink-400">
              SMIT Portal
            </span>
          )}
        </span>
      )}
    </span>
  );
}
