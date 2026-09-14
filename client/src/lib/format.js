const DAY = 86400000;

export const inr = (value = 0) =>
  `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

export const inrCompact = (value = 0) => {
  const n = Number(value || 0);
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n}`;
};

export const formatDate = (value, options = {}) =>
  value
    ? new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', ...options })
    : '—';

export const formatDateTime = (value) =>
  value
    ? new Date(value).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
    : '—';

export const formatDay = (value) =>
  value ? new Date(value).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' }) : '—';

/** "in 3 days" / "5 hours ago" — used across deadlines, notices and activity. */
export function relativeTime(value) {
  if (!value) return '—';
  const diff = new Date(value).getTime() - Date.now();
  const abs = Math.abs(diff);
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  if (abs < 60000) return 'just now';
  if (abs < 3600000) return rtf.format(Math.round(diff / 60000), 'minute');
  if (abs < DAY) return rtf.format(Math.round(diff / 3600000), 'hour');
  if (abs < 30 * DAY) return rtf.format(Math.round(diff / DAY), 'day');
  if (abs < 365 * DAY) return rtf.format(Math.round(diff / (30 * DAY)), 'month');
  return rtf.format(Math.round(diff / (365 * DAY)), 'year');
}

export const daysUntil = (value) => Math.ceil((new Date(value).getTime() - Date.now()) / DAY);

export const initials = (name = '') =>
  name
    .replace(/^(Dr|Prof)\.?\s+/i, '')
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

export const percent = (value) => `${Number(value || 0).toFixed(1)}%`;

/** Shared tone scale: attendance, marks and fee health all read the same way. */
export function toneForPercentage(value) {
  if (value >= 85) return 'emerald';
  if (value >= 75) return 'brand';
  if (value >= 65) return 'amber';
  return 'rose';
}

export const gradeTone = (grade) => {
  if (['O', 'A+'].includes(grade)) return 'emerald';
  if (['A', 'B+'].includes(grade)) return 'brand';
  if (['B', 'C'].includes(grade)) return 'amber';
  if (grade === 'F') return 'rose';
  return 'slate';
};

export const bytes = (size = 0) => {
  if (size > 1048576) return `${(size / 1048576).toFixed(1)} MB`;
  if (size > 1024) return `${Math.round(size / 1024)} KB`;
  return `${size} B`;
};
