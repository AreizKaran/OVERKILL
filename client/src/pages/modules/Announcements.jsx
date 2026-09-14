import { useMemo, useState } from 'react';
import { Megaphone, Pin, Plus, Search } from 'lucide-react';
import { useApi } from '../../lib/useApi.js';
import { api } from '../../lib/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { Badge, Button, Card, EmptyState, Field, Input, Select, SkeletonCard, Textarea, cx } from '../../components/ui/index.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { formatDate, relativeTime } from '../../lib/format.js';

const CATEGORIES = ['Academic', 'Examination', 'Event', 'Placement', 'Administrative', 'Holiday', 'Emergency'];
const PRIORITY_TONE = { urgent: 'rose', important: 'amber', normal: 'brand' };

export default function Announcements() {
  const { user } = useAuth();
  const toast = useToast();
  const { data, loading, reload } = useApi('/announcements');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [composing, setComposing] = useState(false);

  const visible = useMemo(() => {
    let list = data ?? [];
    if (category) list = list.filter((item) => item.category === category);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((item) => item.title.toLowerCase().includes(q) || item.body.toLowerCase().includes(q));
    }
    return list;
  }, [data, category, search]);

  const canPublish = user.role === 'admin' || user.role === 'faculty';

  return (
    <>
      <PageHeader
        eyebrow="Campus"
        title="Announcements"
        description="Official notices from the administration and your faculty, most recent first."
        actions={canPublish ? <Button icon={Plus} onClick={() => setComposing(true)}>Publish notice</Button> : null}
      />

      <Card className="mb-6 p-4 sm:p-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-400" aria-hidden="true" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search notices…" className="pl-9" aria-label="Search announcements" />
          </div>
          <Select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter by category">
            <option value="">All categories</option>
            {CATEGORIES.map((item) => <option key={item}>{item}</option>)}
          </Select>
        </div>
      </Card>

      {loading ? (
        <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} lines={3} />)}</div>
      ) : visible.length ? (
        <div className="space-y-4">
          {visible.map((item) => (
            <Card
              key={item._id}
              as="article"
              className={cx(
                'transition',
                item.pinned && 'border-l-4 border-l-gold-400',
                item.priority === 'urgent' && 'border-l-4 border-l-rose-500'
              )}
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={PRIORITY_TONE[item.priority] ?? 'brand'}>{item.category}</Badge>
                {item.priority !== 'normal' && (
                  <Badge tone={item.priority === 'urgent' ? 'rose' : 'amber'} className="capitalize">{item.priority}</Badge>
                )}
                {item.pinned && <Badge tone="gold" icon={Pin}>Pinned</Badge>}
                <span className="ml-auto text-xs whitespace-nowrap text-ink-400">
                  {formatDate(item.publishAt)} · {relativeTime(item.publishAt)}
                </span>
              </div>

              <h2 className="mt-3 font-display text-lg leading-snug font-bold">{item.title}</h2>
              <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-pretty text-ink-600 dark:text-ink-300">{item.body}</p>

              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-ink-100 pt-3 text-xs text-ink-500 dark:border-white/5 dark:text-ink-400">
                <span>Posted by <span className="font-medium text-ink-700 dark:text-ink-200">{item.postedBy?.name ?? 'Administration'}</span></span>
                <span className="capitalize">Audience: {item.audience?.join(', ')}</span>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState icon={Megaphone} title="No announcements" description="Notices published by the administration will appear here." />
      )}

      <ComposeModal
        open={composing}
        onClose={() => setComposing(false)}
        onPublished={() => {
          setComposing(false);
          reload();
          toast('Notice published and the audience notified.');
        }}
      />
    </>
  );
}

function ComposeModal({ open, onClose, onPublished }) {
  const toast = useToast();
  const [form, setForm] = useState({ title: '', body: '', category: 'Academic', priority: 'normal', audience: ['all'], pinned: false });
  const [saving, setSaving] = useState(false);

  const update = (key) => (event) =>
    setForm((current) => ({ ...current, [key]: event.target.type === 'checkbox' ? event.target.checked : event.target.value }));

  const toggleAudience = (value) =>
    setForm((current) => {
      const next = current.audience.includes(value)
        ? current.audience.filter((a) => a !== value)
        : [...current.audience.filter((a) => a !== 'all'), value];
      return { ...current, audience: next.length ? next : ['all'] };
    });

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await api.post('/announcements', form);
      onPublished();
      setForm({ title: '', body: '', category: 'Academic', priority: 'normal', audience: ['all'], pinned: false });
    } catch (error) {
      toast(error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Publish a notice"
      description="Everyone in the selected audience receives a notification immediately."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button form="notice-form" type="submit" loading={saving} icon={Megaphone}>Publish</Button>
        </>
      }
    >
      <form id="notice-form" onSubmit={save} className="space-y-4">
        <Field label="Title" required>
          <Input value={form.title} onChange={update('title')} placeholder="e.g. Sessional Examination II — Timetable Published" required />
        </Field>

        <Field label="Notice" required>
          <Textarea value={form.body} onChange={update('body')} className="min-h-36" placeholder="Write the full notice as it should appear on the portal…" required />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Category">
            <Select value={form.category} onChange={update('category')}>
              {CATEGORIES.map((item) => <option key={item}>{item}</option>)}
            </Select>
          </Field>
          <Field label="Priority">
            <Select value={form.priority} onChange={update('priority')}>
              <option value="normal">Normal</option>
              <option value="important">Important</option>
              <option value="urgent">Urgent</option>
            </Select>
          </Field>
        </div>

        <fieldset>
          <legend className="label">Audience</legend>
          <div className="flex flex-wrap gap-2">
            {['all', 'student', 'faculty', 'admin'].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => (value === 'all' ? setForm((c) => ({ ...c, audience: ['all'] })) : toggleAudience(value))}
                className={cx(
                  'rounded-full px-3.5 py-1.5 text-[0.8125rem] font-medium capitalize transition',
                  form.audience.includes(value)
                    ? 'bg-brand-600 text-white'
                    : 'bg-ink-100 text-ink-600 hover:bg-ink-200 dark:bg-white/5 dark:text-ink-300 dark:hover:bg-white/10'
                )}
              >
                {value === 'all' ? 'Everyone' : value}
              </button>
            ))}
          </div>
        </fieldset>

        <label className="flex items-center gap-2.5 text-sm">
          <input type="checkbox" checked={form.pinned} onChange={update('pinned')} className="size-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500" />
          Pin this notice to the top of the list
        </label>
      </form>
    </Modal>
  );
}
