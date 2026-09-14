import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, Menu, Moon, Search, Sun, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useApi } from '../../lib/useApi.js';
import { api, isDemoMode } from '../../lib/api.js';
import { relativeTime } from '../../lib/format.js';
import { navigationForRole } from './navigation.js';
import { Avatar, Badge, cx } from '../ui/index.jsx';

export function Topbar({ onOpenNav }) {
  const { user } = useAuth();
  const { isDark, toggle } = useTheme();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);
  const bellRef = useRef(null);

  const { data: notifications, meta, reload } = useApi('/notifications');
  const unread = meta?.unread ?? 0;

  const links = navigationForRole(user.role).flatMap((group) => group.items);
  const matches = query.trim()
    ? links.filter((item) => item.label.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 6)
    : [];

  // Close the popovers on an outside click or Escape.
  useEffect(() => {
    const onClick = (event) => {
      if (bellRef.current && !bellRef.current.contains(event.target)) setShowNotifications(false);
      if (searchRef.current && !searchRef.current.contains(event.target)) setShowResults(false);
    };
    const onKey = (event) => {
      if (event.key === 'Escape') {
        setShowNotifications(false);
        setShowResults(false);
      }
      if (event.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        event.preventDefault();
        searchRef.current?.querySelector('input')?.focus();
      }
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const markAllRead = async () => {
    await api.post('/notifications/read-all');
    reload();
  };

  const openNotification = async (item) => {
    if (!item.read) await api.patch(`/notifications/${item._id}/read`);
    setShowNotifications(false);
    reload();
    if (item.link) navigate(item.link);
  };

  return (
    <header className="glass sticky top-0 z-40 flex h-16 shrink-0 items-center gap-2 border-b border-ink-200/70 px-3 sm:gap-3 sm:px-5 dark:border-white/10">
      <button
        type="button"
        onClick={onOpenNav}
        className="rounded-xl p-2 text-ink-500 transition hover:bg-ink-100 hover:text-ink-900 lg:hidden dark:hover:bg-white/10 dark:hover:text-white"
        aria-label="Open navigation menu"
      >
        <Menu size={20} />
      </button>

      {/* Quick jump between modules */}
      <div ref={searchRef} className="relative min-w-0 flex-1 sm:max-w-sm">
        <Search size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-400" aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          placeholder="Jump to a module…"
          aria-label="Search portal modules"
          className="h-10 w-full rounded-xl border border-ink-200/80 bg-white/70 pr-10 pl-9 text-sm transition placeholder:text-ink-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 focus:outline-none dark:border-white/10 dark:bg-white/5"
        />
        <kbd className="pointer-events-none absolute top-1/2 right-3 hidden -translate-y-1/2 rounded border border-ink-200 px-1.5 text-[0.6875rem] text-ink-400 sm:block dark:border-white/10">
          /
        </kbd>

        <AnimatePresence>
          {showResults && matches.length > 0 && (
            <motion.ul
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="surface absolute top-full left-0 z-50 mt-2 w-full overflow-hidden p-1.5"
            >
              {matches.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    onClick={() => {
                      setShowResults(false);
                      setQuery('');
                    }}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition hover:bg-ink-100 dark:hover:bg-white/5"
                  >
                    <item.icon size={16} className="text-ink-400" aria-hidden="true" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>

      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        {isDemoMode && (
          <Badge tone="gold" className="hidden md:inline-flex">
            Demo Mode
          </Badge>
        )}

        <button
          type="button"
          onClick={toggle}
          className="rounded-xl p-2 text-ink-500 transition hover:bg-ink-100 hover:text-ink-900 dark:hover:bg-white/10 dark:hover:text-white"
          aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
        >
          {isDark ? <Sun size={19} /> : <Moon size={19} />}
        </button>

        <div ref={bellRef} className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications((open) => !open)}
            className="relative rounded-xl p-2 text-ink-500 transition hover:bg-ink-100 hover:text-ink-900 dark:hover:bg-white/10 dark:hover:text-white"
            aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}
            aria-expanded={showNotifications}
          >
            <Bell size={19} />
            {unread > 0 && (
              <span className="absolute top-1.5 right-1.5 grid size-4 place-items-center rounded-full bg-rose-500 text-[0.625rem] font-bold text-white">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.16 }}
                className="surface absolute right-0 z-50 mt-2 flex max-h-[26rem] w-[min(22rem,calc(100vw-1.5rem))] flex-col overflow-hidden p-0"
              >
                <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3 dark:border-white/10">
                  <p className="text-sm font-semibold">Notifications</p>
                  <div className="flex items-center gap-1">
                    {unread > 0 && (
                      <button type="button" onClick={markAllRead} className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-300">
                        Mark all read
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowNotifications(false)}
                      className="rounded-md p-1 text-ink-400 hover:text-ink-700 dark:hover:text-white"
                      aria-label="Close notifications"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>

                <ul className="min-h-0 flex-1 overflow-y-auto">
                  {(notifications ?? []).length === 0 && (
                    <li className="px-4 py-10 text-center text-sm text-ink-500 dark:text-ink-400">You're all caught up.</li>
                  )}
                  {(notifications ?? []).map((item) => (
                    <li key={item._id}>
                      <button
                        type="button"
                        onClick={() => openNotification(item)}
                        className={cx(
                          'flex w-full gap-3 border-b border-ink-100 px-4 py-3 text-left transition last:border-0 hover:bg-ink-50 dark:border-white/5 dark:hover:bg-white/5',
                          !item.read && 'bg-brand-500/[0.04]'
                        )}
                      >
                        <span className={cx('mt-1.5 size-2 shrink-0 rounded-full', item.read ? 'bg-ink-300 dark:bg-ink-600' : 'bg-brand-500')} aria-hidden="true" />
                        <span className="min-w-0">
                          <span className="block text-sm font-medium text-ink-900 dark:text-white">{item.title}</span>
                          {item.message && <span className="mt-0.5 block text-xs text-ink-500 dark:text-ink-400">{item.message}</span>}
                          <span className="mt-1 block text-[0.6875rem] text-ink-400">{relativeTime(item.createdAt)}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>

                <Link
                  to="/app/notifications"
                  onClick={() => setShowNotifications(false)}
                  className="border-t border-ink-100 py-2.5 text-center text-xs font-medium text-brand-600 hover:bg-ink-50 dark:border-white/10 dark:text-brand-300 dark:hover:bg-white/5"
                >
                  View all notifications
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Link to="/app/profile" className="ml-1 hidden items-center gap-2.5 rounded-xl py-1 pr-3 pl-1 transition hover:bg-ink-100 sm:flex dark:hover:bg-white/5">
          <Avatar name={user.name} size="sm" />
          <span className="leading-tight">
            <span className="block max-w-[9rem] truncate text-[0.8125rem] font-semibold text-ink-900 dark:text-white">{user.name}</span>
            <span className="block text-[0.6875rem] text-ink-500 capitalize dark:text-ink-400">{user.role}</span>
          </span>
        </Link>
      </div>
    </header>
  );
}
