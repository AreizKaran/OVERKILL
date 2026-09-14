import { NavLink } from 'react-router-dom';
import { LogOut, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { navigationForRole, ROLE_LABELS } from './navigation.js';
import { Logo } from './Logo.jsx';
import { Avatar, cx } from '../ui/index.jsx';

export function Sidebar({ collapsed, onToggleCollapsed, onNavigate }) {
  const { user, profile, logout } = useAuth();
  const groups = navigationForRole(user.role);

  const identity =
    user.role === 'student'
      ? profile?.registrationNo
      : user.role === 'faculty'
        ? profile?.employeeId
        : ROLE_LABELS[user.role];

  return (
    <div className="flex h-full flex-col bg-white dark:bg-ink-900">
      <div className={cx('flex h-16 shrink-0 items-center border-b border-ink-100 dark:border-white/10', collapsed ? 'justify-center px-2' : 'justify-between px-4')}>
        <Logo showWordmark={!collapsed} size={collapsed ? 32 : 34} />
        {onToggleCollapsed && (
          <button
            type="button"
            onClick={onToggleCollapsed}
            className="hidden rounded-lg p-1.5 text-ink-400 transition hover:bg-ink-100 hover:text-ink-700 lg:block dark:hover:bg-white/10 dark:hover:text-white"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
        )}
      </div>

      <nav className="min-h-0 flex-1 space-y-5 overflow-y-auto px-3 py-4" aria-label="Portal sections">
        {groups.map((group) => (
          <div key={group.section}>
            {!collapsed && (
              <p className="mb-1.5 px-3 text-[0.6875rem] font-semibold tracking-[0.12em] text-ink-400 uppercase dark:text-ink-500">
                {group.section}
              </p>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    onClick={onNavigate}
                    title={collapsed ? item.label : undefined}
                    className={({ isActive }) =>
                      cx(
                        'group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition',
                        collapsed && 'justify-center px-2',
                        isActive
                          ? 'bg-brand-500/10 text-brand-700 dark:bg-brand-400/15 dark:text-brand-200'
                          : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900 dark:text-ink-400 dark:hover:bg-white/5 dark:hover:text-white'
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon size={18} className="shrink-0" aria-hidden="true" />
                        {!collapsed && <span className="truncate">{item.label}</span>}
                        {!collapsed && isActive && <span className="ml-auto size-1.5 rounded-full bg-brand-500" aria-hidden="true" />}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-ink-100 p-3 dark:border-white/10">
        <NavLink
          to="/app/profile"
          onClick={onNavigate}
          className={cx(
            'flex items-center gap-3 rounded-xl p-2 transition hover:bg-ink-100 dark:hover:bg-white/5',
            collapsed && 'justify-center'
          )}
        >
          <Avatar name={user.name} size="sm" />
          {!collapsed && (
            <span className="min-w-0 flex-1 leading-tight">
              <span className="block truncate text-sm font-semibold text-ink-900 dark:text-white">{user.name}</span>
              <span className="block truncate text-xs text-ink-500 dark:text-ink-400">{identity}</span>
            </span>
          )}
        </NavLink>
        <button
          type="button"
          onClick={logout}
          className={cx(
            'mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-ink-500 transition hover:bg-rose-500/10 hover:text-rose-600 dark:text-ink-400 dark:hover:text-rose-400',
            collapsed && 'justify-center px-2'
          )}
        >
          <LogOut size={18} aria-hidden="true" />
          {!collapsed && 'Sign out'}
        </button>
      </div>
    </div>
  );
}
