import { motion } from 'framer-motion';

export function PageHeader({ eyebrow, title, description, actions, children }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="mb-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          {eyebrow && <p className="eyebrow mb-1.5">{eyebrow}</p>}
          <h1 className="font-display text-2xl font-bold tracking-tight text-balance sm:text-[1.75rem]">{title}</h1>
          {description && (
            <p className="mt-1.5 max-w-2xl text-sm text-pretty text-ink-500 dark:text-ink-400">{description}</p>
          )}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {children}
    </motion.header>
  );
}
