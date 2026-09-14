import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, BellOff, CalendarCheck, CheckCheck, ClipboardList, FileBadge, GraduationCap, Megaphone, MessageSquareQuote, Trash2, Wallet } from 'lucide-react';
import { useApi } from '../../lib/useApi.js';
import { api } from '../../lib/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { Badge, Button, Card, EmptyState, SkeletonCard, Tabs, cx } from '../../components/ui/index.jsx';
import { relativeTime, formatDateTime } from '../../lib/format.js';

const ICONS = {
  assignment: ClipboardList,
  attendance: CalendarCheck,
  result: GraduationCap,
  announcement: Megaphone,
  fee: Wallet,
  exam: FileBadge,
  feedback: MessageSquareQuote,
  system: Bell,
};

export default function Notifications() {
  const toast = useToast();
  const { data, meta, loading, reload } = useApi('/notifications');
  const [tab, setTab] = useState('all');

  const visible = useMemo(() => {
    const list = data ?? [];
    return tab === 'unread' ? list.filter((item) => !item.read) : list;
  }, [data, tab]);

  const markRead = async (id) => {
    await api.patch(`/notifications/${id}/read`);
    reload();
  };

  const markAll = async () => {
    await api.post('/notifications/read-all');
    toast('All notifications marked as read.');
    reload();
  };

  const remove = async (id) => {
    await api.delete(`/notifications/${id}`);
    reload();
  };

  return (
    <>
      <PageHeader
        eyebrow="Campus"
        title="Notifications"
        description="Academic and administrative alerts raised by the portal as things change."
        actions={
          meta?.unread > 0 ? <Button variant="secondary" icon={CheckCheck} onClick={markAll}>Mark all read</Button> : null
        }
      />

      <Tabs
        className="mb-6 max-w-sm"
        value={tab}
        onChange={setTab}
        tabs={[
          { value: 'all', label: 'All', count: data?.length ?? 0 },
          { value: 'unread', label: 'Unread', count: meta?.unread ?? 0 },
        ]}
      />

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} lines={2} />)}</div>
      ) : visible.length ? (
        <Card className="p-0 sm:p-0">
          <ul className="divide-y divide-ink-100 dark:divide-white/5">
            {visible.map((item) => {
              const Icon = ICONS[item.type] ?? Bell;
              return (
                <li key={item._id} className={cx('flex items-start gap-3.5 px-4 py-4 transition sm:px-5', !item.read && 'bg-brand-500/[0.04]')}>
                  <span className={cx('mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl', item.read ? 'bg-ink-100 text-ink-400 dark:bg-white/5' : 'bg-brand-500/10 text-brand-600 dark:text-brand-300')}>
                    <Icon size={17} aria-hidden="true" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className={cx('text-[0.9375rem]', item.read ? 'font-medium' : 'font-semibold')}>{item.title}</p>
                      {!item.read && <Badge tone="brand">New</Badge>}
                    </div>
                    {item.message && <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">{item.message}</p>}
                    <p className="mt-1.5 text-xs text-ink-400" title={formatDateTime(item.createdAt)}>
                      {relativeTime(item.createdAt)} · <span className="capitalize">{item.type}</span>
                    </p>
                    {item.link && (
                      <Link to={item.link} onClick={() => !item.read && markRead(item._id)} className="mt-2 inline-block text-[0.8125rem] font-medium text-brand-600 hover:underline dark:text-brand-300">
                        Open the module →
                      </Link>
                    )}
                  </div>

                  <div className="flex shrink-0 gap-1">
                    {!item.read && (
                      <button type="button" onClick={() => markRead(item._id)} className="rounded-lg p-1.5 text-ink-400 transition hover:bg-ink-100 hover:text-brand-600 dark:hover:bg-white/10" aria-label="Mark as read">
                        <CheckCheck size={16} />
                      </button>
                    )}
                    <button type="button" onClick={() => remove(item._id)} className="rounded-lg p-1.5 text-ink-400 transition hover:bg-rose-500/10 hover:text-rose-600" aria-label="Remove notification">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      ) : (
        <EmptyState icon={BellOff} title={tab === 'unread' ? "You're all caught up" : 'No notifications yet'} description="Alerts about attendance, assignments, results, fees and notices land here." />
      )}
    </>
  );
}
