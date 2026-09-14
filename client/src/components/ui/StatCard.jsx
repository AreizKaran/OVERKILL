import { motion } from 'framer-motion';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { cx } from './index.jsx';

const TONES = {
  brand: 'from-brand-500/12 to-brand-500/0 text-brand-600 dark:text-brand-300',
  emerald: 'from-emerald-500/12 to-emerald-500/0 text-emerald-600 dark:text-emerald-400',
  amber: 'from-amber-500/15 to-amber-500/0 text-amber-600 dark:text-amber-400',
  rose: 'from-rose-500/12 to-rose-500/0 text-rose-600 dark:text-rose-400',
  gold: 'from-gold-400/20 to-gold-400/0 text-gold-600 dark:text-gold-300',
  slate: 'from-ink-500/10 to-ink-500/0 text-ink-600 dark:text-ink-300',
};

export function StatCard({ label, value, sub, icon: Icon, tone = 'brand', trend, index = 0, className }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      className={cx('surface relative overflow-hidden p-5', className)}
    >
      <div className={cx('pointer-events-none absolute inset-0 bg-gradient-to-br', TONES[tone]?.split(' ').slice(0, 2).join(' '))} />
      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[0.8125rem] font-medium text-ink-500 dark:text-ink-400">{label}</p>
          {Icon && (
            <span className={cx('grid size-9 place-items-center rounded-xl bg-white/70 shadow-sm dark:bg-white/10', TONES[tone]?.split(' ').slice(2).join(' '))}>
              <Icon size={17} aria-hidden="true" />
            </span>
          )}
        </div>
        <p className="mt-3 font-display text-2xl font-bold tracking-tight text-ink-900 tabular-nums sm:text-[1.75rem] dark:text-white">
          {value}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
          {sub && <span className="text-[0.8125rem] text-ink-500 dark:text-ink-400">{sub}</span>}
          {trend !== undefined && trend !== null && (
            <span
              className={cx(
                'inline-flex items-center gap-0.5 text-[0.75rem] font-semibold',
                trend >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              )}
            >
              {trend >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
              {Math.abs(trend)}%
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
