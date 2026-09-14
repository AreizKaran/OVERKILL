import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Inbox } from 'lucide-react';

export const cx = (...classes) => classes.filter(Boolean).join(' ');

/* --------------------------------- Card --------------------------------- */
export function Card({ as: Tag = 'section', className, children, interactive = false, ...rest }) {
  return (
    <Tag
      className={cx(
        // min-w-0 lets a card shrink inside a grid/flex track so wide tables scroll
        // inside their own box instead of widening the page.
        'surface min-w-0 p-5 sm:p-6',
        interactive && 'transition duration-200 hover:-translate-y-0.5 hover:shadow-lift',
        className
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export function CardHeader({ title, subtitle, icon: Icon, action, className }) {
  return (
    <div className={cx('mb-5 flex items-start justify-between gap-4', className)}>
      <div className="flex min-w-0 items-start gap-3">
        {Icon && (
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-500/10 text-brand-600 dark:bg-brand-400/10 dark:text-brand-300">
            <Icon size={18} aria-hidden="true" />
          </span>
        )}
        <div className="min-w-0">
          <h3 className="line-clamp-2 text-[0.95rem] font-semibold">{title}</h3>
          {subtitle && <p className="mt-0.5 text-[0.8125rem] text-ink-500 dark:text-ink-400">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/* -------------------------------- Button -------------------------------- */
const BUTTON_VARIANTS = {
  primary:
    'bg-brand-600 text-white shadow-sm hover:bg-brand-700 active:bg-brand-800 disabled:bg-brand-300 dark:disabled:bg-brand-900',
  secondary:
    'border border-ink-200 bg-white text-ink-700 hover:bg-ink-50 dark:border-white/10 dark:bg-white/5 dark:text-ink-200 dark:hover:bg-white/10',
  ghost: 'text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-white/5',
  danger: 'bg-rose-600 text-white hover:bg-rose-700',
  gold: 'bg-gold-400 text-ink-950 hover:bg-gold-300',
};

const BUTTON_SIZES = {
  sm: 'h-8 gap-1.5 px-3 text-[0.8125rem]',
  md: 'h-10 gap-2 px-4 text-sm',
  lg: 'h-12 gap-2 px-6 text-[0.9375rem]',
};

export const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', icon: Icon, loading = false, className, children, ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      className={cx(
        'inline-flex items-center justify-center rounded-xl font-medium whitespace-nowrap transition',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500',
        'disabled:cursor-not-allowed disabled:opacity-60',
        BUTTON_VARIANTS[variant],
        BUTTON_SIZES[size],
        className
      )}
      disabled={loading || rest.disabled}
      {...rest}
    >
      {loading ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : Icon && <Icon size={16} aria-hidden="true" />}
      {children}
    </button>
  );
});

/* --------------------------------- Badge -------------------------------- */
const BADGE_TONES = {
  brand: 'bg-brand-500/10 text-brand-700 dark:bg-brand-400/15 dark:text-brand-200',
  emerald: 'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300',
  amber: 'bg-amber-500/15 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300',
  rose: 'bg-rose-500/10 text-rose-700 dark:bg-rose-400/15 dark:text-rose-300',
  slate: 'bg-ink-500/10 text-ink-600 dark:bg-white/10 dark:text-ink-300',
  gold: 'bg-gold-400/20 text-gold-700 dark:bg-gold-400/15 dark:text-gold-300',
};

export function Badge({ tone = 'slate', children, className, icon: Icon }) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[0.75rem] font-medium whitespace-nowrap',
        BADGE_TONES[tone] ?? BADGE_TONES.slate,
        className
      )}
    >
      {Icon && <Icon size={12} aria-hidden="true" />}
      {children}
    </span>
  );
}

/* ------------------------------- Progress ------------------------------- */
const BAR_TONES = {
  brand: 'bg-brand-500',
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  rose: 'bg-rose-500',
  slate: 'bg-ink-400',
};

export function Progress({ value = 0, tone = 'brand', className, label, showValue = false, size = 'md' }) {
  const clamped = Math.min(100, Math.max(0, Number(value) || 0));
  return (
    <div className={className}>
      {(label || showValue) && (
        <div className="mb-1.5 flex items-baseline justify-between gap-2 text-[0.8125rem]">
          {label && <span className="truncate text-ink-600 dark:text-ink-400">{label}</span>}
          {showValue && <span className="font-semibold tabular-nums">{clamped.toFixed(1)}%</span>}
        </div>
      )}
      <div
        className={cx('w-full overflow-hidden rounded-full bg-ink-200/80 dark:bg-white/10', size === 'sm' ? 'h-1.5' : 'h-2')}
        role="progressbar"
        aria-valuenow={Math.round(clamped)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || 'Progress'}
      >
        <motion.div
          className={cx('h-full rounded-full', BAR_TONES[tone] ?? BAR_TONES.brand)}
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
}

/* -------------------------------- Avatar -------------------------------- */
const AVATAR_SIZES = { sm: 'size-8 text-[0.7rem]', md: 'size-10 text-xs', lg: 'size-14 text-sm', xl: 'size-20 text-lg' };

export function Avatar({ name = '', src, size = 'md', className, ring = false }) {
  const text = name
    .replace(/^(Dr|Prof)\.?\s+/i, '')
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <span
      className={cx(
        'grid shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-brand-500 to-brand-800 font-semibold text-white',
        AVATAR_SIZES[size],
        ring && 'ring-2 ring-white ring-offset-1 dark:ring-ink-900',
        className
      )}
      aria-hidden="true"
    >
      {src ? <img src={src} alt="" className="size-full object-cover" /> : text || '··'}
    </span>
  );
}

/* --------------------------------- Table -------------------------------- */
export function Table({ children, className }) {
  return (
    <div className={cx('scrollbox', className)}>
      <table className="w-full min-w-[38rem] border-collapse text-left text-sm">{children}</table>
    </div>
  );
}

export function Th({ children, className, align = 'left' }) {
  return (
    <th
      scope="col"
      className={cx(
        'border-b border-ink-200 px-3 py-2.5 text-[0.75rem] font-semibold tracking-wide text-ink-500 uppercase dark:border-white/10 dark:text-ink-400',
        align === 'right' && 'text-right',
        align === 'center' && 'text-center',
        className
      )}
    >
      {children}
    </th>
  );
}

export function Td({ children, className, align = 'left' }) {
  return (
    <td
      className={cx(
        'border-b border-ink-100 px-3 py-3 align-middle dark:border-white/5',
        align === 'right' && 'text-right',
        align === 'center' && 'text-center',
        className
      )}
    >
      {children}
    </td>
  );
}

/* ------------------------------ Empty & load ----------------------------- */
export function EmptyState({ icon: Icon = Inbox, title, description, action, className }) {
  return (
    <div className={cx('flex flex-col items-center justify-center px-6 py-14 text-center', className)}>
      <span className="mb-4 grid size-12 place-items-center rounded-2xl bg-ink-100 text-ink-400 dark:bg-white/5 dark:text-ink-500">
        <Icon size={22} aria-hidden="true" />
      </span>
      <p className="font-display font-semibold text-ink-800 dark:text-ink-100">{title}</p>
      {description && <p className="mt-1.5 max-w-sm text-sm text-ink-500 dark:text-ink-400">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Spinner({ label = 'Loading' }) {
  return (
    <div className="flex items-center justify-center gap-2 py-12 text-sm text-ink-500 dark:text-ink-400">
      <Loader2 size={16} className="animate-spin" aria-hidden="true" />
      {label}…
    </div>
  );
}

export function SkeletonCard({ lines = 3, className }) {
  return (
    <div className={cx('surface p-5', className)} aria-hidden="true">
      <div className="skeleton mb-4 h-4 w-1/3" />
      {Array.from({ length: lines }).map((_, index) => (
        <div key={index} className="skeleton mb-2.5 h-3" style={{ width: `${92 - index * 14}%` }} />
      ))}
    </div>
  );
}

/* --------------------------------- Form --------------------------------- */
export function Field({ label, hint, error, required, children, className }) {
  return (
    <label className={cx('block', className)}>
      {label && (
        <span className="label">
          {label}
          {required && <span className="ml-0.5 text-rose-500">*</span>}
        </span>
      )}
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-ink-400">{hint}</span>}
      {error && <span className="mt-1 block text-xs text-rose-600 dark:text-rose-400">{error}</span>}
    </label>
  );
}

export const Input = forwardRef(function Input({ className, ...rest }, ref) {
  return <input ref={ref} className={cx('field', className)} {...rest} />;
});

export const Select = forwardRef(function Select({ className, children, ...rest }, ref) {
  return (
    <select ref={ref} className={cx('field appearance-none pr-9', className)} {...rest}>
      {children}
    </select>
  );
});

export const Textarea = forwardRef(function Textarea({ className, ...rest }, ref) {
  return <textarea ref={ref} className={cx('field min-h-28 resize-y', className)} {...rest} />;
});

/* --------------------------------- Tabs --------------------------------- */
export function Tabs({ tabs, value, onChange, className }) {
  return (
    <div
      role="tablist"
      className={cx('scrollbox flex gap-1 rounded-xl bg-ink-100/70 p-1 dark:bg-white/5', className)}
    >
      {tabs.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(tab.value)}
            className={cx(
              'relative flex-1 rounded-lg px-3 py-1.5 text-sm font-medium whitespace-nowrap transition',
              active ? 'text-ink-900 dark:text-white' : 'text-ink-500 hover:text-ink-800 dark:text-ink-400 dark:hover:text-ink-200'
            )}
          >
            {active && (
              <motion.span
                layoutId={`tab-${tabs.map((t) => t.value).join('-')}`}
                className="absolute inset-0 rounded-lg bg-white shadow-sm dark:bg-white/10"
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              />
            )}
            <span className="relative z-10 flex items-center justify-center gap-1.5">
              {tab.label}
              {tab.count !== undefined && (
                <span className="rounded-full bg-ink-200 px-1.5 text-[0.6875rem] tabular-nums dark:bg-white/10">
                  {tab.count}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
